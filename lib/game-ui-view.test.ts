import { describe, expect, it } from 'vitest';
import { createInitialState } from '@/lib/engine/apply';
import { classic2P } from '@/lib/engine/presets';
import { toGameViewModel, type PlayerMeta } from '@/lib/game-ui-view';

const META: PlayerMeta[] = [
  { player: 1, name: 'White', tier: 'Bronze', skin: 'bronze', isYou: true },
  { player: 2, name: 'Black', tier: 'Bronze', skin: 'bronze' },
];

describe('toGameViewModel', () => {
  it('maps a fresh classic state to a view-model', () => {
    const vm = toGameViewModel(createInitialState(classic2P), META);
    expect(vm.size).toBe(8);
    expect(vm.currentPlayer).toBe(1);
    expect(vm.round).toBe(1);
    expect(vm.pieces).toHaveLength(24);
    expect(vm.centerZone).toEqual([]);
    const p1 = vm.players.find((p) => p.player === 1)!;
    expect(p1.pieceCount).toBe(12);
    expect(p1.alive).toBe(true);
    expect(p1.isActive).toBe(true);
    expect(p1.isYou).toBe(true);
    expect(vm.players.find((p) => p.player === 2)!.isActive).toBe(false);
  });

  it('marks players with zero pieces as not alive and no winner active', () => {
    const base = createInitialState(classic2P);
    const dead = {
      ...base,
      board: base.board.map((row) => row.map(() => null)),
      alivePlayers: [1] as (1 | 2)[],
      winners: [1] as (1 | 2)[],
    };
    const vm = toGameViewModel(dead, META);
    expect(vm.players.every((p) => p.pieceCount === 0)).toBe(true);
    expect(vm.players.find((p) => p.player === 1)!.isActive).toBe(false);
  });
});
