// Pure ELO rating math. No React, no Supabase — runnable in Node and unit
// tested in isolation (mirrors the lib/engine/* purity rule).

const K = 32; // standard K-factor for casual play
// 1100 (was 1000) — mid-Bronze (1000–1199), so a brand-new account's tier
// progress bar starts at 50% instead of a discouraging 0%.
const STARTING_ELO = 1100;

export { STARTING_ELO };

function expectedScore(playerElo: number, opponentElo: number): number {
  return 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
}

export interface GameParticipant {
  userId: string;
  elo: number; // pre-game ELO
  isWinner: boolean;
}

/**
 * Pairwise ELO: each winner-loser pair plays a notional 1v1.
 * Winners don't update against each other (Joint Kings tie = no change between
 * them); losers likewise don't update against each other. Returns new ELO per
 * userId after all pairs are processed.
 */
export function calculateGameEloUpdates(
  participants: GameParticipant[],
): Record<string, number> {
  const updates: Record<string, number> = {};
  for (const p of participants) updates[p.userId] = p.elo;

  const winners = participants.filter((p) => p.isWinner);
  const losers = participants.filter((p) => !p.isWinner);

  // Apply all pairwise updates atomically using PRE-game ELO so order doesn't
  // matter.
  const deltas: Record<string, number> = {};
  for (const p of participants) deltas[p.userId] = 0;

  for (const w of winners) {
    for (const l of losers) {
      const expW = expectedScore(w.elo, l.elo);
      const expL = expectedScore(l.elo, w.elo);
      deltas[w.userId] += Math.round(K * (1 - expW));
      deltas[l.userId] += Math.round(K * (0 - expL));
    }
  }

  for (const p of participants) {
    updates[p.userId] = Math.max(100, p.elo + deltas[p.userId]); // floor at 100
  }
  return updates;
}

export function getEloDelta(beforeElo: number, afterElo: number): number {
  return afterElo - beforeElo;
}
