Mobile-first throughout; lg: is where desktop kicks in. Tokens live in lib/tokens.ts so Tailwind classes can use arbitrary values like bg-[var(--hill-accent)] (cleaner than hex everywhere).

// lib/tokens.ts
// HILL design tokens — single source of truth for colors + type stacks.
// Tailwind references these via arbitrary values, e.g. text-[var(--hill-accent)].
// CSS variables are injected globally in app/layout.tsx.

export const HILL = {
bg: '#0A0A0A',
surface: '#141414',
surface2: '#1A1A1A',
border: '#1F1F1F',
borderHi: '#2A2A2A',
text: '#FAFAFA',
muted: '#808080',
dim: '#525252',
accent: '#BFFF00',
accentDim: 'rgba(191,255,0,0.12)',
danger: '#FF3B30',
p1: '#FFFFFF',
p2: '#1A1A1A',
p3: '#FF2D87',
p4: '#00D9FF',
bronze: '#CD7F32',
silver: '#C0C0C0',
gold: '#FFD700',
master: '#9B59B6',
champion: '#BFFF00',
} as const;

export const FONT = {
sans: 'var(--font-inter)',
mono: 'var(--font-jetbrains-mono)',
} as const;

export type PlayerNum = 1 | 2 | 3 | 4;
export const PLAYER_COLORS: Record<PlayerNum, string> = {
1: HILL.p1,
2: HILL.p2,
3: HILL.p3,
4: HILL.p4,
};
// lib/skins.ts
import { HILL } from './tokens';

export type SkinId = 'bronze' | 'silver' | 'gold' | 'master' | 'champion';
export type TierId = 'Bronze' | 'Silver' | 'Gold' | 'Master' | 'Champion';

export interface SkinDef {
name: string;
tier: TierId;
color: string;
tag: string;
}

export const SKINS: Record<SkinId, SkinDef> = {
bronze:   { name: 'Bronze',   tier: 'Bronze',   color: HILL.bronze,   tag: 'DEFAULT' },
silver:   { name: 'Silver',   tier: 'Silver',   color: HILL.silver,   tag: 'GRADIENT' },
gold:     { name: 'Gold',     tier: 'Gold',     color: HILL.gold,     tag: 'HALO' },
master:   { name: 'Master',   tier: 'Master',   color: HILL.master,   tag: 'FACETS' },
champion: { name: 'Champion', tier: 'Champion', color: HILL.champion, tag: 'CROWN' },
};

export const TIER_RANK: Record<TierId, number> = {
Bronze: 0, Silver: 1, Gold: 2, Master: 3, Champion: 4,
};

export function skinUnlocked(skinId: SkinId, userTier: TierId): boolean {
return TIER_RANK[SKINS[skinId].tier] <= TIER_RANK[userTier];
}

export const UNLOCK_WINS: Record<TierId, number> = {
Bronze: 0, Silver: 5, Gold: 25, Master: 75, Champion: 150,
};
// lib/tiers.ts
import { HILL } from './tokens';
import type { TierId } from './skins';

export interface TierMeta {
color: string;
icon: string;
short: string;
}

export const TIER_META: Record<TierId, TierMeta> = {
Bronze:   { color: HILL.bronze,   icon: '🥉', short: 'Bronze' },
Silver:   { color: HILL.silver,   icon: '🥈', short: 'Silver' },
Gold:     { color: HILL.gold,     icon: '🥇', short: 'Gold' },
Master:   { color: HILL.master,   icon: '◆',  short: 'Master' },
Champion: { color: HILL.champion, icon: '👑', short: 'Champion' },
};
// lib/pieces.ts
import type { PlayerNum } from './tokens';

export type PieceKind = 'pawn' | 'king';

export interface Piece {
player: PlayerNum;
kind: PieceKind;
pos: [number, number];
dimmed?: boolean;
}

/** Mid-game 10×10 Hill 4P position used for previews + non-interactive demos. */
export function makeHillPieces(): Piece[] {
const ps: Piece[] = [];
([[0,1],[0,3],[1,0],[1,2],[2,1],[3,4]] as [number, number][]).forEach(p =>
ps.push({ player: 1, kind: 'pawn', pos: p })
);
ps.push({ player: 1, kind: 'king', pos: [4, 4] });

([[0,6],[0,8],[1,7],[1,9],[2,8],[3,7]] as [number, number][]).forEach(p =>
ps.push({ player: 2, kind: 'pawn', pos: p })
);
ps.push({ player: 2, kind: 'pawn', pos: [4, 5] });

([[9,6],[9,8],[8,7]] as [number, number][]).forEach(p =>
ps.push({ player: 3, kind: 'pawn', pos: p, dimmed: true })
);

([[9,1],[9,3],[8,0],[8,2],[7,1],[6,4]] as [number, number][]).forEach(p =>
ps.push({ player: 4, kind: 'pawn', pos: p })
);
ps.push({ player: 4, kind: 'king', pos: [5, 5] });
return ps;
}

export const HILL_CENTER_ZONE: [number, number][] = [[4,4],[4,5],[5,4],[5,5]];
// hooks/useMediaQuery.ts
'use client';
import { useEffect, useState } from 'react';

/**
* Tailwind-aligned breakpoint hook. Returns true once viewport matches the query.
* Server-renders as false to avoid hydration mismatch — components should
* prefer Tailwind responsive prefixes; only reach for this hook when you need
* runtime branching (e.g. picking a different React subtree per breakpoint).
  */
  export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
  if (typeof window === 'undefined') return;
  const mql = window.matchMedia(query);
  const onChange = () => setMatches(mql.matches);
  onChange();
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
  }, [query]);
  return matches;
  }

export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)');
// components/GoogleG.tsx
interface Props { size?: number; className?: string; }
export function GoogleG({ size = 18, className }: Props) {
return (
<svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
<path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
<path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.6 8.4 6.3 14.7z"/>
<path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.3C29.2 35 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
<path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4 5.6l6.2 5.3c-.4.3 6.5-4.7 6.5-15 0-1.3-.1-2.6-.4-3.9z"/>
</svg>
);
}
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
}

/**
* Player → shape mapping (NEVER changes — colorblind-safe):
*   P1 = circle, P2 = square, P3 = triangle, P4 = hexagon
*
* Skins overlay finishes on top of the base shape/color but never replace them.
  */
  export function PieceShape({
  player, size = 28, isKing = false, dimmed = false,
  skin = 'bronze', interactive = false,
  }: Props) {
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
<svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ display: 'block', filter: glow, overflow: 'visible' }}>
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
          className="absolute font-black pointer-events-none flex items-center justify-center text-[var(--hill-accent)]"
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
          className="absolute left-1/2 -translate-x-1/2 font-black pointer-events-none text-[var(--hill-accent)]"
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
// components/Square.tsx
'use client';
interface Props {
dark: boolean;
isLegalTarget?: boolean;
isLastMove?: boolean;
onClick?: () => void;
}

/**
* Single board cell. Dark squares are interactive; legal-target dark squares
* cursor-pointer + lime tint on hover (desktop only).
  */
  export function Square({ dark, isLegalTarget, isLastMove, onClick }: Props) {
  const base = dark ? 'bg-[#1A1A1A]' : 'bg-[#262626]';
  const lastMove = isLastMove ? 'bg-[rgba(191,255,0,0.08)]' : '';
  const interactive = dark && isLegalTarget
  ? 'cursor-pointer lg:hover:bg-[rgba(191,255,0,0.14)] transition-colors'
  : '';
  return (
   <div
     onClick={onClick}
     className={['relative w-full h-full', base, lastMove, interactive].join(' ')}
   />
);
}
// components/Board.tsx
'use client';
import { Square } from './Square';
import { PieceShape } from './PieceShape';
import { HILL, type PlayerNum } from '@/lib/tokens';
import type { Piece } from '@/lib/pieces';
import type { SkinId } from '@/lib/skins';

interface Props {
size?: 8 | 10;
pieces?: Piece[];
centerZone?: [number, number][];
highlighted?: [number, number][];
selected?: [number, number] | null;
lastMove?: [number, number][] | null;
cellSize?: number | null;
skinForPlayer?: Partial<Record<PlayerNum, SkinId>>;
/** When set, own pieces get hover:scale and cursor-pointer. */
isYourTurn?: boolean;
ownPlayer?: PlayerNum;
onSquareClick?: (r: number, c: number) => void;
}

export function Board({
size = 8, pieces = [], centerZone = [], highlighted = [],
selected = null, lastMove = null, cellSize = null,
skinForPlayer = {}, isYourTurn = false, ownPlayer,
onSquareClick,
}: Props) {
const cs = cellSize ?? (size === 10 ? 33 : 41);
const total = size * cs;
const isHi = (r: number, c: number) => highlighted.some(([a, b]) => a === r && b === c);
const isLast = (r: number, c: number) => lastMove?.some(([a, b]) => a === r && b === c) ?? false;

return (
<div
className="relative bg-[var(--hill-surface)] rounded-md overflow-hidden"
style={{
width: total, height: total,
boxShadow: `0 0 0 1px ${HILL.borderHi}, 0 20px 40px rgba(0,0,0,0.5), 0 0 0 6px ${HILL.surface}`,
}}
>
<div
className="grid"
style={{ gridTemplateColumns: `repeat(${size}, ${cs}px)`, gridTemplateRows: `repeat(${size}, ${cs}px)` }}
>
{Array.from({ length: size * size }).map((_, i) => {
const r = Math.floor(i / size);
const c = i % size;
const dark = (r + c) % 2 === 1;
return (
<Square
key={i}
dark={dark}
isLegalTarget={isHi(r, c)}
isLastMove={isLast(r, c)}
onClick={onSquareClick ? () => onSquareClick(r, c) : undefined}
/>
);
})}
</div>

      {centerZone.length > 0 && (() => {
        const rs = centerZone.map(p => p[0]);
        const csx = centerZone.map(p => p[1]);
        const top = Math.min(...rs) * cs;
        const left = Math.min(...csx) * cs;
        const h = (Math.max(...rs) - Math.min(...rs) + 1) * cs;
        const w = (Math.max(...csx) - Math.min(...csx) + 1) * cs;
        return (
          <div
            className="absolute pointer-events-none rounded-sm border-[1.5px] border-[var(--hill-accent)] animate-[hill-glow_2.4s_ease-in-out_infinite]"
            style={{
              top, left, width: w, height: h,
              background: 'linear-gradient(135deg, rgba(191,255,0,0.06), rgba(191,255,0,0.02))',
            }}
          >
            <div className="absolute top-[3px] left-[5px] font-mono text-[8px] font-bold text-[var(--hill-accent)] tracking-[0.12em] opacity-90">
              HILL
            </div>
          </div>
        );
      })()}

      {highlighted.map(([r, c], i) => (
        <div
          key={`h${i}`}
          className="absolute rounded-full pointer-events-none bg-[var(--hill-accent)]"
          style={{
            top: r * cs + cs * 0.35, left: c * cs + cs * 0.35,
            width: cs * 0.3, height: cs * 0.3,
            opacity: 0.6,
            boxShadow: `0 0 8px ${HILL.accent}`,
          }}
        />
      ))}

      {selected && (
        <div
          className="absolute pointer-events-none"
          style={{
            top: selected[0] * cs, left: selected[1] * cs,
            width: cs, height: cs,
            boxShadow: `inset 0 0 0 2px ${HILL.accent}`,
          }}
        />
      )}

      {pieces.map((p, i) => {
        const isOwn = ownPlayer !== undefined && p.player === ownPlayer;
        return (
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
              interactive={isOwn && isYourTurn}
            />
          </div>
        );
      })}
    </div>
);
}

// Note: pieces support an optional `.skin` per-piece override; widen the type
// in lib/pieces.ts if you want it strictly typed: { skin?: SkinId } & Piece.
declare module '@/lib/pieces' {
interface Piece { skin?: SkinId; }
}
// components/ArenaBadge.tsx
import type { TierId } from '@/lib/skins';
import { TIER_META } from '@/lib/tiers';

interface Props {
tier?: TierId;
size?: 'sm' | 'md';
label?: boolean;
}

export function ArenaBadge({ tier = 'Bronze', size = 'sm', label = true }: Props) {
const m = TIER_META[tier];
const sm = size === 'sm';
return (
<span
className={[
'inline-flex items-center font-semibold uppercase whitespace-nowrap leading-none rounded-full',
'bg-white/5 border',
sm ? 'gap-1 py-0.5 pr-[7px] pl-[5px] text-[10px]' : 'gap-1.5 py-1 pr-2.5 pl-2 text-xs',
].join(' ')}
style={{ borderColor: `${m.color}40`, color: m.color, letterSpacing: '0.04em' }}
>
<span style={{ fontSize: sm ? 10 : 13 }}>{m.icon}</span>
{label && <span>{m.short}</span>}
</span>
);
}
// components/CTAButton.tsx
'use client';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
full?: boolean;
children: ReactNode;
}

/**
* Mobile + desktop button. Hover lift + lime focus ring only on lg+ (keyboard
* users on desktop). Mobile keeps the existing active:scale-98 pattern.
  */
  export function CTAButton({
  variant = 'primary',
  full = true,
  children,
  className = '',
  ...rest
  }: Props) {
  const base =
  'inline-flex items-center justify-center gap-2 rounded-xl font-bold tracking-[-0.01em] ' +
  'transition will-change-transform active:scale-[0.98] ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hill-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--hill-bg)] ' +
  'disabled:opacity-40 disabled:cursor-not-allowed';

const sizing = 'h-[54px] px-6 text-[17px]';

const variantCls = {
primary:
'bg-[var(--hill-accent)] text-[var(--hill-bg)] border-0 ' +
'lg:hover:enabled:brightness-110 lg:hover:enabled:-translate-y-0.5 lg:hover:enabled:shadow-[0_8px_24px_rgba(191,255,0,0.25)]',
secondary:
'bg-transparent text-[var(--hill-text)] border-[1.5px] border-[var(--hill-borderHi)] ' +
'lg:hover:enabled:border-[var(--hill-accent)] lg:hover:enabled:text-white lg:hover:enabled:-translate-y-0.5',
danger:
'bg-transparent text-[var(--hill-danger)] border-[1.5px] border-[rgba(255,59,48,0.4)] ' +
'lg:hover:enabled:border-[var(--hill-danger)] lg:hover:enabled:-translate-y-0.5',
ghost:
'bg-transparent text-[var(--hill-text)] border-[1.5px] border-[var(--hill-borderHi)]',
}[variant];

return (
<button
{...rest}
className={[base, sizing, variantCls, full ? 'w-full' : '', className].join(' ')}
>
{children}
</button>
);
}
// components/BottomNav.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type TabId = 'hill' | 'top' | 'me';

