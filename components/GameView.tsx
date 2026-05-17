// components/GameView.tsx
'use client';
import type { ReactNode } from 'react';
import { Board } from './Board';
import { PieceShape } from './PieceShape';
import { PlayerSlot } from './PlayerSlot';
import {
  PlayerPanelDesktop,
  type DesktopPanelPlayer,
} from './PlayerPanelDesktop';
import { TopBar } from './TopBar';
import {
  GameOverOverlay,
  type GameOverOverlayProps,
} from './GameOverOverlay';
import { TURN_SECONDS } from '@/lib/engine/apply';
import type { GameViewModel, GameViewPlayer } from '@/lib/game-ui-view';
import { HILL, type PlayerNum } from '@/lib/tokens';

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
  /**
   * 'hot-seat' = both players share one device, so no single side is "you" —
   * the YOU label is suppressed (the ACTIVE TURN badge already tracks the
   * current player). 'multiplayer' keeps YOU to identify the human's slot.
   */
  mode?: 'hot-seat' | 'multiplayer';
  /**
   * Local player's seat. Rotates the board so this player's pieces sit at
   * the bottom of their own view. Omit for hot-seat (no rotation — both
   * players share one screen). Game state stays canonical.
   */
  localPlayer?: PlayerNum;
  /**
   * Hot-seat only: on DESKTOP (lg+), spin the board 180° while it's
   * player 2's turn so each player sees their own pieces at the bottom of
   * the shared screen. Mobile is left unrotated (too jarring on a small
   * screen). Coords stay canonical — this is a pure CSS transform, and the
   * browser rotates the pointer hit-region with the pixels, so clicks land
   * correctly without any manual coordinate conversion.
   */
  rotateForActivePlayerDesktop?: boolean;
}

const clock = (s: number) =>
  `${Math.floor(Math.max(0, s) / 60)}:${String(Math.max(0, s) % 60).padStart(2, '0')}`;

/** GameViewPlayer -> the richer desktop side-rail panel shape. */
function toDesktopPanel(
  p: GameViewPlayer,
  remaining: number,
  secondsTotal: number,
  hideYou: boolean,
): DesktopPanelPlayer {
  return {
    player: p.player,
    name: p.name,
    tier: p.tier,
    skin: p.skin,
    you: hideYou ? false : p.isYou,
    isActive: p.isActive,
    secondsLeft: p.isActive ? Math.max(0, remaining) : undefined,
    secondsTotal,
    eliminated: !p.alive,
    alivePieces: p.pieceCount,
    disconnectSecondsLeft: p.disconnectSecondsLeft,
  };
}

