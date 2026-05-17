// lib/game-ui-view.ts
// PURE view-model layer: GameState (+ player metadata) -> GameView props.
// No React, no Supabase. Unit-tested.
import type { GameState, Player } from '@/lib/engine/types';
import type { Piece as UIPiece } from '@/lib/pieces';
import type { ArenaTier, SkinId } from '@/lib/skins';
import type { GameOverKind, Winner } from '@/components/GameOverOverlay';
import { boardToPieces, toTuple } from '@/lib/multiplayer/adapt';

export interface PlayerMeta {
  player: Player;
  name: string;
  tier: ArenaTier;
  skin: SkinId;
  isYou?: boolean;
  /**
   * Whole seconds left in this player's reconnect grace window, or undefined
   * when they are connected. Set only by the multiplayer room (hot-seat never
   * disconnects). Spreads through `toGameViewModel` into GameViewPlayer.
   */
  disconnectSecondsLeft?: number;
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
    alive: (counts.get(m.player) ?? 0) > 0,
    pieceCount: counts.get(m.player) ?? 0,
  }));

  // Join each player's skin (from meta — hot-seat presets or, in
  // multiplayer, presence-derived profile.selectedSkin) onto its pieces.
  // boardToPieces is a dumb engine→UI adapter with no meta access, so the
  // join belongs here. Board reads piece.skin first, so this is what makes
  // skins actually render in-game (RC1).
  const skinByPlayer = new Map<Player, SkinId>();
  for (const m of meta) skinByPlayer.set(m.player, m.skin);

  return {
    size: (state.config.boardSize === 10 ? 10 : 8) as 8 | 10,
    pieces: boardToPieces(state.board).map((pc) => ({
      ...pc,
      skin: skinByPlayer.get(pc.player) ?? pc.skin,
    })),
    centerZone: state.config.centerZone.map(toTuple),
    players,
    currentPlayer: state.currentPlayer,
    round: state.round,
    maxRounds: state.config.maxRounds,
    mode: state.config.mode,
  };
}

// Mirrors lib/multiplayer/adapt.winnersToGameOver but keyed off PlayerMeta[]
// instead of a multiplayer SlotMap, so local (hot-seat) pages can reuse it.
export function winnersToOverlay(
  winners: Player[],
  meta: PlayerMeta[],
): { kind: GameOverKind; winners: Winner[] } {
  const kind: GameOverKind =
    winners.length === 0 ? 'none' : winners.length === 1 ? 'solo' : 'joint';
  const list: Winner[] = winners.flatMap((p) => {
    const m = meta.find((x) => x.player === p);
    return m
      ? [{ player: p, name: m.name, tier: m.tier, skin: m.skin, eloDelta: 20 }]
      : [];
  });
  return { kind, winners: list };
}
