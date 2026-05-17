// lib/skins.ts
// Superset module: preserves the original Phase-3 exports used by the
// components/hill/* tree and lib/arena.ts, while ALSO exposing the names the
// flat Claude-Design export expects (TierId, SkinDef, UNLOCK_WINS, PlayerNum).
import { HILL } from './tokens';

export type { PlayerNum } from './tokens';

export type ArenaTier = 'Bronze' | 'Silver' | 'Gold' | 'Master' | 'Champion';
export type SkinId = 'bronze' | 'silver' | 'gold' | 'master' | 'champion';

/** Export-doc name for ArenaTier — identical string union. */
export type TierId = ArenaTier;

export interface SkinDef {
  name: string;
  tier: ArenaTier;
  color: string;
  tag: string;
}

export const TIER_RANK: Record<ArenaTier, number> = {
  Bronze: 0, Silver: 1, Gold: 2, Master: 3, Champion: 4,
};

export const SKINS: Record<SkinId, SkinDef> = {
  bronze:   { name: 'Bronze',   tier: 'Bronze',   color: HILL.bronze,   tag: 'DEFAULT' },
  silver:   { name: 'Silver',   tier: 'Silver',   color: HILL.silver,   tag: 'GRADIENT' },
  gold:     { name: 'Gold',     tier: 'Gold',     color: HILL.gold,     tag: 'HALO' },
  master:   { name: 'Master',   tier: 'Master',   color: HILL.master,   tag: 'FACETS' },
  champion: { name: 'Champion', tier: 'Champion', color: HILL.champion, tag: 'CROWN' },
};

export const TIER_META: Record<ArenaTier, { icon: string; color: string }> = {
  Bronze:   { icon: '🥉', color: HILL.bronze },
  Silver:   { icon: '🥈', color: HILL.silver },
  Gold:     { icon: '🥇', color: HILL.gold },
  Master:   { icon: '◆',  color: HILL.master },
  Champion: { icon: '👑', color: HILL.champion },
};

export const WINS_TO_UNLOCK: Record<ArenaTier, number> = {
  Bronze: 0, Silver: 5, Gold: 25, Master: 75, Champion: 150,
};

/** Export-doc alias for WINS_TO_UNLOCK. */
export const UNLOCK_WINS = WINS_TO_UNLOCK;

export const skinUnlocked = (skin: SkinId, userTier: ArenaTier) =>
  TIER_RANK[SKINS[skin].tier] <= TIER_RANK[userTier];
