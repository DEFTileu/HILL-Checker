import { describe, it, expect } from 'vitest';
import { classic2P } from './presets';
import { getLegalMoves, isJumpAvailable } from './rules';
import type { GameState, Piece } from './types';

function emptyBoard(n: number): (Piece | null)[][] {
  return Array.from({ length: n }, () => Array.from({ length: n }, () => null));
}

function baseState(board: (Piece | null)[][], currentPlayer: 1 | 2 = 1): GameState {
  return {
    config: classic2P,
    board,
    currentPlayer,
    alivePlayers: [1, 2],
    round: 1,
    mandatoryJumpFrom: null,
    winners: null,
  };
}

const dests = (state: GameState, r: number, c: number) =>
  getLegalMoves(state, { row: r, col: c })
    .map((m) => `${m.to.row},${m.to.col}`)
    .sort();

describe('pawn moves', () => {
  it('P1 pawn steps diagonally forward (up) to both empty dark squares', () => {
    const b = emptyBoard(8);
    b[5][2] = { player: 1, king: false };
    const moves = getLegalMoves(baseState(b), { row: 5, col: 2 });
    expect(moves.map((m) => `${m.to.row},${m.to.col}`).sort()).toEqual(['4,1', '4,3']);
    expect(moves.every((m) => m.captures.length === 0)).toBe(true);
  });

  it('P1 pawn cannot step backward (down)', () => {
    const b = emptyBoard(8);
    b[5][2] = { player: 1, king: false };
    expect(dests(baseState(b), 5, 2)).not.toContain('6,1');
  });

  it('does not return moves for the opponent piece', () => {
    const b = emptyBoard(8);
    b[2][3] = { player: 2, king: false };
    expect(getLegalMoves(baseState(b, 1), { row: 2, col: 3 })).toEqual([]);
  });
});

describe('mandatory capture', () => {
  it('returns only the jump when a jump is available for the moving player', () => {
    const b = emptyBoard(8);
    b[5][2] = { player: 1, king: false }; // can step
    b[4][4] = { player: 1, king: false }; // can jump 3,5 over enemy
    b[3][5] = { player: 2, king: false };
    const state = baseState(b);
    expect(isJumpAvailable(state, 1)).toBe(true);
    // the non-jumping pawn has NO legal moves while a jump exists elsewhere
    expect(getLegalMoves(state, { row: 5, col: 2 })).toEqual([]);
    const jump = getLegalMoves(state, { row: 4, col: 4 });
    expect(jump).toHaveLength(1);
    expect(jump[0].to).toEqual({ row: 2, col: 6 });
    expect(jump[0].captures).toEqual([{ row: 3, col: 5 }]);
  });

  it('mandatoryJumpFrom restricts moves to that square only', () => {
    const b = emptyBoard(8);
    b[4][4] = { player: 1, king: false };
    b[3][5] = { player: 2, king: false };
    b[6][0] = { player: 1, king: false };
    const state = { ...baseState(b), mandatoryJumpFrom: { row: 4, col: 4 } };
    expect(getLegalMoves(state, { row: 6, col: 0 })).toEqual([]);
    expect(getLegalMoves(state, { row: 4, col: 4 })).toHaveLength(1);
  });

  it('isJumpAvailable is false when no captures exist', () => {
    const b = emptyBoard(8);
    b[5][2] = { player: 1, king: false };
    expect(isJumpAvailable(baseState(b), 1)).toBe(false);
  });
});

describe('flying king', () => {
  it('king slides multiple empty squares in all 4 diagonals', () => {
    const b = emptyBoard(8);
    b[4][4] = { player: 1, king: true };
    const ds = dests(baseState(b), 4, 4);
    expect(ds).toContain('0,0'); // up-left far
    expect(ds).toContain('7,7'); // down-right far
    expect(ds).toContain('1,7'); // up-right far
    expect(ds).toContain('7,1'); // down-left far
  });

  it('king captures from a distance and may land on any empty square beyond', () => {
    const b = emptyBoard(8);
    b[7][0] = { player: 1, king: true };
    b[4][3] = { player: 2, king: false };
    const moves = getLegalMoves(baseState(b), { row: 7, col: 0 });
    // all moves must be jumps over (4,3); landing on 3,4 / 2,5 / 1,6 / 0,7
    expect(moves.length).toBeGreaterThan(0);
    expect(moves.every((m) => m.captures.length === 1)).toBe(true);
    const landings = moves.map((m) => `${m.to.row},${m.to.col}`).sort();
    expect(landings).toEqual(['0,7', '1,6', '2,5', '3,4']);
  });

  it('king cannot jump if its own piece is blocking behind the enemy', () => {
    const b = emptyBoard(8);
    b[7][0] = { player: 1, king: true };
    b[5][2] = { player: 2, king: false };
    b[4][3] = { player: 1, king: false }; // blocks landing
    const moves = getLegalMoves(baseState(b), { row: 7, col: 0 });
    expect(moves.every((m) => m.captures.length === 0)).toBe(true);
  });
});
