// components/Board.tsx
'use client';
import { Square } from './Square';
import { PieceShape } from './PieceShape';
import { HILL, type PlayerNum } from '@/lib/tokens';
import type { Piece } from '@/lib/pieces';
import type { SkinId } from '@/lib/skins';

interface Props {
  size?: 8 | 10;
  pieces?: Piece[];
  centerZone?: [number, number][];
  highlighted?: [number, number][];
  selected?: [number, number] | null;
  lastMove?: [number, number][] | null;
  cellSize?: number | null;
  skinForPlayer?: Partial<Record<PlayerNum, SkinId>>;
  /** When set, own pieces get hover:scale and cursor-pointer. */
  isYourTurn?: boolean;
  ownPlayer?: PlayerNum;
  onSquareClick?: (r: number, c: number) => void;
}

export function Board({
  size = 8, pieces = [], centerZone = [], highlighted = [],
  selected = null, lastMove = null, cellSize = null,
  skinForPlayer = {}, isYourTurn = false, ownPlayer,
  onSquareClick,
}: Props) {
  const cs = cellSize ?? (size === 10 ? 33 : 41);
  const total = size * cs;
  const isHi = (r: number, c: number) => highlighted.some(([a, b]) => a === r && b === c);
  const isLast = (r: number, c: number) => lastMove?.some(([a, b]) => a === r && b === c) ?? false;

  return (
    <div
      className="relative bg-[var(--hill-surface)] rounded-md overflow-hidden"
      style={{
        width: total, height: total,
        boxShadow: `0 0 0 1px ${HILL.borderHi}, 0 20px 40px rgba(0,0,0,0.5), 0 0 0 6px ${HILL.surface}`,
      }}
    >
      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${size}, ${cs}px)`, gridTemplateRows: `repeat(${size}, ${cs}px)` }}
      >
        {Array.from({ length: size * size }).map((_, i) => {
          const r = Math.floor(i / size);
          const c = i % size;
          const dark = (r + c) % 2 === 1;
          return (
            <Square
              key={i}
              dark={dark}
              isLegalTarget={isHi(r, c)}
              isLastMove={isLast(r, c)}
              onClick={onSquareClick ? () => onSquareClick(r, c) : undefined}
            />
          );
        })}
      </div>

      {centerZone.length > 0 && (() => {
        const rs = centerZone.map(p => p[0]);
        const csx = centerZone.map(p => p[1]);
        const top = Math.min(...rs) * cs;
        const left = Math.min(...csx) * cs;
        const h = (Math.max(...rs) - Math.min(...rs) + 1) * cs;
        const w = (Math.max(...csx) - Math.min(...csx) + 1) * cs;
        return (
          <div
            className="absolute pointer-events-none rounded-sm border-[1.5px] border-[var(--hill-accent)] animate-[hill-glow_2.4s_ease-in-out_infinite]"
            style={{
              top, left, width: w, height: h,
              background: 'linear-gradient(135deg, rgba(191,255,0,0.06), rgba(191,255,0,0.02))',
            }}
          >
            <div className="absolute top-[3px] left-[5px] font-mono text-[8px] font-bold text-[var(--hill-accent)] tracking-[0.12em] opacity-90">
              HILL
            </div>
          </div>
        );
      })()}

      {highlighted.map(([r, c], i) => (
        <div
          key={`h${i}`}
          className="absolute rounded-full pointer-events-none bg-[var(--hill-accent)]"
          style={{
            top: r * cs + cs * 0.35, left: c * cs + cs * 0.35,
            width: cs * 0.3, height: cs * 0.3,
            opacity: 0.6,
            boxShadow: `0 0 8px ${HILL.accent}`,
          }}
        />
      ))}

      {selected && (
        <div
          className="absolute pointer-events-none"
          style={{
            top: selected[0] * cs, left: selected[1] * cs,
            width: cs, height: cs,
            boxShadow: `inset 0 0 0 2px ${HILL.accent}`,
          }}
        />
      )}

      {pieces.map((p, i) => {
        const isOwn = ownPlayer !== undefined && p.player === ownPlayer;
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
            <PieceShape
              player={p.player}
              size={cs * 0.7}
              isKing={p.kind === 'king'}
              dimmed={p.dimmed}
              skin={p.skin ?? skinForPlayer[p.player] ?? 'bronze'}
              interactive={isOwn && isYourTurn}
            />
          </div>
        );
      })}
    </div>
  );
}

// Note: pieces support an optional `.skin` per-piece override; widen the type
// in lib/pieces.ts if you want it strictly typed: { skin?: SkinId } & Piece.
declare module '@/lib/pieces' {
  interface Piece { skin?: SkinId; }
}
