import { describe, it, expect } from 'vitest';
import { classic2P } from './presets';
import { applyMove, createInitialState, getNextActivePlayer } from './apply';
import { getLegalMoves } from './rules';
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

describe('createInitialState', () => {
  it('places 12 pieces per player in the standard 8x8 layout', () => {
    const s = createInitialState(classic2P);
    const count = (p: 1 | 2) =>
      s.board.flat().filter((x) => x && x.player === p).length;
    expect(count(1)).toBe(12);
    expect(count(2)).toBe(12);
    expect(s.board[7][0]).toMatchObject({ player: 1, king: false });
    expect(s.board[0][1]).toMatchObject({ player: 2, king: false });
    // Every placed piece gets a unique stable id.
    const ids = s.board.flat().filter(Boolean).map((x) => x!.id);
    expect(ids.every((id) => typeof id === 'number')).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
    expect(s.currentPlayer).toBe(1);
    expect(s.round).toBe(1);
  });
});

describe('applyMove - plain step', () => {
  it('moves the piece and passes the turn to the next player', () => {
    const b = emptyBoard(8);
    b[5][2] = { player: 1, king: false };
    b[0][7] = { player: 2, king: false }; // P2 still in the game
    const next = applyMove(baseState(b), {
      from: { row: 5, col: 2 },
      to: { row: 4, col: 1 },
      captures: [],
    });
    expect(next.board[5][2]).toBeNull();
    expect(next.board[4][1]).toEqual({ player: 1, king: false });
    expect(next.currentPlayer).toBe(2);
  });

  it('does not mutate the input state', () => {
    const b = emptyBoard(8);
    b[5][2] = { player: 1, king: false };
    const state = baseState(b);
    applyMove(state, { from: { row: 5, col: 2 }, to: { row: 4, col: 1 }, captures: [] });
    expect(state.board[5][2]).toEqual({ player: 1, king: false });
    expect(state.currentPlayer).toBe(1);
  });

  it('increments round when the turn cycles back to the first player', () => {
    const b = emptyBoard(8);
    b[5][2] = { player: 1, king: false };
    b[2][3] = { player: 2, king: false };
    const afterP1 = applyMove(baseState(b), {
      from: { row: 5, col: 2 },
      to: { row: 4, col: 1 },
      captures: [],
    });
    expect(afterP1.round).toBe(1);
    const afterP2 = applyMove(afterP1, {
      from: { row: 2, col: 3 },
      to: { row: 3, col: 4 },
      captures: [],
    });
    expect(afterP2.currentPlayer).toBe(1);
    expect(afterP2.round).toBe(2);
  });
});

describe('applyMove - captures', () => {
  it('removes the captured piece', () => {
    const b = emptyBoard(8);
    b[4][4] = { player: 1, king: false };
    b[3][5] = { player: 2, king: false };
    const next = applyMove(baseState(b), {
      from: { row: 4, col: 4 },
      to: { row: 2, col: 6 },
      captures: [{ row: 3, col: 5 }],
    });
    expect(next.board[3][5]).toBeNull();
    expect(next.board[2][6]).toEqual({ player: 1, king: false });
  });

  it('continues the same turn when more jumps are available (multi-jump)', () => {
    const b = emptyBoard(8);
    b[5][0] = { player: 1, king: false };
    b[4][1] = { player: 2, king: false };
    b[2][3] = { player: 2, king: false };
    b[0][7] = { player: 2, king: false }; // P2 survives the chain, stays alive
    const next = applyMove(baseState(b), {
      from: { row: 5, col: 0 },
      to: { row: 3, col: 2 },
      captures: [{ row: 4, col: 1 }],
    });
    // still P1, must continue jumping from the landing square
    expect(next.currentPlayer).toBe(1);
    expect(next.mandatoryJumpFrom).toEqual({ row: 3, col: 2 });
    const cont = getLegalMoves(next, { row: 3, col: 2 });
    expect(cont).toHaveLength(1);
    expect(cont[0].to).toEqual({ row: 1, col: 4 });

    const done = applyMove(next, cont[0]);
    expect(done.board[2][3]).toBeNull();
    expect(done.currentPlayer).toBe(2);
    expect(done.mandatoryJumpFrom).toBeNull();
  });
});

describe('applyMove - promotion', () => {
  it('promotes a P1 pawn to king on reaching the top edge (row 0)', () => {
    const b = emptyBoard(8);
    b[1][2] = { player: 1, king: false };
    const next = applyMove(baseState(b), {
      from: { row: 1, col: 2 },
      to: { row: 0, col: 1 },
      captures: [],
    });
    expect(next.board[0][1]).toEqual({ player: 1, king: true });
  });

  it('promotes a P2 pawn to king on reaching the bottom edge (row 7)', () => {
    const b = emptyBoard(8);
    b[6][3] = { player: 2, king: false };
    const next = applyMove(baseState(b, 2), {
      from: { row: 6, col: 3 },
      to: { row: 7, col: 4 },
      captures: [],
    });
    expect(next.board[7][4]).toEqual({ player: 2, king: true });
  });
});

describe('elimination', () => {
  it('removes a player with zero pieces from alivePlayers', () => {
    const b = emptyBoard(8);
    b[4][4] = { player: 1, king: false };
    b[3][5] = { player: 2, king: false }; // P2's only piece, about to be taken
    const next = applyMove(baseState(b), {
      from: { row: 4, col: 4 },
      to: { row: 2, col: 6 },
      captures: [{ row: 3, col: 5 }],
    });
    expect(next.alivePlayers).toEqual([1]);
  });
});

describe('getNextActivePlayer', () => {
  it('skips eliminated players', () => {
    const b = emptyBoard(8);
    const s: GameState = { ...baseState(b), alivePlayers: [1], currentPlayer: 1 };
    expect(getNextActivePlayer(s)).toBe(1);
  });
});
