import type { GameState, Piece, Player } from './types';

function pieceCount(board: (Piece | null)[][], player: Player): number {
  let n = 0;
  for (const row of board) for (const cell of row) if (cell?.player === player) n++;
  return n;
}

/** Players with at least one piece on a Hill square, in turn order. */
function hillHolders(state: GameState): Player[] {
  const onHill = new Set<Player>();
  for (const { row, col } of state.config.centerZone) {
    const p = state.board[row][col];
    if (p) onHill.add(p.player);
  }
  return state.config.players.filter((p) => onHill.has(p));
}

/**
 * Decides the game.
 * - null   → still playing
 * - []     → finished, drawn (no winners)
 * - [...]  → these players won (one, or several for the Hill modes)
 */
export function checkWinners(state: GameState): Player[] | null {
  const alive = state.config.players.filter(
    (p) => state.alivePlayers.includes(p) && pieceCount(state.board, p) > 0,
  );

  if (state.config.mode === 'classic-2p') {
    return alive.length === 1 ? alive : null;
  }

  // Hill modes (blitz / survival): a lone survivor wins immediately.
  if (alive.length === 1) return alive;

  // Otherwise the game runs until the round cap, then the Hill decides.
  if (state.round > state.config.maxRounds) {
    return hillHolders(state); // possibly [] → draw
  }

  return null;
}
