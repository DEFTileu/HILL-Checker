'use client';

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { User } from '@supabase/supabase-js';
import { getSupabase } from '@/lib/multiplayer/client';
import {
  ensureProfile,
  updateDisplayName as dbUpdateName,
  updateSkin as dbUpdateSkin,
  resetProfile as dbResetProfile,
} from '@/lib/db/profiles';
import type { Profile } from '@/lib/game-ui';
import type { SkinId } from '@/lib/skins';

// ─── Raw auth functions ──────────────────────────────────────────────────────

export async function signInAnonymously(): Promise<User | null> {
  const sb = getSupabase();
  const { data, error } = await sb.auth.signInAnonymously();
  if (error) throw error;
  return data.user;
}

export async function getCurrentUser(): Promise<User | null> {
  const { data } = await getSupabase().auth.getUser();
  return data.user;
}

// Upgrade the current anonymous user to a Google-linked account (keeps the
// same user_id → wins/skin carry over). If the user already has a real
// identity, fall back to a normal OAuth sign-in.
export async function signInWithGoogle(): Promise<void> {
  const sb = getSupabase();
  const redirectTo =
    typeof window !== 'undefined'
      ? `${window.location.origin}/profile`
      : undefined;

  const { data } = await sb.auth.getUser();

  // Anonymous user → try to link Google so wins/ELO/skin carry over.
  if (data.user?.is_anonymous) {
    const { error } = await sb.auth.linkIdentity({
      provider: 'google',
      options: { redirectTo },
    });
    // Success: the browser is redirecting to Google's consent screen.
    if (!error) return;

    // This Google account is already linked to a different (orphaned)
    // anonymous user — Supabase refuses to link it twice. Fall back to a
    // plain sign-in into that existing account; the current anonymous
    // guest progress is discarded (it was never claimed anyway).
    if (
      error.code === 'identity_already_exists' ||
      error.message?.includes('already linked')
    ) {
      console.warn(
        '[auth] identity already exists — falling back to plain OAuth; ' +
          'anonymous progress will be discarded',
      );
      await sb.auth.signOut();
      const { error: oauthError } = await sb.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      });
      if (oauthError) throw oauthError;
      return;
    }

    // Any other linking error is unexpected — surface it.
    throw error;
  }

  // Not signed in, or already a non-anonymous account → plain OAuth.
  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  });
  if (error) throw error;
}

// Plain Google OAuth with NO identity-linking attempt. Used to recover from
// a post-redirect `identity_already_exists`: signs the user straight into the
// existing Google-linked profile (the orphaned anonymous session is replaced).
// Deterministic — because it never calls linkIdentity it cannot re-trigger
// the same conflict, so it can't loop.
export async function signInToLinkedGoogle(): Promise<void> {
  const sb = getSupabase();
  const redirectTo =
    typeof window !== 'undefined'
      ? `${window.location.origin}/profile`
      : undefined;
  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  });
  if (error) throw error;
}

// Sign out of the linked account. The provider immediately re-establishes a
// fresh anonymous guest session so the app always has a profile.
export async function signOut(): Promise<void> {
  await getSupabase().auth.signOut();
}

// ─── React context ───────────────────────────────────────────────────────────

interface AuthValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refresh: () => Promise<void>;
  changeName: (name: string) => Promise<void>;
  selectSkin: (skin: SkinId) => Promise<void>;
  resetAccount: () => Promise<void>;
  linkGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const bootstrapped = useRef(false);

  const loadProfile = useCallback(async (u: User | null) => {
    if (!u) {
      setProfile(null);
      return;
    }
    try {
      setProfile(await ensureProfile(u));
    } catch (e) {
      console.error('[auth] ensureProfile failed', e);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    const sb = getSupabase();
    let active = true;

    (async () => {
      const { data } = await sb.auth.getSession();
      let sessionUser = data.session?.user ?? null;
      // Auto-anonymous sign-in on first visit.
      if (!sessionUser) {
        try {
          sessionUser = await signInAnonymously();
        } catch (e) {
          console.error('[auth] anonymous sign-in failed', e);
        }
      }
      if (!active) return;
      setUser(sessionUser);
      await loadProfile(sessionUser);
      setLoading(false);
      bootstrapped.current = true;
    })();

    const { data: sub } = sb.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      const u = session?.user ?? null;

      if (event === 'SIGNED_OUT') {
        // Return to a fresh guest rather than a session-less app.
        setUser(null);
        setProfile(null);
        signInAnonymously()
          .then((nu) => {
            if (!active) return;
            setUser(nu);
            return loadProfile(nu);
          })
          .catch((e) => console.error('[auth] re-anon failed', e));
        return;
      }

      setUser(u);
      // Skip the initial event — the bootstrap above already loaded the
      // profile; this avoids a duplicate ensureProfile round-trip.
      if (bootstrapped.current) void loadProfile(u);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const refresh = useCallback(async () => {
    const u = await getCurrentUser();
    setUser(u);
    await loadProfile(u);
  }, [loadProfile]);

  const changeName = useCallback(
    async (name: string) => {
      if (!user) return;
      setProfile(await dbUpdateName(user, name));
    },
    [user],
  );

  const selectSkin = useCallback(
    async (skin: SkinId) => {
      if (!user) return;
      setProfile(await dbUpdateSkin(user, skin));
    },
    [user],
  );

  const resetAccount = useCallback(async () => {
    if (!user) return;
    setProfile(await dbResetProfile(user));
  }, [user]);

  const value: AuthValue = {
    user,
    profile,
    loading,
    refresh,
    changeName,
    selectSkin,
    resetAccount,
    linkGoogle: signInWithGoogle,
    logout: signOut,
  };

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}

// Convenience hooks named per the spec (§6).
export function useUser() {
  return useAuth().user;
}
export function useProfile() {
  return useAuth().profile;
}
