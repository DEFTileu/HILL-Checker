# HILL — Design Spec

**Date:** 2026-05-16
**Status:** Approved, in implementation (Phases 1-2 done in Claude Code; Phases 3-6 pending)
**Source brief:** [nFactorial Checkers challenge](https://nfactorial-group.notion.site/heckers-35627798ee0980de801fd2fe786f62ed)
**Time budget:** 1 day (~19.5 hours of focused vibe-coding)
**Target tier from brief:** "Великий" (showcase startup-prototype thinking)

---

## 1. Product Overview

**HILL** is a mobile-first web platform for blitz checkers with a unique 4-player "King of the Hill" mode.

**Tagline:** *King of the Board. 4 players. 3 minutes.*

**Positioning:** Not "another checkers site." HILL is a blitz arena. Classic 2P for traditionalists, plus a novel 4-player King of the Hill mode (no other product does this) for viral/social play.

**Audience priority:** Mobile users first (TikTok/social traffic via shareable room links and result cards).

**Brand vibe:** Premium-brutalist. Linear × Lichess × Whoop. Confident, modern, monochrome with a single acid-lime accent.

---

## 2. Modes

The product ships with **3 modes**, all served by a single configurable engine.

| | **Classic 2P** | **Hill 4P · Blitz** | **Hill 4P · Survival** |
|---|---|---|---|
| Board | 8×8 | 10×10 | 10×10 |
| Players | 2 | 2/3/4 (empty slots = no pieces) | 2/3/4 (empty slots = no pieces) |
| Start positions | Standard checkers ranks | 5 pieces, triangular formation in each corner | Same as Blitz |
| Move direction | Diagonal forward (toward opposite side) | Diagonal toward center (corner-to-center diagonal) | Same as Blitz |
| Capture | Jump opponent (any direction for kings; pawns forward jump + captures) | Jump any of the 3 other players' pieces; **pawns can capture in any of 4 diagonal directions** (not just forward) but non-capture moves are still forward-only (toward center); multi-jump mandatory | Same as Blitz |
| King promotion | Reach opposite edge | Enter center 2×2 ("the Hill") | Same as Blitz |
| Win condition | Capture all opponent pieces | At end of 7 rounds: **all players** with ≥1 piece in center are winners (1–4 winners possible). Or last survivor before timer. | Last survivor. If 20-round cap reached: same as Blitz center-check (anyone in center wins; draw if nobody). |
| Round limit | None (999) | 7 | 20 (safety cap) |
| Turn timer | 15s (skip on expiry, not loss) | 15s (skip on expiry, not loss) | 15s (skip on expiry, not loss) |
| No-legal-moves | Skip turn (not loss) | Skip turn (not loss) | Skip turn (not loss) |
| Elimination | 0 pieces = loss | 0 pieces = drama "YOU DIED" overlay → spectate or leave | Same as Blitz |

### Round definition (Hill modes)

A **round** = one full cycle of all currently-alive players moving once. Eliminated players are removed from the cycle. If P2 is eliminated in round 3, round 4 onward is P1 → P3 → P4 (shorter rounds).

### Final-state scenarios (Hill · Blitz)

- All 4 alive, no one in center after round 7 → draw, no winners
- 2+ alive, 2 in center after round 7 → joint winners ("JOINT KINGS")
- 2 alive, one captures the other in round 5 → solo winner (early end)
- 1 alive at any time → solo winner (early end)

### Final-state scenarios (Hill · Survival)

- 1 alive before round 20 → solo winner
- Round 20 reached, 2+ alive, anyone in center → those players win
- Round 20 reached, nobody in center → draw

---

## 3. Visual Design

### Brand tokens

```
Background:     #0A0A0A
Surface:        #141414
Border/divider: #1F1F1F
Text primary:   #FAFAFA
Text muted:     #808080
Accent (lime):  #BFFF00   (Hill zone, primary CTA, highlights)
Danger:         #FF3B30   (death screen)

Player colors:
  P1:           #FFFFFF   (white)
  P2:           #1A1A1A   (deep black with subtle outline for visibility on dark bg)
  P3:           #FF2D87   (hot pink)
  P4:           #00D9FF   (cyan)

Arena tier colors:
  Bronze:       #CD7F32
  Silver:       #C0C0C0
  Gold:         #FFD700
  Master:       #9B59B6
  Champion:     #BFFF00   (with 👑 icon)
```

### Typography

- **Display:** Inter ExtraBold, `clamp(48px, 12vw, 120px)`, tight tracking (-0.04em). Used for HILL wordmark, GAME OVER, YOU DIED.
- **Heading:** Inter SemiBold.
- **Body:** Inter Regular.
- **Mono:** JetBrains Mono — for room codes ("ROOM ABCD"), stats numbers.

### Player base shapes (colorblind accessibility)

Each player has both a color AND a fixed shape so colorblind users can distinguish:

- P1: circle ⚪
- P2: square ◼
- P3: triangle 🔺
- P4: hexagon ⬡

**Skins are decorative overlays** on top of the base shape (do NOT change the shape).

### King indicator vs Skin overlay (CRITICAL distinction)

These can coexist on the same piece:

- **King indicator** (drawn INSIDE the piece): small ✦ icon. Means "this pawn became a king" (reached opposite edge in Classic OR entered Hill in KoH).
- **Skin overlay** (drawn AROUND/ON-TOP of the piece): visual effect from the user's chosen skin. Means "this is the player's chosen cosmetic style."

Examples:
- Bronze skin + king = base shape + ✦ inside, no overlay
- Champion skin + king = base shape + ✦ inside + gold halo around + small 👑 top-right
- Master skin + not king = base shape + gem-sparkle particles, no ✦

### Mobile-first rules

- Primary viewport: 375–430px width (iPhone)
- All touch targets: min 44px (preferred 56–72px for primary actions)
- Bottom nav: 72px height total (28px icon + label + safe-area-inset-bottom)
- Board: ~95vw wide on mobile, pieces minimum 36px square
- Safe-area-inset respected for bottom UI and full-screen overlays
- No hover-only interactions

---

## 4. UI Screens

### Bottom navigation (persistent on main screens)

3 tabs: **HILL** (home icon) | **TOP** (trophy icon) | **ME** (user icon)

- Routes: HILL → `/`, TOP → `/leaderboard`, ME → `/profile`
- **Visible on:** `/`, `/leaderboard`, `/profile`
- **Hidden on:** `/play/*`, `/r/[id]`, all overlays (DEATH, GAME OVER)
- Active tab: lime icon + label + tiny lime indicator bar above icon
- Background: `#141414` with subtle `#1F1F1F` top border
- Fixed bottom, respects `safe-area-inset-bottom`

### Screen list

1. **Landing** (`/`) — HILL wordmark hero, tagline, welcome chip (signed-in or guest variant), two big CTAs ("Create Hill Room" primary lime, "Play Classic" secondary outline), "How HILL works" mini-section to fill mid-screen void
2. **Sign in** (`/login` or modal) — HILL wordmark + "Keep your crown." + "Continue with Google" + guest-mode disclaimer
3. **Profile** (`/profile`) — guest variant has prominent "Sign in with Google"; signed-in variant has "SIGNED IN AS email" chip with sign-out; both show display name input, ArenaBadge, stats (88/160/55%), tier progress bar, skin selector (5 cards with lock states), reset button
4. **Leaderboard** (`/leaderboard`) — Top 100 as mobile cards (rank big, name + badge, wins/win-rate stats), filter pills (Global / Friends — Friends is Tier 3)
5. **Hill mode select** (`/play/hill`) — Step 1/2: "Choose your mode" → Blitz or Survival cards
6. **Hill play style select** — Step 2/2: "How do you want to play?" → Hot-seat (this device) or Multiplayer (create room)
7. **Room lobby** (`/r/[id]`) — Room code huge in mono, Copy/Share buttons, **MODE · LOCKED** display (no toggle), 4 slots in 2×2 grid, Start button sticky bottom (host only, ≥2 players required)
8. **Classic 2P game** (`/play/classic`) — 8×8 board, turn indicator, back button
9. **Hill 4P game** (in-room or hot-seat) — 10×10 board with lime-glowing center 2×2, 2×2 player panel below (color, shape, name, badge, alive/eliminated status), active player has lime border + 15s countdown ring, round counter "Round 3 / 7" or "Round 5 — Survival"
10. **Death overlay** (during KoH game) — full-screen dark with red tint, huge "YOU DIED" fade-in, "Eliminated in Round X", two stacked buttons: [👁 Spectate] lime primary, [← Leave Room] outline
11. **Game over overlay** — 4 variants:
    - 1 winner: "👑 RIKO WINS." + winner color/badge + ELO delta
    - 2+ winners (Blitz): "JOINT KINGS." + each winner card + ELO delta
    - Draw: "NO KING TODAY."
    - All: [Play Again] lime primary + [Share Result]

---

## 5. Tech Stack

- **Framework:** Next.js 14 App Router + TypeScript (strict) + Tailwind CSS
- **Backend-as-a-service:** Supabase (Auth + Postgres + Realtime channels)
- **Auth:** Hybrid — Anonymous by default, optional upgrade to Google OAuth via `linkIdentity`
- **Deploy:** Vercel
- **Dev tools:** Claude Code (logic/backend), Claude Design (UI components, mobile-first)
- **Component library:** shadcn/ui where it fits

---

## 6. Architecture

### File structure

```
hill/
├── app/                              # Next.js App Router
│   ├── page.tsx                      # Landing
│   ├── login/page.tsx                # Sign in
│   ├── profile/page.tsx              # Profile (guest + signed-in variants)
│   ├── leaderboard/page.tsx          # Top 100
│   ├── play/
│   │   ├── classic/page.tsx          # Classic 2P hot-seat
│   │   └── hill/page.tsx             # Mode + play-style select → hot-seat or redirect to room
│   ├── r/[roomId]/page.tsx           # Multiplayer room (lobby + game)
│   ├── api/
│   │   ├── rooms/route.ts            # POST: create room with unique 4-letter code
│   │   └── games/route.ts            # POST: record finished game + increment wins
│   ├── layout.tsx                    # Root layout (auto-anonymous-signin, bottom nav mount)
│   └── globals.css                   # Tailwind base + design tokens
├── lib/
│   ├── engine/                       # PURE TypeScript — no React, no Supabase
│   │   ├── types.ts                  # GameConfig, GameState, Move, Piece
│   │   ├── presets.ts                # classic2P, hillBlitz, hillSurvival
│   │   ├── rules.ts                  # getLegalMoves, isJumpAvailable
│   │   ├── apply.ts                  # applyMove (incl. multi-jump, promotion, round-counting, elim)
│   │   └── endgame.ts                # checkWinners
│   ├── multiplayer/
│   │   ├── client.ts                 # Supabase client singleton
│   │   └── channel.ts                # subscribeToRoom, broadcastMove, presence helpers
│   ├── auth/
│   │   └── index.ts                  # signInAnonymously, signInWithGoogle, useUser hook
│   ├── db/
│   │   ├── schema.sql                # All tables + RLS + leaderboard view
│   │   ├── profiles.ts               # getProfile, updateDisplayName, updateSkin, incrementWins
│   │   ├── games.ts                  # recordGame, getLeaderboard
│   │   └── rooms.ts                  # createRoom, getRoom, updateRoomState
│   ├── arena.ts                      # getArenaTier(wins)
│   └── skins.ts                      # SKIN_TIER_REQUIREMENTS, getUnlockedSkins
└── components/
    ├── Board.tsx, PieceView.tsx, HillZone.tsx,
    ├── TurnTimer.tsx, RoundCounter.tsx, PlayerSlot.tsx, PlayerPanel.tsx,
    ├── DeathOverlay.tsx, GameOverOverlay.tsx,
    ├── ArenaBadge.tsx, LeaderboardRow.tsx,
    ├── RoomCodeDisplay.tsx, ModeCard.tsx,
    ├── BottomNav.tsx, WelcomeChip.tsx,
    └── SkinSelector.tsx
```

### Engine principles (DO NOT VIOLATE)

1. `lib/engine/*` is **pure TypeScript**. No React imports. No Supabase imports. Just data-in / data-out functions runnable in Node.
2. All game rules live ONLY in `lib/engine/rules.ts` and `apply.ts`. Never duplicate rule logic in React components.
3. The same engine handles all 3 modes via `GameConfig` presets.
4. Multiplayer truth: each client runs engine locally. Moves broadcast via Supabase Realtime. Trust-the-client for MVP (no server validation — see Stretch Goals).
5. UI components from Claude Design are wired up to engine state and Supabase channels in page-level components — not inside engine.

### Core types

```typescript
type Player = 1 | 2 | 3 | 4
type Coord = [row: number, col: number]
type PieceKind = 'pawn' | 'king'

interface Piece {
  player: Player
  kind: PieceKind
  pos: Coord
}

type GameMode = 'classic-2p' | 'hill-blitz' | 'hill-survival'

interface GameConfig {
  mode: GameMode
  boardSize: 8 | 10
  numPlayers: 2 | 4
  maxRounds: number              // 999 for classic, 7 for blitz, 20 for survival
  kingRule: 'opposite-edge' | 'center-zone'
  winCondition: 'capture-all' | 'hold-center'
  centerZone: Coord[]            // 4 coords for Hill modes, empty for classic
  startPositions: Record<Player, Coord[]>
  moveDirections: Record<Player, [number, number][]>  // pawn movement dirs per player
}

interface GameState {
  config: GameConfig
  pieces: Piece[]
  currentPlayer: Player
  alivePlayers: Player[]
  round: number
  turnDeadline: number           // Date.now() + 15000
  status: 'lobby' | 'playing' | 'finished'
  winners: Player[] | null
  mandatoryJumpFrom: Coord | null  // set during multi-jump chains
}

interface Move {
  from: Coord
  to: Coord
  captures: Coord[]              // empty for non-capture moves
}
```

---

## 7. Database Schema (Supabase Postgres)

```sql
-- Profile (extends auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  total_wins int default 0,
  total_games int default 0,
  skin_id text default 'bronze',         -- 'bronze' | 'silver' | 'gold' | 'master' | 'champion'
  created_at timestamptz default now()
);

-- Finished games
create table games (
  id uuid primary key default gen_random_uuid(),
  mode text not null,                     -- 'classic-2p' | 'hill-blitz' | 'hill-survival'
  player_count int not null,
  winners uuid[] not null,                -- can be multiple for KoH Blitz
  finished_at timestamptz default now()
);

-- Game participants
create table game_players (
  game_id uuid references games(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  slot int not null,                      -- 1..4
  was_winner boolean not null,
  eliminated_round int,                   -- null if survived
  primary key (game_id, slot)
);

-- Active multiplayer rooms
create table rooms (
  id text primary key,                    -- 4-letter uppercase code
  host_user_id uuid references profiles(id) not null,
  mode text not null,
  status text not null,                   -- 'lobby' | 'playing' | 'finished'
  state jsonb,                            -- GameState snapshot (for rejoin)
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Public leaderboard view
create view leaderboard as
  select id, display_name, total_wins, total_games, skin_id,
         (total_wins::float / nullif(total_games, 0)) as win_rate
  from profiles
  where total_games > 0
  order by total_wins desc
  limit 100;
```

### Row-Level Security (RLS)

- `profiles`: each user can SELECT/UPDATE own row; all users can SELECT (display_name, total_wins, total_games, skin_id) of others (for leaderboard/lobby rendering)
- `games`, `game_players`: SELECT open to all; INSERT/UPDATE only via API route (server-side service-role key)
- `rooms`: SELECT open to all (lookup by code); INSERT/UPDATE only by host

---

## 8. Multiplayer Architecture

**Design decision: NO direct DB writes for game state.** Game state lives in client React state, synchronized via Supabase Realtime channels (Presence + Broadcast). Room table holds a snapshot for rejoin purposes only.

### Channel and events

- One channel per room: `room:ABCD`
- **Presence:** tracks who is in the room, their slot, display name, skin
- **Broadcast events:**
  - `lobby:assign_slot` — host assigns slot
  - `game:start` — host starts (sends initial GameState)
  - `game:move` — active player moves (sends Move)
  - `game:sync_request` — new client asks for current state
  - `game:sync_response` — any client responds with current state
  - `player_forfeit` — fired after 10s grace period for disconnected player
  - `game:end` — engine detected end (broadcast by host)

### Flow

1. **Create room:** host POSTs `/api/rooms` → server generates unique 4-letter code → INSERT into `rooms` → returns `{ id }` → redirect to `/r/ABCD`
2. **Join:** new client SELECTs room → 404 if not found → subscribes to channel + presence
3. **Lobby:** presence drives the slot grid. Mode is fixed at room creation (read-only display).
4. **Start:** host clicks Start → creates initial GameState via engine → broadcasts `game:start` → `UPDATE rooms SET state, status='playing'`
5. **Move:** active player → engine validates locally → applies locally → broadcasts `game:move` → other clients apply locally
6. **Sync (for rejoin / late joiners):** new client subscribes → broadcasts `sync_request` → any client responds with `sync_response` carrying current state
7. **End:** engine returns winners → host calls `POST /api/games` (records to DB + increments wins via service-role key) → host broadcasts `game:end` → all clients show GameOverOverlay

### Reconnect / 10-second grace period

- Presence `leave` for slot X → mark `disconnectedAt[X] = Date.now()`
- `setTimeout(10000)`: if user still gone → broadcast `player_forfeit` (their pieces removed, alive list updated)
- If same `user_id` rejoins within 10s → clear timeout, keep slot
- PlayerSlot shows "Disconnected, 7s..." countdown during grace

---

## 9. Auth System (Hybrid)

**Default:** every visitor is auto-signed-in as an anonymous Supabase user on first load. A `profiles` row is auto-created with a generated `display_name` in format `Player_XXXX` where XXXX is 4 random hex chars (e.g., `Player_a3f9`).

**Upgrade flow:**
- From profile page or "Sign in" link in welcome chip, user clicks "Continue with Google"
- `supabase.auth.linkIdentity({ provider: 'google' })` upgrades the anonymous user to a persistent Google-linked account
- All wins, stats, and skin selection carry over (same `user_id`)
- After upgrade: works cross-device when signed in with same Google account

**Guest vs Signed-in UI differentiation:**
- Welcome chip: guest shows `Player_a3f9` + "Sign in" link; signed-in shows initial + display_name + Google G overlay
- Profile: guest shows big "Sign in with Google" CTA at top; signed-in shows "SIGNED IN AS email" chip + sign-out link + Google G badge on avatar
- Both can play all modes equally — sign-in is purely about cross-device persistence

---

## 10. Skin System (Tier-locked Cosmetics)

5 skins, unlocked by arena tier (= driven by total wins).

| Skin | Unlock requirement | Visual effect |
|---|---|---|
| Bronze | Default (0 wins) | Solid fill, no overlay |
| Silver | 5 wins (Silver tier) | Subtle gradient (lighter top, darker bottom) |
| Gold | 20 wins (Gold tier) | Soft glow halo around shape |
| Master | 50 wins (Master tier) | Gem-style facets + occasional sparkle particles |
| Champion | 100 wins (Champion tier) | Small 👑 icon top-right + gold pulsing glow |

**Implementation:**
- `lib/arena.ts` — `getArenaTier(wins)` returns the user's current tier
- `lib/skins.ts` — `SKIN_TIER_REQUIREMENTS`, `getUnlockedSkins(wins): SkinId[]`
- `profiles.skin_id` — user's currently selected skin (defaults to 'bronze')
- Selector in profile page: 5 cards horizontally; locked skins show 🔒 + "Unlock at [Tier]"
- Each player's `skin_id` is included in the initial `game:start` broadcast (read from `profiles` at start time) AND tracked in presence metadata so late joiners and clients re-rendering board can lookup. `skin_id` is NOT re-sent on every `game:move` (it doesn't change mid-game).
- Skin overlay is layered ABOVE the base shape; **does not change the per-player base shape** (colorblind safety preserved)

