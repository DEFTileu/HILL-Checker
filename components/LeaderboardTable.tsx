// components/LeaderboardTable.tsx  (NEW — desktop only)
'use client';
import { useMemo, useState } from 'react';
import { ArenaBadge } from './ArenaBadge';
import type { LeaderboardRowData } from './LeaderboardRow';

type SortKey = 'rank' | 'wins' | 'games' | 'wr' | 'elo';
type SortDir = 'asc' | 'desc';

interface Props {
  rows: LeaderboardRowData[];
  /** Pre-filtered count for "showing N of M" footer. */
  totalCount?: number;
}

const COLS: { key: SortKey | 'player' | 'tier'; label: string; align?: 'right' }[] = [
  { key: 'rank',   label: 'RANK' },
  { key: 'player', label: 'PLAYER' },
  { key: 'tier',   label: 'ARENA' },
  { key: 'wins',   label: 'WINS',     align: 'right' },
  { key: 'games',  label: 'GAMES',    align: 'right' },
  { key: 'wr',     label: 'WIN RATE', align: 'right' },
  { key: 'elo',    label: 'ELO',      align: 'right' },
];

/**
 * Sortable, sticky-header table. Hover row tint, lime left-border for the
 * current user. Rank colors for top 3 (gold/silver/bronze).
 */
export function LeaderboardTable({ rows, totalCount }: Props) {
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'rank', dir: 'asc' });

  const sorted = useMemo(() => {
    const arr = [...rows];
    arr.sort((a, b) => {
      const va = (a[sort.key] ?? 0) as number;
      const vb = (b[sort.key] ?? 0) as number;
      return sort.dir === 'asc' ? va - vb : vb - va;
    });
    return arr;
  }, [rows, sort]);

  const onHeaderClick = (k: SortKey) => {
    setSort(s => s.key === k ? { key: k, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key: k, dir: 'desc' });
  };

  const rankColor = (rank: number) =>
    rank === 1 ? 'var(--hill-gold)' :
    rank === 2 ? 'var(--hill-silver)' :
    rank === 3 ? 'var(--hill-bronze)' :
    'var(--hill-muted)';

  return (
    <div className="bg-[var(--hill-surface)] border border-[var(--hill-border)] rounded-2xl overflow-hidden">
      <div className="grid items-center gap-4 px-5 py-3.5 bg-[var(--hill-surface2)] border-b border-[var(--hill-border)] font-mono text-[10px] font-bold text-[var(--hill-muted)] tracking-[0.18em]"
        style={{ gridTemplateColumns: '64px 1fr 140px 90px 90px 100px 100px' }}>
        {COLS.map(col => {
          const sortable = (['rank', 'wins', 'games', 'wr', 'elo'] as const).includes(col.key as SortKey);
          const isSorted = sort.key === col.key;
          return (
            <button
              key={col.key}
              disabled={!sortable}
              onClick={() => sortable && onHeaderClick(col.key as SortKey)}
              className={[
                'inline-flex items-center gap-1 text-inherit',
                col.align === 'right' ? 'justify-end' : 'justify-start',
                sortable ? 'hover:text-[var(--hill-text)] cursor-pointer' : 'cursor-default',
                'focus-visible:outline-none focus-visible:text-[var(--hill-text)]',
              ].join(' ')}
            >
              {col.label}
              {sortable && isSorted && (
                <span aria-hidden>{sort.dir === 'asc' ? '↑' : '↓'}</span>
              )}
            </button>
          );
        })}
      </div>

      {sorted.map((r, i) => (
        <div
          key={r.rank}
          className={[
            'grid items-center gap-4 px-5 py-3.5 transition-colors hover:bg-[rgba(191,255,0,0.04)] cursor-pointer',
            r.isYou ? 'bg-[rgba(191,255,0,0.04)]' : '',
            i < sorted.length - 1 ? 'border-b border-[var(--hill-border)]' : '',
          ].join(' ')}
          style={{
            gridTemplateColumns: '64px 1fr 140px 90px 90px 100px 100px',
            borderLeft: r.isYou ? '3px solid var(--hill-accent)' : '3px solid transparent',
          }}
        >
          <div
            className="font-mono font-extrabold"
            style={{ color: rankColor(r.rank), fontSize: r.rank <= 3 ? 22 : 16 }}
          >
            {r.rank}
          </div>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-[#2a2a2a] to-[#0f0f0f] border border-[var(--hill-border)] flex items-center justify-center font-bold text-sm">
              {r.name[0]?.toUpperCase()}
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[15px] font-bold text-[var(--hill-text)] truncate">{r.name}</span>
              {r.isYou && <span className="text-[9px] font-extrabold text-[var(--hill-accent)] tracking-[0.1em]">YOU</span>}
            </div>
          </div>
          <div><ArenaBadge tier={r.tier}/></div>
          <div className="text-right font-mono text-[15px] font-bold text-[var(--hill-text)]">{r.wins}</div>
          <div className="text-right font-mono text-sm font-medium text-[var(--hill-muted)]">{r.games ?? '—'}</div>
          <div className="text-right font-mono text-sm font-medium text-[var(--hill-muted)]">{r.wr}%</div>
          <div
            className="text-right font-mono text-[15px] font-bold"
            style={{ color: r.rank <= 3 ? 'var(--hill-accent)' : 'var(--hill-text)' }}
          >
            {r.elo}
          </div>
        </div>
      ))}

      {totalCount != null && (
        <div className="px-5 py-3 font-mono text-[11px] text-[var(--hill-dim)] tracking-[0.1em]">
          SHOWING {sorted.length} OF {totalCount}
        </div>
      )}
    </div>
  );
}
