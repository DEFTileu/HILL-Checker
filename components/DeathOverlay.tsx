// components/DeathOverlay.tsx
'use client';
import { useEffect } from 'react';
import { CTAButton } from './CTAButton';
import { PieceShape } from './PieceShape';
import type { PlayerNum } from '@/lib/tokens';
import type { SkinId } from '@/lib/skins';

interface Props {
  round: number;
  eliminatedPlayer?: { player: PlayerNum; name: string; skin: SkinId };
  onSpectate?: () => void;
  onLeave?: () => void;
  /** Esc-to-close — wires document keydown for desktop keyboard users. */
  onClose?: () => void;
}

export function DeathOverlay({ round, eliminatedPlayer, onSpectate, onLeave, onClose }: Props) {
  useEffect(() => {
    if (!onClose) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col px-6 pt-14 pb-6 lg:px-12 lg:pt-0 lg:pb-12 lg:justify-center animate-[hill-fadein_.35s_ease] bg-[radial-gradient(120%_80%_at_50%_30%,rgba(255,59,48,0.28),rgba(10,10,10,0.85)_60%,rgba(10,10,10,0.96))] lg:bg-red-900/30 lg:bg-none lg:backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="death-headline"
    >
      <div className="flex-1 lg:flex-none flex flex-col items-center justify-center gap-0">
        {eliminatedPlayer && (
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 pl-2 rounded-full font-mono text-[11px] lg:text-xs font-bold tracking-[0.18em] lg:tracking-[0.24em] text-[var(--hill-danger)]"
            style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,59,48,0.4)' }}
          >
            <PieceShape player={eliminatedPlayer.player} size={16} skin={eliminatedPlayer.skin}/>
            {eliminatedPlayer.name.toUpperCase()} · OUT
          </div>
        )}

        <h1
          id="death-headline"
          className="font-extrabold text-center leading-[0.9] tracking-[-0.04em] lg:tracking-[-0.05em] mt-6 lg:mt-8 text-[var(--hill-danger)] animate-[hill-rise_.5s_ease] text-7xl md:text-9xl lg:text-[180px] xl:text-[220px]"
          style={{
            textShadow: '0 0 32px rgba(255,59,48,0.5)',
          }}
        >
          YOU<br/>DIED.
        </h1>

        <div className="mt-4 lg:mt-6 text-sm lg:text-xl font-mono tracking-[0.08em] lg:tracking-[0.18em] text-white/70">
          ELIMINATED · ROUND {round}
        </div>

        <div
          className="mt-9 lg:mt-9 max-w-[280px] lg:max-w-[460px] text-center text-xs lg:text-sm text-[var(--hill-muted)] text-pretty rounded-xl px-4.5 py-3 lg:px-6 lg:py-3.5"
          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--hill-border)' }}
        >
          Hold tight — match continues without you. Watch to spectate.
        </div>
      </div>

      <div className="flex flex-col gap-2.5 lg:flex-row lg:gap-4 lg:justify-center lg:max-w-xl lg:mx-auto lg:mt-12 lg:static lg:w-full">
        <CTAButton variant="primary" onClick={onSpectate} className="lg:w-auto lg:px-8">
          👁 Spectate
        </CTAButton>
        <CTAButton variant="secondary" onClick={onLeave} className="lg:w-auto lg:px-8">
          ← Leave Room
        </CTAButton>
      </div>
      <div className="hidden lg:block font-mono text-[11px] text-[var(--hill-dim)] tracking-[0.14em] text-center mt-4">
        ESC TO LEAVE · SPACE TO SPECTATE
      </div>
    </div>
  );
}
