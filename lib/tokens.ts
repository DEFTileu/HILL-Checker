// lib/tokens.ts
// HILL design tokens — single source of truth for colors + type stacks.
// Tailwind references these via arbitrary values, e.g. text-[var(--hill-accent)].
// CSS variables are injected globally in app/globals.css.

// DARK theme — also the canonical constant for theme-INDEPENDENT surfaces.
// Board.tsx and the cinematic overlays read these inline, which is exactly
// why they stay dark in both themes (spec §00/§D): JS constants don't flip.
// Chrome that should re-skin must use the CSS vars (var(--hill-*) /
// Tailwind bg-hill-*), never these constants.
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
  accentInk: '#BFFF00',
  accentFill: '#BFFF00',
  accentTint: 'rgba(191,255,0,0.12)',
  accentDim: 'rgba(191,255,0,0.12)',
  onAccent: '#0A0A0A',
  danger: '#FF3B30',
  dangerTint: 'rgba(255,59,48,0.12)',
  navBg: 'rgba(10,10,10,0.85)',
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

// LIGHT theme tokens (spec "SUMMARY · COPY-PASTE"). Reference/source of
// truth mirrored by the [data-theme='light'] block in app/globals.css.
// Chrome reads these via CSS vars, not this object — exported for parity,
// design tooling, and any future server-rendered theming.
export const HILL_LIGHT = {
  bg: '#F4F1EA',
  surface: '#FFFFFF',
  surface2: '#FBF8F1',
  border: '#E1DCD0',
  borderHi: '#CFC8B7',
  text: '#0A0A0A',
  muted: '#6B6B6B',
  dim: '#9A9A9A',
  accent: '#4A7A00', // generic accent resolves to the legible ink on light
  accentInk: '#4A7A00',
  accentFill: '#BFFF00',
  accentTint: 'rgba(74,122,0,0.08)',
  accentDim: 'rgba(74,122,0,0.08)',
  onAccent: '#0A0A0A',
  danger: '#C8201A',
  dangerTint: '#FFE0DC',
  navBg: 'rgba(255,255,255,0.82)',
  // Player + tier colors — IDENTICAL to dark (theme-independent).
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

export type ThemeName = 'dark' | 'light';
export const THEMES = { dark: HILL, light: HILL_LIGHT } as const;

export const FONT = {
  sans: 'var(--font-inter)',
  mono: 'var(--font-jetbrains-mono)',
} as const;

export type PlayerNum = 1 | 2 | 3 | 4;
/** Spec §6 name for PlayerNum (identical union). */
export type Player = PlayerNum;
export const PLAYER_COLORS: Record<PlayerNum, string> = {
  1: HILL.p1,
  2: HILL.p2,
  3: HILL.p3,
  4: HILL.p4,
};
