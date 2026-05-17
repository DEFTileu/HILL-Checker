'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Singleton browser Supabase client. The project's `.env.local` uses the
// newer Supabase key naming (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`), with a
// fallback to the legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` for compatibility.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  '';

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!client) {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      throw new Error(
        'Supabase env missing: set NEXT_PUBLIC_SUPABASE_URL and ' +
          'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local',
      );
    }
    client = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return client;
}
