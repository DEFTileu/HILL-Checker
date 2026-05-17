'use client';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type BottomNavTab = 'hill' | 'top' | 'me';
export interface BottomNavProps {
    active?: BottomNavTab; // override path detection if needed
}

const TABS: { id: BottomNavTab; label: string; href: string; icon: ReactNode }[] = [
    { id: 'hill', label: 'HILL', href: '/',
        icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 19l5-8 4 5 3-4 6 7"/><path d="M3 19h18"/></svg> },
    { id: 'top', label: 'TOP', href: '/leaderboard',
        icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 4h10v4a5 5 0 01-10 0V4z"/><path d="M7 4H4v2a3 3 0 003 3M17 4h3v2a3 3 0 01-3 3"/><path d="M9 13h6l-1 4h-4l-1-4zM8 21h8"/></svg> },
    { id: 'me', label: 'ME', href: '/profile',
        icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6"/></svg> },
];

export function BottomNav({ active }: BottomNavProps) {
    const path = usePathname();
    const detected: BottomNavTab =
        path === '/leaderboard' ? 'top' : path === '/profile' ? 'me' : 'hill';
    const current = active ?? detected;

    return (
        <nav
            className="fixed inset-x-0 bottom-0 z-40 flex bg-hill-surface border-t border-hill-border pt-2"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)' }}
        >
            {TABS.map(t => {
                const isActive = current === t.id;
                return (
                    <Link
                        key={t.id}
                        href={t.href}
                        className={`relative flex-1 flex flex-col items-center gap-1 py-1.5 min-h-[44px] ${
                            isActive ? 'text-hill-accent' : 'text-hill-muted'
                        }`}
                    >
                        {isActive && (
                            <div
                                className="absolute -top-2 h-[3px] w-7 rounded-sm bg-hill-accent"
                                style={{ boxShadow: '0 0 8px #BFFF00' }}
                            />
                        )}
                        <div style={{ filter: isActive ? 'drop-shadow(0 0 4px #BFFF0060)' : 'none' }}>{t.icon}</div>
                        <div className="text-[10px] font-extrabold tracking-[0.18em]">{t.label}</div>
                    </Link>
                );
            })}
        </nav>
    );
}