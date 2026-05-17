'use client';
import { useState } from 'react';
import { CTAButton } from '../CTAButton';
import { TopBar } from '../TopBar';
import type { GameMode, PlayStyle as PlayStyleId } from '@/lib/game-ui';

export interface PlayStyleProps {
    mode: GameMode;
    initial?: PlayStyleId;
    onContinue: (style: PlayStyleId) => void;
    onBack: () => void;
}

const OPTIONS = [
    {
        id: 'hotseat' as const, title: 'Hot-seat', caption: 'This device',
        desc: 'Pass the phone. Everyone takes their turn on the same screen — perfect for couch games.',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="3"/><path d="M11 18h2"/>
            </svg>
        ),
    },
    {
        id: 'multi' as const, title: 'Multiplayer', caption: 'Invite friends',
        desc: 'Create a room. Send a code or link, friends join from their own devices in real time.',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="8" r="3"/><path d="M3 21c.5-3.5 3-6 6-6s5.5 2.5 6 6"/><circle cx="17" cy="7" r="2.5"/><path d="M15 13c.5-1.5 2-3 4-3"/>
            </svg>
        ),
    },
];

export function PlayStyle({ mode, initial = 'multi', onContinue, onBack }: PlayStyleProps) {
    const [sel, setSel] = useState<PlayStyleId>(initial);
    return (
        <div className="relative min-h-screen bg-hill-bg text-hill-text">
            <TopBar onBack={onBack} />
            <div className="px-5 pt-5">
                <div className="text-[11px] font-bold tracking-[0.24em] text-hill-accent">STEP 2 / 2</div>
                <h1 className="mt-2 mb-1.5 font-extrabold tracking-display" style={{ fontSize: 40, lineHeight: 0.95 }}>
                    How do you<br />want to play?
                </h1>
                <p className="mt-1 text-sm text-hill-muted">
                    <span className="font-mono text-hill-accent">{mode === 'survival' ? '💀 SURVIVAL' : '⚡ BLITZ'}</span>
                    <span className="text-hill-dim"> · 4 players max</span>
                </p>

                <div className="mt-7 flex flex-col gap-3">
                    {OPTIONS.map(o => {
                        const selected = o.id === sel;
                        return (
                            <button
                                key={o.id}
                                onClick={() => setSel(o.id)}
                                className="rounded-2xl px-4 py-5 text-left transition-all active:scale-[0.99]"
                                style={{
                                    background: selected ? 'rgba(191,255,0,0.04)' : '#141414',
                                    borderWidth: 1.5, borderStyle: 'solid', borderColor: selected ? '#BFFF00' : '#1F1F1F',
                                    boxShadow: selected ? '0 0 24px rgba(191,255,0,0.15)' : 'none',
                                }}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="flex h-11 w-11 items-center justify-center rounded-xl"
                                            style={{
                                                background: selected ? 'rgba(191,255,0,0.08)' : 'rgba(255,255,255,0.04)',
                                                border: `1px solid ${selected ? 'rgba(191,255,0,0.3)' : '#1F1F1F'}`,
                                                color: selected ? '#BFFF00' : '#FAFAFA',
                                            }}
                                        >{o.icon}</div>
                                        <div>
                                            <div className="text-[18px] font-extrabold tracking-tight">{o.title}</div>
                                            <div className="mt-0.5 font-mono text-[11px] tracking-wide text-hill-muted">{o.caption.toUpperCase()}</div>
                                        </div>
                                    </div>
                                    <div
                                        className="flex h-[22px] w-[22px] items-center justify-center rounded-full"
                                        style={{ borderWidth: 1.5, borderStyle: 'solid', borderColor: selected ? '#BFFF00' : '#2A2A2A', background: selected ? '#BFFF00' : 'transparent' }}
                                    >
                                        {selected && <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#0A0A0A" strokeWidth="2.5" strokeLinecap="round"><path d="M2 6l3 3 5-6"/></svg>}
                                    </div>
                                </div>
                                <div className="mt-3.5 text-[13px] leading-relaxed text-hill-text">{o.desc}</div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="fixed inset-x-0 bottom-6 px-5" style={{ background: 'linear-gradient(180deg, transparent, #0A0A0A 35%)' }}>
                <CTAButton variant="primary" onClick={() => onContinue(sel)}>
                    {sel === 'multi' ? 'Create room  →' : 'Start hot-seat  →'}
                </CTAButton>
            </div>
        </div>
    );
}