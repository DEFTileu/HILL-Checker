'use client';
import { ArenaBadge } from '../ArenaBadge';
import { CTAButton } from '../CTAButton';
import { PieceShape } from '../PieceShape';
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
    onPlayAgain: () => void;
    onShare: () => void;
    onLobby: () => void;
}

export function GameOverOverlay({
                                    kind, winners, matchDuration, roundCount = 7, onPlayAgain, onShare, onLobby,
                                }: GameOverOverlayProps) {
    const headlineFontSize = kind === 'joint' ? 48 : 64;
    const headline =
        kind === 'solo'  ? <>{winners[0].name.toUpperCase()}<br />WINS.</> :
            kind === 'joint' ? <>JOINT<br />KINGS.</> :
                <>NO KING<br />TODAY.</>;

    return (
        <div
            className="fixed inset-0 z-50 flex flex-col animate-hill-fadein"
            style={{
                background: kind === 'none'
                    ? 'rgba(10,10,10,0.96)'
                    : 'radial-gradient(120% 80% at 50% 40%, rgba(191,255,0,0.18), rgba(10,10,10,0.85) 55%, rgba(10,10,10,0.97))',
                backdropFilter: 'blur(10px)',
            }}
        >
            <div className="flex-1 flex flex-col items-center justify-center px-6 pt-14">
                <div className="font-mono text-[11px] font-bold tracking-[0.24em] text-hill-accent">
                    MATCH · {roundCount} ROUNDS · {matchDuration}
                </div>

                {kind !== 'none' && <div className="mt-3.5 text-4xl opacity-90">👑</div>}

                <div
                    className="mt-1.5 text-center font-extrabold tracking-display animate-hill-rise"
                    style={{
                        fontSize: headlineFontSize, lineHeight: 0.9,
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
                    <div className="mt-5 flex w-full max-w-[280px] flex-col gap-2">
                        {winners.map((w, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 rounded-xl border-[1.5px] border-hill-accent bg-hill-accent/[0.05] px-3.5 py-3"
                                style={{ boxShadow: '0 0 20px rgba(191,255,0,0.12)' }}
                            >
                                <PieceShape player={w.player} size={32} isKing skin={w.skin} />
                                <div className="flex-1">
                                    <div className="text-[15px] font-bold">{w.name}</div>
                                    <div className="mt-0.5"><ArenaBadge tier={w.tier} /></div>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono text-[22px] font-bold text-hill-accent">
                                        {w.eloDelta >= 0 ? '+' : ''}{w.eloDelta}
                                    </div>
                                    <div className="font-mono text-[10px] tracking-wide text-hill-muted">ELO</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {kind === 'none' && (
                    <div className="mt-5 max-w-[240px] text-center text-[13px] text-hill-muted">
                        Survival ended with no last player standing. Nobody scores.
                    </div>
                )}
            </div>

            <div
                className="flex flex-col gap-2.5 px-5"
                style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
            >
                <CTAButton variant="primary" onClick={onPlayAgain}>Play again</CTAButton>
                <div className="flex gap-2.5">
                    <CTAButton variant="secondary" onClick={onShare}>Share result</CTAButton>
                    <CTAButton variant="secondary" onClick={onLobby}>Lobby</CTAButton>
                </div>
            </div>
        </div>
    );
}