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
