'use client';

import { getSupabase } from '@/lib/multiplayer/client';

// Starts a Stripe Checkout for a premium skin. Sends the caller's access
// token so the API route can authorize the buyer (the route derives userId
// from the JWT — see app/api/checkout/create/route.ts). On success the caller
// should redirect the browser to the returned Stripe-hosted URL.
export async function startSkinCheckout(
  skinId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data } = await getSupabase().auth.getSession();
  const token = data.session?.access_token ?? '';
  let res: Response;
  try {
    res = await fetch('/api/checkout/create', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ skinId }),
    });
  } catch {
    return { ok: false, error: 'Network error — try again.' };
  }
  const json = (await res.json().catch(() => ({}))) as {
    url?: string;
    error?: string;
  };
  if (!res.ok || !json.url) {
    return { ok: false, error: json.error ?? `Checkout failed (${res.status}).` };
  }
  window.location.href = json.url;
  return { ok: true };
}
