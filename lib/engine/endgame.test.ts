import { describe, it, expect } from 'vitest';
import { classic2P } from './presets';
import { checkWinners } from './endgame';
import type { GameConfig, GameState, Piece } from './types';

function emptyBoard(n: number): (Piece | null)[][] {
  return Array.from({ length: n }, () => Array.from({ length: n }, () => null));
}

const hillCenter = [
  { row: 4, col: 4 },
  { row: 4, col: 5 },
  { row: 5, col: 4 },
  { row: 5, col: 5 },
];

function hillConfig(mode: 'hill-blitz' | 'hill-survival', maxRounds: number): GameConfig {
  return {
    mode,
    boardSize: 10,
    players: [1, 2, 3, 4],
    startingPieces: {},
    kingRule: 'center-zone',
    winCondition: 'hill',
    maxRounds,
    centerZone: hillCenter,
    moveDirections: {},
  };
}

function state(config: GameConfig, board: (Piece | null)[][], over: Partial<GameState>): GameState {
  return {
    config,
    board,
    currentPlayer: config.players[0],
    alivePlayers: [...config.players],
    round: 1,
    mandatoryJumpFrom: null,
    winners: null,
    ...over,
  };
}

describe('classic-2p', () => {
  it('returns the player with pieces when the other has none', () => {
    const b = emptyBoard(8);
    b[3][2] = { player: 1, king: false };
    expect(checkWinners(state(classic2P, b, { alivePlayers: [1] }))).toEqual([1]);
  });

  it('returns null while both players still have pieces', () => {
    const b = emptyBoard(8);
    b[3][2] = { player: 1, king: false };
    b[4][5] = { player: 2, king: false };
    expect(checkWinners(state(classic2P, b, {}))).toBeNull();
  });
});

describe('hill-blitz', () => {
  it('returns the lone survivor', () => {
    const cfg = hillConfig('hill-blitz', 7);
    const b = emptyBoard(10);
    b[5][5] = { player: 3, king: false };
    expect(checkWinners(state(cfg, b, { alivePlayers: [3], round: 2 }))).toEqual([3]);
  });

  it('returns everyone holding the hill when the round cap is exceeded (multiple winners)', () => {
    const cfg = hillConfig('hill-blitz', 7);
    const b = emptyBoard(10);
    b[4][4] = { player: 1, king: true };
    b[5][5] = { player: 2, king: true };
    b[9][9] = { player: 3, king: false }; // alive but not on the hill
    const w = checkWinners(state(cfg, b, { alivePlayers: [1, 2, 3], round: 8 }));
    expect(w).toEqual([1, 2]);
  });

  it('returns null while the game is still being played', () => {
    const cfg = hillConfig('hill-blitz', 7);
    const b = emptyBoard(10);
    b[0][0] = { player: 1, king: false };
    b[9][9] = { player: 2, king: false };
    expect(checkWinners(state(cfg, b, { alivePlayers: [1, 2], round: 3 }))).toBeNull();
  });
});

describe('hill-survival', () => {
  it('returns the lone survivor', () => {
    const cfg = hillConfig('hill-survival', 20);
    const b = emptyBoard(10);
    b[1][1] = { player: 4, king: false };
    expect(checkWinners(state(cfg, b, { alivePlayers: [4], round: 5 }))).toEqual([4]);
  });

  it('returns an empty array (draw) when the cap is hit and nobody holds the hill', () => {
    const cfg = hillConfig('hill-survival', 20);
    const b = emptyBoard(10);
    b[0][0] = { player: 1, king: false };
    b[9][9] = { player: 2, king: false };
    expect(checkWinners(state(cfg, b, { alivePlayers: [1, 2], round: 21 }))).toEqual([]);
  });

  it('returns hill holders when the cap is hit and someone is on the hill', () => {
    const cfg = hillConfig('hill-survival', 20);
    const b = emptyBoard(10);
    b[4][5] = { player: 2, king: true };
    b[0][0] = { player: 1, king: false };
    expect(checkWinners(state(cfg, b, { alivePlayers: [1, 2], round: 21 }))).toEqual([2]);
  });

  it('returns null while still playing under the cap', () => {
    const cfg = hillConfig('hill-survival', 20);
    const b = emptyBoard(10);
    b[0][0] = { player: 1, king: false };
    b[9][9] = { player: 2, king: false };
    expect(checkWinners(state(cfg, b, { alivePlayers: [1, 2], round: 10 }))).toBeNull();
  });
});
