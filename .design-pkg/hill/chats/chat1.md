# Piece Skins System

_Started 2026-05-16 16:05 UTC_

---

## User

<system-info comment="Only acknowledge these if relevant">
Project title is now "HILL"
Current date is now May 16, 2026
</system-info>

<default aesthetic>
If no references, art direction or design systems were provided, use this default professional modern, minimal aesthetic as a base. Declare your choice out loud so you stick to it. Guidance:
- Choose a type pairing from web-safe set or Google Fonts. Helvetica is a good choice. Avoid hard-to-read or overly stylized fonts. Use 1-3 fonts only.
- Foreground and background: choose a color tone (warm, cool, neutral, something in-between). Use subtly-toned whites and blacks; avoid saturations above 0.02 for whites.
- Accents: choose 0-2 additional accent colors using oklch. All accents should share same chroma and lightness; vary hue.
- NEVER write out an SVG yourself that's more complicated than a square, circle, diamond, etc.
- For imagery, never hand-draw SVGs; use subtly-striped SVG placeholders instead with monospace explainers for what should be dropped there (e.g. “product shot”)

CRITICAL: ignore default aesthetic entirely if given other aesthetic instructions like reference images, design systems or guidance, or if there are files in the project already.
</default aesthetic>

<pasted_text name="Pasted text (206 lines)">
PROJECT: HILL — King of the Board

A mobile-first web app for blitz checkers with a unique 4-player "King of the Hill" mode.

═══════════════════════════════════════════
PLATFORM PRIORITY (CRITICAL): MOBILE FIRST
═══════════════════════════════════════════
- Primary viewport: 375px-430px width (iPhone)
- Secondary: tablet 768px+
- Desktop is THIRD priority — scale up, don't redesign
- All touch targets: min 44px
- All interactions: tap, swipe — NEVER hover-only
- Respect safe-area-inset for iPhone notch (bottom nav, fullscreen overlays)
- Optimize for one-handed thumb reach (key actions in bottom 60% of screen)

TECH STACK: Next.js 14 App Router + React + TypeScript + Tailwind CSS.
Use shadcn/ui components where they fit. No external animation libraries
unless absolutely necessary (CSS transitions preferred).

═══════════════════════════════════════════
BRAND IDENTITY
═══════════════════════════════════════════
- Name: HILL
- Tagline: "King of the Board. 4 players. 3 minutes."
- Vibe: Premium-brutalist. Think Linear × Lichess × Whoop.
  Minimalist, confident, modern, gaming-but-grown-up.
- Aesthetic: Mostly monochrome dark with ONE accent color (acid lime).

═══════════════════════════════════════════
DESIGN TOKENS
═══════════════════════════════════════════
Colors:
  --bg:           #0A0A0A   (page background)
  --surface:      #141414   (cards, panels)
  --border:       #1F1F1F   (dividers)
  --text-primary: #FAFAFA
  --text-muted:   #808080
  --accent:       #BFFF00   (acid lime — Hill zone, primary CTA, highlights)
  --danger:       #FF3B30   (death screen, errors)
  
Player colors (King of Hill mode):
  --p1: #FFFFFF   (white)
  --p2: #1A1A1A   (deep black with subtle outline for visibility on dark bg)
  --p3: #FF2D87   (hot pink)
  --p4: #00D9FF   (cyan)
  
Arena tier colors:
  --bronze:    #CD7F32
  --silver:    #C0C0C0
  --gold:      #FFD700
  --master:    #9B59B6
  --champion:  #BFFF00   (with 👑 icon)

Typography:
  Display: Inter ExtraBold, clamp(48px, 12vw, 120px), tight tracking (-0.04em)
  Heading: Inter SemiBold
  Body:    Inter Regular
  Mono:    JetBrains Mono (for room codes, stats)

Spacing: Tailwind defaults
Radius: 12px for cards, 8px for buttons, 4px for pieces

═══════════════════════════════════════════
ACCESSIBILITY (color-blind friendly)
═══════════════════════════════════════════
Each player has BOTH a color AND a shape pattern so colorblind users
can distinguish:
  P1 (white):  circle ⚪
  P2 (black):  square ◼
  P3 (pink):   triangle 🔺
  P4 (cyan):   hexagon ⬡

═══════════════════════════════════════════
SCREENS TO DESIGN (mobile-first for each)
═══════════════════════════════════════════

1. LANDING — `/`
   - HILL logo huge at top (display size)
   - Tagline below in muted color
   - Welcome chip top-right: "Player_a3f9" + ArenaBadge
   - Two stacked CTAs (mobile):
     [Create Hill Room]  ← primary, lime, big
     [Play Classic]      ← secondary outline
   - Link below: "Leaderboard →"
   - Footer: tiny copyright

2. CLASSIC 2P GAME — `/play/classic`
   - 8×8 board centered, max-width 95vw
   - Dark squares #1A1A1A, light squares #2A2A2A
   - Pieces with player color + shape pattern
   - Above board: turn indicator chip — "White's turn"
   - Below board: nothing fancy, just back button

3. HILL MODE SELECT — `/play/hill`
   - Heading: "Choose Your Mode"
   - Two stacked cards (mobile):
     ┌─────────────────────────────┐
     │ ⚡ BLITZ                    │
     │ 7 rounds. Multiple kings.   │
     │ ~3 minutes.                 │
     └─────────────────────────────┘
     ┌─────────────────────────────┐
     │ 💀 SURVIVAL                 │
     │ Last alive wins. Slow burn. │
     │ ~5-7 minutes.               │
     └─────────────────────────────┘
   - Selected card gets lime border + glow
   - [Start] button at bottom (sticky bottom on mobile)

4. ROOM LOBBY — `/r/[roomId]`
   - Top: room code huge "ROOM ABCD" in mono font
   - [Copy Link] [Share] buttons
   - Mode toggle (host only): [Blitz | Survival] pill toggle
   - 4 player slots in 2x2 grid (mobile):
     ┌──────────┬──────────┐
     │ P1 ⚪    │ P2 ◼     │
     │ Aida 🥈  │ — empty  │
     ├──────────┼──────────┤
     │ P3 🔺    │ P4 ⬡     │
     │ Sam 🥉   │ — empty  │
     └──────────┴──────────┘
   - [Start Game] sticky bottom (host only, disabled if <2 players)

5. HILL 4P GAME (in-room or hot-seat)
   - 10×10 board, full width on mobile (~95vw)
   - Center 2×2 squares have LIME outline + subtle pulsing glow
   - Pieces with player color + shape pattern
   - Kings have small crown ✦ overlay
   - ABOVE board: round counter "Round 3 / 7" (or "Round 5 — Survival")
   - BELOW board: 2x2 player panel
     - Each slot: color dot, shape, name, ArenaBadge, alive/elim status
     - Active player gets lime border + 10s countdown ring around their dot
   - Sticky top: back button + room code mini

6. DEATH SCREEN (overlay) — appears when player loses all pieces
   - Full-screen dark overlay with red tint (#FF3B30 @ 20% opacity)
   - HUGE "YOU DIED" text in display font, fade-in 500ms
   - Subtext: "Eliminated in Round X"
   - Two buttons bottom (sticky safe-area):
     [👁 Watch]   [← Leave]

7. GAME OVER (overlay) — after game finishes
   - Dark overlay with subtle gold radial gradient from center
   - Winner(s) headline:
     - 1 winner:   "👑 SAM WINS"
     - 2+ winners (Blitz): "👑 JOINT KINGS — SAM & AIDA"
     - 0 winners (Survival draw): "NO KING TODAY"
   - Below: each winner's color square + ArenaBadge
   - Buttons: [Play Again] (lime primary) [Share Result]

8. LEADERBOARD — `/leaderboard`
   - Heading: "TOP 100"
   - Mobile: list of cards (not table). Each card:
     ┌────────────────────────────────┐
     │ #1   Sam Wilson      🏆 142w  │
     │      Champion 👑     71% wr    │
     └────────────────────────────────┘
   - Sticky filter pills top: [Global | Friends] (Friends is Tier 3)

9. PROFILE — `/profile`
   - Display name input (autosaved on blur)
   - Big ArenaBadge in center
   - Stats: total wins, total games, win rate
   - [Reset Account] danger button bottom

═══════════════════════════════════════════
COMPONENTS TO PRODUCE
═══════════════════════════════════════════
- <Board boardSize={8|10} pieces={Piece[]} centerZone={Coord[]} onSquareClick={...} highlightedSquares={Coord[]} />
- <Piece player={1|2|3|4} kind={'pawn'|'king'} />
- <HillZone /> (lime 2x2 highlight)
- <PlayerSlot player={...} isActive={bool} secondsLeft={number} />
- <PlayerPanel players={...} activePlayer={Player} />
- <RoundCounter current={number} max={number|null} />
- <TurnTimer seconds={number} />
- <ArenaBadge tier={'Bronze'|...'Champion'} />
- <ModeCard mode='blitz'|'survival' selected={bool} onClick={...} />
- <DeathOverlay round={number} onWatch={...} onLeave={...} />
- <GameOverOverlay winners={Player[]} onPlayAgain={...} onShare={...} />
- <LeaderboardRow rank={number} profile={...} />
- <RoomCodeDisplay code={string} />
- <CTAButton variant='primary'|'secondary' />

═══════════════════════════════════════════
MOCK DATA TYPES (use for generating)
═══════════════════════════════════════════
type Player = 1 | 2 | 3 | 4
type Coord = [row: number, col: number]
type Piece = { player: Player; kind: 'pawn'|'king'; pos: Coord }
type ArenaTier = 'Bronze'|'Silver'|'Gold'|'Master'|'Champion'
type Profile = {
  id: string;
  displayName: string;
  totalWins: number;
  totalGames: number;
  arenaTier: ArenaTier;
}

═══════════════════════════════════════════
DELIVERABLES
═══════════════════════════════════════════
Generate all 9 screens + all components as separate React TSX files.
Use Tailwind utility classes throughout. Self-contained components
accepting typed props. Include realistic mock data in screen files
showing all states (lobby empty, lobby full, mid-game, eliminated, etc).
Make it look like a SHIPPED product, not a prototype.
</pasted_text>

<!-- The user explicitly selected the following skills for this project, as attachments to their message. These are not optional context — they define how you work. Use them. -->
<attached-skill name="Hi-fi design">
Create a high-fidelity, polished design. Follow the instructions about design in your system prompt, particularly the 'How to do design work' section. Use the design_canvas starter component, or make a full-bleed prototype and offer options via Tweaks.
</attached-skill>

<attached-skill name="Interactive prototype">
Create a fully interactive prototype with realistic state management and transitions. Use React useState/useEffect for dynamic behavior. Include hover states, click interactions, form validation, animated transitions, and multi-step navigation flows. It should feel like a real working app, not a static mockup.
</attached-skill>


<system-reminder>Auto-injected reminder (ignore if not relevant): do not recreate copyrighted or branded UI unless the user's email domain matches that company. Create original designs instead.</system-reminder>

## Assistant

_[tool: update_todos]_

_[tool: copy_starter_component]_

_[tool: copy_starter_component]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: write_file]_

Now let me build this. I'll create the main HTML with shared components and 9 screens laid out on the design canvas.

_[tool: write_file]_

Now the screens:Now the main HTML file that assembles everything in a design canvas:

_[tool: write_file]_

_[tool: update_todos]_

_[tool: done]_

_[tool: fork_verifier_agent]_

Built **HILL** as a full design canvas — 14 mobile artboards across 4 sections covering all 9 screens plus realistic states:

**01 · Landing & Discovery** — Landing, Profile, Leaderboard
**02 · Hill 4P Flow** — Mode select (Blitz/Survival), Lobby (partial/full), in-play board (Blitz/Survival)
**03 · Classic 2P** — 8×8 mid-game
**04 · End-state overlays** — Death, solo winner, joint kings, no-king draw

Each phone is inside an iOS device bezel so you can judge real one-handed reach. The visual system commits to the brief: pure `#0A0A0A` ground, Inter ExtraBold display, JetBrains Mono for codes/numbers, acid lime as the only accent (Hill zone, CTA, active rings, lime→gold ELO progress). Every piece carries both a color **and** a unique shape (circle/square/triangle/hexagon) for color-blind safety, with a ✦ crown overlay for kings.

**Notable details:**
- The Hill zone on the 10×10 has an animated lime glow + tiny `HILL` mono label tucked in the corner
- Active player gets a 10s circular countdown ring around their dot
- The "ON HILL" status banner under the board shows live piece counts per player
- Death overlay uses a red radial wash; victory uses a lime radial wash; the no-king draw uses pure black with a desaturated wordmark
- Eliminated players are line-through + dimmed in the panel and grayscaled on the board
- Profile shows a Gold→Master ELO bar with a lime→gold gradient

Drag the grip handle on any artboard to reorder; click an artboard to focus it fullscreen (←/→ to step through). Let me know what to push on — I'd start by asking whether you want a few visual directions explored (e.g. an alt mode-select with a side-swipe deck, or a denser leaderboard variant) or whether you'd rather see this turned into a clickable flow.

## User

<system-info comment="Only acknowledge these if relevant">
User is viewing file: HILL.html
</system-info>

<pasted_text name="Pasted text (50 lines)">
ADDITIONS / FIXES to the HILL design:

