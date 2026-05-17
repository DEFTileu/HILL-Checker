// lib/use-theme.ts
'use client';
import { useCallback, useSyncExternalStore } from 'react';
import type { ThemeName } from '@/lib/tokens';

export const THEME_STORAGE_KEY = 'hill-theme';
export const DEFAULT_THEME: ThemeName = 'dark';
const CHANGE_EVENT = 'hill-theme-change';

/** Browser-chrome color shown behind the status bar / address bar. */
const THEME_COLOR: Record<ThemeName, string> = {
  dark: '#0A0A0A',
  light: '#F4F1EA',
};

/** Current theme from the DOM (stamped by the no-flash script + applyTheme). */
function currentTheme(): ThemeName {
  if (typeof document === 'undefined') return DEFAULT_THEME;
  const t = document.documentElement.dataset.theme;
  return t === 'light' ? 'light' : 'dark';
}

/** Apply a theme to the DOM + persist it. */
export function applyTheme(theme: ThemeName) {
  document.documentElement.dataset.theme = theme;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* private mode / storage disabled — theme still applies for the session */
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', THEME_COLOR[theme]);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(onChange: () => void) {
  // Same-tab toggles fire CHANGE_EVENT; other tabs fire `storage`.
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

/**
 * Manual light/dark switch, default dark, persisted to localStorage.
 * Only the chrome re-skins — the board + cinematic overlays force their own
 * dark scope (see app/globals.css + Board/DeathOverlay/GameOverOverlay).
 *
 * useSyncExternalStore keeps SSR ('dark') and the post-hydration DOM value
 * in sync without a setState-in-effect or a hydration mismatch.
 */
export function useTheme() {
  const theme = useSyncExternalStore(
    subscribe,
    currentTheme,
    () => DEFAULT_THEME,
  );

  const setTheme = useCallback((next: ThemeName) => applyTheme(next), []);
  const toggleTheme = useCallback(
    () => applyTheme(currentTheme() === 'dark' ? 'light' : 'dark'),
    [],
  );

  return { theme, setTheme, toggleTheme } as const;
}
