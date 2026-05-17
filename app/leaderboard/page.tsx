// app/leaderboard/page.tsx — Claude Design table/cards, wired to real data.
'use client';
import { useEffect, useState } from 'react';
import { LeaderboardRow } from '@/components/LeaderboardRow';
import { LeaderboardTable } from '@/components/LeaderboardTable';
import {
  getLeaderboard,
  toLeaderboardTableRows,
} from '@/lib/db/leaderboard';
import type { LeaderboardRowData } from '@/components/LeaderboardRow';
import { useAuth } from '@/lib/auth';

const FILTERS = ['Global', 'Friends · 12', 'This week', 'Blitz only', 'Survival only'] as const;

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<LeaderboardRowData[] | null>(null);
  const [active, setActive] = useState<typeof FILTERS[number]>('Global');

  useEffect(() => {
    let alive = true;
    getLeaderboard().then((entries) => {
      if (!alive) return;
      setRows(toLeaderboardTableRows(entries, user?.id));
    });
    return () => {
      alive = false;
    };
  }, [user]);

  if (rows === null) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center font-mono text-[12px] tracking-[0.18em] text-[var(--hill-muted)]">
        LOADING…
      </div>
    );
  }

  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3);
  const n = rows.length;

  return (
    <div className="mx-auto w-full max-w-[1280px] px-5 lg:px-12 pt-6 lg:pt-12 pb-10 lg:pb-16">
      {/* Headline */}
      <div className="lg:flex lg:items-baseline lg:gap-4 mb-2">
        <span className="font-mono text-[11px] font-bold tracking-[0.24em] lg:tracking-[0.32em] text-[var(--hill-accent)]">
          RANKED · SEASON 03
        </span>
      </div>
      <div className="lg:flex lg:items-baseline lg:justify-between lg:gap-8 mb-6 lg:mb-7">
        <h1 className="font-display text-[56px] lg:text-[96px] m-0 tracking-[-0.05em] mt-1.5 lg:mt-1">
          TOP 100
        </h1>
        <div className="hidden lg:block pb-[18px] font-mono text-[11px] text-[var(--hill-muted)] tracking-[0.14em]">
          SEASON ENDS IN <span className="text-[var(--hill-text)] font-bold">12d 04h</span>
        </div>
      </div>

      {/* Filter row + search */}
      <div className="flex items-center justify-between gap-3 mb-4 lg:mb-5">
        <div className="flex gap-1.5 lg:gap-2 overflow-x-auto hill-scroll">
          {FILTERS.map((f) => {
            const isActive = active === f;
            return (
              <button
                key={f}
                onClick={() => setActive(f)}
                className={[
                  'px-3.5 lg:px-4 py-2 lg:py-2.5 rounded-full text-[12px] lg:text-[13px] font-bold tracking-[-0.01em] whitespace-nowrap transition',
                  isActive
                    ? 'bg-[var(--hill-text)] text-[var(--hill-bg)]'
                    : 'bg-[var(--hill-surface)] text-[var(--hill-muted)] border border-[var(--hill-border)] lg:hover:bg-[var(--hill-surface2)] lg:hover:text-[var(--hill-text)]',
                ].join(' ')}
              >
                {f}
              </button>
            );
          })}
        </div>

        {/* Desktop-only search */}
        <div className="hidden lg:flex w-[260px] h-[38px] bg-[var(--hill-surface)] border border-[var(--hill-border)] rounded-[10px] items-center gap-2 px-3">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--hill-muted)" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            placeholder="Search players"
            className="flex-1 bg-transparent outline-none text-[13px] text-[var(--hill-text)] placeholder-[var(--hill-muted)]"
          />
          <span className="font-mono text-[10px] text-[var(--hill-dim)] tracking-[0.08em] px-1.5 py-0.5 border border-[var(--hill-border)] rounded">⌘ K</span>
        </div>
      </div>

      {n === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-[var(--hill-border)] bg-[var(--hill-surface)] py-20 text-center">
          <div className="text-lg font-extrabold">No ranked players yet</div>
          <p className="max-w-[260px] text-sm text-[var(--hill-muted)]">
            Sign in and finish a game to claim a spot on the board.
          </p>
        </div>
      ) : (
        <>
          {/* MOBILE — row cards */}
          <div className="lg:hidden">
            <div className="bg-gradient-to-b from-[var(--hill-surface)] to-[var(--hill-surface2)] border border-[var(--hill-border)] rounded-2xl p-3.5">
              {top3.map((r, i) => (
                <LeaderboardRow key={r.rank} row={r} top3 last={i === top3.length - 1} />
              ))}
            </div>
            <div className="mt-3">
              {rest.map((r) => (
                <LeaderboardRow key={r.rank} row={r} />
              ))}
            </div>
            <div className="mt-3 text-center text-xs text-[var(--hill-dim)] font-mono tracking-[0.08em]">
              SHOWING 1–{n} OF {n}
            </div>
          </div>

          {/* DESKTOP — sortable table */}
          <div className="hidden lg:block">
            <LeaderboardTable rows={rows} totalCount={n} />
          </div>
        </>
      )}
    </div>
  );
}
