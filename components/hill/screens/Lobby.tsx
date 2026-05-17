'use client';
import Link from 'next/link';
import { CTAButton } from '../CTAButton';
import { TopBar } from '../TopBar';
import { PlayerSlot } from '../PlayerSlot';
import type { GameMode, LobbyPlayer } from '@/types/hill';

export interface LobbyProps {
    roomCode: string;
    mode: GameMode;
    players: (LobbyPlayer | { player: 1 | 2 | 3 | 4; empty: true })[];
    isHost: boolean;
    onStart: () => void;
    onCopyLink: () => void;
    onShare: () => void;
    onChangeMode: () => void;
    onBack: () => void;
}

export function Lobby({
                          roomCode, mode, players, isHost, onStart, onCopyLink, onShare, onChangeMode, onBack,
                      }: LobbyProps) {
    const filled = players.filter(p => !('empty' in p)).length;
    const ready = filled >= 2;
    return (
        <div className="relative min-h-screen bg-hill-bg text-hill-text">
            <TopBar
                onBack={onBack}
                right={
                    <button onClick={onShare}
                            className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-hill-border bg-hill-surface"
                            aria-label="Share">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l7 4M15.6 6.5l-7 4"/></svg>
                    </button>
                }
            />

            <div className="px-5 pt-3">
                <div className="text-center">
                    <div className="text-[10px] font-bold tracking-[0.24em] text-hill-muted">ROOM CODE</div>
                    <div className="mt-1.5 font-mono text-[56px] font-bold tracking-[0.08em]" style={{ textShadow: '0 0 24px rgba(191,255,0,0.15)' }}>
                        {roomCode}
                    </div>
                </div>

                <div className="mt-3.5 flex gap-2">
                    <button onClick={onCopyLink}
                            className="flex h-[42px] flex-1 items-center justify-center gap-2 rounded-[10px] border border-hill-border bg-hill-surface text-[13px] font-semibold">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                        Copy link
                    </button>
                    <button onClick={onShare}
                            className="flex h-[42px] flex-1 items-center justify-center gap-2 rounded-[10px] border border-hill-border bg-hill-surface text-[13px] font-semibold">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
                        Share
                    </button>
                </div>

                {/* mode (locked) */}
                <div className="mt-5">
                    <div className="mb-2 text-[10px] font-bold tracking-[0.18em] text-hill-muted">MODE · LOCKED</div>
                    <div className="flex items-center gap-2.5 rounded-xl border border-hill-border bg-hill-surface px-3.5 py-3">
                        <span className="text-lg">{mode === 'survival' ? '💀' : '⚡'}</span>
                        <div className="flex-1">
                            <div className="text-sm font-extrabold tracking-tight">{mode === 'survival' ? 'SURVIVAL' : 'BLITZ'}</div>
                            <div className="mt-0.5 text-[11px] text-hill-muted">
                                {mode === 'survival' ? 'Last alive wins · ~5-7 min' : '7 rounds · ~3 min'}
                            </div>
                        </div>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#808080" strokeWidth="2" strokeLinecap="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>
                    </div>
                    {isHost && (
                        <button onClick={onChangeMode} className="mt-2 text-[11px] font-semibold tracking-wide text-hill-muted">
                            ← change mode
                        </button>
                    )}
                </div>

                {/* 2x2 player slots */}
                <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between">
                        <div className="text-[10px] font-bold tracking-[0.18em] text-hill-muted">PLAYERS</div>
                        <div className="font-mono text-[11px] text-hill-muted">{filled}/4</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {players.map((p, i) =>
                            'empty' in p
                                ? <PlayerSlot key={i} player={p.player} empty />
                                : <PlayerSlot key={i} {...p} />
                        )}
                    </div>
                </div>
            </div>

            <div
                className="sticky bottom-0 mt-6 px-5 pt-4 pb-3"
                style={{ background: 'linear-gradient(180deg, transparent, #0A0A0A 30%)' }}
            >
                <CTAButton variant="primary" disabled={!ready} onClick={onStart}>
                    {ready ? 'Start Game' : 'Waiting for 2+ players…'}
                </CTAButton>
            </div>
        </div>
    );
}