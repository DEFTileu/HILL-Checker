# HILL "Ship It" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn HILL into a shipped-quality product: a reusable polished game view, a fully playable Classic 2P hot-seat, a polished live Hill game, a working create-room flow, branding/OG, a real README, and Vercel deploy prep.

**Architecture:** Extract a single dumb presentational `components/GameView.tsx` driven by a pure, unit-tested view-model mapper in `lib/game-ui-view.ts`. Prove it on the existing (working) multiplayer page with zero transport changes, then reuse it for Classic and Hill hot-seat. Engine (`lib/engine/*`) stays pure; pages own wiring.

**Tech Stack:** Next.js 14 App Router, TypeScript strict, Tailwind, Supabase Realtime, Vitest, `next/og`.

**Spec:** `docs/superpowers/specs/2026-05-17-hill-ship-it-design.md`

**Conventions:**
- Path alias `@/` → repo root (per `tsconfig.json`).
- Engine tests: `npm test` (vitest, `vitest run`).
- Typecheck: `npx tsc --noEmit`. Lint: `npm run lint`. Build: `npm run build`.
- Player→shape is fixed: P1 circle, P2 square, P3 triangle, P4 hexagon (never change).

---

## Task 1: Pure view-model mapper `toGameViewModel`

**Files:**
- Create: `lib/game-ui-view.ts`
- Test: `lib/game-ui-view.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/game-ui-view.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createInitialState } from '@/lib/engine/apply';
import { classic2P } from '@/lib/engine/presets';
import { toGameViewModel, type PlayerMeta } from '@/lib/game-ui-view';

const META: PlayerMeta[] = [
  { player: 1, name: 'White', tier: 'Bronze', skin: 'bronze', isYou: true },
  { player: 2, name: 'Black', tier: 'Bronze', skin: 'bronze' },
];

describe('toGameViewModel', () => {
  it('maps a fresh classic state to a view-model', () => {
    const vm = toGameViewModel(createInitialState(classic2P), META);
    expect(vm.size).toBe(8);
    expect(vm.currentPlayer).toBe(1);
    expect(vm.round).toBe(1);
    expect(vm.pieces).toHaveLength(24);
    expect(vm.centerZone).toEqual([]);
    const p1 = vm.players.find((p) => p.player === 1)!;
    expect(p1.pieceCount).toBe(12);
    expect(p1.alive).toBe(true);
    expect(p1.isActive).toBe(true);
    expect(p1.isYou).toBe(true);
    expect(vm.players.find((p) => p.player === 2)!.isActive).toBe(false);
  });

  it('marks players with zero pieces as not alive and no winner active', () => {
    const base = createInitialState(classic2P);
    const dead = {
      ...base,
      board: base.board.map((row) => row.map(() => null)),
      alivePlayers: [1] as (1 | 2)[],
      winners: [1] as (1 | 2)[],
    };
    const vm = toGameViewModel(dead, META);
    expect(vm.players.every((p) => p.pieceCount === 0)).toBe(true);
    expect(vm.players.find((p) => p.player === 1)!.isActive).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- game-ui-view`
Expected: FAIL — `Cannot find module '@/lib/game-ui-view'`.

- [ ] **Step 3: Write the minimal implementation**

Create `lib/game-ui-view.ts`:

```ts
// lib/game-ui-view.ts
// PURE view-model layer: GameState (+ player metadata) -> GameView props.
// No React, no Supabase. Unit-tested.
import type { GameState, Player } from '@/lib/engine/types';
import type { Piece as UIPiece } from '@/lib/pieces';
import type { ArenaTier, SkinId } from '@/lib/skins';
import { boardToPieces } from '@/lib/multiplayer/adapt';

export interface PlayerMeta {
  player: Player;
  name: string;
  tier: ArenaTier;
  skin: SkinId;
  isYou?: boolean;
}

export interface GameViewPlayer extends PlayerMeta {
  isActive: boolean;
  alive: boolean;
  pieceCount: number;
}

export interface GameViewModel {
  size: 8 | 10;
  pieces: UIPiece[];
  centerZone: [number, number][];
  players: GameViewPlayer[];
  currentPlayer: Player;
  round: number;
  maxRounds: number;
  mode: GameState['config']['mode'];
}

export function toGameViewModel(
  state: GameState,
  meta: PlayerMeta[],
): GameViewModel {
  const counts = new Map<Player, number>();
  for (const row of state.board) {
    for (const cell of row) {
      if (cell) counts.set(cell.player, (counts.get(cell.player) ?? 0) + 1);
    }
  }

  const players: GameViewPlayer[] = meta.map((m) => ({
    ...m,
    isActive: state.winners === null && state.currentPlayer === m.player,
    alive: state.alivePlayers.includes(m.player),
    pieceCount: counts.get(m.player) ?? 0,
  }));

  return {
    size: state.config.boardSize as 8 | 10,
    pieces: boardToPieces(state.board),
    centerZone: state.config.centerZone.map(
      (z) => [z.row, z.col] as [number, number],
    ),
    players,
    currentPlayer: state.currentPlayer,
    round: state.round,
    maxRounds: state.config.maxRounds,
    mode: state.config.mode,
  };
}
```

(Reuses `boardToPieces` from `lib/multiplayer/adapt.ts`; its only component import there is `import type` and is erased at compile/test time — safe to depend on.)

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- game-ui-view`
Expected: PASS (2 passing).

- [ ] **Step 5: Commit**

```bash
git add lib/game-ui-view.ts lib/game-ui-view.test.ts
git commit -m "feat(view): pure GameState -> GameView view-model mapper"
```

---

## Task 2: Pure `winnersToOverlay` helper

**Files:**
- Modify: `lib/game-ui-view.ts`
- Test: `lib/game-ui-view.test.ts`

- [ ] **Step 1: Add the failing test**

Append to `lib/game-ui-view.test.ts`:

```ts
import { winnersToOverlay } from '@/lib/game-ui-view';

