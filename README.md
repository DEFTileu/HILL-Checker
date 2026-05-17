# HILL — King of the Board

**Live:** https://hill.javazhan.tech
**GitHub:** https://github.com/DEFTileu/HILL-Checker
**Built for:** nFactorial Incubator 2026 (24-hour checkers challenge)

---

## What we built

A web platform for checkers **with a brand-new game mode — 4-player King of the Hill**. The checkers market has thousands of classic clones; we added **a mechanic nobody else has**: 4 players start from the corners of a 10×10 board, race to the center 2×2 zone ("the Hill"), promote to kings by entering the center, and the game ends with **either the last survivor OR all players holding the Hill** at the end of round 7 — meaning **multiple winners are possible simultaneously ("Joint Kings")**.

**Three game modes powered by one engine:**
- **Classic 2P** — standard checkers, 8×8
- **Hill Blitz** — 4 players, 7 rounds, multi-king victory possible
- **Hill Survival** — 4 players, last alive wins (20-round safety cap)

**Multiplayer over shareable links** for every mode (Classic 2P + Hill 4P) via Supabase Realtime. Create a room → share a QR code or 4-letter invite code → friends join from their phones. **10-second disconnect grace period** (return within 10s and your pieces are intact; longer and they burn).

---

## Who it's for

- **TikTok/Reels audience, 16–25** — fast 3-minute blitz matches with a built-in result share button
- **Friends at parties** — 4 people with phones in the same room, zero app installs (web-only, QR code right in the lobby)
- **Streamers and casual esports** — multiplayer with real ELO rating, premium skins, leaderboard
- **Casual players** — mobile-first, one-thumb playable

---

## Why it's valuable (business signals for the jury)

**1. Unique mechanic = built-in virality.**
4-player King of the Hill in checkers is **a new genre** — inherently TikTok-shareable. The "Joint Kings" outcome (multiple winners) creates memetic moments like "we made a pact and both won" — impossible in classic checkers.

**2. Real, working monetization.**
- **Full Stripe integration is wired and functional** (test mode for jury demo): 3 premium skins at $1.99 / $2.99 / $4.99, webhook grants the skin to the user's account after payment, with proper signature verification on the webhook endpoint.
- Test card: `4242 4242 4242 4242` — judges can run the full purchase flow end-to-end.

**3. Retention mechanics.**
- Anonymous auth (instant play, zero friction) + Google OAuth upgrade for cross-device sync (`linkIdentity` with graceful fallback when the same Google account is reused across devices).
- **Real ELO rating system** (K=32 pairwise updates, +24/-24 for equal-rated, correct handling of multi-winner Hill matches).
- 5 arena tiers (Bronze → Silver → Gold → Master → Champion) — each unlocks a new piece skin at the threshold.
- Top 100 leaderboard sorted by ELO with client-side search.

**4. Mobile-first product.**
Core audience is on phones, so every screen is designed at 375px first, with `safe-area-inset`, 44px minimum touch targets, and QR-code-driven mobile invites. Desktop is a real adaptation (side rails, table leaderboard, hover states) — not a stretched portrait page.

---

## What makes the product technically serious

- **Pure-TypeScript engine** in `lib/engine/` — zero React/network coupling, runnable in Node. The same engine drives all 3 modes through `GameConfig` presets, AND the same engine drives both hot-seat and multiplayer (no duplicated logic).
- **80+ unit tests** cover the rules engine (multi-jump chains, mandatory capture, ELO formula, win conditions across all three modes).
- **Realtime sync** via Supabase channels (Presence + Broadcast) **with no DB writes per move** — only a snapshot for rejoin and a final `recordGame` POST that registers all participants (winners AND losers, so the leaderboard reflects actual play).
- **Colorblind accessibility** — each player has a unique **shape** (circle / square / triangle / hexagon), not just a color. Skins are decorators on top of the shape (the shape stays constant, you always know whose piece is whose).
- **Stripe webhook with signature verification** (rejects forged events). Service-role keys are server-only — never shipped to the client.
- Deployed on Vercel with a custom domain (`hill.javazhan.tech`).

---

## Tech stack

- Next.js 14 (App Router) + TypeScript (strict mode) + Tailwind CSS
- Supabase (Auth + Postgres + Realtime channels)
- Stripe (Checkout sessions + Webhooks)
- Vercel for hosting and CI

## Local dev

```bash
npm install

# 1. Create a Supabase project and run lib/db/schema.sql in the SQL editor
# 2. Configure .env.local:
#    NEXT_PUBLIC_SUPABASE_URL
#    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
#    SUPABASE_SERVICE_ROLE_KEY
#    STRIPE_SECRET_KEY
#    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
#    STRIPE_WEBHOOK_SECRET
#    NEXT_PUBLIC_APP_URL

npm run dev