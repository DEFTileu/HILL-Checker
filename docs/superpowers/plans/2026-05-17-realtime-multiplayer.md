# Realtime Multiplayer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Players create a room, get a 4-letter code, share the link, and play King of Hill (Blitz/Survival) together in real time over Supabase Realtime.

**Architecture:** The pure engine (`lib/engine/*`) is untouched and runs locally on every client. A thin multiplayer layer broadcasts moves over a Supabase Realtime channel; the host owns the authoritative DB snapshot, timer-skips, and result recording. Two API routes use a server-only service-role client for privileged cross-user writes. UI reuses existing `components/hill/*`.

**Tech Stack:** Next.js 16 App Router, TypeScript strict, `@supabase/supabase-js` Realtime + Postgres, vitest (node env, `lib/**/*.test.ts`).

**Reference spec:** `docs/superpowers/specs/2026-05-17-realtime-multiplayer-design.md`

---

## File Structure

| File | Responsibility |
|------|----------------|
| `lib/multiplayer/code.ts` | Pure: random 4-letter code + collision-retry generator |
| `lib/multiplayer/code.test.ts` | Tests for code generator |
| `lib/multiplayer/adapt.ts` | Pure: engine⇄design adapters, `SlotMap`/`PresenceEntry` types |
| `lib/multiplayer/adapt.test.ts` | Tests for adapters |
| `lib/multiplayer/server.ts` | Server-only: service-role client + bearer-token user resolver |
| `lib/multiplayer/channel.ts` | Realtime subscribe/broadcast/presence helpers |
| `lib/db/rooms.ts` | Browser: `createRoom` / `getRoom` / `updateRoomState` |
| `app/api/rooms/route.ts` | POST: generate unique code, insert room |
| `app/api/games/route.ts` | POST: insert game + game_players, bump wins |
| `app/r/new/page.tsx` | Creates a room, redirects to `/r/<code>` |
| `app/r/[roomId]/page.tsx` | Orchestrator: lobby ↔ game, owns engine state |
| `app/page.tsx` | Replace starter content with wired `<Landing>` |
| `docs/phase-4-multiplayer-setup.md` | Manual `.env.local` step (service-role key) |

Note: `SlotMap` / `PresenceEntry` live in `adapt.ts` (consumed by `channel.ts`, `db/rooms.ts`, the page) to keep one source of truth without an extra types file.

---

## Task 1: Room code generator (TDD)

**Files:**
- Create: `lib/multiplayer/code.ts`
- Test: `lib/multiplayer/code.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/multiplayer/code.test.ts
import { describe, it, expect } from 'vitest';
import { randomCode, generateUniqueCode } from './code';

describe('randomCode', () => {
  it('is 4 uppercase A–Z letters', () => {
    for (let i = 0; i < 50; i++) expect(randomCode()).toMatch(/^[A-Z]{4}$/);
  });
});

describe('generateUniqueCode', () => {
  it('returns the first code that does not collide', async () => {
    const code = await generateUniqueCode(async () => false);
    expect(code).toMatch(/^[A-Z]{4}$/);
  });

  it('retries past a collision then succeeds', async () => {
    let calls = 0;
    const code = await generateUniqueCode(async () => {
      calls += 1;
      return calls < 3; // first 2 collide, 3rd is free
    });
    expect(calls).toBe(3);
    expect(code).toMatch(/^[A-Z]{4}$/);
  });

  it('throws after exhausting maxAttempts', async () => {
    await expect(generateUniqueCode(async () => true, 5)).rejects.toThrow(
      /unique room code/,
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- code`
Expected: FAIL — `Cannot find module './code'`.

- [ ] **Step 3: Write minimal implementation**

