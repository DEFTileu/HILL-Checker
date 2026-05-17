import { describe, it, expect } from 'vitest';
import { hillBlitz, hillSurvival } from './presets';
import { getLegalMoves, isJumpAvailable } from './rules';
import { applyMove, createInitialState, skipTurn, TURN_MS } from './apply';
import { checkWinners } from './endgame';
import type { Coord, GameState, Piece, Player } from './types';

function emptyBoard(n: number): (Piece | null)[][] {
  return Array.from({ length: n }, () => Array.from({ length: n }, () => null));
}

function hillState(
  board: (Piece | null)[][],
  over: Partial<GameState> = {},
): GameState {
  return {
    config: hillBlitz,
    board,
    currentPlayer: 1,
    alivePlayers: [1, 2, 3, 4],
    round: 1,
    mandatoryJumpFrom: null,
    winners: null,
    turnDeadline: Date.now() + TURN_MS,
    ...over,
  };
}

describe('hill presets', () => {
  it('hillBlitz: 10x10, 4 players, 5 pieces each, all on dark squares', () => {
    expect(hillBlitz.boardSize).toBe(10);
    expect(hillBlitz.players).toEqual([1, 2, 3, 4]);
    expect(hillBlitz.mode).toBe('hill-blitz');
    expect(hillBlitz.maxRounds).toBe(7);
    expect(hillBlitz.kingRule).toBe('center-zone');
    expect(hillBlitz.centerZone).toEqual([
      { row: 4, col: 4 },
      { row: 4, col: 5 },
      { row: 5, col: 4 },
      { row: 5, col: 5 },
    ]);
    for (const p of [1, 2, 3, 4] as Player[]) {
      const sq = hillBlitz.startingPieces[p]!;
      expect(sq).toHaveLength(5);
      for (const { row, col } of sq) {
        expect((row + col) % 2).toBe(1); // dark square
        expect(row).toBeGreaterThanOrEqual(0);
        expect(row).toBeLessThan(10);
      }
    }
    // No two players share a starting square.
    const all = ([1, 2, 3, 4] as Player[]).flatMap((p) =>
      hillBlitz.startingPieces[p]!.map((s) => `${s.row},${s.col}`),
    );
    expect(new Set(all).size).toBe(20);
  });

  it('hillSurvival: same shape but maxRounds 20 and survival mode', () => {
    expect(hillSurvival.mode).toBe('hill-survival');
    expect(hillSurvival.maxRounds).toBe(20);
    expect(hillSurvival.boardSize).toBe(10);
    expect(hillSurvival.startingPieces[1]).toHaveLength(5);
  });

  it('createInitialState builds 20 pieces and a turn deadline', () => {
    const s = createInitialState(hillBlitz);
    expect(s.board.flat().filter(Boolean)).toHaveLength(20);
    expect(s.currentPlayer).toBe(1);
    expect(s.turnDeadline).toBeGreaterThan(Date.now() + 9000);
  });
});

