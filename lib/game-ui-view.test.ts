import { describe, expect, it } from 'vitest';
import { createInitialState } from '@/lib/engine/apply';
import { classic2P } from '@/lib/engine/presets';
import { toGameViewModel, winnersToOverlay, type PlayerMeta } from '@/lib/game-ui-view';

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

  it('stamps each board piece with its player\'s skin from meta', () => {
    // RC1 regression: the board renders piece.skin first; if the view model
    // does not join meta-skin onto pieces, every in-game piece falls back to
    // 'bronze' regardless of the player's chosen/assigned skin.
    const skinned: PlayerMeta[] = [
      { player: 1, name: 'White', tier: 'Bronze', skin: 'silver', isYou: true },
      { player: 2, name: 'Black', tier: 'Bronze', skin: 'gold' },
    ];
    const vm = toGameViewModel(createInitialState(classic2P), skinned);
    expect(vm.pieces.length).toBeGreaterThan(0);
    for (const pc of vm.pieces) {
      expect(pc.skin).toBe(pc.player === 1 ? 'silver' : 'gold');
    }
  });

  it('derives alive from board pieces and suppresses isActive when winners is set', () => {
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
    expect(vm.players.find((p) => p.player === 2)!.alive).toBe(false);
    expect(vm.players.find((p) => p.player === 1)!.alive).toBe(false);
  });
});

describe('winnersToOverlay', () => {
  const meta: PlayerMeta[] = [
    { player: 1, name: 'Ann', tier: 'Gold', skin: 'gold' },
    { player: 2, name: 'Bo', tier: 'Silver', skin: 'silver' },
  ];

  it('solo winner', () => {
    const r = winnersToOverlay([1], meta);
    expect(r.kind).toBe('solo');
    expect(r.winners).toEqual([
      { player: 1, name: 'Ann', tier: 'Gold', skin: 'gold', eloDelta: 20 },
    ]);
  });

  it('joint winners', () => {
    expect(winnersToOverlay([1, 2], meta).kind).toBe('joint');
  });

  it('no winner', () => {
    const r = winnersToOverlay([], meta);
    expect(r.kind).toBe('none');
    expect(r.winners).toEqual([]);
  });
});