const TABS: { id: TabId; href: string; label: string; icon: React.ReactNode }[] = [
{ id: 'hill', href: '/',
label: 'HILL',
icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 19l5-8 4 5 3-4 6 7"/><path d="M3 19h18"/></svg>,
},
{ id: 'top', href: '/leaderboard',
label: 'TOP',
icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 4h10v4a5 5 0 01-10 0V4z"/><path d="M7 4H4v2a3 3 0 003 3M17 4h3v2a3 3 0 01-3 3"/><path d="M9 13h6l-1 4h-4l-1-4zM8 21h8"/></svg>,
},
{ id: 'me', href: '/profile',
label: 'ME',
icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6"/></svg>,
},
];

function activeFromPath(pathname: string): TabId {
if (pathname.startsWith('/leaderboard')) return 'top';
if (pathname.startsWith('/profile')) return 'me';
return 'hill';
}

/**
* Mobile tab bar — `lg:hidden` so it disappears in favor of TopNav on desktop.
  */
  export function BottomNav() {
  const pathname = usePathname();
  const active = activeFromPath(pathname ?? '/');

return (
<nav
className="lg:hidden fixed left-0 right-0 bottom-0 z-50 flex pt-2 pb-7 bg-[var(--hill-surface)] border-t border-[var(--hill-border)]"
aria-label="Primary"
>
{TABS.map(t => {
const isActive = active === t.id;
return (
<Link
key={t.id}
href={t.href}
className={[
'flex-1 relative flex flex-col items-center gap-1 pt-1.5 pb-1 min-h-[44px]',
isActive ? 'text-[var(--hill-accent)]' : 'text-[var(--hill-muted)]',
].join(' ')}
>
{isActive && (
<span
className="absolute -top-2 w-7 h-[3px] rounded-sm bg-[var(--hill-accent)]"
style={{ boxShadow: '0 0 8px var(--hill-accent)' }}
/>
)}
<span style={{ filter: isActive ? 'drop-shadow(0 0 4px rgba(191,255,0,0.4))' : undefined }}>
{t.icon}
</span>
<span className="text-[10px] font-extrabold tracking-[0.18em]">{t.label}</span>
</Link>
);
})}
</nav>
);
}
// components/TopNav.tsx  (NEW — desktop-only header)
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GoogleG } from './GoogleG';
import { WelcomeChip } from './WelcomeChip';
import type { SkinId, TierId } from '@/lib/skins';

interface UserSummary {
name: string;
tier: TierId;
skin: SkinId;
}

interface Props {
user?: UserSummary | null;
onSignIn?: () => void;
}

const TABS = [
{ id: 'hill', href: '/',            label: 'HILL' },
{ id: 'top',  href: '/leaderboard', label: 'TOP'  },
{ id: 'me',   href: '/profile',     label: 'ME'   },
] as const;

function activeFromPath(pathname: string): typeof TABS[number]['id'] {
if (pathname.startsWith('/leaderboard')) return 'top';
if (pathname.startsWith('/profile')) return 'me';
return 'hill';
}