describe('hillBlitz corner symmetry (180° rotational)', () => {
  // EXACT 4-way equidistance is impossible on a 10x10 with a 2x2 hill
  // under the checkers dark-square rule (r+c odd): every dark square in
  // the top-left / bottom-right corner sits an ODD Manhattan distance
  // from the center zone, while every dark square in the top-right /
  // bottom-left corner is EVEN. So min(P1)/min(P3) are always odd and
  // min(P2)/min(P4) always even — never equal unless pieces are placed on
  // (illegal) light squares. The achievable, fair invariant is full 180°
  // rotational symmetry (P1≡P3, P2≡P4) with the two parity classes only a
  // single, irreducible tile apart. That is what these tests pin down.
  const N = hillBlitz.boardSize; // 10
  const rot180 = ({ row, col }: Coord): Coord => ({
    row: N - 1 - row,
    col: N - 1 - col,
  });
  const asSet = (cs: Coord[]) => new Set(cs.map((c) => `${c.row},${c.col}`));
  const distMultiset = (cs: Coord[]) =>
    cs
      .map((p) =>
        Math.min(
          ...hillBlitz.centerZone.map(
            (z) => Math.abs(p.row - z.row) + Math.abs(p.col - z.col),
          ),
        ),
      )
      .sort((a, b) => a - b);
  const sp = (p: Player) => hillBlitz.startingPieces[p]!;

  it('P3 is the exact 180° rotation of P1, and P4 of P2', () => {
    expect(asSet(sp(1).map(rot180))).toEqual(asSet(sp(3)));
    expect(asSet(sp(2).map(rot180))).toEqual(asSet(sp(4)));
  });

  it('rotationally-paired corners have identical distance multisets', () => {
    expect(distMultiset(sp(1))).toEqual(distMultiset(sp(3)));
    expect(distMultiset(sp(2))).toEqual(distMultiset(sp(4)));
  });

  it('the two parity classes are only the irreducible 1 tile apart', () => {
    const min = (p: Player) => distMultiset(sp(p))[0];
    // Not a bug: a 10x10 dark-square board cannot do better than this.
    expect(Math.abs(min(1) - min(2))).toBe(1);
    expect(min(1)).toBe(min(3));
    expect(min(2)).toBe(min(4));
  });

  it('hillSurvival reuses hillBlitz starting positions (kept in sync)', () => {
    for (const p of [1, 2, 3, 4] as Player[]) {
      expect(hillSurvival.startingPieces[p]).toEqual(
        hillBlitz.startingPieces[p],
      );
    }
  });
});

describe('hill pawn movement', () => {
  it('a pawn may capture in ALL 4 diagonal directions (even backward)', () => {
    const b = emptyBoard(10);
    b[5][5] = { player: 1, king: false }; // P1 moves [1,1]; up-left is backward
    b[4][4] = { player: 3, king: false }; // enemy behind P1
    const moves = getLegalMoves(hillState(b), { row: 5, col: 5 });
    const jump = moves.find((m) => m.captures.length === 1);
    expect(jump).toBeDefined();
    expect(jump!.to).toEqual({ row: 3, col: 3 });
    expect(jump!.captures).toEqual([{ row: 4, col: 4 }]);
  });

  it('a pawn may NOT make a non-capture step backward', () => {
    const b = emptyBoard(10);
    b[5][5] = { player: 1, king: false }; // only forward dir is [1,1]
    const dests = getLegalMoves(hillState(b), { row: 5, col: 5 }).map(
      (m) => `${m.to.row},${m.to.col}`,
    );
    expect(dests).toContain('6,6'); // forward step allowed
    expect(dests).not.toContain('4,4'); // backward step forbidden
  });

  it('captures work against any of the 3 other players', () => {
    const b = emptyBoard(10);
    b[5][5] = { player: 1, king: false };
    b[6][6] = { player: 2, king: false }; // a different "enemy", not just P-opposite
    const state = hillState(b);
    expect(isJumpAvailable(state, 1)).toBe(true);
    const moves = getLegalMoves(state, { row: 5, col: 5 });
    expect(moves).toHaveLength(1);
    expect(moves[0].to).toEqual({ row: 7, col: 7 });
    expect(moves[0].captures).toEqual([{ row: 6, col: 6 }]);
  });
});

