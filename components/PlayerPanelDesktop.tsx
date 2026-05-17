// components/PlayerPanelDesktop.tsx  (NEW)
'use client';
import { PieceShape } from './PieceShape';
import { TurnTimer } from './TurnTimer';
import { ArenaBadge } from './ArenaBadge';
import { HILL, type PlayerNum } from '@/lib/tokens';
import type { SkinId, TierId } from '@/lib/skins';

export interface DesktopPanelPlayer {
  player: PlayerNum;
  name: string;
  tier: TierId;
  you?: boolean;
  isActive?: boolean;
  secondsLeft?: number;
  secondsTotal?: number;
  eliminated?: boolean;
  alivePieces: number;
  capturedThisRound?: number;
  skin: SkinId;
  /** Seconds left in the reconnect grace window; undefined when connected. */
  disconnectSecondsLeft?: number;
}

interface Props {
  player: DesktopPanelPlayer;
  /** Which side of the board this panel flanks — affects color stripe placement. */
  side: 'left' | 'right';
}

/**
 * Wider, vertical, info-rich panel for the desktop game layout. Used in a
 * stacked-pair on each side of the board: P1+P4 left, P2+P3 right.
 */
export function PlayerPanelDesktop({ player, side }: Props) {
  const color = [HILL.p1, HILL.p2, HILL.p3, HILL.p4][player.player - 1];
  const sideClass = side === 'left' ? 'left-0' : 'right-0';
  const disconnected =
    !player.eliminated && player.disconnectSecondsLeft != null;

  return (
    <div
      className={[
        'relative w-[220px] rounded-2xl p-4 pb-3.5 flex flex-col gap-3 transition-[border-color,box-shadow]',
        'bg-[var(--hill-surface)] border-[1.5px]',
        disconnected
          ? 'border-[var(--hill-danger)] shadow-[0_0_24px_rgba(255,59,48,0.15)]'
          : player.isActive ? 'border-[var(--hill-accent)] shadow-[0_0_24px_rgba(191,255,0,0.15)]' : 'border-[var(--hill-border)]',
        player.eliminated ? 'opacity-55' : '',
      ].join(' ')}
    >
      <div
        className={`absolute top-0 bottom-0 w-[3px] ${sideClass}`}
        style={{ background: color, opacity: player.eliminated ? 0.3 : 1 }}
      />

      <div className="flex items-center gap-3">
        {player.isActive && player.secondsLeft != null ? (
          <TurnTimer seconds={player.secondsLeft} total={player.secondsTotal ?? 10} size={50}>
            <PieceShape player={player.player} size={26} skin={player.skin}/>
          </TurnTimer>
        ) : (
          <div className="w-[50px] h-[50px] rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
            <PieceShape player={player.player} size={26} skin={player.skin}/>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={[
              'text-[15px] font-bold truncate',
              player.eliminated ? 'line-through' : '',
            ].join(' ')}>{player.name}</span>
            {player.you && <span className="text-[9px] font-bold text-[var(--hill-accent)] tracking-[0.1em]">YOU</span>}
          </div>
          <div className="mt-1">
            {player.eliminated
              ? <span className="text-[11px] text-[var(--hill-danger)] font-bold tracking-[0.08em]">ELIMINATED</span>
              : disconnected
                ? <span className="text-[11px] text-[var(--hill-danger)] font-bold tracking-[0.06em] font-mono">Disconnected, {Math.max(0, player.disconnectSecondsLeft!)}s…</span>
                : <ArenaBadge tier={player.tier}/>}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-3 py-2.5 rounded-[10px] bg-[var(--hill-surface2)] border border-[var(--hill-border)]">
        <div className="flex items-center gap-2">
          <PieceShape player={player.player} size={18} skin={player.skin}/>
          <span className="font-mono text-[11px] text-[var(--hill-muted)] tracking-[0.08em]">PIECES</span>
        </div>
        <span
          className={[
            'font-mono text-[18px] font-extrabold',
            player.eliminated ? 'text-[var(--hill-danger)]' : 'text-[var(--hill-text)]',
          ].join(' ')}
        >{player.alivePieces}</span>
      </div>

      {player.capturedThisRound !== undefined && !player.eliminated && (
        <div className="flex items-center justify-between text-[11px] font-mono text-[var(--hill-muted)] tracking-[0.08em]">
          <span>CAPTURED THIS ROUND</span>
          <span className="text-[var(--hill-accent)] font-bold">+{player.capturedThisRound}</span>
        </div>
      )}

      {player.isActive && !disconnected && (
        <div className="text-center font-mono text-[10px] font-bold text-[var(--hill-accent)] tracking-[0.2em]">
          ● THINKING · {player.secondsLeft}s
        </div>
      )}
    </div>
  );
}
