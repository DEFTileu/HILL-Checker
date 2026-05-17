// app/play/classic/local/page.tsx — fully playable local 2-player checkers.
'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { classic2P } from '@/lib/engine/presets';
import { applyMove, createInitialState } from '@/lib/engine/apply';
import { getLegalMoves } from '@/lib/engine/rules';
import { checkWinners } from '@/lib/engine/endgame';
import type { Coord, GameState } from '@/lib/engine/types';
import { GameView } from '@/components/GameView';
import {
  toGameViewModel,
  winnersToOverlay,
  type PlayerMeta,
} from '@/lib/game-ui-view';

const META: PlayerMeta[] = [
  { player: 1, name: 'White', tier: 'Bronze', skin: 'silver', isYou: true },
  { player: 2, name: 'Black', tier: 'Bronze', skin: 'gold' },
];

export default function ClassicLocalPage() {
  const router = useRouter();
  const [state, setState] = useState<GameState>(() =>
    createInitialState(classic2P),
  );
  const [selected, setSelected] = useState<Coord | null>(null);
  const [now, setNow] = useState(() => Date.now());
  // eslint-disable-next-line react-hooks/purity
  const startedAt = useRef<number>(Date.now());

  const winners = useMemo(() => checkWinners(state), [state]);

  const legalMoves = useMemo(
    () => (selected && !winners ? getLegalMoves(state, selected) : []),
    [state, selected, winners],
  );
  const moveTo = (r: number, c: number) =>
    legalMoves.find((m) => m.to.row === r && m.to.col === c);

  // 4Hz clock for countdown + skip-on-expiry (15s/turn, no elimination).
  useEffect(() => {
    if (winners) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [winners]);

  useEffect(() => {
    if (winners) return;
    if (state.turnDeadline && now >= state.turnDeadline) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState((s) => applyMove(s, { type: 'skip' }));
      setSelected(null);
    }
  }, [now, state, winners]);

  const handleSquare = useCallback(
    (r: number, c: number) => {
      if (winners) return;
      const m = moveTo(r, c);
      if (m) {
        const next = applyMove(state, m);
        setState(next);
        setSelected(next.mandatoryJumpFrom ?? null);
        return;
      }
      const piece = state.board[r][c];
      if (piece && piece.player === state.currentPlayer) {
        if (state.mandatoryJumpFrom) return;
        setSelected({ row: r, col: c });
        return;
      }
      setSelected(null);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, winners, legalMoves],
  );

  const reset = () => {
    setState(createInitialState(classic2P));
    setSelected(null);
    startedAt.current = Date.now();
    setNow(Date.now());
  };

  const vm = toGameViewModel(state, META);
  const remaining = state.turnDeadline
    ? Math.max(0, Math.ceil((state.turnDeadline - now) / 1000))
    : 0;
  // eslint-disable-next-line react-hooks/refs
  const elapsed = Math.max(0, Math.floor((now - startedAt.current) / 1000));
  const dur = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')}`;
  const ov = winners ? winnersToOverlay(winners, META) : null;

  return (
    <GameView
      vm={vm}
      mode="hot-seat"
      rotateForActivePlayerDesktop
      remaining={remaining}
      selected={selected ? [selected.row, selected.col] : null}
      legalTargets={legalMoves.map((m) => [m.to.row, m.to.col])}
      isYourTurn={!winners}
      onSquareClick={handleSquare}
      onResign={() => router.push('/play/classic')}
      gameOver={
        ov
          ? {
              kind: ov.kind,
              winners: ov.winners,
              matchDuration: dur,
              roundCount: state.round,
              mode: state.config.mode,
              onPlayAgain: reset,
              onLobby: () => router.push('/'),
            }
          : null
      }
    />
  );
}
