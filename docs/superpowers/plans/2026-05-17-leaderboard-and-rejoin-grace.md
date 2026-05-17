# Leaderboard + Rejoin Grace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a public top-100 leaderboard page and a 10-second rejoin grace period that forfeits disconnected players (pieces removed, dropped from turn order) if they don't return.

**Architecture:** Forfeit is a pure `lib/engine` function applied identically on every client; the host alone runs the 10 s timer and broadcasts `player_forfeit`. The leaderboard reads the `profiles` table directly (RLS-allowed) and reuses the existing Claude-Design `<Leaderboard>` screen. Pure units (forfeit, row mapper) are TDD'd; wiring is verified by build + manual acceptance.

**Tech Stack:** Next.js 16 App Router, TypeScript strict, `@supabase/supabase-js` Realtime/Postgres, vitest (node env, `lib/**/*.test.ts`).

**Reference spec:** `docs/superpowers/specs/2026-05-17-leaderboard-and-rejoin-grace-design.md`

---

## File Structure

| File | Responsibility |
|------|----------------|
| `lib/engine/forfeit.ts` | Pure `forfeitPlayer(state, player)` |
| `lib/engine/forfeit.test.ts` | TDD tests for forfeit |
| `lib/arena.ts` | + `deriveElo` (single source of truth) |
| `lib/db/profiles.ts` | use `deriveElo` from arena (drop local dup) |
| `lib/db/leaderboard.ts` | `getLeaderboard()` + pure `toLeaderboardRows()` |
| `lib/db/leaderboard.test.ts` | TDD tests for `toLeaderboardRows` |
| `app/leaderboard/page.tsx` | wires existing `<Leaderboard>` screen |
| `lib/multiplayer/channel.ts` | presence join/leave + `player_forfeit` |
| `app/r/[roomId]/page.tsx` | disconnect tracking + host forfeit authority |

---

## Task 1: Pure `forfeitPlayer` engine function (TDD)

**Files:**
- Create: `lib/engine/forfeit.ts`
- Test: `lib/engine/forfeit.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/engine/forfeit.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { forfeitPlayer } from './forfeit';
import { createInitialState, TURN_MS } from './apply';
import { checkWinners } from './endgame';
import { hillBlitz } from './presets';
import type { GameState, Piece, Player } from './types';

function emptyBoard(n: number): (Piece | null)[][] {
  return Array.from({ length: n }, () => Array.from({ length: n }, () => null));
}

describe('forfeitPlayer', () => {
  it('removes the forfeiting player and advances the turn when it was theirs', () => {
    const s = createInitialState(hillBlitz); // currentPlayer 1, alive [1,2,3,4]
    const before = Date.now();
    const r = forfeitPlayer(s, 1);
    const p1 = r.board.flat().filter((c) => c && c.player === 1).length;
    expect(p1).toBe(0);
    expect(r.alivePlayers).toEqual([2, 3, 4]);
    expect(r.currentPlayer).toBe(2);
    expect(r.turnDeadline).toBeGreaterThanOrEqual(before + TURN_MS);
  });

  it('keeps currentPlayer and turnDeadline when a non-current player forfeits', () => {
    const s = createInitialState(hillBlitz);
    const fixedDeadline = 123_456;
    const s2: GameState = { ...s, turnDeadline: fixedDeadline };
    const r = forfeitPlayer(s2, 3);
    expect(r.alivePlayers).toEqual([1, 2, 4]);
    expect(r.currentPlayer).toBe(1);
    expect(r.turnDeadline).toBe(fixedDeadline);
  });

  it('forfeiting the second-to-last player yields a lone winner via checkWinners', () => {
    const board = emptyBoard(10);
    board[4][4] = { player: 1, king: false };
    board[5][5] = { player: 2, king: false };
    const s: GameState = {
      config: hillBlitz,
      board,
      currentPlayer: 1,
      alivePlayers: [1, 2],
      round: 1,
      mandatoryJumpFrom: null,
      winners: null,
    };
    const r = forfeitPlayer(s, 2);
    expect(r.alivePlayers).toEqual([1]);
    expect(checkWinners(r)).toEqual([1]);
  });

  it('forfeiting an already-eliminated player is a no-op', () => {
    const board = emptyBoard(10);
    board[4][4] = { player: 1, king: false };
    board[5][5] = { player: 2, king: false };
    const s: GameState = {
      config: hillBlitz,
      board,
      currentPlayer: 1,
      alivePlayers: [1, 2],
      round: 1,
      mandatoryJumpFrom: null,
      winners: null,
    };
    const r = forfeitPlayer(s, 3 as Player); // 3 has no pieces, not alive
    expect(r.alivePlayers).toEqual([1, 2]);
    expect(r.currentPlayer).toBe(1);
    expect(r.board.flat().filter(Boolean)).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- forfeit`