---

## 11. Implementation Phases

> **Status note:** Phases 0–2 completed in Claude Code prior to spec being finalized. Spec for Phases 0–2 retained here for reference; Phases 3–6 are the active work.

### Phase 0 — Setup (~30 min) ✅ DONE

- `npx create-next-app@latest hill --typescript --tailwind --app --no-src-dir`
- `npm install @supabase/supabase-js`
- Supabase project; copy URL + anon key to `.env.local`
- Enable Anonymous sign-in in Supabase Auth settings
- Run `schema.sql` in SQL Editor
- `vercel link`
- Git init + first commit

**Done when:** `npm run dev` works, Supabase client connects.

### Phase 1 — Engine + Classic 2P hot-seat (~3.5h) ✅ DONE

Build pure-TS engine and `/play/classic` hot-seat page.

**Files:** `lib/engine/{types,presets,rules,apply,endgame}.ts`, `app/play/classic/page.tsx`.

**Done when:** Two players can complete a full Classic game hot-seat in browser. All standard rules work (diagonal forward, mandatory captures, multi-jump, king on opposite edge, king moves long).

### Phase 2 — KoH 4P hot-seat (~2.5h) ✅ DONE

Add Blitz + Survival presets, extend engine for 4-player rules + center promotion + hold-center win condition + per-turn timer.

