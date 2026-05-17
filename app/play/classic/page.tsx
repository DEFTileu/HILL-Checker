// app/play/classic/page.tsx
'use client';
import { useState } from 'react';
import { TopBar } from '@/components/TopBar';
import { Board } from '@/components/Board';
import { PieceShape } from '@/components/PieceShape';
import { PlayerSlot } from '@/components/PlayerSlot';
import { ArenaBadge } from '@/components/ArenaBadge';
import type { Piece } from '@/lib/pieces';

const PIECES: Piece[] = [
  { player: 1, kind: 'pawn', pos: [5, 0] }, { player: 1, kind: 'pawn', pos: [5, 2] },
  { player: 1, kind: 'pawn', pos: [6, 1] }, { player: 1, kind: 'pawn', pos: [6, 3] },
  { player: 1, kind: 'pawn', pos: [6, 5] }, { player: 1, kind: 'pawn', pos: [6, 7] },
  { player: 1, kind: 'pawn', pos: [7, 0] }, { player: 1, kind: 'pawn', pos: [7, 2] },
  { player: 1, kind: 'king', pos: [4, 5] },
  { player: 2, kind: 'pawn', pos: [0, 1] }, { player: 2, kind: 'pawn', pos: [0, 3] },
  { player: 2, kind: 'pawn', pos: [0, 5] }, { player: 2, kind: 'pawn', pos: [1, 0] },
  { player: 2, kind: 'pawn', pos: [1, 4] }, { player: 2, kind: 'pawn', pos: [1, 6] },
  { player: 2, kind: 'pawn', pos: [2, 3] }, { player: 2, kind: 'pawn', pos: [3, 4] },
];

export default function ClassicPage() {
  const [size] = useState<8>(8);

  return (
    <>
      <TopBar
        right={
          <button className="px-2.5 py-1.5 rounded-lg bg-[var(--hill-surface)] border border-[var(--hill-border)] text-[11px] text-[var(--hill-muted)] tracking-[0.08em] font-bold lg:hover:border-[var(--hill-accent)] transition">
            RESIGN
          </button>
        }
      />

      <div className="mx-auto w-full max-w-[1280px] px-3 lg:px-12 pt-3 lg:pt-7 pb-10 lg:pb-12">
        {/* Top status bar */}
        <div className="hidden lg:flex items-center justify-between mb-4">
          <button className="text-[13px] text-[var(--hill-muted)] hover:text-[var(--hill-text)] tracking-[0.04em]">← Back to menu</button>
          <span className="font-mono text-[11px] text-[var(--hill-muted)] tracking-[0.14em]">CLASSIC · 8×8 · 2P</span>
        </div>

        {/* Turn indicator above board */}
        <div className="flex justify-center mt-3 lg:mt-0 mb-4 lg:mb-5">
          <div className="inline-flex items-center gap-2.5 lg:gap-3.5 px-3.5 lg:px-5 py-2 lg:py-3 pl-2.5 lg:pl-4 rounded-full bg-[var(--hill-surface)] border-[1.5px] border-[var(--hill-accent)] text-[13px] lg:text-base font-bold shadow-[0_0_18px_rgba(191,255,0,0.12)] lg:shadow-[0_0_24px_rgba(191,255,0,0.15)]">
            <PieceShape player={1} size={22} skin="silver"/>
            <span>WHITE&apos;S TURN</span>
            <span className="w-px h-4 bg-[var(--hill-borderHi)] hidden lg:inline-block"/>
            <span className="font-mono text-[var(--hill-accent)] text-xs lg:text-base">0:07</span>
          </div>
        </div>

        {/* Board with side panels on desktop */}
        <div className="lg:flex lg:items-center lg:justify-center lg:gap-9">
          {/* Desktop P1 panel */}
          <div className="hidden lg:block">
            <ClassicSidePanel player={1} name="Aida K." tier="Gold" you isActive captured={3} pieces={9} skin="silver" alignment="right"/>
          </div>

          <div className="flex justify-center">
            <Board
              size={size}
              pieces={PIECES}
              cellSize={typeof window !== 'undefined' && window.innerWidth >= 1024 ? 66 : 41}
              skinForPlayer={{ 1: 'silver', 2: 'gold' }}
              selected={[4, 5]}
              highlighted={[[3, 4], [3, 6], [2, 3], [2, 7]]}
              lastMove={[[3, 4], [4, 5]]}
              ownPlayer={1}
              isYourTurn={true}
            />
          </div>

          <div className="hidden lg:block">
            <ClassicSidePanel player={2} name="Marcus J." tier="Gold" captured={4} pieces={8} skin="gold" alignment="left"/>
          </div>
        </div>

        {/* Mobile score row */}
        <div className="lg:hidden mt-5 px-7 flex justify-between font-mono text-xs text-[var(--hill-muted)] tracking-[0.04em]">
          <div className="flex items-center gap-2">
            <PieceShape player={1} size={16} skin="silver"/>
            <span className="text-[var(--hill-text)] font-bold">9</span> · captured 3
          </div>
          <div className="flex items-center gap-2">
            captured 4 · <span className="text-[var(--hill-text)] font-bold">8</span>
            <PieceShape player={2} size={16} skin="gold"/>
          </div>
        </div>

        {/* Desktop move history strip */}
        <div className="hidden lg:flex justify-center mt-7">
          <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-[var(--hill-surface)] border border-[var(--hill-border)] font-mono text-xs text-[var(--hill-muted)] tracking-[0.06em]">
            <span className="text-[var(--hill-dim)]">MOVES</span>
            <span className="w-px h-3.5 bg-[var(--hill-border)]"/>
            {['1. c3-d4', 'd6-c5', '2. e3-f4', 'b6-a5', '3. f4×e5', '— ←'].map((m, i) => (
              <span key={i} className={i === 5 ? 'text-[var(--hill-accent)] font-bold' : 'text-[var(--hill-text)] font-medium'}>{m}</span>
            ))}
          </div>
        </div>

        {/* Mobile-only: ensure PlayerSlot is referenced once so tree-shaking keeps it; remove if not used. */}
        <div className="hidden">
          <PlayerSlot player={1} name="Aida" tier="Gold" skin="silver"/>
          <ArenaBadge tier="Gold"/>
        </div>
      </div>
    </>
  );
}

