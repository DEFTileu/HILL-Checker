// app/play/hill/local/page.tsx — local 4-player King of the Hill (hot-seat).
'use client';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { hillBlitz, hillSurvival } from '@/lib/engine/presets';
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
  { player: 1, name: 'Player 1', tier: 'Bronze', skin: 'silver' },
  { player: 2, name: 'Player 2', tier: 'Bronze', skin: 'gold' },
  { player: 3, name: 'Player 3', tier: 'Bronze', skin: 'bronze' },
  { player: 4, name: 'Player 4', tier: 'Bronze', skin: 'master' },
];

function HillLocalInner() {
  const router = useRouter();
  const search = useSearchParams();
  const mode = search.get('mode') === 'survival' ? 'survival' : 'blitz';

  const [state, setState] = useState<GameState>(() =>
    createInitialState(mode === 'survival' ? hillSurvival : hillBlitz),
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
    setState(createInitialState(mode === 'survival' ? hillSurvival : hillBlitz));
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
      remaining={remaining}
      selected={selected ? [selected.row, selected.col] as [number, number] : null}
      legalTargets={legalMoves.map((m) => [m.to.row, m.to.col] as [number, number])}
      isYourTurn={!winners}
      onSquareClick={handleSquare}
      onResign={() => router.push('/')}
      gameOver={
        ov
          ? {
              kind: ov.kind,
              winners: ov.winners,
              matchDuration: dur,
              roundCount: state.round,
              mode: state.config.mode,
              onPlayAgain: reset,
              onShare: () => {
                void navigator.clipboard.writeText(window.location.href);
              },
              onLobby: () => router.push('/'),
            }
          : null
      }
    />
  );
}

export default function HillLocalPage() {
  return (
    <Suspense fallback={null}>
      <HillLocalInner />
    </Suspense>
  );
}
