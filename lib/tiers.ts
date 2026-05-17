// lib/tiers.ts
import { HILL } from './tokens';
import type { TierId } from './skins';

export interface TierMeta {
  color: string;
  icon: string;
  short: string;
}

export const TIER_META: Record<TierId, TierMeta> = {
  Bronze:   { color: HILL.bronze,   icon: '🥉', short: 'Bronze' },
  Silver:   { color: HILL.silver,   icon: '🥈', short: 'Silver' },
  Gold:     { color: HILL.gold,     icon: '🥇', short: 'Gold' },
  Master:   { color: HILL.master,   icon: '◆',  short: 'Master' },
  Champion: { color: HILL.champion, icon: '👑', short: 'Champion' },
};