/**
* Desktop sticky header. Hidden on mobile (`hidden lg:flex`).
* Mount above page content in app/layout.tsx; coexists with BottomNav since
* BottomNav is `lg:hidden` and TopNav is `hidden lg:flex`.
  */
  export function TopNav({ user, onSignIn }: Props) {
  const pathname = usePathname() ?? '/';
  const active = activeFromPath(pathname);

return (
<header
className="hidden lg:flex sticky top-0 z-30 h-16 items-center backdrop-blur-xl bg-[rgba(10,10,10,0.85)] border-b border-[var(--hill-border)]"
>
<div className="w-full max-w-[1280px] mx-auto px-8 flex items-center justify-between gap-8">
<Link href="/" className="inline-flex items-baseline gap-2 no-underline">
<span className="font-extrabold tracking-[-0.04em] text-[28px] leading-none text-[var(--hill-text)]">
HILL
</span>
<span
className="w-[18px] h-[3px] bg-[var(--hill-accent)] self-center"
style={{ boxShadow: '0 0 8px var(--hill-accent)' }}
/>
</Link>

        <nav className="flex items-center gap-10" aria-label="Primary">
          {TABS.map(t => {
            const isActive = active === t.id;
            return (
              <Link
                key={t.id}
                href={t.href}
                className={[
                  'relative py-1 px-0.5 font-extrabold text-[12px] tracking-[0.22em] transition-colors',
                  isActive ? 'text-[var(--hill-text)]' : 'text-[var(--hill-muted)] hover:text-[var(--hill-text)]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hill-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--hill-bg)] rounded-sm',
                ].join(' ')}
              >
                {t.label}
                {isActive && (
                  <span
                    className="absolute left-1/2 -translate-x-1/2 -bottom-[19px] w-[34px] h-[3px] rounded-sm bg-[var(--hill-accent)]"
                    style={{ boxShadow: '0 0 10px var(--hill-accent)' }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="min-w-[240px] flex items-center justify-end gap-3">
          {user ? (
            <WelcomeChip user={user} />
          ) : (
            <button
              onClick={onSignIn}
              className="h-10 px-4 rounded-[10px] bg-transparent border-[1.5px] border-[var(--hill-borderHi)] text-[var(--hill-text)] text-[13px] font-bold inline-flex items-center gap-2 transition lg:hover:border-[var(--hill-accent)] lg:hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hill-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--hill-bg)]"
            >
              <GoogleG size={16}/> Sign in with Google
            </button>
          )}
        </div>
      </div>
    </header>
);
}
// components/WelcomeChip.tsx
'use client';
import { GoogleG } from './GoogleG';
import { ArenaBadge } from './ArenaBadge';
import type { SkinId, TierId } from '@/lib/skins';

interface Props {
user: { name: string; tier: TierId; skin: SkinId };
/** When true, render the chip at a slightly larger size for desktop nav. */
prominent?: boolean;
}

export function WelcomeChip({ user, prominent = false }: Props) {
return (
<div
className={[
'inline-flex items-center font-semibold rounded-full bg-[var(--hill-surface)] border border-[var(--hill-border)]',
// Mobile size (default); desktop slightly larger via lg:
'gap-2 py-[5px] pr-2.5 pl-[5px] text-xs',
'lg:gap-2.5 lg:py-1.5 lg:pr-3 lg:pl-1.5 lg:text-[13px]',
prominent ? 'lg:py-2 lg:pr-3.5' : '',
].join(' ')}
>
<div className="relative shrink-0 w-[26px] h-[26px] lg:w-[30px] lg:h-[30px] rounded-full bg-gradient-to-br from-[#3a3a3a] to-[#1a1a1a] flex items-center justify-center text-[12px] lg:text-[13px] font-extrabold text-[var(--hill-text)]">
{user.name[0]?.toUpperCase()}
<span className="absolute -bottom-0.5 -right-0.5 w-[13px] h-[13px] lg:w-[14px] lg:h-[14px] rounded-full bg-[var(--hill-bg)] p-[1.5px] flex items-center justify-center">
<GoogleG size={9}/>
</span>
</div>
<span className="text-[var(--hill-text)]">{user.name}</span>
<ArenaBadge tier={user.tier}/>
</div>
);
}
// components/TopBar.tsx
'use client';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

interface Props {
/** Show back chevron — defaults to true. Hidden on lg+ when TopNav covers nav. */
back?: boolean;
code?: string;
title?: string;
right?: ReactNode;
/** When true, hide the entire bar on desktop (TopNav takes over). */
hideOnDesktop?: boolean;
}

/**
* Mobile sticky in-flow top bar — back arrow, optional room code/title, slot for actions.
* Pass `hideOnDesktop` on pages where the global TopNav already covers chrome.
  */
  export function TopBar({ back = true, code, title, right, hideOnDesktop = true }: Props) {
  const router = useRouter();
  return (
   <div
     className={[
       'sticky top-0 z-20 flex items-center justify-between px-4 pt-3.5 pb-3 bg-[var(--hill-bg)] border-b border-[var(--hill-border)]',
       hideOnDesktop ? 'lg:hidden' : '',
     ].join(' ')}
   >
     <div className="flex items-center gap-2.5">
       {back && (
         <button
           onClick={() => router.back()}
           aria-label="Back"
           className="w-9 h-9 rounded-[10px] bg-[var(--hill-surface)] border border-[var(--hill-border)] inline-flex items-center justify-center text-[var(--hill-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hill-accent)]"
         >
           <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5"/></svg>
         </button>
       )}
       {code && (
         <div className="font-mono text-xs font-bold text-[var(--hill-muted)] tracking-[0.18em]">
           ROOM · <span className="text-[var(--hill-text)]">{code}</span>
         </div>
       )}
       {title && <div className="text-[15px] font-semibold">{title}</div>}
     </div>
     <div className="flex items-center gap-2">{right}</div>
   </div>
);
}
// components/RoomCodeDisplay.tsx
interface Props { code?: string; }

/**
* Big monospace room code. Sizes up dramatically on desktop where the lobby
* uses it as a hero element.
  */
  export function RoomCodeDisplay({ code = 'ABCD' }: Props) {
  return (
   <div className="text-center lg:text-left">
     <div className="text-[10px] font-bold text-[var(--hill-muted)] tracking-[0.24em]">
       ROOM CODE
     </div>
     <div
       className="mt-1.5 lg:mt-2 font-mono font-bold text-[var(--hill-text)] text-[56px] lg:text-[120px] xl:text-[132px] leading-none tracking-[0.08em] lg:tracking-[0.04em]"
       style={{ textShadow: '0 0 24px rgba(191,255,0,0.15)' }}
     >
       {code}
     </div>
   </div>
);
}
// components/RoundCounter.tsx
interface Props {
current: number;
max?: number | null;
mode?: 'blitz' | 'survival';
}

export function RoundCounter({ current, max, mode = 'blitz' }: Props) {
return (
<div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-[var(--hill-surface)] border border-[var(--hill-border)] text-xs font-semibold text-[var(--hill-muted)] tracking-[0.04em]">
<span
className="w-1.5 h-1.5 rounded-full bg-[var(--hill-accent)]"
style={{ boxShadow: '0 0 6px var(--hill-accent)' }}
/>
<span>ROUND</span>
<span className="font-mono font-bold text-[var(--hill-text)]">
{current}
{max != null && <span className="text-[var(--hill-dim)]"> / {max}</span>}
</span>
<span className="text-[var(--hill-dim)] pl-1 border-l border-[var(--hill-border)] ml-0.5">
{mode === 'blitz' ? 'BLITZ' : 'SURVIVAL'}
</span>
</div>
);
}
// components/TurnTimer.tsx
import type { ReactNode } from 'react';
import { HILL } from '@/lib/tokens';

interface Props {
seconds: number;
total: number;
size?: number;
color?: string;
children?: ReactNode;
}

export function TurnTimer({ seconds, total, size = 44, color = HILL.accent, children }: Props) {
const r = (size - 4) / 2;
const c = 2 * Math.PI * r;
const off = c * (1 - seconds / total);
return (
<div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
<svg width={size} height={size} className="absolute inset-0" style={{ transform: 'rotate(-90deg)' }}>
<circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={2.5}/>
<circle
cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={2.5}
strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
style={{ transition: 'stroke-dashoffset 0.9s linear' }}
/>
</svg>
{children}
</div>
);
}
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

return (
<div
className={[
'relative w-[220px] rounded-2xl p-4 pb-3.5 flex flex-col gap-3 transition-[border-color,box-shadow]',
'bg-[var(--hill-surface)] border-[1.5px]',
player.isActive ? 'border-[var(--hill-accent)] shadow-[0_0_24px_rgba(191,255,0,0.15)]' : 'border-[var(--hill-border)]',
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

      {player.isActive && (
        <div className="text-center font-mono text-[10px] font-bold text-[var(--hill-accent)] tracking-[0.2em]">
          ● THINKING · {player.secondsLeft}s
        </div>
      )}
    </div>
);
}
// components/QrCode.tsx  (NEW)
'use client';
import { QRCodeSVG } from 'qrcode.react';
import { HILL } from '@/lib/tokens';

interface Props {
value: string;
size?: number;
label?: string;
}

/**
* Wrapped qrcode.react with HILL framing. Install: `npm i qrcode.react`.
* Renders SVG so it scales cleanly. The center "HILL" mark uses imageSettings,
* which the library inserts with error correction reserved.
  */
  export function QrCode({ value, size = 180, label }: Props) {
  return (
   <div className="inline-flex flex-col items-center gap-3">
     <div className="p-3 rounded-2xl bg-[var(--hill-surface)] border border-[var(--hill-border)]">
       <QRCodeSVG
         value={value}
         size={size}
         bgColor="transparent"
         fgColor={HILL.text}
         level="M"
         // Reserve center cell — we'll overlay the HILL mark via wrapper
         marginSize={0}
       />
     </div>
     {label && (
       <div className="font-mono text-[10px] text-[var(--hill-muted)] tracking-[0.18em]">
         {label}
       </div>
     )}
   </div>
);
}
// components/ModeCard.tsx
'use client';
import type { ButtonHTMLAttributes } from 'react';
import { HILL } from '@/lib/tokens';

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
mode: 'blitz' | 'survival';
selected?: boolean;
}

/**
* Used inside a `flex-col gap-3 lg:flex-row lg:gap-5` container on the
* mode-select page; card itself reflows internally on lg+ — bigger icon,
* larger headline, meta strip uses grid columns instead of inline flex.
  */
  export function ModeCard({ mode, selected, ...rest }: Props) {
  const isBlitz = mode === 'blitz';
  return (
  <button
  {...rest}
  className={[
  'relative w-full text-left rounded-2xl transition focus-visible:outline-none',
  'p-5 lg:p-8',
  'bg-[var(--hill-surface)] border-[1.5px]',
  selected ? 'border-[var(--hill-accent)] bg-[rgba(191,255,0,0.04)] shadow-[0_0_24px_rgba(191,255,0,0.15)] lg:shadow-[0_0_36px_rgba(191,255,0,0.15)]'
  : 'border-[var(--hill-border)] lg:hover:border-[var(--hill-accent)] lg:hover:shadow-[0_0_20px_rgba(191,255,0,0.2)] lg:hover:-translate-y-0.5',
  'focus-visible:ring-2 focus-visible:ring-[var(--hill-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--hill-bg)]',
  ].join(' ')}
  >
     <div className="flex items-start justify-between">
       <div className="flex items-center gap-3 lg:gap-[18px]">
         <div
           className="rounded-xl lg:rounded-[18px] flex items-center justify-center w-11 h-11 lg:w-[72px] lg:h-[72px] border"
           style={{
             background: isBlitz ? 'rgba(191,255,0,0.08)' : 'rgba(255,59,48,0.08)',
             borderColor: isBlitz ? 'rgba(191,255,0,0.3)' : 'rgba(255,59,48,0.3)',
             color: isBlitz ? HILL.accent : HILL.danger,
           }}
         >
           {isBlitz
             ? <svg className="w-[22px] h-[22px] lg:w-9 lg:h-9" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L4 14h7l-2 8 9-12h-7l2-8z"/></svg>
             : <svg className="w-[22px] h-[22px] lg:w-9 lg:h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="11" r="2"/><circle cx="15" cy="11" r="2"/><path d="M6 18c0-2 0-6 6-6s6 4 6 6"/><circle cx="12" cy="12" r="9.5"/></svg>}
         </div>
         <div>
           <div className="text-[19px] lg:text-[42px] font-extrabold tracking-[-0.02em] lg:tracking-[-0.03em] leading-none">
             {isBlitz ? 'BLITZ' : 'SURVIVAL'}
           </div>
           <div className="text-xs lg:text-[12px] text-[var(--hill-muted)] mt-0.5 lg:mt-1 font-mono tracking-[0.04em] lg:tracking-[0.14em]">
             {isBlitz ? '~3 MIN' : '~5-7 MIN'}
             <span className="hidden lg:inline"> · {isBlitz ? '7 ROUNDS' : 'LAST ALIVE'}</span>
           </div>
         </div>
       </div>
       <div
         className={[
           'rounded-full flex items-center justify-center transition-colors w-[22px] h-[22px] lg:w-[30px] lg:h-[30px] border-[1.5px] lg:border-2',
           selected ? 'border-[var(--hill-accent)] bg-[var(--hill-accent)]' : 'border-[var(--hill-borderHi)] bg-transparent',
         ].join(' ')}
       >
         {selected && (
           <svg className="w-3 h-3 lg:w-4 lg:h-4" viewBox="0 0 12 12" fill="none" stroke="#0A0A0A" strokeWidth="2.5" strokeLinecap="round">
             <path d="M2 6l3 3 5-6"/>
           </svg>
         )}
       </div>
     </div>

     <div className="text-sm lg:text-[17px] mt-3.5 lg:mt-5 leading-snug lg:leading-normal text-pretty">
       {isBlitz
         ? 'Seven rounds, fixed clock. Multiple kings can rule. Most pieces on the hill at the bell wins the round.'
         : 'Last player with pieces wins. Tighter board pressure, slower burn — outlast everyone.'}
     </div>

     <div className="hidden lg:grid lg:grid-cols-3 gap-3.5 mt-6 pt-5 border-t border-[var(--hill-border)]">
       {([
         ['CLOCK',   isBlitz ? '10s / turn' : '15s / turn'],
         ['ROUNDS',  isBlitz ? '7' : 'No limit'],
         ['PLAYERS', '2–4'],
       ] as const).map(([k, v]) => (
         <div key={k}>
           <div className="font-mono text-[10px] font-bold text-[var(--hill-muted)] tracking-[0.16em]">{k}</div>
           <div className="text-[15px] font-bold mt-1">{v}</div>
         </div>
       ))}
     </div>

     <div className="flex gap-3.5 mt-3.5 pt-3.5 border-t border-[var(--hill-border)] text-[11px] font-mono text-[var(--hill-muted)] tracking-[0.04em] lg:hidden">
       <span>{isBlitz ? '10s / TURN' : '15s / TURN'}</span>
       <span className="text-[var(--hill-border)]">·</span>
       <span>{isBlitz ? '7 ROUNDS' : 'NO LIMIT'}</span>
       <span className="text-[var(--hill-border)]">·</span>
       <span>2–4 PLAYERS</span>
     </div>
   </button>
);
}
// components/PlayStyleCard.tsx
'use client';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
id: 'hotseat' | 'multi';
title: string;
caption: string;
desc: string;
icon: ReactNode;
selected?: boolean;
}

export function PlayStyleCard({ id: _id, title, caption, desc, icon, selected, ...rest }: Props) {
return (
<button
{...rest}
className={[
'relative w-full text-left rounded-2xl transition focus-visible:outline-none',
'p-5 lg:p-8',
'bg-[var(--hill-surface)] border-[1.5px]',
selected
? 'border-[var(--hill-accent)] bg-[rgba(191,255,0,0.04)] shadow-[0_0_24px_rgba(191,255,0,0.15)] lg:shadow-[0_0_36px_rgba(191,255,0,0.15)]'
: 'border-[var(--hill-border)] lg:hover:border-[var(--hill-accent)] lg:hover:shadow-[0_0_20px_rgba(191,255,0,0.2)] lg:hover:-translate-y-0.5',
'focus-visible:ring-2 focus-visible:ring-[var(--hill-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--hill-bg)]',
].join(' ')}
>
<div className="flex items-start justify-between">
<div className="flex items-center gap-3 lg:gap-[18px]">
<div
className={[
'rounded-xl lg:rounded-[18px] flex items-center justify-center w-11 h-11 lg:w-[72px] lg:h-[72px] border',
selected ? 'bg-[rgba(191,255,0,0.08)] border-[rgba(191,255,0,0.3)] text-[var(--hill-accent)]'
: 'bg-white/[0.04] border-[var(--hill-border)] text-[var(--hill-text)]',
].join(' ')}
>
{icon}
</div>
<div>
<div className="text-lg lg:text-[38px] font-extrabold tracking-[-0.02em] lg:tracking-[-0.03em] leading-none">{title}</div>
<div className="text-[11px] lg:text-xs text-[var(--hill-muted)] mt-0.5 lg:mt-1 font-mono tracking-[0.04em] lg:tracking-[0.14em] uppercase">
{caption}
</div>
</div>
</div>
<div
className={[
'rounded-full flex items-center justify-center transition-colors w-[22px] h-[22px] lg:w-[30px] lg:h-[30px] border-[1.5px] lg:border-2',
selected ? 'border-[var(--hill-accent)] bg-[var(--hill-accent)]' : 'border-[var(--hill-borderHi)] bg-transparent',
].join(' ')}
>
{selected && (
<svg className="w-3 h-3 lg:w-4 lg:h-4" viewBox="0 0 12 12" fill="none" stroke="#0A0A0A" strokeWidth="2.5" strokeLinecap="round">
<path d="M2 6l3 3 5-6"/>
</svg>
)}
</div>
</div>
<div className="text-[13px] lg:text-[17px] mt-3.5 lg:mt-5 leading-snug lg:leading-normal text-pretty">
{desc}
</div>
</button>
);
}
// components/SkinCard.tsx
'use client';
import type { ButtonHTMLAttributes } from 'react';
import { PieceShape } from './PieceShape';
import type { SkinId, PlayerNum } from '@/lib/skins';
import { SKINS } from '@/lib/skins';

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
skinId: SkinId;
samplePlayer?: PlayerNum;
selected?: boolean;
locked?: boolean;
unlockText?: string | null;
}

export function SkinCard({ skinId, samplePlayer = 1, selected, locked, unlockText, ...rest }: Props) {
const meta = SKINS[skinId];
return (
<button
{...rest}
disabled={locked}
className={[
'relative shrink-0 flex flex-col items-center gap-2 rounded-[14px] transition focus-visible:outline-none',
'min-w-[116px] px-3 pt-3.5 pb-3 lg:min-w-0 lg:px-3.5 lg:pt-[18px] lg:pb-3.5',
'bg-[var(--hill-surface)] border-[1.5px]',
selected
? 'border-[var(--hill-accent)] bg-[rgba(191,255,0,0.05)] shadow-[0_0_18px_rgba(191,255,0,0.12)]'
: 'border-[var(--hill-border)] lg:hover:border-[var(--hill-accent)] lg:hover:-translate-y-0.5',
locked ? 'opacity-55' : '',
'focus-visible:ring-2 focus-visible:ring-[var(--hill-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--hill-bg)]',
].join(' ')}
>
<div
className={[
'relative flex items-center justify-center rounded-xl border border-[var(--hill-border)]',
'w-14 h-14 lg:w-[76px] lg:h-[76px] lg:rounded-[14px]',
locked
? 'bg-white/[0.03] grayscale brightness-75'
: 'bg-gradient-to-br from-[#1f1f1f] to-[#0f0f0f]',
].join(' ')}
>
<PieceShape player={samplePlayer as PlayerNum} size={32} skin={skinId} />
{locked && (
<div className="absolute inset-0 flex items-center justify-center rounded-xl bg-[rgba(10,10,10,0.55)]">
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--hill-muted)" strokeWidth="2" strokeLinecap="round">
<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/>
</svg>
</div>
)}
</div>

      <div className="text-center min-h-[28px]">
        <div className="text-[13px] lg:text-sm font-bold text-[var(--hill-text)] tracking-[-0.01em]">
          {meta.name}
        </div>
        <div className="font-mono text-[9px] tracking-[0.14em] mt-0.5" style={{ color: meta.color }}>
          {meta.tag}
        </div>
      </div>

      {selected && !locked && (
        <div className="text-[9px] font-extrabold tracking-[0.14em] text-[var(--hill-bg)] bg-[var(--hill-accent)] px-1.5 py-[3px] rounded">
          SELECTED
        </div>
      )}
      {locked && unlockText && (
        <div className="text-[9px] text-[var(--hill-muted)] font-mono tracking-[0.08em] text-center leading-[1.3]">
          {unlockText}
        </div>
      )}
      {!selected && !locked && (
        <div className="text-[9px] text-[var(--hill-muted)] font-mono tracking-[0.14em] lg:hidden">TAP</div>
      )}
    </button>
);
}
// components/LeaderboardRow.tsx
'use client';
import { ArenaBadge } from './ArenaBadge';
import type { TierId } from '@/lib/skins';

export interface LeaderboardRowData {
rank: number;
name: string;
tier: TierId;
wins: number;
games?: number;
wr: number;
elo: number;
isYou?: boolean;
}

interface Props {
row: LeaderboardRowData;
top3?: boolean;
last?: boolean;
}

export function LeaderboardRow({ row, top3 = false, last = false }: Props) {
const rankColor =
row.rank === 1 ? 'var(--hill-gold)' :
row.rank === 2 ? 'var(--hill-silver)' :
row.rank === 3 ? 'var(--hill-bronze)' :
'var(--hill-muted)';

return (
<div
className={[
'flex items-center gap-3 transition-colors',
top3 ? 'px-1 py-2.5' : 'px-3.5 py-3 mb-1.5 rounded-xl',
row.isYou ? 'bg-[rgba(191,255,0,0.04)] border-[1.5px] border-[var(--hill-accent)]' :
top3 ? '' : 'bg-[var(--hill-surface)] border border-[var(--hill-border)]',
top3 && !last ? 'border-b border-[var(--hill-border)]' : '',
].join(' ')}
>
<div
className={[
'font-mono text-right font-extrabold',
top3 ? 'text-[22px] w-8' : 'text-[15px] w-8',
].join(' ')}
style={{ color: rankColor }}
>
{row.rank}
</div>
<div
className={[
'shrink-0 rounded-full bg-gradient-to-br from-[#2a2a2a] to-[#0f0f0f] border border-[var(--hill-border)] flex items-center justify-center font-bold text-sm text-[var(--hill-text)]',
top3 ? 'w-[38px] h-[38px]' : 'w-8 h-8',
].join(' ')}
>
{row.name[0]?.toUpperCase()}
</div>
<div className="flex-1 min-w-0">
<div className="flex items-center gap-1.5">
<span className={[top3 ? 'text-base' : 'text-sm', 'font-bold truncate'].join(' ')}>
{row.name}
</span>
{row.isYou && <span className="text-[9px] font-extrabold text-[var(--hill-accent)] tracking-[0.1em]">YOU</span>}
</div>
<div className="mt-1 flex items-center gap-2">
<ArenaBadge tier={row.tier}/>
<span className="font-mono text-[11px] text-[var(--hill-muted)]">
{row.wr}% wr
</span>
</div>
</div>
<div className="text-right">
<div className={[top3 ? 'text-lg' : 'text-[15px]', 'font-mono font-bold text-[var(--hill-text)]'].join(' ')}>
{row.wins}<span className="text-[var(--hill-muted)] font-medium text-[11px]">w</span>
</div>
<div className="font-mono text-[10px] text-[var(--hill-dim)] tracking-[0.04em]">
{row.elo} ELO
</div>
</div>
</div>
);
}
// components/LeaderboardTable.tsx  (NEW — desktop only)
'use client';
import { useMemo, useState } from 'react';
import { ArenaBadge } from './ArenaBadge';
import type { LeaderboardRowData } from './LeaderboardRow';

type SortKey = 'rank' | 'wins' | 'games' | 'wr' | 'elo';
type SortDir = 'asc' | 'desc';

interface Props {
rows: LeaderboardRowData[];
/** Pre-filtered count for "showing N of M" footer. */
totalCount?: number;
}

const COLS: { key: SortKey | 'player' | 'tier'; label: string; align?: 'right' }[] = [
{ key: 'rank',   label: 'RANK' },
{ key: 'player', label: 'PLAYER' },
{ key: 'tier',   label: 'ARENA' },
{ key: 'wins',   label: 'WINS',     align: 'right' },
{ key: 'games',  label: 'GAMES',    align: 'right' },
{ key: 'wr',     label: 'WIN RATE', align: 'right' },
{ key: 'elo',    label: 'ELO',      align: 'right' },
];

/**
* Sortable, sticky-header table. Hover row tint, lime left-border for the
* current user. Rank colors for top 3 (gold/silver/bronze).
  */
  export function LeaderboardTable({ rows, totalCount }: Props) {
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'rank', dir: 'asc' });

const sorted = useMemo(() => {
const arr = [...rows];
arr.sort((a, b) => {
const va = (a[sort.key] ?? 0) as number;
const vb = (b[sort.key] ?? 0) as number;
return sort.dir === 'asc' ? va - vb : vb - va;
});
return arr;
}, [rows, sort]);

const onHeaderClick = (k: SortKey) => {
setSort(s => s.key === k ? { key: k, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key: k, dir: 'desc' });
};

const rankColor = (rank: number) =>
rank === 1 ? 'var(--hill-gold)' :
rank === 2 ? 'var(--hill-silver)' :
rank === 3 ? 'var(--hill-bronze)' :
'var(--hill-muted)';

return (
<div className="bg-[var(--hill-surface)] border border-[var(--hill-border)] rounded-2xl overflow-hidden">
<div className="grid items-center gap-4 px-5 py-3.5 bg-[var(--hill-surface2)] border-b border-[var(--hill-border)] sticky top-16 font-mono text-[10px] font-bold text-[var(--hill-muted)] tracking-[0.18em]"
style={{ gridTemplateColumns: '64px 1fr 140px 90px 90px 100px 100px' }}>
{COLS.map(col => {
const sortable = (['rank','wins','games','wr','elo'] as const).includes(col.key as SortKey);
const isSorted = sort.key === col.key;
return (
<button
key={col.key}
disabled={!sortable}
onClick={() => sortable && onHeaderClick(col.key as SortKey)}
className={[
'inline-flex items-center gap-1 text-inherit',
col.align === 'right' ? 'justify-end' : 'justify-start',
sortable ? 'hover:text-[var(--hill-text)] cursor-pointer' : 'cursor-default',
'focus-visible:outline-none focus-visible:text-[var(--hill-text)]',
].join(' ')}
>
{col.label}
{sortable && isSorted && (
<span aria-hidden>{sort.dir === 'asc' ? '↑' : '↓'}</span>
)}
</button>
);
})}
</div>

      {sorted.map((r, i) => (
        <div
          key={r.rank}
          className={[
            'grid items-center gap-4 px-5 py-3.5 transition-colors hover:bg-[rgba(191,255,0,0.04)] cursor-pointer',
            r.isYou ? 'bg-[rgba(191,255,0,0.04)]' : '',
            i < sorted.length - 1 ? 'border-b border-[var(--hill-border)]' : '',
          ].join(' ')}
          style={{
            gridTemplateColumns: '64px 1fr 140px 90px 90px 100px 100px',
            borderLeft: r.isYou ? '3px solid var(--hill-accent)' : '3px solid transparent',
          }}
        >
          <div
            className="font-mono font-extrabold"
            style={{ color: rankColor(r.rank), fontSize: r.rank <= 3 ? 22 : 16 }}
          >
            {r.rank}
          </div>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-[#2a2a2a] to-[#0f0f0f] border border-[var(--hill-border)] flex items-center justify-center font-bold text-sm">
              {r.name[0]?.toUpperCase()}
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[15px] font-bold text-[var(--hill-text)] truncate">{r.name}</span>
              {r.isYou && <span className="text-[9px] font-extrabold text-[var(--hill-accent)] tracking-[0.1em]">YOU</span>}
            </div>
          </div>
          <div><ArenaBadge tier={r.tier}/></div>
          <div className="text-right font-mono text-[15px] font-bold text-[var(--hill-text)]">{r.wins}</div>
          <div className="text-right font-mono text-sm font-medium text-[var(--hill-muted)]">{r.games ?? '—'}</div>
          <div className="text-right font-mono text-sm font-medium text-[var(--hill-muted)]">{r.wr}%</div>
          <div
            className="text-right font-mono text-[15px] font-bold"
            style={{ color: r.rank <= 3 ? 'var(--hill-accent)' : 'var(--hill-text)' }}
          >
            {r.elo}
          </div>
        </div>
      ))}

      {totalCount != null && (
        <div className="px-5 py-3 font-mono text-[11px] text-[var(--hill-dim)] tracking-[0.1em]">
          SHOWING {sorted.length} OF {totalCount}
        </div>
      )}
    </div>
);
}
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
className="fixed inset-0 z-50 flex flex-col px-6 pt-14 pb-6 lg:px-12 lg:pt-0 lg:pb-12 animate-[hill-fadein_.35s_ease] lg:backdrop-blur-md"
style={{
background: 'radial-gradient(120% 80% at 50% 30%, rgba(255,59,48,0.28), rgba(10,10,10,0.85) 60%, rgba(10,10,10,0.96))',
}}
role="dialog"
aria-modal="true"
aria-labelledby="death-headline"
>
<div className="flex-1 flex flex-col items-center justify-center gap-0">
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
          className="font-extrabold text-center leading-[0.9] tracking-[-0.04em] lg:tracking-[-0.05em] mt-6 lg:mt-8 text-[var(--hill-danger)] animate-[hill-rise_.5s_ease]"
          style={{
            fontSize: 'clamp(72px, 12vw, 220px)',
            textShadow: '0 0 32px rgba(255,59,48,0.5)',
          }}
        >
          YOU<br/>DIED.
        </h1>

        <div className="mt-4 lg:mt-6 text-sm lg:text-lg font-mono tracking-[0.08em] lg:tracking-[0.18em] text-white/70">
          ELIMINATED · ROUND {round}
        </div>

        <div
          className="mt-9 lg:mt-9 max-w-[280px] lg:max-w-[460px] text-center text-xs lg:text-sm text-[var(--hill-muted)] text-pretty rounded-xl px-4.5 py-3 lg:px-6 lg:py-3.5"
          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--hill-border)' }}
        >
          Hold tight — match continues without you. Watch to spectate.
        </div>
      </div>

      <div className="flex flex-col gap-2.5 lg:flex-row lg:gap-3.5 lg:justify-center lg:max-w-[480px] lg:mx-auto lg:w-full">
        <CTAButton variant="primary" onClick={onSpectate}>
          👁 Spectate
        </CTAButton>
        <CTAButton variant="secondary" onClick={onLeave}>
          ← Leave Room
        </CTAButton>
      </div>
      <div className="hidden lg:block font-mono text-[11px] text-[var(--hill-dim)] tracking-[0.14em] text-center mt-4">
        ESC TO LEAVE · SPACE TO SPECTATE
      </div>
    </div>
);
}
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

/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* HILL tokens as CSS variables so Tailwind arbitrary values can reference them. */
@layer base {
:root {
--hill-bg: #0A0A0A;
--hill-surface: #141414;
--hill-surface2: #1A1A1A;
--hill-border: #1F1F1F;
--hill-borderHi: #2A2A2A;
--hill-text: #FAFAFA;
--hill-muted: #808080;
--hill-dim: #525252;
--hill-accent: #BFFF00;
--hill-accentDim: rgba(191,255,0,0.12);
--hill-danger: #FF3B30;
--hill-bronze: #CD7F32;
--hill-silver: #C0C0C0;
--hill-gold: #FFD700;
--hill-master: #9B59B6;
--hill-champion: #BFFF00;
}

html, body {
background: var(--hill-bg);
color: var(--hill-text);
font-family: var(--font-inter), -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
font-feature-settings: "ss01", "cv11";
-webkit-font-smoothing: antialiased;
letter-spacing: -0.01em;
}

/* Scrollbar hide utility for horizontal skin-card row */
.hill-scroll::-webkit-scrollbar { display: none; }
.hill-scroll { scrollbar-width: none; }

/* Display & mono helpers */
.font-display { font-weight: 800; letter-spacing: -0.04em; line-height: 0.9; }
}

/* Keyframes used by Board hill-zone glow, overlay rise/fade, timer pulse */
@keyframes hill-pulse { 0%, 100% { opacity: 0.55 } 50% { opacity: 1 } }
@keyframes hill-glow {
0%, 100% { box-shadow: 0 0 0 0 rgba(191,255,0,0.4), inset 0 0 12px rgba(191,255,0,0.18); }
50%      { box-shadow: 0 0 28px 0 rgba(191,255,0,0.25), inset 0 0 18px rgba(191,255,0,0.32); }
}
@keyframes hill-rise   { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }
@keyframes hill-fadein { from { opacity: 0 } to { opacity: 1 } }
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
content: [
'./app/**/*.{ts,tsx}',
'./components/**/*.{ts,tsx}',
],
theme: {
extend: {
fontFamily: {
sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
mono: ['var(--font-jetbrains-mono)', 'ui-monospace', 'monospace'],
},
// Breakpoints stay Tailwind defaults: sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536
// Colors are exposed as CSS variables (see globals.css) so we use arbitrary values
// like text-[var(--hill-accent)] throughout; that keeps the palette editable
// at runtime (e.g. theming experiments) without rebuilding Tailwind.
animation: {
'hill-pulse':  'hill-pulse 1.4s ease-in-out infinite',
'hill-glow':   'hill-glow 2.4s ease-in-out infinite',
'hill-rise':   'hill-rise .5s ease',
'hill-fadein': 'hill-fadein .35s ease',
},
},
},
plugins: [],
};

