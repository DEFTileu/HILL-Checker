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

  for (const p of body.players) {
    const { data: prof } = await sb
      .from('profiles')
      .select('total_wins,total_games')
      .eq('id', p.userId)
      .maybeSingle();
    if (!prof) continue;
    await sb
      .from('profiles')
      .update({
        total_games: prof.total_games + 1,
        total_wins: prof.total_wins + (winnerSet.has(p.userId) ? 1 : 0),
      })
      .eq('id', p.userId);
  }

  return Response.json({ ok: true, gameId: game.id });
}
