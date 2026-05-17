'use client';
import { getSupabase } from '@/lib/multiplayer/client';
import type { GameState } from '@/lib/engine/types';
import type { SlotMap } from '@/lib/multiplayer/adapt';

export type RoomMode = 'hill-blitz' | 'hill-survival';
export type RoomStatus = 'lobby' | 'playing' | 'finished';

export interface RoomState {
  game: GameState;
  slots: SlotMap;
}

export interface RoomRow {
  id: string;
  host_user_id: string;
  mode: RoomMode;
  status: RoomStatus;
  state: RoomState | null;
}

export async function createRoom(
  mode: RoomMode = 'hill-blitz',
): Promise<{ id: string }> {
  const { data } = await getSupabase().auth.getSession();
  const token = data.session?.access_token ?? '';
  const res = await fetch('/api/rooms', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ mode }),
  });
  if (!res.ok) throw new Error(`createRoom failed: ${res.status}`);
  return (await res.json()) as { id: string };
}

export async function getRoom(roomId: string): Promise<RoomRow | null> {
  const { data } = await getSupabase()
    .from('rooms')
    .select('*')
    .eq('id', roomId)
    .maybeSingle();
  return (data as RoomRow) ?? null;
}

export async function updateRoomState(
  roomId: string,
  patch: { state?: RoomState; status?: RoomStatus },
): Promise<void> {
  await getSupabase()
    .from('rooms')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', roomId);
}
