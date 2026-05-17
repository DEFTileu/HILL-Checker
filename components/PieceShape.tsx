// components/PieceShape.tsx
'use client';
import { useId } from 'react';
import type { PlayerNum } from '@/lib/tokens';
import type { SkinId } from '@/lib/skins';
import { HILL } from '@/lib/tokens';

interface Props {
  player: PlayerNum;
  size?: number;
  isKing?: boolean;
  dimmed?: boolean;
  skin?: SkinId;
  /** When true, applies hover:scale-105 so the player can feel their own piece is interactive. */
  interactive?: boolean;
  /**
   * True when this piece is rendered on a board an ancestor rotated 180°
   * at lg+ (hot-seat desktop active-player view). The king/champion ✦
   * marker counter-rotates by the same lg:rotate-180 so crowns stay
   * upright. No effect on mobile (board isn't rotated there).
   */
  boardRotated180?: boolean;
}

/**
 * Player → shape mapping (NEVER changes — colorblind-safe):
 *   P1 = circle, P2 = square, P3 = triangle, P4 = hexagon
 *
 * Skins overlay finishes on top of the base shape/color but never replace them.
 */
export function PieceShape({
  player, size = 28, isKing = false, dimmed = false,
  skin = 'bronze', interactive = false, boardRotated180 = false,
}: Props) {
  // Counter-spin the crown so it stays upright when the board is flipped
  // 180° at lg+. lg-only → mobile (unrotated board) is unaffected.
  const crownCounter = boardRotated180 ? 'lg:rotate-180' : '';
  const fill = [HILL.p1, HILL.p2, HILL.p3, HILL.p4][player - 1];
  const stroke = player === 2 ? '#3a3a3a' : 'rgba(0,0,0,0.35)';
  const innerShine = player === 2 ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.25)';
  const s = size;
  const half = s / 2;
  const uid = useId().replace(/:/g, '');

  const buildShape = (props: React.SVGProps<SVGElement>) => {
    if (player === 1) return <circle key="shape" cx={half} cy={half} r={half - 1.5} {...(props as React.SVGProps<SVGCircleElement>)} />;
    if (player === 2) return <rect key="shape" x={2} y={2} width={s - 4} height={s - 4} rx={s * 0.18} {...(props as React.SVGProps<SVGRectElement>)} />;
    if (player === 3) {
      const pad = 2;
      const pts = `${half},${pad + 1} ${s - pad},${s - pad - 1} ${pad},${s - pad - 1}`;
      return <polygon key="shape" points={pts} strokeLinejoin="round" {...(props as React.SVGProps<SVGPolygonElement>)} />;
    }
    const r = half - 1.5;
    const pts: string[] = [];
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 2;
      pts.push(`${half + r * Math.cos(a)},${half + r * Math.sin(a)}`);
    }
    return <polygon key="shape" points={pts.join(' ')} strokeLinejoin="round" {...(props as React.SVGProps<SVGPolygonElement>)} />;
  };

  const isChampion = skin === 'champion';
  const isGold = skin === 'gold' || isChampion;
  const isMaster = skin === 'master';
  const isSilver = skin === 'silver';

  // Premium (purchased) skins. These layer animated finishes on top of the
  // base shape — never replacing it — same contract as the tier finishes.
  const isNeon = skin === 'neon_glow';
  const isGalaxy = skin === 'galaxy';
  const isRoyal = skin === 'royal_gold';

  const glowColor = isChampion ? HILL.accent : (skin === 'gold' ? '#FFD700' : isMaster ? '#B380E0' : null);
  const baseShadow = 'drop-shadow(0 1px 1px rgba(0,0,0,0.35))';
  const glow = glowColor
    ? `drop-shadow(0 0 ${Math.max(1.5, s * 0.14)}px ${glowColor}) drop-shadow(0 0 ${Math.max(3, s * 0.28)}px ${glowColor}99) ${baseShadow}`
    : baseShadow;

  return (
    <div
      className={[
        'relative inline-block transition-transform',
        interactive ? 'lg:hover:scale-105 cursor-pointer' : '',
      ].join(' ')}
      style={{ width: s, height: s, opacity: dimmed ? 0.35 : 1, filter: dimmed ? 'grayscale(0.6)' : 'none' }}
    >
      {isNeon && (
        <span
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            inset: s * 0.12,
            borderRadius: '50%',
            zIndex: 0,
            animation: 'neon-pulse 2s ease-in-out infinite',
          }}
        />
      )}
      {isRoyal && (
        <span
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            inset: -s * 0.08,
            borderRadius: '50%',
            zIndex: 0,
            opacity: 0.55,
            filter: `blur(${Math.max(1, s * 0.06)}px)`,
            background: 'linear-gradient(135deg, #FFD700, #FF8C00, #FFD700)',
            backgroundSize: '200% 200%',
            animation: 'gold-shimmer 3s ease-in-out infinite',
          }}
        />
      )}

      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ display: 'block', position: 'relative', zIndex: 1, filter: glow, overflow: 'visible' }}>
        <defs>
          <clipPath id={`clip-${uid}`}>{buildShape({ fill: '#000' })}</clipPath>
          <linearGradient id={`silver-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.55"/>
            <stop offset="0.55" stopColor="#fff" stopOpacity="0"/>
            <stop offset="1" stopColor="#000" stopOpacity="0.35"/>
          </linearGradient>
          <radialGradient id={`gold-${uid}`} cx="50%" cy="38%" r="60%">
            <stop offset="0" stopColor="#FFF1A8" stopOpacity="0.85"/>
            <stop offset="0.5" stopColor="#FFD700" stopOpacity="0.35"/>
            <stop offset="1" stopColor="#FFD700" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id={`champ-${uid}`} cx="50%" cy="40%" r="65%">
            <stop offset="0" stopColor="#FAFFD6" stopOpacity="0.85"/>
            <stop offset="0.6" stopColor="#BFFF00" stopOpacity="0.35"/>
            <stop offset="1" stopColor="#BFFF00" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id={`galaxy-${uid}`} cx="30%" cy="30%" r="78%">
            <stop offset="0" stopColor="#8B5CF6" stopOpacity="0.92"/>
            <stop offset="0.55" stopColor="#6B46C1" stopOpacity="0.6"/>
            <stop offset="1" stopColor="#1E1B4B" stopOpacity="0.88"/>
          </radialGradient>
          <linearGradient id={`royal-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFE680"/>
            <stop offset="0.5" stopColor="#FF8C00"/>
            <stop offset="1" stopColor="#FFD700"/>
          </linearGradient>
        </defs>

        {buildShape({ fill, stroke, strokeWidth: 1.5 })}

        {isSilver && (
          <g clipPath={`url(#clip-${uid})`}>
            <rect x={0} y={0} width={s} height={s} fill={`url(#silver-${uid})`} />
          </g>
        )}

        {isGold && (
          <g clipPath={`url(#clip-${uid})`}>
            <rect x={0} y={0} width={s} height={s} fill={`url(#${isChampion ? 'champ' : 'gold'}-${uid})`} />
          </g>
        )}

        {isMaster && (
          <g clipPath={`url(#clip-${uid})`}>
            <polygon
              points={`${half},${half - s * 0.22} ${half + s * 0.18},${half} ${half},${half + s * 0.22} ${half - s * 0.18},${half}`}
              fill="rgba(255,255,255,0.32)"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth={Math.max(0.4, s * 0.018)}
            />
            <line x1={half} y1={half - s * 0.22} x2={half} y2={2}    stroke="rgba(255,255,255,0.25)" strokeWidth={Math.max(0.4, s * 0.022)} />
            <line x1={half + s * 0.18} y1={half} x2={s - 2} y2={half} stroke="rgba(0,0,0,0.25)"       strokeWidth={Math.max(0.4, s * 0.022)} />
            <line x1={half} y1={half + s * 0.22} x2={half} y2={s - 2} stroke="rgba(0,0,0,0.18)"       strokeWidth={Math.max(0.4, s * 0.022)} />
            <line x1={half - s * 0.18} y1={half} x2={2} y2={half}     stroke="rgba(255,255,255,0.2)"  strokeWidth={Math.max(0.4, s * 0.022)} />
          </g>
        )}

        {isGalaxy && (
          <g clipPath={`url(#clip-${uid})`}>
            <rect x={0} y={0} width={s} height={s} fill={`url(#galaxy-${uid})`} />
            {s >= 14 && (
              <g
                style={{
                  transformOrigin: `${half}px ${half}px`,
                  animation: 'galaxy-rotate 8s linear infinite',
                }}
              >
                {[[0.30, 0.28], [0.70, 0.33], [0.60, 0.70], [0.31, 0.66], [0.78, 0.56]].map(
                  ([fx, fy], i) => (
                    <circle
                      key={i}
                      cx={s * fx}
                      cy={s * fy}
                      r={Math.max(0.6, s * (i % 2 ? 0.03 : 0.045))}
                      fill="#fff"
                      opacity={0.85}
                    />
                  ),
                )}
              </g>
            )}
          </g>
        )}

        {isRoyal && (
          <g clipPath={`url(#clip-${uid})`}>
            <rect x={0} y={0} width={s} height={s} fill={`url(#royal-${uid})`} opacity={0.72} />
          </g>
        )}

        <g clipPath={isMaster ? `url(#clip-${uid})` : undefined}>
          <ellipse cx={half} cy={half * 0.55} rx={half * 0.55} ry={half * 0.22} fill={innerShine} />
        </g>

        {isMaster && s >= 14 && (
          <g transform={`translate(${s * 0.74}, ${s * 0.24})`} style={{ pointerEvents: 'none' }}>
            <circle r={Math.max(0.8, s * 0.045)} fill="#fff" />
            <line x1="0" y1={-s * 0.11} x2="0" y2={s * 0.11} stroke="#fff" strokeWidth={Math.max(0.5, s * 0.022)} strokeLinecap="round" />
            <line x1={-s * 0.11} y1="0" x2={s * 0.11} y2="0" stroke="#fff" strokeWidth={Math.max(0.5, s * 0.022)} strokeLinecap="round" />
          </g>
        )}
      </svg>

      {isChampion && (
        <div
          className={`absolute font-black pointer-events-none flex items-center justify-center text-[var(--hill-accent)] ${crownCounter}`}
          style={{
            top: -s * 0.08, right: -s * 0.1,
            width: s * 0.5, height: s * 0.5,
            fontSize: s * 0.34, lineHeight: 1,
            textShadow: '0 0 6px rgba(191,255,0,0.85)',
          }}
        >✦</div>
      )}

      {isKing && (
        <div
          className={`absolute left-1/2 -translate-x-1/2 font-black pointer-events-none text-[var(--hill-accent)] ${crownCounter}`}
          style={{
            top: -s * 0.22,
            fontSize: s * 0.42, lineHeight: 1,
            textShadow: '0 0 6px rgba(191,255,0,0.7)',
          }}
        >✦</div>
      )}
    </div>
  );
}
