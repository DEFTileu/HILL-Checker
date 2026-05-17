// Stripe webhook: grants a premium skin once a Checkout Session is paid.
//
// runtime='nodejs' is REQUIRED — signature verification needs the raw request
// body, which the Edge runtime can mangle. Never switch this to edge.
//
// Deviations from the task spec: imports `getServiceClient` (the real export;
// `getSupabase` does not exist server-side) and omits `apiVersion` (stripe@22
// types it as the literal LatestApiVersion, so '2024-06-20' fails TS-strict).
import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/multiplayer/server';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '');
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? '';

export async function POST(req: Request) {
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'No sig' }, { status: 400 });
  }

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const { userId, skinId } = session.metadata ?? {};
    if (!userId || !skinId) {
      console.error('Missing metadata in checkout session');
      return NextResponse.json({ received: true });
    }

    const supa = getServiceClient();
    const { data: profile, error: readErr } = await supa
      .from('profiles')
      .select('owned_skins')
      .eq('id', userId)
      .single();
    if (readErr) {
      console.error('Profile read error:', readErr);
      return NextResponse.json({ error: 'DB error' }, { status: 500 });
    }

    const currentSkins = (profile?.owned_skins as string[] | undefined) ?? [];
    if (!currentSkins.includes(skinId)) {
      const { error: updateErr } = await supa
        .from('profiles')
        .update({ owned_skins: [...currentSkins, skinId] })
        .eq('id', userId);
      if (updateErr) {
        console.error('Skin grant error:', updateErr);
        return NextResponse.json({ error: 'Grant failed' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