Expected: FAIL — `Cannot find module './forfeit'`.

- [ ] **Step 3: Write minimal implementation**

Create `lib/engine/forfeit.ts`:

```ts
import { getNextActivePlayer, TURN_MS } from './apply';
import type { GameState, Piece, Player } from './types';

function cloneBoard(board: (Piece | null)[][]): (Piece | null)[][] {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

function pieceCount(board: (Piece | null)[][], player: Player): number {
  let n = 0;
  for (const row of board) for (const cell of row) if (cell?.player === player) n++;
  return n;
}

/**
 * Remove a player from a live game (disconnect forfeit). Pure: clones the
 * board, deletes all of `player`'s pieces, recomputes alive players, and only
 * advances the turn if it was the forfeiting player's. Never sets `winners` —
 * the caller derives game-over via checkWinners, exactly as after applyMove.
 */
export function forfeitPlayer(state: GameState, player: Player): GameState {
  const board = cloneBoard(state.board);
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      if (board[r][c]?.player === player) board[r][c] = null;
    }
  }

  const alivePlayers = state.config.players.filter(
    (p) =>
      state.alivePlayers.includes(p) && p !== player && pieceCount(board, p) > 0,
  );

  const wasCurrent = state.currentPlayer === player;
  const base: GameState = {
    ...state,
    board,
    alivePlayers,
    mandatoryJumpFrom: wasCurrent ? null : state.mandatoryJumpFrom,
  };
  if (!wasCurrent) return base;

  return {
    ...base,
    currentPlayer: getNextActivePlayer(base),
    turnDeadline: Date.now() + TURN_MS,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- forfeit`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/engine/forfeit.ts lib/engine/forfeit.test.ts
git commit -m "feat(engine): pure forfeitPlayer for disconnect handling"
```

---

## Task 2: Promote `deriveElo` to `lib/arena.ts` (DRY)

**Files:**
- Modify: `lib/arena.ts` (append one export)
- Modify: `lib/db/profiles.ts` (use the shared `deriveElo`)

- [ ] **Step 1: Add `deriveElo` to `lib/arena.ts`**

Append to the end of `lib/arena.ts` (after the `getArenaTier` function):

```ts