**Files (extend):** `lib/engine/presets.ts` (add `hillBlitz`, `hillSurvival`), `rules.ts` (4-player captures, all-direction jump for pawns), `apply.ts` (round counter, skip-turn, elimination), `endgame.ts` (hold-center, last-survivor). `app/play/hill/page.tsx`. Components: `HillZone`, `PlayerSlot`, `PlayerPanel`, `RoundCounter`, `TurnTimer`, `DeathOverlay`, `GameOverOverlay`.

**Done when:** 4 players (hot-seat) can complete a full Blitz game with multiple-winner determination; Survival game ends on last survivor; capture works against any of the 3 other players; king promotion happens on center entry; turn timer expires → skip; 0 pieces → DeathOverlay.

### Phase 3 — Auth + DB + OAuth + Skins (~4h) PENDING

**Tasks:**
- Run `schema.sql` (verify all 4 tables + view + RLS)
- `lib/auth/index.ts` — `signInAnonymously()`, `signInWithGoogle()` via `linkIdentity`, `getCurrentUser()`, `useUser()` hook
- Auto sign-in on first visit; auto-INSERT into `profiles` with random `display_name`
- `app/profile/page.tsx` — guest/signed-in variants, display name editable, ArenaBadge, stats grid, tier progress bar
- `lib/arena.ts` — `getArenaTier(wins)`
- `lib/skins.ts` — `SKIN_TIER_REQUIREMENTS`, `getUnlockedSkins(wins)`
- `components/ArenaBadge.tsx`, `components/SkinSelector.tsx`, `components/PieceView.tsx` (extend to accept and render skin overlay)
- Google OAuth setup in Supabase Dashboard (enable provider, configure Google Cloud Console credentials)
- `app/login/page.tsx` — "Continue with Google" + guest disclaimer
- "Sign in" link in welcome chip on landing

