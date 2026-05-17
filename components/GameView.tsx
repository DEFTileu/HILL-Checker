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
