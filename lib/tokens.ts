// lib/tokens.ts
// HILL design tokens — single source of truth for colors + type stacks.
// Tailwind references these via arbitrary values, e.g. text-[var(--hill-accent)].
// CSS variables are injected globally in app/globals.css.

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
