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
