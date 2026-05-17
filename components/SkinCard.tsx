// components/SkinCard.tsx
'use client';
import type { ButtonHTMLAttributes } from 'react';
import { PieceShape } from './PieceShape';
import type { SkinId, PlayerNum } from '@/lib/skins';
import { ALL_SKINS } from '@/lib/skins';

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  skinId: SkinId;
  samplePlayer?: PlayerNum;
  selected?: boolean;
  locked?: boolean;
  unlockText?: string | null;
}

export function SkinCard({ skinId, samplePlayer = 1, selected, locked, unlockText, ...rest }: Props) {
  const meta = ALL_SKINS[skinId];
  return (
    <button
      {...rest}
      disabled={locked}
      className={[
        'relative shrink-0 flex flex-col items-center gap-2 rounded-[14px] transition focus-visible:outline-none',
        'min-w-[116px] px-3 pt-3.5 pb-3 lg:min-w-0 lg:px-3.5 lg:pt-[18px] lg:pb-3.5',
        'bg-[var(--hill-surface)] border-[1.5px]',
        selected
          ? 'border-[var(--hill-accent)] bg-[rgba(191,255,0,0.05)] shadow-[0_0_18px_rgba(191,255,0,0.12)]'
          : 'border-[var(--hill-border)] lg:hover:border-[var(--hill-accent)] lg:hover:-translate-y-0.5',
        locked ? 'opacity-55' : '',
        'focus-visible:ring-2 focus-visible:ring-[var(--hill-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--hill-bg)]',
      ].join(' ')}
    >
      <div
        className={[
          'relative flex items-center justify-center rounded-xl border border-[var(--hill-border)]',
          'w-14 h-14 lg:w-[76px] lg:h-[76px] lg:rounded-[14px]',
          locked
            ? 'bg-white/[0.03] grayscale brightness-75'
            : 'bg-gradient-to-br from-[#1f1f1f] to-[#0f0f0f]',
        ].join(' ')}
      >
        <PieceShape player={samplePlayer as PlayerNum} size={32} skin={skinId} />
        {locked && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-[rgba(10,10,10,0.55)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--hill-muted)" strokeWidth="2" strokeLinecap="round">
              <rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/>
            </svg>
          </div>
        )}
      </div>

      <div className="text-center min-h-[28px]">
        <div className="text-[13px] lg:text-sm font-bold text-[var(--hill-text)] tracking-[-0.01em]">
          {meta.name}
        </div>
        <div className="font-mono text-[9px] tracking-[0.14em] mt-0.5" style={{ color: meta.color }}>
          {meta.tag}
        </div>
      </div>

      {selected && !locked && (
        <div className="text-[9px] font-extrabold tracking-[0.14em] text-[var(--hill-bg)] bg-[var(--hill-accent)] px-1.5 py-[3px] rounded">
          SELECTED
        </div>
      )}
      {locked && unlockText && (
        <div className="text-[9px] text-[var(--hill-muted)] font-mono tracking-[0.08em] text-center leading-[1.3]">
          {unlockText}
        </div>
      )}
      {!selected && !locked && (
        <div className="text-[9px] text-[var(--hill-muted)] font-mono tracking-[0.14em] lg:hidden">TAP</div>
      )}
    </button>
  );
}
