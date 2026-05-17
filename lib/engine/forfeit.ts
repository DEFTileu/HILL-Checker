import { getNextActivePlayer, TURN_MS } from './apply';
import type { GameState, Piece, Player } from './types';

function cloneBoard(board: (Piece | null)[][]): (Piece | null)[][] {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

function pieceCount(board: (Piece | null)[][], player: Player): number {
  let n = 0;
  for (const row of board) for (const cell of row) if (cell?.player === player) n++;
  return n;
}

/**
 * Remove a player from a live game (disconnect forfeit). Pure: clones the
 * board, deletes all of `player`'s pieces, recomputes alive players, and only
 * advances the turn if it was the forfeiting player's. Never sets `winners` —
 * the caller derives game-over via checkWinners, exactly as after applyMove.
 */
export function forfeitPlayer(state: GameState, player: Player): GameState {
  const board = cloneBoard(state.board);
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      if (board[r][c]?.player === player) board[r][c] = null;
    }
  }

  const alivePlayers = state.config.players.filter(
    (p) =>
      state.alivePlayers.includes(p) && p !== player && pieceCount(board, p) > 0,
  );

  const wasCurrent = state.currentPlayer === player;
  const base: GameState = {
    ...state,
    board,
    alivePlayers,
    mandatoryJumpFrom: wasCurrent ? null : state.mandatoryJumpFrom,
  };
  if (!wasCurrent) return base;

  return {
    ...base,
    currentPlayer: getNextActivePlayer(base),
    turnDeadline: Date.now() + TURN_MS,
  };
}
