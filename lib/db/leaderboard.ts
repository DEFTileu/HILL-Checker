'use client';
import { getArenaTier } from '@/lib/arena';
import { STARTING_ELO } from '@/lib/elo';
import type { LeaderboardRow } from '@/components/Leaderboard';
import type { LeaderboardRowData } from '@/components/LeaderboardRow';

export interface LeaderboardEntry {
  id: string;
  displayName: string;
  totalWins: number;
  totalGames: number;
  elo: number;
}

interface ProfileRow {
  id: string;
  display_name: string;
  total_wins: number;
  total_games: number;
  elo: number | null;
}

// ELO-ranked: highest ELO first; ties broken by wins, then win-rate, then
// games played, then id for a stable deterministic order. Pure + exported so
// it's unit-tested without a DB. Safe to apply after an `elo`-DESC + LIMIT 100
// fetch: the cutoff is on the sort key (elo), so tiebreakers only reorder
// within equal-ELO groups and never exclude an eligible higher-ranked row.
export function sortLeaderboard(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  const rate = (e: LeaderboardEntry) =>
    e.totalGames > 0 ? e.totalWins / e.totalGames : 0;
  return [...entries].sort(
    (a, b) =>
      b.elo - a.elo ||
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

  const sb = getSupabase();
  const select = 'id, display_name, total_wins, total_games, elo';
  const toEntries = (rows: ProfileRow[]) =>
    sortLeaderboard(
      rows.map((r) => ({
        id: r.id,
        displayName: r.display_name,
        totalWins: r.total_wins,
        totalGames: r.total_games,
        elo: r.elo ?? STARTING_ELO,
      })),
    );

  // Leaderboard is authorized-only: anonymous guests (is_anonymous = true)
  // never appear, regardless of games played. is_anonymous flips to false in
  // ensureProfile() once the account is Google-linked.

  // Normal case: authorized players who have actually played a game.
  const { data, error } = await sb
    .from('profiles')
    .select(select)
    .eq('is_anonymous', false)
    .gt('total_games', 0)
    .order('elo', { ascending: false })
    .limit(100);
  if (error) return [];
  if (data && data.length > 0) return toEntries(data as ProfileRow[]);

  // Fallback (per explicit request): if no authorized user has played yet,
  // don't show an empty board — list all AUTHORIZED users instead (0 wins /
  // 0 games → Bronze, 0% win-rate). Guests are still excluded. Once any real
  // game is recorded, the filtered query above takes over automatically.
  const { data: all, error: allErr } = await sb
    .from('profiles')
    .select(select)
    .eq('is_anonymous', false)
    .order('elo', { ascending: false })
    .limit(100);
  if (allErr || !all) return [];
  return toEntries(all as ProfileRow[]);
}

// Pure: entries are already sorted by the query; rank is 1-based input order.
export function toLeaderboardRows(
  entries: LeaderboardEntry[],
  currentUserId?: string,
): LeaderboardRow[] {
  return entries.map((en, i) => ({
    rank: i + 1,
    name: en.displayName,
    tier: getArenaTier(en.elo),
    wins: en.totalWins,
    winRate: en.totalGames
      ? Math.round((en.totalWins / en.totalGames) * 100)
      : 0,
    elo: en.elo,
    isYou: !!currentUserId && en.id === currentUserId,
  }));
}

// Pure: maps to the Claude Design table/row shape (carries `games` + `wr`,
// which the legacy LeaderboardRow shape drops). Entries are already sorted;
// rank is 1-based input order.
export function toLeaderboardTableRows(
  entries: LeaderboardEntry[],
  currentUserId?: string,
): LeaderboardRowData[] {
  return entries.map((en, i) => ({
    rank: i + 1,
    name: en.displayName,
    tier: getArenaTier(en.elo),
    wins: en.totalWins,
    games: en.totalGames,
    wr: en.totalGames
      ? Math.round((en.totalWins / en.totalGames) * 100)
      : 0,
    elo: en.elo,
    isYou: !!currentUserId && en.id === currentUserId,
  }));
}