1. ADD: Mobile bottom navigation bar
   - 3 tabs: HILL (home icon) | TOP (trophy icon) | ME (user icon)
   - Active tab has lime accent (icon + label)
   - Tab labels visible below icons
   - Routes: HILL → /, TOP → /leaderboard, ME → /profile
   - Visible on: /, /leaderboard, /profile
   - Hidden on: /play/*, /r/[id], all overlays (DEATH, GAME OVER)
   - Fixed bottom, respects safe-area-inset-bottom
   - Background #141414 with subtle top border #1F1F1F

2. ADD: Sign-in screen (/login or modal)
   - Shown when anonymous user clicks "Sign in with Google" from profile
   - Single big button: "Continue with Google" with Google G icon
   - Subtext: "Save your wins, ELO, and arena across devices."
   - Subtext below: "You can keep playing as guest without signing in."
   - Background matches landing aesthetic (black + display typography)

3. UPDATE: Landing page
   - Add Welcome chip top-right: if user is signed in → show display name + arena badge + tiny Google G icon; if anonymous → show "Player_a3f9" + arena badge + tiny "Sign in" link
   - Make landing CTA more prominent — 2 big stacked buttons:
     [→ Create Hill Room] (primary lime)
     [Play Classic] (secondary outline)

4. UPDATE: /play/hill flow
   - After mode select (Blitz or Survival), add a step that asks:
     "How do you want to play?"
     [Hot-seat (this device)]  [Multiplayer (invite friends)]
   - Hot-seat → direct to game
   - Multiplayer → create room and redirect

5. UPDATE: Lobby screen
   - REMOVE the Blitz/Survival toggle
   - REPLACE with read-only display: "MODE: ⚡ BLITZ" or "MODE: 💀 SURVIVAL"
   - Mode is locked once room is created
   - Add tiny "← change mode" link below that goes back to /play/hill

6. UPDATE: Death screen
   - Make sure TWO buttons are visible at bottom (sticky, safe-area-aware):
     [👁 Spectate] (lime primary, large)
     [← Leave Room] (outline secondary)
   - Buttons stacked vertically on mobile

7. ADD: Profile screen "Sign in" affordance
   - If user is anonymous: big button "Sign in with Google" near top of profile
   - Subtext: "Your wins and stats will transfer to your account."
   - If user is signed in: show "Signed in as [email]" with sign-out link

Keep all other design tokens, colors, and components as already established.
</pasted_text>

## Assistant

_[tool: list_files]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

I'll add the bottom nav, sign-in screen, play-style selector, and update the existing screens. Let me make the edits in two passes.

_[tool: str_replace_edit]_

Add the `BottomNav` and `GoogleG` icon to components.jsx:

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

Now make all the screens edits:

_[tool: read_file]_

_[tool: read_file]_

_[tool: str_replace_edit]_

Now add BottomNav to leaderboard, add SignIn + PlayStyle screens, and update ScreenModeSelect to lead to PlayStyle:

_[tool: str_replace_edit]_

Now add the SignIn and PlayStyle screens right before the Object.assign:

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now update HILL.html to include the new artboards (Sign-in screen, Play-style step, anonymous landing/profile variants, lobby variants by mode):

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: fork_verifier_agent]_

Added in this pass:

**New screens (Section 01 grew + 02 grew):**
- **Sign-in screen** — full-bleed black with HILL wordmark + lime tick, single Google button, "keep playing as guest" disclaimer
- **Landing · guest** vs **Landing · signed in** — welcome chip swaps between a `?` avatar + lime "Sign in" link and an initialed avatar with a Google G overlay
- **Profile · guest** vs **Profile · signed in** — guest gets a prominent white "Sign in with Google" button up top; signed-in version shows a `SIGNED IN AS aida.k@gmail.com` chip with Sign-out link, plus a small Google G badge on the avatar
- **Play style step** — "How do you want to play?" with Hot-seat vs Multiplayer cards, shown as Step 2/2 after mode select

**Updates:**
- **Bottom nav** (HILL · TOP · ME) on landing, leaderboard, profile only — hidden in-game and on overlays. Active tab gets a lime icon, lime label, and a tiny lime indicator bar above the icon.
- **Lobby mode toggle removed** — replaced with a `MODE · LOCKED` row showing the chosen mode + a small `← change mode` link back to step 1. The lobby now reflects mode via a `mode` prop (Blitz vs Survival variants visible side-by-side).
- **Death screen** — two vertically stacked buttons: lime primary "👁 Spectate" on top, outline "← Leave Room" below.
- **Landing CTAs** bumped to 60/56px height for more thumb weight.
- **Mode select CTA** changed from "Start" to "Continue" since it now leads to play-style.

Drag-rename any artboard label if you want different headings; let me know what to push on next.

## User

Verifier agent check completed

## Assistant

All checks passed. Ready for your next direction.

## User

ADD: Piece skins system

1. Each piece has TWO visual layers:
   - Base: per-player shape (circle/square/triangle/hexagon) — unchanged for
     colorblind accessibility
   - Skin overlay: decorative effect based on user's chosen skin

2. 5 skins to design (each as overlay/effect that works on any base shape):
   - Bronze (default): solid fill, no overlay
   - Silver: subtle gradient (top-lighter to bottom-darker)
   - Gold: soft glow halo around the shape
   - Master: gem-style facets + occasional sparkle particles
   - Champion: small crown ✦ icon top-right + gold glow

3. ADD: Profile screen — Skin Selector
   - Below stats grid, new section "PIECE SKIN"
   - 5 horizontal cards, each shows a sample piece with that skin
   - Locked skins (above user's tier) show 🔒 + "Unlock at [Tier] — [N] wins"
   - Available skins are tappable; selected one has lime border
   - Selection autosaves

4. UPDATE: All Board renders — read skin_id from each player's profile, apply
   overlay to their pieces

5. UPDATE: Lobby — show each player's selected skin in their slot preview
   (small piece sample next to their name + arena badge)

## Assistant

_[tool: update_todos]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now update Board, PlayerSlot, and add SkinCard:

_[tool: grep]_

_[tool: str_replace_edit]_

Now add the SkinCard component for the selector and export the skin system:

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: str_replace_edit]_

Now add the SkinSelector to Profile and the skin badge on the avatar:

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now add a new section in HILL.html showing the skin system and a "skin family" comparison artboard:

_[tool: done]_

_[tool: save_screenshot]_

_[tool: update_todos]_

_[tool: fork_verifier_agent]_

Piece skins shipped:

**System**
- `PieceShape` now takes a `skin` prop; effects are applied as overlays *on top of* the colorblind-safe base shape — never replacing it.
- **Bronze**: solid, no overlay (default)
- **Silver**: top-light → bottom-shadow vertical gradient, clipped to shape
- **Gold**: warm radial sheen + outer gold halo glow
- **Master**: gem facets — central diamond highlight with ridge lines + one sparkle dot top-right + violet outer glow
- **Champion**: same gold base + lime radial sheen + lime ✦ in the top-right corner + lime drop-shadow halo
- Kings still get the centered ✦ above; Champion's corner mark coexists in a different spot.

**Threading**
- `Board` accepts `skinForPlayer={{ 1:'silver', 2:'gold', 3:'bronze', 4:'master' }}` (per-piece `p.skin` also wins) and every board on the canvas now passes it.
- `PlayerSlot` takes a `skin` prop and the 4 mock players in the lobby + in-game panel have skins assigned by their tier.
- The "ON HILL" counters and the death/victory chips show the right skin for the right player.

**Profile**
- New **PIECE SKIN** section below stats — horizontal scrolling cards. Selected gets the lime border + SELECTED pill. Locked skins are dimmed with a lock glyph + `Unlock at Master · 75 wins` style hint.
- The avatar gets a small bottom-left "current skin" sample (P1 circle in the user's chosen skin), and an "Auto-saved" line replaces the old static input affordance.
- Two profile variants on the canvas now: Gold-tier user with Gold skin selected, and a Master-tier user with Master skin selected (more unlocked, fewer locked).

**New section 05 · Piece skins**
- Artboard A: the 5 finishes on one shape, full-card breakdown.
- Artboard B: 4×5 matrix proving every shape works with every skin.

Let me know what to push on next — possible directions: an unlock celebration overlay, season pass progression, or a way to toggle the colorblind-shape system off in Tweaks for users who want a "pure color" view.

## User

Verifier agent check completed

## Assistant

Verifier agreed everything looks good. Ready for whatever's next.

## User

Export each screen as a separate React component (.tsx file) with TypeScript
types and Tailwind classes. For each component, give me:
1. The component code in a code block I can copy
2. The props interface
3. Mock data example

Start with: Landing (both guest and signed-in variants), Sign-in screen,
Profile (both variants), Leaderboard, Hill mode select, Play style select,
Lobby, Board (10×10 Hill version), DeathOverlay, GameOverOverlay (all 3
variants), BottomNav.

## Assistant

Here's the full TypeScript + Tailwind handoff. I'll start with shared setup, then each component you asked for. Every component is **client-side** (`'use client'`) since they all need interactivity.

---

## 0 · Project setup

### `tailwind.config.ts` — add to the `theme.extend` block

```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        hill: {
          bg: '#0A0A0A',
          surface: '#141414',
          'surface-2': '#1A1A1A',
          border: '#1F1F1F',
          'border-hi': '#2A2A2A',
          text: '#FAFAFA',
          muted: '#808080',
          dim: '#525252',
          accent: '#BFFF00',
          danger: '#FF3B30',
          p1: '#FFFFFF', p2: '#1A1A1A', p3: '#FF2D87', p4: '#00D9FF',
          bronze: '#CD7F32', silver: '#C0C0C0', gold: '#FFD700',
          master: '#9B59B6', champion: '#BFFF00',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui'],
        mono: ['var(--font-jetbrains)', 'ui-monospace'],
      },
      letterSpacing: { display: '-0.04em' },
      keyframes: {
        'hill-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(191,255,0,0.4), inset 0 0 12px rgba(191,255,0,0.18)' },
          '50%':     { boxShadow: '0 0 28px 0 rgba(191,255,0,0.25), inset 0 0 18px rgba(191,255,0,0.32)' },
        },
        'hill-pulse': { '0%, 100%': { opacity: '0.55' }, '50%': { opacity: '1' } },
        'hill-rise': { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'none' } },
        'hill-fadein': { from: { opacity: '0' }, to: { opacity: '1' } },
      },
      animation: {
        'hill-glow':   'hill-glow 2.4s ease-in-out infinite',
        'hill-pulse':  'hill-pulse 1.4s ease-in-out infinite',
        'hill-rise':   'hill-rise .5s ease',
        'hill-fadein': 'hill-fadein .35s ease',
      },
    },
  },
};
export default config;
```

### `types/hill.ts`

```ts
export type Player = 1 | 2 | 3 | 4;
export type Coord = [row: number, col: number];
export type PieceKind = 'pawn' | 'king';
export type ArenaTier = 'Bronze' | 'Silver' | 'Gold' | 'Master' | 'Champion';
export type SkinId = 'bronze' | 'silver' | 'gold' | 'master' | 'champion';
export type GameMode = 'blitz' | 'survival';
export type PlayStyle = 'hotseat' | 'multi';

export interface Piece {
  player: Player;
  kind: PieceKind;
  pos: Coord;
  skin?: SkinId;
  dimmed?: boolean;
}

export interface Profile {
  id: string;
  displayName: string;
  email?: string;
  totalWins: number;
  totalGames: number;
  arenaTier: ArenaTier;
  selectedSkin: SkinId;
  elo: number;
}

export interface LobbyPlayer {
  player: Player;
  name: string;
  tier: ArenaTier;
  skin: SkinId;
  isHost?: boolean;
  isYou?: boolean;
}

export interface GamePlayer extends LobbyPlayer {
  isActive?: boolean;
  secondsLeft?: number;
  secondsTotal?: number;
  eliminated?: boolean;
}
```

### `lib/skins.ts`

```ts
import type { ArenaTier, SkinId } from '@/types/hill';

export const TIER_RANK: Record<ArenaTier, number> = {
  Bronze: 0, Silver: 1, Gold: 2, Master: 3, Champion: 4,
};

export const SKINS: Record<SkinId, { name: string; tier: ArenaTier; color: string; tag: string }> = {
  bronze:   { name: 'Bronze',   tier: 'Bronze',   color: '#CD7F32', tag: 'DEFAULT' },
  silver:   { name: 'Silver',   tier: 'Silver',   color: '#C0C0C0', tag: 'GRADIENT' },
  gold:     { name: 'Gold',     tier: 'Gold',     color: '#FFD700', tag: 'HALO' },
  master:   { name: 'Master',   tier: 'Master',   color: '#9B59B6', tag: 'FACETS' },
  champion: { name: 'Champion', tier: 'Champion', color: '#BFFF00', tag: 'CROWN' },
};

export const TIER_META: Record<ArenaTier, { icon: string; color: string }> = {
  Bronze:   { icon: '🥉', color: '#CD7F32' },
  Silver:   { icon: '🥈', color: '#C0C0C0' },
  Gold:     { icon: '🥇', color: '#FFD700' },
  Master:   { icon: '◆',  color: '#9B59B6' },
  Champion: { icon: '👑', color: '#BFFF00' },
};

export const WINS_TO_UNLOCK: Record<ArenaTier, number> = {
  Bronze: 0, Silver: 5, Gold: 25, Master: 75, Champion: 150,
};

export const skinUnlocked = (skin: SkinId, userTier: ArenaTier) =>
  TIER_RANK[SKINS[skin].tier] <= TIER_RANK[userTier];
```

---

## 1 · Shared primitives

### `components/hill/PieceShape.tsx`

```tsx
'use client';
import { useId } from 'react';
import type { Player, SkinId } from '@/types/hill';

export interface PieceShapeProps {
  player: Player;
  size?: number;
  isKing?: boolean;
  dimmed?: boolean;
  skin?: SkinId;
}

const PLAYER_FILL: Record<Player, string> = { 1: '#FFFFFF', 2: '#1A1A1A', 3: '#FF2D87', 4: '#00D9FF' };

export function PieceShape({ player, size = 28, isKing = false, dimmed = false, skin = 'bronze' }: PieceShapeProps) {
  const fill = PLAYER_FILL[player];
  const stroke = player === 2 ? '#3a3a3a' : 'rgba(0,0,0,0.35)';
  const innerShine = player === 2 ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.25)';
  const s = size, half = s / 2;
  const uid = useId().replace(/:/g, '_');

  const buildShape = (props: React.SVGProps<SVGElement>) => {
    if (player === 1) return <circle key="s" cx={half} cy={half} r={half - 1.5} {...(props as any)} />;
    if (player === 2) return <rect key="s" x={2} y={2} width={s - 4} height={s - 4} rx={s * 0.18} {...(props as any)} />;
    if (player === 3) return <polygon key="s" points={`${half},${3} ${s - 2},${s - 3} ${2},${s - 3}`} strokeLinejoin="round" {...(props as any)} />;
    const r = half - 1.5;
    const pts = Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i - Math.PI / 2;
      return `${half + r * Math.cos(a)},${half + r * Math.sin(a)}`;
    }).join(' ');
    return <polygon key="s" points={pts} strokeLinejoin="round" {...(props as any)} />;
  };

  const isChampion = skin === 'champion';
  const isGold = skin === 'gold' || isChampion;
  const isMaster = skin === 'master';
  const isSilver = skin === 'silver';

  const glowColor =
    isChampion ? '#BFFF00' : (skin === 'gold' ? '#FFD700' : isMaster ? '#B380E0' : null);
  const filter = glowColor
    ? `drop-shadow(0 0 ${Math.max(1.5, s * 0.14)}px ${glowColor}) drop-shadow(0 0 ${Math.max(3, s * 0.28)}px ${glowColor}99) drop-shadow(0 1px 1px rgba(0,0,0,0.35))`
    : 'drop-shadow(0 1px 1px rgba(0,0,0,0.35))';

  return (
    <div className={`relative ${dimmed ? 'opacity-40 grayscale' : ''}`} style={{ width: s, height: s }}>
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ filter, overflow: 'visible' }} className="block">
        <defs>
          <clipPath id={`clip-${uid}`}>{buildShape({ fill: '#000' })}</clipPath>
          <linearGradient id={`silver-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.35" />
          </linearGradient>
          <radialGradient id={`gold-${uid}`} cx="50%" cy="38%" r="60%">
            <stop offset="0" stopColor="#FFF1A8" stopOpacity="0.85" />
            <stop offset="0.5" stopColor="#FFD700" stopOpacity="0.35" />
            <stop offset="1" stopColor="#FFD700" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`champ-${uid}`} cx="50%" cy="40%" r="65%">
            <stop offset="0" stopColor="#FAFFD6" stopOpacity="0.85" />
            <stop offset="0.6" stopColor="#BFFF00" stopOpacity="0.35" />
            <stop offset="1" stopColor="#BFFF00" stopOpacity="0" />
          </radialGradient>
        </defs>

        {buildShape({ fill, stroke, strokeWidth: 1.5 })}

        {isSilver && <g clipPath={`url(#clip-${uid})`}><rect width={s} height={s} fill={`url(#silver-${uid})`} /></g>}
        {(skin === 'gold' || isChampion) && (
          <g clipPath={`url(#clip-${uid})`}>
            <rect width={s} height={s} fill={`url(#${isChampion ? 'champ' : 'gold'}-${uid})`} />
          </g>
        )}

        {isMaster && (
          <g clipPath={`url(#clip-${uid})`}>
            <polygon
              points={`${half},${half - s * 0.22} ${half + s * 0.18},${half} ${half},${half + s * 0.22} ${half - s * 0.18},${half}`}
              fill="rgba(255,255,255,0.32)" stroke="rgba(255,255,255,0.5)" strokeWidth={Math.max(0.4, s * 0.018)}
            />
            <line x1={half} y1={half - s * 0.22} x2={half} y2={2}    stroke="rgba(255,255,255,0.25)" strokeWidth={Math.max(0.4, s * 0.022)} />
            <line x1={half + s * 0.18} y1={half} x2={s - 2} y2={half} stroke="rgba(0,0,0,0.25)"       strokeWidth={Math.max(0.4, s * 0.022)} />
            <line x1={half} y1={half + s * 0.22} x2={half} y2={s - 2} stroke="rgba(0,0,0,0.18)"       strokeWidth={Math.max(0.4, s * 0.022)} />
            <line x1={half - s * 0.18} y1={half} x2={2} y2={half}     stroke="rgba(255,255,255,0.2)"  strokeWidth={Math.max(0.4, s * 0.022)} />
          </g>
        )}

        <g clipPath={isMaster ? `url(#clip-${uid})` : undefined}>
          <ellipse cx={half} cy={half * 0.55} rx={half * 0.55} ry={half * 0.22} fill={innerShine} />
        </g>

        {isMaster && s >= 14 && (
          <g transform={`translate(${s * 0.74}, ${s * 0.24})`}>
            <circle r={Math.max(0.8, s * 0.045)} fill="#fff" />
            <line x1="0" y1={-s * 0.11} x2="0" y2={s * 0.11} stroke="#fff" strokeWidth={Math.max(0.5, s * 0.022)} strokeLinecap="round" />
            <line x1={-s * 0.11} y1="0" x2={s * 0.11} y2="0" stroke="#fff" strokeWidth={Math.max(0.5, s * 0.022)} strokeLinecap="round" />
          </g>
        )}
      </svg>

      {isChampion && (
        <div className="absolute font-black leading-none text-hill-accent pointer-events-none"
          style={{ top: -s * 0.08, right: -s * 0.1, fontSize: s * 0.34, textShadow: '0 0 6px rgba(191,255,0,0.85)' }}>✦</div>
      )}
      {isKing && (
        <div className="absolute left-1/2 -translate-x-1/2 font-black leading-none text-hill-accent pointer-events-none"
          style={{ top: -s * 0.22, fontSize: s * 0.42, textShadow: '0 0 6px rgba(191,255,0,0.7)' }}>✦</div>
      )}
    </div>
  );
}
```

### `components/hill/ArenaBadge.tsx`

```tsx
import type { ArenaTier } from '@/types/hill';
import { TIER_META } from '@/lib/skins';

export interface ArenaBadgeProps {
  tier: ArenaTier;
  size?: 'sm' | 'md';
}

export function ArenaBadge({ tier, size = 'sm' }: ArenaBadgeProps) {
  const m = TIER_META[tier];
  const sm = size === 'sm';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-white/[0.04] font-semibold uppercase whitespace-nowrap leading-none ${
        sm ? 'text-[10px] py-[2px] pr-[7px] pl-[5px]' : 'text-xs py-1 pr-2.5 pl-2'
      }`}
      style={{ borderWidth: 1, borderStyle: 'solid', borderColor: `${m.color}40`, color: m.color, letterSpacing: 0.2 }}
    >
      <span style={{ fontSize: sm ? 10 : 13 }}>{m.icon}</span>
      {tier}
    </span>
  );
}
```

### `components/hill/CTAButton.tsx`

```tsx
'use client';
export interface CTAButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  full?: boolean;
}

export function CTAButton({ variant = 'primary', full = true, className = '', children, ...rest }: CTAButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-xl h-[54px] px-6 text-[17px] font-bold tracking-[-0.01em] transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed';
  const v = {
    primary:   'bg-hill-accent text-hill-bg',
    secondary: 'bg-transparent text-hill-text border border-hill-border-hi',
    danger:    'bg-transparent text-hill-danger border border-hill-danger/40',
  }[variant];
  return (
    <button className={`${base} ${v} ${full ? 'w-full' : ''} ${className}`} {...rest}>{children}</button>
  );
}
```

### `components/hill/TopBar.tsx`

```tsx
export interface TopBarProps {
  onBack?: () => void;
  code?: string;
  title?: string;
  right?: React.ReactNode;
}

export function TopBar({ onBack, code, title, right }: TopBarProps) {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between bg-hill-bg border-b border-hill-border px-4 pt-[14px] pb-3">
      <div className="flex items-center gap-2.5">
        {onBack !== undefined && (
          <button
            onClick={onBack}
            className="h-9 w-9 rounded-[10px] bg-hill-surface border border-hill-border inline-flex items-center justify-center text-hill-text active:scale-95"
            aria-label="Back"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5"/></svg>
          </button>
        )}
        {code && (
          <div className="font-mono text-xs font-bold text-hill-muted tracking-[0.18em]">
            ROOM · <span className="text-hill-text">{code}</span>
          </div>
        )}
        {title && <div className="text-[15px] font-semibold">{title}</div>}
      </div>
      {right && <div className="flex items-center gap-2">{right}</div>}
    </div>
  );
}
```

### `components/hill/TurnTimer.tsx`

```tsx
export interface TurnTimerProps {
  seconds: number;
  total?: number;
  size?: number;
  color?: string;
  children?: React.ReactNode;
}

export function TurnTimer({ seconds, total = 10, size = 44, color = '#BFFF00', children }: TurnTimerProps) {
  const r = (size - 4) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="2.5"
          strokeDasharray={c} strokeDashoffset={c * (1 - seconds / total)}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset .9s linear' }}
        />
      </svg>
      {children}
    </div>
  );
}
```

### `components/hill/PlayerSlot.tsx`

```tsx
import { ArenaBadge } from './ArenaBadge';
import { PieceShape } from './PieceShape';
import { TurnTimer } from './TurnTimer';
import type { Player, ArenaTier, SkinId } from '@/types/hill';

export interface PlayerSlotProps {
  player: Player;
  name?: string;
  tier?: ArenaTier;
  skin?: SkinId;
  isHost?: boolean;
  isYou?: boolean;
  empty?: boolean;
  eliminated?: boolean;
  isActive?: boolean;
  secondsLeft?: number;
  secondsTotal?: number;
  compact?: boolean;
}

const COLOR: Record<Player, string> = { 1: '#FFFFFF', 2: '#1A1A1A', 3: '#FF2D87', 4: '#00D9FF' };

export function PlayerSlot(p: PlayerSlotProps) {
  const compact = p.compact;
  return (
    <div
      className={`relative flex items-center overflow-hidden rounded-[14px] bg-hill-surface ${
        p.eliminated ? 'opacity-55' : ''
      } ${compact ? 'gap-2.5 p-[10px_12px] min-h-[64px]' : 'gap-3 p-[14px] min-h-[88px]'}`}
      style={{
        borderWidth: 1.5,
        borderStyle: 'solid',
        borderColor: p.isActive ? '#BFFF00' : p.empty ? 'rgba(255,255,255,0.06)' : '#1F1F1F',
      }}
    >
      <div
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ background: p.empty ? 'transparent' : COLOR[p.player], opacity: p.eliminated ? 0.3 : 1 }}
      />
      {p.isActive && p.secondsLeft != null ? (
        <TurnTimer seconds={p.secondsLeft} total={p.secondsTotal ?? 10} size={compact ? 36 : 44}>
          <PieceShape player={p.player} size={compact ? 18 : 22} skin={p.skin} />
        </TurnTimer>
      ) : (
        <div
          className={`flex items-center justify-center rounded-full bg-white/[0.03] ${compact ? 'h-9 w-9' : 'h-11 w-11'}`}
          style={{ borderWidth: 1, borderStyle: p.empty ? 'dashed' : 'solid', borderColor: p.empty ? '#2A2A2A' : 'rgba(255,255,255,0.06)' }}
        >
          {p.empty
            ? <span className="text-hill-dim text-lg leading-none">+</span>
            : <PieceShape player={p.player} size={compact ? 18 : 22} skin={p.skin} />}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-bold truncate ${compact ? 'text-sm' : 'text-[15px]'} ${
              p.empty ? 'text-hill-dim' : 'text-hill-text'
            } ${p.eliminated ? 'line-through' : ''}`}
          >
            {p.empty ? 'Waiting…' : p.name}
          </span>
          {p.isYou && !p.empty && <span className="text-[9px] font-bold text-hill-accent tracking-[0.1em]">YOU</span>}
          {p.isHost && !p.empty && <span className="text-[9px] font-bold text-hill-muted tracking-[0.1em]">HOST</span>}
        </div>
        <div className="mt-1 flex items-center gap-1.5">
          {p.empty ? (
            <span className="font-mono text-[11px] text-hill-dim">Slot P{p.player} · open</span>
          ) : p.eliminated ? (
            <span className="text-[11px] font-bold text-hill-danger tracking-[0.08em]">ELIMINATED</span>
          ) : (
            p.tier && <ArenaBadge tier={p.tier} />
          )}
        </div>
      </div>
    </div>
  );
}
```

### `components/hill/Board.tsx` (covers the 10×10 Hill version)

```tsx
'use client';
import { PieceShape } from './PieceShape';
import type { Piece, Coord, Player, SkinId } from '@/types/hill';

export interface BoardProps {
  size?: 8 | 10;
  pieces: Piece[];
  centerZone?: Coord[];
  highlighted?: Coord[];
  selected?: Coord | null;
  lastMove?: Coord[] | null;
  cellSize?: number;
  skinForPlayer?: Partial<Record<Player, SkinId>>;
  onSquareClick?: (c: Coord) => void;
}

export function Board({
  size = 10, pieces, centerZone = [], highlighted = [], selected = null,
  lastMove = null, cellSize, skinForPlayer = {}, onSquareClick,
}: BoardProps) {
  const cs = cellSize ?? (size === 10 ? 33 : 41);
  const total = size * cs;

  const zoneBounds = centerZone.length > 0 ? (() => {
    const rs = centerZone.map(p => p[0]); const cs2 = centerZone.map(p => p[1]);
    return {
      top: Math.min(...rs) * cs, left: Math.min(...cs2) * cs,
      height: (Math.max(...rs) - Math.min(...rs) + 1) * cs,
      width: (Math.max(...cs2) - Math.min(...cs2) + 1) * cs,
    };
  })() : null;

  return (
    <div
      className="relative rounded-md overflow-hidden bg-hill-surface"
      style={{
        width: total, height: total,
        boxShadow: '0 0 0 1px #2A2A2A, 0 20px 40px rgba(0,0,0,0.5), 0 0 0 6px #141414',
      }}
    >
      <div className="grid" style={{ gridTemplateColumns: `repeat(${size}, ${cs}px)`, gridTemplateRows: `repeat(${size}, ${cs}px)` }}>
        {Array.from({ length: size * size }).map((_, i) => {
          const r = Math.floor(i / size), c = i % size;
          const dark = (r + c) % 2 === 1;
          return (
            <div
              key={i}
              onClick={onSquareClick ? () => onSquareClick([r, c]) : undefined}
              className="relative"
              style={{ background: dark ? '#1A1A1A' : '#262626' }}
            />
          );
        })}
      </div>

      {zoneBounds && (
        <div
          className="absolute rounded-sm pointer-events-none animate-hill-glow"
          style={{
            top: zoneBounds.top, left: zoneBounds.left, width: zoneBounds.width, height: zoneBounds.height,
            border: '1.5px solid #BFFF00',
            background: 'linear-gradient(135deg, rgba(191,255,0,0.06), rgba(191,255,0,0.02))',
          }}
        >
          <div className="absolute top-[3px] left-[5px] font-mono text-[8px] font-bold text-hill-accent tracking-[0.12em] opacity-90">HILL</div>
        </div>
      )}

      {highlighted.map(([r, c], i) => (
        <div key={`h${i}`} className="absolute rounded-full bg-hill-accent pointer-events-none"
          style={{
            top: r * cs + cs * 0.35, left: c * cs + cs * 0.35, width: cs * 0.3, height: cs * 0.3,
            opacity: 0.6, boxShadow: '0 0 8px #BFFF00',
          }} />
      ))}

      {selected && (
        <div className="absolute pointer-events-none"
          style={{ top: selected[0] * cs, left: selected[1] * cs, width: cs, height: cs, boxShadow: 'inset 0 0 0 2px #BFFF00' }} />
      )}

      {lastMove?.map(([r, c], i) => (
        <div key={`l${i}`} className="absolute pointer-events-none"
          style={{ top: r * cs, left: c * cs, width: cs, height: cs, background: 'rgba(191,255,0,0.08)' }} />
      ))}

      {pieces.map((p, i) => (
        <div
          key={i}
          className="absolute transition-[top,left] duration-200 ease-out"
          style={{
            top: p.pos[0] * cs + (cs - cs * 0.7) / 2,
            left: p.pos[1] * cs + (cs - cs * 0.7) / 2,
            width: cs * 0.7, height: cs * 0.7,
          }}
        >
          <PieceShape
            player={p.player}
            size={cs * 0.7}
            isKing={p.kind === 'king'}
            dimmed={p.dimmed}
            skin={p.skin ?? skinForPlayer[p.player] ?? 'bronze'}
          />
        </div>
      ))}
    </div>
  );
}
```

**Mock data — Board (10×10 Hill mid-game)**

```ts
import type { Piece, Coord } from '@/types/hill';

export const hillPieces: Piece[] = [
  // P1 (white)
  ...[[0,1],[0,3],[1,0],[1,2],[2,1],[3,4]].map<Piece>(pos => ({ player: 1, kind: 'pawn', pos: pos as Coord })),
  { player: 1, kind: 'king', pos: [4, 4] },
  // P2 (black)
  ...[[0,6],[0,8],[1,7],[1,9],[2,8],[3,7]].map<Piece>(pos => ({ player: 2, kind: 'pawn', pos: pos as Coord })),
  { player: 2, kind: 'pawn', pos: [4, 5] },
  // P3 (pink, eliminated/dimmed)
  ...[[9,6],[9,8],[8,7]].map<Piece>(pos => ({ player: 3, kind: 'pawn', pos: pos as Coord, dimmed: true })),
  // P4 (cyan)
  ...[[9,1],[9,3],[8,0],[8,2],[7,1],[6,4]].map<Piece>(pos => ({ player: 4, kind: 'pawn', pos: pos as Coord })),
  { player: 4, kind: 'king', pos: [5, 5] },
];

export const hillCenterZone: Coord[] = [[4, 4], [4, 5], [5, 4], [5, 5]];
export const hillSkins = { 1: 'silver', 2: 'gold', 3: 'bronze', 4: 'master' } as const;
```

---

## 2 · Navigation: `components/hill/BottomNav.tsx`

```tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type BottomNavTab = 'hill' | 'top' | 'me';
export interface BottomNavProps {
  active?: BottomNavTab; // override path detection if needed
}

const TABS: { id: BottomNavTab; label: string; href: string; icon: JSX.Element }[] = [
  { id: 'hill', label: 'HILL', href: '/',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 19l5-8 4 5 3-4 6 7"/><path d="M3 19h18"/></svg> },
  { id: 'top', label: 'TOP', href: '/leaderboard',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 4h10v4a5 5 0 01-10 0V4z"/><path d="M7 4H4v2a3 3 0 003 3M17 4h3v2a3 3 0 01-3 3"/><path d="M9 13h6l-1 4h-4l-1-4zM8 21h8"/></svg> },
  { id: 'me', label: 'ME', href: '/profile',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6"/></svg> },
];

export function BottomNav({ active }: BottomNavProps) {
  const path = usePathname();
  const detected: BottomNavTab =
    path === '/leaderboard' ? 'top' : path === '/profile' ? 'me' : 'hill';
  const current = active ?? detected;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex bg-hill-surface border-t border-hill-border pt-2"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)' }}
    >
      {TABS.map(t => {
        const isActive = current === t.id;
        return (
          <Link
            key={t.id}
            href={t.href}
            className={`relative flex-1 flex flex-col items-center gap-1 py-1.5 min-h-[44px] ${
              isActive ? 'text-hill-accent' : 'text-hill-muted'
            }`}
          >
            {isActive && (
              <div
                className="absolute -top-2 h-[3px] w-7 rounded-sm bg-hill-accent"
                style={{ boxShadow: '0 0 8px #BFFF00' }}
              />
            )}
            <div style={{ filter: isActive ? 'drop-shadow(0 0 4px #BFFF0060)' : 'none' }}>{t.icon}</div>
            <div className="text-[10px] font-extrabold tracking-[0.18em]">{t.label}</div>
          </Link>
        );
      })}
    </nav>
  );
}
```

---

## 3 · Screens

### `components/hill/screens/Landing.tsx`

Handles **both** guest and signed-in via prop.

```tsx
'use client';
import { CTAButton } from '../CTAButton';
import { ArenaBadge } from '../ArenaBadge';
import { BottomNav } from '../BottomNav';
import type { Profile } from '@/types/hill';

export interface LandingProps {
  profile: Profile | null; // null = guest
  onCreateRoom: () => void;
  onPlayClassic: () => void;
  onSignIn?: () => void;
}

export function Landing({ profile, onCreateRoom, onPlayClassic, onSignIn }: LandingProps) {
  const signedIn = !!profile;
  return (
    <div className="relative min-h-screen bg-hill-bg text-hill-text overflow-hidden pb-24">
      {/* Welcome chip */}
      <div className="absolute right-4 top-16 z-10 flex items-center gap-2 rounded-full bg-hill-surface border border-hill-border py-[5px] pl-[5px] pr-2.5 text-xs font-semibold">
        {signedIn ? (
          <>
            <div className="relative h-[26px] w-[26px] rounded-full bg-gradient-to-br from-neutral-700 to-neutral-900 flex items-center justify-center text-xs font-extrabold">
              {profile.displayName[0]?.toUpperCase()}
              <div className="absolute -bottom-0.5 -right-0.5 h-[13px] w-[13px] rounded-full bg-hill-bg p-[1.5px] flex items-center justify-center">
                <GoogleG size={9} />
              </div>
            </div>
            <span>{profile.displayName}</span>
            <ArenaBadge tier={profile.arenaTier} />
          </>
        ) : (
          <>
            <div className="h-[26px] w-[26px] rounded-full bg-gradient-to-br from-neutral-800 to-neutral-950 flex items-center justify-center text-[11px] font-extrabold text-hill-muted">?</div>
            <span className="font-mono">Player_a3f9</span>
            <span className="text-hill-muted">·</span>
            <button onClick={onSignIn} className="text-[11px] font-bold text-hill-accent tracking-wide">Sign&nbsp;in</button>
          </>
        )}
      </div>

      {/* HILL display */}
      <div className="relative px-6 pt-24">
        <div
          className="font-extrabold tracking-display"
          style={{
            fontSize: 168, lineHeight: 0.85,
            background: 'linear-gradient(180deg, #FAFAFA 0%, #FAFAFA 55%, #707070 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}
        >HILL</div>
        <div className="absolute left-6 h-1 w-9 bg-hill-accent" style={{ top: 240, boxShadow: '0 0 12px #BFFF00' }} />
        <p className="mt-6 max-w-[280px] text-[17px] leading-snug text-hill-muted">
          King of the Board.<br />
          <span className="font-semibold text-hill-text">4 players. 3 minutes.</span>
        </p>
      </div>

      {/* CTAs above nav */}
      <div className="absolute inset-x-0 bottom-[92px] px-5">
        <div className="flex flex-col gap-3">
          <CTAButton variant="primary" onClick={onCreateRoom} className="!h-[60px] !text-lg">
            →  Create Hill Room
          </CTAButton>
          <CTAButton variant="secondary" onClick={onPlayClassic} className="!h-14">Play Classic</CTAButton>
        </div>
        <div className="mt-3.5 text-center font-mono text-[10px] tracking-[0.16em] text-hill-dim">v1.0 · 2026 HILL</div>
      </div>

      <BottomNav active="hill" />
    </div>
  );
}

