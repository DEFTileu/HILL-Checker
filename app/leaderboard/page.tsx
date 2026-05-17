// app/leaderboard/page.tsx — Claude Design table/cards, wired to real data.
'use client';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { LeaderboardRow } from '@/components/LeaderboardRow';
import { LeaderboardTable } from '@/components/LeaderboardTable';
import { EloInfoModal } from '@/components/EloInfoModal';
import {
  getLeaderboard,
  getModeCountsByUser,
  toLeaderboardTableRows,
  type LeaderboardEntry,
  type ModeCounts,
} from '@/lib/db/leaderboard';
import { useAuth } from '@/lib/auth';

// Only filters with real backing. "Friends" and "This week" were removed —
// there is no friends graph or per-week aggregation behind them, so they
// were decorative (and misleading).
const FILTERS = ['Global', 'Blitz only', 'Survival only'] as const;
type Filter = typeof FILTERS[number];

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
  const [modeCounts, setModeCounts] = useState<Map<string, ModeCounts>>(new Map());
  const [active, setActive] = useState<Filter>('Global');
  const [query, setQuery] = useState('');
  const [infoOpen, setInfoOpen] = useState(false);
  // Client-only platform read. useSyncExternalStore gives a stable server
  // snapshot (false) so there's no hydration mismatch and no setState-in-
  // effect — the keydown effect below still derives its own local `mac`.
  const isMac = useSyncExternalStore(
    () => () => {},
    () =>
      /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent),
    () => false,
  );
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([getLeaderboard(), getModeCountsByUser()]).then(
      ([list, counts]) => {
        if (!alive) return;
        setEntries(list);
        setModeCounts(counts);
      },
    );
    return () => {
      alive = false;
    };
  }, [user]);

  // Cmd+K (Mac) / Ctrl+K (others) focuses the search input. We never bind
  // Ctrl+F — that stays the browser's native find.
  useEffect(() => {
    const mac = /Mac|iPhone|iPad|iPod/.test(
      navigator.platform || navigator.userAgent,
    );
    const onKey = (e: KeyboardEvent) => {
      const combo = mac ? e.metaKey && !e.ctrlKey : e.ctrlKey && !e.metaKey;
      if (combo && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Filter pills + name search applied client-side, then re-ranked 1..n by the
  // already-ELO-sorted input order (toLeaderboardTableRows numbers by index).
  const rows = useMemo(() => {
    if (entries === null) return null;
    let filtered = entries;
    if (active === 'Blitz only') {
      filtered = filtered.filter(
        (e) => (modeCounts.get(e.id)?.blitz ?? 0) > 0,
      );
    } else if (active === 'Survival only') {
      filtered = filtered.filter(
        (e) => (modeCounts.get(e.id)?.survival ?? 0) > 0,
      );
    }
    const q = query.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter((e) =>
        e.displayName.toLowerCase().includes(q),
      );
    }
    return toLeaderboardTableRows(filtered, user?.id);
  }, [entries, modeCounts, active, query, user]);

  if (entries === null || rows === null) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center font-mono text-[12px] tracking-[0.18em] text-[var(--hill-muted)]">
        LOADING…
      </div>
    );
  }

  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3);
  const n = rows.length;
  const hasAnyPlayers = entries.length > 0;
  const isFiltering = query.trim().length > 0 || active !== 'Global';

  const clearFilters = () => {
    setQuery('');
    setActive('Global');
    inputRef.current?.focus();
  };

  return (
    <div className="mx-auto w-full max-w-[1280px] px-5 lg:px-12 pt-6 lg:pt-12 pb-10 lg:pb-16">
      {/* Headline */}
      <div className="lg:flex lg:items-baseline lg:gap-4 mb-2">
        <span className="font-mono text-[11px] font-bold tracking-[0.24em] lg:tracking-[0.32em] text-[var(--hill-accent)]">
          RANKED · SEASON 03
        </span>
      </div>
      <div className="lg:flex lg:items-baseline lg:justify-between lg:gap-8 mb-6 lg:mb-7">
        <div className="flex items-center gap-3 lg:gap-4">
          <h1 className="font-display text-[56px] lg:text-[96px] m-0 tracking-[-0.05em] mt-1.5 lg:mt-1">
            TOP 100
          </h1>
          <button
            type="button"
            onClick={() => setInfoOpen(true)}
            aria-label="How rating works"
            title="How rating works"
            className="shrink-0 flex h-7 w-7 lg:h-8 lg:w-8 items-center justify-center rounded-full border border-[var(--hill-border)] text-[var(--hill-muted)] transition lg:hover:text-[var(--hill-accent)] lg:hover:border-[var(--hill-accent)]"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 11v5" />
              <path d="M12 8h.01" />
            </svg>
          </button>
        </div>
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
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search players"
            className="flex-1 bg-transparent outline-none text-[13px] text-[var(--hill-text)] placeholder-[var(--hill-muted)]"
          />
          <span className="font-mono text-[10px] text-[var(--hill-dim)] tracking-[0.08em] px-1.5 py-0.5 border border-[var(--hill-border)] rounded">
            {isMac ? '⌘ K' : 'Ctrl K'}
          </span>
        </div>
      </div>

      {!hasAnyPlayers ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-[var(--hill-border)] bg-[var(--hill-surface)] py-20 text-center">
          <div className="text-lg font-extrabold">No ranked players yet</div>
          <p className="max-w-[260px] text-sm text-[var(--hill-muted)]">
            Sign in and finish a game to claim a spot on the board.
          </p>
        </div>
      ) : n === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[var(--hill-border)] bg-[var(--hill-surface)] py-20 text-center">
          <div className="text-lg font-extrabold">No players match</div>
          <p className="max-w-[280px] text-sm text-[var(--hill-muted)]">
            {query.trim()
              ? `Nobody named “${query.trim()}” on this board.`
              : 'No players have ranked games in this mode yet.'}
          </p>
          <button
            onClick={clearFilters}
            className="mt-1 px-4 py-2 rounded-full text-[13px] font-bold bg-[var(--hill-text)] text-[var(--hill-bg)] lg:hover:opacity-90 transition"
          >
            Clear
          </button>
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
              {isFiltering ? `${n} MATCH${n === 1 ? '' : 'ES'}` : `SHOWING 1–${n} OF ${n}`}
            </div>
          </div>

          {/* DESKTOP — sortable table */}
          <div className="hidden lg:block">
            <LeaderboardTable rows={rows} totalCount={n} />
          </div>
        </>
      )}

      <EloInfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />
    </div>
  );
}
