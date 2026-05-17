# HILL — King of the Board

Browser-native blitz checkers with two modes:

- **Classic 2P** — standard checkers on an 8×8 board, hot-seat on one device.
- **King of the Hill 4P** — a 10×10 mode where four players race from the
  corners to a central 2×2 "Hill", king by entering the center, and win by
  holding the hill when the round cap hits — or by being the last survivor.

## Modes & rules

- **classic-2p** — 8×8, 2 players, capture all opponent pieces to win. Kings
  on the opposite edge.
- **hill-blitz** — 10×10, 4 players (5 pieces each from each corner), 2×2
  center zone, king on center entry, max 7 rounds. Multiple winners possible:
  anyone with a piece in the center at the cap, or the last survivor.
- **hill-survival** — same as blitz but max 20 rounds; only the last survivor
  wins (if the cap is reached, anyone in the center wins, else draw).
- A **round** = one full cycle of all currently-alive players moving once.
- **Turn timer**: 10s per turn. Expiry skips the turn (no elimination).
- **Elimination** only when a player has zero pieces.

Multiplayer is trust-the-client for MVP: each client runs the pure engine
locally and broadcasts moves over Supabase Realtime.

## Stack

Next.js 14 (App Router), TypeScript (strict), Tailwind CSS, Supabase
(anonymous auth + Postgres + Realtime), Vitest. Deploys on Vercel.

## Architecture

- `lib/engine/*` — pure TypeScript rules engine. No React, no Supabase.
  All rules live in `lib/engine/rules.ts` + `apply.ts`. Both modes run off
  `GameConfig` presets in `lib/engine/presets.ts`.
- `lib/game-ui-view.ts` — pure mapper: engine `GameState` → `GameView` props.
- `components/GameView.tsx` — one presentational game screen used by Classic
  hot-seat, Hill hot-seat, and the multiplayer room.
- `app/r/[roomId]` — multiplayer room (lobby + live game via Supabase).

## Local development

```bash
npm install
cp .env.example .env.local   # fill in your Supabase keys
npm run dev                  # http://localhost:3000
```

Scripts: `npm run dev`, `npm run build`, `npm start`, `npm run lint`,
`npm test` (Vitest).

### Supabase setup

Create a Supabase project, then apply the schema described in
`docs/phase-3-supabase-setup.md` and `docs/phase-4-multiplayer-setup.md`
(the `rooms` and `games` tables + Realtime). Put the URL and keys in
`.env.local` (see `.env.example`).

## Deploy (Vercel)

1. Push this repo to GitHub and "Import Project" in Vercel.
2. In Vercel → Project → Settings → Environment Variables, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` — **server-side only**, never `NEXT_PUBLIC_`.
   - `NEXT_PUBLIC_SITE_URL` — your production origin (for OG image URLs).
3. Ensure the Supabase project schema (above) is applied and Realtime is on.
4. Build command `next build`, output auto-detected. Deploy.
5. After first deploy, set `NEXT_PUBLIC_SITE_URL` to the real domain and
   redeploy so social/OG previews resolve absolute URLs.

## Testing

`npm test` runs the engine + view-model unit suites. Multiplayer realtime is
verified manually against a live Supabase project (see Supabase setup).
