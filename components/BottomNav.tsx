// components/BottomNav.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type TabId = 'hill' | 'top' | 'me';

const TABS: { id: TabId; href: string; label: string; icon: React.ReactNode }[] = [
  {
    id: 'hill', href: '/',
    label: 'HILL',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 19l5-8 4 5 3-4 6 7"/><path d="M3 19h18"/></svg>,
  },
  {
    id: 'top', href: '/leaderboard',
    label: 'TOP',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 4h10v4a5 5 0 01-10 0V4z"/><path d="M7 4H4v2a3 3 0 003 3M17 4h3v2a3 3 0 01-3 3"/><path d="M9 13h6l-1 4h-4l-1-4zM8 21h8"/></svg>,
  },
  {
    id: 'me', href: '/profile',
    label: 'ME',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6"/></svg>,
  },
];

function activeFromPath(pathname: string): TabId {
  if (pathname.startsWith('/leaderboard')) return 'top';
  if (pathname.startsWith('/profile')) return 'me';
  return 'hill';
}

/**
 * Mobile tab bar — `lg:hidden` so it disappears in favor of TopNav on desktop.
 */
export function BottomNav() {
  const pathname = usePathname();
  const active = activeFromPath(pathname ?? '/');

  return (
    <nav
      className="lg:hidden fixed left-0 right-0 bottom-0 z-50 flex pt-2 pb-7 bg-[var(--hill-surface)] border-t border-[var(--hill-border)]"
      aria-label="Primary"
    >
      {TABS.map(t => {
        const isActive = active === t.id;
        return (
          <Link
            key={t.id}
            href={t.href}
            className={[
              'flex-1 relative flex flex-col items-center gap-1 pt-1.5 pb-1 min-h-[44px]',
              isActive ? 'text-[var(--hill-accent)]' : 'text-[var(--hill-muted)]',
            ].join(' ')}
          >
            {isActive && (
              <span
                className="absolute -top-2 w-7 h-[3px] rounded-sm bg-[var(--hill-accent)]"
                style={{ boxShadow: '0 0 8px var(--hill-accent)' }}
              />
            )}
            <span style={{ filter: isActive ? 'drop-shadow(0 0 4px rgba(191,255,0,0.4))' : undefined }}>
              {t.icon}
            </span>
            <span className="text-[10px] font-extrabold tracking-[0.18em]">{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
