# HILL — "Ship It" Design

**Date:** 2026-05-17
**Status:** Approved (design), pending implementation plan
**Goal:** Make HILL look and behave like a shipped product — playable Classic 2P, a
polished live game view, a working create-room flow, branding/OG, a real README,
and Vercel deploy preparation.

## Background

The codebase is further along than the original task brief implies. A prior
"consolidation" refactor already:

- Wired flat Claude Design components (`components/*`) into the landing page,
  the multiplayer room page, and a static Classic mockup.
- Gave `Board.tsx` a move animation (`transition-[top,left] 200ms ease-out`).
- Left `app/favicon.ico` as the stock create-next-app icon.

The real, remaining gaps:

1. `/play/classic` is a **static visual mockup** — hardcoded pieces, fake timer
   and move history, no engine, not interactive.
2. The live multiplayer game view at `/r/[roomId]` **works** (fully engine-wired,
   Supabase realtime, forfeit/sync/disconnect handling) but is **visually bare**:
   a mono text header plus a raw `<Board>`, none of the designed chrome.
3. `/play/hill/page.tsx` is a **temporary inline playtest harness** (raw divs,
   `system-ui` font, `window.alert`) — engine-wired but unshippable, and now
   orphaned (landing routes to `/play/hill/mode`, real games run at `/r/[roomId]`).
4. **Broken create-room flow:** the landing "Create Hill Room" → `/play/hill/mode`
   → `/play/hill/style`, whose Continue button does
   `router.push('/r/ABCD?mode=…&style=…')` — a **hardcoded fake room id** that
   never exists, so the advertised primary CTA dead-ends in "Room not found".
   The `hotseat` option in the same screen also leads nowhere real.
5. No Open Graph / Twitter image, no brand icon, default boilerplate `README.md`,
   no deploy preparation or documented env vars.

The engine (`lib/engine/*`) is pure and already exposes a `classic2P` preset
alongside `hillBlitz` / `hillSurvival`, with a green vitest suite
(apply/endgame/forfeit/rules/hill).

## Architecture rule (must hold)

Per `CLAUDE.md`: `lib/engine/*` stays pure (no React, no Supabase); all rules live
only in `lib/engine/rules.ts` + `apply.ts`; the same engine serves both modes via
`GameConfig` presets; components are presentational; pages wire engine + transport.
This design does not violate any of these — in fact it strengthens the boundary
by extracting presentation into a dumb component.

## Keystone: one shared `GameView` component

Instead of triplicating the polished in-game chrome across Classic, Hill hot-seat,
and multiplayer, extract a single presentational component:

**`components/GameView.tsx`** — receives a plain view-model and renders the
designed game screen. It contains **no engine and no transport logic**.

Props (shape, finalized during planning):

- `players`: array of `{ player, name, tier, skin, isYou, isActive, alive,
  pieceCount, captured? }` — drives the side panels / 4-player panel.
- `currentPlayer`, `round`, `maxRounds`, `mode` label.
- `timer`: `{ remaining: number }` for the turn-timer pill.
- `board`: pieces array (already in `lib/pieces` `Piece[]` shape), `size`,
  optional `centerZone`.
- `selected`, `legalTargets`, `lastMove`, `isYourTurn`.
- Callbacks: `onSquareClick(r, c)`, `onResign`.
- `gameOver`: optional `GameOverOverlay` props (`kind`, `winners`,
  `matchDuration`, `roundCount`, `onPlayAgain`, `onShare`, `onLobby`).
- `banner`: optional extra slot for transient messages (e.g. multiplayer
  disconnect countdowns).

It renders two layouts off the player count: **2-player** (Classic — reuse the
existing `ClassicSidePanel` design currently inlined in `/play/classic`) and
**4-player** (Hill — designed panel + center "HILL" zone via `Board`'s
`centerZone`). Desktop shows side panels; mobile shows the compact score row.

**Pure mapper:** `lib/game-ui` gains a function mapping
`(GameState, playerMeta[]) → GameView view-model` (board → `Piece[]`, derive
`pieceCount`/`alive`/`isActive`, timer remaining, round). This is pure and
**unit-tested** without React.

**Alternative considered & rejected:** polish each page independently.
Triplicates chrome, guarantees visual drift, harder to test. The shared
component is the shipped-quality move.

## Workstreams

### 1. `GameView` extraction (do first, prove on multiplayer)

- Build `components/GameView.tsx` + the `lib/game-ui` mapper + mapper unit test.
- Refactor the `/r/[roomId]` **game view block only** to render `GameView` from
  the mapped view-model. **Zero behavior change**: all multiplayer load,
  subscribe, broadcast, host-authority timer, forfeit, sync, presence, and
  disconnect logic stays exactly as-is. Disconnect countdown banners are passed
  through `GameView`'s `banner` slot. Lobby view unchanged.
- Verification: room still loads, lobby → start → play → game-over still works
  (manual, documented; full realtime e2e needs live Supabase creds).

### 2. Classic 2P — fully playable hot-seat

