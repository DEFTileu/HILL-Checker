import { describe, it, expect } from 'vitest';
import {
  boardToPieces,
  toTuple,
  toCoord,
  assignSlots,
  orderPresence,
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

const pe = (id: string, t: number): PresenceEntry => ({
  userId: id, displayName: id, tier: 'Bronze', skin: 'bronze', joinedAt: t,
});

describe('orderPresence', () => {
  it('orders by joinedAt when no host given', () => {
    const out = orderPresence([pe('c', 30), pe('a', 10), pe('b', 20)]);
    expect(out.map((e) => e.userId)).toEqual(['a', 'b', 'c']);
  });

  it('puts the host first, others by joinedAt', () => {
    // Host joined LAST in wall-clock time but must still lead.
    const out = orderPresence(
      [pe('a', 10), pe('b', 20), pe('host', 99)],
      'host',
    );
    expect(out.map((e) => e.userId)).toEqual(['host', 'a', 'b']);
  });

  it('falls back to joinedAt order when the host is absent', () => {
    const out = orderPresence([pe('b', 20), pe('a', 10)], 'ghost');
    expect(out.map((e) => e.userId)).toEqual(['a', 'b']);
  });
});

describe('assignSlots', () => {
  it('orders by joinedAt and caps at the player count', () => {
    const slots = assignSlots(
      [pe('c', 30), pe('a', 10), pe('b', 20), pe('d', 40), pe('x', 50)],
      [1, 2, 3, 4],
    );
    expect(slots[1]?.userId).toBe('a');
    expect(slots[2]?.userId).toBe('b');
    expect(slots[3]?.userId).toBe('c');
    expect(slots[4]?.userId).toBe('d');
  });

  it('always gives the host slot 1, others fill 2..N by join order', () => {
    // host joined third but owns slot 1; the rest keep join order.
    const slots = assignSlots(
      [pe('a', 10), pe('b', 20), pe('host', 30), pe('d', 40)],
      [1, 2, 3, 4],
      'host',
    );
    expect(slots[1]?.userId).toBe('host');
    expect(slots[2]?.userId).toBe('a');
    expect(slots[3]?.userId).toBe('b');
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