**Done when:**
- Fresh incognito visit → new row in `auth.users` AND `profiles` with random name
- `/profile` allows editing name (persists)
- Manually setting `total_wins = 25` shows Gold badge in UI
- "Continue with Google" successfully links Google identity to existing anonymous user (test in Supabase dashboard: same user_id, now has Google identity attached)
- Skin selector shows locked states correctly; selecting a skin updates `profiles.skin_id`

**Cut if behind:** OAuth (anonymous-only); skin selector UI (skins fixed at 'bronze' but DB column present)

### Phase 4 — Multiplayer (~3h) PENDING

**Tasks:**
- `app/api/rooms/route.ts` POST — generate 4-letter uppercase code (alphabet A–Z); if INSERT fails on `id` unique constraint, retry up to 5 times with new code; return `{ id }` on success, 500 on persistent collision (extremely unlikely with 456k codespace)
- `lib/multiplayer/channel.ts` — `subscribeToRoom(roomId, handlers)`, `broadcastMove`, `broadcastGameStart`, `broadcastSyncRequest`, `broadcastSyncResponse`, `trackPresence`
- `lib/db/rooms.ts` — `createRoom`, `getRoom`, `updateRoomState`
- `app/r/[roomId]/page.tsx`:
  - On mount: `getRoom` → 404 if not found; subscribe to channel; trackPresence
  - **Lobby view:** room code + Copy/Share, MODE · LOCKED display, 2×2 slots from presence, Start button (host only, ≥2 players)
  - **Game view:** Board + PlayerPanel + TurnTimer + RoundCounter; active player click → `engine.applyMove` locally → broadcast `game:move`; others apply locally; host also `updateRoomState` after each move
  - On `winners != null`: host calls `POST /api/games` (record + increment wins via service-role); all show GameOverOverlay
