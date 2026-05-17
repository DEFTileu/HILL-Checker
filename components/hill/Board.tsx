'use client';
import { PieceShape } from './PieceShape';
import type { Piece, Coord } from '@/lib/pieces';
import type { Player } from '@/lib/tokens';
import type { SkinId } from '@/lib/skins';

export interface BoardProps {
    size?: 8 | 10;
    pieces: Piece[];
    centerZone?: Coord[];
    highlighted?: Coord[];
    selected?: Coord | null;
    lastMove?: Coord[] | null;
    cellSize?: number;
    skinForPlayer?: Partial<Record<Player, SkinId>>;
    onSquareClick?: (c: Coord) => void;
}

export function Board({
                          size = 10, pieces, centerZone = [], highlighted = [], selected = null,
                          lastMove = null, cellSize, skinForPlayer = {}, onSquareClick,
                      }: BoardProps) {
    const cs = cellSize ?? (size === 10 ? 33 : 41);
    const total = size * cs;

    const zoneBounds = centerZone.length > 0 ? (() => {
        const rs = centerZone.map(p => p[0]); const cs2 = centerZone.map(p => p[1]);
        return {
            top: Math.min(...rs) * cs, left: Math.min(...cs2) * cs,
            height: (Math.max(...rs) - Math.min(...rs) + 1) * cs,
            width: (Math.max(...cs2) - Math.min(...cs2) + 1) * cs,
        };
    })() : null;

    return (
        <div
            className="relative rounded-md overflow-hidden bg-hill-surface"
            style={{
                width: total, height: total,
                boxShadow: '0 0 0 1px #2A2A2A, 0 20px 40px rgba(0,0,0,0.5), 0 0 0 6px #141414',
            }}
        >
            <div className="grid" style={{ gridTemplateColumns: `repeat(${size}, ${cs}px)`, gridTemplateRows: `repeat(${size}, ${cs}px)` }}>
                {Array.from({ length: size * size }).map((_, i) => {
                    const r = Math.floor(i / size), c = i % size;
                    const dark = (r + c) % 2 === 1;
                    return (
                        <div
                            key={i}
                            onClick={onSquareClick ? () => onSquareClick([r, c]) : undefined}
                            className="relative"
                            style={{ background: dark ? '#1A1A1A' : '#262626' }}
                        />
                    );
                })}
            </div>

            {zoneBounds && (
                <div
                    className="absolute rounded-sm pointer-events-none animate-hill-glow"
                    style={{
                        top: zoneBounds.top, left: zoneBounds.left, width: zoneBounds.width, height: zoneBounds.height,
                        border: '1.5px solid #BFFF00',
                        background: 'linear-gradient(135deg, rgba(191,255,0,0.06), rgba(191,255,0,0.02))',
                    }}
                >
                    <div className="absolute top-[3px] left-[5px] font-mono text-[8px] font-bold text-hill-accent tracking-[0.12em] opacity-90">HILL</div>
                </div>
            )}

            {highlighted.map(([r, c], i) => (
                <div key={`h${i}`} className="absolute rounded-full bg-hill-accent pointer-events-none"
                     style={{
                         top: r * cs + cs * 0.35, left: c * cs + cs * 0.35, width: cs * 0.3, height: cs * 0.3,
                         opacity: 0.6, boxShadow: '0 0 8px #BFFF00',
                     }} />
            ))}

            {selected && (
                <div className="absolute pointer-events-none"
                     style={{ top: selected[0] * cs, left: selected[1] * cs, width: cs, height: cs, boxShadow: 'inset 0 0 0 2px #BFFF00' }} />
            )}

            {lastMove?.map(([r, c], i) => (
                <div key={`l${i}`} className="absolute pointer-events-none"
                     style={{ top: r * cs, left: c * cs, width: cs, height: cs, background: 'rgba(191,255,0,0.08)' }} />
            ))}

            {pieces.map((p, i) => (
                <div
                    key={i}
                    className="absolute transition-[top,left] duration-200 ease-out"
                    style={{
                        top: p.pos[0] * cs + (cs - cs * 0.7) / 2,
                        left: p.pos[1] * cs + (cs - cs * 0.7) / 2,
                        width: cs * 0.7, height: cs * 0.7,
                    }}
                >
                    <PieceShape
                        player={p.player}
                        size={cs * 0.7}
                        isKing={p.kind === 'king'}
                        dimmed={p.dimmed}
                        skin={p.skin ?? skinForPlayer[p.player] ?? 'bronze'}
                    />
                </div>
            ))}
        </div>
    );
}