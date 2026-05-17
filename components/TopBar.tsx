// components/TopBar.tsx
'use client';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

interface Props {
  /** Show back chevron — defaults to true. Hidden on lg+ when TopNav covers nav. */
  back?: boolean;
  code?: string;
  title?: string;
  right?: ReactNode;
  /** When true, hide the entire bar on desktop (TopNav takes over). */
  hideOnDesktop?: boolean;
}

/**
 * Mobile sticky in-flow top bar — back arrow, optional room code/title, slot for actions.
 * Pass `hideOnDesktop` on pages where the global TopNav already covers chrome.
 */
export function TopBar({ back = true, code, title, right, hideOnDesktop = true }: Props) {
  const router = useRouter();
  return (
    <div
      className={[
        'sticky top-0 z-20 flex items-center justify-between px-4 pt-3.5 pb-3 bg-[var(--hill-bg)] border-b border-[var(--hill-border)]',
        hideOnDesktop ? 'lg:hidden' : '',
      ].join(' ')}
    >
      <div className="flex items-center gap-2.5">
        {back && (
          <button
            onClick={() => router.back()}
            aria-label="Back"
            className="w-9 h-9 rounded-[10px] bg-[var(--hill-surface)] border border-[var(--hill-border)] inline-flex items-center justify-center text-[var(--hill-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hill-accent)]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5"/></svg>
          </button>
        )}
        {code && (
          <div className="font-mono text-xs font-bold text-[var(--hill-muted)] tracking-[0.18em]">
            ROOM · <span className="text-[var(--hill-text)]">{code}</span>
          </div>
        )}
        {title && <div className="text-[15px] font-semibold">{title}</div>}
      </div>
      <div className="flex items-center gap-2">{right}</div>
    </div>
  );
}
