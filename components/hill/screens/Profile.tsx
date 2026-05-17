'use client';
import { useRef } from 'react';
import { ArenaBadge } from '../ArenaBadge';
import { BottomNav } from '../BottomNav';
import { PieceShape } from '../PieceShape';
import { SKINS, skinUnlocked, WINS_TO_UNLOCK } from '@/lib/skins';
import type { Profile } from '@/lib/game-ui';
import type { SkinId } from '@/lib/skins';

export interface ProfileScreenProps {
    profile: Profile | null;
    onSignIn?: () => void;
    onSignOut?: () => void;
    onResetAccount?: () => void;
    onSelectSkin?: (skin: SkinId) => void;
    onChangeName?: (name: string) => void;
}

export function ProfileScreen({
                                  profile, onSignIn, onSignOut, onResetAccount, onSelectSkin, onChangeName,
                              }: ProfileScreenProps) {
    // Hybrid auth: every visitor has an anonymous profile, so "signed in"
    // means a Google identity has been linked (→ has an email).
    const signedIn = !!profile?.email;
    const userTier = profile?.arenaTier ?? 'Bronze';
    const skin = profile?.selectedSkin ?? 'bronze';
    const nameRef = useRef<HTMLInputElement>(null);

    return (
        <div className="relative min-h-screen bg-hill-bg text-hill-text">
            <div className="sticky top-0 z-10 flex items-center bg-hill-bg border-b border-hill-border px-4 pt-[14px] pb-3">
                <div className="text-[15px] font-semibold">Profile</div>
            </div>

            <div className="flex flex-col items-center px-5 pt-5 pb-28">
                {/* Avatar */}
                <div className="relative flex h-[110px] w-[110px] items-center justify-center rounded-full bg-gradient-to-br from-neutral-800 to-neutral-950 border-2 border-hill-border text-[44px] font-extrabold">
                    {profile?.displayName[0]?.toUpperCase() ?? '?'}
                    {signedIn && (
                        <div className="absolute -top-0.5 -right-0.5 h-6 w-6 rounded-full bg-hill-bg p-0.5 border-[1.5px] border-hill-border flex items-center justify-center">
                            <GoogleG size={16} />
                        </div>
                    )}
                    <div className="absolute -bottom-1 -left-1 flex h-[38px] w-[38px] items-center justify-center rounded-full bg-hill-bg border-[1.5px] border-hill-border-hi">
                        <PieceShape player={1} size={24} skin={skin} />
                    </div>
                    <div
                        className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-hill-bg py-1.5 pl-2.5 pr-3 text-[11px] font-extrabold tracking-[0.12em]"
                        style={{ bottom: -8, borderWidth: 1.5, borderStyle: 'solid', borderColor: '#FFD70060', color: '#FFD700' }}
                    >
                        <span>🥇</span> {userTier.toUpperCase()} · TIER III
                    </div>
                </div>

                {/* Sign-in CTA / signed-in chip */}
                {!signedIn ? (
                    <div className="mt-9 w-full">
                        <button
                            onClick={onSignIn}
                            className="flex h-14 w-full items-center justify-center gap-2.5 rounded-xl bg-hill-text text-hill-bg text-[15px] font-bold active:scale-[0.98]"
                        >
                            <GoogleG size={20} /> Sign in with Google
                        </button>
                        <div className="mt-2.5 text-center text-xs leading-snug text-hill-muted">
                            Your wins and stats will transfer<br />to your account.
                        </div>
                    </div>
                ) : (
                    <div className="mt-[30px] flex w-full items-center gap-2.5 rounded-[10px] border border-hill-accent/20 bg-hill-accent/[0.04] px-3.5 py-2.5">
                        <GoogleG size={16} />
                        <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-bold tracking-[0.14em] text-hill-muted">SIGNED IN AS</div>
                            <div className="truncate text-[13px] font-semibold">{profile.email}</div>
                        </div>
                        <button onClick={onSignOut} className="text-[11px] font-semibold text-hill-muted tracking-wide">Sign out</button>
                    </div>
                )}

                {/* Name */}
                <div className="mt-5 w-full">
                    <div className="mb-2 text-[10px] font-bold tracking-[0.18em] text-hill-muted">DISPLAY NAME</div>
                    <div className="flex items-center gap-2 rounded-xl border border-hill-border-hi bg-hill-surface px-4 py-3.5 text-[17px] font-semibold">
                        <input
                            ref={nameRef}
                            defaultValue={profile?.displayName ?? 'Player_a3f9'}
                            onBlur={(e) => onChangeName?.(e.target.value)}
                            className="flex-1 bg-transparent outline-none"
                        />
                        <span className="font-mono text-[11px] tracking-[0.08em] text-hill-dim">SAVED ✓</span>
                    </div>
                </div>

                {/* Stats grid */}
                <div className="mt-5 grid w-full grid-cols-3 overflow-hidden rounded-[14px] border border-hill-border bg-hill-surface">
                    {[
                        { label: 'TOTAL WINS', value: profile?.totalWins ?? 0 },
                        { label: 'GAMES', value: profile?.totalGames ?? 0 },
                        { label: 'WIN RATE', value: profile ? `${Math.round((profile.totalWins / Math.max(1, profile.totalGames)) * 100)}%` : '—' },
                    ].map((s, i) => (
                        <div key={s.label} className={`px-3 py-4 text-center ${i < 2 ? 'border-r border-hill-border' : ''}`}>
                            <div className="font-mono text-[26px] font-bold">{s.value}</div>
                            <div className="mt-0.5 text-[10px] tracking-[0.14em] text-hill-muted">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Tier progress */}
                <div className="mt-3.5 w-full">
                    <div className="mb-1.5 flex justify-between font-mono text-[11px] tracking-[0.08em] text-hill-muted">
                        <span>{userTier.toUpperCase()} · TIER III</span><span>→ MASTER · 240 ELO</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-hill-surface">
                        <div className="h-full" style={{ width: '62%', background: 'linear-gradient(90deg, #FFD700, #BFFF00)', boxShadow: '0 0 12px #BFFF00' }} />
                    </div>
                </div>

                {/* Skin selector */}
                <div className="mt-5 w-full">
                    <div className="mb-2 flex items-center justify-between">
                        <div className="text-[10px] font-bold tracking-[0.18em] text-hill-muted">PIECE SKIN</div>
                        <div className="font-mono text-[10px] tracking-[0.08em] text-hill-dim">SHAPE STAYS THE SAME</div>
                    </div>
                    <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {(Object.keys(SKINS) as SkinId[]).map(sk => {
                            const unlocked = skinUnlocked(sk, userTier);
                            const tier = SKINS[sk].tier;
                            return (
                                <SkinCard
                                    key={sk} skinId={sk}
                                    selected={skin === sk}
                                    locked={!unlocked}
                                    unlockText={unlocked ? null : `Unlock at ${tier} · ${WINS_TO_UNLOCK[tier]} wins`}
                                    onClick={() => unlocked && onSelectSkin?.(sk)}
                                />
                            );
                        })}
                    </div>
                    <div className="mt-2 font-mono text-[11px] tracking-wide text-hill-muted">
                        <span className="text-hill-accent">✓</span> Auto-saved · applies to all your pieces
                    </div>
                </div>

                {/* Stat lines */}
                <div className="mt-4 flex w-full flex-col gap-1.5">
                    {[
                        ['Longest streak', '7 wins'],
                        ['Favorite mode', 'Blitz 4P'],
                        ['Pieces captured', '1,204'],
                        ['Hill seconds held', '14m 22s'],
                    ].map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between rounded-[10px] border border-hill-border bg-hill-surface px-3.5 py-3 text-[13px]">
                            <span className="text-hill-muted">{k}</span>
                            <span className="font-mono font-bold">{v}</span>
                        </div>
                    ))}
                </div>

                <button
                    onClick={onResetAccount}
                    className="mt-5 h-12 w-full rounded-xl border border-hill-danger/40 bg-transparent text-sm font-bold tracking-wide text-hill-danger active:scale-[0.98]"
                >
                    RESET ACCOUNT
                </button>
            </div>

            <BottomNav active="me" />
        </div>
    );
}

