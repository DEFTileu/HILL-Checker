import { getLegalMoves } from './rules';
import type {
  Action,
  Coord,
  GameConfig,
  GameState,
  Piece,
  Player,
  SkipTurn,
} from './types';

/** Seconds-as-ms a player has to make their move before it can be skipped. */
export const TURN_MS = 10_000;

function isSkip(action: Action): action is SkipTurn {
  return 'type' in action && action.type === 'skip';
}

function cloneBoard(board: (Piece | null)[][]): (Piece | null)[][] {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

export function createInitialState(config: GameConfig): GameState {
  const board: (Piece | null)[][] = Array.from({ length: config.boardSize }, () =>
    Array.from({ length: config.boardSize }, () => null as Piece | null),
  );
  // Deterministic id assignment (config.players × startingPieces order is
  // identical on every client built from the same preset, so multiplayer
  // stays in sync without broadcasting ids).
  let nextId = 0;
  for (const player of config.players) {
    for (const { row, col } of config.startingPieces[player] ?? []) {
      board[row][col] = { player, king: false, id: nextId++ };
    }
  }
  return {
    config,
    board,
    currentPlayer: config.players[0],
    alivePlayers: [...config.players],
    round: 1,
    mandatoryJumpFrom: null,
    winners: null,
    turnDeadline: Date.now() + TURN_MS,
  };
}

function pieceCount(board: (Piece | null)[][], player: Player): number {
  let n = 0;
  for (const row of board) for (const cell of row) if (cell?.player === player) n++;
  return n;
}

function inZone(zone: Coord[], r: number, c: number): boolean {
  return zone.some((z) => z.row === r && z.col === c);
}

function shouldPromote(config: GameConfig, piece: Piece, to: Coord): boolean {
  if (piece.king) return false;
  if (config.kingRule === 'opposite-edge') {
    return config.kingRow?.[piece.player] === to.row;
  }
  // 'center-zone': promote on entering the Hill.
  return inZone(config.centerZone, to.row, to.col);
}

/** Next player in turn order (config.players) that still has pieces. */
export function getNextActivePlayer(state: GameState): Player {
  const order = state.config.players;
  const start = order.indexOf(state.currentPlayer);
  for (let step = 1; step <= order.length; step++) {
    const cand = order[(start + step) % order.length];
    if (state.alivePlayers.includes(cand)) return cand;
  }
  return state.currentPlayer;
}

/**
 * Recompute alive players, advance to the next alive player, bump the round
 * when the turn wraps back to the lead, and refresh the turn timer.
 */
function endTurn(prev: GameState, board: (Piece | null)[][]): GameState {
  const alivePlayers = prev.config.players.filter(
    (p) => prev.alivePlayers.includes(p) && pieceCount(board, p) > 0,
  );
  const base: GameState = {
    ...prev,
    board,
    alivePlayers,
    mandatoryJumpFrom: null,
  };
  const upcoming = getNextActivePlayer(base);
  const lead = prev.config.players.find((p) => alivePlayers.includes(p));
  return {
    ...base,
    currentPlayer: upcoming,
    // A new round begins when the turn returns to the lead alive player.
    round: lead !== undefined && upcoming === lead ? prev.round + 1 : prev.round,
    turnDeadline: Date.now() + TURN_MS,
  };
}

export function applyMove(state: GameState, action: Action): GameState {
  // Timer expired (or otherwise forfeited): forfeit the turn, no elimination.
  if (isSkip(action)) {
    return endTurn(state, cloneBoard(state.board));
  }
  const move = action;
  const board = cloneBoard(state.board);
  const moving = board[move.from.row][move.from.col];
  if (!moving) return state;

  // Move the piece.
  board[move.from.row][move.from.col] = null;
  const piece: Piece = { ...moving };
  board[move.to.row][move.to.col] = piece;

  // Remove captured pieces.
  for (const cap of move.captures) {
    board[cap.row][cap.col] = null;
  }

  const next: GameState = { ...state, board };

  // Mid multi-jump: same piece must keep jumping, turn does not advance.
  if (move.captures.length > 0) {
    const probe: GameState = { ...next, mandatoryJumpFrom: move.to };
    const more = getLegalMoves(probe, move.to);
    if (more.length > 0) {
      next.mandatoryJumpFrom = move.to;
      return next;
    }
  }

  // Move fully complete: promote (opposite-edge OR center-zone), then
  // recompute alive players and advance the turn.
  if (shouldPromote(state.config, piece, move.to)) {
    piece.king = true;
  }
  return endTurn(state, board);
}

/** Convenience for the timer-expiry path. */
export function skipTurn(state: GameState): GameState {
  return applyMove(state, { type: 'skip' });
}
