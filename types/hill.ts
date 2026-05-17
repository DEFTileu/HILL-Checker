export type Player = 1 | 2 | 3 | 4;
export type Coord = [row: number, col: number];
export type PieceKind = 'pawn' | 'king';
export type ArenaTier = 'Bronze' | 'Silver' | 'Gold' | 'Master' | 'Champion';
export type SkinId = 'bronze' | 'silver' | 'gold' | 'master' | 'champion';
export type GameMode = 'blitz' | 'survival';
export type PlayStyle = 'hotseat' | 'multi';

export interface Piece {
    player: Player;
    kind: PieceKind;
    pos: Coord;
    skin?: SkinId;
    dimmed?: boolean;
}

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