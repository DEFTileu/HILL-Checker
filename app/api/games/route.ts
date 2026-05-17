import { getServiceClient, getUserFromRequest } from '@/lib/multiplayer/server';

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

  // Every participant — winners AND losers — gets total_games += 1; only
  // winners get total_wins += 1. The profile row is guaranteed to exist
  // (ensured above), so there is no silent-skip path: a loser can never be
  // dropped from the leaderboard here.
  for (const p of body.players) {
    const { data: prof } = await sb
      .from('profiles')
      .select('total_wins,total_games')
      .eq('id', p.userId)
      .maybeSingle();
    const base = prof ?? { total_wins: 0, total_games: 0 };
    await sb
      .from('profiles')
      .update({
        total_games: base.total_games + 1,
        total_wins: base.total_wins + (winnerSet.has(p.userId) ? 1 : 0),
      })
      .eq('id', p.userId);
  }

  return Response.json({ ok: true, gameId: game.id });
}
