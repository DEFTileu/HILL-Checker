import { describe, it, expect } from 'vitest';
import { toLeaderboardRows, type LeaderboardEntry } from './leaderboard';

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