/** 2P classic desktop side panel (kept from the original layout). */
function SidePanel({
  p,
  alignment,
  hideYou = false,
}: {
  p: GameViewPlayer;
  alignment: 'left' | 'right';
  hideYou?: boolean;
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
        style={{ background: [HILL.p1, HILL.p2, HILL.p3, HILL.p4][p.player - 1] }}
      />
      <div className="flex items-center gap-3.5">
        <div className="w-[60px] h-[60px] rounded-xl bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[var(--hill-border)] flex items-center justify-center">
          <PieceShape player={p.player} size={42} skin={p.skin} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-bold whitespace-nowrap">{p.name}</span>
            {p.isYou && !hideYou && (
              <span className="text-[9px] font-extrabold text-[var(--hill-accent)] tracking-[0.1em]">
                YOU
              </span>
            )}
          </div>
          <div className="mt-1.5 font-mono text-[11px] text-[var(--hill-muted)] tracking-[0.12em]">
            {p.alive ? `${p.pieceCount} PIECES` : 'OUT'}
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
  mode = 'multiplayer',
  localPlayer,
  rotateForActivePlayerDesktop = false,
}: Props) {
  const hideYou = mode === 'hot-seat';
  const is4P = vm.players.length > 2;
  const active = vm.players.find((p) => p.isActive) ?? vm.players[0];
  const modeLabel =
    vm.mode === 'classic-2p'
      ? 'CLASSIC · 8×8 · 2P'
      : vm.mode === 'hill-survival'
        ? 'HILL · SURVIVAL'
        : 'HILL · BLITZ';

  // One turn timeout for every mode (see TURN_MS); ring denominator matches it.
  const secondsTotal = TURN_SECONDS;

  // Responsive board cell size: bigger on desktop, mobile-safe below lg.
  // Mirrors the Claude-Design export (hill 56/33, classic 66/41).
  const isDesktop =
    typeof window !== 'undefined' && window.innerWidth >= 1024;
  const cellSize = isDesktop
    ? vm.size === 10
      ? 56
      : 66
    : vm.size === 10
      ? 33
      : 41;

  // 4P "King of the Hill" seats are corner-based: P1 (top-left) + P4
  // (bottom-left) flank the board on the left; P2 (top-right) + P3
  // (bottom-right) on the right — matching the board geometry from
  // HILL_START. Filtering (not slicing) keeps this correct regardless of
  // vm.players ordering, and degrades sanely for a 3-player game.
  const leftRail = vm.players.filter((p) => p.player === 1 || p.player === 4);
  const rightRail = vm.players.filter((p) => p.player === 2 || p.player === 3);

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

        {/* Board flanked by panels.
            2P  → SidePanel left/right on desktop, score row on mobile.
            4P  → PlayerPanelDesktop rails on desktop, 2×2 PlayerSlot on mobile. */}
        <div className="lg:flex lg:items-start lg:justify-center lg:gap-7">
          {/* Desktop LEFT rail */}
          {is4P ? (
            <div className="hidden lg:flex lg:flex-col lg:gap-3.5">
              {leftRail.map((p) => (
                <PlayerPanelDesktop
                  key={p.player}
                  player={toDesktopPanel(p, remaining, secondsTotal, hideYou)}
                  side="left"
                />
              ))}
            </div>
          ) : (
            <div className="hidden lg:block">
              {/* Left of the board → stripe on the OUTER (left) edge. */}
              <SidePanel p={vm.players[0]} alignment="left" hideYou={hideYou} />
            </div>
          )}

          <div className="flex justify-center lg:items-center">
            {/* Hot-seat desktop: spin to the active player's perspective.
                lg:rotate-180 keeps mobile unrotated. The 180° here pairs
                with the lg:rotate-180 counter on the king ✦ inside
                PieceShape so crowns stay upright. */}
            <div
              className={`transition-transform duration-500 ease-in-out ${
                rotateForActivePlayerDesktop && active.player === 2
                  ? 'lg:rotate-180'
                  : ''
              }`}
            >
              <Board
                size={vm.size}
                pieces={vm.pieces}
                centerZone={vm.centerZone}
                cellSize={cellSize}
                selected={selected}
                highlighted={legalTargets}
                lastMove={lastMove}
                isYourTurn={isYourTurn}
                localPlayer={localPlayer}
                boardRotated180={
                  rotateForActivePlayerDesktop && active.player === 2
                }
                onSquareClick={onSquareClick}
              />
            </div>
          </div>

          {/* Desktop RIGHT rail */}
          {is4P ? (
            <div className="hidden lg:flex lg:flex-col lg:gap-3.5">
              {rightRail.map((p) => (
                <PlayerPanelDesktop
                  key={p.player}
                  player={toDesktopPanel(p, remaining, secondsTotal, hideYou)}
                  side="right"
                />
              ))}
            </div>
          ) : (
            <div className="hidden lg:block">
              {/* Right of the board → stripe on the OUTER (right) edge. */}
              <SidePanel p={vm.players[1]} alignment="right" hideYou={hideYou} />
            </div>
          )}
        </div>

        {/* MOBILE 4P — 2×2 compact player grid */}
        {is4P && (
          <div className="lg:hidden px-1 mt-3">
            <div className="grid grid-cols-2 gap-1.5">
              {vm.players.map((p) => (
                <PlayerSlot
                  key={p.player}
                  player={p.player}
                  name={p.name}
                  tier={p.tier}
                  skin={p.skin}
                  you={hideYou ? false : p.isYou}
                  isActive={p.isActive}
                  secondsLeft={p.isActive ? Math.max(0, remaining) : undefined}
                  secondsTotal={secondsTotal}
                  eliminated={!p.alive}
                  disconnectSecondsLeft={p.disconnectSecondsLeft}
                  compact
                />
              ))}
            </div>
          </div>
        )}

        {/* MOBILE 2P — score row */}
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
