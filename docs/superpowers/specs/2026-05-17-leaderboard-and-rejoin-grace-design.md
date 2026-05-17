# Leaderboard + Rejoin Grace Period — Design Spec

**Date:** 2026-05-17
**Status:** Approved (pre-implementation)
**Phase:** 5 (the items deferred by the Phase 4 multiplayer work)

## Goal

1. A public leaderboard page: top 100 players by total wins, mobile-first.
2. A 10-second rejoin grace period: when a player's tab disconnects mid-game,
   other clients show a countdown; if they return within 10 s the game
   continues unchanged; if not, the player forfeits (pieces removed, dropped
   from the turn order) and the game continues without them.

## Non-goals (YAGNI)

- Leaderboard Friends/Week filters (the Claude-Design component renders the
  tabs; only Global data is wired — the other tabs stay inert).
- A new `ArenaBadge` component (one already ships from Claude Design).
- A per-player in-game panel rework (a lightweight disconnect indicator is
  added to the existing game view instead).
- Server-side validation of forfeits (trust-the-client, consistent with the
  Phase 4 multiplayer MVP).
- Reconnect/resume of a player who already forfeited (forfeit is final).

## Architecture & module boundaries

```
lib/engine/forfeit.ts        NEW  pure forfeitPlayer(state, player)
lib/engine/forfeit.test.ts   NEW  TDD tests
lib/db/leaderboard.ts        NEW  getLeaderboard() + pure toLeaderboardRows()
lib/db/leaderboard.test.ts   NEW  TDD tests for toLeaderboardRows
lib/arena.ts                 EDIT export deriveElo (single source of truth)
lib/db/profiles.ts           EDIT import deriveElo from lib/arena (drop dup)
lib/multiplayer/channel.ts   EDIT presence join/leave + player_forfeit event
app/leaderboard/page.tsx     NEW  wires existing <Leaderboard> design screen
app/r/[roomId]/page.tsx      EDIT disconnect tracking + host forfeit authority
```

**Boundary rules (unchanged from Phase 4)**

- `lib/engine/*` stays pure: no React, no Supabase. `forfeitPlayer` is a
  data-in/data-out function, runnable in Node, and unit-tested.
- All game-rule logic (including forfeit) lives only in `lib/engine`. The
  page never mutates the board directly.
- Host is the single authority for time-based actions and DB writes. Only
  the host runs the forfeit timer and broadcasts `player_forfeit`; every
  client applies the same pure `forfeitPlayer`, keeping state convergent.
- Reuse existing Claude-Design components; wire them, don't reimplement.

## Components / contracts

### `lib/engine/forfeit.ts`

```ts
export function forfeitPlayer(state: GameState, player: Player): GameState
```

- Clone the board; set every cell owned by `player` to `null`.
- Recompute `alivePlayers`: `config.players` filtered to those in
  `prev.alivePlayers`, not equal to `player`, with `pieceCount > 0`.
- `mandatoryJumpFrom`: cleared only if `prev.currentPlayer === player`
  (a mid-jump belongs to the current player); otherwise unchanged.
- Turn handling:
  - If `prev.currentPlayer === player`: set `currentPlayer` to the next
    active player (reuse `getNextActivePlayer` against the new
    `alivePlayers`), and refresh `turnDeadline = Date.now() + TURN_MS`.
  - Else: keep `currentPlayer` and `turnDeadline` as they were.
- `round` is left unchanged (round semantics are intentionally loose; a
  forfeit is not a normal turn boundary).
- `winners` stays `null`. The page derives game-over via the existing
  `checkWinners` (a lone survivor or hill-hold ends the game just as after
  a normal move).
- Forfeiting a player who already has no pieces / is not in `alivePlayers`
  is a harmless no-op (removes 0 pieces, `alivePlayers` unchanged).

`getNextActivePlayer` and `TURN_MS` are reused from `lib/engine/apply.ts`.

### `lib/multiplayer/channel.ts` (additions only)