- Rewrite `app/play/classic/page.tsx`: `createInitialState(classic2P)`, local
  React state, selection → `getLegalMoves` → `applyMove`, mandatory-jump
  continuation (mirror the room page's `handleSquare`, **minus broadcast**),
  10s turn timer that issues an engine `skip` on expiry (no elimination),
  win detection via the engine (`capture-all`) → `GameOverOverlay`.
- Render through `GameView` (2-player). Players are local: "Player 1" / "Player 2"
  (white/black), no auth required. "Play again" resets local state; "Lobby" → `/`.
- Remove the inlined `ClassicSidePanel`/mock arrays once `GameView` owns the
  2-player layout.

### 3. Hill hot-seat

- New route `app/play/hill/local/page.tsx` (`?mode=blitz|survival`): local 4P
  game reusing the engine loop already proven in the temp page (init, 4Hz
  countdown, skip-on-expiry, elimination + winner detection) but **without**
  `window.alert` — state surfaces through `GameView` (4-player) and
  `GameOverOverlay`.
- Delete the temporary inline `app/play/hill/page.tsx` (raw-div harness). If any
  route/test references `/play/hill`, repoint to the new local route or the
  mode-select flow.

### 4. Fix the create-room flow

- `app/play/hill/style/page.tsx` Continue handler:
  - `multi`: `setLoading`, `await createRoom(mode === 'survival'
    ? 'hill-survival' : 'hill-blitz')`, then `router.replace('/r/' + id)`.
    Error → inline retry (pattern already used by `/r/new`).
  - `hotseat`: `router.push('/play/hill/local?mode=' + mode)`.
- Remove the hardcoded `/r/ABCD` push entirely.
- Landing "Create Hill Room" **keeps** routing to `/play/hill/mode` — the polished
  2-step mode→style flow is the intended shipped UX; it simply must terminate in
  a real room (fixed above). The original brief's "direct POST /api/rooms" intent
  is satisfied at the end of that flow. `/r/new` (direct create) stays as the
  fast path and as the "Play Again" target from the multiplayer game-over.

### 5. Branding & polish

- `app/icon.tsx`: Next dynamic SVG icon — 2×2 grid, the four player colors
  (P1–P4). Crisp, versionable. **Delete the stale `app/favicon.ico`** so Next
  serves `icon.tsx` as the favicon. (Brief permitted either; SVG chosen.)
- `app/opengraph-image.tsx` + `app/twitter-image.tsx`: 1200×630
  `next/og` `ImageResponse` — HILL wordmark, tagline
  "Blitz checkers with a 4-player King of the Hill mode.", a 2×2 player-color
  motif, accent color, dark background.
- `app/layout.tsx` metadata: add `metadataBase`, `openGraph`
  (title "HILL — King of the Board", description, type website) and `twitter`
  (`summary_large_image`). Next auto-detects `opengraph-image`/`icon`; metadata
  is set explicitly to match the brief's copy.
- `components/Board.tsx`: change piece animation from `transition-[top,left]
  200ms` to compositor-friendly `transform: translate(...)` + `transition-
  transform 150ms ease-out`. Pieces positioned via `translate` instead of
  `top/left`. Isolated to `Board.tsx`; visually equivalent, smoother.

### 6. README + deploy prep

- Rewrite `README.md`: what HILL is; the two modes and a concise rules summary
  (Classic 2P; King-of-Hill blitz/survival, rounds, 10s turn, elimination,
  multiple-winner conditions); stack; local dev; required env vars; Supabase
  schema pointer (link `docs/phase-3-supabase-setup.md` /
  `docs/phase-4-multiplayer-setup.md`); npm scripts; deploy section.
- Add `.env.example` with `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  (server-only, used by `app/api/rooms/route.ts`).
- Verify production `npm run build` passes; fix any type/lint breakers the new
  code introduces. Inspect `next.config.ts` for deploy-relevant settings.
- README **DEPLOY** section: Vercel import, set the three env vars (note
  `SUPABASE_SERVICE_ROLE_KEY` is server-side only — never `NEXT_PUBLIC_`),
  Supabase project + schema setup, build command. **The deploy itself is run by
  the user** with these steps; this work does not execute it.

## Testing & verification

- Engine vitest suite (`lib/engine/*.test.ts`) must remain green.
- New unit test: the `lib/game-ui` view-model mapper (pure, no React).
- Documented manual checks: Classic hot-seat fully playable (select, jump,
  multi-jump, king, win); Hill hot-seat playable both modes; production build
  passes; multiplayer room still loads and a lobby→game cycle works (full
  realtime e2e requires the user's Supabase creds — called out as a manual,
  user-run step, not automated here).

## Out of scope

- Server-side move validation / anti-cheat (MVP is trust-the-client per
  `CLAUDE.md`).
- Real auth UI beyond the existing demo/anonymous flow.
- Running the actual Vercel deployment.
- Any refactor not serving the six workstreams above.

## Risks

- **Scope size.** Mitigated by sequencing: `GameView` is built and proven on the
  existing, working multiplayer page first (no behavior change), then reused —
  Classic and Hill hot-seat become thin wiring on a proven component.
- **Multiplayer regression risk** during the `/r/[roomId]` presentation swap.
  Mitigated by changing only the render block and keeping all transport/forfeit
  logic byte-for-byte.
- **No automated realtime e2e.** Multiplayer correctness after the swap is
  verified manually and documented; the transport code is deliberately untouched
  to keep that risk minimal.