interface SidePanelProps {
  player: 1 | 2;
  name: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Master' | 'Champion';
  skin: 'bronze' | 'silver' | 'gold' | 'master' | 'champion';
  you?: boolean;
  isActive?: boolean;
  captured: number;
  pieces: number;
  alignment: 'left' | 'right';
}

function ClassicSidePanel({ player, name, tier, skin, you, isActive, captured, pieces, alignment }: SidePanelProps) {
  return (
    <div
      className={[
        'relative w-[240px] bg-[var(--hill-surface)] border-[1.5px] rounded-2xl p-5 flex flex-col gap-4',
        isActive
          ? 'border-[var(--hill-accent)] shadow-[0_0_28px_rgba(191,255,0,0.15)]'
          : 'border-[var(--hill-border)]',
      ].join(' ')}
    >
      <div
        className={`absolute top-0 bottom-0 w-[3px] ${alignment === 'right' ? 'right-0' : 'left-0'}`}
        style={{ background: player === 1 ? 'var(--hill-text)' : '#1A1A1A' }}
      />
      <div className="flex items-center gap-3.5">
        <div className="w-[60px] h-[60px] rounded-xl bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[var(--hill-border)] flex items-center justify-center">
          <PieceShape player={player} size={42} skin={skin}/>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-bold whitespace-nowrap">{name}</span>
            {you && <span className="text-[9px] font-extrabold text-[var(--hill-accent)] tracking-[0.1em]">YOU</span>}
          </div>
          <div className="mt-1.5"><ArenaBadge tier={tier}/></div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 px-3.5 py-3 bg-[var(--hill-surface2)] rounded-[10px] border border-[var(--hill-border)]">
        <div className="flex justify-between items-center">
          <span className="font-mono text-[10px] text-[var(--hill-muted)] tracking-[0.14em]">PIECES</span>
          <span className="font-mono text-[22px] font-extrabold text-[var(--hill-text)]">{pieces}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-mono text-[10px] text-[var(--hill-muted)] tracking-[0.14em]">CAPTURED</span>
          <span className="font-mono text-base font-bold text-[var(--hill-accent)]">{captured}</span>
        </div>
      </div>

      {isActive && (
        <div className="text-center font-mono text-[10px] font-bold text-[var(--hill-accent)] tracking-[0.2em]">
          ● ACTIVE TURN
        </div>
      )}
    </div>
  );
}
