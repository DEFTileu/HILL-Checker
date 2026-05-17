# Realtime Multiplayer — Design Spec

**Date:** 2026-05-17
**Status:** Approved (pre-implementation)
**Phase:** 4 (Phase 5 items explicitly out of scope)

## Goal

Players create a room, get a 4-letter code, share the link, and play King of
Hill (Blitz/Survival) together in real time over Supabase Realtime. Each client
runs the pure engine locally; moves broadcast over a channel; the host owns the
authoritative DB snapshot and result recording. Trust-the-client for MVP.

## Non-goals (Phase 5 — DO NOT IMPLEMENT)

- Rejoin grace period. On presence drop the player is simply removed from the
  lobby list. No in-game reconnection handling.
- Leaderboard page.
- Server-side move validation / anti-cheat.
- Multiplayer for Classic 2P (Classic stays the existing local `/play/classic`).
  Rooms are hill modes only.

## Architecture & module boundaries

```
app/page.tsx                 renders <Landing>, wires onCreateRoom → /r/new
app/r/new/page.tsx           creates room, redirects to /r/<CODE>
app/r/[roomId]/page.tsx      orchestrator: lobby ↔ game, owns engine state
app/api/rooms/route.ts       POST: gen unique code, insert room (service client)
app/api/games/route.ts       POST: insert game+game_players, bump wins (service)

lib/multiplayer/server.ts    NEW. server-only Supabase client (service-role key)
lib/multiplayer/channel.ts   NEW. Realtime subscribe/broadcast/presence helpers
lib/multiplayer/adapt.ts     NEW. pure engine⇄design adapters
lib/db/rooms.ts              NEW. createRoom / getRoom / updateRoomState
```

**Boundary rules**

- `lib/engine/*` stays pure and untouched. No rule logic is reimplemented
  anywhere; everything flows through `createInitialState`, `getLegalMoves`,
  `applyMove`, `skipTurn`, `checkWinners`.
- `lib/multiplayer/server.ts` is **server-only**: no `'use client'`, never
  imported by a component or by `lib/multiplayer/client.ts`. It is the only
  module that holds the service-role key.
- The existing browser client (`lib/multiplayer/client.ts`) is reused for
  reads and host state writes — RLS already permits both
  (`rooms_select_all`, `rooms_update_host`).
- `lib/multiplayer/adapt.ts` is pure (no React, no Supabase) and unit-tested.

**Identity model**

Both API routes receive `Authorization: Bearer <access_token>`. The route
resolves the real caller with an anon-key client (`auth.getUser(token)`), then
the **service client** performs the privileged writes. This blocks trivial
host/winner spoofing while the move stream itself stays trust-the-client per
CLAUDE.md rule 5.

## Components / contracts

### `app/api/rooms/route.ts` (POST)

- Read bearer token → `auth.getUser(token)` → `hostUserId`. 401 if absent.
- Body: `{ mode?: 'hill-blitz' | 'hill-survival' }` (default `hill-blitz`).
- Generate a 4-char `A–Z` uppercase code. Insert
  `rooms { id: code, host_user_id: hostUserId, mode, status: 'lobby',
  state: null }` via the service client. On unique-violation (`code 23505`)
  regenerate; max 5 attempts, then 500.
- Returns `{ id: code }`.

### `app/api/games/route.ts` (POST)

- Read bearer token → resolve caller (must be a valid user). 401 if absent.
- Body: `{ mode, winners: string[], players: [{ userId, slot,
  eliminatedRound: number | null }] }`.
- Service client, in order:
  1. INSERT `games { mode, player_count: players.length,
     winners: winnersUserIds }` → `gameId`.
  2. INSERT `game_players` rows: `{ game_id, user_id, slot, was_winner,
     eliminated_round }`.
  3. For each player: `total_games += 1`; if `was_winner`,
     `total_wins += 1` (read-modify-write or SQL increment).
- Returns `{ ok: true, gameId }`. Only the host calls this.

### `lib/multiplayer/server.ts`

