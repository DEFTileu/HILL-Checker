'use client';
import { CTAButton } from '../CTAButton';
import { ArenaBadge } from '../ArenaBadge';
import { BottomNav } from '../BottomNav';
import type { Profile } from '@/lib/game-ui';

export interface LandingProps {
    profile: Profile | null; // null = guest
    onCreateRoom: () => void;
    onPlayClassic: () => void;
    onSignIn?: () => void;
}

export function Landing({ profile, onCreateRoom, onPlayClassic, onSignIn }: LandingProps) {
    // Signed in == Google identity linked (anonymous guests have no email).
    const signedIn = !!profile?.email;
    return (
        <div className="relative min-h-screen bg-hill-bg text-hill-text overflow-hidden pb-24">
            {/* Welcome chip */}
            <div className="absolute right-4 top-16 z-10 flex items-center gap-2 rounded-full bg-hill-surface border border-hill-border py-[5px] pl-[5px] pr-2.5 text-xs font-semibold">
                {signedIn ? (
                    <>
                        <div className="relative h-[26px] w-[26px] rounded-full bg-gradient-to-br from-neutral-700 to-neutral-900 flex items-center justify-center text-xs font-extrabold">
                            {profile.displayName[0]?.toUpperCase()}
                            <div className="absolute -bottom-0.5 -right-0.5 h-[13px] w-[13px] rounded-full bg-hill-bg p-[1.5px] flex items-center justify-center">
                                <GoogleG size={9} />
                            </div>
                        </div>
                        <span>{profile.displayName}</span>
                        <ArenaBadge tier={profile.arenaTier} />
                    </>
                ) : (
                    <>
                        <div className="h-[26px] w-[26px] rounded-full bg-gradient-to-br from-neutral-800 to-neutral-950 flex items-center justify-center text-[11px] font-extrabold text-hill-muted">?</div>
                        <span className="font-mono">Player_a3f9</span>
                        <span className="text-hill-muted">·</span>
                        <button onClick={onSignIn} className="text-[11px] font-bold text-hill-accent tracking-wide">Sign&nbsp;in</button>
                    </>
                )}
            </div>

            {/* HILL display */}
            <div className="relative px-6 pt-24">
                <div
                    className="font-extrabold tracking-display"
                    style={{
                        fontSize: 168, lineHeight: 0.85,
                        background: 'linear-gradient(180deg, #FAFAFA 0%, #FAFAFA 55%, #707070 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                    }}
                >HILL</div>
                <div className="absolute left-6 h-1 w-9 bg-hill-accent" style={{ top: 240, boxShadow: '0 0 12px #BFFF00' }} />
                <p className="mt-6 max-w-[280px] text-[17px] leading-snug text-hill-muted">
                    King of the Board.<br />
                    <span className="font-semibold text-hill-text">4 players. 3 minutes.</span>
                </p>
            </div>

            {/* CTAs above nav */}
            <div className="absolute inset-x-0 bottom-[92px] px-5">
                <div className="flex flex-col gap-3">
                    <CTAButton variant="primary" onClick={onCreateRoom} className="!h-[60px] !text-lg">
                        →  Create Hill Room
                    </CTAButton>
                    <CTAButton variant="secondary" onClick={onPlayClassic} className="!h-14">Play Classic</CTAButton>
                </div>
                <div className="mt-3.5 text-center font-mono text-[10px] tracking-[0.16em] text-hill-dim">v1.0 · 2026 HILL</div>
            </div>

            <BottomNav active="hill" />
        </div>
    );
}

function GoogleG({ size = 18 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 48 48" className="block">
            <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.6 8.4 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.3C29.2 35 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4 5.6l6.2 5.3c-.4.3 6.5-4.7 6.5-15 0-1.3-.1-2.6-.4-3.9z"/>
        </svg>
    );
}