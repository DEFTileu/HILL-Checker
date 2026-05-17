import type { ArenaTier, SkinId } from '@/types/hill';

export const TIER_RANK: Record<ArenaTier, number> = {
    Bronze: 0, Silver: 1, Gold: 2, Master: 3, Champion: 4,
};

export const SKINS: Record<SkinId, { name: string; tier: ArenaTier; color: string; tag: string }> = {
    bronze:   { name: 'Bronze',   tier: 'Bronze',   color: '#CD7F32', tag: 'DEFAULT' },
    silver:   { name: 'Silver',   tier: 'Silver',   color: '#C0C0C0', tag: 'GRADIENT' },
    gold:     { name: 'Gold',     tier: 'Gold',     color: '#FFD700', tag: 'HALO' },
    master:   { name: 'Master',   tier: 'Master',   color: '#9B59B6', tag: 'FACETS' },
    champion: { name: 'Champion', tier: 'Champion', color: '#BFFF00', tag: 'CROWN' },
};

export const TIER_META: Record<ArenaTier, { icon: string; color: string }> = {
    Bronze:   { icon: '🥉', color: '#CD7F32' },
    Silver:   { icon: '🥈', color: '#C0C0C0' },
    Gold:     { icon: '🥇', color: '#FFD700' },
    Master:   { icon: '◆',  color: '#9B59B6' },
    Champion: { icon: '👑', color: '#BFFF00' },
};

export const WINS_TO_UNLOCK: Record<ArenaTier, number> = {
    Bronze: 0, Silver: 5, Gold: 25, Master: 75, Champion: 150,
};

export const skinUnlocked = (skin: SkinId, userTier: ArenaTier) =>
    TIER_RANK[SKINS[skin].tier] <= TIER_RANK[userTier];