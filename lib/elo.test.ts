import { describe, it, expect } from 'vitest';
import {
  calculateGameEloUpdates,
  getEloDelta,
  STARTING_ELO,
  type GameParticipant,
} from './elo';

describe('calculateGameEloUpdates', () => {
  it('equal-rated 1v1: winner +16, loser -16', () => {
    const p: GameParticipant[] = [
      { userId: 'w', elo: 1000, isWinner: true },
      { userId: 'l', elo: 1000, isWinner: false },
    ];
    const out = calculateGameEloUpdates(p);
    expect(out.w).toBe(1016);
    expect(out.l).toBe(984);
    expect(getEloDelta(1000, out.w)).toBe(16);
    expect(getEloDelta(1000, out.l)).toBe(-16);
  });

  it('favorite wins: smaller gain (~+8)', () => {
    const out = calculateGameEloUpdates([
      { userId: 'fav', elo: 1200, isWinner: true },
      { userId: 'dog', elo: 1000, isWinner: false },
    ]);
    expect(out.fav - 1200).toBe(8);
    expect(out.dog - 1000).toBe(-8);
  });

  it('upset: underdog beating the favorite gains big (~+24)', () => {
    const out = calculateGameEloUpdates([
      { userId: 'dog', elo: 1000, isWinner: true },
      { userId: 'fav', elo: 1200, isWinner: false },
    ]);
    expect(out.dog - 1000).toBe(24);
    expect(out.fav - 1200).toBe(-24);
  });

  it('Joint Kings: 2 winners vs 2 losers — winners gain, losers lose, no inter-winner change', () => {
    const p: GameParticipant[] = [
      { userId: 'w1', elo: 1000, isWinner: true },
      { userId: 'w2', elo: 1000, isWinner: true },
      { userId: 'l1', elo: 1000, isWinner: false },
      { userId: 'l2', elo: 1000, isWinner: false },
    ];
    const out = calculateGameEloUpdates(p);
    // Each winner played 2 equal losers: +16 each → +32.
    expect(out.w1).toBe(1032);
    expect(out.w2).toBe(1032);
    expect(out.l1).toBe(968);
    expect(out.l2).toBe(968);
    // Symmetric winners get identical results — no change between them.
    expect(out.w1).toBe(out.w2);
  });

  it('floors ELO at 100 (never drops below)', () => {
    // Equal-rated loss is -16; from 110 that would be 94 → clamped to 100.
    const out = calculateGameEloUpdates([
      { userId: 'winner', elo: 110, isWinner: true },
      { userId: 'floored', elo: 110, isWinner: false },
    ]);
    expect(out.floored).toBe(100);
    expect(out.floored).toBeGreaterThanOrEqual(100);
  });

  it('order independence: uses pre-game ELO for every pair', () => {
    const a = calculateGameEloUpdates([
      { userId: 'w', elo: 1100, isWinner: true },
      { userId: 'l1', elo: 1000, isWinner: false },
      { userId: 'l2', elo: 1300, isWinner: false },
    ]);
    const b = calculateGameEloUpdates([
      { userId: 'l2', elo: 1300, isWinner: false },
      { userId: 'l1', elo: 1000, isWinner: false },
      { userId: 'w', elo: 1100, isWinner: true },
    ]);
    expect(a).toEqual(b);
  });

  it('STARTING_ELO is 1100 (mid-Bronze, 50% progress for new players)', () => {
    expect(STARTING_ELO).toBe(1100);
  });
});