function GoogleG({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className="block">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.6 8.4 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.3C29.2 35 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4 5.6l6.2 5.3c-.4.3 6.5-4.7 6.5-15 0-1.3-.1-2.6-.4-3.9z"/>
    </svg>
  );
}
```

**Mock data — Landing**

```ts
import type { Profile } from '@/types/hill';

export const signedInProfile: Profile = {
  id: 'usr_aida',
  displayName: 'Aida K.',
  email: 'aida.k@gmail.com',
  totalWins: 88,
  totalGames: 160,
  arenaTier: 'Gold',
  selectedSkin: 'gold',
  elo: 1996,
};

export const guestProfile = null;
```

---

### `components/hill/screens/SignIn.tsx`

```tsx
'use client';

export interface SignInProps {
  onContinueGoogle: () => void;
  onDismiss: () => void;
}

export function SignIn({ onContinueGoogle, onDismiss }: SignInProps) {
  return (
    <div className="relative min-h-screen bg-hill-bg text-hill-text overflow-hidden">
      <div className="absolute right-4 top-16 z-10">
        <button
          onClick={onDismiss}
          aria-label="Close"
          className="h-9 w-9 rounded-full bg-hill-surface border border-hill-border flex items-center justify-center text-hill-text active:scale-95"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 3l8 8M11 3l-8 8"/></svg>
        </button>
      </div>

      <div className="flex flex-col px-6 pt-24 pb-6 min-h-screen">
        <div className="font-extrabold tracking-display" style={{ fontSize: 88, lineHeight: 0.9 }}>HILL</div>
        <div className="mt-3 h-[3px] w-7 bg-hill-accent" style={{ boxShadow: '0 0 10px #BFFF00' }} />

        <div className="mt-9">
          <div className="text-[11px] font-bold text-hill-accent tracking-[0.24em]">ACCOUNT</div>
          <h2 className="mt-2 font-extrabold tracking-display" style={{ fontSize: 36, lineHeight: 1 }}>
            Keep your<br />crown.
          </h2>
          <p className="mt-3.5 max-w-[320px] text-[15px] leading-snug text-hill-muted">
            Save your wins, ELO, and arena across every device. One tap, no password.
          </p>
        </div>

        <div className="flex-1" />

        <div>
          <button
            onClick={onContinueGoogle}
            className="flex h-[60px] w-full items-center justify-center gap-3 rounded-xl bg-hill-text text-hill-bg text-base font-bold tracking-[-0.01em] active:scale-[0.98]"
          >
            <svg width="22" height="22" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.6 8.4 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.3C29.2 35 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4 5.6l6.2 5.3c-.4.3 6.5-4.7 6.5-15 0-1.3-.1-2.6-.4-3.9z"/></svg>
            Continue with Google
          </button>
          <div className="mt-3.5 rounded-[10px] border border-dashed border-hill-border p-2.5 text-center text-xs leading-relaxed text-hill-muted">
            You can keep playing as guest without signing in.<br />
            <span className="font-mono text-[10px] tracking-[0.08em] text-hill-dim">STATS WON'T SYNC</span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Mock data — none required; usage example:**

```tsx
<SignIn onContinueGoogle={() => signIn('google')} onDismiss={() => router.back()} />
```

---

### `components/hill/screens/Profile.tsx`

```tsx
'use client';
import { useRef } from 'react';
import { ArenaBadge } from '../ArenaBadge';
import { BottomNav } from '../BottomNav';
import { PieceShape } from '../PieceShape';
import { SKINS, skinUnlocked, WINS_TO_UNLOCK } from '@/lib/skins';
import type { Profile, SkinId } from '@/types/hill';

export interface ProfileScreenProps {
  profile: Profile | null;
  onSignIn?: () => void;
  onSignOut?: () => void;
  onResetAccount?: () => void;
  onSelectSkin?: (skin: SkinId) => void;
  onChangeName?: (name: string) => void;
}

export function ProfileScreen({
  profile, onSignIn, onSignOut, onResetAccount, onSelectSkin, onChangeName,
}: ProfileScreenProps) {
  const signedIn = !!profile;
  const userTier = profile?.arenaTier ?? 'Bronze';
  const skin = profile?.selectedSkin ?? 'bronze';
  const nameRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative min-h-screen bg-hill-bg text-hill-text">
      <div className="sticky top-0 z-10 flex items-center bg-hill-bg border-b border-hill-border px-4 pt-[14px] pb-3">
        <div className="text-[15px] font-semibold">Profile</div>
      </div>

      <div className="flex flex-col items-center px-5 pt-5 pb-28">
        {/* Avatar */}
        <div className="relative flex h-[110px] w-[110px] items-center justify-center rounded-full bg-gradient-to-br from-neutral-800 to-neutral-950 border-2 border-hill-border text-[44px] font-extrabold">
          {profile?.displayName[0]?.toUpperCase() ?? '?'}
          {signedIn && (
            <div className="absolute -top-0.5 -right-0.5 h-6 w-6 rounded-full bg-hill-bg p-0.5 border-[1.5px] border-hill-border flex items-center justify-center">
              <GoogleG size={16} />
            </div>
          )}
          <div className="absolute -bottom-1 -left-1 flex h-[38px] w-[38px] items-center justify-center rounded-full bg-hill-bg border-[1.5px] border-hill-border-hi">
            <PieceShape player={1} size={24} skin={skin} />
          </div>
          <div
            className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-hill-bg py-1.5 pl-2.5 pr-3 text-[11px] font-extrabold tracking-[0.12em]"
            style={{ bottom: -8, borderWidth: 1.5, borderStyle: 'solid', borderColor: '#FFD70060', color: '#FFD700' }}
          >
            <span>🥇</span> {userTier.toUpperCase()} · TIER III
          </div>
        </div>

        {/* Sign-in CTA / signed-in chip */}
        {!signedIn ? (
          <div className="mt-9 w-full">
            <button
              onClick={onSignIn}
              className="flex h-14 w-full items-center justify-center gap-2.5 rounded-xl bg-hill-text text-hill-bg text-[15px] font-bold active:scale-[0.98]"
            >
              <GoogleG size={20} /> Sign in with Google
            </button>
            <div className="mt-2.5 text-center text-xs leading-snug text-hill-muted">
              Your wins and stats will transfer<br />to your account.
            </div>
          </div>
        ) : (
          <div className="mt-[30px] flex w-full items-center gap-2.5 rounded-[10px] border border-hill-accent/20 bg-hill-accent/[0.04] px-3.5 py-2.5">
            <GoogleG size={16} />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold tracking-[0.14em] text-hill-muted">SIGNED IN AS</div>
              <div className="truncate text-[13px] font-semibold">{profile.email}</div>
            </div>
            <button onClick={onSignOut} className="text-[11px] font-semibold text-hill-muted tracking-wide">Sign out</button>
          </div>
        )}

        {/* Name */}
        <div className="mt-5 w-full">
          <div className="mb-2 text-[10px] font-bold tracking-[0.18em] text-hill-muted">DISPLAY NAME</div>
          <div className="flex items-center gap-2 rounded-xl border border-hill-border-hi bg-hill-surface px-4 py-3.5 text-[17px] font-semibold">
            <input
              ref={nameRef}
              defaultValue={profile?.displayName ?? 'Player_a3f9'}
              onBlur={(e) => onChangeName?.(e.target.value)}
              className="flex-1 bg-transparent outline-none"
            />
            <span className="font-mono text-[11px] tracking-[0.08em] text-hill-dim">SAVED ✓</span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="mt-5 grid w-full grid-cols-3 overflow-hidden rounded-[14px] border border-hill-border bg-hill-surface">
          {[
            { label: 'TOTAL WINS', value: profile?.totalWins ?? 0 },
            { label: 'GAMES', value: profile?.totalGames ?? 0 },
            { label: 'WIN RATE', value: profile ? `${Math.round((profile.totalWins / Math.max(1, profile.totalGames)) * 100)}%` : '—' },
          ].map((s, i) => (
            <div key={s.label} className={`px-3 py-4 text-center ${i < 2 ? 'border-r border-hill-border' : ''}`}>
              <div className="font-mono text-[26px] font-bold">{s.value}</div>
              <div className="mt-0.5 text-[10px] tracking-[0.14em] text-hill-muted">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tier progress */}
        <div className="mt-3.5 w-full">
          <div className="mb-1.5 flex justify-between font-mono text-[11px] tracking-[0.08em] text-hill-muted">
            <span>{userTier.toUpperCase()} · TIER III</span><span>→ MASTER · 240 ELO</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-hill-surface">
            <div className="h-full" style={{ width: '62%', background: 'linear-gradient(90deg, #FFD700, #BFFF00)', boxShadow: '0 0 12px #BFFF00' }} />
          </div>
        </div>

        {/* Skin selector */}
        <div className="mt-5 w-full">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-[10px] font-bold tracking-[0.18em] text-hill-muted">PIECE SKIN</div>
            <div className="font-mono text-[10px] tracking-[0.08em] text-hill-dim">SHAPE STAYS THE SAME</div>
          </div>
          <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {(Object.keys(SKINS) as SkinId[]).map(sk => {
              const unlocked = skinUnlocked(sk, userTier);
              const tier = SKINS[sk].tier;
              return (
                <SkinCard
                  key={sk} skinId={sk}
                  selected={skin === sk}
                  locked={!unlocked}
                  unlockText={unlocked ? null : `Unlock at ${tier} · ${WINS_TO_UNLOCK[tier]} wins`}
                  onClick={() => unlocked && onSelectSkin?.(sk)}
                />
              );
            })}
          </div>
          <div className="mt-2 font-mono text-[11px] tracking-wide text-hill-muted">
            <span className="text-hill-accent">✓</span> Auto-saved · applies to all your pieces
          </div>
        </div>

        {/* Stat lines */}
        <div className="mt-4 flex w-full flex-col gap-1.5">
          {[
            ['Longest streak', '7 wins'],
            ['Favorite mode', 'Blitz 4P'],
            ['Pieces captured', '1,204'],
            ['Hill seconds held', '14m 22s'],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between rounded-[10px] border border-hill-border bg-hill-surface px-3.5 py-3 text-[13px]">
              <span className="text-hill-muted">{k}</span>
              <span className="font-mono font-bold">{v}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onResetAccount}
          className="mt-5 h-12 w-full rounded-xl border border-hill-danger/40 bg-transparent text-sm font-bold tracking-wide text-hill-danger active:scale-[0.98]"
        >
          RESET ACCOUNT
        </button>
      </div>

      <BottomNav active="me" />
    </div>
  );
}

function SkinCard({ skinId, selected, locked, unlockText, onClick }: {
  skinId: SkinId; selected?: boolean; locked?: boolean; unlockText?: string | null; onClick?: () => void;
}) {
  const meta = SKINS[skinId];
  return (
    <button
      onClick={onClick}
      disabled={locked}
      className="relative flex w-[116px] flex-shrink-0 flex-col items-center gap-2 rounded-[14px] px-3 pt-3.5 pb-3 disabled:cursor-not-allowed"
      style={{
        background: selected ? 'rgba(191,255,0,0.05)' : '#141414',
        borderWidth: 1.5, borderStyle: 'solid', borderColor: selected ? '#BFFF00' : '#1F1F1F',
        boxShadow: selected ? '0 0 18px rgba(191,255,0,0.12)' : 'none',
        opacity: locked ? 0.55 : 1,
      }}
    >
      <div
        className="relative flex h-14 w-14 items-center justify-center rounded-xl border border-hill-border"
        style={{
          background: locked ? 'rgba(255,255,255,0.03)' : 'linear-gradient(135deg,#1f1f1f,#0f0f0f)',
          filter: locked ? 'grayscale(0.7) brightness(0.7)' : 'none',
        }}
      >
        <PieceShape player={1} size={32} skin={skinId} />
        {locked && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-hill-bg/55">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#808080" strokeWidth="2" strokeLinecap="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>
          </div>
        )}
      </div>
      <div className="text-center">
        <div className="text-[13px] font-bold">{meta.name}</div>
        <div className="mt-0.5 font-mono text-[9px] tracking-[0.14em]" style={{ color: meta.color }}>{meta.tag}</div>
      </div>
      {selected && !locked && (
        <div className="rounded-sm bg-hill-accent px-1.5 py-0.5 text-[9px] font-extrabold tracking-[0.14em] text-hill-bg">SELECTED</div>
      )}
      {locked && unlockText && (
        <div className="text-center font-mono text-[9px] leading-snug tracking-wide text-hill-muted">{unlockText}</div>
      )}
      {!selected && !locked && (
        <div className="font-mono text-[9px] tracking-[0.14em] text-hill-muted">TAP</div>
      )}
    </button>
  );
}

function GoogleG({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className="block">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.6 8.4 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.3C29.2 35 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4 5.6l6.2 5.3c-.4.3 6.5-4.7 6.5-15 0-1.3-.1-2.6-.4-3.9z"/>
    </svg>
  );
}
```

---

### `components/hill/screens/Leaderboard.tsx`

```tsx
'use client';
import { useState } from 'react';
import { ArenaBadge } from '../ArenaBadge';
import { BottomNav } from '../BottomNav';
import type { ArenaTier } from '@/types/hill';

export interface LeaderboardRow {
  rank: number;
  name: string;
  tier: ArenaTier;
  wins: number;
  winRate: number; // 0-100
  elo: number;
  isYou?: boolean;
}

export interface LeaderboardProps {
  rows: LeaderboardRow[];
  total?: number;
  defaultFilter?: 'global' | 'friends' | 'week';
}

const TIER_RANK_COLOR: Record<number, string> = { 1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32' };

export function Leaderboard({ rows, total = 100, defaultFilter = 'global' }: LeaderboardProps) {
  const [filter, setFilter] = useState(defaultFilter);
  const filters: { id: typeof filter; label: string }[] = [
    { id: 'global', label: 'Global' }, { id: 'friends', label: 'Friends' }, { id: 'week', label: 'This week' },
  ];
  return (
    <div className="relative min-h-screen bg-hill-bg text-hill-text pb-28">
      <div className="sticky top-0 z-10 flex items-center justify-between bg-hill-bg border-b border-hill-border px-4 pt-[14px] pb-3">
        <div className="text-[15px] font-semibold">Leaderboard</div>
        <button className="rounded-lg border border-hill-border bg-hill-surface px-2.5 py-1.5 font-mono text-[11px] tracking-[0.08em] text-hill-muted">SEASON 03</button>
      </div>

      <div className="px-5 pt-3 pb-4">
        <div className="text-[11px] font-bold tracking-[0.24em] text-hill-accent">RANKED</div>
        <h1 className="mt-1.5 mb-3 font-extrabold tracking-display" style={{ fontSize: 56, lineHeight: 0.9 }}>TOP {total}</h1>
        <div className="flex gap-1.5">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-full px-3.5 py-2 text-xs font-bold tracking-[-0.01em] ${
                filter === f.id ? 'bg-hill-text text-hill-bg' : 'bg-hill-surface text-hill-muted border border-hill-border'
              }`}
            >{f.label}</button>
          ))}
        </div>
      </div>

      <div className="px-5 pb-3">
        <div className="rounded-2xl border border-hill-border bg-gradient-to-b from-hill-surface to-hill-surface-2 p-3.5">
          {rows.filter(r => r.rank <= 3).map((r, i, arr) => (
            <Row key={r.rank} row={r} top3 last={i === arr.length - 1} />
          ))}
        </div>
      </div>

      <div className="px-5">
        {rows.filter(r => r.rank > 3).map(r => <Row key={r.rank} row={r} />)}
      </div>

      <div className="px-5 pt-3 pb-6 text-center font-mono text-xs tracking-[0.08em] text-hill-dim">
        SHOWING 1–{rows.length} OF {total}
      </div>

      <BottomNav active="top" />
    </div>
  );
}

