'use client';
import { useState } from 'react';
import { ArenaBadge } from '../ArenaBadge';
import { BottomNav } from '../BottomNav';
import type { ArenaTier } from '@/lib/skins';

export interface LeaderboardRow {
    rank: number;
    name: string;
    tier: ArenaTier;
    wins: number;
    winRate: number; // 0-100
    elo: number;
    isYou?: boolean;
}

export interface LeaderboardProps {
    rows: LeaderboardRow[];
    total?: number;
    defaultFilter?: 'global' | 'friends' | 'week';
}

const TIER_RANK_COLOR: Record<number, string> = { 1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32' };

export function Leaderboard({ rows, total = 100, defaultFilter = 'global' }: LeaderboardProps) {
    const [filter, setFilter] = useState(defaultFilter);
    const filters: { id: typeof filter; label: string }[] = [
        { id: 'global', label: 'Global' }, { id: 'friends', label: 'Friends' }, { id: 'week', label: 'This week' },
    ];
    return (
        <div className="relative min-h-screen bg-hill-bg text-hill-text pb-28">
            <div className="sticky top-0 z-10 flex items-center justify-between bg-hill-bg border-b border-hill-border px-4 pt-[14px] pb-3">
                <div className="text-[15px] font-semibold">Leaderboard</div>
                <button className="rounded-lg border border-hill-border bg-hill-surface px-2.5 py-1.5 font-mono text-[11px] tracking-[0.08em] text-hill-muted">SEASON 03</button>
            </div>

            <div className="px-5 pt-3 pb-4">
                <div className="text-[11px] font-bold tracking-[0.24em] text-hill-accent">RANKED</div>
                <h1 className="mt-1.5 mb-3 font-extrabold tracking-display" style={{ fontSize: 56, lineHeight: 0.9 }}>TOP {total}</h1>
                <div className="flex gap-1.5">
                    {filters.map(f => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id)}
                            className={`rounded-full px-3.5 py-2 text-xs font-bold tracking-[-0.01em] ${
                                filter === f.id ? 'bg-hill-text text-hill-bg' : 'bg-hill-surface text-hill-muted border border-hill-border'
                            }`}
                        >{f.label}</button>
                    ))}
                </div>
            </div>

            <div className="px-5 pb-3">
                <div className="rounded-2xl border border-hill-border bg-gradient-to-b from-hill-surface to-hill-surface-2 p-3.5">
                    {rows.filter(r => r.rank <= 3).map((r, i, arr) => (
                        <Row key={r.rank} row={r} top3 last={i === arr.length - 1} />
                    ))}
                </div>
            </div>

            <div className="px-5">
                {rows.filter(r => r.rank > 3).map(r => <Row key={r.rank} row={r} />)}
            </div>

            <div className="px-5 pt-3 pb-6 text-center font-mono text-xs tracking-[0.08em] text-hill-dim">
                SHOWING 1–{rows.length} OF {total}
            </div>

            <BottomNav active="top" />
        </div>
    );
}

function Row({ row, top3 = false, last = false }: { row: LeaderboardRow; top3?: boolean; last?: boolean }) {
    const rankColor = TIER_RANK_COLOR[row.rank] ?? '#808080';
    return (
        <div
            className={`flex items-center gap-3 ${top3 ? 'py-2.5' : 'mb-1.5 rounded-xl border bg-hill-surface px-3.5 py-3'}`}
            style={{
                background: row.isYou ? 'rgba(191,255,0,0.04)' : undefined,
                borderColor: row.isYou ? '#BFFF00' : top3 ? 'transparent' : '#1F1F1F',
                borderWidth: row.isYou ? 1.5 : top3 ? 0 : 1,
                borderBottom: top3 && !last ? '1px solid #1F1F1F' : undefined,
                borderRadius: top3 ? 0 : undefined,
            }}
        >
            <div className={`w-8 text-right font-mono font-extrabold ${top3 ? 'text-[22px]' : 'text-[15px]'}`} style={{ color: rankColor }}>
                {row.rank}
            </div>
            <div
                className={`flex items-center justify-center rounded-full bg-gradient-to-br from-neutral-800 to-neutral-950 border border-hill-border font-bold ${
                    top3 ? 'h-[38px] w-[38px] text-sm' : 'h-8 w-8 text-sm'
                }`}
            >{row.name[0].toUpperCase()}</div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                    <span className={`truncate font-bold ${top3 ? 'text-base' : 'text-sm'}`}>{row.name}</span>
                    {row.isYou && <span className="text-[9px] font-extrabold tracking-[0.1em] text-hill-accent">YOU</span>}
                </div>
                <div className="mt-1 flex items-center gap-2">
                    <ArenaBadge tier={row.tier} />
                    <span className="font-mono text-[11px] text-hill-muted">{row.winRate}% wr</span>
                </div>
            </div>
            <div className="text-right">
                <div className={`font-mono font-bold ${top3 ? 'text-lg' : 'text-[15px]'}`}>
                    {row.wins}<span className="text-[11px] font-medium text-hill-muted">w</span>
                </div>
                <div className="font-mono text-[10px] tracking-wide text-hill-dim">{row.elo} ELO</div>
            </div>
        </div>
    );
}