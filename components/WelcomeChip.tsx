// components/WelcomeChip.tsx
'use client';
import { GoogleG } from './GoogleG';
import { ArenaBadge } from './ArenaBadge';
import type { SkinId, TierId } from '@/lib/skins';

interface Props {
  user: { name: string; tier: TierId; skin: SkinId };
  /** When true, render the chip at a slightly larger size for desktop nav. */
  prominent?: boolean;
}

export function WelcomeChip({ user, prominent = false }: Props) {
  return (
    <div
      className={[
        'inline-flex items-center font-semibold rounded-full bg-[var(--hill-surface)] border border-[var(--hill-border)]',
        // Mobile size (default); desktop slightly larger via lg:
        'gap-2 py-[5px] pr-2.5 pl-[5px] text-xs',
        'lg:gap-2.5 lg:py-1.5 lg:pr-3 lg:pl-1.5 lg:text-[13px]',
        prominent ? 'lg:py-2 lg:pr-3.5' : '',
      ].join(' ')}
    >
      <div className="relative shrink-0 w-[26px] h-[26px] lg:w-[30px] lg:h-[30px] rounded-full bg-gradient-to-br from-[#3a3a3a] to-[#1a1a1a] flex items-center justify-center text-[12px] lg:text-[13px] font-extrabold text-[var(--hill-text)]">
        {user.name[0]?.toUpperCase()}
        <span className="absolute -bottom-0.5 -right-0.5 w-[13px] h-[13px] lg:w-[14px] lg:h-[14px] rounded-full bg-[var(--hill-bg)] p-[1.5px] flex items-center justify-center">
          <GoogleG size={9}/>
        </span>
      </div>
      <span className="text-[var(--hill-text)]">{user.name}</span>
      <ArenaBadge tier={user.tier}/>
    </div>
  );
}
