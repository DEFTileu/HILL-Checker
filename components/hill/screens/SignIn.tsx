'use client';

export interface SignInProps {
    onContinueGoogle: () => void;
    onDismiss: () => void;
}

export function SignIn({ onContinueGoogle, onDismiss }: SignInProps) {
    return (
        <div className="relative min-h-screen bg-hill-bg text-hill-text overflow-hidden">
            <div className="absolute right-4 top-16 z-10">
                <button
                    onClick={onDismiss}
                    aria-label="Close"
                    className="h-9 w-9 rounded-full bg-hill-surface border border-hill-border flex items-center justify-center text-hill-text active:scale-95"
                >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 3l8 8M11 3l-8 8"/></svg>
                </button>
            </div>

            <div className="flex flex-col px-6 pt-24 pb-6 min-h-screen">
                <div className="font-extrabold tracking-display" style={{ fontSize: 88, lineHeight: 0.9 }}>HILL</div>
                <div className="mt-3 h-[3px] w-7 bg-hill-accent" style={{ boxShadow: '0 0 10px #BFFF00' }} />

                <div className="mt-9">
                    <div className="text-[11px] font-bold text-hill-accent tracking-[0.24em]">ACCOUNT</div>
                    <h2 className="mt-2 font-extrabold tracking-display" style={{ fontSize: 36, lineHeight: 1 }}>
                        Keep your<br />crown.
                    </h2>
                    <p className="mt-3.5 max-w-[320px] text-[15px] leading-snug text-hill-muted">
                        Save your wins, ELO, and arena across every device. One tap, no password.
                    </p>
                </div>

                <div className="flex-1" />

                <div>
                    <button
                        onClick={onContinueGoogle}
                        className="flex h-[60px] w-full items-center justify-center gap-3 rounded-xl bg-hill-text text-hill-bg text-base font-bold tracking-[-0.01em] active:scale-[0.98]"
                    >
                        <svg width="22" height="22" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.6 8.4 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.3C29.2 35 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4 5.6l6.2 5.3c-.4.3 6.5-4.7 6.5-15 0-1.3-.1-2.6-.4-3.9z"/></svg>
                        Continue with Google
                    </button>
                    <div className="mt-3.5 rounded-[10px] border border-dashed border-hill-border p-2.5 text-center text-xs leading-relaxed text-hill-muted">
                        You can keep playing as guest without signing in.<br />
                        <span className="font-mono text-[10px] tracking-[0.08em] text-hill-dim">STATS WON'T SYNC</span>
                    </div>
                </div>
            </div>
        </div>
    );
}