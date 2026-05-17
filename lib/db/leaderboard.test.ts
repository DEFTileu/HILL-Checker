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
): LeaderboardEntry => ({ id, displayName, totalWins, totalGames });

describe('toLeaderboardRows', () => {
  it('assigns 1-based ranks in input order and maps fields', () => {
    const rows = toLeaderboardRows(
      [e('a', 'Ann', 30, 40), e('b', 'Bo', 10, 10)],
      'b',
    );
    expect(rows[0]).toEqual({
      rank: 1,
      name: 'Ann',
      tier: 'Gold', // 30 wins ≥ Gold(25)
      wins: 30,
      winRate: 75, // round(30/40*100)
      elo: 1600, // 1000 + 30*20
      isYou: false,
    });
    expect(rows[1].rank).toBe(2);
    expect(rows[1].isYou).toBe(true);
    expect(rows[1].winRate).toBe(100);
  });

  it('guards divide-by-zero when totalGames is 0', () => {
    const rows = toLeaderboardRows([e('a', 'Ann', 0, 0)]);
    expect(rows[0].winRate).toBe(0);
    expect(rows[0].tier).toBe('Bronze');
    expect(rows[0].isYou).toBe(false);
  });
});

describe('sortLeaderboard', () => {
  it('orders by wins desc, then win-rate, then games, then id (stable)', () => {
    const ranked = sortLeaderboard([
      e('lo', 'Lo', 5, 20), // tie 5w: 0.25 rate
      e('hi', 'Hi', 5, 5), // tie 5w: 1.00 rate
      e('mid', 'Mid', 5, 10), // tie 5w: 0.50 rate
      e('top', 'Top', 9, 20), // most wins
      e('z', 'Z', 1, 4), // 1w, 0.25 — fully tied with 'a' on w/rate/games
      e('a', 'A', 1, 4), // 1w, 0.25 — id breaks the tie ('a' < 'z')
    ]);
    expect(ranked.map((r) => r.id)).toEqual([
      'top', // 9 wins
      'hi', // 5 wins, 1.00
      'mid', // 5 wins, 0.50
      'lo', // 5 wins, 0.25
      'a', // 1 win, 0.25 — id tiebreak
      'z', // 1 win, 0.25
    ]);
  });

  it('is a pure copy — does not mutate the input', () => {
    const input = [e('a', 'A', 1, 2), e('b', 'B', 9, 9)];
    const out = sortLeaderboard(input);
    expect(input.map((x) => x.id)).toEqual(['a', 'b']);
    expect(out.map((x) => x.id)).toEqual(['b', 'a']);
  });
});
