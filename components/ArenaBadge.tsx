// components/ArenaBadge.tsx
import type { TierId } from '@/lib/skins';
import { TIER_META } from '@/lib/tiers';

interface Props {
  tier?: TierId;
  size?: 'sm' | 'md';
  label?: boolean;
}

export function ArenaBadge({ tier = 'Bronze', size = 'sm', label = true }: Props) {
  const m = TIER_META[tier];
  const sm = size === 'sm';
  return (
    <span
      className={[
        'inline-flex items-center font-semibold uppercase whitespace-nowrap leading-none rounded-full',
        'bg-white/5 border',
        sm ? 'gap-1 py-0.5 pr-[7px] pl-[5px] text-[10px]' : 'gap-1.5 py-1 pr-2.5 pl-2 text-xs',
      ].join(' ')}
      style={{ borderColor: `${m.color}40`, color: m.color, letterSpacing: '0.04em' }}
    >
      <span style={{ fontSize: sm ? 10 : 13 }}>{m.icon}</span>
      {label && <span>{m.short}</span>}
    </span>
  );
}
