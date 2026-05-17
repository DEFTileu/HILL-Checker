'use client';
import { getSupabase } from '@/lib/multiplayer/client';

export interface RecordGamePayload {
  mode: string;
  winners: string[];
  players: { userId: string; slot: number; eliminatedRound: number | null }[];
}

export interface EloChange {
  before: number;
  after: number;
  delta: number;
}
export type EloChanges = Record<string, EloChange>;

// Host-only: record a finished game + bump win/game counts + apply ELO via the
// service-role API route. Sends the caller's access token so the route can
// authorize the host (see app/api/games/route.ts getUserFromRequest).
// Returns the per-user ELO deltas so the host can render "+24 ELO" cards
// (and broadcast them to the other clients); null on failure.
export async function recordGame(
  payload: RecordGamePayload,
): Promise<EloChanges | null> {
  const { data } = await getSupabase().auth.getSession();
  const token = data.session?.access_token ?? '';
  const res = await fetch('/api/games', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    console.error(`recordGame failed: ${res.status}`);
    return null;
  }
  try {
    const json = (await res.json()) as { eloChanges?: EloChanges };
    return json.eloChanges ?? null;
  } catch {
    return null;
  }
}
