'use client';
import { getArenaTier, deriveElo } from '@/lib/arena';
import type { LeaderboardRow } from '@/components/Leaderboard';

export interface LeaderboardEntry {
  id: string;
  displayName: string;
  totalWins: number;
  totalGames: number;
}

interface ProfileRow {
  id: string;
  display_name: string;
  total_wins: number;
  total_games: number;
}

// CoC-style ranking: most wins first; ties broken by win-rate, then by games
// played (more active outranks when otherwise tied), then by id for a stable
// deterministic order. Pure + exported so it's unit-tested without a DB.
// Safe to apply after a `total_wins`-DESC + LIMIT 100 fetch: the cutoff is on
// the primary key (wins), so tiebreakers only reorder within equal-wins groups
// and never exclude an eligible higher-ranked row.
export function sortLeaderboard(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  const rate = (e: LeaderboardEntry) =>
    e.totalGames > 0 ? e.totalWins / e.totalGames : 0;
  return [...entries].sort(
    (a, b) =>
      b.totalWins - a.totalWins ||
      rate(b) - rate(a) ||
      b.totalGames - a.totalGames ||
      (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
  );
}

// Reads the profiles table directly (RLS profiles_select_all permits it).
// Returns [] on error or no data — the page renders an empty state.
export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  // Lazy import to avoid test environment issues
  const { getSupabase } = await import('@/lib/multiplayer/client');

  const { data, error } = await getSupabase()
    .from('profiles')
    .select('id, display_name, total_wins, total_games')
    .gt('total_games', 0)
    .order('total_wins', { ascending: false })
    .limit(100);
  if (error || !data) return [];
  return sortLeaderboard(
    (data as ProfileRow[]).map((r) => ({
      id: r.id,
      displayName: r.display_name,
      totalWins: r.total_wins,
      totalGames: r.total_games,
    })),
  );
}

// Pure: entries are already sorted by the query; rank is 1-based input order.
export function toLeaderboardRows(
  entries: LeaderboardEntry[],
  currentUserId?: string,
): LeaderboardRow[] {
  return entries.map((en, i) => ({
    rank: i + 1,
    name: en.displayName,
    tier: getArenaTier(en.totalWins),
    wins: en.totalWins,
    winRate: en.totalGames
      ? Math.round((en.totalWins / en.totalGames) * 100)
      : 0,
    elo: deriveElo(en.totalWins),
    isYou: !!currentUserId && en.id === currentUserId,
  }));
}