Extend `RoomHandlers`:
- `onPresenceJoin: (userIds: string[]) => void`
- `onPresenceLeave: (userIds: string[]) => void`
- `onForfeit: (player: Player) => void`

`subscribeToRoom`:
- Wire Supabase presence `join` / `leave` events. The `join` callback
  passes the `userId` of each entry in `newPresences`; the `leave`
  callback passes the `userId` of each entry in `leftPresences`.
- Wire a `player_forfeit` broadcast event → `onForfeit(payload.player)`.

New sender: `broadcastForfeit(ch, player: Player)` →
`ch.send({ type:'broadcast', event:'player_forfeit', payload:{ player } })`.

Existing `onPresenceSync`, broadcast events, and the
`{ broadcast: { self:false } }` config are unchanged.

### `app/r/[roomId]/page.tsx` (additions only)

State / refs:
- `disconnectedAt: Partial<Record<Player, number>>` — epoch ms a slot went
  away (drives the countdown UI).
- `forfeitTimers` ref: `Partial<Record<Player, ReturnType<typeof setTimeout>>>`.
- Reuse the existing 250 ms `now` tick for the countdown render.

Helper `slotOf(userId)`: find `p` where `slots[p]?.userId === userId`.

Handlers (added to the `subscribeToRoom` handlers object):
- `onPresenceLeave(userIds)`: for each, `p = slotOf(userId)`. Act only when
  `stateRef.current && !winners` and `p` resolved. `setDisconnectedAt(p →
  Date.now())`. If host: `forfeitTimers[p] = setTimeout(() => { ... }, 10000)`.
  On fire, re-check the slot is still disconnected and the userId is still
  absent from the latest presence; if so call `applyForfeit(p, true)`.
- `onPresenceJoin(userIds)`: for each, `p = slotOf(userId)`. If
  `disconnectedAt[p]` set: clear it; if host, `clearTimeout` and delete
  `forfeitTimers[p]`.
- `onForfeit(p)`: `applyForfeit(p, false)`.

`applyForfeit(p, broadcast)` (mirrors the existing `applyAction`):
`setState(prev => prev ? forfeitPlayer(prev, p) : prev)`; if `broadcast`
and host, `broadcastForfeit(chRef.current, p)`; clear `disconnectedAt[p]`.

Reuse without change:
- Host snapshot effect persists the post-forfeit state (late-join safe).
- Host elimination effect (`prevAlive` diff → `elimRound[p]=round`) records
  the forfeited player, so `/api/games` reports them correctly.

Cleanup: on the load effect's teardown, clear every `forfeitTimers` entry.

In-game disconnect indicator: in the GAME view, render one line per slot in
`disconnectedAt` (and not yet forfeited): `P{p} disconnected · {s}s…`
where `s = Math.max(0, Math.ceil((disconnectedAt[p] + 10000 - now)/1000))`.

### `lib/arena.ts` / `lib/db/profiles.ts`

- `lib/arena.ts`: add `export const deriveElo = (wins: number) => 1000 + wins * 20;`
- `lib/db/profiles.ts`: remove its local `deriveElo`; `import { getArenaTier,
  deriveElo } from '@/lib/arena'`. No behavior change (same formula).

### `lib/db/leaderboard.ts`

```ts
export interface LeaderboardEntry {
  id: string; displayName: string; totalWins: number; totalGames: number;
}
export async function getLeaderboard(): Promise<LeaderboardEntry[]>
export function toLeaderboardRows(
  entries: LeaderboardEntry[], currentUserId?: string,
): LeaderboardRow[]   // LeaderboardRow imported from the design component
```

- `getLeaderboard`: `getSupabase().from('profiles').select('id, display_name,
  total_wins, total_games').gt('total_games', 0).order('total_wins',
  { ascending:false }).limit(100)`. Map rows to `LeaderboardEntry`. On
  Supabase error or no data, return `[]` (never throw).
- `toLeaderboardRows` (pure, TDD): for each entry at index `i` →
  `{ rank:i+1, name:displayName, tier:getArenaTier(totalWins),
  wins:totalWins, winRate: totalGames ? Math.round(totalWins/totalGames*100)
  : 0, elo: deriveElo(totalWins), isYou: id===currentUserId }`.

