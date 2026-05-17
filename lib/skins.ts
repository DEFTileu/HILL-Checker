// lib/skins.ts
// Superset module: preserves the original Phase-3 exports used by
// lib/arena.ts, while ALSO exposing the names the
// flat Claude-Design export expects (TierId, SkinDef, UNLOCK_WINS, PlayerNum).
import { HILL } from './tokens';

export type { PlayerNum } from './tokens';

export type ArenaTier = 'Bronze' | 'Silver' | 'Gold' | 'Master' | 'Champion';
export type TierSkinId = 'bronze' | 'silver' | 'gold' | 'master' | 'champion';
export type PremiumSkinId = 'neon_glow' | 'galaxy' | 'royal_gold';
export type SkinId = TierSkinId | PremiumSkinId;

export const PREMIUM_SKIN_IDS: PremiumSkinId[] = [
  'neon_glow',
  'galaxy',
  'royal_gold',
];

/** Export-doc name for ArenaTier — identical string union. */
export type TierId = ArenaTier;

export interface SkinDef {
  name: string;
  // Tier-gated skins carry their unlock tier. Premium (purchased) skins have
  // no tier — they unlock by ownership, not ELO.
  tier?: ArenaTier;
  color: string;
  tag: string;
}

export const TIER_RANK: Record<ArenaTier, number> = {
  Bronze: 0, Silver: 1, Gold: 2, Master: 3, Champion: 4,
};

/** The 5 ELO-gated tier skins. Iterated for the profile "tier" section. */
export const SKINS: Record<TierSkinId, SkinDef> = {
  bronze:   { name: 'Bronze',   tier: 'Bronze',   color: HILL.bronze,   tag: 'DEFAULT' },
  silver:   { name: 'Silver',   tier: 'Silver',   color: HILL.silver,   tag: 'GRADIENT' },
  gold:     { name: 'Gold',     tier: 'Gold',     color: HILL.gold,     tag: 'HALO' },
  master:   { name: 'Master',   tier: 'Master',   color: HILL.master,   tag: 'FACETS' },
  champion: { name: 'Champion', tier: 'Champion', color: HILL.champion, tag: 'CROWN' },
};

/** The 3 purchasable premium skins. Pricing lives in lib/stripe-products.ts. */
export const PREMIUM_SKINS: Record<PremiumSkinId, SkinDef> = {
  neon_glow:  { name: 'Neon Glow',  color: '#00D9FF', tag: 'PULSE' },
  galaxy:     { name: 'Galaxy',     color: '#6B46C1', tag: 'COSMIC' },
  royal_gold: { name: 'Royal Gold', color: '#FFD700', tag: 'SHIMMER' },
};

/** Unified metadata lookup over every skin (tier + premium). */
export const ALL_SKINS: Record<SkinId, SkinDef> = {
  ...SKINS,
  ...PREMIUM_SKINS,
};

export const WINS_TO_UNLOCK: Record<ArenaTier, number> = {
  Bronze: 0, Silver: 5, Gold: 25, Master: 75, Champion: 150,
};

/** Export-doc alias for WINS_TO_UNLOCK. */
export const UNLOCK_WINS = WINS_TO_UNLOCK;

export const skinUnlocked = (skin: TierSkinId, userTier: ArenaTier) =>
  TIER_RANK[SKINS[skin].tier as ArenaTier] <= TIER_RANK[userTier];

// ── ELO-based skin unlocks ───────────────────────────────────────────────────
// Each skin unlocks at its tier's ELO floor (mirrors TIER_ELO_THRESHOLDS in
// lib/arena.ts — kept here to avoid a circular import).
export const SKIN_REQUIREMENTS: Record<TierSkinId, number> = {
  bronze: 1000,
  silver: 1200,
  gold: 1400,
  master: 1600,
  champion: 1800,
};

export function getUnlockedSkins(elo: number): TierSkinId[] {
  return (Object.keys(SKIN_REQUIREMENTS) as TierSkinId[]).filter(
    (s) => elo >= SKIN_REQUIREMENTS[s],
  );
}

// A skin is owned if it's an ELO-unlocked tier skin OR a premium skin the
// user has purchased (owned_skins, written by the Stripe webhook).
export function getOwnedSkins(
  elo: number,
  ownedSkinIds: string[],
): SkinId[] {
  const tierSkins = getUnlockedSkins(elo);
  const premium = ownedSkinIds.filter((id): id is PremiumSkinId =>
    (PREMIUM_SKIN_IDS as string[]).includes(id),
  );
  return [...tierSkins, ...premium];
}
