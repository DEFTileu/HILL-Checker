// components/CTAButton.tsx
'use client';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  full?: boolean;
  children: ReactNode;
}

/**
 * Mobile + desktop button. Hover lift + lime focus ring only on lg+ (keyboard
 * users on desktop). Mobile keeps the existing active:scale-98 pattern.
 */
export function CTAButton({
  variant = 'primary',
  full = true,
  children,
  className = '',
  ...rest
}: Props) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-bold tracking-[-0.01em] ' +
    'transition will-change-transform active:scale-[0.98] ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hill-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--hill-bg)] ' +
    'disabled:opacity-40 disabled:cursor-not-allowed';

  const sizing = 'h-[54px] px-6 text-[17px]';

  const variantCls = {
    // Spec §B: the acid lime is a FILL only; text on it is always near-black.
    // accentFill + onAccent are theme-independent, so the primary CTA looks
    // identical in dark and light (lime never degrades to unreadable ink).
    primary:
      'bg-[var(--hill-accentFill)] text-[var(--hill-onAccent)] border-0 ' +
      'lg:hover:enabled:brightness-110 lg:hover:enabled:-translate-y-0.5 lg:hover:enabled:shadow-[0_8px_24px_rgba(191,255,0,0.25)]',
    secondary:
      'bg-transparent text-[var(--hill-text)] border-[1.5px] border-[var(--hill-borderHi)] ' +
      'lg:hover:enabled:border-[var(--hill-accent)] lg:hover:enabled:text-[var(--hill-accent)] lg:hover:enabled:-translate-y-0.5',
    danger:
      'bg-transparent text-[var(--hill-danger)] border-[1.5px] border-[rgba(255,59,48,0.4)] ' +
      'lg:hover:enabled:border-[var(--hill-danger)] lg:hover:enabled:-translate-y-0.5',
    ghost:
      'bg-transparent text-[var(--hill-text)] border-[1.5px] border-[var(--hill-borderHi)]',
  }[variant];

  return (
    <button
      {...rest}
      className={[base, sizing, variantCls, full ? 'w-full' : '', className].join(' ')}
    >
      {children}
    </button>
  );
}