function Row({ row, top3 = false, last = false }: { row: LeaderboardRow; top3?: boolean; last?: boolean }) {
  const rankColor = TIER_RANK_COLOR[row.rank] ?? '#808080';
  return (
    <div
      className={`flex items-center gap-3 ${top3 ? 'py-2.5' : 'mb-1.5 rounded-xl border bg-hill-surface px-3.5 py-3'}`}
      style={{
        background: row.isYou ? 'rgba(191,255,0,0.04)' : undefined,
        borderColor: row.isYou ? '#BFFF00' : top3 ? 'transparent' : '#1F1F1F',
        borderWidth: row.isYou ? 1.5 : top3 ? 0 : 1,
        borderBottom: top3 && !last ? '1px solid #1F1F1F' : undefined,
        borderRadius: top3 ? 0 : undefined,
      }}
    >
      <div className={`w-8 text-right font-mono font-extrabold ${top3 ? 'text-[22px]' : 'text-[15px]'}`} style={{ color: rankColor }}>
        {row.rank}
      </div>
      <div
        className={`flex items-center justify-center rounded-full bg-gradient-to-br from-neutral-800 to-neutral-950 border border-hill-border font-bold ${
          top3 ? 'h-[38px] w-[38px] text-sm' : 'h-8 w-8 text-sm'
        }`}
      >{row.name[0].toUpperCase()}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={`truncate font-bold ${top3 ? 'text-base' : 'text-sm'}`}>{row.name}</span>
          {row.isYou && <span className="text-[9px] font-extrabold tracking-[0.1em] text-hill-accent">YOU</span>}
        </div>
        <div className="mt-1 flex items-center gap-2">
          <ArenaBadge tier={row.tier} />
          <span className="font-mono text-[11px] text-hill-muted">{row.winRate}% wr</span>
        </div>
      </div>
      <div className="text-right">
        <div className={`font-mono font-bold ${top3 ? 'text-lg' : 'text-[15px]'}`}>
          {row.wins}<span className="text-[11px] font-medium text-hill-muted">w</span>
        </div>
        <div className="font-mono text-[10px] tracking-wide text-hill-dim">{row.elo} ELO</div>
      </div>
    </div>
  );
}
```

**Mock data — Leaderboard**

```ts
import type { LeaderboardRow } from '@/components/hill/screens/Leaderboard';

