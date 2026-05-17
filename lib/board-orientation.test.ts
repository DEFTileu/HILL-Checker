import { describe, it, expect } from 'vitest';
import { displayToCanonical, canonicalToDisplay } from './board-orientation';
import type { PlayerNum } from '@/lib/tokens';

type Coord = [number, number];

function* cells(n: number): Generator<Coord> {
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) yield [r, c];
}

describe('board-orientation: identity (hot-seat / no localPlayer)', () => {
  it('is identity when localPlayer is undefined', () => {
    expect(displayToCanonical([2, 5], undefined, 8)).toEqual([2, 5]);
    expect(canonicalToDisplay([2, 5], undefined, 10)).toEqual([2, 5]);
  });
});

describe('board-orientation: Classic 2P (8x8)', () => {
  it('P1 sees the canonical board (no flip)', () => {
    // P1 already starts on the bottom rows (5-7) in canonical space.
    expect(displayToCanonical([0, 0], 1, 8)).toEqual([0, 0]);
    expect(canonicalToDisplay([7, 3], 1, 8)).toEqual([7, 3]);
  });

  it('P2 is flipped vertically: own pieces move to the bottom', () => {
    // Canonical P2 home rows are 0-2 (top). Displaying for P2 must put
    // them at the bottom (large row index). Column is unchanged.
    expect(canonicalToDisplay([0, 2], 2, 8)).toEqual([7, 2]);
    expect(canonicalToDisplay([7, 5], 2, 8)).toEqual([0, 5]);
    expect(canonicalToDisplay([3, 4], 2, 8)).toEqual([4, 4]);
  });

  it('round-trips for both players over every cell', () => {
    for (const lp of [1, 2] as PlayerNum[]) {
      for (const cell of cells(8)) {
        const there = displayToCanonical(cell, lp, 8);
        expect(canonicalToDisplay(there, lp, 8)).toEqual(cell);
        const back = canonicalToDisplay(cell, lp, 8);
        expect(displayToCanonical(back, lp, 8)).toEqual(cell);
      }
    }
  });
});

describe('board-orientation: Hill 4P (10x10)', () => {
  // Canonical home corners (from HILL_START geometry):
  //   P1 top-left (0,0), P2 top-right (0,9),
  //   P3 bottom-right (9,9), P4 bottom-left (9,0).
  // The real requirement (Bug #2) is "the local player's pieces at the
  // BOTTOM of their view", so EVERY player's home corner must render at
  // the display bottom-left (9,0). Pure rotations only (checkers diagonals
  // preserved): P4 0°, P3 90°CW, P2 180°, P1 270°CW.
  it("each player's home corner renders at the view's bottom-left", () => {
    expect(canonicalToDisplay([0, 0], 1, 10)).toEqual([9, 0]);
    expect(canonicalToDisplay([0, 9], 2, 10)).toEqual([9, 0]);
    expect(canonicalToDisplay([9, 9], 3, 10)).toEqual([9, 0]);
    expect(canonicalToDisplay([9, 0], 4, 10)).toEqual([9, 0]);
  });

  it('P4 is the unrotated reference (0°)', () => {
    expect(displayToCanonical([3, 6], 4, 10)).toEqual([3, 6]);
    expect(canonicalToDisplay([3, 6], 4, 10)).toEqual([3, 6]);
  });

  it('round-trips for all 4 players over every cell', () => {
    for (const lp of [1, 2, 3, 4] as PlayerNum[]) {
      for (const cell of cells(10)) {
        const there = displayToCanonical(cell, lp, 10);
        expect(canonicalToDisplay(there, lp, 10)).toEqual(cell);
        const back = canonicalToDisplay(cell, lp, 10);
        expect(displayToCanonical(back, lp, 10)).toEqual(cell);
      }
    }
  });

  it('uses pure 90° rotation steps (a click maps onto a real dark cell)', () => {
    const N = 9;
    const [r, c] = [3, 6];
    // displayToCanonical: P4 0°, P3 90°CW, P2 180°, P1 270°CW.
    expect(displayToCanonical([r, c], 4, 10)).toEqual([r, c]);
    expect(displayToCanonical([r, c], 3, 10)).toEqual([N - c, r]);
    expect(displayToCanonical([r, c], 2, 10)).toEqual([N - r, N - c]);
    expect(displayToCanonical([r, c], 1, 10)).toEqual([c, N - r]);
  });
});
