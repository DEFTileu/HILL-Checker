// lib/board-orientation.ts
// PURE viewpoint rotation. The engine + game state stay canonical at all
// times; only the *rendered* board rotates so the local player's pieces sit
// at the bottom of their own screen. No React, no Supabase. Unit-tested.
//
// NOTE — deviation from the task spec's literal Hill formulas:
// The spec's prose ("each player's corner at bottom-left", "local player's
// pieces at the BOTTOM") contradicts its sample displayToCanonical formulas,
// which actually land every home corner at the *top-left* (pieces at top —
// i.e. the bug, unfixed). We follow the prose / acceptance criteria: every
// player's home corner renders at the display bottom-left. Pure 90° rotations
// only, so checkers diagonals are preserved exactly (no reflection).
//
// Canonical Hill home corners (from HILL_START): P1 (0,0) top-left,
// P2 (0,9) top-right, P3 (9,9) bottom-right, P4 (9,0) bottom-left.
// canonical -> display rotation: P4 0°, P3 90°CW, P2 180°, P1 270°CW.
import type { PlayerNum } from '@/lib/tokens';

export type Coord = [number, number];

/**
 * Map a coordinate as the local player SEES it (display space) back to the
 * canonical engine coordinate. Pass `localPlayer = undefined` (hot-seat /
 * shared screen) for the identity transform — no rotation.
 *
 * Classic 2P (8x8): P2 is flipped vertically (row only) so their home rows
 * (0-2) fall to the bottom of the view; P1 already starts at the bottom.
 *
 * Hill 4P (10x10): the inverse of the canonical->display rotation above.
 */
export function displayToCanonical(
  coord: Coord,
  localPlayer: PlayerNum | undefined,
  boardSize: number,
): Coord {
  const [r, c] = coord;
  if (localPlayer === undefined) return [r, c];
  if (boardSize === 8) {
    return localPlayer === 2 ? [boardSize - 1 - r, c] : [r, c];
  }
  const N = boardSize - 1;
  switch (localPlayer) {
    case 1: // inverse of 270°CW == 90°CW
      return [c, N - r];
    case 2: // 180° (self-inverse)
      return [N - r, N - c];
    case 3: // inverse of 90°CW == 270°CW
      return [N - c, r];
    case 4: // 0°
      return [r, c];
    default:
      return [r, c];
  }
}

/**
 * Inverse of {@link displayToCanonical}: canonical engine coordinate -> the
 * pixel cell to render it in for the local player's viewpoint.
 */
export function canonicalToDisplay(
  coord: Coord,
  localPlayer: PlayerNum | undefined,
  boardSize: number,
): Coord {
  const [r, c] = coord;
  if (localPlayer === undefined) return [r, c];
  if (boardSize === 8) {
    // Vertical flip is its own inverse.
    return localPlayer === 2 ? [boardSize - 1 - r, c] : [r, c];
  }
  const N = boardSize - 1;
  switch (localPlayer) {
    case 1: // 270°CW
      return [N - c, r];
    case 2: // 180°
      return [N - r, N - c];
    case 3: // 90°CW
      return [c, N - r];
    case 4: // 0°
      return [r, c];
    default:
      return [r, c];
  }
}
