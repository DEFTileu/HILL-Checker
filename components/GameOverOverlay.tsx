'use client';
import { useState } from 'react';
import { ArenaBadge } from '@/components/ArenaBadge';
import { CTAButton } from '@/components/CTAButton';
import { PieceShape } from '@/components/PieceShape';
import type { Player } from '@/lib/tokens';
import type { ArenaTier, SkinId } from '@/lib/skins';

export type GameOverKind = 'solo' | 'joint' | 'none';

export interface Winner {
    player: Player;
    name: string;
    tier: ArenaTier;
    skin: SkinId;
    eloDelta: number;
}

export interface GameOverOverlayProps {
    kind: GameOverKind;
    winners: Winner[];
    matchDuration: string; // e.g. "3:14"
    roundCount?: number;
    /**
     * Game mode. Classic has no meaningful "rounds" (it ends on capture, not
     * a round cap), so the header drops the ROUNDS segment for 'classic-2p'.
     */
    mode?: 'classic-2p' | 'hill-blitz' | 'hill-survival';
    onPlayAgain: () => void;
    /**
     * Optional analytics/side-effect hook fired after a successful share or
     * clipboard copy. The actual share (native sheet + clipboard fallback)
     * is owned by this component, so call sites no longer need to wire it.
     */
    onShare?: () => void;
    onLobby: () => void;
}

