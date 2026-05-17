// components/PlayerSlot.tsx
'use client';
import { PieceShape } from './PieceShape';
import { TurnTimer } from './TurnTimer';
import { ArenaBadge } from './ArenaBadge';
import { HILL, type PlayerNum } from '@/lib/tokens';
import type { SkinId, TierId } from '@/lib/skins';

interface Props {
  player: PlayerNum;
  name?: string;
  tier?: TierId;
  isHost?: boolean;
  empty?: boolean;
  eliminated?: boolean;
  isActive?: boolean;
  secondsLeft?: number;
  secondsTotal?: number;
  you?: boolean;
  compact?: boolean;
  skin?: SkinId;
}

/**
 * Mobile lobby + in-game player chip. PlayerPanelDesktop wraps a different
 * layout for desktop side rails.
 */
export function PlayerSlot({
  player, name, tier, isHost, empty, eliminated,
  isActive, secondsLeft, secondsTotal = 10, you,
  compact = false, skin = 'bronze',
}: Props) {
  const color = [HILL.p1, HILL.p2, HILL.p3, HILL.p4][player - 1];
  return (
    <div
      className={[
        'relative flex items-center rounded-[14px] overflow-hidden transition-colors',
        compact ? 'gap-2.5 px-3 py-2.5 min-h-[64px]' : 'gap-3 p-3.5 min-h-[88px]',
        'bg-[var(--hill-surface)] border-[1.5px]',
        isActive ? 'border-[var(--hill-accent)]' : empty ? 'border-white/[0.06]' : 'border-[var(--hill-border)]',
        eliminated ? 'opacity-55' : '',
      ].join(' ')}
    >
      <div
        className="absolute top-0 bottom-0 left-0 w-[3px]"
        style={{ background: empty ? 'transparent' : color, opacity: eliminated ? 0.3 : 1 }}
      />

      {isActive && secondsLeft != null ? (
        <TurnTimer seconds={secondsLeft} total={secondsTotal} size={compact ? 36 : 44}>
          <PieceShape player={player} size={compact ? 18 : 22} skin={skin}/>
        </TurnTimer>
      ) : (
        <div
          className={[
            'flex items-center justify-center rounded-full bg-white/[0.03]',
            compact ? 'w-9 h-9' : 'w-11 h-11',
            empty ? 'border border-dashed border-[var(--hill-borderHi)]' : 'border border-white/[0.06]',
          ].join(' ')}
        >
          {empty
            ? <span className="text-[var(--hill-dim)] text-lg leading-none">+</span>
            : <PieceShape player={player} size={compact ? 18 : 22} skin={skin}/>}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className={[
              compact ? 'text-sm' : 'text-[15px]',
              'font-bold truncate',
              empty ? 'text-[var(--hill-dim)]' : 'text-[var(--hill-text)]',
              eliminated ? 'line-through' : '',
            ].join(' ')}
          >
            {empty ? 'Waiting…' : name}
          </span>
          {you && !empty && <span className="text-[9px] font-bold text-[var(--hill-accent)] tracking-[0.1em]">YOU</span>}
          {isHost && !empty && <span className="text-[9px] font-bold text-[var(--hill-muted)] tracking-[0.1em]">HOST</span>}
        </div>
        <div className="mt-1 flex items-center gap-1.5">
          {empty
            ? <span className="text-[11px] text-[var(--hill-dim)] font-mono">Slot P{player} · open</span>
            : eliminated
              ? <span className="text-[11px] text-[var(--hill-danger)] font-bold tracking-[0.08em]">ELIMINATED</span>
              : tier && <ArenaBadge tier={tier}/>}
        </div>
      </div>
    </div>
  );
}
