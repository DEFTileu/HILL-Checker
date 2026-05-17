import type { ArenaTier } from '@/lib/skins';

// Single source of truth for ELO → tier mapping. Used by profiles.ts,
// leaderboard.ts, the profile page progress bar, and skin unlocks.
export const TIER_ELO_THRESHOLDS: Record<ArenaTier, number> = {
  Bronze: 1000,
  Silver: 1200,
  Gold: 1400,
  Master: 1600,
  Champion: 1800,
};

const TIERS_ASC: ArenaTier[] = [
  'Bronze',
  'Silver',
  'Gold',
  'Master',
  'Champion',
];

export function getArenaTier(elo: number): ArenaTier {
  if (elo >= TIER_ELO_THRESHOLDS.Champion) return 'Champion';
  if (elo >= TIER_ELO_THRESHOLDS.Master) return 'Master';
  if (elo >= TIER_ELO_THRESHOLDS.Gold) return 'Gold';
  if (elo >= TIER_ELO_THRESHOLDS.Silver) return 'Silver';
  return 'Bronze';
}

export interface TierProgress {
  currentTier: ArenaTier;
  nextTier: ArenaTier | null;
  currentElo: number;
  progressPct: number;
  eloToNext: number | null;
}

export function getTierProgress(elo: number): TierProgress {
  let currentTier: ArenaTier = 'Bronze';
  for (const t of TIERS_ASC) {
    if (elo >= TIER_ELO_THRESHOLDS[t]) currentTier = t;
  }
  const currentIdx = TIERS_ASC.indexOf(currentTier);
  const nextTier =
    currentIdx < TIERS_ASC.length - 1 ? TIERS_ASC[currentIdx + 1] : null;

  if (!nextTier) {
    return {
      currentTier,
      nextTier: null,
      currentElo: elo,
      progressPct: 100,
      eloToNext: null,
    };
  }

  const currentEloFloor = TIER_ELO_THRESHOLDS[currentTier];
  const nextEloFloor = TIER_ELO_THRESHOLDS[nextTier];
  const progressPct = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        ((elo - currentEloFloor) / (nextEloFloor - currentEloFloor)) * 100,
      ),
    ),
  );
  return {
    currentTier,
    nextTier,
    currentElo: elo,
    progressPct,
    eloToNext: nextEloFloor - elo,
  };
}