describe('hill promotion + turn timer', () => {
  it('promotes a pawn to king on entering the center 2x2', () => {
    const b = emptyBoard(10);
    b[3][3] = { player: 1, king: false };
    const next = applyMove(hillState(b, { alivePlayers: [1, 2] }), {
      from: { row: 3, col: 3 },
      to: { row: 4, col: 4 },
      captures: [],
    });
    expect(next.board[4][4]).toEqual({ player: 1, king: true });
  });

  it('refreshes turnDeadline when the turn changes', () => {
    const b = emptyBoard(10);
    b[5][5] = { player: 1, king: false };
    b[0][1] = { player: 2, king: false };
    const before = Date.now();
    const next = applyMove(hillState(b), {
      from: { row: 5, col: 5 },
      to: { row: 6, col: 6 },
      captures: [],
    });
    expect(next.currentPlayer).toBe(2);
    expect(next.turnDeadline).toBeGreaterThanOrEqual(before + TURN_MS - 50);
    expect(next.turnDeadline).toBeLessThanOrEqual(Date.now() + TURN_MS + 50);
  });

  it('does NOT change turn or deadline mid multi-jump', () => {
    const b = emptyBoard(10);
    b[5][5] = { player: 1, king: false };
    b[4][4] = { player: 2, king: false };
    b[2][2] = { player: 3, king: false };
    const deadline = Date.now() + 5000;
    const next = applyMove(hillState(b, { turnDeadline: deadline }), {
      from: { row: 5, col: 5 },
      to: { row: 3, col: 3 },
      captures: [{ row: 4, col: 4 }],
    });
    expect(next.currentPlayer).toBe(1);
    expect(next.mandatoryJumpFrom).toEqual({ row: 3, col: 3 });
    expect(next.turnDeadline).toBe(deadline);
  });
});

describe('skip turn (timer expiry)', () => {
  it('advances to the next alive player without eliminating anyone', () => {
    const b = emptyBoard(10);
    b[5][5] = { player: 1, king: false };
    b[0][1] = { player: 2, king: false };
    b[9][8] = { player: 3, king: false };
    b[9][0] = { player: 4, king: false };
    const s = hillState(b);
    const next = skipTurn(s);
    expect(next.currentPlayer).toBe(2);
    expect(next.alivePlayers).toEqual([1, 2, 3, 4]);
    expect(next.board[5][5]).toEqual({ player: 1, king: false }); // unchanged
    expect(next.turnDeadline).toBeGreaterThan(Date.now() + 9000);
  });

  it('skips over eliminated players in P1..P4 order and advances the round', () => {
    const b = emptyBoard(10);
    b[5][5] = { player: 1, king: false };
    const s = hillState(b, {
      currentPlayer: 4,
      alivePlayers: [1, 4],
    });
    const next = skipTurn(s);
    expect(next.currentPlayer).toBe(1); // 4 -> wrap -> 1 (2,3 eliminated)
    expect(next.round).toBe(2); // back to lead player => new round
  });
});

describe('hill endgame (4 players)', () => {
  it('blitz: after round 7, every player with a piece on the hill wins', () => {
    const b = emptyBoard(10);
    b[4][5] = { player: 1, king: true };
    b[5][4] = { player: 3, king: true };
    b[0][0] = { player: 2, king: false }; // alive, not on hill
    const w = checkWinners(
      hillState(b, { round: 8, alivePlayers: [1, 2, 3] }),
    );
    expect(w).toEqual([1, 3]);
  });

  it('blitz: lone survivor wins immediately', () => {
    const b = emptyBoard(10);
    b[2][2] = { player: 2, king: false };
    expect(
      checkWinners(hillState(b, { round: 3, alivePlayers: [2] })),
    ).toEqual([2]);
  });

  it('survival: still playing at round 8 (cap is 20)', () => {
    const b = emptyBoard(10);
    b[1][1] = { player: 1, king: false };
    b[8][8] = { player: 3, king: false };
    expect(
      checkWinners(
        hillState(b, {
          config: hillSurvival,
          round: 8,
          alivePlayers: [1, 3],
        }),
      ),
    ).toBeNull();
  });

  it('survival: after round 20, center holders win', () => {
    const b = emptyBoard(10);
    b[5][4] = { player: 3, king: true };
    b[9][9] = { player: 1, king: false };
    expect(
      checkWinners(
        hillState(b, {
          config: hillSurvival,
          round: 21,
          alivePlayers: [1, 3],
        }),
      ),
    ).toEqual([3]);
  });
});
