// lib/game-ui.ts
// UI / view-model types (relocated from the deleted types/hill.ts).
import type { Player } from './tokens';
import type { ArenaTier, SkinId } from './skins';

export type GameMode = 'blitz' | 'survival' | 'classic';
export type PlayStyle = 'hotseat' | 'multi';

export interface Profile {
  id: string;
  displayName: string;
  email?: string;
  totalWins: number;
  totalGames: number;
  arenaTier: ArenaTier;
  selectedSkin: SkinId;
  elo: number;
}

export interface LobbyPlayer {
  player: Player;
  name: string;
  tier: ArenaTier;
  skin: SkinId;
  isHost?: boolean;
  isYou?: boolean;
}

export interface GamePlayer extends LobbyPlayer {
  isActive?: boolean;
  secondsLeft?: number;
  secondsTotal?: number;
  eliminated?: boolean;
}