```ts
// lib/multiplayer/code.ts
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function randomCode(len = 4): string {
  let s = '';
  for (let i = 0; i < len; i++) {
    s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return s;
}

/**
 * Generate a code not already taken. `exists` returns true if the code is in
 * use. Retries up to `maxAttempts` times, then throws.
 */
export async function generateUniqueCode(
  exists: (code: string) => Promise<boolean>,
  maxAttempts = 5,
): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const code = randomCode();
    if (!(await exists(code))) return code;
  }
  throw new Error('Could not generate a unique room code');
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- code`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/multiplayer/code.ts lib/multiplayer/code.test.ts
git commit -m "feat(mp): room code generator with collision retry"
```

---

## Task 2: Engine⇄design adapters (TDD)

**Files:**
- Create: `lib/multiplayer/adapt.ts`
- Test: `lib/multiplayer/adapt.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/multiplayer/adapt.test.ts
import { describe, it, expect } from 'vitest';
import {
  boardToPieces,
  toTuple,
  toCoord,
  assignSlots,
  winnersToGameOver,
  type PresenceEntry,
} from './adapt';
import type { Piece } from '@/lib/engine/types';

function emptyBoard(n: number): (Piece | null)[][] {
  return Array.from({ length: n }, () => Array.from({ length: n }, () => null));
}

describe('boardToPieces', () => {
  it('maps engine cells to UI pieces with tuple positions', () => {
    const b = emptyBoard(10);
    b[0][1] = { player: 1, king: false };
    b[5][4] = { player: 3, king: true };
    const pieces = boardToPieces(b);
    expect(pieces).toContainEqual({ player: 1, kind: 'pawn', pos: [0, 1] });
    expect(pieces).toContainEqual({ player: 3, kind: 'king', pos: [5, 4] });
    expect(pieces).toHaveLength(2);
  });
});

describe('coord conversion', () => {
  it('round-trips', () => {
    expect(toTuple({ row: 2, col: 7 })).toEqual([2, 7]);
    expect(toCoord([2, 7])).toEqual({ row: 2, col: 7 });
  });
});

describe('assignSlots', () => {
  it('orders by joinedAt and caps at the player count', () => {
    const e = (id: string, t: number): PresenceEntry => ({
      userId: id, displayName: id, tier: 'Bronze', skin: 'bronze', joinedAt: t,
    });
    const slots = assignSlots(
      [e('c', 30), e('a', 10), e('b', 20), e('d', 40), e('x', 50)],
      [1, 2, 3, 4],
    );
    expect(slots[1]?.userId).toBe('a');
    expect(slots[2]?.userId).toBe('b');
    expect(slots[3]?.userId).toBe('c');
    expect(slots[4]?.userId).toBe('d');
  });
});