function SkinCard({ skinId, selected, locked, unlockText, onClick }: {
    skinId: SkinId; selected?: boolean; locked?: boolean; unlockText?: string | null; onClick?: () => void;
}) {
    const meta = SKINS[skinId];
    return (
        <button
            onClick={onClick}
            disabled={locked}
            className="relative flex w-[116px] flex-shrink-0 flex-col items-center gap-2 rounded-[14px] px-3 pt-3.5 pb-3 disabled:cursor-not-allowed"
            style={{
                background: selected ? 'rgba(191,255,0,0.05)' : '#141414',
                borderWidth: 1.5, borderStyle: 'solid', borderColor: selected ? '#BFFF00' : '#1F1F1F',
                boxShadow: selected ? '0 0 18px rgba(191,255,0,0.12)' : 'none',
                opacity: locked ? 0.55 : 1,
            }}
        >
            <div
                className="relative flex h-14 w-14 items-center justify-center rounded-xl border border-hill-border"
                style={{
                    background: locked ? 'rgba(255,255,255,0.03)' : 'linear-gradient(135deg,#1f1f1f,#0f0f0f)',
                    filter: locked ? 'grayscale(0.7) brightness(0.7)' : 'none',
                }}
            >
                <PieceShape player={1} size={32} skin={skinId} />
                {locked && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-hill-bg/55">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#808080" strokeWidth="2" strokeLinecap="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>
                    </div>
                )}
            </div>
            <div className="text-center">
                <div className="text-[13px] font-bold">{meta.name}</div>
                <div className="mt-0.5 font-mono text-[9px] tracking-[0.14em]" style={{ color: meta.color }}>{meta.tag}</div>
            </div>
            {selected && !locked && (
                <div className="rounded-sm bg-hill-accent px-1.5 py-0.5 text-[9px] font-extrabold tracking-[0.14em] text-hill-bg">SELECTED</div>
            )}
            {locked && unlockText && (
                <div className="text-center font-mono text-[9px] leading-snug tracking-wide text-hill-muted">{unlockText}</div>
            )}
            {!selected && !locked && (
                <div className="font-mono text-[9px] tracking-[0.14em] text-hill-muted">TAP</div>
            )}
        </button>
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