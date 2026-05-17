import { describe, it, expect } from 'vitest';
import {
  boardToPieces,
  toTuple,
  toCoord,
  assignSlots,
  winnersToGameOver,
  type PresenceEntry,
} from './adapt';
import type { Piece } from '@/lib/engine/types';

function emptyBoard(n: number): (Piece | null)[][] {
  return Array.from({ length: n }, () => Array.from({ length: n }, () => null));
}

describe('boardToPieces', () => {
  it('maps engine cells to UI pieces with tuple positions', () => {
    const b = emptyBoard(10);
    b[0][1] = { player: 1, king: false };
    b[5][4] = { player: 3, king: true };
    const pieces = boardToPieces(b);
    expect(pieces).toContainEqual({ player: 1, kind: 'pawn', pos: [0, 1] });
    expect(pieces).toContainEqual({ player: 3, kind: 'king', pos: [5, 4] });
    expect(pieces).toHaveLength(2);
  });
});

describe('coord conversion', () => {
  it('round-trips', () => {
    expect(toTuple({ row: 2, col: 7 })).toEqual([2, 7]);
    expect(toCoord([2, 7])).toEqual({ row: 2, col: 7 });
  });
});

describe('assignSlots', () => {
  it('orders by joinedAt and caps at the player count', () => {
    const e = (id: string, t: number): PresenceEntry => ({
      userId: id, displayName: id, tier: 'Bronze', skin: 'bronze', joinedAt: t,
    });
    const slots = assignSlots(
      [e('c', 30), e('a', 10), e('b', 20), e('d', 40), e('x', 50)],
      [1, 2, 3, 4],
    );
    expect(slots[1]?.userId).toBe('a');
    expect(slots[2]?.userId).toBe('b');
    expect(slots[3]?.userId).toBe('c');
    expect(slots[4]?.userId).toBe('d');
  });
});

describe('winnersToGameOver', () => {
  const slots = {
    1: { userId: 'a', displayName: 'Ann', tier: 'Gold' as const, skin: 'gold' as const },
    2: { userId: 'b', displayName: 'Bo', tier: 'Bronze' as const, skin: 'bronze' as const },
  };
  it('solo for one winner', () => {
    const r = winnersToGameOver([1], slots);
    expect(r.kind).toBe('solo');
    expect(r.winners[0].name).toBe('Ann');
  });
  it('joint for multiple', () => {
    expect(winnersToGameOver([1, 2], slots).kind).toBe('joint');
  });
  it('none for empty', () => {
    expect(winnersToGameOver([], slots)).toEqual({ kind: 'none', winners: [] });
  });
});