// ELO has no column in the MVP schema — derived for display only (profile +
// leaderboard). Single source of truth; profiles.ts and leaderboard.ts use it.
export const deriveElo = (wins: number): number => 1000 + wins * 20;
```

- [ ] **Step 2: Refactor `lib/db/profiles.ts` to import it**

In `lib/db/profiles.ts`:

Change the arena import line from:
```ts
import { getArenaTier } from '@/lib/arena';
```
to:
```ts
import { getArenaTier, deriveElo } from '@/lib/arena';
```

Then DELETE these lines (the local duplicate and its comment):
```ts
// ELO has no column in the MVP schema — derived for display only (profile +
// leaderboard). Wins are the real progression signal.
const deriveElo = (wins: number) => 1000 + wins * 20;
```

Leave every `deriveElo(...)` call site unchanged (same name, same formula → no behavior change).

- [ ] **Step 3: Verify no regression**

Run: `npx tsc --noEmit && npm test`
Expected: tsc clean; tests still pass (same count as before, 53).

- [ ] **Step 4: Commit**

```bash
git add lib/arena.ts lib/db/profiles.ts
git commit -m "refactor: single source of truth for deriveElo in lib/arena"
```

---

## Task 3: Leaderboard data layer (TDD for the pure mapper)

**Files:**
- Create: `lib/db/leaderboard.ts`
- Test: `lib/db/leaderboard.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/db/leaderboard.test.ts` (only the pure mapper is unit-tested; `getLeaderboard` is a Supabase wrapper, untested per repo convention like `lib/db/profiles.ts`):

```ts
import { describe, it, expect } from 'vitest';
import { toLeaderboardRows, type LeaderboardEntry } from './leaderboard';

const e = (
  id: string,
  displayName: string,
  totalWins: number,
  totalGames: number,
): LeaderboardEntry => ({ id, displayName, totalWins, totalGames });

