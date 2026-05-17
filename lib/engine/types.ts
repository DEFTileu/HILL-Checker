// Pure engine types. ZERO React imports. ZERO Supabase imports.
// Runnable in plain Node for future server-side anti-cheat.

export type Player = 1 | 2 | 3 | 4;

export type Mode = 'classic-2p' | 'hill-blitz' | 'hill-survival';

export interface Coord {
  row: number;
  col: number;
}

export interface Piece {
  player: Player;
  king: boolean;
  /**
   * Stable identity assigned at createInitialState and threaded through every
   * applyMove (clone/spread preserve it). Lets the UI track a piece across
   * moves for correct slide animation. Optional so test/preview fixtures that
   * build raw `{ player, king }` boards still typecheck.
   */
  id?: number;
}

export interface GameConfig {
  mode: Mode;
  /** Square board edge length (8 for classic, 10 for hill). */
  boardSize: number;
  /** Players in turn order. */
  players: Player[];
  /** Starting pawn positions for each player. */
  startingPieces: Partial<Record<Player, Coord[]>>;
  /** How a pawn becomes a king. */
  kingRule: 'opposite-edge' | 'center-zone';
  winCondition: 'capture-all' | 'hill' | 'hold-center';
  /** Round cap. Reaching it ends the game (999 = effectively unlimited). */
  maxRounds: number;
  /** The center "Hill" squares (empty for classic). */
  centerZone: Coord[];
  /** Pawn step directions [dRow, dCol] per player. Kings move all 4 diagonals. */
  moveDirections: Partial<Record<Player, [number, number][]>>;
  /** For kingRule 'opposite-edge': the row a player promotes on. */
  kingRow?: Partial<Record<Player, number>>;
}

export interface GameState {
  config: GameConfig;
  /** board[row][col] — null = empty square. */
  board: (Piece | null)[][];
  currentPlayer: Player;
  /** Players still in the game (still have pieces), in turn order. */
  alivePlayers: Player[];
  /** 1-based. Increments when the turn cycles back to the first alive player. */
  round: number;
  /** When set, the only legal moves are continued jumps from this square. */
  mandatoryJumpFrom: Coord | null;
  /** null while playing; a (possibly empty) list once the game is decided. */
  winners: Player[] | null;
  /** Epoch ms by which the current player must move. Optional for classic. */
  turnDeadline?: number;
}

export interface Move {
  from: Coord;
  to: Coord;
  /** Squares of pieces removed by this move (empty for a plain step). */
  captures: Coord[];
}

/** Timer-expiry action: forfeit the turn without moving (no elimination). */
export interface SkipTurn {
  type: 'skip';
}

export type Action = Move | SkipTurn;

export const SKIP_TURN: SkipTurn = { type: 'skip' };

