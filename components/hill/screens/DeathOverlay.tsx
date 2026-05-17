'use client';
import { CTAButton } from '../CTAButton';
import { PieceShape } from '../PieceShape';
import type { Player, SkinId } from '@/types/hill';

export interface DeathOverlayProps {
    round: number;
    player: Player;
    playerName: string;
    playerSkin?: SkinId;
    onSpectate: () => void;
    onLeave: () => void;
}

export function DeathOverlay({
                                 round, player, playerName, playerSkin = 'bronze', onSpectate, onLeave,
                             }: DeathOverlayProps) {
    return (
        <div
            className="fixed inset-0 z-50 flex flex-col animate-hill-fadein"
            style={{
                background: 'radial-gradient(120% 80% at 50% 30%, rgba(255,59,48,0.28), rgba(10,10,10,0.85) 60%, rgba(10,10,10,0.96))',
                backdropFilter: 'blur(8px)',
            }}
        >
            <div
                className="flex-1 flex flex-col items-center justify-center px-6"
                style={{ paddingTop: 'env(safe-area-inset-top)' }}
            >
                <div className="flex items-center gap-2 rounded-full border border-hill-danger/40 bg-black/40 py-1.5 pl-2 pr-3 font-mono text-[11px] font-bold tracking-[0.18em] text-hill-danger">
                    <PieceShape player={player} size={16} skin={playerSkin} />
                    {playerName.toUpperCase()} · OUT
                </div>

                <div
                    className="mt-6 font-extrabold tracking-display animate-hill-rise text-hill-danger"
                    style={{ fontSize: 84, lineHeight: 0.9, textShadow: '0 0 32px rgba(255,59,48,0.5)' }}
                >
                    YOU<br />DIED.
                </div>

                <div className="mt-4 font-mono text-sm tracking-[0.08em] text-white/70">
                    ELIMINATED · ROUND {round}
                </div>

                <div className="mt-9 max-w-[280px] rounded-xl border border-hill-border bg-black/40 px-4 py-3 text-center text-xs text-hill-muted">
                    Hold tight — match continues without you. Spectate to watch.
                </div>
            </div>

            <div
                className="flex flex-col gap-2.5 px-5"
                style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
            >
                <CTAButton variant="primary" onClick={onSpectate} className="!h-14">👁  Spectate</CTAButton>
                <CTAButton variant="secondary" onClick={onLeave} style={{ borderColor: 'rgba(255,255,255,0.2)' }}>← Leave Room</CTAButton>
            </div>
        </div>
    );
}