- `app/api/games/route.ts` POST — record game + game_players, increment wins
- `app/play/hill/page.tsx` — mode select (Blitz/Survival), then play-style select (Hot-seat / Multiplayer); Multiplayer path POSTs to `/api/rooms` and redirects

**Done when:**
- Create Hill Room → redirected to `/r/ABCD`
- Open URL in 3 incognito tabs → 4 players in lobby
- Host starts → all 4 see board + correct active player
- Moves sync in real-time to all clients
- Game completion → all see GameOverOverlay → new row in `games`, winners' `total_wins` incremented

**Cut if behind:** Survival in multiplayer (Blitz-only); `recordGame` (wins stay at 0, leaderboard empty).

### Phase 5 — Leaderboard + Rejoin (~3.5h) PENDING

**Tasks:**
- `app/leaderboard/page.tsx` — `SELECT * FROM leaderboard` → mobile cards
- `components/BottomNav.tsx` + mount in layout for `/`, `/leaderboard`, `/profile`
- `components/LeaderboardRow.tsx`
- Rejoin logic in `app/r/[roomId]/page.tsx`:
  - Track `disconnectedAt: Record<Player, number | null>`
  - Presence `leave`: mark slot; `setTimeout(10000)` to forfeit
  - Presence `join` for same user_id: clear timeout, restore slot
  - PlayerSlot shows "Disconnected, 7s..." during grace
