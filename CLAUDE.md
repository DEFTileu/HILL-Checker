# HILL — Project Context for Claude Code

## What we're building
HILL is a Next.js web app for blitz checkers with TWO modes:
1. **Classic 2P** — standard checkers on 8×8 board
2. **King of Hill 4P** — custom 10×10 mode where 4 players start from
   corners, race to the center 2×2 "Hill", become kings via center,
   and either hold the hill at end of timer (multiple winners possible)
   or survive last.

## Stack
Next.js 14 App Router, TypeScript strict, Tailwind CSS, Supabase
(Auth Anonymous + Postgres + Realtime), Vercel deploy.

## Architecture rules (DO NOT VIOLATE)
1. `lib/engine/*` is PURE TypeScript. No React imports. No Supabase imports.
   It's just data-in/data-out functions. Engine code must be runnable in
   Node (for future server-side anti-cheat).
2. All game rules live ONLY in `lib/engine/rules.ts` and `apply.ts`.
   Never duplicate rule logic in React components.
3. The same engine handles both modes via `GameConfig` presets.
4. UI components come from Claude Design — receive them as ready TSX files
   and just wire them up to engine state and Supabase channels.
5. Multiplayer truth: each client runs engine locally. Moves broadcast
   via Supabase Realtime. Trust-the-client for MVP (no server validation).

## Game types (use these everywhere)
[paste types from spec: Player, Coord, Piece, GameConfig, GameState, Move]

## Modes
- classic-2p: 8x8, 2 players, no center zone, king on opposite edge,
  win when opponent has 0 pieces
- hill-blitz: 10x10, 4 players from corners (5 pieces each), center 2x2
  zone, king on center entry, max 7 rounds, multiple winners possible
  (anyone with piece in center at end OR last survivor)
- hill-survival: same as blitz but max 20 rounds, only last survivor wins
  (if 20 reached, anyone in center wins, else draw)

## Round logic
A round = one full cycle of all currently-alive players moving once.
Eliminated players are removed from the cycle.

## Turn timer
10 seconds per turn. If expired without move, skip (do not eliminate).

## Elimination
Only when player has 0 pieces. No legal moves = skip turn, don't lose.