export default config;
// app/layout.tsx
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { BottomNav } from '@/components/BottomNav';
import { TopNav } from '@/components/TopNav';

const inter = Inter({
subsets: ['latin'],
weight: ['400', '500', '600', '700', '800', '900'],
variable: '--font-inter',
display: 'swap',
});

const jetbrains = JetBrains_Mono({
subsets: ['latin'],
weight: ['400', '500', '700'],
variable: '--font-jetbrains-mono',
display: 'swap',
});

export const metadata: Metadata = {
title: 'HILL — King of the Board',
description: '4 players. 3 minutes. One hill. Browser-native checkers.',
};

// Hard-coded session for demo; swap for real auth in production.
const DEMO_USER = { name: 'Aida K.', tier: 'Gold' as const, skin: 'gold' as const };

export default function RootLayout({ children }: { children: React.ReactNode }) {
return (
<html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
<body className="min-h-screen bg-[var(--hill-bg)] text-[var(--hill-text)]">
{/* Desktop sticky header. Renders only on lg+ via `hidden lg:flex` inside. */}
<TopNav user={DEMO_USER} />
{/*
Bottom safe area for mobile so BottomNav doesn't sit on top of content.
On desktop the bottom nav is hidden so we zero out the padding via lg:.
*/}
<main className="pb-[88px] lg:pb-0">{children}</main>
<BottomNav />
</body>
</html>
);
}
// app/page.tsx — Landing
'use client';
import Link from 'next/link';
import { CTAButton } from '@/components/CTAButton';
import { WelcomeChip } from '@/components/WelcomeChip';
import { Board } from '@/components/Board';
import { makeHillPieces, HILL_CENTER_ZONE } from '@/lib/pieces';
import type { SkinId, PlayerNum } from '@/lib/skins';

const MOCK_SKINS: Record<PlayerNum, SkinId> = { 1: 'silver', 2: 'gold', 3: 'bronze', 4: 'master' };

const STEPS = [
{ n: '01', t: 'Spawn a room',     b: 'Pick Blitz or Survival, share the 4-letter code or scan the QR. No download, no account needed to play.' },
{ n: '02', t: 'Push the hill',    b: 'Each player has a shape — circle, square, triangle, hex. Take the 2×2 center and hold it through the clock.' },
{ n: '03', t: 'Climb the arena',  b: 'Wins push your ELO, ELO climbs your tier. Each tier unlocks a new piece finish — bronze through champion.' },
] as const;

