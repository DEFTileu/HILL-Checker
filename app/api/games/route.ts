import { getServiceClient, getUserFromRequest } from '@/lib/multiplayer/server';
import {
  calculateGameEloUpdates,
  STARTING_ELO,
  type GameParticipant,
} from '@/lib/elo';

interface GamePlayerIn {
  userId: string;
  slot: number;
  eliminatedRound: number | null;
}
interface Body {
  mode: string;
  winners: string[];
  players: GamePlayerIn[];
}

export async function POST(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json({ error: 'bad body' }, { status: 400 });
  }
  if (
    !body?.mode ||
    !Array.isArray(body.winners) ||
    !Array.isArray(body.players) ||
    body.players.length === 0
  ) {
    return Response.json({ error: 'bad body' }, { status: 400 });
  }

  const sb = getServiceClient();

  // CASE C fix — the recording path must be self-sufficient. We cannot assume
  // every participant's client already ran ensureProfile() (uninstalled
  // handle_new_user trigger, in-flight/failed insert, remote anon joiner).
  // game_players.user_id has an FK to profiles(id): a missing row would
  // FK-fail the whole batch (500, nothing recorded) and the stats loop below
  // would silently skip that player — so losers never reach the leaderboard.
  // Ensure a row exists for every participant first, using the service client
  // (bypasses RLS). ignoreDuplicates => ON CONFLICT DO NOTHING, so existing
  // display names and stats are never clobbered.
  const userIds = [...new Set(body.players.map((p) => p.userId))];
  const { error: ensureErr } = await sb.from('profiles').upsert(
    userIds.map((id) => ({
      id,
      display_name: 'Player_' + Math.random().toString(16).slice(2, 6).padEnd(4, '0'),
    })),
    { onConflict: 'id', ignoreDuplicates: true },
  );
  if (ensureErr) {
    return Response.json({ error: ensureErr.message }, { status: 500 });
  }

  const { data: game, error: gErr } = await sb
    .from('games')
    .insert({
      mode: body.mode,
      player_count: body.players.length,
      winners: body.winners,
    })
    .select('id')
    .single();
  if (gErr || !game) {
    return Response.json({ error: gErr?.message ?? 'game insert failed' }, { status: 500 });
  }

  const winnerSet = new Set(body.winners);
  const rows = body.players.map((p) => ({
    game_id: game.id,
    user_id: p.userId,
    slot: p.slot,
    was_winner: winnerSet.has(p.userId),
    eliminated_round: p.eliminatedRound,
  }));
  const { error: gpErr } = await sb.from('game_players').insert(rows);
  if (gpErr) {
    return Response.json({ error: gpErr.message, gameId: game.id }, { status: 500 });
  }

  // Real ELO: fetch every participant's CURRENT rating up front (pre-game),
  // then compute all pairwise updates atomically from those values so update
  // order can't skew results. The profile row is guaranteed to exist (ensured
  // above), so no participant is silently skipped.
  const prePerUser: Record<
    string,
    { elo: number; total_wins: number; total_games: number }
  > = {};
  for (const id of userIds) {
    const { data: prof } = await sb
      .from('profiles')
      .select('elo,total_wins,total_games')
      .eq('id', id)
      .maybeSingle();
    prePerUser[id] = {
      elo: prof?.elo ?? STARTING_ELO,
      total_wins: prof?.total_wins ?? 0,
      total_games: prof?.total_games ?? 0,
    };
  }

  // De-dupe to one GameParticipant per user (a user holds one rating even if
  // they somehow appear in two slots).
  const participants: GameParticipant[] = userIds.map((id) => ({
    userId: id,
    elo: prePerUser[id].elo,
    isWinner: winnerSet.has(id),
  }));
  const newElos = calculateGameEloUpdates(participants);

  const eloChanges: Record<
    string,
    { before: number; after: number; delta: number }
  > = {};
  for (const id of userIds) {
    const before = prePerUser[id].elo;
    const after = newElos[id];
    eloChanges[id] = { before, after, delta: after - before };
    await sb
      .from('profiles')
      .update({
        elo: after,
        total_games: prePerUser[id].total_games + 1,
        total_wins:
          prePerUser[id].total_wins + (winnerSet.has(id) ? 1 : 0),
      })
      .eq('id', id);
  }

  return Response.json({ ok: true, gameId: game.id, eloChanges });
}
