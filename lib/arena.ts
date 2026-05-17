import type { ArenaTier } from '@/lib/skins';
import { WINS_TO_UNLOCK, TIER_RANK } from '@/lib/skins';

// Tiers ordered low → high. Thresholds come from the single source of truth
// in lib/skins.ts (Bronze 0, Silver 5, Gold 25, Master 75, Champion 150) —
// this is what the Phase 3 acceptance criterion ("total_wins=25 → Gold")
// expects.
const TIERS_ASC = (Object.keys(TIER_RANK) as ArenaTier[]).sort(
  (a, b) => TIER_RANK[a] - TIER_RANK[b],
);

export function getArenaTier(wins: number): ArenaTier {
  let tier: ArenaTier = 'Bronze';
  for (const t of TIERS_ASC) {
    if (wins >= WINS_TO_UNLOCK[t]) tier = t;
  }
  return tier;
}

// ELO has no column in the MVP schema — derived for display only (profile +
// leaderboard). Single source of truth; profiles.ts and leaderboard.ts use it.
export const deriveElo = (wins: number): number => 1000 + wins * 20;
