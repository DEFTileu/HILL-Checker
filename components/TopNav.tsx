// components/TopNav.tsx  (NEW — desktop-only header)
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GoogleG } from './GoogleG';
import { WelcomeChip } from './WelcomeChip';
import type { SkinId, TierId } from '@/lib/skins';

interface UserSummary {
  name: string;
  tier: TierId;
  skin: SkinId;
}

interface Props {
  user?: UserSummary | null;
  onSignIn?: () => void;
}

const TABS = [
  { id: 'hill', href: '/',            label: 'HILL' },
  { id: 'top',  href: '/leaderboard', label: 'TOP'  },
  { id: 'me',   href: '/profile',     label: 'ME'   },
] as const;

function activeFromPath(pathname: string): typeof TABS[number]['id'] {
  if (pathname.startsWith('/leaderboard')) return 'top';
  if (pathname.startsWith('/profile')) return 'me';
  return 'hill';
}

/**
 * Desktop sticky header. Hidden on mobile (`hidden lg:flex`).
 * Mount above page content in app/layout.tsx; coexists with BottomNav since
 * BottomNav is `lg:hidden` and TopNav is `hidden lg:flex`.
 */
export function TopNav({ user, onSignIn }: Props) {
  const pathname = usePathname() ?? '/';
  const active = activeFromPath(pathname);

  return (
    <header
      className="hidden lg:flex sticky top-0 z-30 h-16 items-center backdrop-blur-xl bg-[rgba(10,10,10,0.85)] border-b border-[var(--hill-border)]"
    >
      <div className="w-full max-w-[1280px] mx-auto px-8 flex items-center justify-between gap-8">
        <Link href="/" className="inline-flex items-baseline gap-2 no-underline">
          <span className="font-extrabold tracking-[-0.04em] text-[28px] leading-none text-[var(--hill-text)]">
            HILL
          </span>
          <span
            className="w-[18px] h-[3px] bg-[var(--hill-accent)] self-center"
            style={{ boxShadow: '0 0 8px var(--hill-accent)' }}
          />
        </Link>

        <nav className="flex items-center gap-10" aria-label="Primary">
          {TABS.map(t => {
            const isActive = active === t.id;
            return (
              <Link
                key={t.id}
                href={t.href}
                className={[
                  'relative py-1 px-0.5 font-extrabold text-[12px] tracking-[0.22em] transition-colors',
                  isActive ? 'text-[var(--hill-text)]' : 'text-[var(--hill-muted)] hover:text-[var(--hill-text)]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hill-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--hill-bg)] rounded-sm',
                ].join(' ')}
              >
                {t.label}
                {isActive && (
                  <span
                    className="absolute left-1/2 -translate-x-1/2 -bottom-[19px] w-[34px] h-[3px] rounded-sm bg-[var(--hill-accent)]"
                    style={{ boxShadow: '0 0 10px var(--hill-accent)' }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="min-w-[240px] flex items-center justify-end gap-3">
          {user ? (
            <WelcomeChip user={user} />
          ) : (
            <button
              onClick={onSignIn}
              className="h-10 px-4 rounded-[10px] bg-transparent border-[1.5px] border-[var(--hill-borderHi)] text-[var(--hill-text)] text-[13px] font-bold inline-flex items-center gap-2 transition lg:hover:border-[var(--hill-accent)] lg:hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hill-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--hill-bg)]"
            >
              <GoogleG size={16}/> Sign in with Google
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