export const mockLeaderboard: LeaderboardRow[] = [
  { rank: 1, name: 'Sam Wilson',   tier: 'Champion', wins: 142, winRate: 71, elo: 2480 },
  { rank: 2, name: 'mira_42',      tier: 'Champion', wins: 128, winRate: 68, elo: 2410 },
  { rank: 3, name: 'Aida.K',       tier: 'Master',   wins: 117, winRate: 64, elo: 2245 },
  { rank: 4, name: 'kettle',       tier: 'Master',   wins: 109, winRate: 62, elo: 2210 },
  { rank: 5, name: 'Riko',         tier: 'Master',   wins: 102, winRate: 59, elo: 2188 },
  { rank: 6, name: 'darkhorse',    tier: 'Gold',     wins:  94, winRate: 58, elo: 2050 },
  { rank: 7, name: 'Player_a3f9',  tier: 'Gold',     wins:  88, winRate: 55, elo: 1996, isYou: true },
  { rank: 8, name: 'Marcus J.',    tier: 'Gold',     wins:  82, winRate: 53, elo: 1955 },
  { rank: 9, name: 'noir',         tier: 'Silver',   wins:  74, winRate: 51, elo: 1810 },
];
```

---

### `components/hill/screens/HillModeSelect.tsx`

```tsx
'use client';
import { useState } from 'react';
import { CTAButton } from '../CTAButton';
import { TopBar } from '../TopBar';
import type { GameMode } from '@/types/hill';