describe('winnersToGameOver', () => {
  const slots = {
    1: { userId: 'a', displayName: 'Ann', tier: 'Gold' as const, skin: 'gold' as const },
    2: { userId: 'b', displayName: 'Bo', tier: 'Bronze' as const, skin: 'bronze' as const },
  };
  it('solo for one winner', () => {
    const r = winnersToGameOver([1], slots);
    expect(r.kind).toBe('solo');
    expect(r.winners[0].name).toBe('Ann');
  });
  it('joint for multiple', () => {
    expect(winnersToGameOver([1, 2], slots).kind).toBe('joint');
  });
  it('none for empty', () => {
    expect(winnersToGameOver([], slots)).toEqual({ kind: 'none', winners: [] });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- adapt`
Expected: FAIL — `Cannot find module './adapt'`.

- [ ] **Step 3: Write minimal implementation**

```ts
// lib/multiplayer/adapt.ts
import type { GameState, Player } from '@/lib/engine/types';
import type { Piece as UIPiece, Coord as UICoord, ArenaTier, SkinId } from '@/types/hill';
import type { GameOverKind, Winner } from '@/components/hill/screens/GameOverOverlay';

export function boardToPieces(board: GameState['board']): UIPiece[] {
  const out: UIPiece[] = [];
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      const cell = board[r][c];
      if (cell) {
        out.push({ player: cell.player, kind: cell.king ? 'king' : 'pawn', pos: [r, c] });
      }
    }
  }
  return out;
}

export const toTuple = (c: { row: number; col: number }): UICoord => [c.row, c.col];
export const toCoord = ([row, col]: UICoord) => ({ row, col });

export interface SlotInfo {
  userId: string;
  displayName: string;
  tier: ArenaTier;
  skin: SkinId;
}
export type SlotMap = Partial<Record<Player, SlotInfo>>;

export interface PresenceEntry extends SlotInfo {
  joinedAt: number;
}

/** First-come-first-serve: sort by joinedAt, fill players in turn order. */
export function assignSlots(entries: PresenceEntry[], players: Player[]): SlotMap {
  const sorted = [...entries].sort((a, b) => a.joinedAt - b.joinedAt);
  const map: SlotMap = {};
  players.forEach((p, i) => {
    const e = sorted[i];
    if (e) map[p] = { userId: e.userId, displayName: e.displayName, tier: e.tier, skin: e.skin };
  });
  return map;
}

export function winnersToGameOver(
  winners: Player[],
  slots: SlotMap,
): { kind: GameOverKind; winners: Winner[] } {
  const kind: GameOverKind =
    winners.length === 0 ? 'none' : winners.length === 1 ? 'solo' : 'joint';
  const list: Winner[] = winners.flatMap((p) => {
    const s = slots[p];
    return s
      ? [{ player: p, name: s.displayName, tier: s.tier, skin: s.skin, eloDelta: 20 }]
      : [];
  });
  return { kind, winners: list };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- adapt`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/multiplayer/adapt.ts lib/multiplayer/adapt.test.ts
git commit -m "feat(mp): pure engine<->design adapters + slot assignment"
```

---

## Task 3: Server-only service client

**Files:**
- Create: `lib/multiplayer/server.ts`

No unit test (Supabase infra module — matches existing `lib/db/profiles.ts` / `lib/auth` convention of no tests). Verified by typecheck + the manual acceptance test.

- [ ] **Step 1: Implement**

```ts
// lib/multiplayer/server.ts
// SERVER ONLY. Never add 'use client'. Never import from a component or from
// lib/multiplayer/client.ts. Holds the service-role key.
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  '';

let svc: SupabaseClient | null = null;

/** Service-role client. Bypasses RLS — use only in API route handlers. */
export function getServiceClient(): SupabaseClient {
  if (!svc) {
    if (!URL || !SERVICE_KEY) {
      throw new Error(
        'Supabase service env missing: set SUPABASE_SERVICE_ROLE_KEY in .env.local',
      );
    }
    svc = createClient(URL, SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return svc;
}

/** Resolve the caller from an `Authorization: Bearer <jwt>` header. */
export async function getUserFromRequest(
  req: Request,
): Promise<{ id: string } | null> {
  const header = req.headers.get('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token || !URL || !ANON_KEY) return null;
  const anon = createClient(URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await anon.auth.getUser(token);
  if (error || !data.user) return null;
  return { id: data.user.id };
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/multiplayer/server.ts
git commit -m "feat(mp): server-only service-role client + bearer auth"
```

---

## Task 4: API route — create room

**Files:**
- Create: `app/api/rooms/route.ts`

- [ ] **Step 1: Implement**

```ts
// app/api/rooms/route.ts
import { getServiceClient, getUserFromRequest } from '@/lib/multiplayer/server';
import { generateUniqueCode } from '@/lib/multiplayer/code';

export async function POST(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }

  let mode = 'hill-blitz';
  try {
    const body = await req.json();
    if (body?.mode === 'hill-survival' || body?.mode === 'hill-blitz') {
      mode = body.mode;
    }
  } catch {
    // empty/invalid body → keep default mode
  }

  const sb = getServiceClient();
  try {
    const code = await generateUniqueCode(async (c) => {
      const { data } = await sb.from('rooms').select('id').eq('id', c).maybeSingle();
      return !!data;
    });
    const { error } = await sb.from('rooms').insert({
      id: code,
      host_user_id: user.id,
      mode,
      status: 'lobby',
      state: null,
    });
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ id: code });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/api/rooms/route.ts
git commit -m "feat(mp): POST /api/rooms — unique code + room insert"
```

---

## Task 5: API route — record game

**Files:**
- Create: `app/api/games/route.ts`

- [ ] **Step 1: Implement**

```ts
// app/api/games/route.ts
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
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/api/games/route.ts
git commit -m "feat(mp): POST /api/games — record game + bump wins"
```

---

## Task 6: Room DB helpers (browser)

**Files:**
- Create: `lib/db/rooms.ts`

- [ ] **Step 1: Implement**

```ts
// lib/db/rooms.ts
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
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/db/rooms.ts
git commit -m "feat(mp): room DB helpers (createRoom/getRoom/updateRoomState)"
```

---

## Task 7: Realtime channel helpers

**Files:**
- Create: `lib/multiplayer/channel.ts`

- [ ] **Step 1: Implement**

```ts
// lib/multiplayer/channel.ts
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
  onGameEnd: () => void;
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

  ch.on('presence', { event: 'sync' }, () => {
    const state = ch.presenceState<PresenceEntry>();
    const entries = Object.values(state)
      .map((arr) => arr[0])
      .filter(Boolean) as PresenceEntry[];
    handlers.onPresenceSync(entries);
  });
  ch.on('broadcast', { event: 'game:move' }, ({ payload }) =>
    handlers.onMove(payload as Action),
  );
  ch.on('broadcast', { event: 'game:start' }, ({ payload }) =>
    handlers.onGameStart(payload as { state: GameState; slots: SlotMap }),
  );
  ch.on('broadcast', { event: 'game:end' }, () => handlers.onGameEnd());
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
export function broadcastGameEnd(ch: RealtimeChannel) {
  return ch.send({ type: 'broadcast', event: 'game:end', payload: {} });
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
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/multiplayer/channel.ts
git commit -m "feat(mp): realtime channel subscribe/broadcast/presence helpers"
```

---

## Task 8: `/r/new` create-and-redirect page

**Files:**
- Create: `app/r/new/page.tsx`

- [ ] **Step 1: Implement**

```tsx
// app/r/new/page.tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createRoom } from '@/lib/db/rooms';

export default function NewRoomPage() {
  const router = useRouter();
  const [error, setError] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    createRoom('hill-blitz')
      .then(({ id }) => router.replace(`/r/${id}`))
      .catch(() => setError(true));
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-hill-bg text-hill-text">
      {error ? (
        <>
          <p className="text-sm text-hill-muted">Could not create a room.</p>
          <button
            onClick={() => {
              started.current = false;
              setError(false);
              createRoom('hill-blitz')
                .then(({ id }) => router.replace(`/r/${id}`))
                .catch(() => setError(true));
            }}
            className="rounded-[10px] border border-hill-border bg-hill-surface px-4 py-2 text-sm font-semibold"
          >
            Try again
          </button>
        </>
      ) : (
        <p className="font-mono text-[12px] tracking-[0.18em] text-hill-muted">
          CREATING ROOM…
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/r/new/page.tsx
git commit -m "feat(mp): /r/new creates a room and redirects"
```

---

## Task 9: Room orchestrator page (lobby ↔ game)

**Files:**
- Create: `app/r/[roomId]/page.tsx`

This is the integration hub. It owns engine state, drives the channel, and
renders existing `components/hill/*`. Host-only side effects (DB snapshot,
timer-skip, result recording, elimination tracking) run in a single effect
keyed on game state so they are not duplicated across move paths.

- [ ] **Step 1: Implement**

```tsx
// app/r/[roomId]/page.tsx
'use client';
import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { hillBlitz, hillSurvival } from '@/lib/engine/presets';
import { applyMove, createInitialState } from '@/lib/engine/apply';
import { getLegalMoves } from '@/lib/engine/rules';
import { checkWinners } from '@/lib/engine/endgame';
import type { Action, GameState, Player } from '@/lib/engine/types';
import { useAuth } from '@/lib/auth';
import {
  getRoom,
  updateRoomState,
  type RoomMode,
  type RoomRow,
} from '@/lib/db/rooms';
import {
  subscribeToRoom,
  broadcastMove,
  broadcastGameStart,
  broadcastSyncRequest,
  broadcastSyncResponse,
  broadcastModeChange,
  trackPresence,
} from '@/lib/multiplayer/channel';
import {
  assignSlots,
  boardToPieces,
  toCoord,
  toTuple,
  winnersToGameOver,
  type PresenceEntry,
  type SlotMap,
} from '@/lib/multiplayer/adapt';
import { Lobby } from '@/components/hill/screens/Lobby';
import { Board } from '@/components/hill/Board';
import { GameOverOverlay } from '@/components/hill/screens/GameOverOverlay';
import type { GameMode, LobbyPlayer } from '@/types/hill';

const PRESET = { 'hill-blitz': hillBlitz, 'hill-survival': hillSurvival } as const;
const toGameMode = (m: RoomMode): GameMode =>
  m === 'hill-survival' ? 'survival' : 'blitz';
const toRoomMode = (m: GameMode): RoomMode =>
  m === 'survival' ? 'hill-survival' : 'hill-blitz';

export default function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(params);
  const router = useRouter();
  const { user, profile } = useAuth();

  const [room, setRoom] = useState<RoomRow | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [presence, setPresence] = useState<PresenceEntry[]>([]);
  const [mode, setMode] = useState<RoomMode>('hill-blitz');
  const [state, setState] = useState<GameState | null>(null);
  const [slots, setSlots] = useState<SlotMap>({});
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const chRef = useRef<RealtimeChannel | null>(null);
  const stateRef = useRef<GameState | null>(null);
  const slotsRef = useRef<SlotMap>({});
  const isHostRef = useRef(false);
  const elimRound = useRef<Partial<Record<Player, number>>>({});
  const prevAlive = useRef<Player[]>([]);
  const recorded = useRef(false);
  const startedAt = useRef<number>(0);

  stateRef.current = state;
  slotsRef.current = slots;

  const isHost = !!user && !!room && room.host_user_id === user.id;
  isHostRef.current = isHost;

  const winners = useMemo(() => (state ? checkWinners(state) : null), [state]);

  // ── Load room + subscribe ──────────────────────────────────────────────
  useEffect(() => {
    let active = true;
    if (!user || !profile) return;

    (async () => {
      const r = await getRoom(roomId);
      if (!active) return;
      if (!r) {
        setNotFound(true);
        return;
      }
      setRoom(r);
      setMode(r.mode);
      if (r.status === 'playing' && r.state) {
        setState(r.state.game);
        setSlots(r.state.slots);
        startedAt.current = Date.now();
      }

      const ch = subscribeToRoom(roomId, {
        onPresenceSync: (e) => setPresence(e),
        onMove: (action) => applyAction(action, false),
        onGameStart: ({ state: s, slots: sl }) => {
          startedAt.current = Date.now();
          recorded.current = false;
          elimRound.current = {};
          prevAlive.current = [...s.alivePlayers];
          setSlots(sl);
          setState(s);
          setRoom((cur) => (cur ? { ...cur, status: 'playing' } : cur));
        },
        onGameEnd: () => {},
        onSyncRequest: () => {
          if (stateRef.current && chRef.current) {
            broadcastSyncResponse(chRef.current, stateRef.current);
          }
        },
        onSyncResponse: (s) => {
          if (!stateRef.current) setState(s);
        },
        onModeChange: (m) => setMode(m),
      });
      chRef.current = ch;

      ch.subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') return;
        await trackPresence(ch, {
          userId: user.id,
          displayName: profile.displayName,
          tier: profile.arenaTier,
          skin: profile.selectedSkin,
          joinedAt: Date.now(),
        });
        if (r.status === 'playing') broadcastSyncRequest(ch);
      });
    })();

    return () => {
      active = false;
      if (chRef.current) {
        chRef.current.unsubscribe();
        chRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, user, profile]);

  // ── Apply an engine action locally; mover also broadcasts ──────────────
  const applyAction = useCallback((action: Action, broadcast: boolean) => {
    setState((prev) => {
      if (!prev) return prev;
      const next = applyMove(prev, action);
      if (broadcast && chRef.current) broadcastMove(chRef.current, action);
      return next;
    });
  }, []);

  // ── Host side-effects: snapshot, elimination, result recording ─────────
  useEffect(() => {
    if (!state || !isHostRef.current) return;

    const dropped = prevAlive.current.filter(
      (p) => !state.alivePlayers.includes(p),
    );
    for (const p of dropped) {
      if (elimRound.current[p] == null) elimRound.current[p] = state.round;
    }
    prevAlive.current = [...state.alivePlayers];

    void updateRoomState(roomId, {
      state: { game: state, slots: slotsRef.current },
      status: winners ? 'finished' : 'playing',
    });

    if (winners && !recorded.current) {
      recorded.current = true;
      const sl = slotsRef.current;
      const players = (Object.keys(sl) as unknown as Player[])
        .map(Number)
        .filter((p): p is Player => !!sl[p as Player])
        .map((p) => ({
          userId: sl[p]!.userId,
          slot: p,
          eliminatedRound: elimRound.current[p] ?? null,
        }));
      const winnerIds = winners
        .map((p) => sl[p]?.userId)
        .filter((x): x is string => !!x);
      void fetch('/api/games', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          mode: state.config.mode,
          winners: winnerIds,
          players,
        }),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, winners, roomId]);

  // ── Host timer authority: skip on deadline expiry ──────────────────────
  useEffect(() => {
    if (!state) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [state]);

  useEffect(() => {
    if (!state || winners || !isHostRef.current) return;
    if (state.turnDeadline && now >= state.turnDeadline) {
      applyAction({ type: 'skip' }, true);
      setSelected(null);
    }
  }, [now, state, winners, applyAction]);

  // ── Derived ────────────────────────────────────────────────────────────
  const mySlotPlayer = useMemo<Player | null>(() => {
    if (!user) return null;
    for (const p of Object.keys(slots) as unknown as Player[]) {
      if (slots[Number(p) as Player]?.userId === user.id) {
        return Number(p) as Player;
      }
    }
    return null;
  }, [slots, user]);

  const canMove =
    !!state && !winners && state.currentPlayer === mySlotPlayer;

  const legalMoves = useMemo(
    () =>
      state && selected && canMove ? getLegalMoves(state, selected) : [],
    [state, selected, canMove],
  );
  const moveTo = (r: number, c: number) =>
    legalMoves.find((m) => m.to.row === r && m.to.col === c);

  const handleSquare = useCallback(
    ([r, c]: [number, number]) => {
      if (!state || winners || !canMove) return;
      const m = moveTo(r, c);
      if (m) {
        applyAction(m, true);
        setSelected(
          stateRef.current?.mandatoryJumpFrom
            ? { row: r, col: c }
            : null,
        );
        return;
      }
      const piece = state.board[r][c];
      if (piece && piece.player === state.currentPlayer) {
        if (state.mandatoryJumpFrom) return;
        setSelected({ row: r, col: c });
        return;
      }
      setSelected(null);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, winners, canMove, legalMoves],
  );

  // ── Render ─────────────────────────────────────────────────────────────
  if (notFound) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-hill-bg text-hill-text">
        <div className="text-2xl font-extrabold">Room not found</div>
        <button
          onClick={() => router.push('/')}
          className="rounded-[10px] border border-hill-border bg-hill-surface px-4 py-2 text-sm font-semibold"
        >
          Home
        </button>
      </div>
    );
  }
  if (!room) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-hill-bg text-hill-muted font-mono text-[12px] tracking-[0.18em]">
        LOADING…
      </div>
    );
  }

  // GAME view
  if (state && room.status === 'playing') {
    const cfg = state.config;
    const go = winners ? winnersToGameOver(winners, slots) : null;
    const elapsed = Math.max(0, Math.floor((now - startedAt.current) / 1000));
    const dur = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')}`;
    return (
      <div className="flex min-h-screen flex-col items-center gap-4 bg-hill-bg p-5 text-hill-text">
        <div className="font-mono text-[11px] tracking-[0.2em] text-hill-muted">
          ROOM {roomId} · ROUND {state.round}
          {canMove ? ' · YOUR TURN' : ` · P${state.currentPlayer}`}
        </div>
        <Board
          size={cfg.boardSize as 8 | 10}
          pieces={boardToPieces(state.board)}
          centerZone={cfg.centerZone.map(toTuple)}
          selected={selected ? toTuple(selected) : null}
          highlighted={legalMoves.map((m) => toTuple(m.to))}
          onSquareClick={handleSquare}
        />
        {go && (
          <GameOverOverlay
            kind={go.kind}
            winners={go.winners}
            matchDuration={dur}
            roundCount={state.round}
            onPlayAgain={() => router.push('/r/new')}
            onShare={() => {
              void navigator.clipboard.writeText(window.location.href);
            }}
            onLobby={() => router.push('/')}
          />
        )}
      </div>
    );
  }

  // LOBBY view
  const cfg = PRESET[mode];
  const sorted = [...presence].sort((a, b) => a.joinedAt - b.joinedAt);
  const lobbyPlayers = cfg.players.map((p, i) => {
    const e = sorted[i];
    if (!e) return { player: p, empty: true as const };
    const lp: LobbyPlayer = {
      player: p,
      name: e.displayName,
      tier: e.tier,
      skin: e.skin,
      isHost: e.userId === room.host_user_id,
      isYou: e.userId === user?.id,
    };
    return lp;
  });

  const onStart = () => {
    if (!isHost || !chRef.current) return;
    const filled = presence.length;
    if (filled < 2) return;
    const sl = assignSlots(presence, cfg.players.slice(0, filled));
    const initial = createInitialState(cfg);
    startedAt.current = Date.now();
    recorded.current = false;
    elimRound.current = {};
    prevAlive.current = [...initial.alivePlayers];
    setSlots(sl);
    setState(initial);
    setRoom({ ...room, status: 'playing' });
    broadcastGameStart(chRef.current, { state: initial, slots: sl });
    void updateRoomState(roomId, {
      state: { game: initial, slots: sl },
      status: 'playing',
    });
  };

  const cycleMode = () => {
    if (!isHost || !chRef.current) return;
    const next: RoomMode =
      mode === 'hill-blitz' ? 'hill-survival' : 'hill-blitz';
    setMode(next);
    broadcastModeChange(chRef.current, next);
  };

  return (
    <Lobby
      roomCode={roomId}
      mode={toGameMode(mode)}
      players={lobbyPlayers}
      isHost={isHost}
      onStart={onStart}
      onChangeMode={cycleMode}
      onCopyLink={() => {
        void navigator.clipboard.writeText(window.location.href);
      }}
      onShare={() => {
        if (navigator.share) {
          void navigator.share({ url: window.location.href });
        } else {
          void navigator.clipboard.writeText(window.location.href);
        }
      }}
      onBack={() => router.push('/')}
    />
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors. If `use(params)` types complain, confirm React 19 `use` import from `'react'` (it is, per `package.json` react 19.2.4).

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no errors (warnings from existing `eslint-disable` lines are fine).

- [ ] **Step 4: Commit**

```bash
git add "app/r/[roomId]/page.tsx"
git commit -m "feat(mp): room orchestrator — lobby, realtime game, host authority"
```

---

## Task 10: Wire the Landing page

**Files:**
- Modify: `app/page.tsx` (full replace of the Next starter content)

- [ ] **Step 1: Replace file contents**

```tsx
// app/page.tsx
'use client';
import { useRouter } from 'next/navigation';
import { Landing } from '@/components/hill/screens/Landing';
import { useAuth } from '@/lib/auth';

export default function Home() {
  const router = useRouter();
  const { profile } = useAuth();
  return (
    <Landing
      profile={profile}
      onCreateRoom={() => router.push('/r/new')}
      onPlayClassic={() => router.push('/play/classic')}
      onSignIn={() => router.push('/login')}
    />
  );
}
```

- [ ] **Step 2: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat(mp): wire Landing → create room / classic / sign in"
```

---

## Task 11: Manual setup doc

**Files:**
- Create: `docs/phase-4-multiplayer-setup.md`

- [ ] **Step 1: Write the doc**

```markdown
# Phase 4 — Multiplayer Setup (manual, ~1 min)

All Phase 4 code is complete. One dashboard-only secret is required.

## 1. Add the service-role key

Supabase Dashboard → **Settings → API** → copy the **`service_role`** secret
(NOT the publishable key). Add it to `.env.local`:

\`\`\`
SUPABASE_SERVICE_ROLE_KEY=<service role key>
\`\`\`

Restart `npm run dev`. Until this is set, `POST /api/rooms` and
`POST /api/games` return 500 with "Supabase service env missing".

> The key is server-only (no `NEXT_PUBLIC_` prefix) — it must never reach the
> browser. It is read solely by `lib/multiplayer/server.ts` in API routes.

## 2. Schema

`rooms`, `games`, `game_players` and their RLS policies already ship in
`lib/db/schema.sql` (run during Phase 3). No schema change for Phase 4.

## 3. Acceptance test

| Step | Expected |
|---|---|
| Open `/` → "Create Hill Room" (or visit `/r/new`) | Redirects to `/r/ABCD` |
| Copy the URL, open in an incognito window | Second tab joins the lobby |
| Open two more incognito tabs | 4 players shown in the lobby |
| Host clicks **Start Game** | All 4 tabs render the board, P1 active |
| P1 makes a move | All 4 tabs update |
| Play to completion | All see the Game Over overlay |
| Check Supabase → Table Editor | New row in `games`, 2–4 rows in `game_players`, winners' `total_wins` incremented |
```

- [ ] **Step 2: Commit**

```bash
git add docs/phase-4-multiplayer-setup.md
git commit -m "docs: phase-4 multiplayer setup + acceptance test"
```

---

## Task 12: Full verification

- [ ] **Step 1: Run the whole test suite**

Run: `npm test`
Expected: all tests pass (existing engine tests + new `code` + `adapt` tests).

- [ ] **Step 2: Production build**

Run: `npm run build`
Expected: build succeeds, `/r/[roomId]`, `/r/new`, `/api/rooms`, `/api/games`, `/` all compile.

- [ ] **Step 3: Manual acceptance**

Follow `docs/phase-4-multiplayer-setup.md` §3 with 4 browser tabs (set `SUPABASE_SERVICE_ROLE_KEY` first). Confirm: lobby fills, host Start syncs all tabs, moves propagate, Game Over shows on all, DB rows written.

- [ ] **Step 4: Final commit (if any fixes were needed)**

```bash
git add -A
git commit -m "fix(mp): address verification findings"
```

---

## Self-Review

**Spec coverage:**
- API `/api/rooms` (code + insert) → Task 4 ✓
- API `/api/games` (games + game_players + win bump) → Task 5 ✓
- `lib/multiplayer/server.ts` (service client + bearer auth) → Task 3 ✓
- `lib/multiplayer/channel.ts` (subscribe/broadcast/presence) → Task 7 ✓
- `lib/multiplayer/adapt.ts` (board→pieces, coords, slots, gameover) → Task 2 ✓
- `lib/db/rooms.ts` (createRoom/getRoom/updateRoomState) → Task 6 ✓
- `app/r/[roomId]/page.tsx` lobby + game + sync + host authority → Task 9 ✓
- `app/r/new/page.tsx` create+redirect → Task 8 ✓
- Landing wiring → Task 10 ✓
- Frozen slots at Start; presence churn doesn't reattribute → Task 9 `assignSlots` called once in `onStart`, stored in `slots`/`slotsRef` ✓
- Host = single writer (DB snapshot, timer-skip, recording); active player broadcasts → Task 9 effects guarded by `isHostRef` ✓
- Late-open sync (request/response) → Task 9 `onSyncRequest`/`onSyncResponse` + `broadcastSyncRequest` on subscribe when playing ✓
- `eliminatedRound` tracking → Task 9 `elimRound` ref vs `alivePlayers` diff ✓
- Manual service-role-key setup doc → Task 11 ✓
- Phase-5 exclusions (rejoin grace, leaderboard, server validation, classic MP) → not implemented ✓

**Placeholder scan:** No "TBD"/"TODO"/"add error handling"-style placeholders; every code step is complete. The `<service role key>` token in Task 11 is an intentional env value the user supplies.

**Type consistency:** `RoomMode` defined in Task 6, imported in Tasks 7 & 9. `SlotMap`/`PresenceEntry`/`SlotInfo` defined in Task 2, used in Tasks 6/7/9. `RoomHandlers` (Task 7) matches the handler object in Task 9. `Action` (engine) used consistently for `broadcastMove`/`applyAction`. `boardToPieces`/`toTuple`/`toCoord`/`winnersToGameOver`/`assignSlots` signatures match between Task 2 and Task 9 call sites. `Board`/`Lobby`/`GameOverOverlay` props match the verified component interfaces.

Note: `toCoord` is exported (Task 2) and unit-tested but not consumed by the page; kept because it is the inverse of `toTuple` and part of the adapter's public surface (selection round-trips use `{row,col}` directly). Acceptable — not a placeholder.
