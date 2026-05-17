'use client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabase } from '@/lib/multiplayer/client';
import type { Action, GameState } from '@/lib/engine/types';
import type { SlotMap, PresenceEntry } from '@/lib/multiplayer/adapt';
import type { RoomMode } from '@/lib/db/rooms';

export interface RoomHandlers {
  onPresenceSync: (entries: PresenceEntry[]) => void;
  onMove: (action: Action) => void;
  onGameStart: (payload: { state: GameState; slots: SlotMap }) => void;
  onSyncRequest: () => void;
  onSyncResponse: (state: GameState) => void;
  onModeChange: (mode: RoomMode) => void;
}

/** Create (but do NOT subscribe) the room channel. Caller subscribes. */
export function subscribeToRoom(
  roomId: string,
  handlers: RoomHandlers,
): RealtimeChannel {
  const ch = getSupabase().channel(`room:${roomId}`, {
    config: { broadcast: { self: false } },
  });

  // Presence sync: callback signature is () => void per Supabase typings.
  // We read the current state manually inside.
  ch.on('presence', { event: 'sync' }, () => {
    const state = ch.presenceState<PresenceEntry>();
    const entries = Object.values(state)
      .map((arr) => arr[0] as PresenceEntry | undefined)
      .filter((e): e is PresenceEntry => e !== undefined);
    handlers.onPresenceSync(entries);
  });

  // Broadcast callbacks receive the full envelope: { type, event, payload, ... }.
  // We destructure `.payload` from it, casting to the expected type.
  ch.on('broadcast', { event: 'game:move' }, ({ payload }) =>
    handlers.onMove(payload as Action),
  );
  ch.on('broadcast', { event: 'game:start' }, ({ payload }) =>
    handlers.onGameStart(payload as { state: GameState; slots: SlotMap }),
  );
  ch.on('broadcast', { event: 'sync_request' }, () => handlers.onSyncRequest());
  ch.on('broadcast', { event: 'sync_response' }, ({ payload }) =>
    handlers.onSyncResponse(payload as GameState),
  );
  ch.on('broadcast', { event: 'room:mode' }, ({ payload }) =>
    handlers.onModeChange((payload as { mode: RoomMode }).mode),
  );
  return ch;
}

export function broadcastMove(ch: RealtimeChannel, action: Action) {
  return ch.send({ type: 'broadcast', event: 'game:move', payload: action });
}
export function broadcastGameStart(
  ch: RealtimeChannel,
  payload: { state: GameState; slots: SlotMap },
) {
  return ch.send({ type: 'broadcast', event: 'game:start', payload });
}
export function broadcastSyncRequest(ch: RealtimeChannel) {
  return ch.send({ type: 'broadcast', event: 'sync_request', payload: {} });
}
export function broadcastSyncResponse(ch: RealtimeChannel, state: GameState) {
  return ch.send({ type: 'broadcast', event: 'sync_response', payload: state });
}
export function broadcastModeChange(ch: RealtimeChannel, mode: RoomMode) {
  return ch.send({ type: 'broadcast', event: 'room:mode', payload: { mode } });
}
export function trackPresence(ch: RealtimeChannel, entry: PresenceEntry) {
  return ch.track(entry);
}
