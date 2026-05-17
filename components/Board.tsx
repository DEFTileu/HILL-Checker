// components/Board.tsx
'use client';
import { Square } from './Square';
import { PieceShape } from './PieceShape';
import { HILL, type PlayerNum } from '@/lib/tokens';
import type { Piece } from '@/lib/pieces';
import type { SkinId } from '@/lib/skins';
import { displayToCanonical, canonicalToDisplay } from '@/lib/board-orientation';

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
  /**
   * Local player's seat. When set, the board is rotated so this player's
   * pieces sit at the bottom of the view (own perspective). Game state stays
   * canonical — only rendering + click coords are transformed. Leave
   * undefined for hot-seat / shared-screen (no rotation).
   */
  localPlayer?: PlayerNum;
  /**
   * True when an ancestor applied a 180° CSS rotation (hot-seat desktop
   * active-player view). Forwarded to PieceShape so the king ✦ marker
   * counter-rotates and stays upright. Purely cosmetic — coords are
   * unaffected (the rotation is on a wrapper, not in coordinate space).
   */
  boardRotated180?: boolean;
  onSquareClick?: (r: number, c: number) => void;
}

export function Board({
  size = 8, pieces = [], centerZone = [], highlighted = [],
  selected = null, lastMove = null, cellSize = null,
  skinForPlayer = {}, isYourTurn = false, ownPlayer, localPlayer,
  boardRotated180 = false,
  onSquareClick,
}: Props) {
  // Fallback only — GameView always passes an explicit cellSize. Mobile-ish
  // defaults bumped slightly (33→36, 41→44) to match the larger mobile board.
  const cs = cellSize ?? (size === 10 ? 36 : 44);
  const total = size * cs;
  const isHi = (r: number, c: number) => highlighted.some(([a, b]) => a === r && b === c);
  const isLast = (r: number, c: number) => lastMove?.some(([a, b]) => a === r && b === c) ?? false;
  // Canonical (engine) -> display (pixel) cell, honoring the local player's
  // viewpoint rotation. Identity when localPlayer is undefined.
  const toDisp = (r: number, c: number) =>
    canonicalToDisplay([r, c], localPlayer, size);

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
          // (r,c) is the display cell; map back to canonical so square
          // colour, highlight lookup and clicks all stay in engine space.
          const r = Math.floor(i / size);
          const c = i % size;
          const [cr, cc] = displayToCanonical([r, c], localPlayer, size);
          const dark = (cr + cc) % 2 === 1;
          return (
            <Square
              key={i}
              dark={dark}
              isLegalTarget={isHi(cr, cc)}
              isLastMove={isLast(cr, cc)}
              onClick={onSquareClick ? () => onSquareClick(cr, cc) : undefined}
            />
          );
        })}
      </div>

      {centerZone.length > 0 && (() => {
        const disp = centerZone.map(p => toDisp(p[0], p[1]));
        const rs = disp.map(p => p[0]);
        const csx = disp.map(p => p[1]);
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

      {highlighted.map(([r, c], i) => {
        const [dr, dc] = toDisp(r, c);
        return (
          <div
            key={`h${i}`}
            className="absolute rounded-full pointer-events-none bg-[var(--hill-accent)]"
            style={{
              top: dr * cs + cs * 0.35, left: dc * cs + cs * 0.35,
              width: cs * 0.3, height: cs * 0.3,
              opacity: 0.6,
              boxShadow: `0 0 8px ${HILL.accent}`,
            }}
          />
        );
      })}

      {selected && (() => {
        const [sr, sc] = toDisp(selected[0], selected[1]);
        return (
          <div
            className="absolute pointer-events-none"
            style={{
              top: sr * cs, left: sc * cs,
              width: cs, height: cs,
              boxShadow: `inset 0 0 0 2px ${HILL.accent}`,
            }}
          />
        );
      })()}

      {pieces.map((p, i) => {
        const isOwn = ownPlayer !== undefined && p.player === ownPlayer;
        const [pr, pc] = toDisp(p.pos[0], p.pos[1]);
        return (
          <div
            key={p.id ?? `${p.player}-${p.pos[0]}-${p.pos[1]}-${i}`}
            className="absolute left-0 top-0 transition-transform duration-150 ease-out pointer-events-none"
            style={{
              transform: `translate(${pc * cs + (cs - cs * 0.7) / 2}px, ${pr * cs + (cs - cs * 0.7) / 2}px)`,
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
              boardRotated180={boardRotated180}
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
