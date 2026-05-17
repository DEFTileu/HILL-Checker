import type { ArenaTier } from '@/types/hill';
import { TIER_META } from '@/lib/skins';

export interface ArenaBadgeProps {
    tier: ArenaTier;
    size?: 'sm' | 'md';
}

export function ArenaBadge({ tier, size = 'sm' }: ArenaBadgeProps) {
    const m = TIER_META[tier];
    const sm = size === 'sm';
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full bg-white/[0.04] font-semibold uppercase whitespace-nowrap leading-none ${
                sm ? 'text-[10px] py-[2px] pr-[7px] pl-[5px]' : 'text-xs py-1 pr-2.5 pl-2'
            }`}
            style={{ borderWidth: 1, borderStyle: 'solid', borderColor: `${m.color}40`, color: m.color, letterSpacing: 0.2 }}
        >
      <span style={{ fontSize: sm ? 10 : 13 }}>{m.icon}</span>
            {tier}
    </span>
    );
}