describe('toLeaderboardRows', () => {
  it('assigns 1-based ranks in input order and maps fields', () => {
    const rows = toLeaderboardRows(
      [e('a', 'Ann', 30, 40), e('b', 'Bo', 10, 10)],
      'b',
    );
    expect(rows[0]).toEqual({
      rank: 1,
      name: 'Ann',
      tier: 'Gold', // 30 wins ≥ Gold(25)
      wins: 30,
      winRate: 75, // round(30/40*100)
      elo: 1600, // 1000 + 30*20
      isYou: false,
    });
    expect(rows[1].rank).toBe(2);
    expect(rows[1].isYou).toBe(true);
    expect(rows[1].winRate).toBe(100);
  });

  it('guards divide-by-zero when totalGames is 0', () => {
    const rows = toLeaderboardRows([e('a', 'Ann', 0, 0)]);
    expect(rows[0].winRate).toBe(0);
    expect(rows[0].tier).toBe('Bronze');
    expect(rows[0].isYou).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- leaderboard`
Expected: FAIL — `Cannot find module './leaderboard'`.

- [ ] **Step 3: Write minimal implementation**

Create `lib/db/leaderboard.ts`:

```ts
'use client';
import { getSupabase } from '@/lib/multiplayer/client';
import { getArenaTier, deriveElo } from '@/lib/arena';
import type { LeaderboardRow } from '@/components/hill/screens/Leaderboard';

export interface LeaderboardEntry {
  id: string;
  displayName: string;
  totalWins: number;
  totalGames: number;
}

interface ProfileRow {
  id: string;
  display_name: string;
  total_wins: number;
  total_games: number;
}

// Reads the profiles table directly (RLS profiles_select_all permits it).
// Returns [] on error or no data — the page renders an empty state.
export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const { data, error } = await getSupabase()
    .from('profiles')
    .select('id, display_name, total_wins, total_games')
    .gt('total_games', 0)
    .order('total_wins', { ascending: false })
    .limit(100);
  if (error || !data) return [];
  return (data as ProfileRow[]).map((r) => ({
    id: r.id,
    displayName: r.display_name,
    totalWins: r.total_wins,
    totalGames: r.total_games,
  }));
}

// Pure: entries are already sorted by the query; rank is 1-based input order.
export function toLeaderboardRows(
  entries: LeaderboardEntry[],
  currentUserId?: string,
): LeaderboardRow[] {
  return entries.map((en, i) => ({
    rank: i + 1,
    name: en.displayName,
    tier: getArenaTier(en.totalWins),
    wins: en.totalWins,
    winRate: en.totalGames
      ? Math.round((en.totalWins / en.totalGames) * 100)
      : 0,
    elo: deriveElo(en.totalWins),
    isYou: !!currentUserId && en.id === currentUserId,
  }));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- leaderboard`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/db/leaderboard.ts lib/db/leaderboard.test.ts
git commit -m "feat(mp): leaderboard data layer + pure row mapper"
```

---

## Task 4: Leaderboard page

**Files:**
- Create: `app/leaderboard/page.tsx`

No test (UI page — repo convention; verified by build + manual acceptance).

- [ ] **Step 1: Implement**

Create `app/leaderboard/page.tsx`:

```tsx
'use client';
import { useEffect, useState } from 'react';
import { Leaderboard, type LeaderboardRow } from '@/components/hill/screens/Leaderboard';
import { getLeaderboard, toLeaderboardRows } from '@/lib/db/leaderboard';
import { useAuth } from '@/lib/auth';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<LeaderboardRow[] | null>(null);

  useEffect(() => {
    let active = true;
    getLeaderboard().then((entries) => {
      if (!active) return;
      setRows(toLeaderboardRows(entries, user?.id));
    });
    return () => {
      active = false;
    };
  }, [user]);

  if (rows === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-hill-bg text-hill-muted font-mono text-[12px] tracking-[0.18em]">
        LOADING…
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="relative min-h-screen bg-hill-bg text-hill-text">
        <div className="flex min-h-screen flex-col items-center justify-center gap-2 px-6 text-center">
          <div className="text-xl font-extrabold">No ranked games yet</div>
          <p className="max-w-[240px] text-sm text-hill-muted">
            Play a game to appear on the leaderboard.
          </p>
        </div>
        <Leaderboard rows={[]} total={0} />
      </div>
    );
  }

  return <Leaderboard rows={rows} total={rows.length} />;
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: tsc clean; no NEW lint errors from `app/leaderboard/page.tsx`; build succeeds with `/leaderboard` listed as a route.

- [ ] **Step 3: Commit**

```bash
git add app/leaderboard/page.tsx
git commit -m "feat(mp): leaderboard page wiring the design screen"
```

---

## Task 5: Channel — presence join/leave + `player_forfeit`

**Files:**
- Modify: `lib/multiplayer/channel.ts`

No test (Realtime wrapper — repo convention; verified by build + manual acceptance).

- [ ] **Step 1: Add `Player` to the engine type import**

In `lib/multiplayer/channel.ts`, change:
```ts
import type { Action, GameState } from '@/lib/engine/types';
```
to:
```ts
import type { Action, GameState, Player } from '@/lib/engine/types';
```

- [ ] **Step 2: Extend `RoomHandlers`**

In the `RoomHandlers` interface, add these three members after `onPresenceSync`:

```ts
  onPresenceJoin: (userIds: string[]) => void;
  onPresenceLeave: (userIds: string[]) => void;
  onForfeit: (player: Player) => void;
```

(Final interface order: `onPresenceSync`, `onPresenceJoin`, `onPresenceLeave`, `onMove`, `onGameStart`, `onSyncRequest`, `onSyncResponse`, `onModeChange`, `onForfeit` — exact order is irrelevant, presence of all members is what matters.)

- [ ] **Step 3: Wire presence join/leave + forfeit broadcast in `subscribeToRoom`**

Immediately AFTER the existing `ch.on('presence', { event: 'sync' }, ...)` block (the one ending `handlers.onPresenceSync(entries); });`), insert:

```ts
  ch.on('presence', { event: 'join' }, ({ newPresences }) => {
    const ids = (newPresences as PresenceEntry[])
      .map((p) => p?.userId)
      .filter((x): x is string => !!x);
    if (ids.length) handlers.onPresenceJoin(ids);
  });
  ch.on('presence', { event: 'leave' }, ({ leftPresences }) => {
    const ids = (leftPresences as PresenceEntry[])
      .map((p) => p?.userId)
      .filter((x): x is string => !!x);
    if (ids.length) handlers.onPresenceLeave(ids);
  });
```

Then, immediately AFTER the existing `ch.on('broadcast', { event: 'room:mode' }, ...)` block and BEFORE `return ch;`, insert:

```ts
  ch.on('broadcast', { event: 'player_forfeit' }, ({ payload }) =>
    handlers.onForfeit((payload as { player: Player }).player),
  );
```

- [ ] **Step 4: Add the `broadcastForfeit` sender**

After the existing `broadcastModeChange` function and before `trackPresence`, add:

```ts
export function broadcastForfeit(ch: RealtimeChannel, player: Player) {
  return ch.send({
    type: 'broadcast',
    event: 'player_forfeit',
    payload: { player },
  });
}
```

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit`
Expected: tsc reports an error in `app/r/[roomId]/page.tsx` that the `subscribeToRoom` handlers object is missing `onPresenceJoin`/`onPresenceLeave`/`onForfeit`. **This is expected** — Task 6 adds them. `lib/multiplayer/channel.ts` itself must have no errors. (If you want a clean intermediate commit, run `npx tsc --noEmit lib/multiplayer/channel.ts` is not reliable with path aliases; instead just confirm the only new errors point at `app/r/[roomId]/page.tsx`.)

- [ ] **Step 6: Commit**

```bash
git add lib/multiplayer/channel.ts
git commit -m "feat(mp): channel presence join/leave + player_forfeit event"
```

---

## Task 6: Room page — disconnect tracking + host forfeit authority

**Files:**
- Modify: `app/r/[roomId]/page.tsx`

No test (UI integration — repo convention; verified by build + manual acceptance).

First READ the whole current `app/r/[roomId]/page.tsx` so the insertions land at the right anchors. The changes below preserve every existing behavior (host authority, frozen slots, useLayoutEffect ref-sync, queueMicrotask, etc.).

- [ ] **Step 1: Add the forfeit import**

Add alongside the other `@/lib/engine/*` imports:

```ts
import { forfeitPlayer } from '@/lib/engine/forfeit';
```

And add `broadcastForfeit` to the existing `@/lib/multiplayer/channel` import list (it already imports `broadcastMove`, `broadcastGameStart`, etc. — add `broadcastForfeit` to that destructured list).

- [ ] **Step 2: Add disconnect state + refs**

Near the other `useState`/`useRef` declarations (after `const [now, setNow] = useState(...)` and the existing refs), add:

```ts
  const [disconnectedAt, setDisconnectedAt] = useState<
    Partial<Record<Player, number>>
  >({});
  const forfeitTimers = useRef<
    Partial<Record<Player, ReturnType<typeof setTimeout>>>
  >({});
  const presenceRef = useRef<PresenceEntry[]>([]);
```

Find the existing `onPresenceSync` handler. It currently is `onPresenceSync: (e) => setPresence(e),`. Change it to also keep the ref current:

```ts
        onPresenceSync: (e) => {
          presenceRef.current = e;
          setPresence(e);
        },
```

- [ ] **Step 3: Add the `applyForfeit` helper**

Immediately AFTER the existing `applyAction` `useCallback` block, add:

```ts
  // Apply a forfeit locally; host also broadcasts. Mirrors applyAction.
  const applyForfeit = useCallback((player: Player, broadcast: boolean) => {
    setState((prev) => {
      if (!prev) return prev;
      const next = forfeitPlayer(prev, player);
      if (broadcast && isHostRef.current && chRef.current) {
        broadcastForfeit(chRef.current, player);
      }
      return next;
    });
    setDisconnectedAt((prev) => {
      if (prev[player] == null) return prev;
      const copy = { ...prev };
      delete copy[player];
      return copy;
    });
    const t = forfeitTimers.current[player];
    if (t) {
      clearTimeout(t);
      delete forfeitTimers.current[player];
    }
  }, []);
```

- [ ] **Step 4: Add the slot resolver + presence handlers**

Add this helper just above the `subscribeToRoom(roomId, { ... })` call (it reads the latest slots via `slotsRef.current`, which the page already maintains):

```ts
  const slotOf = useCallback((userId: string): Player | null => {
    const sl = slotsRef.current;
    for (const key of Object.keys(sl) as unknown as Player[]) {
      const p = Number(key) as Player;
      if (sl[p]?.userId === userId) return p;
    }
    return null;
  }, []);
```

Then in the `subscribeToRoom(roomId, { ... })` handlers object, add these three handlers (the `RoomHandlers` type now requires them, so TS will flag their absence):

```ts
        onPresenceJoin: (userIds) => {
          for (const uid of userIds) {
            const p = slotOf(uid);
            if (p == null) continue;
            setDisconnectedAt((prev) => {
              if (prev[p] == null) return prev;
              const copy = { ...prev };
              delete copy[p];
              return copy;
            });
            const t = forfeitTimers.current[p];
            if (t) {
              clearTimeout(t);
              delete forfeitTimers.current[p];
            }
          }
        },
        onPresenceLeave: (userIds) => {
          for (const uid of userIds) {
            const p = slotOf(uid);
            if (p == null) continue;
            if (!stateRef.current || checkWinners(stateRef.current)) continue;
            setDisconnectedAt((prev) => ({ ...prev, [p]: Date.now() }));
            if (!isHostRef.current) continue;
            const existing = forfeitTimers.current[p];
            if (existing) clearTimeout(existing);
            forfeitTimers.current[p] = setTimeout(() => {
              delete forfeitTimers.current[p];
              const stillGone = !presenceRef.current.some(
                (e) => e.userId === uid,
              );
              if (
                stillGone &&
                stateRef.current &&
                !checkWinners(stateRef.current)
              ) {
                applyForfeit(p, true);
              }
            }, 10_000);
          }
        },
        onForfeit: (p) => applyForfeit(p, false),
```

Note: `checkWinners` is already imported in this file (used by the `winners` memo). `stateRef`/`slotsRef`/`isHostRef`/`chRef` already exist and are kept current by the existing `useLayoutEffect`.

- [ ] **Step 5: Clear forfeit timers on unmount**

In the load effect's cleanup `return () => { ... }` (the one that sets `active = false` and unsubscribes the channel), add before/after the channel unsubscribe:

```ts
      for (const key of Object.keys(forfeitTimers.current)) {
        const tm = forfeitTimers.current[Number(key) as Player];
        if (tm) clearTimeout(tm);
      }
      forfeitTimers.current = {};
```

- [ ] **Step 6: Add the in-game disconnect indicator**

In the GAME view JSX (the branch `if (state && room.status === 'playing')`), directly below the existing status line `<div ...>ROOM {roomId} · ROUND {state.round}...</div>`, add:

```tsx
        {(Object.keys(disconnectedAt) as unknown as Player[])
          .map((k) => Number(k) as Player)
          .filter((p) => disconnectedAt[p] != null)
          .map((p) => {
            const secs = Math.max(
              0,
              Math.ceil((disconnectedAt[p]! + 10_000 - now) / 1000),
            );
            return (
              <div
                key={`dc-${p}`}
                className="font-mono text-[11px] tracking-[0.16em] text-hill-danger"
              >
                P{p} DISCONNECTED · {secs}s…
              </div>
            );
          })}
```

(`text-hill-danger` is an existing token used by `PlayerSlot`. The existing 250 ms `now` tick drives the countdown — no new interval.)

- [ ] **Step 7: Verify**

Run: `npx tsc --noEmit && npm run lint && npm test && npm run build`
Expected: tsc clean; no NEW lint errors in `app/r/[roomId]/page.tsx` (existing `eslint-disable` lines stay); 55 tests pass (53 prior + Task1 4 forfeit are within those files… count: prior 53 + 4 forfeit + 2 leaderboard = 59); build succeeds. (Exact total = 59 tests, 8 files.)

- [ ] **Step 8: Commit**

```bash
git add "app/r/[roomId]/page.tsx"
git commit -m "feat(mp): 10s rejoin grace + host-authority forfeit"
```

---

## Task 7: Full verification

- [ ] **Step 1: Full automated gates**

Run: `npx tsc --noEmit && npm test && npm run build`
Expected: tsc clean; **59 tests pass across 8 files** (prior 53 + 4 forfeit + 2 leaderboard); build succeeds with `/leaderboard` and `/r/[roomId]` routes present.

- [ ] **Step 2: Lint the changed files**

Run: `npx eslint lib/engine/forfeit.ts lib/db/leaderboard.ts app/leaderboard/page.tsx lib/multiplayer/channel.ts "app/r/[roomId]/page.tsx" lib/arena.ts lib/db/profiles.ts`
Expected: exit 0 (no errors in changed files).

- [ ] **Step 3: Manual acceptance** (requires `SUPABASE_SERVICE_ROLE_KEY` per `docs/phase-4-multiplayer-setup.md`)

- Open `/leaderboard` → empty state if no games. In Supabase, set `total_wins` for a few `profiles` rows (and `total_games > 0`) → reload → ranking order and rank numbers correct; your own row highlighted.
- 4-tab game (`/r/new`, share link). Close one tab → other 3 show `P{n} DISCONNECTED · 10s…` counting down. Reopen that room URL in a new tab within 10 s → indicator clears, game continues, no pieces lost.
- Close a tab and wait > 10 s → that player's pieces vanish, they leave the turn order, play continues; finish the game → `/api/games` row + `game_players` includes the forfeited player with an `eliminated_round`.

- [ ] **Step 4: Final commit (only if fixes were needed)**

```bash
git add -A
git commit -m "fix(mp): address verification findings"
```

---

## Self-Review

**Spec coverage:**
- Pure forfeit engine fn (spec §`lib/engine/forfeit.ts`) → Task 1 ✓
- `deriveElo` single source (spec §`lib/arena.ts`/`profiles.ts`) → Task 2 ✓
- `getLeaderboard` reads profiles + pure `toLeaderboardRows` → Task 3 ✓
- Leaderboard page wiring existing screen, loading/empty states → Task 4 ✓
- Channel presence join/leave + `player_forfeit` + `broadcastForfeit` → Task 5 ✓
- Disconnect tracking, host-only 10 s timer, `onForfeit`, rejoin clear, unmount cleanup, in-game countdown indicator → Task 6 ✓
- Reuse existing `<Leaderboard>` + `ArenaBadge`, no duplicate component → Tasks 3/4 (import from existing) ✓
- Host snapshot/elimination reuse (forfeited player recorded with eliminated_round) → no code change needed; verified in Task 7 manual step ✓
- Guards (not in slots / not playing / winners set), idempotent duplicate forfeit, host-loss accepted → Task 6 Step 4 (`slotOf` null skip, `checkWinners` guard) + Task 1 (no-op on already-removed) ✓

**Placeholder scan:** No TBD/TODO/"add error handling"; every code step is complete and copy-paste-ready. Task 5 Step 5 intentionally documents an expected transient tsc error resolved by Task 6 (not a placeholder — a sequencing note).

**Type consistency:** `forfeitPlayer(state, player): GameState` consistent Task 1 ↔ Task 6. `deriveElo(wins:number):number` consistent Task 2 ↔ Task 3. `LeaderboardEntry`/`toLeaderboardRows`/`LeaderboardRow` consistent Task 3 ↔ Task 4. `RoomHandlers` new members (`onPresenceJoin`/`onPresenceLeave`/`onForfeit`) defined Task 5, implemented Task 6. `broadcastForfeit(ch, player: Player)` defined Task 5, called Task 6. `Player` keying of `disconnectedAt`/`forfeitTimers` consistent within Task 6. `PresenceEntry.userId` used by Task 5 presence mappers and Task 6 `slotOf` — matches the existing `PresenceEntry` (from `lib/multiplayer/adapt`).
