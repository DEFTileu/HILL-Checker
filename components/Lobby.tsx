'use client';
import { CTAButton } from '@/components/CTAButton';
import { PlayerSlot } from '@/components/PlayerSlot';
import { RoomCodeDisplay } from '@/components/RoomCodeDisplay';
import { QrCode } from '@/components/QrCode';
import type { GameMode, LobbyPlayer } from '@/lib/game-ui';

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
                          roomCode, mode, players, isHost, onStart, onCopyLink, onShare, onBack,
                      }: LobbyProps) {
    const filled = players.filter(p => !('empty' in p)).length;
    // Slot count is mode-driven: Classic seats 2, Hill seats 4. `players`
    // already has exactly `cfg.players.length` entries (one per slot).
    const max = players.length;
    const ready = filled >= 2;
    const roomUrl =
        typeof window !== 'undefined'
            ? `${window.location.origin}/r/${roomCode}`
            : `/r/${roomCode}`;

    const modeIcon =
        mode === 'classic' ? '♟' : mode === 'survival' ? '💀' : '⚡';
    const modeTitle =
        mode === 'classic' ? 'CLASSIC' : mode === 'survival' ? 'SURVIVAL' : 'BLITZ';
    const modeSub =
        mode === 'classic'
            ? 'Capture all · 8×8 · 2P'
            : mode === 'survival'
              ? 'Last alive wins · ~5-7 min'
              : '7 rounds · ~3 min';

    const ModeCard = (
        <div className="flex items-center gap-3 px-3.5 lg:px-4 py-3 lg:py-3.5 rounded-xl border border-[var(--hill-border)] bg-[var(--hill-surface)]">
            <span className="text-lg lg:text-[22px]">{modeIcon}</span>
            <div className="flex-1">
                <div className="font-display text-[14px] lg:text-[22px] tracking-[-0.02em]">
                    {modeTitle}
                </div>
                <div className="mt-0.5 text-[11px] lg:text-xs text-[var(--hill-muted)]">
                    {modeSub}
                </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--hill-muted)" strokeWidth="2" strokeLinecap="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>
        </div>
    );

    return (
        <div className="relative min-h-screen bg-hill-bg text-hill-text">
            {/* Mobile inline top bar — hidden on desktop (TopNav covers chrome) */}
            <div className="lg:hidden sticky top-0 z-10 flex items-center justify-between bg-[var(--hill-bg)] border-b border-[var(--hill-border)] px-4 pt-3.5 pb-3">
                <button
                    onClick={onBack}
                    className="h-9 w-9 rounded-[10px] bg-[var(--hill-surface)] border border-[var(--hill-border)] inline-flex items-center justify-center text-[var(--hill-text)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hill-accent)]"
                    aria-label="Back"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5"/></svg>
                </button>
                <button onClick={onShare}
                        className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-hill-border bg-hill-surface"
                        aria-label="Share">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l7 4M15.6 6.5l-7 4"/></svg>
                </button>
            </div>

            <div className="mx-auto w-full max-w-[1280px] px-5 lg:px-12 pt-3 lg:pt-12 pb-32 lg:pb-12">
                {/* Desktop heading row */}
                <div className="hidden lg:flex items-baseline gap-4 mb-7">
                    <button onClick={onBack} className="text-[13px] text-[var(--hill-muted)] hover:text-[var(--hill-text)] tracking-[0.04em]">← Leave room</button>
                    <span className="flex-1"/>
                    <span className="font-mono text-[11px] text-[var(--hill-muted)] tracking-[0.14em]">
                        LIVE LOBBY · <span className="text-[var(--hill-accent)]">● {filled}/{max}</span>
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-9 lg:gap-12">
                    {/* LEFT */}
                    <div>
                        <RoomCodeDisplay code={roomCode}/>
                        <div className="hidden lg:block font-mono text-xs text-[var(--hill-muted)] mt-2 tracking-[0.06em] break-all">
                            {roomUrl}
                        </div>

                        <div className="flex gap-2 mt-3.5 lg:mt-5">
                            <button onClick={onCopyLink}
                                    className="flex-1 h-11 lg:h-[46px] rounded-[10px] bg-[var(--hill-surface)] border border-[var(--hill-border)] text-[var(--hill-text)] text-sm font-semibold inline-flex items-center justify-center gap-2 lg:hover:border-[var(--hill-accent)] transition">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                                Copy link
                            </button>
                            <button onClick={onShare}
                                    className="flex-1 h-11 lg:h-[46px] rounded-[10px] bg-[var(--hill-surface)] border border-[var(--hill-border)] text-[var(--hill-text)] text-sm font-semibold inline-flex items-center justify-center gap-2 lg:hover:border-[var(--hill-accent)] transition">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
                                Share
                            </button>
                        </div>

                        {/* Mode (locked) */}
                        <div className="mt-6 lg:mt-7">
                            <div className="text-[10px] font-bold text-[var(--hill-muted)] tracking-[0.18em] mb-2 lg:mb-2.5">MODE · LOCKED</div>
                            {ModeCard}
                        </div>

                        {/* Desktop QR */}
                        <div className="hidden lg:block mt-7">
                            <div className="text-[10px] font-bold text-[var(--hill-muted)] tracking-[0.18em] mb-2.5">SCAN TO JOIN ON MOBILE</div>
                            <div className="flex items-center gap-4">
                                <QrCode value={roomUrl} size={156}/>
                                <div className="text-[13px] text-[var(--hill-muted)] leading-relaxed max-w-[200px] text-pretty">
                                    Friends point their phone camera at this — opens the lobby instantly. <span className="text-[var(--hill-text)]">No app install.</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div>
                        <div className="flex items-baseline justify-between mb-3 lg:mb-4">
                            <h2 className="font-display text-2xl lg:text-[44px] m-0 tracking-[-0.04em]">Players</h2>
                            <div className="font-mono text-[11px] lg:text-[13px] text-[var(--hill-muted)] tracking-[0.1em]">
                                <span className="text-[var(--hill-text)] font-bold">{filled}</span> · OF · {max}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 lg:gap-3.5">
                            {players.map((p, i) =>
                                'empty' in p
                                    ? <PlayerSlot key={i} player={p.player} empty />
                                    // hill LobbyPlayer uses isYou; flat PlayerSlot uses `you` — translate here
                                    : <PlayerSlot key={i} player={p.player} name={p.name} tier={p.tier} skin={p.skin} isHost={p.isHost} you={p.isYou} />
                            )}
                        </div>

                        {/* CTA — sticky on mobile, inline on desktop */}
                        <div className="fixed bottom-0 left-0 right-0 px-5 pt-4 pb-3 lg:static lg:px-0 lg:mt-7 lg:flex lg:justify-end lg:pt-0 lg:pb-0"
                             style={{ background: 'linear-gradient(180deg, transparent, #0A0A0A 30%)' }}>
                            {/* Only the host can start the match (onStart is a
                                host-only no-op otherwise) — show non-hosts a
                                status pill instead of a dead button. */}
                            {isHost ? (
                                <CTAButton variant="primary" disabled={!ready} onClick={onStart} full={false} className="w-full lg:w-auto lg:px-7">
                                    {ready ? 'Start Game →' : 'Waiting for 2+ players…'}
                                </CTAButton>
                            ) : (
                                <div className="w-full lg:w-auto lg:px-7 h-12 rounded-[10px] bg-[var(--hill-surface)] border border-[var(--hill-border)] text-[var(--hill-muted)] text-sm font-semibold inline-flex items-center justify-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--hill-accent)] animate-pulse" />
                                    {ready ? 'Waiting for host to start…' : 'Waiting for 2+ players…'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