- Skin selector polish (if Phase 3 skin UI was deferred)

**Done when:**
- Leaderboard shows top players with badges
- Bottom nav navigates correctly; hidden in-game
- Disconnect 5s → reconnect: slot restored, game resumes
- Disconnect 15s → pieces removed (forfeit broadcast), game continues

**Cut if behind:** Rejoin (immediate elimination); Friends-leaderboard pill (Global only).

### Phase 6 — Polish + Landing + README + Deploy (~2.5h) PENDING

**Tasks:**
- Integrate all final Claude Design components
- Landing `app/page.tsx` — Welcome chip, two big CTAs ("Create Hill Room" / "Play Classic"), "How HILL works" mini-section (3 icons: 4 players → Race to center → Hold the Hill), Leaderboard link
- Favicon: 4 squares 2×2 grid (player colors) as SVG
- Open Graph meta: title, description, og:image (1200×630 game screenshot)
- CSS transitions for piece moves (150ms ease-out transform)
- README.md (see template in section 13)
- `vercel --prod` deploy + add env vars in Vercel dashboard
- Smoke test in prod (Classic, Hill Blitz hot-seat, multiplayer 4 incognito, leaderboard, rejoin)
- Fill nFactorial typeform with live URL, GitHub URL, demo video

**Done when:** Live at `hill-*.vercel.app`, README done, form submitted.

