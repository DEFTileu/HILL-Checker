// components/ModeCard.tsx
'use client';
import type { ButtonHTMLAttributes } from 'react';
import { HILL } from '@/lib/tokens';

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  mode: 'blitz' | 'survival';
  selected?: boolean;
}

/**
 * Used inside a `flex-col gap-3 lg:flex-row lg:gap-5` container on the
 * mode-select page; card itself reflows internally on lg+ — bigger icon,
 * larger headline, meta strip uses grid columns instead of inline flex.
 */
export function ModeCard({ mode, selected, ...rest }: Props) {
  const isBlitz = mode === 'blitz';
  return (
    <button
      {...rest}
      className={[
        'relative w-full text-left rounded-2xl transition focus-visible:outline-none',
        'p-5 lg:p-8',
        'bg-[var(--hill-surface)] border-[1.5px]',
        selected ? 'border-[var(--hill-accent)] bg-[rgba(191,255,0,0.04)] shadow-[0_0_24px_rgba(191,255,0,0.15)] lg:shadow-[0_0_36px_rgba(191,255,0,0.15)]'
          : 'border-[var(--hill-border)] lg:hover:border-[var(--hill-accent)] lg:hover:shadow-[0_0_20px_rgba(191,255,0,0.2)] lg:hover:-translate-y-0.5',
        'focus-visible:ring-2 focus-visible:ring-[var(--hill-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--hill-bg)]',
      ].join(' ')}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 lg:gap-[18px]">
          <div
            className="rounded-xl lg:rounded-[18px] flex items-center justify-center w-11 h-11 lg:w-[72px] lg:h-[72px] border"
            style={{
              background: isBlitz ? 'rgba(191,255,0,0.08)' : 'rgba(255,59,48,0.08)',
              borderColor: isBlitz ? 'rgba(191,255,0,0.3)' : 'rgba(255,59,48,0.3)',
              color: isBlitz ? HILL.accent : HILL.danger,
            }}
          >
            {isBlitz
              ? <svg className="w-[22px] h-[22px] lg:w-9 lg:h-9" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L4 14h7l-2 8 9-12h-7l2-8z"/></svg>
              : <svg className="w-[22px] h-[22px] lg:w-9 lg:h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="11" r="2"/><circle cx="15" cy="11" r="2"/><path d="M6 18c0-2 0-6 6-6s6 4 6 6"/><circle cx="12" cy="12" r="9.5"/></svg>}
          </div>
          <div>
            <div className="text-[19px] lg:text-[42px] font-extrabold tracking-[-0.02em] lg:tracking-[-0.03em] leading-none">
              {isBlitz ? 'BLITZ' : 'SURVIVAL'}
            </div>
            <div className="text-xs lg:text-[12px] text-[var(--hill-muted)] mt-0.5 lg:mt-1 font-mono tracking-[0.04em] lg:tracking-[0.14em]">
              {isBlitz ? '~3 MIN' : '~5-7 MIN'}
              <span className="hidden lg:inline"> · {isBlitz ? '7 ROUNDS' : 'LAST ALIVE'}</span>
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

      <div className="text-sm lg:text-[17px] mt-3.5 lg:mt-5 leading-snug lg:leading-normal text-pretty">
        {isBlitz
          ? 'Seven rounds, fixed clock. Multiple kings can rule. Most pieces on the hill at the bell wins the round.'
          : 'Last player with pieces wins. Tighter board pressure, slower burn — outlast everyone.'}
      </div>

      <div className="hidden lg:grid lg:grid-cols-3 gap-3.5 mt-6 pt-5 border-t border-[var(--hill-border)]">
        {([
          ['CLOCK',   '15s / turn'],
          ['ROUNDS',  isBlitz ? '7' : 'No limit'],
          ['PLAYERS', '2–4'],
        ] as const).map(([k, v]) => (
          <div key={k}>
            <div className="font-mono text-[10px] font-bold text-[var(--hill-muted)] tracking-[0.16em]">{k}</div>
            <div className="text-[15px] font-bold mt-1">{v}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-3.5 mt-3.5 pt-3.5 border-t border-[var(--hill-border)] text-[11px] font-mono text-[var(--hill-muted)] tracking-[0.04em] lg:hidden">
        <span>15s / TURN</span>
        <span className="text-[var(--hill-border)]">·</span>
        <span>{isBlitz ? '7 ROUNDS' : 'NO LIMIT'}</span>
        <span className="text-[var(--hill-border)]">·</span>
        <span>2–4 PLAYERS</span>
      </div>
    </button>
  );
}
