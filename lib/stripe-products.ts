// Maps our premium skin IDs to Stripe Price IDs.
// Replace the `price_REPLACE_*` placeholders with the real Price IDs from the
// Stripe dashboard (Products → each skin → API ID, looks like `price_1Q...`).
// Test-mode price IDs are fine while STRIPE_SECRET_KEY is an sk_test_ key.
export const PREMIUM_SKIN_PRICES: Record<
  string,
  { priceId: string; displayName: string; priceUsd: number }
> = {
  neon_glow: {
    priceId: 'price_REPLACE_WITH_NEON_GLOW_ID',
    displayName: 'Neon Glow',
    priceUsd: 1.99,
  },
  galaxy: {
    priceId: 'price_REPLACE_WITH_GALAXY_ID',
    displayName: 'Galaxy',
    priceUsd: 2.99,
  },
  royal_gold: {
    priceId: 'price_REPLACE_WITH_ROYAL_GOLD_ID',
    displayName: 'Royal Gold',
    priceUsd: 4.99,
  },
};

export type PremiumSkinId = keyof typeof PREMIUM_SKIN_PRICES;

export const isPremiumSkin = (id: string): id is PremiumSkinId =>
  Object.prototype.hasOwnProperty.call(PREMIUM_SKIN_PRICES, id);