export function GameOverOverlay({
                                    kind, winners, matchDuration, roundCount = 7, mode = 'hill-blitz',
                                    onPlayAgain, onShare, onLobby,
                                }: GameOverOverlayProps) {
    const [shareCopied, setShareCopied] = useState(false);

    async function handleShare() {
        const winnerNames = winners.map((w) => w.name);
        const winnersText =
            winnerNames.length === 1
                ? `${winnerNames[0]} won on HILL!`
                : winnerNames.length > 1
                    ? `JOINT KINGS on HILL: ${winnerNames.join(' & ')}!`
                    : 'NO KING TODAY on HILL — survive next time.';

        const shareData = {
            title: 'HILL — King of the Board',
            text: winnersText,
            url: typeof window !== 'undefined' ? window.location.origin : 'https://hill.javazhan.tech',
        };

        // Try native share first (mobile).
        if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
            try {
                await navigator.share(shareData);
                onShare?.();
                return;
            } catch (err) {
                // User cancelled — bail silently, don't fall through to clipboard.
                if (err instanceof DOMException && err.name === 'AbortError') return;
                // Any other error: fall through to the clipboard fallback.
            }
        }

        // Fallback: copy to clipboard (desktop).
        const fallbackText = `${shareData.text} ${shareData.url}`;
        try {
            await navigator.clipboard.writeText(fallbackText);
            setShareCopied(true);
            setTimeout(() => setShareCopied(false), 2000);
            onShare?.();
        } catch {
            console.warn('Share failed — clipboard not available');
        }
    }
    // Mobile font sizes preserved exactly (solo/none 64px, joint 48px); the
    // md/lg/xl steps only apply on larger viewports.
    const headlineSize = kind === 'joint'
        ? 'text-[48px] md:text-7xl lg:text-[120px] xl:text-[150px]'
        : 'text-[64px] md:text-8xl lg:text-[140px] xl:text-[180px]';
    const headline =
        kind === 'solo'  ? <>{winners[0].name.toUpperCase()}{' '}<br className="lg:hidden" />WINS.</> :
            kind === 'joint' ? <>JOINT{' '}<br className="lg:hidden" />KINGS.</> :
                <>NO KING{' '}<br className="lg:hidden" />TODAY.</>;

    // Mobile background unchanged (same radial gradient / solid + 10px blur);
    // on lg+ swap to a lighter translucent layer so the board shows through.
    const bgMobile = kind === 'none'
        ? 'bg-[rgba(10,10,10,0.96)]'
        : 'bg-[radial-gradient(120%_80%_at_50%_40%,rgba(191,255,0,0.18),rgba(10,10,10,0.85)_55%,rgba(10,10,10,0.97))]';

    return (
        <div
            // Cinematic moment — stays dark in both themes (spec §G/§H).
            data-theme="dark"
            className={[
                'fixed inset-0 z-50 flex flex-col animate-hill-fadein',
                bgMobile,
                'backdrop-blur-[10px]',
                'lg:items-center lg:justify-center lg:px-12 lg:bg-black/70 lg:bg-none lg:backdrop-blur-md',
            ].join(' ')}
        >
            <div className="flex-1 lg:flex-none flex flex-col items-center justify-center px-6 pt-14 lg:pt-0 lg:w-full">
                <div className="font-mono text-[11px] font-bold tracking-[0.24em] text-hill-accent lg:text-base lg:tracking-widest">
                    {mode === 'classic-2p'
                        ? <>MATCH · {matchDuration}</>
                        : <>MATCH · {roundCount} ROUNDS · {matchDuration}</>}
                </div>

                {kind !== 'none' && <div className="mt-3.5 text-4xl opacity-90 lg:mt-6 lg:text-6xl">👑</div>}

                <div
                    className={[
                        'mt-1.5 text-center font-extrabold tracking-display animate-hill-rise',
                        'leading-[0.9] lg:leading-none lg:whitespace-nowrap',
                        headlineSize,
                    ].join(' ')}
                    style={{
                        background: kind === 'none'
                            ? 'linear-gradient(180deg,#808080,#404040)'
                            : 'linear-gradient(180deg,#FAFAFA,#BFFF00)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                        textShadow: kind === 'none' ? 'none' : '0 0 40px rgba(191,255,0,0.25)',
                    }}
                >
                    {headline}
                </div>

                {winners.length > 0 && (
                    <div
                        className={[
                            'mt-5 flex w-full max-w-[280px] flex-col gap-2',
                            'lg:mt-8 lg:flex-row lg:gap-6 lg:justify-center lg:mx-auto',
                            winners.length > 1 ? 'lg:max-w-4xl' : 'lg:max-w-md',
                        ].join(' ')}
                    >
                        {winners.map((w, i) => (
                            <div
                                key={i}
                                className={[
                                    'flex items-center gap-3 rounded-xl border-[1.5px] border-hill-accent bg-hill-accent/[0.05] px-3.5 py-3',
                                    'lg:px-5 lg:py-4',
                                    winners.length > 1 ? 'lg:flex-1' : '',
                                ].join(' ')}
                                style={{ boxShadow: '0 0 20px rgba(191,255,0,0.12)' }}
                            >
                                <PieceShape player={w.player} size={32} isKing skin={w.skin} />
                                <div className="flex-1">
                                    <div className="text-[15px] font-bold lg:text-lg">{w.name}</div>
                                    <div className="mt-0.5"><ArenaBadge tier={w.tier} /></div>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono text-[22px] font-bold text-hill-accent lg:text-[26px]">
                                        {w.eloDelta >= 0 ? '+' : ''}{w.eloDelta}
                                    </div>
                                    <div className="font-mono text-[10px] tracking-wide text-hill-muted">ELO</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {kind === 'none' && (
                    <div className="mt-5 max-w-[240px] text-center text-[13px] text-hill-muted lg:mt-8 lg:max-w-md lg:text-base">
                        Survival ended with no last player standing. Nobody scores.
                    </div>
                )}
            </div>

            <div
                className="flex flex-col gap-2.5 px-5 lg:flex-row lg:gap-4 lg:justify-center lg:max-w-2xl lg:mx-auto lg:mt-12 lg:px-0"
                style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
            >
                <CTAButton variant="primary" onClick={onPlayAgain} className="lg:w-auto lg:px-8">Play again</CTAButton>
                <div className="flex gap-2.5 lg:contents">
                    <CTAButton variant="secondary" onClick={handleShare} className="lg:w-auto lg:px-8">{shareCopied ? '✓ Copied!' : 'Share result'}</CTAButton>
                    <CTAButton variant="secondary" onClick={onLobby} className="lg:w-auto lg:px-8">Lobby</CTAButton>
                </div>
            </div>
        </div>
    );
}