export default function Landing() {
// In a real app, pull from session. WelcomeChip in TopNav already shows desktop signed-in state.
const signedIn = true;

return (
<div className="relative">
{/* Mobile-only welcome chip — desktop uses TopNav. */}
{signedIn && (
<div className="lg:hidden absolute top-16 right-4 z-[2]">
<WelcomeChip user={{ name: 'Aida K.', tier: 'Gold', skin: 'gold' }}/>
</div>
)}

      <div className="mx-auto w-full max-w-[1280px] px-5 lg:px-12 pt-[90px] lg:pt-16 pb-24 lg:pb-14 relative">
        {/* Desktop accent column line under HILL */}
        <div
          className="hidden lg:block absolute top-[100px] left-12 w-1 h-[188px] bg-[var(--hill-accent)]"
          style={{ boxShadow: '0 0 16px var(--hill-accent)' }}
        />

        <div className="lg:flex lg:items-end lg:justify-between lg:gap-14 lg:pl-8">
          <div className="lg:flex-1">
            <div className="hidden lg:block text-xs font-bold text-[var(--hill-accent)] tracking-[0.32em]">
              KING · OF · THE · BOARD
            </div>

            <div
              className="font-display text-[120px] lg:text-[180px] xl:text-[220px] mt-3"
              style={{
                background: 'linear-gradient(180deg, #FAFAFA 0%, #FAFAFA 55%, #707070 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}
            >
              HILL
            </div>

            {/* Mobile accent line under H — replaced on desktop by the column above */}
            <div
              className="lg:hidden w-9 h-1 bg-[var(--hill-accent)] -mt-2"
              style={{ boxShadow: '0 0 12px var(--hill-accent)' }}
            />

            <p className="mt-5 lg:mt-6 text-base lg:text-xl xl:text-2xl leading-snug text-[var(--hill-muted)] max-w-[280px] lg:max-w-[560px] text-pretty">
              <span className="text-[var(--hill-text)] font-semibold">4 players. 3 minutes. One hill.</span>
              <br className="hidden lg:block"/>
              <span className="lg:inline"> Browser-native checkers, re-cut for short attention spans.</span>
            </p>

            <div className="mt-9 flex flex-col gap-3 lg:flex-row lg:gap-3.5 lg:items-center">
              <Link href="/play/hill/mode" className="lg:flex-none">
                <CTAButton variant="primary" full={false} className="h-[60px] lg:h-[68px] text-base lg:text-lg w-full lg:w-auto lg:px-8">
                  →&nbsp;&nbsp;Create Hill Room
                </CTAButton>
              </Link>
              <Link href="/play/classic" className="lg:flex-none">
                <CTAButton variant="secondary" full={false} className="h-14 lg:h-[68px] w-full lg:w-auto lg:px-8 lg:text-lg">
                  Play Classic 2P
                </CTAButton>
              </Link>
              <Link href="/join" className="hidden lg:inline-block ml-2 self-center font-mono text-[11px] tracking-[0.14em] text-[var(--hill-muted)] hover:text-[var(--hill-text)]">
                OR<br/>
                <span className="text-[var(--hill-text)] font-bold">JOIN&nbsp;ROOM&nbsp;→</span>
              </Link>
            </div>
          </div>

          {/* Desktop hero board */}
          <div className="hidden lg:block lg:shrink-0 relative pb-4">
            <div
              className="absolute -top-3.5 -right-3.5 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full font-mono text-[10px] font-bold tracking-[0.18em] text-[var(--hill-accent)] z-[2]"
              style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(191,255,0,0.4)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--hill-danger)] animate-hill-pulse" />
              247 LIVE ROOMS
            </div>
            <Board size={10} cellSize={28}
              pieces={makeHillPieces()}
              centerZone={HILL_CENTER_ZONE}
              skinForPlayer={MOCK_SKINS}
            />
          </div>
        </div>

        {/* How HILL works */}
        <section className="mt-20 lg:mt-28 lg:pl-8">
          <div className="flex items-baseline gap-3.5 mb-7">
            <span className="font-mono text-[11px] font-bold tracking-[0.24em] text-[var(--hill-accent)]">
              HOW · HILL · WORKS
            </span>
            <span className="flex-1 h-px bg-[var(--hill-border)]"/>
            <Link href="/rules" className="text-xs text-[var(--hill-muted)] hover:text-[var(--hill-text)] tracking-[0.04em]">
              Full rules →
            </Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-7">
            {STEPS.map(s => (
              <div
                key={s.n}
                className="bg-[var(--hill-surface)] border border-[var(--hill-border)] rounded-2xl p-6 lg:p-7 lg:hover:border-[rgba(191,255,0,0.45)] lg:hover:shadow-[0_0_0_1px_rgba(191,255,0,0.15),0_16px_40px_rgba(0,0,0,0.45)] transition"
              >
                <div className="font-mono text-[11px] text-[var(--hill-muted)] tracking-[0.18em]">STEP · {s.n}</div>
                <div className="font-display text-2xl lg:text-3xl mt-3 tracking-[-0.03em]">{s.t}</div>
                <div className="mt-3.5 text-sm lg:text-[15px] text-[var(--hill-muted)] leading-relaxed text-pretty">
                  {s.b}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
);
}
// app/login/page.tsx
'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GoogleG } from '@/components/GoogleG';
import { Board } from '@/components/Board';
import { makeHillPieces, HILL_CENTER_ZONE } from '@/lib/pieces';
import type { PlayerNum, SkinId } from '@/lib/skins';

const MOCK_SKINS: Record<PlayerNum, SkinId> = { 1: 'silver', 2: 'gold', 3: 'bronze', 4: 'master' };

export default function LoginPage() {
const router = useRouter();

return (
<div className="relative min-h-screen overflow-hidden">
{/* Desktop-only blurred backdrop. Mobile stays solid for legibility. */}
<div className="hidden lg:flex absolute inset-0 items-center justify-center opacity-20" style={{ filter: 'blur(8px) saturate(0.6)', transform: 'scale(1.4) rotate(-6deg)' }}>
<Board size={10} cellSize={56}
pieces={makeHillPieces()}
centerZone={HILL_CENTER_ZONE}
skinForPlayer={MOCK_SKINS}
/>
</div>
<div className="hidden lg:block absolute inset-0" style={{ background: 'radial-gradient(60% 50% at 50% 45%, rgba(10,10,10,0.4), var(--hill-bg) 80%)' }}/>

      {/* Close button */}
      <button
        onClick={() => router.back()}
        aria-label="Close"
        className="absolute top-6 right-4 lg:top-6 lg:right-8 z-10 w-9 h-9 lg:w-11 lg:h-11 rounded-full bg-[var(--hill-surface)] border border-[var(--hill-border)] flex items-center justify-center text-[var(--hill-text)] lg:hover:border-[var(--hill-accent)] transition"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 3l8 8M11 3l-8 8"/></svg>
      </button>

      <div className="relative z-[2] min-h-screen flex items-center justify-center px-6">
        {/* Mobile: full-bleed; desktop: centered card */}
        <div className="w-full lg:max-w-lg lg:bg-[rgba(20,20,20,0.85)] lg:backdrop-blur-xl lg:border lg:border-[var(--hill-border)] lg:rounded-[20px] lg:shadow-[0_30px_80px_rgba(0,0,0,0.5)] p-6 lg:p-12 mx-auto">
          <div className="flex items-baseline gap-2.5">
            <span className="font-display text-[88px] lg:text-[64px] leading-[0.9] tracking-[-0.04em]">HILL</span>
            <span className="w-7 lg:w-6 h-[3px] lg:h-1 bg-[var(--hill-accent)] self-center" style={{ boxShadow: '0 0 10px var(--hill-accent)' }}/>
          </div>

          <div className="mt-9 lg:mt-7">
            <div className="font-mono text-[11px] font-bold text-[var(--hill-accent)] tracking-[0.24em]">ACCOUNT</div>
            <h2 className="font-display mt-2 text-4xl lg:text-[44px] leading-none tracking-[-0.03em] lg:tracking-[-0.04em]">
              Keep your<br/>crown.
            </h2>
            <p className="text-[15px] text-[var(--hill-muted)] mt-3.5 leading-snug max-w-[320px] lg:max-w-none text-pretty">
              Save your wins, ELO, and arena across every device. One tap, no password.
            </p>
          </div>

          <button
            className="mt-7 w-full h-[60px] rounded-xl bg-[var(--hill-text)] text-[var(--hill-bg)] font-bold text-base tracking-[-0.01em] inline-flex items-center justify-center gap-3 transition lg:hover:brightness-95 lg:hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hill-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--hill-bg)]"
          >
            <GoogleG size={22}/> Continue with Google
          </button>

          <div className="mt-4 px-3.5 py-2.5 rounded-[10px] border border-dashed border-[var(--hill-border)] text-xs lg:text-[13px] text-[var(--hill-muted)] text-center leading-relaxed">
            <Link href="/" className="text-[var(--hill-text)] font-semibold hover:underline">Keep playing as guest →</Link><br/>
            <span className="text-[var(--hill-dim)] font-mono text-[10px] tracking-[0.08em]">STATS WON'T SYNC</span>
          </div>
        </div>
      </div>
    </div>
);
}
// app/profile/page.tsx
'use client';
import { useState } from 'react';
import { GoogleG } from '@/components/GoogleG';
import { PieceShape } from '@/components/PieceShape';
import { SkinCard } from '@/components/SkinCard';
import { TIER_META } from '@/lib/tiers';
import { SKINS, skinUnlocked, UNLOCK_WINS, type SkinId, type TierId } from '@/lib/skins';

const DEMO = {
signedIn: true,
email: 'aida.k@gmail.com',
name: 'Aida K.',
tier: 'Gold' as TierId,
initialSkin: 'gold' as SkinId,
stats: {
wins: 88, games: 160, wr: 55, streak: 7, faveMode: 'BLITZ',
longestStreak: '7 wins', bestRound: '12 pieces on hill',
captured: '1,204', hillHeld: '14m 22s', kingsCrowned: '32', eliminated: '47 (29%)',
},
};

export default function ProfilePage() {
const [skin, setSkin] = useState<SkinId>(DEMO.initialSkin);
const tierColor = TIER_META[DEMO.tier].color;

const Identity = (
<div>
<div className="relative w-[110px] h-[110px] lg:w-[220px] lg:h-[220px] mx-auto">
{/* Tier ring (desktop only — mobile uses a simpler 2px border) */}
<div
className="hidden lg:block absolute inset-0 rounded-full p-1"
style={{ background: `conic-gradient(${tierColor} 0deg, ${tierColor} 220deg, var(--hill-border) 220deg, var(--hill-border) 360deg)` }}
>
<div className="w-full h-full rounded-full bg-gradient-to-br from-[#2a2a2a] to-[#0a0a0a] flex items-center justify-center text-[84px] font-black border-2 border-[var(--hill-bg)]">
A
</div>
</div>
{/* Mobile avatar */}
<div className="lg:hidden w-full h-full rounded-full bg-gradient-to-br from-[#2a2a2a] to-[#0a0a0a] flex items-center justify-center text-[44px] font-extrabold border-2 border-[var(--hill-border)]">
A
</div>

        {DEMO.signedIn && (
          <div className="absolute -top-0.5 -right-0.5 lg:top-1.5 lg:right-1.5 w-6 h-6 lg:w-10 lg:h-10 rounded-full bg-[var(--hill-bg)] p-0.5 lg:p-1 border-[1.5px] border-[var(--hill-border)] flex items-center justify-center">
            <GoogleG size={16} className="lg:hidden"/>
            <GoogleG size={26} className="hidden lg:block"/>
          </div>
        )}

        <div className="absolute -bottom-1 -left-1 lg:-bottom-1 lg:-left-1 w-[38px] h-[38px] lg:w-[70px] lg:h-[70px] rounded-full bg-[var(--hill-bg)] border-[1.5px] lg:border-2 border-[var(--hill-borderHi)] flex items-center justify-center">
          <PieceShape player={1} size={24} skin={skin}/>
          <span className="lg:hidden"/>
        </div>

        {/* Mobile tier chip directly under avatar (desktop has its own under-avatar treatment) */}
        <div className="lg:hidden absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1.5 pl-2.5 rounded-full bg-[var(--hill-bg)] flex items-center gap-1.5 text-[11px] font-extrabold tracking-[0.12em] whitespace-nowrap"
             style={{ border: `1.5px solid ${tierColor}60`, color: tierColor }}>
          <span>{TIER_META[DEMO.tier].icon}</span> {DEMO.tier.toUpperCase()} · TIER III
        </div>
      </div>

      <div className="hidden lg:block text-center mt-4">
        <div
          className="inline-flex items-center gap-2 px-4 py-2 pl-3 rounded-full bg-[var(--hill-surface)] font-extrabold text-[13px] tracking-[0.14em]"
          style={{ border: `1.5px solid ${tierColor}50`, color: tierColor }}
        >
          <span className="text-base">{TIER_META[DEMO.tier].icon}</span>
          {DEMO.tier.toUpperCase()} · TIER III
        </div>
      </div>

      {DEMO.signedIn ? (
        <div className="mt-9 lg:mt-6">
          <div className="flex items-center gap-2.5 lg:gap-3 px-3.5 lg:px-4 py-2.5 lg:py-3.5 rounded-[10px] lg:rounded-xl border" style={{ background: 'rgba(191,255,0,0.04)', borderColor: 'rgba(191,255,0,0.2)' }}>
            <GoogleG size={16} className="lg:hidden"/>
            <GoogleG size={20} className="hidden lg:block"/>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-[var(--hill-muted)] tracking-[0.14em] font-bold">SIGNED IN AS</div>
              <div className="text-[13px] lg:text-sm font-semibold truncate">{DEMO.email}</div>
            </div>
            <button className="text-[11px] lg:text-xs text-[var(--hill-muted)] font-semibold tracking-[0.04em] hover:text-[var(--hill-text)]">
              Sign out
            </button>
          </div>
        </div>
      ) : (
        <button className="mt-9 w-full h-14 rounded-xl bg-[var(--hill-text)] text-[var(--hill-bg)] text-[15px] font-bold inline-flex items-center justify-center gap-2.5 transition lg:hover:brightness-95 lg:hover:-translate-y-0.5">
          <GoogleG size={20}/> Sign in with Google
        </button>
      )}
    </div>
);

const NameInput = (
<div>
<div className="text-[10px] font-bold text-[var(--hill-muted)] tracking-[0.18em] mb-2 lg:mb-2.5">DISPLAY NAME</div>
<div className="flex items-center px-4 lg:px-5 py-3.5 lg:py-4 bg-[var(--hill-surface)] border border-[var(--hill-borderHi)] rounded-xl text-[17px] lg:text-[22px] font-bold lg:font-bold tracking-[-0.01em] transition focus-within:border-[var(--hill-accent)] focus-within:shadow-[0_0_0_3px_rgba(191,255,0,0.15)]">
<input
defaultValue={DEMO.name}
className="flex-1 bg-transparent outline-none text-[var(--hill-text)]"
/>
<span className="font-mono text-[11px] text-[var(--hill-dim)] tracking-[0.08em] ml-2 shrink-0">SAVED ✓</span>
</div>
</div>
);

const Stats = (
<div className="grid grid-cols-3 lg:grid-cols-5 bg-[var(--hill-surface)] border border-[var(--hill-border)] rounded-[14px] overflow-hidden">
{[
['TOTAL WINS', String(DEMO.stats.wins)],
['GAMES',      String(DEMO.stats.games)],
['WIN RATE',   `${DEMO.stats.wr}%`],
// Hidden on mobile — only the 3-column subset shows there.
['STREAK',     String(DEMO.stats.streak)],
['FAVE MODE',  DEMO.stats.faveMode],
].map(([k, v], i, arr) => (
<div
key={k}
className={[
'p-4 lg:p-5 text-center',
i < arr.length - 1 ? 'border-r border-[var(--hill-border)]' : '',
// Mobile shows only first 3 cells; hide the rest at < lg
i >= 3 ? 'hidden lg:block' : '',
// The 3rd cell shouldn't have a right border on mobile (it's the last visible there)
i === 2 ? 'lg:border-r border-r-0 lg:border-r-[var(--hill-border)]' : '',
].join(' ')}
>
<div className="font-mono text-[26px] lg:text-[32px] font-extrabold tracking-[-0.01em]">{v}</div>
<div className="text-[10px] text-[var(--hill-muted)] tracking-[0.14em] lg:tracking-[0.16em] mt-1 font-bold">{k}</div>
</div>
))}
</div>
);

const Progress = (
<div>
<div className="flex justify-between font-mono text-[11px] text-[var(--hill-muted)] tracking-[0.08em] lg:tracking-[0.1em] mb-1.5 lg:mb-2">
<span style={{ color: tierColor }}>{DEMO.tier.toUpperCase()} · TIER III</span>
<span>1,996 / 2,236 ELO · 240 to <span className="text-[var(--hill-master)]">MASTER</span></span>
</div>
<div className="h-1.5 lg:h-2.5 rounded-sm bg-[var(--hill-surface)] overflow-hidden border border-[var(--hill-border)]">
<div className="h-full" style={{ width: '62%', background: `linear-gradient(90deg, ${tierColor}, var(--hill-accent))`, boxShadow: '0 0 12px var(--hill-accent)' }}/>
</div>
</div>
);

const Skins = (
<div>
<div className="flex justify-between items-center mb-2 lg:mb-3">
<div className="text-[10px] font-bold text-[var(--hill-muted)] tracking-[0.18em]">PIECE SKIN</div>
<div className="font-mono text-[10px] text-[var(--hill-dim)] tracking-[0.08em] lg:tracking-[0.1em]">
SHAPE STAYS THE SAME · 4 OF 5 UNLOCKED
</div>
</div>
{/* Mobile: horizontal scrolling; desktop: 5-up grid */}
<div className="hill-scroll flex gap-2 overflow-x-auto px-5 -mx-5 lg:grid lg:grid-cols-5 lg:gap-3 lg:px-0 lg:mx-0">
{(Object.keys(SKINS) as SkinId[]).map(sk => {
const unlocked = skinUnlocked(sk, DEMO.tier);
const tier = SKINS[sk].tier;
const unlockText = unlocked ? null : `Unlock at ${tier} · ${UNLOCK_WINS[tier]} wins`;
return (
<SkinCard
key={sk}
skinId={sk}
samplePlayer={1}
selected={skin === sk}
locked={!unlocked}
unlockText={unlockText}
onClick={() => unlocked && setSkin(sk)}
/>
);
})}
</div>
<div className="mt-2 lg:mt-2 text-[11px] text-[var(--hill-muted)] font-mono tracking-[0.04em]">
<span className="text-[var(--hill-accent)]">✓</span> Auto-saved · applies to all your pieces
</div>
</div>
);

const DetailedStats = (
<div>
<div className="text-[10px] font-bold text-[var(--hill-muted)] tracking-[0.18em] mb-2.5">DETAILED STATS</div>
<div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5 lg:gap-2.5">
{[
['Longest streak',      DEMO.stats.longestStreak],
['Best round (Blitz)',  DEMO.stats.bestRound],
['Pieces captured',     DEMO.stats.captured],
['Hill seconds held',   DEMO.stats.hillHeld],
['Kings crowned',       DEMO.stats.kingsCrowned],
['Times eliminated',    DEMO.stats.eliminated],
].map(([k, v]) => (
<div key={k} className="flex justify-between items-center px-3.5 lg:px-4 py-3 lg:py-3.5 bg-[var(--hill-surface)] border border-[var(--hill-border)] rounded-[10px] text-[13px] lg:text-sm">
<span className="text-[var(--hill-muted)]">{k}</span>
<span className="font-mono font-bold text-[var(--hill-text)]">{v}</span>
</div>
))}
</div>
</div>
);

return (
<div className="mx-auto w-full max-w-[1280px] px-5 lg:px-12 pt-6 lg:pt-12 pb-10 lg:pb-16">
{/* Mobile header (TopBar would normally go here — TopNav covers desktop) */}
<div className="lg:hidden text-[10px] font-bold text-[var(--hill-muted)] tracking-[0.18em] mb-5">PROFILE</div>

      {/* Desktop heading bar */}
      <div className="hidden lg:flex items-baseline gap-3.5 mb-7">
        <span className="font-mono text-[11px] font-bold text-[var(--hill-accent)] tracking-[0.24em]">· ME ·</span>
        <h1 className="font-display text-[72px] m-0 tracking-[-0.04em]">Profile</h1>
        <span className="flex-1"/>
        <div className="font-mono text-[11px] text-[var(--hill-dim)] tracking-[0.14em]">SAVED · <span className="text-[var(--hill-accent)]">✓</span></div>
      </div>

      {/* Layout: single column on mobile, 1fr/2fr split on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-9 lg:gap-12">
        <div className="flex flex-col items-center lg:items-stretch gap-6">
          {Identity}
        </div>
        <div className="flex flex-col gap-5 lg:gap-6">
          {NameInput}
          {Stats}
          {Progress}
          {Skins}
          {DetailedStats}
          <div className="flex lg:justify-end">
            <button className="h-12 lg:h-10 w-full lg:w-auto lg:px-4 rounded-xl bg-transparent text-[var(--hill-danger)] border text-sm lg:text-xs font-bold tracking-[0.04em] lg:tracking-[0.08em] transition lg:hover:border-[var(--hill-danger)]"
                    style={{ borderColor: 'rgba(255,59,48,0.25)' }}>
              RESET ACCOUNT
            </button>
          </div>
        </div>
      </div>
    </div>
);
}
// app/leaderboard/page.tsx
'use client';
import { useState } from 'react';
import { LeaderboardRow, type LeaderboardRowData } from '@/components/LeaderboardRow';
import { LeaderboardTable } from '@/components/LeaderboardTable';

const ROWS: LeaderboardRowData[] = [
{ rank: 1,  name: 'Sam Wilson',   tier: 'Champion', wins: 142, games: 200, wr: 71, elo: 2480 },
{ rank: 2,  name: 'mira_42',      tier: 'Champion', wins: 128, games: 188, wr: 68, elo: 2410 },
{ rank: 3,  name: 'Aida.K',       tier: 'Master',   wins: 117, games: 183, wr: 64, elo: 2245 },
{ rank: 4,  name: 'kettle',       tier: 'Master',   wins: 109, games: 176, wr: 62, elo: 2210 },
{ rank: 5,  name: 'Riko',         tier: 'Master',   wins: 102, games: 173, wr: 59, elo: 2188 },
{ rank: 6,  name: 'darkhorse',    tier: 'Gold',     wins:  94, games: 162, wr: 58, elo: 2050 },
{ rank: 7,  name: 'Player_a3f9',  tier: 'Gold',     wins:  88, games: 160, wr: 55, elo: 1996, isYou: true },
{ rank: 8,  name: 'Marcus J.',    tier: 'Gold',     wins:  82, games: 155, wr: 53, elo: 1955 },
{ rank: 9,  name: 'noir',         tier: 'Silver',   wins:  74, games: 145, wr: 51, elo: 1810 },
{ rank: 10, name: 'paperclip',    tier: 'Silver',   wins:  68, games: 138, wr: 49, elo: 1740 },
{ rank: 11, name: 'oz_8',         tier: 'Silver',   wins:  61, games: 130, wr: 47, elo: 1688 },
{ rank: 12, name: 'rust_belt',    tier: 'Bronze',   wins:  54, games: 123, wr: 44, elo: 1502 },
];

const FILTERS = ['Global', 'Friends · 12', 'This week', 'Blitz only', 'Survival only'] as const;

export default function LeaderboardPage() {
const [active, setActive] = useState<typeof FILTERS[number]>('Global');

const top3 = ROWS.slice(0, 3);
const rest = ROWS.slice(3);

return (
<div className="mx-auto w-full max-w-[1280px] px-5 lg:px-12 pt-6 lg:pt-12 pb-10 lg:pb-16">
{/* Headline */}
<div className="lg:flex lg:items-baseline lg:gap-4 mb-2">
<span className="font-mono text-[11px] font-bold tracking-[0.24em] lg:tracking-[0.32em] text-[var(--hill-accent)]">
RANKED · SEASON 03
</span>
</div>
<div className="lg:flex lg:items-baseline lg:justify-between lg:gap-8 mb-6 lg:mb-7">
<h1 className="font-display text-[56px] lg:text-[96px] m-0 tracking-[-0.05em] mt-1.5 lg:mt-1">
TOP 100
</h1>
<div className="hidden lg:block pb-[18px] font-mono text-[11px] text-[var(--hill-muted)] tracking-[0.14em]">
SEASON ENDS IN <span className="text-[var(--hill-text)] font-bold">12d 04h</span>
</div>
</div>

      {/* Filter row + search */}
      <div className="flex items-center justify-between gap-3 mb-4 lg:mb-5">
        <div className="flex gap-1.5 lg:gap-2 overflow-x-auto hill-scroll">
          {FILTERS.map(f => {
            const isActive = active === f;
            return (
              <button
                key={f}
                onClick={() => setActive(f)}
                className={[
                  'px-3.5 lg:px-4 py-2 lg:py-2.5 rounded-full text-[12px] lg:text-[13px] font-bold tracking-[-0.01em] whitespace-nowrap transition',
                  isActive ? 'bg-[var(--hill-text)] text-[var(--hill-bg)]' : 'bg-[var(--hill-surface)] text-[var(--hill-muted)] border border-[var(--hill-border)] lg:hover:bg-[var(--hill-surface2)] lg:hover:text-[var(--hill-text)]',
                ].join(' ')}
              >
                {f}
              </button>
            );
          })}
        </div>

        {/* Desktop-only search */}
        <div className="hidden lg:flex w-[260px] h-[38px] bg-[var(--hill-surface)] border border-[var(--hill-border)] rounded-[10px] items-center gap-2 px-3">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--hill-muted)" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
          </svg>
          <input placeholder="Search players" className="flex-1 bg-transparent outline-none text-[13px] text-[var(--hill-text)] placeholder-[var(--hill-muted)]"/>
          <span className="font-mono text-[10px] text-[var(--hill-dim)] tracking-[0.08em] px-1.5 py-0.5 border border-[var(--hill-border)] rounded">⌘ K</span>
        </div>
      </div>

      {/* MOBILE — row cards (existing pattern) */}
      <div className="lg:hidden">
        {/* Top-3 podium */}
        <div className="bg-gradient-to-b from-[var(--hill-surface)] to-[var(--hill-surface2)] border border-[var(--hill-border)] rounded-2xl p-3.5">
          {top3.map((r, i) => (
            <LeaderboardRow key={r.rank} row={r} top3 last={i === 2}/>
          ))}
        </div>
        <div className="mt-3">
          {rest.map(r => <LeaderboardRow key={r.rank} row={r}/>)}
        </div>
        <div className="mt-3 text-center text-xs text-[var(--hill-dim)] font-mono tracking-[0.08em]">
          SHOWING 1–12 OF 100
        </div>
      </div>

      {/* DESKTOP — sortable table */}
      <div className="hidden lg:block">
        <LeaderboardTable rows={ROWS} totalCount={100}/>

        <div className="mt-4 flex justify-between items-center font-mono text-[11px] text-[var(--hill-dim)] tracking-[0.1em]">
          <span>SHOWING 1–12 OF 100</span>
          <div className="flex gap-2">
            <button className="h-9 px-3.5 rounded-lg bg-[var(--hill-surface)] border border-[var(--hill-border)] text-[var(--hill-text)] text-xs font-semibold lg:hover:border-[var(--hill-accent)] transition">← Prev</button>
            <button className="h-9 px-3.5 rounded-lg bg-[var(--hill-surface)] border border-[var(--hill-border)] text-[var(--hill-text)] text-xs font-semibold lg:hover:border-[var(--hill-accent)] transition">Next →</button>
          </div>
        </div>
      </div>
    </div>
);
}
// app/play/hill/mode/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TopBar } from '@/components/TopBar';
import { ModeCard } from '@/components/ModeCard';
import { CTAButton } from '@/components/CTAButton';

export default function ModeSelectPage() {
const [selected, setSelected] = useState<'blitz' | 'survival'>('blitz');
const router = useRouter();

return (
<>
<TopBar/>
<div className="mx-auto w-full max-w-[1280px] px-5 lg:px-12 pt-5 lg:pt-14 pb-28 lg:pb-14 flex flex-col min-h-[calc(100vh-64px)]">
<div className="lg:flex lg:items-baseline lg:gap-4 mb-3">
<span className="font-mono text-[11px] font-bold text-[var(--hill-accent)] tracking-[0.24em] lg:tracking-[0.32em]">
STEP · 1 / 2
</span>
<button onClick={() => router.back()} className="hidden lg:inline-block text-xs text-[var(--hill-muted)] hover:text-[var(--hill-text)] tracking-[0.04em]">← back</button>
</div>
<h1 className="font-display text-4xl lg:text-[88px] mt-2 mb-2 lg:mb-3 tracking-[-0.04em]">
Choose your<br className="lg:hidden"/><span className="hidden lg:inline"> </span>mode.
</h1>
<p className="text-sm lg:text-lg text-[var(--hill-muted)] mt-1 max-w-[580px]">
Pick a ruleset. You can switch in the lobby up until the first move.
</p>

        {/* Cards: stacked on mobile, side-by-side on desktop */}
        <div className="flex flex-col gap-3 mt-6 lg:flex-row lg:gap-6 lg:mt-12">
          <div className="lg:flex-1">
            <ModeCard mode="blitz" selected={selected === 'blitz'} onClick={() => setSelected('blitz')}/>
          </div>
          <div className="lg:flex-1">
            <ModeCard mode="survival" selected={selected === 'survival'} onClick={() => setSelected('survival')}/>
          </div>
        </div>

        <div className="flex-1 hidden lg:block"/>

        {/* Sticky CTA on mobile, centered on desktop */}
        <div className="fixed bottom-[88px] left-0 right-0 px-5 lg:static lg:px-0 lg:flex lg:justify-center lg:mt-10"
             style={{ background: 'linear-gradient(180deg, transparent, var(--hill-bg) 35%)' }}>
          <CTAButton
            variant="primary"
            full={false}
            className="w-full lg:w-auto lg:px-8 lg:h-[68px] lg:text-lg"
            onClick={() => router.push(`/play/hill/style?mode=${selected}`)}
          >
            Continue · <span className="font-mono opacity-70 text-[13px]">{selected.toUpperCase()}</span> →
          </CTAButton>
        </div>
      </div>
    </>
);
}
// app/play/hill/style/page.tsx
'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TopBar } from '@/components/TopBar';
import { PlayStyleCard } from '@/components/PlayStyleCard';
import { CTAButton } from '@/components/CTAButton';

const OPTIONS = [
{
id: 'hotseat' as const,
title: 'Hot-seat',
caption: 'This device',
desc: 'Pass the device. Everyone takes their turn on the same screen — perfect for couch games and offline play.',
icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="3"/><path d="M11 18h2"/></svg>,
},
{
id: 'multi' as const,
title: 'Multiplayer',
caption: 'Invite friends',
desc: 'Create a room. Send a code, link, or QR — friends join from their phones, laptops, or tablets in real time.',
icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3"/><path d="M3 21c.5-3.5 3-6 6-6s5.5 2.5 6 6"/><circle cx="17" cy="7" r="2.5"/><path d="M15 13c.5-1.5 2-3 4-3"/></svg>,
},
];

export default function PlayStylePage() {
const router = useRouter();
const search = useSearchParams();
const mode = (search.get('mode') as 'blitz' | 'survival') ?? 'blitz';
const [selected, setSelected] = useState<'hotseat' | 'multi'>('multi');

return (
<>
<TopBar/>
<div className="mx-auto w-full max-w-[1280px] px-5 lg:px-12 pt-5 lg:pt-14 pb-28 lg:pb-14 flex flex-col min-h-[calc(100vh-64px)]">
<div className="lg:flex lg:items-baseline lg:gap-4 mb-3">
<span className="font-mono text-[11px] font-bold text-[var(--hill-accent)] tracking-[0.24em] lg:tracking-[0.32em]">
STEP · 2 / 2
</span>
<button onClick={() => router.back()} className="hidden lg:inline-block text-xs text-[var(--hill-muted)] hover:text-[var(--hill-text)] tracking-[0.04em]">← back</button>
<span className="flex-1 hidden lg:block"/>
<span className="hidden lg:inline-block font-mono text-xs text-[var(--hill-muted)] tracking-[0.1em]">
<span className="text-[var(--hill-accent)]">{mode === 'survival' ? '💀 SURVIVAL' : '⚡ BLITZ'}</span>
<span className="text-[var(--hill-dim)]"> · 4 PLAYERS MAX</span>
</span>
</div>
<h1 className="font-display text-4xl lg:text-[88px] mt-2 mb-2 lg:mb-3 tracking-[-0.04em]">
How do you<br/>want to play?
</h1>
<p className="text-sm text-[var(--hill-muted)] mt-1 lg:hidden">
<span className="font-mono text-[var(--hill-accent)]">{mode === 'survival' ? '💀 SURVIVAL' : '⚡ BLITZ'}</span>
<span className="text-[var(--hill-dim)]"> · 4 players max</span>
</p>

        <div className="flex flex-col gap-3 mt-6 lg:flex-row lg:gap-6 lg:mt-11">
          {OPTIONS.map(o => (
            <div key={o.id} className="lg:flex-1">
              <PlayStyleCard
                {...o}
                selected={selected === o.id}
                onClick={() => setSelected(o.id)}
              />
            </div>
          ))}
        </div>

        <div className="flex-1 hidden lg:block"/>

        <div className="fixed bottom-[88px] left-0 right-0 px-5 lg:static lg:px-0 lg:flex lg:justify-center lg:mt-10"
             style={{ background: 'linear-gradient(180deg, transparent, var(--hill-bg) 35%)' }}>
          <CTAButton
            variant="primary"
            full={false}
            className="w-full lg:w-auto lg:px-8 lg:h-[68px] lg:text-lg"
            onClick={() => router.push(`/r/ABCD?mode=${mode}&style=${selected}`)}
          >
            {selected === 'multi' ? 'Create room  →' : 'Start hot-seat  →'}
          </CTAButton>
        </div>
      </div>
    </>
);
}
// app/r/[roomId]/page.tsx — Lobby + Game (single route, state-driven)
'use client';
import { useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { TopBar } from '@/components/TopBar';
import { RoomCodeDisplay } from '@/components/RoomCodeDisplay';
import { CTAButton } from '@/components/CTAButton';
import { PlayerSlot } from '@/components/PlayerSlot';
import { PlayerPanelDesktop, type DesktopPanelPlayer } from '@/components/PlayerPanelDesktop';
import { QrCode } from '@/components/QrCode';
import { Board } from '@/components/Board';
import { RoundCounter } from '@/components/RoundCounter';
import { PieceShape } from '@/components/PieceShape';
import { DeathOverlay } from '@/components/DeathOverlay';
import { GameOverOverlay } from '@/components/GameOverOverlay';
import { makeHillPieces, HILL_CENTER_ZONE } from '@/lib/pieces';
import type { PlayerNum } from '@/lib/tokens';
import type { SkinId } from '@/lib/skins';

const MOCK_SKINS: Record<PlayerNum, SkinId> = { 1: 'gold', 2: 'gold', 3: 'bronze', 4: 'master' };

export default function RoomPage() {
const params = useParams<{ roomId: string }>();
const search = useSearchParams();
const code = (params?.roomId ?? 'ABCD').toUpperCase();
const mode = (search.get('mode') as 'blitz' | 'survival') ?? 'blitz';

const [stage, setStage] = useState<'lobby' | 'game'>('lobby');
const [overlay, setOverlay] = useState<null | 'death' | 'win-solo' | 'win-joint' | 'win-none'>(null);

return stage === 'lobby'
    ? <Lobby code={code} mode={mode} onStart={() => setStage('game')}/>
    : <Game code={code} mode={mode} overlay={overlay} setOverlay={setOverlay}/>;
}

// ─────────────────────────────────────────────────────────────
// LOBBY
// ─────────────────────────────────────────────────────────────
function Lobby({ code, mode, onStart }: { code: string; mode: 'blitz' | 'survival'; onStart: () => void; }) {
const slots = [
{ player: 1 as PlayerNum, name: 'Aida K.', tier: 'Gold' as const,   isHost: true, you: true, skin: 'gold' as SkinId },
{ player: 2 as PlayerNum, empty: true },
{ player: 3 as PlayerNum, name: 'Sam',     tier: 'Bronze' as const, skin: 'bronze' as SkinId },
{ player: 4 as PlayerNum, empty: true },
];
const filled = slots.filter(s => !s.empty).length;
const ready = filled >= 2;
const roomUrl = typeof window !== 'undefined' ? `${window.location.origin}/r/${code}` : `https://hill.gg/r/${code}`;

return (
<>
<TopBar
right={
<button className="w-9 h-9 rounded-[10px] bg-[var(--hill-surface)] border border-[var(--hill-border)] inline-flex items-center justify-center" aria-label="Share">
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--hill-text)" strokeWidth="2" strokeLinecap="round">
<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
<path d="M8.6 13.5l7 4M15.6 6.5l-7 4"/>
</svg>
</button>
}
/>

      <div className="mx-auto w-full max-w-[1280px] px-5 lg:px-12 pt-3 lg:pt-12 pb-32 lg:pb-12">
        {/* Desktop heading row */}
        <div className="hidden lg:flex items-baseline gap-4 mb-7">
          <button className="text-[13px] text-[var(--hill-muted)] hover:text-[var(--hill-text)] tracking-[0.04em]">← Leave room</button>
          <span className="flex-1"/>
          <span className="font-mono text-[11px] text-[var(--hill-muted)] tracking-[0.14em]">
            LIVE LOBBY · <span className="text-[var(--hill-accent)]">● {filled}/4</span>
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-9 lg:gap-12">
          {/* LEFT */}
          <div>
            <div className="text-center lg:text-left"><RoomCodeDisplay code={code}/></div>
            <div className="hidden lg:block font-mono text-xs text-[var(--hill-muted)] mt-2 tracking-[0.06em]">
              hill.gg/r/<span className="text-[var(--hill-text)]">{code}</span>
            </div>

            <div className="flex gap-2 mt-3.5 lg:mt-5">
              <button className="flex-1 h-11 lg:h-[46px] rounded-[10px] bg-[var(--hill-surface)] border border-[var(--hill-border)] text-[var(--hill-text)] text-sm font-semibold inline-flex items-center justify-center gap-2 lg:hover:border-[var(--hill-accent)] transition">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                Copy link
              </button>
              <button className="flex-1 h-11 lg:h-[46px] rounded-[10px] bg-[var(--hill-surface)] border border-[var(--hill-border)] text-[var(--hill-text)] text-sm font-semibold inline-flex items-center justify-center gap-2 lg:hover:border-[var(--hill-accent)] transition">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
                Share
              </button>
            </div>

            {/* Mode locked */}
            <div className="mt-6 lg:mt-7">
              <div className="text-[10px] font-bold text-[var(--hill-muted)] tracking-[0.18em] mb-2 lg:mb-2.5">MODE · LOCKED</div>
              <div className="flex items-center gap-3 px-3.5 lg:px-4 py-3 lg:py-3.5 bg-[var(--hill-surface)] border border-[var(--hill-border)] rounded-xl">
                <span className="text-lg lg:text-[22px]">{mode === 'survival' ? '💀' : '⚡'}</span>
                <div className="flex-1">
                  <div className="font-display text-[14px] lg:text-[22px] tracking-[-0.02em]">
                    {mode === 'survival' ? 'SURVIVAL' : 'BLITZ'}
                  </div>
                  <div className="text-[11px] lg:text-xs text-[var(--hill-muted)] mt-0.5">
                    {mode === 'survival' ? 'Last alive wins · ~5-7 min' : '7 rounds · ~3 min'}
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--hill-muted)" strokeWidth="2" strokeLinecap="round">
                  <rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/>
                </svg>
              </div>
            </div>

            {/* Desktop QR */}
            <div className="hidden lg:block mt-7">
              <div className="text-[10px] font-bold text-[var(--hill-muted)] tracking-[0.18em] mb-2.5">SCAN TO JOIN ON MOBILE</div>
              <div className="flex items-center gap-4">
                <QrCode value={roomUrl} size={156}/>
                <div className="text-[13px] text-[var(--hill-muted)] leading-relaxed max-w-[200px] text-pretty">
                  Friends point their phone camera at this — opens the lobby instantly. <span className="text-[var(--hill-text)]">No app install.</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div>
            <div className="flex items-baseline justify-between mb-3 lg:mb-4">
              <h2 className="font-display text-2xl lg:text-[44px] m-0 tracking-[-0.04em]">Players</h2>
              <div className="font-mono text-[11px] lg:text-[13px] text-[var(--hill-muted)] tracking-[0.1em]">
                <span className="text-[var(--hill-text)] font-bold">{filled}</span> · OF · 4
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 lg:gap-3.5">
              {slots.map((s, i) => <PlayerSlot key={i} {...s}/>)}
            </div>

            <div className="mt-5 lg:mt-7 hidden lg:block">
              <div className="text-[10px] font-bold text-[var(--hill-muted)] tracking-[0.18em] mb-2.5">RECENT</div>
              <div className="bg-[var(--hill-surface)] border border-[var(--hill-border)] rounded-xl px-3.5 py-2.5 flex flex-col gap-2 text-xs text-[var(--hill-muted)] font-mono tracking-[0.04em]">
                <div><span className="text-[var(--hill-accent)]">●</span> 0:48 ago · Sam joined as P3</div>
                <div><span className="text-[var(--hill-muted)]">○</span> 2:14 ago · Aida created room, mode set to {mode.toUpperCase()}</div>
              </div>
            </div>

            {/* CTA — sticky on mobile, inline on desktop */}
            <div className="fixed bottom-[88px] left-0 right-0 px-5 lg:static lg:px-0 lg:mt-7 lg:flex lg:justify-end lg:gap-3"
                 style={{ background: 'linear-gradient(180deg, transparent, var(--hill-bg) 30%)' }}>
              <CTAButton variant="secondary" full={false} className="hidden lg:inline-flex">Cancel</CTAButton>
              <CTAButton variant="primary" disabled={!ready} onClick={onStart} full={false} className="w-full lg:w-auto lg:px-7">
                {ready ? 'Start Game →' : 'Waiting for 2+ players…'}
              </CTAButton>
            </div>
          </div>
        </div>
      </div>
    </>
);
}

// ─────────────────────────────────────────────────────────────
// GAME — 4P HILL
// ─────────────────────────────────────────────────────────────
function Game({
code, mode, overlay, setOverlay,
}: {
code: string;
mode: 'blitz' | 'survival';
overlay: null | 'death' | 'win-solo' | 'win-joint' | 'win-none';
setOverlay: (v: null | 'death' | 'win-solo' | 'win-joint' | 'win-none') => void;
}) {
const pieces = makeHillPieces();

const left: DesktopPanelPlayer[] = [
{ player: 1, name: 'Aida K.', tier: 'Gold',   you: true, alivePieces: 7, capturedThisRound: 2, skin: 'gold' },
{ player: 4, name: 'Riko',    tier: 'Master', alivePieces: 7, skin: 'master' },
];
const right: DesktopPanelPlayer[] = [
{ player: 2, name: 'Marcus', tier: 'Gold',   isActive: true, secondsLeft: 6, secondsTotal: 10, alivePieces: 7, skin: 'gold' },
{ player: 3, name: 'Sam',    tier: 'Bronze', eliminated: true, alivePieces: 3, skin: 'bronze' },
];

const mobileAll = [...left, ...right];

return (
<>
{/* Mobile TopBar — desktop uses TopNav */}
<TopBar code={code}/>

      <div className="mx-auto w-full max-w-[1280px] px-3 lg:px-12 pt-2 lg:pt-6 pb-32 lg:pb-12">
        {/* Top row: round counter centered + live dot */}
        <div className="flex items-center justify-between px-1 lg:px-0 mb-3 lg:mb-4">
          <button className="text-[13px] text-[var(--hill-muted)] hover:text-[var(--hill-text)] tracking-[0.04em] hidden lg:inline-block">← Back to menu</button>
          <div className="lg:flex-1 lg:flex lg:justify-center">
            <RoundCounter current={mode === 'blitz' ? 3 : 5} max={mode === 'blitz' ? 7 : null} mode={mode}/>
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <span className="font-mono text-[11px] text-[var(--hill-muted)] tracking-[0.18em]">
              ROOM · <span className="text-[var(--hill-text)] font-bold">{code}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[var(--hill-muted)] tracking-[0.18em]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--hill-danger)] animate-hill-pulse"/>
              LIVE
            </span>
          </div>
          <span className="lg:hidden inline-flex items-center gap-1.5 font-mono text-[11px] text-[var(--hill-muted)] tracking-[0.08em]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--hill-danger)] animate-hill-pulse"/>
            LIVE
          </span>
        </div>

        {/* Turn timer banner (desktop only — mobile keeps it implicit via PlayerSlot ring) */}
        <div className="hidden lg:flex justify-center mb-3.5">
          <div className="inline-flex items-center gap-3.5 px-5 py-2.5 pl-3.5 rounded-full bg-[var(--hill-surface)] border-[1.5px] border-[var(--hill-accent)] shadow-[0_0_24px_rgba(191,255,0,0.15)] text-[15px] font-bold">
            <PieceShape player={2} size={24} skin="gold"/>
            <span>MARCUS&apos; TURN</span>
            <span className="w-px h-4 bg-[var(--hill-borderHi)]"/>
            <span className="font-mono text-[var(--hill-accent)] text-[15px] font-bold">0:06</span>
          </div>
        </div>

        {/* MOBILE: board on top, 2x2 below (existing behavior).
            DESKTOP: 3-col layout. */}
        <div className="lg:flex lg:items-center lg:justify-center lg:gap-7">
          {/* Desktop LEFT rail */}
          <div className="hidden lg:flex lg:flex-col lg:gap-3.5">
            {left.map(p => <PlayerPanelDesktop key={p.player} player={p} side="left"/>)}
          </div>

          {/* Board */}
          <div className={[
            'flex justify-center my-2 lg:my-0 transition-[filter]',
            overlay ? 'lg:[filter:blur(6px)]' : '',
          ].join(' ')}>
            <div className="w-full max-w-[600px] lg:max-w-[700px]">
              <div className="flex justify-center">
                <Board
                  size={10}
                  pieces={pieces}
                  centerZone={HILL_CENTER_ZONE}
                  cellSize={typeof window !== 'undefined' && window.innerWidth >= 1024 ? 56 : 33}
                  skinForPlayer={MOCK_SKINS}
                  selected={[2, 8]}
                  highlighted={[[3, 7], [3, 9]]}
                  ownPlayer={1}
                  isYourTurn={false}
                />
              </div>
            </div>
          </div>

          {/* Desktop RIGHT rail */}
          <div className="hidden lg:flex lg:flex-col lg:gap-3.5">
            {right.map(p => <PlayerPanelDesktop key={p.player} player={p} side="right"/>)}
          </div>
        </div>

        {/* MOBILE 2×2 panel */}
        <div className="lg:hidden px-1 mt-3">
          <div className="grid grid-cols-2 gap-1.5">
            {mobileAll.map(p => (
              <PlayerSlot
                key={p.player}
                player={p.player}
                name={p.name}
                tier={p.tier}
                you={p.you}
                isActive={p.isActive}
                secondsLeft={p.secondsLeft}
                secondsTotal={p.secondsTotal}
                eliminated={p.eliminated}
                skin={p.skin}
                compact
              />
            ))}
          </div>
        </div>

        {/* Hill status bar */}
        <div className="mt-4 lg:mt-6 flex justify-center px-3 lg:px-0">
          <div className="inline-flex items-center gap-3 lg:gap-4 px-3 lg:px-5 py-2 lg:py-2.5 rounded-full text-[11px] lg:text-xs tracking-[0.04em] lg:tracking-[0.06em]"
               style={{ background: 'rgba(191,255,0,0.04)', border: '1px solid rgba(191,255,0,0.2)' }}>
            <span className="inline-flex items-center gap-2 text-[var(--hill-muted)] font-mono">
              <span className="text-[var(--hill-accent)]">◆</span> ON HILL
            </span>
            <span className="w-px h-3.5 bg-[var(--hill-borderHi)]"/>
            <span className="inline-flex items-center gap-1"><PieceShape player={1} size={14} skin="gold"/><span className="font-mono text-[var(--hill-text)] font-bold">1</span></span>
            <span className="inline-flex items-center gap-1"><PieceShape player={2} size={14} skin="gold"/><span className="font-mono text-[var(--hill-text)] font-bold">1</span></span>
            <span className="inline-flex items-center gap-1"><PieceShape player={4} size={14} skin="master"/><span className="font-mono text-[var(--hill-text)] font-bold">1</span></span>
            <span className="w-px h-3.5 bg-[var(--hill-borderHi)] hidden lg:inline-block"/>
            <span className="hidden lg:inline-block font-mono text-[11px] text-[var(--hill-muted)] tracking-[0.1em]">3-WAY TIE</span>
          </div>
        </div>

        {/* Demo: trigger overlays */}
        <div className="hidden lg:flex justify-center gap-2 mt-6 font-mono text-[10px] text-[var(--hill-dim)] tracking-[0.14em]">
          <button onClick={() => setOverlay('death')}  className="underline-offset-2 hover:underline">DEMO · YOU DIED</button>
          <span>·</span>
          <button onClick={() => setOverlay('win-solo')}  className="underline-offset-2 hover:underline">SOLO WINNER</button>
          <span>·</span>
          <button onClick={() => setOverlay('win-joint')} className="underline-offset-2 hover:underline">JOINT KINGS</button>
          <span>·</span>
          <button onClick={() => setOverlay('win-none')}  className="underline-offset-2 hover:underline">NO KING</button>
        </div>
      </div>

      {overlay === 'death' && (
        <DeathOverlay
          round={3}
          eliminatedPlayer={{ player: 3, name: 'Sam', skin: 'bronze' }}
          onClose={() => setOverlay(null)}
          onSpectate={() => setOverlay(null)}
          onLeave={() => setOverlay(null)}
        />
      )}
      {overlay === 'win-solo' && (
        <GameOverOverlay
          kind="solo"
          winners={[{ player: 4, name: 'Riko', tier: 'Master', pieces: 7, skin: 'master', elo: 24 }]}
          onClose={() => setOverlay(null)}
          onPlayAgain={() => setOverlay(null)}
        />
      )}
      {overlay === 'win-joint' && (
        <GameOverOverlay
          kind="joint"
          winners={[
            { player: 1, name: 'Aida K.', tier: 'Gold',   pieces: 4, skin: 'gold',   elo: 16 },
            { player: 4, name: 'Riko',    tier: 'Master', pieces: 4, skin: 'master', elo: 16 },
          ]}
          onClose={() => setOverlay(null)}
          onPlayAgain={() => setOverlay(null)}
        />
      )}
      {overlay === 'win-none' && (
        <GameOverOverlay
          kind="none"
          winners={[]}
          onClose={() => setOverlay(null)}
          onPlayAgain={() => setOverlay(null)}
        />
      )}
    </>
);
}
// app/play/classic/page.tsx
'use client';
import { useState } from 'react';
import { TopBar } from '@/components/TopBar';
import { Board } from '@/components/Board';
import { PieceShape } from '@/components/PieceShape';
import { PlayerSlot } from '@/components/PlayerSlot';
import { ArenaBadge } from '@/components/ArenaBadge';
import type { Piece } from '@/lib/pieces';

