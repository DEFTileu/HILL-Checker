import { ArenaBadge } from './ArenaBadge';
import { PieceShape } from './PieceShape';
import { TurnTimer } from './TurnTimer';
import type { Player } from '@/lib/tokens';
import type { ArenaTier, SkinId } from '@/lib/skins';

export interface PlayerSlotProps {
    player: Player;
    name?: string;
    tier?: ArenaTier;
    skin?: SkinId;
    isHost?: boolean;
    isYou?: boolean;
    empty?: boolean;
    eliminated?: boolean;
    isActive?: boolean;
    secondsLeft?: number;
    secondsTotal?: number;
    compact?: boolean;
}

const COLOR: Record<Player, string> = { 1: '#FFFFFF', 2: '#1A1A1A', 3: '#FF2D87', 4: '#00D9FF' };

export function PlayerSlot(p: PlayerSlotProps) {
    const compact = p.compact;
    return (
        <div
            className={`relative flex items-center overflow-hidden rounded-[14px] bg-hill-surface ${
                p.eliminated ? 'opacity-55' : ''
            } ${compact ? 'gap-2.5 p-[10px_12px] min-h-[64px]' : 'gap-3 p-[14px] min-h-[88px]'}`}
            style={{
                borderWidth: 1.5,
                borderStyle: 'solid',
                borderColor: p.isActive ? '#BFFF00' : p.empty ? 'rgba(255,255,255,0.06)' : '#1F1F1F',
            }}
        >
            <div
                className="absolute inset-y-0 left-0 w-[3px]"
                style={{ background: p.empty ? 'transparent' : COLOR[p.player], opacity: p.eliminated ? 0.3 : 1 }}
            />
            {p.isActive && p.secondsLeft != null ? (
                <TurnTimer seconds={p.secondsLeft} total={p.secondsTotal ?? 10} size={compact ? 36 : 44}>
                    <PieceShape player={p.player} size={compact ? 18 : 22} skin={p.skin} />
                </TurnTimer>
            ) : (
                <div
                    className={`flex items-center justify-center rounded-full bg-white/[0.03] ${compact ? 'h-9 w-9' : 'h-11 w-11'}`}
                    style={{ borderWidth: 1, borderStyle: p.empty ? 'dashed' : 'solid', borderColor: p.empty ? '#2A2A2A' : 'rgba(255,255,255,0.06)' }}
                >
                    {p.empty
                        ? <span className="text-hill-dim text-lg leading-none">+</span>
                        : <PieceShape player={p.player} size={compact ? 18 : 22} skin={p.skin} />}
                </div>
            )}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
          <span
              className={`font-bold truncate ${compact ? 'text-sm' : 'text-[15px]'} ${
                  p.empty ? 'text-hill-dim' : 'text-hill-text'
              } ${p.eliminated ? 'line-through' : ''}`}
          >
            {p.empty ? 'Waiting…' : p.name}
          </span>
                    {p.isYou && !p.empty && <span className="text-[9px] font-bold text-hill-accent tracking-[0.1em]">YOU</span>}
                    {p.isHost && !p.empty && <span className="text-[9px] font-bold text-hill-muted tracking-[0.1em]">HOST</span>}
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                    {p.empty ? (
                        <span className="font-mono text-[11px] text-hill-dim">Slot P{p.player} · open</span>
                    ) : p.eliminated ? (
                        <span className="text-[11px] font-bold text-hill-danger tracking-[0.08em]">ELIMINATED</span>
                    ) : (
                        p.tier && <ArenaBadge tier={p.tier} />
                    )}
                </div>
            </div>
        </div>
    );
}