describe('winnersToOverlay', () => {
  const meta: PlayerMeta[] = [
    { player: 1, name: 'Ann', tier: 'Gold', skin: 'gold' },
    { player: 2, name: 'Bo', tier: 'Silver', skin: 'silver' },
  ];

  it('solo winner', () => {
    const r = winnersToOverlay([1], meta);
    expect(r.kind).toBe('solo');
    expect(r.winners).toEqual([
      { player: 1, name: 'Ann', tier: 'Gold', skin: 'gold', eloDelta: 20 },
    ]);
  });

  it('joint winners', () => {
    expect(winnersToOverlay([1, 2], meta).kind).toBe('joint');
  });

  it('no winner', () => {
    const r = winnersToOverlay([], meta);
    expect(r.kind).toBe('none');
    expect(r.winners).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- game-ui-view`
Expected: FAIL — `winnersToOverlay is not a function` / not exported.

- [ ] **Step 3: Implement**

Append to `lib/game-ui-view.ts`:

```ts
import type { GameOverKind, Winner } from '@/components/GameOverOverlay';

// Mirrors lib/multiplayer/adapt.winnersToGameOver but keyed off PlayerMeta[]
// instead of a multiplayer SlotMap, so local (hot-seat) pages can reuse it.
export function winnersToOverlay(
  winners: Player[],
  meta: PlayerMeta[],
): { kind: GameOverKind; winners: Winner[] } {
  const kind: GameOverKind =
    winners.length === 0 ? 'none' : winners.length === 1 ? 'solo' : 'joint';
  const list: Winner[] = winners.flatMap((p) => {
    const m = meta.find((x) => x.player === p);
    return m
      ? [{ player: p, name: m.name, tier: m.tier, skin: m.skin, eloDelta: 20 }]
      : [];
  });
  return { kind, winners: list };
}
```

(`import type { GameOverKind, Winner }` is type-only — does not pull the React component into the pure module at runtime.)

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- game-ui-view`
Expected: PASS (5 passing total).

- [ ] **Step 5: Commit**

```bash
git add lib/game-ui-view.ts lib/game-ui-view.test.ts
git commit -m "feat(view): winnersToOverlay helper for local game-over"
```

---

## Task 3: `GameView` presentational component

**Files:**
- Create: `components/GameView.tsx`

- [ ] **Step 1: Write the component**

Create `components/GameView.tsx`:

```tsx
// components/GameView.tsx
'use client';
import type { ReactNode } from 'react';
import { Board } from './Board';
import { PieceShape } from './PieceShape';
import { ArenaBadge } from './ArenaBadge';
import { TopBar } from './TopBar';
import {
  GameOverOverlay,
  type GameOverOverlayProps,
} from './GameOverOverlay';
import type { GameViewModel, GameViewPlayer } from '@/lib/game-ui-view';

interface Props {
  vm: GameViewModel;
  /** Seconds remaining on the current turn. */
  remaining: number;
  selected: [number, number] | null;
  legalTargets: [number, number][];
  lastMove?: [number, number][] | null;
  isYourTurn: boolean;
  onSquareClick: (r: number, c: number) => void;
  onResign: () => void;
  /** Non-null renders the end-of-game overlay. */
  gameOver?: GameOverOverlayProps | null;
  /** Transient message slot (e.g. multiplayer disconnect countdown). */
  banner?: ReactNode;
  roomCode?: string;
}

const clock = (s: number) =>
  `${Math.floor(Math.max(0, s) / 60)}:${String(Math.max(0, s) % 60).padStart(2, '0')}`;

function SidePanel({
  p,
  alignment,
}: {
  p: GameViewPlayer;
  alignment: 'left' | 'right';
}) {
  return (
    <div
      className={[
        'relative w-[240px] bg-[var(--hill-surface)] border-[1.5px] rounded-2xl p-5 flex flex-col gap-4',
        p.isActive
          ? 'border-[var(--hill-accent)] shadow-[0_0_28px_rgba(191,255,0,0.15)]'
          : 'border-[var(--hill-border)]',
        p.alive ? '' : 'opacity-40',
      ].join(' ')}
    >
      <div
        className={`absolute top-0 bottom-0 w-[3px] ${alignment === 'right' ? 'right-0' : 'left-0'}`}
        style={{ background: p.player === 1 ? 'var(--hill-text)' : '#1A1A1A' }}
      />
      <div className="flex items-center gap-3.5">
        <div className="w-[60px] h-[60px] rounded-xl bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[var(--hill-border)] flex items-center justify-center">
          <PieceShape player={p.player} size={42} skin={p.skin} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-bold whitespace-nowrap">{p.name}</span>
            {p.isYou && (
              <span className="text-[9px] font-extrabold text-[var(--hill-accent)] tracking-[0.1em]">
                YOU
              </span>
            )}
          </div>
          <div className="mt-1.5">
            <ArenaBadge tier={p.tier} />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1.5 px-3.5 py-3 bg-[var(--hill-surface2)] rounded-[10px] border border-[var(--hill-border)]">
        <div className="flex justify-between items-center">
          <span className="font-mono text-[10px] text-[var(--hill-muted)] tracking-[0.14em]">
            PIECES
          </span>
          <span className="font-mono text-[22px] font-extrabold text-[var(--hill-text)]">
            {p.pieceCount}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-mono text-[10px] text-[var(--hill-muted)] tracking-[0.14em]">
            STATUS
          </span>
          <span className="font-mono text-base font-bold text-[var(--hill-accent)]">
            {p.alive ? 'IN PLAY' : 'OUT'}
          </span>
        </div>
      </div>
      {p.isActive && (
        <div className="text-center font-mono text-[10px] font-bold text-[var(--hill-accent)] tracking-[0.2em]">
          ● ACTIVE TURN
        </div>
      )}
    </div>
  );
}

function HillPanelStrip({ players }: { players: GameViewPlayer[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-2.5 lg:gap-3 mb-4 lg:mb-5">
      {players.map((p) => (
        <div
          key={p.player}
          className={[
            'flex items-center gap-2.5 px-3.5 py-2 rounded-xl border-[1.5px] bg-[var(--hill-surface)]',
            p.isActive
              ? 'border-[var(--hill-accent)] shadow-[0_0_18px_rgba(191,255,0,0.14)]'
              : 'border-[var(--hill-border)]',
            p.alive ? '' : 'opacity-40',
          ].join(' ')}
        >
          <PieceShape player={p.player} size={26} skin={p.skin} />
          <div className="leading-tight">
            <div className="text-[13px] font-bold flex items-center gap-1.5">
              {p.name}
              {p.isYou && (
                <span className="text-[8px] font-extrabold text-[var(--hill-accent)] tracking-[0.1em]">
                  YOU
                </span>
              )}
            </div>
            <div className="font-mono text-[10px] text-[var(--hill-muted)] tracking-[0.12em]">
              {p.alive ? `${p.pieceCount} PIECES` : 'OUT'}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function GameView({
  vm,
  remaining,
  selected,
  legalTargets,
  lastMove = null,
  isYourTurn,
  onSquareClick,
  onResign,
  gameOver = null,
  banner,
  roomCode,
}: Props) {
  const is4P = vm.players.length > 2;
  const active = vm.players.find((p) => p.isActive) ?? vm.players[0];
  const modeLabel =
    vm.mode === 'classic-2p'
      ? 'CLASSIC · 8×8 · 2P'
      : vm.mode === 'hill-survival'
        ? 'HILL · SURVIVAL'
        : 'HILL · BLITZ';

  return (
    <>
      <TopBar
        code={roomCode}
        right={
          <button
            onClick={onResign}
            className="px-2.5 py-1.5 rounded-lg bg-[var(--hill-surface)] border border-[var(--hill-border)] text-[11px] text-[var(--hill-muted)] tracking-[0.08em] font-bold lg:hover:border-[var(--hill-accent)] transition"
          >
            RESIGN
          </button>
        }
      />

      <div className="mx-auto w-full max-w-[1280px] px-3 lg:px-12 pt-3 lg:pt-7 pb-10 lg:pb-12">
        <div className="hidden lg:flex items-center justify-between mb-4">
          <span className="font-mono text-[11px] text-[var(--hill-muted)] tracking-[0.14em]">
            {modeLabel}
          </span>
          <span className="font-mono text-[11px] text-[var(--hill-muted)] tracking-[0.14em]">
            ROUND {vm.round}
            {vm.maxRounds < 999 ? ` / ${vm.maxRounds}` : ''}
          </span>
        </div>

        {/* Turn-timer pill */}
        <div className="flex justify-center mt-3 lg:mt-0 mb-4 lg:mb-5">
          <div className="inline-flex items-center gap-2.5 lg:gap-3.5 px-3.5 lg:px-5 py-2 lg:py-3 pl-2.5 lg:pl-4 rounded-full bg-[var(--hill-surface)] border-[1.5px] border-[var(--hill-accent)] text-[13px] lg:text-base font-bold shadow-[0_0_18px_rgba(191,255,0,0.12)] lg:shadow-[0_0_24px_rgba(191,255,0,0.15)]">
            <PieceShape player={active.player} size={22} skin={active.skin} />
            <span>
              {isYourTurn ? 'YOUR TURN' : `${active.name.toUpperCase()}'S TURN`}
            </span>
            <span className="w-px h-4 bg-[var(--hill-borderHi)] hidden lg:inline-block" />
            <span
              className={`font-mono text-xs lg:text-base ${remaining <= 3 ? 'text-[var(--hill-danger)]' : 'text-[var(--hill-accent)]'}`}
            >
              {clock(remaining)}
            </span>
          </div>
        </div>

        {banner && (
          <div className="flex flex-col items-center gap-1 mb-3">{banner}</div>
        )}

        {is4P && <HillPanelStrip players={vm.players} />}

        <div className="lg:flex lg:items-center lg:justify-center lg:gap-9">
          {!is4P && (
            <div className="hidden lg:block">
              <SidePanel p={vm.players[0]} alignment="right" />
            </div>
          )}

          <div className="flex justify-center">
            <Board
              size={vm.size}
              pieces={vm.pieces}
              centerZone={vm.centerZone}
              selected={selected}
              highlighted={legalTargets}
              lastMove={lastMove}
              isYourTurn={isYourTurn}
              onSquareClick={onSquareClick}
            />
          </div>

          {!is4P && (
            <div className="hidden lg:block">
              <SidePanel p={vm.players[1]} alignment="left" />
            </div>
          )}
        </div>

        {!is4P && (
          <div className="lg:hidden mt-5 px-7 flex justify-between font-mono text-xs text-[var(--hill-muted)] tracking-[0.04em]">
            {vm.players.map((p, i) => (
              <div key={p.player} className="flex items-center gap-2">
                {i === 0 && <PieceShape player={p.player} size={16} skin={p.skin} />}
                <span className="text-[var(--hill-text)] font-bold">
                  {p.pieceCount}
                </span>
                {i === 1 && <PieceShape player={p.player} size={16} skin={p.skin} />}
              </div>
            ))}
          </div>
        )}
      </div>

      {gameOver && <GameOverOverlay {...gameOver} />}
    </>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS (no errors referencing `components/GameView.tsx`).

- [ ] **Step 3: Commit**

```bash
git add components/GameView.tsx
git commit -m "feat(ui): shared presentational GameView (2P + 4P layouts)"
```

---

## Task 4: Refactor multiplayer `/r/[roomId]` game view onto `GameView`

**Files:**
- Modify: `app/r/[roomId]/page.tsx` (the `GAME view` block only — lines ~382-434)

> Transport, forfeit, sync, presence, host-authority timer, and lobby logic are **untouched**. Only the rendered JSX of the playing branch changes.

- [ ] **Step 1: Add imports**

In `app/r/[roomId]/page.tsx`, add to the import block (near the other `@/components` / `@/lib` imports):

```ts
import { GameView } from '@/components/GameView';
import { toGameViewModel, type PlayerMeta } from '@/lib/game-ui-view';
```

Keep the existing `import { Board } from '@/components/Board';` for now (still used by nothing after this change — removed in Step 4).

- [ ] **Step 2: Replace the GAME view return block**

Find the block that starts with `// GAME view` and `if (state && room.status === 'playing') {` (around line 381) and replace the entire `if (...) { ... }` body's `return ( ... );` (the `<div className="flex min-h-screen flex-col items-center gap-4 ...">...</div>`) with:

```tsx
  // GAME view
  if (state && room.status === 'playing') {
    const go = winners ? winnersToGameOver(winners, slots) : null;
    const elapsed = Math.max(0, Math.floor((now - startedAtMs) / 1000));
    const dur = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')}`;

    const meta: PlayerMeta[] = (Object.keys(slots) as unknown as Player[])
      .map(Number)
      .filter((p): p is Player => !!slots[p as Player])
      .map((p) => ({
        player: p as Player,
        name: slots[p as Player]!.displayName,
        tier: slots[p as Player]!.tier,
        skin: slots[p as Player]!.skin,
        isYou: slots[p as Player]!.userId === user?.id,
      }));

    const vm = toGameViewModel(state, meta);
    const remaining = state.turnDeadline
      ? Math.max(0, Math.ceil((state.turnDeadline - now) / 1000))
      : 0;

    const dcBanner = Object.keys(disconnectedAt)
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
      });

    return (
      <GameView
        vm={vm}
        roomCode={roomId}
        remaining={remaining}
        selected={selected ? toTuple(selected) : null}
        legalTargets={legalMoves.map((m) => toTuple(m.to))}
        isYourTurn={canMove}
        onSquareClick={handleSquare}
        onResign={() => router.push('/')}
        banner={dcBanner.length ? dcBanner : undefined}
        gameOver={
          go
            ? {
                kind: go.kind,
                winners: go.winners,
                matchDuration: dur,
                roundCount: state.round,
                onPlayAgain: () => router.push('/r/new'),
                onShare: () => {
                  void navigator.clipboard.writeText(window.location.href);
                },
                onLobby: () => router.push('/'),
              }
            : null
        }
      />
    );
  }
```

- [ ] **Step 3: Remove the now-unused `cfg` local in that block**

The old block declared `const cfg = state.config;`. The replacement does not use it. Confirm no remaining reference to that `cfg` inside the GAME view branch (the LOBBY branch has its own separate `const cfg = PRESET[mode];` — leave that one).

- [ ] **Step 4: Remove the now-unused `Board` import**

If `Board` is no longer referenced anywhere in `app/r/[roomId]/page.tsx` after this change, delete `import { Board } from '@/components/Board';`. Verify with: `grep -n "Board" app/r/\[roomId\]/page.tsx` — expect only the `GameView` import line / none referencing `<Board`.

- [ ] **Step 5: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: PASS, no errors in `app/r/[roomId]/page.tsx`.

- [ ] **Step 6: Manual smoke (documented)**

Run: `npm run dev`, open `/r/new` (requires Supabase env — if unavailable, note "deferred to deploy verification"). Confirm: lobby renders, starting a game shows the new `GameView` chrome (TopBar RESIGN, timer pill, 4-player strip, board), a move works, game-over overlay appears. Record result in the task notes.

- [ ] **Step 7: Commit**

```bash
git add "app/r/[roomId]/page.tsx"
git commit -m "refactor(mp): render multiplayer game via shared GameView (no transport change)"
```

---

## Task 5: Classic 2P — fully playable hot-seat

**Files:**
- Overwrite: `app/play/classic/page.tsx`

- [ ] **Step 1: Replace the file entirely**

Overwrite `app/play/classic/page.tsx` with:

```tsx
// app/play/classic/page.tsx — fully playable local 2-player checkers.
'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { classic2P } from '@/lib/engine/presets';
import { applyMove, createInitialState } from '@/lib/engine/apply';
import { getLegalMoves } from '@/lib/engine/rules';
import { checkWinners } from '@/lib/engine/endgame';
import type { Coord, GameState } from '@/lib/engine/types';
import { GameView } from '@/components/GameView';
import {
  toGameViewModel,
  winnersToOverlay,
  type PlayerMeta,
} from '@/lib/game-ui-view';

const META: PlayerMeta[] = [
  { player: 1, name: 'White', tier: 'Bronze', skin: 'silver', isYou: true },
  { player: 2, name: 'Black', tier: 'Bronze', skin: 'gold' },
];

export default function ClassicPage() {
  const router = useRouter();
  const [state, setState] = useState<GameState>(() =>
    createInitialState(classic2P),
  );
  const [selected, setSelected] = useState<Coord | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const startedAt = useRef<number>(Date.now());

  const winners = useMemo(() => checkWinners(state), [state]);

  const legalMoves = useMemo(
    () => (selected && !winners ? getLegalMoves(state, selected) : []),
    [state, selected, winners],
  );
  const moveTo = (r: number, c: number) =>
    legalMoves.find((m) => m.to.row === r && m.to.col === c);

  // 4Hz clock for countdown + skip-on-expiry (10s/turn, no elimination).
  useEffect(() => {
    if (winners) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [winners]);

  useEffect(() => {
    if (winners) return;
    if (state.turnDeadline && now >= state.turnDeadline) {
      setState((s) => applyMove(s, { type: 'skip' }));
      setSelected(null);
    }
  }, [now, state, winners]);

  const handleSquare = useCallback(
    (r: number, c: number) => {
      if (winners) return;
      const m = moveTo(r, c);
      if (m) {
        const next = applyMove(state, m);
        setState(next);
        setSelected(next.mandatoryJumpFrom ?? null);
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
    [state, winners, legalMoves],
  );

  const reset = () => {
    setState(createInitialState(classic2P));
    setSelected(null);
    startedAt.current = Date.now();
    setNow(Date.now());
  };

  const vm = toGameViewModel(state, META);
  const remaining = state.turnDeadline
    ? Math.max(0, Math.ceil((state.turnDeadline - now) / 1000))
    : 0;
  const elapsed = Math.max(0, Math.floor((now - startedAt.current) / 1000));
  const dur = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')}`;
  const ov = winners ? winnersToOverlay(winners, META) : null;

  return (
    <GameView
      vm={vm}
      remaining={remaining}
      selected={selected ? [selected.row, selected.col] : null}
      legalTargets={legalMoves.map((m) => [m.to.row, m.to.col])}
      isYourTurn={!winners}
      onSquareClick={handleSquare}
      onResign={() => router.push('/')}
      gameOver={
        ov
          ? {
              kind: ov.kind,
              winners: ov.winners,
              matchDuration: dur,
              roundCount: state.round,
              onPlayAgain: reset,
              onShare: () => {
                void navigator.clipboard.writeText(window.location.href);
              },
              onLobby: () => router.push('/'),
            }
          : null
      }
    />
  );
}
```

- [ ] **Step 2: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: PASS, no errors in `app/play/classic/page.tsx`.

- [ ] **Step 3: Manual smoke**

Run: `npm run dev`, open `/play/classic`. Verify: pieces render on an 8×8 board, clicking a White piece selects it and shows legal targets, moving works, captures remove pieces, a multi-jump forces continued jumps, reaching the opposite edge kings (king glyph), capturing all opponent pieces shows the game-over overlay, "Play again" resets. Record result.

- [ ] **Step 4: Commit**

```bash
git add app/play/classic/page.tsx
git commit -m "feat(classic): fully playable 2P hot-seat via engine + GameView"
```

---

## Task 6: Hill hot-seat route + remove temp inline page

**Files:**
- Create: `app/play/hill/local/page.tsx`
- Delete: `app/play/hill/page.tsx`

- [ ] **Step 1: Create the local Hill route**

Create `app/play/hill/local/page.tsx`:

```tsx
// app/play/hill/local/page.tsx — local 4-player King of the Hill (hot-seat).
'use client';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { hillBlitz, hillSurvival } from '@/lib/engine/presets';
import { applyMove, createInitialState } from '@/lib/engine/apply';
import { getLegalMoves } from '@/lib/engine/rules';
import { checkWinners } from '@/lib/engine/endgame';
import type { Coord, GameState } from '@/lib/engine/types';
import { GameView } from '@/components/GameView';
import {
  toGameViewModel,
  winnersToOverlay,
  type PlayerMeta,
} from '@/lib/game-ui-view';

const META: PlayerMeta[] = [
  { player: 1, name: 'Player 1', tier: 'Bronze', skin: 'silver' },
  { player: 2, name: 'Player 2', tier: 'Bronze', skin: 'gold' },
  { player: 3, name: 'Player 3', tier: 'Bronze', skin: 'bronze' },
  { player: 4, name: 'Player 4', tier: 'Bronze', skin: 'master' },
];

function HillLocalInner() {
  const router = useRouter();
  const search = useSearchParams();
  const mode = search.get('mode') === 'survival' ? 'survival' : 'blitz';

  const [state, setState] = useState<GameState>(() =>
    createInitialState(mode === 'survival' ? hillSurvival : hillBlitz),
  );
  const [selected, setSelected] = useState<Coord | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const startedAt = useRef<number>(Date.now());

  const winners = useMemo(() => checkWinners(state), [state]);
  const legalMoves = useMemo(
    () => (selected && !winners ? getLegalMoves(state, selected) : []),
    [state, selected, winners],
  );
  const moveTo = (r: number, c: number) =>
    legalMoves.find((m) => m.to.row === r && m.to.col === c);

  useEffect(() => {
    if (winners) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [winners]);

  useEffect(() => {
    if (winners) return;
    if (state.turnDeadline && now >= state.turnDeadline) {
      setState((s) => applyMove(s, { type: 'skip' }));
      setSelected(null);
    }
  }, [now, state, winners]);

  const handleSquare = useCallback(
    (r: number, c: number) => {
      if (winners) return;
      const m = moveTo(r, c);
      if (m) {
        const next = applyMove(state, m);
        setState(next);
        setSelected(next.mandatoryJumpFrom ?? null);
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
    [state, winners, legalMoves],
  );

  const reset = () => {
    setState(createInitialState(mode === 'survival' ? hillSurvival : hillBlitz));
    setSelected(null);
    startedAt.current = Date.now();
    setNow(Date.now());
  };

  const vm = toGameViewModel(state, META);
  const remaining = state.turnDeadline
    ? Math.max(0, Math.ceil((state.turnDeadline - now) / 1000))
    : 0;
  const elapsed = Math.max(0, Math.floor((now - startedAt.current) / 1000));
  const dur = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')}`;
  const ov = winners ? winnersToOverlay(winners, META) : null;

  return (
    <GameView
      vm={vm}
      remaining={remaining}
      selected={selected ? [selected.row, selected.col] : null}
      legalTargets={legalMoves.map((m) => [m.to.row, m.to.col])}
      isYourTurn={!winners}
      onSquareClick={handleSquare}
      onResign={() => router.push('/')}
      gameOver={
        ov
          ? {
              kind: ov.kind,
              winners: ov.winners,
              matchDuration: dur,
              roundCount: state.round,
              onPlayAgain: reset,
              onShare: () => {
                void navigator.clipboard.writeText(window.location.href);
              },
              onLobby: () => router.push('/'),
            }
          : null
      }
    />
  );
}

export default function HillLocalPage() {
  return (
    <Suspense fallback={null}>
      <HillLocalInner />
    </Suspense>
  );
}
```

- [ ] **Step 2: Delete the temporary inline page**

Run: `git rm "app/play/hill/page.tsx"`

- [ ] **Step 3: Check for stale references to `/play/hill`**

Run: `grep -rn "play/hill'" app components lib && grep -rn '"/play/hill"' app components lib`
Expected: no references to the bare `/play/hill` route (only `/play/hill/mode`, `/play/hill/style`, `/play/hill/local`). If any bare reference exists, repoint it to `/play/hill/mode`.

- [ ] **Step 4: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: PASS.

- [ ] **Step 5: Manual smoke**

Run: `npm run dev`, open `/play/hill/local?mode=blitz` and `/play/hill/local?mode=survival`. Verify 10×10 board, 4-player strip, center HILL zone visible, moves work, elimination dims a panel, game-over overlay appears with correct kind. Record result.

- [ ] **Step 6: Commit**

```bash
git add app/play/hill/local/page.tsx
git commit -m "feat(hill): polished local 4P hot-seat; remove temp inline page"
```

---

## Task 7: Fix the create-room flow in `/play/hill/style`

**Files:**
- Modify: `app/play/hill/style/page.tsx`

- [ ] **Step 1: Add imports and state**

In `app/play/hill/style/page.tsx`, add to imports:

```ts
import { useState } from 'react';
import { createRoom } from '@/lib/db/rooms';
```

(`useState`, `useRouter`, `useSearchParams` are already imported — keep one `useState` import; do not duplicate. The file already imports `useState`; only add `createRoom`.)

Inside `PlayStyleInner`, add below the existing `const [selected, setSelected] = ...`:

```ts
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);
```

- [ ] **Step 2: Replace the CTA `onClick`**

Replace the `CTAButton`'s `onClick={() => router.push(`/r/ABCD?mode=${mode}&style=${selected}`)}` with:

```tsx
            disabled={busy}
            onClick={async () => {
              if (busy) return;
              if (selected === 'hotseat') {
                router.push(`/play/hill/local?mode=${mode}`);
                return;
              }
              setBusy(true);
              setErr(false);
              try {
                const { id } = await createRoom(
                  mode === 'survival' ? 'hill-survival' : 'hill-blitz',
                );
                router.replace(`/r/${id}`);
              } catch {
                setBusy(false);
                setErr(true);
              }
            }}
```

And change the button label expression to reflect the busy state:

```tsx
            {busy
              ? 'Creating room…'
              : selected === 'multi'
                ? 'Create room  →'
                : 'Start hot-seat  →'}
```

- [ ] **Step 3: Add an inline error line**

Directly after the `CTAButton` closing tag (still inside the sticky CTA wrapper `div`), add:

```tsx
          {err && (
            <p className="mt-2 text-center text-xs text-[var(--hill-danger)]">
              Could not create a room. Tap to try again.
            </p>
          )}
```

- [ ] **Step 4: Confirm `CTAButton` accepts `disabled`**

Run: `grep -n "disabled" components/CTAButton.tsx`
- If `disabled` is a supported prop, done.
- If NOT supported: remove the `disabled={busy}` line from Step 2 (the `if (busy) return;` guard already prevents double-submit) and proceed.

- [ ] **Step 5: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: PASS.

- [ ] **Step 6: Manual smoke**

Run: `npm run dev`. From `/` click "Create Hill Room" → choose mode → on style page choose "Hot-seat" → lands on `/play/hill/local?mode=…` and a game starts. Back, choose "Multiplayer" → button shows "Creating room…" then navigates to `/r/<realcode>` (requires Supabase env; if unavailable record "deferred to deploy verification" and confirm no `/r/ABCD` string remains: `grep -rn "ABCD" app`).

- [ ] **Step 7: Commit**

```bash
git add app/play/hill/style/page.tsx
git commit -m "fix(flow): style page creates a real room (multi) / starts hot-seat; kill /r/ABCD"
```

---

## Task 8: Compositor-friendly piece animation in `Board.tsx`

**Files:**
- Modify: `components/Board.tsx` (the `pieces.map(...)` wrapper `<div>`, ~lines 109-131)

- [ ] **Step 1: Replace the piece wrapper div**

In `components/Board.tsx`, replace the piece-wrapper `<div>` (currently `className="absolute transition-[top,left] duration-200 ease-out"` with inline `top`/`left`) with a `transform`-positioned version:

```tsx
        return (
          <div
            key={i}
            className="absolute left-0 top-0 transition-transform duration-150 ease-out"
            style={{
              transform: `translate(${p.pos[1] * cs + (cs - cs * 0.7) / 2}px, ${p.pos[0] * cs + (cs - cs * 0.7) / 2}px)`,
              width: cs * 0.7,
              height: cs * 0.7,
            }}
          >
```

(Keep the inner `<PieceShape ... />` and the closing `</div>` exactly as they are. Only the wrapper `div`'s `className` and `style` change: position via `transform: translate(x, y)` anchored at `left:0; top:0`, transition `transform` at `150ms ease-out`.)

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Manual smoke**

Run: `npm run dev`, open `/play/classic`, make a move. Verify the piece glides to its new square (~150ms) and lands in the correct cell (positions match the old behavior — no offset regression).

- [ ] **Step 4: Commit**

```bash
git add components/Board.tsx
git commit -m "perf(board): animate pieces via transform 150ms ease-out"
```

---

## Task 9: Brand icon `app/icon.tsx` (2×2 grid) + drop default favicon

**Files:**
- Create: `app/icon.tsx`
- Delete: `app/favicon.ico`

- [ ] **Step 1: Create the icon route**

Create `app/icon.tsx`:

```tsx
import { ImageResponse } from 'next/og';

export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

// P1 circle-red, P2 square-blue, P3 triangle-green, P4 hex-amber — flattened
// to four solid quadrants for a crisp favicon.
export default function Icon() {
  const cells = ['#E5484D', '#4C7DF7', '#46C56B', '#F5A623'];
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexWrap: 'wrap',
          background: '#0A0A0A',
        }}
      >
        {cells.map((c) => (
          <div
            key={c}
            style={{ width: '50%', height: '50%', background: c }}
          />
        ))}
      </div>
    ),
    { ...size },
  );
}
```

- [ ] **Step 2: Delete the stale default favicon**

Run: `git rm app/favicon.ico`
(Next will serve `app/icon.tsx` as the favicon.)

- [ ] **Step 3: Build check (icon route compiles via next/og)**

Run: `npx tsc --noEmit`
Expected: PASS. (Full render is validated in Task 12's build.)

- [ ] **Step 4: Commit**

```bash
git add app/icon.tsx
git commit -m "feat(brand): 2x2 player-color app icon; drop default favicon"
```

---

## Task 10: Open Graph / Twitter image + layout metadata

**Files:**
- Create: `app/opengraph-image.tsx`
- Create: `app/twitter-image.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create the OG image**

Create `app/opengraph-image.tsx`:

```tsx
import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'HILL — King of the Board';

export default function OG() {
  const cells = ['#E5484D', '#4C7DF7', '#46C56B', '#F5A623'];
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 96px',
          background: '#0A0A0A',
          color: '#FAFAFA',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 40,
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', width: 180, height: 180 }}>
            {cells.map((c) => (
              <div
                key={c}
                style={{ width: '50%', height: '50%', background: c }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 132, fontWeight: 800, letterSpacing: -4 }}>
              HILL
            </div>
            <div style={{ fontSize: 30, color: '#BFFF00', fontWeight: 700 }}>
              KING · OF · THE · BOARD
            </div>
          </div>
        </div>
        <div style={{ fontSize: 34, color: '#A3A3A3', marginTop: 48 }}>
          Blitz checkers with a 4-player King of the Hill mode.
        </div>
      </div>
    ),
    { ...size },
  );
}
```

- [ ] **Step 2: Create the Twitter image (re-export)**

Create `app/twitter-image.tsx`:

```tsx
export { default, size, contentType, alt } from './opengraph-image';
```

- [ ] **Step 3: Update `app/layout.tsx` metadata**

In `app/layout.tsx`, replace the existing `export const metadata: Metadata = { ... };` with:

```ts
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  ),
  title: 'HILL — King of the Board',
  description:
    'Blitz checkers with a 4-player King of the Hill mode. 4 players. 3 minutes. One hill.',
  openGraph: {
    title: 'HILL — King of the Board',
    description:
      'Blitz checkers with a 4-player King of the Hill mode.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HILL — King of the Board',
    description:
      'Blitz checkers with a 4-player King of the Hill mode.',
  },
};
```

(Next auto-attaches `opengraph-image`/`twitter-image`/`icon` routes; `metadataBase` makes the absolute URLs resolve. `NEXT_PUBLIC_SITE_URL` is documented in Task 11.)

- [ ] **Step 4: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/opengraph-image.tsx app/twitter-image.tsx app/layout.tsx
git commit -m "feat(brand): 1200x630 OG/Twitter image + social metadata"
```

---

## Task 11: README + `.env.example`

**Files:**
- Overwrite: `README.md`
- Create: `.env.example`

- [ ] **Step 1: Create `.env.example`**

Create `.env.example`:

```bash
# Supabase — client-safe (exposed to the browser)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase — SERVER ONLY. Used by app/api/rooms/route.ts to create rooms.
# NEVER prefix this with NEXT_PUBLIC_ and never expose it to the client.
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Absolute site origin for Open Graph URLs (no trailing slash).
NEXT_PUBLIC_SITE_URL=https://your-domain.example
```

- [ ] **Step 2: Overwrite `README.md`**

Overwrite `README.md`:

```markdown
# HILL — King of the Board

Browser-native blitz checkers with two modes:

- **Classic 2P** — standard checkers on an 8×8 board, hot-seat on one device.
- **King of the Hill 4P** — a 10×10 mode where four players race from the
  corners to a central 2×2 "Hill", king by entering the center, and win by
  holding the hill when the round cap hits — or by being the last survivor.

## Modes & rules

- **classic-2p** — 8×8, 2 players, capture all opponent pieces to win. Kings
  on the opposite edge.
- **hill-blitz** — 10×10, 4 players (5 pieces each from each corner), 2×2
  center zone, king on center entry, max 7 rounds. Multiple winners possible:
  anyone with a piece in the center at the cap, or the last survivor.
- **hill-survival** — same as blitz but max 20 rounds; only the last survivor
  wins (if the cap is reached, anyone in the center wins, else draw).
- A **round** = one full cycle of all currently-alive players moving once.
- **Turn timer**: 10s per turn. Expiry skips the turn (no elimination).
- **Elimination** only when a player has zero pieces.

Multiplayer is trust-the-client for MVP: each client runs the pure engine
locally and broadcasts moves over Supabase Realtime.

## Stack

Next.js 14 (App Router), TypeScript (strict), Tailwind CSS, Supabase
(anonymous auth + Postgres + Realtime), Vitest. Deploys on Vercel.

## Architecture

- `lib/engine/*` — pure TypeScript rules engine. No React, no Supabase.
  All rules live in `lib/engine/rules.ts` + `apply.ts`. Both modes run off
  `GameConfig` presets in `lib/engine/presets.ts`.
- `lib/game-ui-view.ts` — pure mapper: engine `GameState` → `GameView` props.
- `components/GameView.tsx` — one presentational game screen used by Classic
  hot-seat, Hill hot-seat, and the multiplayer room.
- `app/r/[roomId]` — multiplayer room (lobby + live game via Supabase).

## Local development

```bash
npm install
cp .env.example .env.local   # fill in your Supabase keys
npm run dev                  # http://localhost:3000
```

Scripts: `npm run dev`, `npm run build`, `npm start`, `npm run lint`,
`npm test` (Vitest).

### Supabase setup

Create a Supabase project, then apply the schema described in
`docs/phase-3-supabase-setup.md` and `docs/phase-4-multiplayer-setup.md`
(the `rooms` and `games` tables + Realtime). Put the URL and keys in
`.env.local` (see `.env.example`).

## Deploy (Vercel)

1. Push this repo to GitHub and "Import Project" in Vercel.
2. In Vercel → Project → Settings → Environment Variables, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` — **server-side only**, never `NEXT_PUBLIC_`.
   - `NEXT_PUBLIC_SITE_URL` — your production origin (for OG image URLs).
3. Ensure the Supabase project schema (above) is applied and Realtime is on.
4. Build command `next build`, output auto-detected. Deploy.
5. After first deploy, set `NEXT_PUBLIC_SITE_URL` to the real domain and
   redeploy so social/OG previews resolve absolute URLs.

## Testing

`npm test` runs the engine + view-model unit suites. Multiplayer realtime is
verified manually against a live Supabase project (see Supabase setup).
```

- [ ] **Step 3: Commit**

```bash
git add README.md .env.example
git commit -m "docs: real README + .env.example with deploy + env-var guide"
```

---

## Task 12: Production build verification + fix breakers

**Files:**
- Modify: any file the build flags (only if it errors)

- [ ] **Step 1: Run the production build**

Run: `npm run build`
Expected: build completes; `app/icon.tsx`, `app/opengraph-image.tsx`,
`app/twitter-image.tsx` compile as image routes; no type/lint errors.

- [ ] **Step 2: If the build fails**

Read the first error, fix it in the named file (typical causes: an unused
import left after Task 4's `Board` removal; a `CTAButton` prop mismatch from
Task 7; a `next/og` edge-runtime constraint). Re-run `npm run build`. Repeat
until green. Do **not** suppress errors with `// @ts-ignore` or `eslint-disable`
unless the rule is genuinely inapplicable and you note why in the commit.

- [ ] **Step 3: Run the full test suite**

Run: `npm test`
Expected: all suites pass (engine `apply/endgame/forfeit/rules/hill` +
`game-ui-view`).

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: production build green + full test suite passing"
```

(If Step 1 passed with no changes needed, skip the commit and note "build was
already green".)

---

## Self-Review

**Spec coverage:**
- Shared `GameView` + pure mapper → Tasks 1–3. ✓
- Prove on multiplayer, zero transport change → Task 4. ✓
- Classic 2P fully playable hot-seat → Task 5. ✓
- Hill hot-seat + delete temp inline page → Task 6. ✓
- Fix create-room flow / kill `/r/ABCD` / landing keeps mode→style → Task 7
  (landing already routes to `/play/hill/mode`; unchanged by design). ✓
- `app/icon.tsx` 2×2, drop favicon → Task 9. ✓
- OG/Twitter image + metadata → Task 10. ✓
- Board `transform` 150ms ease-out → Task 8. ✓
- README + `.env.example` + deploy section (incl. `SUPABASE_SERVICE_ROLE_KEY`
  server-only) → Task 11. ✓
- Build verification, engine suite green, view-model unit test → Tasks 1–2, 12. ✓
- Out of scope (no server validation, no real auth, no actual deploy) — honored;
  no task performs a deploy. ✓

**Placeholder scan:** No TBD/TODO; every code step shows complete code; commands
have expected output. ✓

**Type consistency:** `PlayerMeta` / `GameViewModel` / `GameViewPlayer` defined
in Task 1 and consumed identically in Tasks 3–6. `winnersToOverlay` signature
defined in Task 2, used in Tasks 5–6. `GameView` `Props` defined in Task 3 match
every call site (Tasks 4, 5, 6). `toGameViewModel(state, meta)` arg order
consistent everywhere. ✓

**Risk notes:** Task 4 changes only the multiplayer render block (transport
untouched), explicitly checked in Steps 3–4 and smoke Step 6. Realtime e2e
deferred to manual/deploy verification — called out, not silently skipped.
```