const PIECES: Piece[] = [
{ player: 1, kind: 'pawn', pos: [5, 0] }, { player: 1, kind: 'pawn', pos: [5, 2] },
{ player: 1, kind: 'pawn', pos: [6, 1] }, { player: 1, kind: 'pawn', pos: [6, 3] },
{ player: 1, kind: 'pawn', pos: [6, 5] }, { player: 1, kind: 'pawn', pos: [6, 7] },
{ player: 1, kind: 'pawn', pos: [7, 0] }, { player: 1, kind: 'pawn', pos: [7, 2] },
{ player: 1, kind: 'king', pos: [4, 5] },
{ player: 2, kind: 'pawn', pos: [0, 1] }, { player: 2, kind: 'pawn', pos: [0, 3] },
{ player: 2, kind: 'pawn', pos: [0, 5] }, { player: 2, kind: 'pawn', pos: [1, 0] },
{ player: 2, kind: 'pawn', pos: [1, 4] }, { player: 2, kind: 'pawn', pos: [1, 6] },
{ player: 2, kind: 'pawn', pos: [2, 3] }, { player: 2, kind: 'pawn', pos: [3, 4] },
];

export default function ClassicPage() {
const [size] = useState<8>(8);

return (
<>
<TopBar
right={
<button className="px-2.5 py-1.5 rounded-lg bg-[var(--hill-surface)] border border-[var(--hill-border)] text-[11px] text-[var(--hill-muted)] tracking-[0.08em] font-bold lg:hover:border-[var(--hill-accent)] transition">
RESIGN
</button>
}
/>

      <div className="mx-auto w-full max-w-[1280px] px-3 lg:px-12 pt-3 lg:pt-7 pb-10 lg:pb-12">
        {/* Top status bar */}
        <div className="hidden lg:flex items-center justify-between mb-4">
          <button className="text-[13px] text-[var(--hill-muted)] hover:text-[var(--hill-text)] tracking-[0.04em]">← Back to menu</button>
          <span className="font-mono text-[11px] text-[var(--hill-muted)] tracking-[0.14em]">CLASSIC · 8×8 · 2P</span>
        </div>

        {/* Turn indicator above board */}
        <div className="flex justify-center mt-3 lg:mt-0 mb-4 lg:mb-5">
          <div className="inline-flex items-center gap-2.5 lg:gap-3.5 px-3.5 lg:px-5 py-2 lg:py-3 pl-2.5 lg:pl-4 rounded-full bg-[var(--hill-surface)] border-[1.5px] border-[var(--hill-accent)] text-[13px] lg:text-base font-bold shadow-[0_0_18px_rgba(191,255,0,0.12)] lg:shadow-[0_0_24px_rgba(191,255,0,0.15)]">
            <PieceShape player={1} size={22} skin="silver"/>
            <span>WHITE&apos;S TURN</span>
            <span className="w-px h-4 bg-[var(--hill-borderHi)] hidden lg:inline-block"/>
            <span className="font-mono text-[var(--hill-accent)] text-xs lg:text-base">0:07</span>
          </div>
        </div>

        {/* Board with side panels on desktop */}
        <div className="lg:flex lg:items-center lg:justify-center lg:gap-9">
          {/* Desktop P1 panel */}
          <div className="hidden lg:block">
            <ClassicSidePanel player={1} name="Aida K." tier="Gold" you isActive captured={3} pieces={9} skin="silver" alignment="right"/>
          </div>

          <div className="flex justify-center">
            <Board
              size={size}
              pieces={PIECES}
              cellSize={typeof window !== 'undefined' && window.innerWidth >= 1024 ? 66 : 41}
              skinForPlayer={{ 1: 'silver', 2: 'gold' }}
              selected={[4, 5]}
              highlighted={[[3, 4], [3, 6], [2, 3], [2, 7]]}
              lastMove={[[3, 4], [4, 5]]}
              ownPlayer={1}
              isYourTurn={true}
            />
          </div>

          <div className="hidden lg:block">
            <ClassicSidePanel player={2} name="Marcus J." tier="Gold" captured={4} pieces={8} skin="gold" alignment="left"/>
          </div>
        </div>

        {/* Mobile score row */}
        <div className="lg:hidden mt-5 px-7 flex justify-between font-mono text-xs text-[var(--hill-muted)] tracking-[0.04em]">
          <div className="flex items-center gap-2">
            <PieceShape player={1} size={16} skin="silver"/>
            <span className="text-[var(--hill-text)] font-bold">9</span> · captured 3
          </div>
          <div className="flex items-center gap-2">
            captured 4 · <span className="text-[var(--hill-text)] font-bold">8</span>
            <PieceShape player={2} size={16} skin="gold"/>
          </div>
        </div>

        {/* Desktop move history strip */}
        <div className="hidden lg:flex justify-center mt-7">
          <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-[var(--hill-surface)] border border-[var(--hill-border)] font-mono text-xs text-[var(--hill-muted)] tracking-[0.06em]">
            <span className="text-[var(--hill-dim)]">MOVES</span>
            <span className="w-px h-3.5 bg-[var(--hill-border)]"/>
            {['1. c3-d4','d6-c5','2. e3-f4','b6-a5','3. f4×e5','— ←'].map((m, i) => (
              <span key={i} className={i === 5 ? 'text-[var(--hill-accent)] font-bold' : 'text-[var(--hill-text)] font-medium'}>{m}</span>
            ))}
          </div>
        </div>

        {/* Mobile-only: ensure PlayerSlot is referenced once so tree-shaking keeps it; remove if not used. */}
        <div className="hidden">
          <PlayerSlot player={1} name="Aida" tier="Gold" skin="silver"/>
          <ArenaBadge tier="Gold"/>
        </div>
      </div>
    </>
);
}