**Cut if behind:** Animations, favicon. Lock in: landing + README.

### Timeline summary

| Phase | Hours | Cumulative | Status |
|---|---|---|---|
| 0. Setup | 0.5 | 0.5 | ✅ done |
| 1. Engine + Classic | 3.5 | 4.0 | ✅ done |
| 2. KoH hot-seat | 2.5 | 6.5 | ✅ done |
| 3. Auth + DB + OAuth + Skins | 4.0 | 10.5 | ⏳ next |
| 4. Multiplayer | 3.0 | 13.5 | ⏳ pending |
| 5. Leaderboard + Rejoin | 3.5 | 17.0 | ⏳ pending |
| 6. Polish + Deploy | 2.5 | 19.5 | ⏳ pending |
| **Total** | **19.5** | | |

---

## 12. Testing

**Manual smoke test (mandatory before deploy):**

- Play full Classic 2P game to completion
- Play full Hill Blitz to completion: test 1 winner, 2 winners, draw (no one in center)
- Play Hill Survival to last survivor
- 4 incognito tabs in same room → complete multiplayer game
- Leaderboard shows result, winners' arena badges update if tier changed
- Rejoin: disconnect 5s and 15s; verify behaviors
- Sign-in with Google upgrade preserves wins/skin
- All screens look correct on iPhone-sized viewport (375–430px wide)
- Bottom nav hidden in-game; visible on landing/leaderboard/profile

**Unit tests (optional, only if time allows):** 5–10 tests on `applyMove` and `checkWinners` for each mode.

---

## 13. README template

```markdown
# HILL — King of the Board

A web platform for blitz checkers with a unique 4-player "King of the Hill" mode.

🎮 **Live:** https://hill.vercel.app
📺 **Demo video:** [link]

## What makes HILL different
- Two modes: Classic 2-player + 4-player King of the Hill
- In KoH: 4 players race from corners to capture the center
- Pieces become kings by entering the Hill (center 2×2)
- Multiple winners possible (Blitz) or last-survivor (Survival)
- 10-sec turn timer for blitz pace
- Mobile-first, with bottom nav and shareable room links
- Anonymous auth (instant play) + optional Google sign-in for cross-device
- Tier-locked piece skins: Bronze → Silver → Gold → Master → Champion

## Tech
- Next.js 14 App Router + TypeScript + Tailwind
- Supabase (Auth + Postgres + Realtime channels)
- Vercel deploy

## Local dev
1. `npm install`
2. Create a Supabase project, run `lib/db/schema.sql`
3. Copy `.env.example` to `.env.local`, fill `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. `npm run dev`

## Architecture highlights
- Pure-TS game engine (`lib/engine/`) — no React, no network
- Same engine drives all 3 modes via configurable `GameConfig` presets
- Same engine drives hot-seat AND multiplayer
- Supabase Realtime for low-latency 4-player sync (no DB writes per move)
- Hybrid auth: anonymous by default, upgradable to Google via `linkIdentity`
- Mobile-first design (≥44px touch targets, safe-area-inset support)

## Stretch goals (not in MVP)
See `docs/superpowers/specs/2026-05-16-hill-design.md` Section 14.

