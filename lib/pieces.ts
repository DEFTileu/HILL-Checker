// lib/pieces.ts
import type { PlayerNum } from './tokens';

export type PieceKind = 'pawn' | 'king';

export interface Piece {
  player: PlayerNum;
  kind: PieceKind;
  pos: [number, number];
  dimmed?: boolean;
}

/** Mid-game 10×10 Hill 4P position used for previews + non-interactive demos. */
export function makeHillPieces(): Piece[] {
  const ps: Piece[] = [];
  ([[0, 1], [0, 3], [1, 0], [1, 2], [2, 1], [3, 4]] as [number, number][]).forEach(p =>
    ps.push({ player: 1, kind: 'pawn', pos: p }),
  );
  ps.push({ player: 1, kind: 'king', pos: [4, 4] });

  ([[0, 6], [0, 8], [1, 7], [1, 9], [2, 8], [3, 7]] as [number, number][]).forEach(p =>
    ps.push({ player: 2, kind: 'pawn', pos: p }),
  );
  ps.push({ player: 2, kind: 'pawn', pos: [4, 5] });

  ([[9, 6], [9, 8], [8, 7]] as [number, number][]).forEach(p =>
    ps.push({ player: 3, kind: 'pawn', pos: p, dimmed: true }),
  );

  ([[9, 1], [9, 3], [8, 0], [8, 2], [7, 1], [6, 4]] as [number, number][]).forEach(p =>
    ps.push({ player: 4, kind: 'pawn', pos: p }),
  );
  ps.push({ player: 4, kind: 'king', pos: [5, 5] });
  return ps;
}

export const HILL_CENTER_ZONE: [number, number][] = [[4, 4], [4, 5], [5, 4], [5, 5]];