export interface HillModeSelectProps {
  initial?: GameMode;
  onContinue: (mode: GameMode) => void;
  onBack: () => void;
}

export function HillModeSelect({ initial = 'blitz', onContinue, onBack }: HillModeSelectProps) {
  const [mode, setMode] = useState<GameMode>(initial);
  return (
    <div className="relative min-h-screen bg-hill-bg text-hill-text">
      <TopBar onBack={onBack} />
      <div className="px-5 pt-5">
        <div className="text-[11px] font-bold tracking-[0.24em] text-hill-accent">STEP 1 / 2</div>
        <h1 className="mt-2 mb-1.5 font-extrabold tracking-display" style={{ fontSize: 40, lineHeight: 0.95 }}>
          Choose your<br />mode.
        </h1>
        <p className="mt-1 text-sm text-hill-muted">Pick a ruleset. You can switch in the lobby.</p>

        <div className="mt-7 flex flex-col gap-3">
          <ModeCard mode="blitz" selected={mode === 'blitz'} onClick={() => setMode('blitz')} />
          <ModeCard mode="survival" selected={mode === 'survival'} onClick={() => setMode('survival')} />
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-6 px-5"
        style={{ background: 'linear-gradient(180deg, transparent, #0A0A0A 35%)' }}>
        <CTAButton variant="primary" onClick={() => onContinue(mode)}>
          Continue · <span className="ml-1 font-mono text-[13px] font-bold opacity-70">{mode.toUpperCase()}</span>
        </CTAButton>
      </div>
    </div>
  );
}

function ModeCard({ mode, selected, onClick }: { mode: GameMode; selected: boolean; onClick: () => void }) {
  const isBlitz = mode === 'blitz';
  return (
    <button
      onClick={onClick}
      className="rounded-2xl px-4 py-5 text-left transition-all active:scale-[0.99]"
      style={{
        background: selected ? 'rgba(191,255,0,0.04)' : '#141414',
        borderWidth: 1.5, borderStyle: 'solid', borderColor: selected ? '#BFFF00' : '#1F1F1F',
        boxShadow: selected ? '0 0 24px rgba(191,255,0,0.15)' : 'none',
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl"
            style={{
              background: isBlitz ? 'rgba(191,255,0,0.08)' : 'rgba(255,59,48,0.08)',
              border: `1px solid ${isBlitz ? 'rgba(191,255,0,0.3)' : 'rgba(255,59,48,0.3)'}`,
              color: isBlitz ? '#BFFF00' : '#FF3B30',
            }}
          >
            {isBlitz ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L4 14h7l-2 8 9-12h-7l2-8z"/></svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="11" r="2"/><circle cx="15" cy="11" r="2"/><path d="M6 18c0-2 0-6 6-6s6 4 6 6"/><circle cx="12" cy="12" r="9.5"/></svg>
            )}
          </div>
          <div>
            <div className="text-[19px] font-extrabold tracking-tight">{isBlitz ? 'BLITZ' : 'SURVIVAL'}</div>
            <div className="mt-0.5 font-mono text-[12px] tracking-wide text-hill-muted">{isBlitz ? '~3 MIN' : '~5-7 MIN'}</div>
          </div>
        </div>
        <div
          className="flex h-[22px] w-[22px] items-center justify-center rounded-full"
          style={{ borderWidth: 1.5, borderStyle: 'solid', borderColor: selected ? '#BFFF00' : '#2A2A2A', background: selected ? '#BFFF00' : 'transparent' }}
        >
          {selected && <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#0A0A0A" strokeWidth="2.5" strokeLinecap="round"><path d="M2 6l3 3 5-6"/></svg>}
        </div>
      </div>
      <div className="mt-3.5 text-[14px] leading-relaxed text-hill-text">
        {isBlitz
          ? '7 rounds. Multiple kings can rule. Most pieces on the Hill at the bell wins the round.'
          : 'Last player with pieces wins. Tighter board pressure, slower burn — outlast everyone.'}
      </div>
      <div className="mt-3.5 flex gap-3.5 border-t border-hill-border pt-3.5 font-mono text-[11px] tracking-wide text-hill-muted">
        <span>{isBlitz ? '10s / TURN' : '15s / TURN'}</span>
        <span className="text-hill-border">·</span>
        <span>{isBlitz ? '7 ROUNDS' : 'NO LIMIT'}</span>
        <span className="text-hill-border">·</span>
        <span>2–4 PLAYERS</span>
      </div>
    </button>
  );
}
```

---

### `components/hill/screens/PlayStyle.tsx`

```tsx
'use client';
import { useState } from 'react';
import { CTAButton } from '../CTAButton';
import { TopBar } from '../TopBar';
import type { GameMode, PlayStyle as PlayStyleId } from '@/types/hill';

export interface PlayStyleProps {
  mode: GameMode;
  initial?: PlayStyleId;
  onContinue: (style: PlayStyleId) => void;
  onBack: () => void;
}

const OPTIONS = [
  {
    id: 'hotseat' as const, title: 'Hot-seat', caption: 'This device',
    desc: 'Pass the phone. Everyone takes their turn on the same screen — perfect for couch games.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="3"/><path d="M11 18h2"/>
      </svg>
    ),
  },
  {
    id: 'multi' as const, title: 'Multiplayer', caption: 'Invite friends',
    desc: 'Create a room. Send a code or link, friends join from their own devices in real time.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="8" r="3"/><path d="M3 21c.5-3.5 3-6 6-6s5.5 2.5 6 6"/><circle cx="17" cy="7" r="2.5"/><path d="M15 13c.5-1.5 2-3 4-3"/>
      </svg>
    ),
  },
];

