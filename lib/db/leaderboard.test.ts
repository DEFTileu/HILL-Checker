import { describe, it, expect } from 'vitest';
import {
  toLeaderboardRows,
  sortLeaderboard,
  type LeaderboardEntry,
} from './leaderboard';

const e = (
  id: string,
  displayName: string,
  totalWins: number,
  totalGames: number,
  elo = 1000,
): LeaderboardEntry => ({ id, displayName, totalWins, totalGames, elo });

describe('toLeaderboardRows', () => {
  it('assigns 1-based ranks in input order and maps fields (tier from ELO)', () => {
    const rows = toLeaderboardRows(
      [e('a', 'Ann', 30, 40, 1450), e('b', 'Bo', 10, 10, 1100)],
      'b',
    );
    expect(rows[0]).toEqual({
      rank: 1,
      name: 'Ann',
      tier: 'Gold', // 1450 ≥ Gold(1400)
      wins: 30,
      winRate: 75, // round(30/40*100)
      elo: 1450,
      isYou: false,
    });
    expect(rows[1].rank).toBe(2);
    expect(rows[1].isYou).toBe(true);
    expect(rows[1].winRate).toBe(100);
    expect(rows[1].tier).toBe('Bronze'); // 1100 < Silver(1200)
  });

  it('guards divide-by-zero when totalGames is 0', () => {
    const rows = toLeaderboardRows([e('a', 'Ann', 0, 0, 1000)]);
    expect(rows[0].winRate).toBe(0);
    expect(rows[0].tier).toBe('Bronze');
    expect(rows[0].isYou).toBe(false);
  });
});

describe('sortLeaderboard', () => {
  it('orders by ELO desc, then wins, then win-rate, then games, then id', () => {
    const ranked = sortLeaderboard([
      e('mid', 'Mid', 5, 10, 1300),
      e('top', 'Top', 1, 50, 1700), // highest ELO wins regardless of wins
      e('lo', 'Lo', 99, 99, 1100), // most wins but lowest ELO → last-ish
      e('tieB', 'TieB', 3, 10, 1300), // ELO tie with mid; fewer wins → after
      e('z', 'Z', 2, 8, 1300), // ELO+wins+rate tie with 'a'
      e('a', 'A', 2, 8, 1300), // id breaks the final tie
    ]);
    expect(ranked.map((r) => r.id)).toEqual([
      'top', // 1700
      'mid', // 1300, 5 wins
      'tieB', // 1300, 3 wins
      'a', // 1300, 2 wins — id tiebreak
      'z', // 1300, 2 wins
      'lo', // 1100
    ]);
  });

  it('is a pure copy — does not mutate the input', () => {
    const input = [e('a', 'A', 1, 2, 1000), e('b', 'B', 9, 9, 1500)];
    const out = sortLeaderboard(input);
    expect(input.map((x) => x.id)).toEqual(['a', 'b']);
    expect(out.map((x) => x.id)).toEqual(['b', 'a']);
  });
});
