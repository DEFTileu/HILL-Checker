// components/LeaderboardRow.tsx
'use client';
import { ArenaBadge } from './ArenaBadge';
import type { TierId } from '@/lib/skins';

export interface LeaderboardRowData {
  rank: number;
  name: string;
  tier: TierId;
  wins: number;
  games?: number;
  wr: number;
  elo: number;
  isYou?: boolean;
}

interface Props {
  row: LeaderboardRowData;
  top3?: boolean;
  last?: boolean;
}

export function LeaderboardRow({ row, top3 = false, last = false }: Props) {
  const rankColor =
    row.rank === 1 ? 'var(--hill-gold)' :
    row.rank === 2 ? 'var(--hill-silver)' :
    row.rank === 3 ? 'var(--hill-bronze)' :
    'var(--hill-muted)';

  return (
    <div
      className={[
        'flex items-center gap-3 transition-colors',
        top3 ? 'px-1 py-2.5' : 'px-3.5 py-3 mb-1.5 rounded-xl',
        row.isYou ? 'bg-[rgba(191,255,0,0.04)] border-[1.5px] border-[var(--hill-accent)]' :
          top3 ? '' : 'bg-[var(--hill-surface)] border border-[var(--hill-border)]',
        top3 && !last ? 'border-b border-[var(--hill-border)]' : '',
      ].join(' ')}
    >
      <div
        className={[
          'font-mono text-right font-extrabold',
          top3 ? 'text-[22px] w-8' : 'text-[15px] w-8',
        ].join(' ')}
        style={{ color: rankColor }}
      >
        {row.rank}
      </div>
      <div
        className={[
          'shrink-0 rounded-full bg-gradient-to-br from-[#2a2a2a] to-[#0f0f0f] border border-[var(--hill-border)] flex items-center justify-center font-bold text-sm text-[var(--hill-text)]',
          top3 ? 'w-[38px] h-[38px]' : 'w-8 h-8',
        ].join(' ')}
      >
        {row.name[0]?.toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={[top3 ? 'text-base' : 'text-sm', 'font-bold truncate'].join(' ')}>
            {row.name}
          </span>
          {row.isYou && <span className="text-[9px] font-extrabold text-[var(--hill-accent)] tracking-[0.1em]">YOU</span>}
        </div>
        <div className="mt-1 flex items-center gap-2">
          <ArenaBadge tier={row.tier}/>
          <span className="font-mono text-[11px] text-[var(--hill-muted)]">
            {row.wr}% wr
          </span>
        </div>
      </div>
      <div className="text-right">
        <div className={[top3 ? 'text-lg' : 'text-[15px]', 'font-mono font-bold text-[var(--hill-text)]'].join(' ')}>
          {row.wins}<span className="text-[var(--hill-muted)] font-medium text-[11px]">w</span>
        </div>
        <div className="font-mono text-[10px] text-[var(--hill-dim)] tracking-[0.04em]">
          {row.elo} ELO
        </div>
      </div>
    </div>
  );
}
