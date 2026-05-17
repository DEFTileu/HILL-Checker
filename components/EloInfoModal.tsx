// components/EloInfoModal.tsx — controlled "how rating works" dialog.
// No shadcn/ui in this project, so this is a hand-rolled overlay:
// Esc + click-outside + (mobile) X to close, body-scroll lock, focus
// moved to the action button and restored to the trigger on close.
'use client';
import { useEffect, useRef } from 'react';
import { TIER_ELO_THRESHOLDS } from '@/lib/arena';
import { STARTING_ELO } from '@/lib/elo';
import { TIER_META } from '@/lib/tiers';
import type { ArenaTier } from '@/lib/skins';

interface Props {
  open: boolean;
  onClose: () => void;
}

// Spec emoji + skin-unlock copy. ELO ranges are NOT hard-coded — they are
// derived from TIER_ELO_THRESHOLDS so the modal can never drift from the
// real tier math.
const TIER_ORDER: ArenaTier[] = [
  'Bronze',
  'Silver',
  'Gold',
  'Master',
  'Champion',
];
const TIER_EMOJI: Record<ArenaTier, string> = {
  Bronze: '🥉',
  Silver: '🥈',
  Gold: '🥇',
  Master: '💎',
  Champion: '👑',
};
const TIER_SKIN: Record<ArenaTier, string> = {
  Bronze: 'Default (everyone)',
  Silver: 'Subtle gradient',
  Gold: 'Soft glow halo',
  Master: 'Gem facets + sparkles',
  Champion: 'Crown overlay + pulsing gold',
};

function tierRange(tier: ArenaTier, i: number): string {
  const low = TIER_ELO_THRESHOLDS[tier];
  const next = TIER_ORDER[i + 1];
  return next ? `${low}–${TIER_ELO_THRESHOLDS[next] - 1}` : `${low}+`;
}

const H = ({ children }: { children: React.ReactNode }) => (
  <h3 className="font-mono text-[11px] font-bold tracking-[0.22em] text-[var(--hill-accent)] mt-6 mb-2 first:mt-0">
    {children}
  </h3>
);

