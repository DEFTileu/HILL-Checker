import type { Coord, GameState, Move, Piece, Player } from './types';

const ALL_DIAGONALS: [number, number][] = [
  [-1, -1],
  [-1, 1],
  [1, -1],
  [1, 1],
];

function inBounds(state: GameState, r: number, c: number): boolean {
  const n = state.config.boardSize;
  return r >= 0 && r < n && c >= 0 && c < n;
}

function at(state: GameState, r: number, c: number): Piece | null {
  return state.board[r][c];
}

function pawnDirs(state: GameState, player: Player): [number, number][] {
  return state.config.moveDirections[player] ?? [];
}

// In the Hill modes (international-draughts style) a pawn may capture in
// ANY of the 4 diagonals, including backward. Classic stays forward-only.
function pawnJumpDirs(state: GameState, player: Player): [number, number][] {
  return state.config.mode === 'classic-2p'
    ? pawnDirs(state, player)
    : ALL_DIAGONALS;
}

/** Jump moves (single hop) for the piece at `from`. */
function jumpMoves(state: GameState, from: Coord): Move[] {
  const piece = at(state, from.row, from.col);
  if (!piece) return [];
  const moves: Move[] = [];
  const dirs = piece.king
    ? ALL_DIAGONALS
    : pawnJumpDirs(state, piece.player);

  for (const [dr, dc] of dirs) {
    let r = from.row + dr;
    let c = from.col + dc;

    if (piece.king) {
      // Slide over empty squares until we find a piece.
      while (inBounds(state, r, c) && !at(state, r, c)) {
        r += dr;
        c += dc;
      }
    }

    if (!inBounds(state, r, c)) continue;
    const target = at(state, r, c);
    // Must be an enemy piece, not already passed an enemy.
    if (!target || target.player === piece.player) continue;

    // Landing squares: immediately beyond for pawns; any empty run for kings.
    let lr = r + dr;
    let lc = c + dc;
    if (!piece.king) {
      if (inBounds(state, lr, lc) && !at(state, lr, lc)) {
        moves.push({ from, to: { row: lr, col: lc }, captures: [{ row: r, col: c }] });
      }
      continue;
    }
    while (inBounds(state, lr, lc) && !at(state, lr, lc)) {
      moves.push({ from, to: { row: lr, col: lc }, captures: [{ row: r, col: c }] });
      lr += dr;
      lc += dc;
    }
  }
  return moves;
}

/** Plain (non-capturing) step moves for the piece at `from`. */
function stepMoves(state: GameState, from: Coord): Move[] {
  const piece = at(state, from.row, from.col);
  if (!piece) return [];
  const moves: Move[] = [];
  const dirs = piece.king ? ALL_DIAGONALS : pawnDirs(state, piece.player);

  for (const [dr, dc] of dirs) {
    let r = from.row + dr;
    let c = from.col + dc;
    if (piece.king) {
      while (inBounds(state, r, c) && !at(state, r, c)) {
        moves.push({ from, to: { row: r, col: c }, captures: [] });
        r += dr;
        c += dc;
      }
    } else if (inBounds(state, r, c) && !at(state, r, c)) {
      moves.push({ from, to: { row: r, col: c }, captures: [] });
    }
  }
  return moves;
}

export function isJumpAvailable(state: GameState, player: Player): boolean {
  const n = state.config.boardSize;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const p = state.board[r][c];
      if (p && p.player === player && jumpMoves(state, { row: r, col: c }).length > 0) {
        return true;
      }
    }
  }
  return false;
}

export function getLegalMoves(state: GameState, from: Coord): Move[] {
  const piece = at(state, from.row, from.col);
  if (!piece || piece.player !== state.currentPlayer) return [];

  // Mid multi-jump: only the jumping piece may move, jumps only.
  if (state.mandatoryJumpFrom) {
    if (
      state.mandatoryJumpFrom.row !== from.row ||
      state.mandatoryJumpFrom.col !== from.col
    ) {
      return [];
    }
    return jumpMoves(state, from);
  }

  // Mandatory capture: if any of the player's pieces can jump, only jumps count.
  if (isJumpAvailable(state, state.currentPlayer)) {
    return jumpMoves(state, from);
  }

  return stepMoves(state, from);
}