- `getServiceClient(): SupabaseClient` — singleton built from
  `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (server env, not
  `NEXT_PUBLIC_`), `auth: { persistSession: false, autoRefreshToken: false }`.
- `getUserFromRequest(req): Promise<{ id: string } | null>` — extracts bearer
  token, validates via an anon-key client `auth.getUser(token)`.

### `lib/db/rooms.ts` (browser)

- `createRoom(mode): Promise<{ id: string }>` — POST `/api/rooms` with the
  current session's access token in `Authorization`.
- `getRoom(roomId): Promise<RoomRow | null>` — browser client SELECT.
- `updateRoomState(roomId, patch): Promise<void>` — browser client UPDATE
  (`{ state, status }`); RLS `rooms_update_host` permits the host only.

### `lib/multiplayer/channel.ts`

- `subscribeToRoom(roomId, handlers)` → Supabase channel for `room:${roomId}`.
  `handlers`: `onPresenceSync`, `onMove`, `onGameStart`, `onGameEnd`,
  `onSyncRequest`, `onSyncResponse`, `onModeChange`.
- `broadcastMove(channel, move)` → event `game:move`, payload `move`
  (an engine `Action` — `Move` or `SkipTurn`).
- `broadcastGameStart(channel, { state, slots })` → event `game:start`.
- `broadcastGameEnd(channel)` → event `game:end`.
- `broadcastSyncRequest(channel)` / `broadcastSyncResponse(channel, state)`.
- `broadcastModeChange(channel, mode)` → lobby mode mirror.
- `trackPresence(channel, { userId, displayName, joinedAt })`.

### `lib/multiplayer/adapt.ts` (pure)

- `boardToPieces(board): Piece[]` — engine `board[r][c]` →
  design `Piece[]` (`{ player, kind, pos:[r,c] }`).
- `toTuple({row,col}): [number,number]` / `toCoord([r,c]): {row,col}`.
- `assignSlots(presence[]): Record<Player,{userId,displayName}>` — sort by
  `joinedAt`, take first N.
- `winnersToGameOver(winners, slots, profiles)` → `<GameOverOverlay>` props
  (`kind`: 1→`solo`, >1→`joint`, `[]`→`none`; `eloDelta` cosmetic `+20`).

### `app/r/[roomId]/page.tsx` (orchestrator)

State machine on `room.status`:

- **lobby** — presence-driven first-come slots, `<Lobby>` UI, host-only mode
  toggle (mirrored via `broadcastModeChange`), host-only Start (disabled
  `<2` players). Start freezes the slot map, `createInitialState(preset)`,
  `broadcastGameStart({state,slots})`, `updateRoomState({state,status:'playing'})`,
  sets `rooms.status='playing'`.
- **playing** — `<Board>` via `adapt`. Active player (`state.currentPlayer`
  → slot → userId) may click: `getLegalMoves` → `applyMove` local →
  `broadcastMove`. Receivers `applyMove` on `game:move`. Host also
  `updateRoomState` after each applied move and is the **timer authority**
  (250ms clock; on `turnDeadline` expiry applies `skipTurn` and broadcasts
  it as a move). Host tracks `eliminatedRound` per slot when a player leaves
  `alivePlayers`.
- **game over** — `checkWinners(state) != null` → all show
  `<GameOverOverlay>`. Host only → `POST /api/games`.

Late open: `getRoom` shows `status='playing'` → bootstrap from `room.state`,
then `broadcastSyncRequest`; any client holding state replies with
`broadcastSyncResponse`; newcomer adopts it. `onSyncRequest`: reply with
current state if held.

### `app/page.tsx` / `app/r/new/page.tsx`

- `app/page.tsx`: replace the Next starter content with the existing
  `<Landing>` component. `onCreateRoom` → `router.push('/r/new')`,
  `onPlayClassic` → `router.push('/play/classic')`, `onSignIn` → `/login`.
- `app/r/new/page.tsx`: on mount `createRoom('hill-blitz')` →
  `router.replace('/r/<id>')`. Show a minimal "Creating room…" state; on
  error show a retry.

## Data flow summary

Create → `/api/rooms` → redirect `/r/CODE` → subscribe + presence → lobby
slots from presence → host Start freezes slots + broadcasts `game:start` +
persists → all render board → active player moves + broadcasts → receivers
apply → host snapshots each move → `checkWinners` → all show GameOver → host
`POST /api/games` → DB rows + win/game counts updated.

## Error handling

- `/api/rooms`: missing/invalid token → 401; 5 failed code attempts → 500;
  body validated, unknown mode → 400.
- `/api/games`: missing/invalid token → 401; malformed body → 400; partial
  failure after `games` insert is logged (MVP accepts best-effort; counts are
  idempotent enough for MVP — no compensating transaction in Phase 4).
- `getRoom` not found → page renders a 404 state.
- Channel subscribe failure → page shows a "connection lost" notice; no auto
  reconnect loop in Phase 4.
- Non-host clients never write to DB; a non-host attempting Start/record is a
  no-op guarded in the page.

## Testing strategy

**TDD (unit, pure):**

- Code generator: format (`^[A-Z]{4}$`) and collision-retry control flow
  (mockable insert that fails N times then succeeds; exhausts at 5).
- `adapt.ts`: `boardToPieces`, coord conversions round-trip, `assignSlots`
  ordering by `joinedAt` and N-cap, `winnersToGameOver` kind mapping
  (`solo`/`joint`/`none`).
- Slot freezing: presence churn after Start does not change the frozen map.

**Manual acceptance (from task spec):**

- `/r/new` (or Landing "Create Room") → redirect `/r/ABCD`.
- Copy URL, open in incognito B → joins lobby; two more tabs → 4 players.
- Host Start → all 4 see board, P1 highlighted.
- P1 moves → all 4 update.
- Play to completion → all see GameOverScreen → new row in `games`
  + `game_players` + winner `total_wins` incremented.

## Manual setup required (documented like phase-3)

Add to `.env.local` (from Supabase → Settings → API → service_role key):

```
SUPABASE_SERVICE_ROLE_KEY=<service role key>
```

`/api/rooms` and `/api/games` return 500 until this is set. A
`docs/phase-4-multiplayer-setup.md` note will mirror the phase-3 doc style.

## Open assumptions (made explicit)

- Rooms are hill modes only this phase; Classic stays local.
- Slots are frozen at Start; presence changes afterward do not reattribute.
- Host is the single writer for DB snapshots, timer-skips, and result
  recording. Move broadcasts come only from the active player's client.
- `eloDelta` shown in GameOver is cosmetic (`+20`), not persisted (no ELO
  column in the MVP schema).