export function PlayStyle({ mode, initial = 'multi', onContinue, onBack }: PlayStyleProps) {
  const [sel, setSel] = useState<PlayStyleId>(initial);
  return (
    <div className="relative min-h-screen bg-hill-bg text-hill-text">
      <TopBar onBack={onBack} />
      <div className="px-5 pt-5">
        <div className="text-[11px] font-bold tracking-[0.24em] text-hill-accent">STEP 2 / 2</div>
        <h1 className="mt-2 mb-1.5 font-extrabold tracking-display" style={{ fontSize: 40, lineHeight: 0.95 }}>
          How do you<br />want to play?
        </h1>
        <p className="mt-1 text-sm text-hill-muted">
          <span className="font-mono text-hill-accent">{mode === 'survival' ? '💀 SURVIVAL' : '⚡ BLITZ'}</span>
          <span className="text-hill-dim"> · 4 players max</span>
        </p>

        <div className="mt-7 flex flex-col gap-3">
          {OPTIONS.map(o => {
            const selected = o.id === sel;
            return (
              <button
                key={o.id}
                onClick={() => setSel(o.id)}
                className="rounded-2xl px-4 py-5 text-left transition-all active:scale-[0.99]"
                style={{
                  background: selected ? 'rgba(191,255,0,0.04)' : '#141414',
                  borderWidth: 1.5, borderStyle: 'solid', borderColor: selected ? '#BFFF00' : '#1F1F1F',
                  boxShadow: selected ? '0 0 24px rgba(191,255,0,0.15)' : 'none',
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-xl"
                      style={{
                        background: selected ? 'rgba(191,255,0,0.08)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${selected ? 'rgba(191,255,0,0.3)' : '#1F1F1F'}`,
                        color: selected ? '#BFFF00' : '#FAFAFA',
                      }}
                    >{o.icon}</div>
                    <div>
                      <div className="text-[18px] font-extrabold tracking-tight">{o.title}</div>
                      <div className="mt-0.5 font-mono text-[11px] tracking-wide text-hill-muted">{o.caption.toUpperCase()}</div>
                    </div>
                  </div>
                  <div
                    className="flex h-[22px] w-[22px] items-center justify-center rounded-full"
                    style={{ borderWidth: 1.5, borderStyle: 'solid', borderColor: selected ? '#BFFF00' : '#2A2A2A', background: selected ? '#BFFF00' : 'transparent' }}
                  >
                    {selected && <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#0A0A0A" strokeWidth="2.5" strokeLinecap="round"><path d="M2 6l3 3 5-6"/></svg>}
                  </div>
                </div>
                <div className="mt-3.5 text-[13px] leading-relaxed text-hill-text">{o.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-6 px-5" style={{ background: 'linear-gradient(180deg, transparent, #0A0A0A 35%)' }}>
        <CTAButton variant="primary" onClick={() => onContinue(sel)}>
          {sel === 'multi' ? 'Create room  →' : 'Start hot-seat  →'}
        </CTAButton>
      </div>
    </div>
  );
}
```

---

### `components/hill/screens/Lobby.tsx`

```tsx
'use client';
import Link from 'next/link';
import { CTAButton } from '../CTAButton';
import { TopBar } from '../TopBar';
import { PlayerSlot } from '../PlayerSlot';
import type { GameMode, LobbyPlayer } from '@/types/hill';

export interface LobbyProps {
  roomCode: string;
  mode: GameMode;
  players: (LobbyPlayer | { player: 1 | 2 | 3 | 4; empty: true })[];
  isHost: boolean;
  onStart: () => void;
  onCopyLink: () => void;
  onShare: () => void;
  onChangeMode: () => void;
  onBack: () => void;
}

export function Lobby({
  roomCode, mode, players, isHost, onStart, onCopyLink, onShare, onChangeMode, onBack,
}: LobbyProps) {
  const filled = players.filter(p => !('empty' in p)).length;
  const ready = filled >= 2;
  return (
    <div className="relative min-h-screen bg-hill-bg text-hill-text">
      <TopBar
        onBack={onBack}
        right={
          <button onClick={onShare}
            className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-hill-border bg-hill-surface"
            aria-label="Share">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l7 4M15.6 6.5l-7 4"/></svg>
          </button>
        }
      />

      <div className="px-5 pt-3">
        <div className="text-center">
          <div className="text-[10px] font-bold tracking-[0.24em] text-hill-muted">ROOM CODE</div>
          <div className="mt-1.5 font-mono text-[56px] font-bold tracking-[0.08em]" style={{ textShadow: '0 0 24px rgba(191,255,0,0.15)' }}>
            {roomCode}
          </div>
        </div>

        <div className="mt-3.5 flex gap-2">
          <button onClick={onCopyLink}
            className="flex h-[42px] flex-1 items-center justify-center gap-2 rounded-[10px] border border-hill-border bg-hill-surface text-[13px] font-semibold">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
            Copy link
          </button>
          <button onClick={onShare}
            className="flex h-[42px] flex-1 items-center justify-center gap-2 rounded-[10px] border border-hill-border bg-hill-surface text-[13px] font-semibold">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
            Share
          </button>
        </div>

        {/* mode (locked) */}
        <div className="mt-5">
          <div className="mb-2 text-[10px] font-bold tracking-[0.18em] text-hill-muted">MODE · LOCKED</div>
          <div className="flex items-center gap-2.5 rounded-xl border border-hill-border bg-hill-surface px-3.5 py-3">
            <span className="text-lg">{mode === 'survival' ? '💀' : '⚡'}</span>
            <div className="flex-1">
              <div className="text-sm font-extrabold tracking-tight">{mode === 'survival' ? 'SURVIVAL' : 'BLITZ'}</div>
              <div className="mt-0.5 text-[11px] text-hill-muted">
                {mode === 'survival' ? 'Last alive wins · ~5-7 min' : '7 rounds · ~3 min'}
              </div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#808080" strokeWidth="2" strokeLinecap="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>
          </div>
          {isHost && (
            <button onClick={onChangeMode} className="mt-2 text-[11px] font-semibold tracking-wide text-hill-muted">
              ← change mode
            </button>
          )}
        </div>

        {/* 2x2 player slots */}
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-[10px] font-bold tracking-[0.18em] text-hill-muted">PLAYERS</div>
            <div className="font-mono text-[11px] text-hill-muted">{filled}/4</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {players.map((p, i) =>
              'empty' in p
                ? <PlayerSlot key={i} player={p.player} empty />
                : <PlayerSlot key={i} {...p} />
            )}
          </div>
        </div>
      </div>

      <div
        className="sticky bottom-0 mt-6 px-5 pt-4 pb-3"
        style={{ background: 'linear-gradient(180deg, transparent, #0A0A0A 30%)' }}
      >
        <CTAButton variant="primary" disabled={!ready} onClick={onStart}>
          {ready ? 'Start Game' : 'Waiting for 2+ players…'}
        </CTAButton>
      </div>
    </div>
  );
}
```

**Mock data — Lobby**

```ts
import type { LobbyPlayer } from '@/types/hill';

export const partialLobby: (LobbyPlayer | { player: 1|2|3|4; empty: true })[] = [
  { player: 1, name: 'Aida', tier: 'Silver', isHost: true, isYou: true, skin: 'silver' },
  { player: 2, empty: true },
  { player: 3, name: 'Sam', tier: 'Bronze', skin: 'bronze' },
  { player: 4, empty: true },
];

export const fullLobby: LobbyPlayer[] = [
  { player: 1, name: 'Aida',   tier: 'Silver', isHost: true, isYou: true, skin: 'silver' },
  { player: 2, name: 'Marcus', tier: 'Gold',   skin: 'gold' },
  { player: 3, name: 'Sam',    tier: 'Bronze', skin: 'bronze' },
  { player: 4, name: 'Riko',   tier: 'Master', skin: 'master' },
];
```

---

### `components/hill/screens/DeathOverlay.tsx`

```tsx
'use client';
import { CTAButton } from '../CTAButton';
import { PieceShape } from '../PieceShape';
import type { Player, SkinId } from '@/types/hill';

export interface DeathOverlayProps {
  round: number;
  player: Player;
  playerName: string;
  playerSkin?: SkinId;
  onSpectate: () => void;
  onLeave: () => void;
}

export function DeathOverlay({
  round, player, playerName, playerSkin = 'bronze', onSpectate, onLeave,
}: DeathOverlayProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col animate-hill-fadein"
      style={{
        background: 'radial-gradient(120% 80% at 50% 30%, rgba(255,59,48,0.28), rgba(10,10,10,0.85) 60%, rgba(10,10,10,0.96))',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        className="flex-1 flex flex-col items-center justify-center px-6"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="flex items-center gap-2 rounded-full border border-hill-danger/40 bg-black/40 py-1.5 pl-2 pr-3 font-mono text-[11px] font-bold tracking-[0.18em] text-hill-danger">
          <PieceShape player={player} size={16} skin={playerSkin} />
          {playerName.toUpperCase()} · OUT
        </div>

        <div
          className="mt-6 font-extrabold tracking-display animate-hill-rise text-hill-danger"
          style={{ fontSize: 84, lineHeight: 0.9, textShadow: '0 0 32px rgba(255,59,48,0.5)' }}
        >
          YOU<br />DIED.
        </div>

        <div className="mt-4 font-mono text-sm tracking-[0.08em] text-white/70">
          ELIMINATED · ROUND {round}
        </div>

        <div className="mt-9 max-w-[280px] rounded-xl border border-hill-border bg-black/40 px-4 py-3 text-center text-xs text-hill-muted">
          Hold tight — match continues without you. Spectate to watch.
        </div>
      </div>

      <div
        className="flex flex-col gap-2.5 px-5"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
      >
        <CTAButton variant="primary" onClick={onSpectate} className="!h-14">👁  Spectate</CTAButton>
        <CTAButton variant="secondary" onClick={onLeave} style={{ borderColor: 'rgba(255,255,255,0.2)' }}>← Leave Room</CTAButton>
      </div>
    </div>
  );
}
```

---

### `components/hill/screens/GameOverOverlay.tsx`

Single component, 3 variants via `kind` prop.

```tsx
'use client';
import { ArenaBadge } from '../ArenaBadge';
import { CTAButton } from '../CTAButton';
import { PieceShape } from '../PieceShape';
import type { ArenaTier, Player, SkinId } from '@/types/hill';

export type GameOverKind = 'solo' | 'joint' | 'none';

export interface Winner {
  player: Player;
  name: string;
  tier: ArenaTier;
  skin: SkinId;
  eloDelta: number;
}

export interface GameOverOverlayProps {
  kind: GameOverKind;
  winners: Winner[];
  matchDuration: string; // e.g. "3:14"
  roundCount?: number;
  onPlayAgain: () => void;
  onShare: () => void;
  onLobby: () => void;
}

export function GameOverOverlay({
  kind, winners, matchDuration, roundCount = 7, onPlayAgain, onShare, onLobby,
}: GameOverOverlayProps) {
  const headlineFontSize = kind === 'joint' ? 48 : 64;
  const headline =
    kind === 'solo'  ? <>{winners[0].name.toUpperCase()}<br />WINS.</> :
    kind === 'joint' ? <>JOINT<br />KINGS.</> :
                       <>NO KING<br />TODAY.</>;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col animate-hill-fadein"
      style={{
        background: kind === 'none'
          ? 'rgba(10,10,10,0.96)'
          : 'radial-gradient(120% 80% at 50% 40%, rgba(191,255,0,0.18), rgba(10,10,10,0.85) 55%, rgba(10,10,10,0.97))',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-14">
        <div className="font-mono text-[11px] font-bold tracking-[0.24em] text-hill-accent">
          MATCH · {roundCount} ROUNDS · {matchDuration}
        </div>

        {kind !== 'none' && <div className="mt-3.5 text-4xl opacity-90">👑</div>}

        <div
          className="mt-1.5 text-center font-extrabold tracking-display animate-hill-rise"
          style={{
            fontSize: headlineFontSize, lineHeight: 0.9,
            background: kind === 'none'
              ? 'linear-gradient(180deg,#808080,#404040)'
              : 'linear-gradient(180deg,#FAFAFA,#BFFF00)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            textShadow: kind === 'none' ? 'none' : '0 0 40px rgba(191,255,0,0.25)',
          }}
        >
          {headline}
        </div>

        {winners.length > 0 && (
          <div className="mt-5 flex w-full max-w-[280px] flex-col gap-2">
            {winners.map((w, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl border-[1.5px] border-hill-accent bg-hill-accent/[0.05] px-3.5 py-3"
                style={{ boxShadow: '0 0 20px rgba(191,255,0,0.12)' }}
              >
                <PieceShape player={w.player} size={32} isKing skin={w.skin} />
                <div className="flex-1">
                  <div className="text-[15px] font-bold">{w.name}</div>
                  <div className="mt-0.5"><ArenaBadge tier={w.tier} /></div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[22px] font-bold text-hill-accent">
                    {w.eloDelta >= 0 ? '+' : ''}{w.eloDelta}
                  </div>
                  <div className="font-mono text-[10px] tracking-wide text-hill-muted">ELO</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {kind === 'none' && (
          <div className="mt-5 max-w-[240px] text-center text-[13px] text-hill-muted">
            Survival ended with no last player standing. Nobody scores.
          </div>
        )}
      </div>

      <div
        className="flex flex-col gap-2.5 px-5"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
      >
        <CTAButton variant="primary" onClick={onPlayAgain}>Play again</CTAButton>
        <div className="flex gap-2.5">
          <CTAButton variant="secondary" onClick={onShare}>Share result</CTAButton>
          <CTAButton variant="secondary" onClick={onLobby}>Lobby</CTAButton>
        </div>
      </div>
    </div>
  );
}
```

**Mock data — GameOver (3 variants)**

```ts
import type { GameOverOverlayProps, Winner } from '@/components/hill/screens/GameOverOverlay';

const riko: Winner = { player: 4, name: 'Riko', tier: 'Master', skin: 'master', eloDelta: 24 };
const aida: Winner = { player: 1, name: 'Aida', tier: 'Silver', skin: 'silver', eloDelta: 18 };

export const gameOverSolo: Omit<GameOverOverlayProps, 'onPlayAgain'|'onShare'|'onLobby'> = {
  kind: 'solo', winners: [riko], matchDuration: '3:14', roundCount: 7,
};

export const gameOverJoint: Omit<GameOverOverlayProps, 'onPlayAgain'|'onShare'|'onLobby'> = {
  kind: 'joint', winners: [aida, riko], matchDuration: '3:14', roundCount: 7,
};

export const gameOverNone: Omit<GameOverOverlayProps, 'onPlayAgain'|'onShare'|'onLobby'> = {
  kind: 'none', winners: [], matchDuration: '6:42', roundCount: 7,
};
```

---

## File map

```
app/
  layout.tsx                # load Inter + JetBrains Mono fonts here
types/hill.ts
lib/skins.ts
components/hill/
  PieceShape.tsx
  ArenaBadge.tsx
  CTAButton.tsx
  TopBar.tsx
  TurnTimer.tsx
  PlayerSlot.tsx
  Board.tsx
  BottomNav.tsx
  screens/
    Landing.tsx
    SignIn.tsx
    Profile.tsx
    Leaderboard.tsx
    HillModeSelect.tsx
    PlayStyle.tsx
    Lobby.tsx
    DeathOverlay.tsx
    GameOverOverlay.tsx
```

A few things I deliberately chose:

- **PieceShape** keeps SVG `filter` inline because Tailwind's `drop-shadow-*` can't express compound shadow colors. Everything else is class-based.
- **Per-player border colors on PlayerSlot, exact gradients, and oklch-adjacent halos** stay inline-style; they're values, not utilities.
- **BottomNav uses Next.js `usePathname`** so the active tab is correct by default — pass `active` to override.
- **Safe-area** is applied via `env(safe-area-inset-bottom/top)` on overlays and the bottom nav.
- **Both Profile variants come from one component** taking `profile: Profile | null`. Same for Landing.

Want me to do the in-game **Hill 4P board screen** (with the 2×2 player panel + round counter + ON HILL banner) next? That's the only big screen I didn't include here.

