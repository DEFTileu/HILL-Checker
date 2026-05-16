import type { Coord, GameConfig } from './types';

// Dark squares (the playable ones) are where (row + col) is odd.
function darkSquaresInRows(rows: number[], cols: number): Coord[] {
  const out: Coord[] = [];
  for (const row of rows) {
    for (let col = 0; col < cols; col++) {
      if ((row + col) % 2 === 1) out.push({ row, col });
    }
  }
  return out;
}

// Classic 2-player checkers on an 8x8 board.
// Player 1 starts at the bottom (rows 5-7) and moves UP toward row 0.
// Player 2 starts at the top (rows 0-2) and moves DOWN toward row 7.
export const classic2P: GameConfig = {
  mode: 'classic-2p',
  boardSize: 8,
  players: [1, 2],
  startingPieces: {
    1: darkSquaresInRows([5, 6, 7], 8),
    2: darkSquaresInRows([0, 1, 2], 8),
  },
  kingRule: 'opposite-edge',
  winCondition: 'capture-all',
  maxRounds: 999,
  centerZone: [],
  moveDirections: {
    1: [
      [-1, -1],
      [-1, 1],
    ],
    2: [
      [1, -1],
      [1, 1],
    ],
  },
  kingRow: {
    1: 0,
    2: 7,
  },
};

// King of Hill — 4 players on a 10x10 board, racing from their corner
// triangle toward the central 2x2 "Hill". Each formation is exactly 5
// pieces, all on dark squares ((row+col) odd), apex pointing at the
// center. Hardcoded so the layout is fully deterministic.
const HILL_START = {
  1: [
    { row: 0, col: 1 },
    { row: 0, col: 3 },
    { row: 1, col: 0 },
    { row: 1, col: 2 },
    { row: 2, col: 1 },
  ],
  2: [
    { row: 0, col: 9 },
    { row: 0, col: 7 },
    { row: 1, col: 8 },
    { row: 1, col: 6 },
    { row: 2, col: 7 },
  ],
  3: [
    { row: 9, col: 8 },
    { row: 9, col: 6 },
    { row: 8, col: 9 },
    { row: 8, col: 7 },
    { row: 7, col: 8 },
  ],
  4: [
    { row: 9, col: 0 },
    { row: 9, col: 2 },
    { row: 8, col: 1 },
    { row: 8, col: 3 },
    { row: 7, col: 2 },
  ],
} as const satisfies GameConfig['startingPieces'];

const HILL_CENTER: Coord[] = [
  { row: 4, col: 4 },
  { row: 4, col: 5 },
  { row: 5, col: 4 },
  { row: 5, col: 5 },
];

// Pawn step directions: every player marches toward the center.
const HILL_DIRS = {
  1: [[1, 1]], // top-left  -> down-right
  2: [[1, -1]], // top-right -> down-left
  3: [[-1, -1]], // bottom-right -> up-left
  4: [[-1, 1]], // bottom-left  -> up-right
} as const satisfies GameConfig['moveDirections'];

export const hillBlitz: GameConfig = {
  mode: 'hill-blitz',
  boardSize: 10,
  players: [1, 2, 3, 4],
  startingPieces: HILL_START,
  kingRule: 'center-zone',
  winCondition: 'hold-center',
  maxRounds: 7,
  centerZone: HILL_CENTER,
  moveDirections: HILL_DIRS,
};

export const hillSurvival: GameConfig = {
  ...hillBlitz,
  mode: 'hill-survival',
  maxRounds: 20,
};
