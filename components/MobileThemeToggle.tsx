// components/MobileThemeToggle.tsx
'use client';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';

// Mirror BottomNav's gameplay check: on the board/overlay screens the
// chrome toggle would float over a pristine dark game surface, so hide it
// there (the board + overlays are theme-independent anyway).
function isGameplay(pathname: string): boolean {
  if (pathname === '/play/classic/local') return true;
  if (pathname === '/play/hill/local') return true;
  if (pathname.startsWith('/r/') && pathname !== '/r/new') return true;
  return false;
}

/**
 * Mobile counterpart to the TopNav switch (TopNav is desktop-only). Fixed
 * top-right on chrome screens; `lg:hidden` so it never doubles up with the
 * TopNav toggle on desktop.
 */
export function MobileThemeToggle() {
  const pathname = usePathname() ?? '/';
  if (isGameplay(pathname)) return null;

  return (
    <div
      className="lg:hidden fixed z-40 right-3"
      style={{ top: 'calc(env(safe-area-inset-top) + 12px)' }}
    >
      <ThemeToggle className="h-9 w-9 backdrop-blur-xl bg-[var(--hill-navBg)]" />
    </div>
  );
}