interface SidePanelProps {
player: 1 | 2;
name: string;
tier: 'Bronze' | 'Silver' | 'Gold' | 'Master' | 'Champion';
skin: 'bronze' | 'silver' | 'gold' | 'master' | 'champion';
you?: boolean;
isActive?: boolean;
captured: number;
pieces: number;
alignment: 'left' | 'right';
}

function ClassicSidePanel({ player, name, tier, skin, you, isActive, captured, pieces, alignment }: SidePanelProps) {
return (
<div
className={[
'relative w-[240px] bg-[var(--hill-surface)] border-[1.5px] rounded-2xl p-5 flex flex-col gap-4',
isActive
? 'border-[var(--hill-accent)] shadow-[0_0_28px_rgba(191,255,0,0.15)]'
: 'border-[var(--hill-border)]',
].join(' ')}
>
<div
className={`absolute top-0 bottom-0 w-[3px] ${alignment === 'right' ? 'right-0' : 'left-0'}`}
style={{ background: player === 1 ? 'var(--hill-text)' : '#1A1A1A' }}
/>
<div className="flex items-center gap-3.5">
<div className="w-[60px] h-[60px] rounded-xl bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[var(--hill-border)] flex items-center justify-center">
<PieceShape player={player} size={42} skin={skin}/>
</div>
<div className="flex-1 min-w-0">
<div className="flex items-center gap-1.5">
<span className="text-base font-bold whitespace-nowrap">{name}</span>
{you && <span className="text-[9px] font-extrabold text-[var(--hill-accent)] tracking-[0.1em]">YOU</span>}
</div>
<div className="mt-1.5"><ArenaBadge tier={tier}/></div>
</div>
</div>

      <div className="flex flex-col gap-1.5 px-3.5 py-3 bg-[var(--hill-surface2)] rounded-[10px] border border-[var(--hill-border)]">
        <div className="flex justify-between items-center">
          <span className="font-mono text-[10px] text-[var(--hill-muted)] tracking-[0.14em]">PIECES</span>
          <span className="font-mono text-[22px] font-extrabold text-[var(--hill-text)]">{pieces}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-mono text-[10px] text-[var(--hill-muted)] tracking-[0.14em]">CAPTURED</span>
          <span className="font-mono text-base font-bold text-[var(--hill-accent)]">{captured}</span>
        </div>
      </div>

      {isActive && (
        <div className="text-center font-mono text-[10px] font-bold text-[var(--hill-accent)] tracking-[0.2em]">
          ● ACTIVE TURN
        </div>
      )}
    </div>
);
}
That's the full export. What you got across both parts:

