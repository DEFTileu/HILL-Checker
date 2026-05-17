import type { GameState, Player } from '@/lib/engine/types';
import type { Piece as UIPiece, Coord as UICoord } from '@/lib/pieces';
import type { ArenaTier, SkinId } from '@/lib/skins';
import type { GameOverKind, Winner } from '@/components/GameOverOverlay';

export function boardToPieces(board: GameState['board']): UIPiece[] {
  const out: UIPiece[] = [];
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      const cell = board[r][c];
      if (cell) {
        out.push({ player: cell.player, kind: cell.king ? 'king' : 'pawn', pos: [r, c] });
      }
    }
  }
  return out;
}

export const toTuple = (c: { row: number; col: number }): UICoord => [c.row, c.col];
export const toCoord = ([row, col]: UICoord) => ({ row, col });

export interface SlotInfo {
  userId: string;
  displayName: string;
  tier: ArenaTier;
  skin: SkinId;
}
export type SlotMap = Partial<Record<Player, SlotInfo>>;

export interface PresenceEntry extends SlotInfo {
  joinedAt: number;
}

/** First-come-first-serve: sort by joinedAt, fill players in turn order. */
export function assignSlots(entries: PresenceEntry[], players: Player[]): SlotMap {
  const sorted = [...entries].sort((a, b) => a.joinedAt - b.joinedAt);
  const map: SlotMap = {};
  players.forEach((p, i) => {
    const e = sorted[i];
    if (e) map[p] = { userId: e.userId, displayName: e.displayName, tier: e.tier, skin: e.skin };
  });
  return map;
}

export function winnersToGameOver(
  winners: Player[],
  slots: SlotMap,
): { kind: GameOverKind; winners: Winner[] } {
  const kind: GameOverKind =
    winners.length === 0 ? 'none' : winners.length === 1 ? 'solo' : 'joint';
  const list: Winner[] = winners.flatMap((p) => {
    const s = slots[p];
    return s
      ? [{ player: p, name: s.displayName, tier: s.tier, skin: s.skin, eloDelta: 20 }]
      : [];
  });
  return { kind, winners: list };
}
