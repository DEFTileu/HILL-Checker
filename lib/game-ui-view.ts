// lib/game-ui-view.ts
// PURE view-model layer: GameState (+ player metadata) -> GameView props.
// No React, no Supabase. Unit-tested.
import type { GameState, Player } from '@/lib/engine/types';
import type { Piece as UIPiece } from '@/lib/pieces';
import type { ArenaTier, SkinId } from '@/lib/skins';
import { boardToPieces } from '@/lib/multiplayer/adapt';

export interface PlayerMeta {
  player: Player;
  name: string;
  tier: ArenaTier;
  skin: SkinId;
  isYou?: boolean;
}

export interface GameViewPlayer extends PlayerMeta {
  isActive: boolean;
  alive: boolean;
  pieceCount: number;
}

export interface GameViewModel {
  size: 8 | 10;
  pieces: UIPiece[];
  centerZone: [number, number][];
  players: GameViewPlayer[];
  currentPlayer: Player;
  round: number;
  maxRounds: number;
  mode: GameState['config']['mode'];
}

export function toGameViewModel(
  state: GameState,
  meta: PlayerMeta[],
): GameViewModel {
  const counts = new Map<Player, number>();
  for (const row of state.board) {
    for (const cell of row) {
      if (cell) counts.set(cell.player, (counts.get(cell.player) ?? 0) + 1);
    }
  }

  const players: GameViewPlayer[] = meta.map((m) => ({
    ...m,
    isActive: state.winners === null && state.currentPlayer === m.player,
    alive: state.alivePlayers.includes(m.player),
    pieceCount: counts.get(m.player) ?? 0,
  }));

  return {
    size: state.config.boardSize as 8 | 10,
    pieces: boardToPieces(state.board),
    centerZone: state.config.centerZone.map(
      (z) => [z.row, z.col] as [number, number],
    ),
    players,
    currentPlayer: state.currentPlayer,
    round: state.round,
    maxRounds: state.config.maxRounds,
    mode: state.config.mode,
  };
}
