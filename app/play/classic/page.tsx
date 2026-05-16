'use client';

// TEMPORARY inline board for end-to-end playtesting.
// Real UI comes from Claude Design later — this only wires the pure
// engine to clicks. No game rules live here.

import { useMemo, useState } from 'react';
import { classic2P } from '@/lib/engine/presets';
import { applyMove, createInitialState } from '@/lib/engine/apply';
import { getLegalMoves } from '@/lib/engine/rules';
import { checkWinners } from '@/lib/engine/endgame';
import type { Coord, GameState, Move } from '@/lib/engine/types';

export default function ClassicPage() {
  const [state, setState] = useState<GameState>(() => createInitialState(classic2P));
  const [selected, setSelected] = useState<Coord | null>(null);

  const winners = useMemo(() => checkWinners(state), [state]);

  const legalMoves: Move[] = useMemo(
    () => (selected ? getLegalMoves(state, selected) : []),
    [state, selected],
  );

  const moveTo = (r: number, c: number): Move | undefined =>
    legalMoves.find((m) => m.to.row === r && m.to.col === c);

  function handleSquareClick(r: number, c: number) {
    if (winners) return;

    // Completing a (possibly multi-) jump or step.
    const move = moveTo(r, c);
    if (move) {
      const next = applyMove(state, move);
      setState(next);
      // Auto-keep the jumping piece selected during a forced multi-jump.
      setSelected(next.mandatoryJumpFrom ?? null);
      return;
    }

    // Selecting one of the current player's own pieces.
    const piece = state.board[r][c];
    if (piece && piece.player === state.currentPlayer) {
      if (state.mandatoryJumpFrom) return; // locked to the jumping piece
      setSelected({ row: r, col: c });
      return;
    }

    setSelected(null);
  }

  const n = classic2P.boardSize;
  const isSelected = (r: number, c: number) =>
    selected?.row === r && selected?.col === c;

  let banner: string;
  if (winners === null) {
    banner = `Player ${state.currentPlayer}'s turn — round ${state.round}`;
  } else if (winners.length === 0) {
    banner = 'Draw!';
  } else {
    banner = `Player ${winners.join(' & ')} wins!`;
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        padding: 24,
        background: '#1e1e24',
        color: '#f5f5f5',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>Classic 2P — Hot Seat</h1>

      <div
        role="status"
        style={{
          fontSize: 18,
          fontWeight: 600,
          color: winners ? '#7dd3fc' : '#f5f5f5',
        }}
      >
        {banner}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${n}, 56px)`,
          gridTemplateRows: `repeat(${n}, 56px)`,
          border: '4px solid #3a3a44',
        }}
      >
        {Array.from({ length: n }).map((_, r) =>
          Array.from({ length: n }).map((__, c) => {
            const dark = (r + c) % 2 === 1;
            const piece = state.board[r][c];
            const target = !!moveTo(r, c);
            return (
              <div
                key={`${r}-${c}`}
                onClick={() => handleSquareClick(r, c)}
                style={{
                  width: 56,
                  height: 56,
                  background: dark ? '#5b4636' : '#d8c4a0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: dark ? 'pointer' : 'default',
                  position: 'relative',
                  outline: isSelected(r, c) ? '3px solid #fbbf24' : 'none',
                  outlineOffset: '-3px',
                }}
              >
                {target && (
                  <span
                    style={{
                      position: 'absolute',
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: 'rgba(125, 211, 252, 0.85)',
                    }}
                  />
                )}
                {piece && (
                  <span
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      background: piece.player === 1 ? '#e11d48' : '#1e1e24',
                      border:
                        piece.player === 1
                          ? '2px solid #fb7185'
                          : '2px solid #6b7280',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fbbf24',
                      fontSize: 20,
                      fontWeight: 700,
                    }}
                  >
                    {piece.king ? '♔' : ''}
                  </span>
                )}
              </div>
            );
          }),
        )}
      </div>

      <button
        onClick={() => {
          setState(createInitialState(classic2P));
          setSelected(null);
        }}
        style={{
          padding: '8px 18px',
          borderRadius: 8,
          border: '1px solid #4b5563',
          background: '#2d2d36',
          color: '#f5f5f5',
          cursor: 'pointer',
          fontSize: 14,
        }}
      >
        New game
      </button>
    </main>
  );
}
