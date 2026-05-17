// components/PlayStyleCard.tsx
'use client';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  id: 'hotseat' | 'multi';
  title: string;
  caption: string;
  desc: string;
  icon: ReactNode;
  selected?: boolean;
}

export function PlayStyleCard({ id: _id, title, caption, desc, icon, selected, ...rest }: Props) {
  return (
    <button
      {...rest}
      className={[
        'relative w-full text-left rounded-2xl transition focus-visible:outline-none',
        'p-5 lg:p-8',
        'bg-[var(--hill-surface)] border-[1.5px]',
        selected
          ? 'border-[var(--hill-accent)] bg-[rgba(191,255,0,0.04)] shadow-[0_0_24px_rgba(191,255,0,0.15)] lg:shadow-[0_0_36px_rgba(191,255,0,0.15)]'
          : 'border-[var(--hill-border)] lg:hover:border-[var(--hill-accent)] lg:hover:shadow-[0_0_20px_rgba(191,255,0,0.2)] lg:hover:-translate-y-0.5',
        'focus-visible:ring-2 focus-visible:ring-[var(--hill-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--hill-bg)]',
      ].join(' ')}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 lg:gap-[18px]">
          <div
            className={[
              'rounded-xl lg:rounded-[18px] flex items-center justify-center w-11 h-11 lg:w-[72px] lg:h-[72px] border',
              selected ? 'bg-[rgba(191,255,0,0.08)] border-[rgba(191,255,0,0.3)] text-[var(--hill-accent)]'
                : 'bg-white/[0.04] border-[var(--hill-border)] text-[var(--hill-text)]',
            ].join(' ')}
          >
            {icon}
          </div>
          <div>
            <div className="text-lg lg:text-[38px] font-extrabold tracking-[-0.02em] lg:tracking-[-0.03em] leading-none">{title}</div>
            <div className="text-[11px] lg:text-xs text-[var(--hill-muted)] mt-0.5 lg:mt-1 font-mono tracking-[0.04em] lg:tracking-[0.14em] uppercase">
              {caption}
            </div>
          </div>
        </div>
        <div
          className={[
            'rounded-full flex items-center justify-center transition-colors w-[22px] h-[22px] lg:w-[30px] lg:h-[30px] border-[1.5px] lg:border-2',
            selected ? 'border-[var(--hill-accent)] bg-[var(--hill-accent)]' : 'border-[var(--hill-borderHi)] bg-transparent',
          ].join(' ')}
        >
          {selected && (
            <svg className="w-3 h-3 lg:w-4 lg:h-4" viewBox="0 0 12 12" fill="none" stroke="#0A0A0A" strokeWidth="2.5" strokeLinecap="round">
              <path d="M2 6l3 3 5-6"/>
            </svg>
          )}
        </div>
      </div>
      <div className="text-[13px] lg:text-[17px] mt-3.5 lg:mt-5 leading-snug lg:leading-normal text-pretty">
        {desc}
      </div>
    </button>
  );
}
