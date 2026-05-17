'use client';
import { useState } from 'react';
import { CTAButton } from '../CTAButton';
import { TopBar } from '../TopBar';
import type { GameMode } from '@/types/hill';

export interface HillModeSelectProps {
    initial?: GameMode;
    onContinue: (mode: GameMode) => void;
    onBack: () => void;
}

export function HillModeSelect({ initial = 'blitz', onContinue, onBack }: HillModeSelectProps) {
    const [mode, setMode] = useState<GameMode>(initial);
    return (
        <div className="relative min-h-screen bg-hill-bg text-hill-text">
            <TopBar onBack={onBack} />
            <div className="px-5 pt-5">
                <div className="text-[11px] font-bold tracking-[0.24em] text-hill-accent">STEP 1 / 2</div>
                <h1 className="mt-2 mb-1.5 font-extrabold tracking-display" style={{ fontSize: 40, lineHeight: 0.95 }}>
                    Choose your<br />mode.
                </h1>
                <p className="mt-1 text-sm text-hill-muted">Pick a ruleset. You can switch in the lobby.</p>

                <div className="mt-7 flex flex-col gap-3">
                    <ModeCard mode="blitz" selected={mode === 'blitz'} onClick={() => setMode('blitz')} />
                    <ModeCard mode="survival" selected={mode === 'survival'} onClick={() => setMode('survival')} />
                </div>
            </div>

            <div className="fixed inset-x-0 bottom-6 px-5"
                 style={{ background: 'linear-gradient(180deg, transparent, #0A0A0A 35%)' }}>
                <CTAButton variant="primary" onClick={() => onContinue(mode)}>
                    Continue · <span className="ml-1 font-mono text-[13px] font-bold opacity-70">{mode.toUpperCase()}</span>
                </CTAButton>
            </div>
        </div>
    );
}

function ModeCard({ mode, selected, onClick }: { mode: GameMode; selected: boolean; onClick: () => void }) {
    const isBlitz = mode === 'blitz';
    return (
        <button
            onClick={onClick}
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
                            background: isBlitz ? 'rgba(191,255,0,0.08)' : 'rgba(255,59,48,0.08)',
                            border: `1px solid ${isBlitz ? 'rgba(191,255,0,0.3)' : 'rgba(255,59,48,0.3)'}`,
                            color: isBlitz ? '#BFFF00' : '#FF3B30',
                        }}
                    >
                        {isBlitz ? (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L4 14h7l-2 8 9-12h-7l2-8z"/></svg>
                        ) : (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="11" r="2"/><circle cx="15" cy="11" r="2"/><path d="M6 18c0-2 0-6 6-6s6 4 6 6"/><circle cx="12" cy="12" r="9.5"/></svg>
                        )}
                    </div>
                    <div>
                        <div className="text-[19px] font-extrabold tracking-tight">{isBlitz ? 'BLITZ' : 'SURVIVAL'}</div>
                        <div className="mt-0.5 font-mono text-[12px] tracking-wide text-hill-muted">{isBlitz ? '~3 MIN' : '~5-7 MIN'}</div>
                    </div>
                </div>
                <div
                    className="flex h-[22px] w-[22px] items-center justify-center rounded-full"
                    style={{ borderWidth: 1.5, borderStyle: 'solid', borderColor: selected ? '#BFFF00' : '#2A2A2A', background: selected ? '#BFFF00' : 'transparent' }}
                >
                    {selected && <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#0A0A0A" strokeWidth="2.5" strokeLinecap="round"><path d="M2 6l3 3 5-6"/></svg>}
                </div>
            </div>
            <div className="mt-3.5 text-[14px] leading-relaxed text-hill-text">
                {isBlitz
                    ? '7 rounds. Multiple kings can rule. Most pieces on the Hill at the bell wins the round.'
                    : 'Last player with pieces wins. Tighter board pressure, slower burn — outlast everyone.'}
            </div>
            <div className="mt-3.5 flex gap-3.5 border-t border-hill-border pt-3.5 font-mono text-[11px] tracking-wide text-hill-muted">
                <span>{isBlitz ? '10s / TURN' : '15s / TURN'}</span>
                <span className="text-hill-border">·</span>
                <span>{isBlitz ? '7 ROUNDS' : 'NO LIMIT'}</span>
                <span className="text-hill-border">·</span>
                <span>2–4 PLAYERS</span>
            </div>
        </button>
    );
}