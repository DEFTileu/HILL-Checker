'use client';
import { useId } from 'react';
import type { Player } from '@/lib/tokens';
import type { SkinId } from '@/lib/skins';

export interface PieceShapeProps {
    player: Player;
    size?: number;
    isKing?: boolean;
    dimmed?: boolean;
    skin?: SkinId;
}

const PLAYER_FILL: Record<Player, string> = { 1: '#FFFFFF', 2: '#1A1A1A', 3: '#FF2D87', 4: '#00D9FF' };

export function PieceShape({ player, size = 28, isKing = false, dimmed = false, skin = 'bronze' }: PieceShapeProps) {
    const fill = PLAYER_FILL[player];
    const stroke = player === 2 ? '#3a3a3a' : 'rgba(0,0,0,0.35)';
    const innerShine = player === 2 ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.25)';
    const s = size, half = s / 2;
    const uid = useId().replace(/:/g, '_');

    const buildShape = (props: React.SVGProps<SVGElement>) => {
        if (player === 1) return <circle key="s" cx={half} cy={half} r={half - 1.5} {...(props as any)} />;
        if (player === 2) return <rect key="s" x={2} y={2} width={s - 4} height={s - 4} rx={s * 0.18} {...(props as any)} />;
        if (player === 3) return <polygon key="s" points={`${half},${3} ${s - 2},${s - 3} ${2},${s - 3}`} strokeLinejoin="round" {...(props as any)} />;
        const r = half - 1.5;
        const pts = Array.from({ length: 6 }, (_, i) => {
            const a = (Math.PI / 3) * i - Math.PI / 2;
            return `${half + r * Math.cos(a)},${half + r * Math.sin(a)}`;
        }).join(' ');
        return <polygon key="s" points={pts} strokeLinejoin="round" {...(props as any)} />;
    };

    const isChampion = skin === 'champion';
    const isGold = skin === 'gold' || isChampion;
    const isMaster = skin === 'master';
    const isSilver = skin === 'silver';

    const glowColor =
        isChampion ? '#BFFF00' : (skin === 'gold' ? '#FFD700' : isMaster ? '#B380E0' : null);
    const filter = glowColor
        ? `drop-shadow(0 0 ${Math.max(1.5, s * 0.14)}px ${glowColor}) drop-shadow(0 0 ${Math.max(3, s * 0.28)}px ${glowColor}99) drop-shadow(0 1px 1px rgba(0,0,0,0.35))`
        : 'drop-shadow(0 1px 1px rgba(0,0,0,0.35))';

    return (
        <div className={`relative ${dimmed ? 'opacity-40 grayscale' : ''}`} style={{ width: s, height: s }}>
            <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ filter, overflow: 'visible' }} className="block">
                <defs>
                    <clipPath id={`clip-${uid}`}>{buildShape({ fill: '#000' })}</clipPath>
                    <linearGradient id={`silver-${uid}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
                        <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
                        <stop offset="1" stopColor="#000" stopOpacity="0.35" />
                    </linearGradient>
                    <radialGradient id={`gold-${uid}`} cx="50%" cy="38%" r="60%">
                        <stop offset="0" stopColor="#FFF1A8" stopOpacity="0.85" />
                        <stop offset="0.5" stopColor="#FFD700" stopOpacity="0.35" />
                        <stop offset="1" stopColor="#FFD700" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id={`champ-${uid}`} cx="50%" cy="40%" r="65%">
                        <stop offset="0" stopColor="#FAFFD6" stopOpacity="0.85" />
                        <stop offset="0.6" stopColor="#BFFF00" stopOpacity="0.35" />
                        <stop offset="1" stopColor="#BFFF00" stopOpacity="0" />
                    </radialGradient>
                </defs>

                {buildShape({ fill, stroke, strokeWidth: 1.5 })}

                {isSilver && <g clipPath={`url(#clip-${uid})`}><rect width={s} height={s} fill={`url(#silver-${uid})`} /></g>}
                {(skin === 'gold' || isChampion) && (
                    <g clipPath={`url(#clip-${uid})`}>
                        <rect width={s} height={s} fill={`url(#${isChampion ? 'champ' : 'gold'}-${uid})`} />
                    </g>
                )}

                {isMaster && (
                    <g clipPath={`url(#clip-${uid})`}>
                        <polygon
                            points={`${half},${half - s * 0.22} ${half + s * 0.18},${half} ${half},${half + s * 0.22} ${half - s * 0.18},${half}`}
                            fill="rgba(255,255,255,0.32)" stroke="rgba(255,255,255,0.5)" strokeWidth={Math.max(0.4, s * 0.018)}
                        />
                        <line x1={half} y1={half - s * 0.22} x2={half} y2={2}    stroke="rgba(255,255,255,0.25)" strokeWidth={Math.max(0.4, s * 0.022)} />
                        <line x1={half + s * 0.18} y1={half} x2={s - 2} y2={half} stroke="rgba(0,0,0,0.25)"       strokeWidth={Math.max(0.4, s * 0.022)} />
                        <line x1={half} y1={half + s * 0.22} x2={half} y2={s - 2} stroke="rgba(0,0,0,0.18)"       strokeWidth={Math.max(0.4, s * 0.022)} />
                        <line x1={half - s * 0.18} y1={half} x2={2} y2={half}     stroke="rgba(255,255,255,0.2)"  strokeWidth={Math.max(0.4, s * 0.022)} />
                    </g>
                )}

                <g clipPath={isMaster ? `url(#clip-${uid})` : undefined}>
                    <ellipse cx={half} cy={half * 0.55} rx={half * 0.55} ry={half * 0.22} fill={innerShine} />
                </g>

                {isMaster && s >= 14 && (
                    <g transform={`translate(${s * 0.74}, ${s * 0.24})`}>
                        <circle r={Math.max(0.8, s * 0.045)} fill="#fff" />
                        <line x1="0" y1={-s * 0.11} x2="0" y2={s * 0.11} stroke="#fff" strokeWidth={Math.max(0.5, s * 0.022)} strokeLinecap="round" />
                        <line x1={-s * 0.11} y1="0" x2={s * 0.11} y2="0" stroke="#fff" strokeWidth={Math.max(0.5, s * 0.022)} strokeLinecap="round" />
                    </g>
                )}
            </svg>

            {isChampion && (
                <div className="absolute font-black leading-none text-hill-accent pointer-events-none"
                     style={{ top: -s * 0.08, right: -s * 0.1, fontSize: s * 0.34, textShadow: '0 0 6px rgba(191,255,0,0.85)' }}>✦</div>
            )}
            {isKing && (
                <div className="absolute left-1/2 -translate-x-1/2 font-black leading-none text-hill-accent pointer-events-none"
                     style={{ top: -s * 0.22, fontSize: s * 0.42, textShadow: '0 0 6px rgba(191,255,0,0.7)' }}>✦</div>
            )}
        </div>
    );
}