// components/ThemeToggle.tsx
'use client';
import { useTheme } from '@/lib/use-theme';

interface Props {
  /** Extra classes (positioning) supplied by the caller. */
  className?: string;
}

/**
 * Sun/moon chrome switch. Re-skins the app chrome only; the board and the
 * Death/Winner overlays stay dark regardless (forced-dark subtrees).
 */
export function ThemeToggle({ className = '' }: Props) {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
      title={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
      className={[
        'inline-flex h-10 w-10 items-center justify-center rounded-[10px]',
        'border-[1.5px] border-[var(--hill-borderHi)] bg-transparent text-[var(--hill-text)]',
        'transition lg:hover:-translate-y-0.5 lg:hover:border-[var(--hill-accent)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hill-accent)]',
        'focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--hill-bg)]',
        className,
      ].join(' ')}
    >
      {isLight ? (
        // Moon — tap to go dark
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ) : (
        // Sun — tap to go light
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      )}
    </button>
  );
}
