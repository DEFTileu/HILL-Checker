'use client';

import type { User } from '@supabase/supabase-js';
import { getSupabase } from '@/lib/multiplayer/client';
import { getArenaTier } from '@/lib/arena';
import { STARTING_ELO } from '@/lib/elo';
import type { Profile } from '@/lib/game-ui';
import type { SkinId } from '@/lib/skins';

// Raw DB shape (snake_case). The app-wide `Profile` type (types/hill.ts) is
// camelCase and carries derived fields (arenaTier, elo) that have no column.
interface ProfileRow {
  id: string;
  display_name: string;
  total_wins: number;
  total_games: number;
  elo: number;
  skin_id: string;
  owned_skins: string[] | null;
  is_anonymous: boolean;
  created_at: string;
}

const randomName = () =>
  'Player_' + Math.random().toString(16).slice(2, 6).padEnd(4, '0');

function toProfile(row: ProfileRow, authUser: User | null): Profile {
  return {
    id: row.id,
    displayName: row.display_name,
    // email only exists once the anonymous user has linked a real identity
    // (Google). Anonymous users have no email — this drives the guest vs
    // signed-in UI distinction.
    email:
      authUser && authUser.is_anonymous === false && authUser.email
        ? authUser.email
        : undefined,
    totalWins: row.total_wins,
    totalGames: row.total_games,
    // Pre-migration rows have no elo column → fall back to the 1000 floor.
    arenaTier: getArenaTier(row.elo ?? STARTING_ELO),
    selectedSkin: (row.skin_id as SkinId) ?? 'bronze',
    elo: row.elo ?? STARTING_ELO,
    // Pre-migration rows (no owned_skins column) → empty list.
    ownedSkins: row.owned_skins ?? [],
  };
}

// Idempotent: returns the existing profile, or creates one if the DB trigger
// hasn't (e.g. trigger not installed). Safe to call on every session start.
export async function ensureProfile(authUser: User): Promise<Profile> {
  const sb = getSupabase();

  // A linked (Google) account reports is_anonymous === false. Anonymous guests
  // report true (or undefined on older sessions). This drives the
  // authorized-only leaderboard filter.
  const authorized = authUser.is_anonymous === false;

  const { data: existing } = await sb
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle();

  if (existing) {
    const row = existing as ProfileRow;
    // Promote to authorized the first time we see a linked session (e.g. the
    // user just linked Google — onAuthStateChange re-runs this). We only ever
    // flip true → false; a signed-out user becomes a brand-new anon id anyway.
    if (authorized && row.is_anonymous !== false) {
      const { data: upd } = await sb
        .from('profiles')
        .update({ is_anonymous: false })
        .eq('id', authUser.id)
        .select('*')
        .single();
      if (upd) return toProfile(upd as ProfileRow, authUser);
    }
    return toProfile(row, authUser);
  }

  const { data: created, error } = await sb
    .from('profiles')
    .insert({
      id: authUser.id,
      display_name: randomName(),
      is_anonymous: !authorized,
    })
    .select('*')
    .single();

  if (error) throw error;
  return toProfile(created as ProfileRow, authUser);
}

export async function getProfile(authUser: User): Promise<Profile | null> {
  const sb = getSupabase();
  const { data } = await sb
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle();
  return data ? toProfile(data as ProfileRow, authUser) : null;
}

export async function updateDisplayName(
  authUser: User,
  name: string,
): Promise<Profile> {
  const sb = getSupabase();
  const trimmed = name.trim().slice(0, 24) || randomName();
  const { data, error } = await sb
    .from('profiles')
    .update({ display_name: trimmed })
    .eq('id', authUser.id)
    .select('*')
    .single();
  if (error) throw error;
  return toProfile(data as ProfileRow, authUser);
}

export async function updateSkin(
  authUser: User,
  skin: SkinId,
): Promise<Profile> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('profiles')
    .update({ skin_id: skin })
    .eq('id', authUser.id)
    .select('*')
    .single();
  if (error) throw error;
  return toProfile(data as ProfileRow, authUser);
}

// "Reset account" — zero the stats and revert to the default skin. Keeps the
// same auth identity (and therefore the same row / display name).
export async function resetProfile(authUser: User): Promise<Profile> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('profiles')
    .update({ total_wins: 0, total_games: 0, skin_id: 'bronze' })
    .eq('id', authUser.id)
    .select('*')
    .single();
  if (error) throw error;
  return toProfile(data as ProfileRow, authUser);
}
