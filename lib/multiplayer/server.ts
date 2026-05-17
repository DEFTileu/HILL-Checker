// SERVER ONLY. Never add 'use client'. Never import from a component or from
// lib/multiplayer/client.ts. Holds the service-role key.
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  '';

let svc: SupabaseClient | null = null;

/** Service-role client. Bypasses RLS — use only in API route handlers. */
export function getServiceClient(): SupabaseClient {
  if (!svc) {
    if (!URL || !SERVICE_KEY) {
      throw new Error(
        'Supabase service env missing: set SUPABASE_SERVICE_ROLE_KEY in .env.local',
      );
    }
    svc = createClient(URL, SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return svc;
}

/** Resolve the caller from an `Authorization: Bearer <jwt>` header. */
export async function getUserFromRequest(
  req: Request,
): Promise<{ id: string } | null> {
  const header = req.headers.get('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token || !URL || !ANON_KEY) return null;
  const anon = createClient(URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await anon.auth.getUser(token);
  if (error || !data.user) return null;
  return { id: data.user.id };
}