Group	Count	Notes
lib/* + hooks	5	Tokens, skins, tiers, mid-game position, useMediaQuery (only needed for runtime swaps; Tailwind covers everything else)
Updated mobile components	14	Every one preserves its 375px behavior; lg: overrides bolt on desktop
New desktop-only components	4	TopNav, LeaderboardTable, PlayerPanelDesktop, QrCode
Pages	8	Landing, login, profile, leaderboard, mode, play-style, room (lobby+game), classic
Wiring summary:

TopNav and BottomNav both mount in layout.tsx; their own hidden lg:flex / lg:hidden makes them swap cleanly.
useIsDesktop is exported but only the room/classic pages read window.innerWidth to size the board's cellSize — everything else uses pure Tailwind responsive classes.
Leaderboard renders both LeaderboardRow (mobile) and LeaderboardTable (desktop) and toggles via hidden lg:block / lg:hidden per the exception in your spec.
Hill game does the same split between PlayerSlot (2×2 mobile grid) and PlayerPanelDesktop (vertical rails).
Install: npm i qrcode.react is the only new dep. Everything else uses Tailwind + Next core.

Verify at 375 / 768 / 1280 / 1920: mobile is preserved (no lg: rules touch the 375 layout); tablet 768 gracefully transitions (sm: kicks in at 640 for two-up grids in a couple of places like lobby slots); 1280 is the design target; 1920 caps content at max-w-[1280px] mx-auto so it letterboxes instead of stretching.