export function EloInfoModal({ open, onClose }: Props) {
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeBtn.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  // ELO needed to clear Bronze → Silver, used in the progress-bar example so
  // the worked numbers stay in sync with the constants (100 of 200).
  const bronzeFloor = TIER_ELO_THRESHOLDS.Bronze;
  const silverFloor = TIER_ELO_THRESHOLDS.Silver;
  const have = STARTING_ELO - bronzeFloor;
  const span = silverFloor - bronzeFloor;

  return (
    <div
      className="fixed inset-0 z-[100] flex bg-black/70 backdrop-blur-sm lg:items-center lg:justify-center lg:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="elo-info-title"
        onClick={(e) => e.stopPropagation()}
        className={[
          'relative flex flex-col bg-[var(--hill-bg)] w-full',
          // Mobile: full-screen with safe-area padding.
          'h-full',
          // Desktop: centered card.
          'lg:h-auto lg:max-h-[85vh] lg:w-auto lg:max-w-lg lg:rounded-2xl lg:border lg:border-[var(--hill-borderHi)] lg:shadow-[0_24px_60px_rgba(0,0,0,0.6)]',
        ].join(' ')}
        style={{
          paddingTop: 'max(1rem, env(safe-area-inset-top))',
          paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-5 lg:px-7 pt-1 lg:pt-6 shrink-0">
          <h2
            id="elo-info-title"
            className="font-display text-[28px] lg:text-[32px] tracking-[-0.03em] m-0"
          >
            How rating works
          </h2>
          <button
            ref={closeBtn}
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 -mr-1 mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg text-[var(--hill-muted)] border border-[var(--hill-border)] transition lg:hover:text-[var(--hill-text)] lg:hover:border-[var(--hill-accent)]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M5 5l14 14M19 5L5 19" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="hill-scroll overflow-y-auto px-5 lg:px-7 pb-5 lg:pb-6 pt-3 text-[13.5px] leading-relaxed text-[var(--hill-text)]">
          <H>ELO</H>
          <p className="text-[var(--hill-muted)]">
            Your skill score. Everyone starts at{' '}
            <strong className="text-[var(--hill-text)]">
              {STARTING_ELO} ELO
            </strong>
            . After every game:
          </p>
          <ul className="mt-2 space-y-1.5 text-[var(--hill-muted)]">
            <li>
              • Beat someone <em className="not-italic text-[var(--hill-text)]">higher-rated</em>:{' '}
              <strong className="text-[var(--hill-accent)]">gain more</strong> (up to ~+24)
            </li>
            <li>
              • Beat someone <em className="not-italic text-[var(--hill-text)]">equal</em>:{' '}
              <strong className="text-[var(--hill-accent)]">+16</strong>
            </li>
            <li>
              • Beat someone <em className="not-italic text-[var(--hill-text)]">lower</em>:{' '}
              <strong className="text-[var(--hill-accent)]">gain less</strong> (~+8)
            </li>
            <li>• Lose: lose the same amount the winner gained</li>
            <li>
              • Joint Kings (Hill): each winner gets a pairwise update against
              each loser; winners don&apos;t update against each other
            </li>
            <li>
              • ELO floor: never drops below{' '}
              <strong className="text-[var(--hill-text)]">100</strong>
            </li>
          </ul>

          <H>Tiers</H>
          <div className="overflow-hidden rounded-xl border border-[var(--hill-border)]">
            <table className="w-full border-collapse text-[12.5px]">
              <thead>
                <tr className="bg-[var(--hill-surface)] text-left font-mono text-[10px] tracking-[0.14em] text-[var(--hill-muted)]">
                  <th className="px-3 py-2 font-bold">TIER</th>
                  <th className="px-3 py-2 font-bold">ELO RANGE</th>
                  <th className="px-3 py-2 font-bold">SKIN UNLOCKED</th>
                </tr>
              </thead>
              <tbody>
                {TIER_ORDER.map((t, i) => (
                  <tr
                    key={t}
                    className="border-t border-[var(--hill-border)] bg-[var(--hill-bg)]"
                  >
                    <td className="px-3 py-2 font-bold whitespace-nowrap">
                      <span
                        style={{ color: TIER_META[t].color }}
                      >
                        {TIER_EMOJI[t]} {t}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-[var(--hill-muted)] whitespace-nowrap">
                      {tierRange(t, i)}
                    </td>
                    <td className="px-3 py-2 text-[var(--hill-muted)]">
                      {TIER_SKIN[t]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <H>Progress bar</H>
          <p className="text-[var(--hill-muted)]">
            Shows how close you are to the next tier.{' '}
            <span className="font-mono text-[var(--hill-text)]">
              &quot;BRONZE · {STARTING_ELO} / {silverFloor} ELO&quot;
            </span>{' '}
            means you have {have} ELO out of {span} you need to reach Silver.
          </p>

          <H>Premium skins</H>
          <p className="text-[var(--hill-muted)]">
            Stripe-purchased skins (
            <strong className="text-[var(--hill-text)]">Neon Glow</strong>,{' '}
            <strong className="text-[var(--hill-text)]">Galaxy</strong>,{' '}
            <strong className="text-[var(--hill-text)]">Royal Gold</strong>)
            are <strong className="text-[var(--hill-text)]">not</strong> tied
            to ELO — once bought, they&apos;re yours regardless of rating.
          </p>
        </div>

        {/* Footer action */}
        <div className="shrink-0 px-5 lg:px-7 pt-2">
          <button
            onClick={onClose}
            className="h-12 w-full rounded-xl bg-[var(--hill-accent)] text-[var(--hill-bg)] text-[14px] font-extrabold tracking-[0.02em] transition lg:hover:brightness-95"
          >
            Got it — close
          </button>
        </div>
      </div>
    </div>
  );
}
