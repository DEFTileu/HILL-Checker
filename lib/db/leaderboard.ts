'use client';
import { getArenaTier, deriveElo } from '@/lib/arena';
import type { LeaderboardRow } from '@/components/hill/screens/Leaderboard';

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
  return (data as ProfileRow[]).map((r) => ({
    id: r.id,
    displayName: r.display_name,
    totalWins: r.total_wins,
    totalGames: r.total_games,
  }));
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
