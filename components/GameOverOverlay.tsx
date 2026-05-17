// components/GameOverOverlay.tsx
'use client';
import { useEffect } from 'react';
import { CTAButton } from './CTAButton';
import { PieceShape } from './PieceShape';
import { ArenaBadge } from './ArenaBadge';
import type { PlayerNum } from '@/lib/tokens';
import type { SkinId, TierId } from '@/lib/skins';

export type GameOverKind = 'solo' | 'joint' | 'none';

export interface Winner {
  player: PlayerNum;
  name: string;
  tier: TierId;
  pieces: number;
  skin: SkinId;
  elo: number;
}

interface Props {
  kind: GameOverKind;
  winners: Winner[];
  durationLabel?: string;
  onPlayAgain?: () => void;
  onShare?: () => void;
  onLobby?: () => void;
  onClose?: () => void;
}

export function GameOverOverlay({
  kind, winners, durationLabel = 'MATCH · 7 ROUNDS · 3:14',
  onPlayAgain, onShare, onLobby, onClose,
}: Props) {
  useEffect(() => {
    if (!onClose) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter' && onPlayAgain) onPlayAgain();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, onPlayAgain]);

  const isNone = kind === 'none';

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col px-6 pt-14 pb-6 lg:px-12 lg:pt-0 lg:pb-12 animate-[hill-fadein_.4s_ease] lg:backdrop-blur-md"
      style={{
        background: isNone
          ? 'rgba(10,10,10,0.96)'
          : 'radial-gradient(120% 80% at 50% 40%, rgba(191,255,0,0.18), rgba(10,10,10,0.85) 55%, rgba(10,10,10,0.97))',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gameover-headline"
    >
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-[11px] lg:text-xs font-bold font-mono tracking-[0.24em] lg:tracking-[0.32em] text-[var(--hill-accent)]">
          {durationLabel}
        </div>

        {!isNone && <div className="text-[38px] lg:text-[56px] mt-3.5 opacity-90">👑</div>}

        <h1
          id="gameover-headline"
          className="font-extrabold text-center leading-[0.85] tracking-[-0.04em] lg:tracking-[-0.05em] mt-1.5 animate-[hill-rise_.5s_ease]"
          style={{
            fontSize: kind === 'joint'
              ? 'clamp(56px, 10vw, 140px)'
              : 'clamp(64px, 11vw, 180px)',
            background: isNone
              ? 'linear-gradient(180deg,#808080,#404040)'
              : 'linear-gradient(180deg,#FAFAFA,#BFFF00)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            textShadow: isNone ? 'none' : '0 0 40px rgba(191,255,0,0.25)',
          }}
        >
          {kind === 'solo' && <>{winners[0]?.name.toUpperCase()}<br/>WINS.</>}
          {kind === 'joint' && <>JOINT<br/>KINGS.</>}
          {kind === 'none' && <>NO KING<br/>TODAY.</>}
        </h1>

        {winners.length > 0 && (
          <div className="mt-5 lg:mt-7 flex flex-col lg:flex-row gap-2 lg:gap-4 w-full max-w-[280px] lg:max-w-none lg:justify-center">
            {winners.map((w, i) => (
              <div
                key={i}
                className="flex items-center gap-3 lg:gap-4 px-3.5 py-3 lg:px-[22px] lg:py-[18px] rounded-xl bg-[rgba(191,255,0,0.05)] border-[1.5px] border-[var(--hill-accent)] shadow-[0_0_20px_rgba(191,255,0,0.12)] lg:min-w-[280px]"
              >
                <PieceShape player={w.player} size={32} isKing skin={w.skin}/>
                <div className="flex-1">
                  <div className="text-[15px] lg:text-xl font-bold">{w.name}</div>
                  <div className="mt-0.5 lg:mt-1"><ArenaBadge tier={w.tier}/></div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[22px] lg:text-[32px] font-extrabold text-[var(--hill-accent)]">
                    +{w.elo}
                  </div>
                  <div className="font-mono text-[10px] font-bold text-[var(--hill-muted)] tracking-[0.08em] lg:tracking-[0.16em]">
                    ELO
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isNone && (
          <div className="mt-5 text-sm lg:text-base text-center text-[var(--hill-muted)] max-w-[240px] lg:max-w-[360px] text-pretty">
            Survival ended with no last player standing. Nobody scores.
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2.5 lg:flex-row lg:gap-3.5 lg:justify-center lg:max-w-[680px] lg:mx-auto lg:w-full">
        <CTAButton variant="primary" onClick={onPlayAgain}>Play Again</CTAButton>
        <CTAButton variant="secondary" onClick={onShare}>Share Result</CTAButton>
        <CTAButton variant="secondary" onClick={onLobby}>Lobby</CTAButton>
      </div>
      <div className="hidden lg:block font-mono text-[11px] text-[var(--hill-dim)] tracking-[0.14em] text-center mt-4">
        ENTER TO REMATCH · ESC TO RETURN
      </div>
    </div>
  );
}
