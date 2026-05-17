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
        out.push({ player: cell.player, kind: cell.king ? 'king' : 'pawn', pos: [r, c], id: cell.id });
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

/**
 * Canonical lobby order: the room host always leads (slot 1), everyone else
 * follows in join order. Falls back to pure joinedAt order when no host id is
 * given or the host is not present in the entries. Used by both the lobby
 * render and assignSlots so display and game slots never disagree.
 */
export function orderPresence(
  entries: PresenceEntry[],
  hostUserId?: string,
): PresenceEntry[] {
  const byJoin = [...entries].sort((a, b) => a.joinedAt - b.joinedAt);
  if (!hostUserId) return byJoin;
  const host = byJoin.find((e) => e.userId === hostUserId);
  if (!host) return byJoin;
  return [host, ...byJoin.filter((e) => e.userId !== hostUserId)];
}

/** Host gets slot 1; remaining players fill in join order. */
export function assignSlots(
  entries: PresenceEntry[],
  players: Player[],
  hostUserId?: string,
): SlotMap {
  const ordered = orderPresence(entries, hostUserId);
  const map: SlotMap = {};
  players.forEach((p, i) => {
    const e = ordered[i];
    if (e) map[p] = { userId: e.userId, displayName: e.displayName, tier: e.tier, skin: e.skin };
  });
  return map;
}

// eloDeltas: userId → ELO delta from the recorded game. Unknown until the
// host's recordGame round-trips (and broadcasts) — 0 in the meantime so the
// card shows a neutral value rather than a fabricated one.
export function winnersToGameOver(
  winners: Player[],
  slots: SlotMap,
  eloDeltas?: Record<string, number>,
): { kind: GameOverKind; winners: Winner[] } {
  const kind: GameOverKind =
    winners.length === 0 ? 'none' : winners.length === 1 ? 'solo' : 'joint';
  const list: Winner[] = winners.flatMap((p) => {
    const s = slots[p];
    return s
      ? [
          {
            player: p,
            name: s.displayName,
            tier: s.tier,
            skin: s.skin,
            eloDelta: eloDeltas?.[s.userId] ?? 0,
          },
        ]
      : [];
  });
  return { kind, winners: list };
}
