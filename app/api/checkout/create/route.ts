// Creates a Stripe Checkout Session for a single premium-skin purchase.
//
// Deviations from the original task spec, all deliberate:
//  • Imports `getServiceClient` (the real export) — `getSupabase` does not
//    exist in lib/multiplayer/server.ts.
//  • Derives the buyer from the `Authorization: Bearer <jwt>` header via
//    `getUserFromRequest` instead of trusting a `userId` in the body. This
//    matches the existing API convention (see app/api/games/route.ts) and
//    stops a client from minting a checkout that grants a skin to someone
//    else's account.
//  • Omits `apiVersion` — stripe@22 types `apiVersion` as the literal
//    `LatestApiVersion`, so the spec's '2024-06-20' is a TS-strict compile
//    error. The SDK pins its own pinned version internally.
import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { PREMIUM_SKIN_PRICES, isPremiumSkin } from '@/lib/stripe-products';
import { getServiceClient, getUserFromRequest } from '@/lib/multiplayer/server';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '');

export async function POST(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  let skinId: string | undefined;
  try {
    ({ skinId } = (await req.json()) as { skinId?: string });
  } catch {
    return NextResponse.json({ error: 'Bad body' }, { status: 400 });
  }
  if (!skinId || !isPremiumSkin(skinId)) {
    return NextResponse.json({ error: 'Unknown skin' }, { status: 400 });
  }

  const supa = getServiceClient();
  const { data: profile } = await supa
    .from('profiles')
    .select('owned_skins')
    .eq('id', user.id)
    .single();
  if ((profile?.owned_skins as string[] | undefined)?.includes(skinId)) {
    return NextResponse.json({ error: 'Already owned' }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      { price: PREMIUM_SKIN_PRICES[skinId].priceId, quantity: 1 },
    ],
    success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/profile?canceled=1`,
    // The webhook trusts these — userId comes from the verified JWT above,
    // never from client input.
    metadata: { userId: user.id, skinId },
  });

  return NextResponse.json({ url: session.url });
}