Built for nFactorial 2026 challenge.
```

---

## 14. Stretch Goals (Tier 3 — for after MVP ships)

- **Server-side anti-cheat** — `/api/move` API route re-runs engine on server before writing state. Same `lib/engine/` reused server-side (this is why engine stays pure TS).
- **Real arenas with matchmaking pools** — separate queues per tier (`match:bronze`, `match:silver`, ...), ELO/MMR (Glicko-2 or simple Elo) recalculated after each game.
- **Email + password auth** — for users who don't have Google.
- **Game history** — `/profile/games` table of past games with replay viewer.
- **Public player profiles** — `/profile/[username]`.
- **Friend system** — add friends, play with them directly, "Friends" leaderboard tab.
- **Stripe Pro skins** — $2.99 packs for premium cosmetics. Webhook + DB tracking.
- **AI Coach** — after game, AI explains your mistakes ("you lost your king here because…").
- **AI opponent** — bot to fill empty slots in Hill rooms or play solo.
- **Spectator chat** — for eliminated players watching the rest of the match.
- **Tournament mode** — bracket of Hill matches.
- **Daily challenges** — preset board states, solve for "best move."

---

## 15. Decision log (for future reference)

Key decisions made during brainstorming and why:

- **HILL name chosen over HillKing:** premium feel beats explicit-concept (tagline carries explanation)
- **10×10 board for Hill:** room for 4 players + clean diagonal-to-center geometry; 8×8 too cramped
- **Center promotion (kingRule = 'center-zone'):** thematically perfect ("center = power"), reinforces the King-of-the-Hill mechanic
- **Multiple winners allowed in Blitz:** literal match to user's original phrasing; creates novel co-op-ish dynamic
- **7 rounds for Blitz:** sweet spot between blitz pace (~5 min) and meaningful strategy
- **20-round safety cap for Survival:** prevents infinite stalemate
- **No DB writes per move (channels only):** speed, simplicity for 1-day MVP; rooms.state snapshot only for rejoin
- **Trust-the-client (no server validation):** friends-blitz product, not competitive; anti-cheat is Tier 3
- **Hybrid auth (anonymous default, Google upgrade):** lowest friction for first-time TikTok visitors; cross-device only when needed
- **Tier-locked skins (no payment):** matches user's CoC-vibe ask without Stripe complexity
- **Base shape per player + skin as overlay:** preserves colorblind accessibility (shape distinguishes player, skin is decorative)
- **King indicator vs Skin overlay distinction:** they can coexist on same piece without confusion

---

## 16. Claude Design — Prompts

### Initial design brief

(Used to generate the first batch of screens. Already executed by Claude Design.)

See `prompts/claude-design-initial.md` in repo (or recreate from the prompt block sent in the brainstorming session).

### Delta prompt 1 (applied)

Added bottom nav, Google OAuth screen, play-style step, Death screen buttons, lobby mode-toggle removal, etc.

### Delta prompt 2 (apply next)

```
ADDITIONS to the HILL design:

1. ADD: Piece skins system
   - Each piece has TWO visual layers:
     a) Base: per-player shape (circle/square/triangle/hexagon) — unchanged for
        colorblind accessibility
     b) Skin overlay: decorative effect based on user's chosen skin
   - 5 skins (overlays that work on ANY base shape):
     - Bronze (default): solid fill, no overlay
     - Silver: subtle vertical gradient (lighter top → darker bottom)
     - Gold: soft glow halo around the shape
     - Master: gem-style facets + occasional sparkle particles
     - Champion: small 👑 icon top-right corner of piece + gold pulsing glow
   - Note: a king-promoted piece has an ADDITIONAL ✦ icon INSIDE the shape.
     This is distinct from the skin overlay. They can coexist:
       Champion skin + king = base shape + ✦ inside + gold halo around + 👑 top-right

2. ADD: Profile screen — Skin Selector
   - New section "PIECE SKIN" below the stats grid
   - 5 horizontal cards showing a sample piece with each skin applied
   - Locked skins (above user's current tier) show 🔒 overlay + label:
     "Unlock at [Tier] — [N] wins"
   - Unlocked skins are tappable; the currently-selected one has a lime border
   - Selection autosaves to profile.skin_id

3. UPDATE: Lobby screen
   - Each player's slot shows a tiny piece sample reflecting their chosen skin
     next to their name + arena badge

4. UPDATE: Bottom nav size
   - The current bottom nav is too small for thumb targets
   - Resize to 72px total height: 28px icon + 8px gap + 12px label + safe-area-inset-bottom
   - Active tab gets a 3px lime indicator bar ABOVE the icon (centered, 24px wide)

5. UPDATE: Landing page mid-screen void
   - Add a 3-step "How HILL works" mini-section between tagline and CTAs:
     [⚔ 4 Players]  →  [🎯 Race to Center]  →  [👑 Hold the Hill]
   - Small icons + 1-line labels, horizontal on mobile

6. FIX COPY: Profile · guest
   - Change "Your wins are with you to your account" to:
     "Save your wins, ELO, and arena to your account."

7. FIX: Sign-in screen
   - Remove the "ACCOUNT" label above "Keep your crown."
   - Hierarchy: HILL wordmark → "Keep your crown." → description → button

Keep all other tokens, components, and screens as established.
```

---

## 17. Claude Code — Prompts (Phases 3–6)

Phase 3, 4, 5, 6 prompts as drafted in the brainstorming session. Each phase prompt is self-contained and includes acceptance criteria. Refer to brainstorming transcript or paste into Claude Code as needed.

Each Claude Code session should be primed with the project context block (game types, architecture rules, modes summary) that lives in the project's `CLAUDE.md` file at repo root.

---

## End of spec
