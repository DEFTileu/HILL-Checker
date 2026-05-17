'use client';
import { getSupabase } from '@/lib/multiplayer/client';

export interface RecordGamePayload {
  mode: string;
  winners: string[];
  players: { userId: string; slot: number; eliminatedRound: number | null }[];
}

// Host-only: record a finished game + bump win/game counts via the
// service-role API route. Sends the caller's access token so the route can
// authorize the host (see app/api/games/route.ts getUserFromRequest).
export async function recordGame(payload: RecordGamePayload): Promise<void> {
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
  }
}