### `app/leaderboard/page.tsx` (new, `'use client'`)

- On mount: `getLeaderboard()`; `useAuth()` for `user?.id`;
  `setRows(toLeaderboardRows(entries, user?.id))`.
- Loading state: centered `LOADING…` (same style as the room page).
- Empty state (`rows.length === 0`): render `<Leaderboard rows={[]}
  total={0} />` (keeps `BottomNav`) plus a "No ranked games yet — play a
  game to appear here" message.
- Populated: `<Leaderboard rows={rows} total={rows.length} />`.
- No auth required to view; guests see it with no `isYou` highlight.

## Data flow summary

**Leaderboard:** mount → `getLeaderboard` (profiles, RLS-allowed) →
`toLeaderboardRows` → existing `<Leaderboard>` (top-3 styling, isYou,
BottomNav). Empty/loading handled.

**Rejoin/forfeit:** tab closes → Supabase presence `leave` → all clients
mark `disconnectedAt[slot]`, show countdown → host starts 10 s timer.
Rejoin within 10 s → presence `join` → all clients clear `disconnectedAt`,
host clears timer, game untouched. No rejoin → host timer fires →
`broadcastForfeit` + local `forfeitPlayer` → every client applies the same
pure forfeit → `checkWinners` re-evaluated → host snapshot + elimination
tracking already handle persistence and `/api/games`.

## Error handling

- `getLeaderboard` failure → `[]` → empty state, no crash.
- presence leave/join for a userId not in `slots`, when not playing, or
  when `winners` set → ignored (guarded).
- Duplicate `player_forfeit` (e.g., re-broadcast) → idempotent:
  `forfeitPlayer` on an already-removed player is a no-op.
- Host disconnects: its timers die with its tab; this MVP accepts that a
  host loss stalls forfeit enforcement (consistent with Phase 4's
  trust-the-host model; not in scope to reassign host).
- Forfeit timer fires after the game already ended → guarded by the
  still-disconnected + `!winners` re-check before applying.

## Testing strategy

**TDD (unit, pure):**
- `lib/engine/forfeit.test.ts`: forfeit the current player (pieces gone,
  `alivePlayers` drops them, turn advances, deadline refreshed); forfeit a
  non-current player (turn/deadline unchanged); forfeit the
  second-to-last player then `checkWinners` → lone survivor; forfeit an
  already-eliminated player → no-op.
- `lib/db/leaderboard.test.ts`: `toLeaderboardRows` ranking order,
  `winRate` rounding and divide-by-zero guard, `elo` via `deriveElo`,
  `isYou` matching.

**Manual acceptance (from the task spec):**
- Open `/leaderboard` → top players; edit `profiles.total_wins` for a few
  users → reload → ranking/rank numbers correct; your row highlighted.
- 4-tab game: close one tab → other tabs show `P{n} disconnected · 10s…`
  counting down → reopen within 10 s → game resumes, no pieces lost.
- Close a tab and wait > 10 s → that player's pieces vanish, they leave the
  turn order, the game continues; `/api/games` (on completion) records them
  with an `eliminated_round`.

**Regression:** existing 53 tests stay green; `tsc`/`lint`/`build` clean.

## Open assumptions (made explicit)

- Disconnect detection relies on Supabase Realtime presence `leave`
  (fires on tab close / network drop). Grace window is exactly 10000 ms,
  host-measured.
- `disconnectedAt` is keyed by `Player` (slot), matching the frozen
  `slots` map; a reconnecting user must return on the same `userId`.
- The in-game disconnect UI is a text indicator, not a restyled player
  panel — the acceptance phrase "PlayerPanel slot shows 'Disconnected,
  Ns…'" is satisfied by a clear per-slot countdown line.
- Forfeit does not change `round`; `eliminated_round` for a forfeited
  player is whatever `round` was when they were removed (existing host
  elimination-tracking behavior).
