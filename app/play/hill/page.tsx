'use client';

// TEMPORARY inline board for end-to-end playtesting of King of Hill 4P.
// Real UI comes from Claude Design later. No game rules live here — every
// decision flows through the pure engine.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { hillBlitz, hillSurvival } from '@/lib/engine/presets';
import { applyMove, createInitialState, skipTurn } from '@/lib/engine/apply';
import { getLegalMoves } from '@/lib/engine/rules';
import { checkWinners } from '@/lib/engine/endgame';
import type { Coord, GameState, Move, Player } from '@/lib/engine/types';

const PLAYER_COLOR: Record<Player, string> = {
  1: '#e11d48', // top-left
  2: '#3b82f6', // top-right
  3: '#22c55e', // bottom-right
  4: '#f59e0b', // bottom-left
};

const CORNER: Record<Player, string> = {
  1: 'top-left',
  2: 'top-right',
  3: 'bottom-right',
  4: 'bottom-left',
};

export default function HillPage() {
  const [mode, setMode] = useState<'blitz' | 'survival'>('blitz');
  const [state, setState] = useState<GameState | null>(null);
  const [selected, setSelected] = useState<Coord | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const prevAlive = useRef<Player[]>([]);
  const announcedWin = useRef(false);

  const winners = useMemo(
    () => (state ? checkWinners(state) : null),
    [state],
  );

  const legalMoves: Move[] = useMemo(
    () => (state && selected ? getLegalMoves(state, selected) : []),
    [state, selected],
  );
  const moveTo = (r: number, c: number) =>
    legalMoves.find((m) => m.to.row === r && m.to.col === c);

  const start = (m: 'blitz' | 'survival') => {
    const cfg = m === 'blitz' ? hillBlitz : hillSurvival;
    const s = createInitialState(cfg);
    prevAlive.current = [...s.alivePlayers];
    announcedWin.current = false;
    setState(s);
    setSelected(null);
    setNow(Date.now());
  };

  // 4Hz clock for the countdown + skip-on-expiry.
  useEffect(() => {
    if (!state) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [state]);

  // Timer expiry → engine skip-turn action (no elimination).
  useEffect(() => {
    if (!state || winners) return;
    if (state.turnDeadline && now >= state.turnDeadline) {
      setState(skipTurn(state));
      setSelected(null);
    }
  }, [now, state, winners]);

  // Elimination + winner announcements.
  useEffect(() => {
    if (!state) return;
    const dropped = prevAlive.current.filter(
      (p) => !state.alivePlayers.includes(p),
    );
    for (const p of dropped) window.alert(`Player ${p} eliminated`);
    prevAlive.current = [...state.alivePlayers];

    if (winners && !announcedWin.current) {
      announcedWin.current = true;
      window.alert(
        winners.length === 0
          ? 'Draw — nobody held the Hill'
          : `Winner(s): ${winners.map((p) => `Player ${p}`).join(', ')}`,
      );
    }
  }, [state, winners]);

  const handleSquareClick = useCallback(
    (r: number, c: number) => {
      if (!state || winners) return;
      const move = moveTo(r, c);
      if (move) {
        const next = applyMove(state, move);
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

  // ---- Mode select screen ----
  if (!state) {
    return (
      <main style={shellStyle}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>King of Hill — 4P</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          {(['blitz', 'survival'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                ...btnStyle,
                outline: mode === m ? '2px solid #a3e635' : 'none',
              }}
            >
              {m === 'blitz' ? 'Blitz (7 rounds)' : 'Survival (20 rounds)'}
            </button>
          ))}
        </div>
        <button onClick={() => start(mode)} style={{ ...btnStyle, fontWeight: 700 }}>
          Start
        </button>
      </main>
    );
  }

  const cfg = state.config;
  const n = cfg.boardSize;
  const inCenter = (r: number, c: number) =>
    cfg.centerZone.some((z) => z.row === r && z.col === c);
  const isSelected = (r: number, c: number) =>
    selected?.row === r && selected?.col === c;

  const remaining = state.turnDeadline
    ? Math.max(0, Math.ceil((state.turnDeadline - now) / 1000))
    : 0;

  const roundLabel =
    cfg.mode === 'hill-blitz'
      ? `Round ${state.round} / ${cfg.maxRounds}`
      : `Round ${state.round} — Survival (max ${cfg.maxRounds})`;

  let banner: string;
  if (winners === null) banner = roundLabel;
  else if (winners.length === 0) banner = 'Draw — nobody held the Hill';
  else banner = `Winner(s): ${winners.map((p) => `Player ${p}`).join(', ')}`;

  return (
    <main style={shellStyle}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>King of Hill — 4P</h1>
      <div style={{ fontSize: 18, fontWeight: 600, color: '#a3e635' }}>{banner}</div>
      {winners === null && (
        <div style={{ fontSize: 16 }}>
          Player {state.currentPlayer}&apos;s turn —{' '}
          <span style={{ color: remaining <= 3 ? '#f87171' : '#f5f5f5' }}>
            {remaining}s
          </span>
        </div>
      )}

      {/* 4-player panel */}
      <div style={{ display: 'flex', gap: 10 }}>
        {([1, 2, 3, 4] as Player[]).map((p) => {
          const alive = state.alivePlayers.includes(p);
          const active = winners === null && state.currentPlayer === p;
          return (
            <div
              key={p}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: `2px solid ${active ? '#a3e635' : '#3a3a44'}`,
                background: '#2d2d36',
                opacity: alive ? 1 : 0.35,
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: PLAYER_COLOR[p],
                  margin: '0 auto 4px',
                }}
              />
              <div style={{ fontSize: 12 }}>
                P{p} · {CORNER[p]}
              </div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>
                {alive ? 'in play' : 'out'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Board */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${n}, 46px)`,
          gridTemplateRows: `repeat(${n}, 46px)`,
          border: '4px solid #3a3a44',
        }}
      >
        {Array.from({ length: n }).map((_, r) =>
          Array.from({ length: n }).map((__, c) => {
            const dark = (r + c) % 2 === 1;
            const piece = state.board[r][c];
            const center = inCenter(r, c);
            const target = !!moveTo(r, c);
            return (
              <div
                key={`${r}-${c}`}
                onClick={() => handleSquareClick(r, c)}
                style={{
                  width: 46,
                  height: 46,
                  background: dark ? '#5b4636' : '#d8c4a0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: dark ? 'pointer' : 'default',
                  position: 'relative',
                  boxShadow: center ? 'inset 0 0 0 3px #a3e635' : undefined,
                  outline: isSelected(r, c) ? '3px solid #fbbf24' : 'none',
                  outlineOffset: '-3px',
                }}
              >
                {target && (
                  <span
                    style={{
                      position: 'absolute',
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: 'rgba(163, 230, 53, 0.85)',
                    }}
                  />
                )}
                {piece && (
                  <span
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: PLAYER_COLOR[piece.player],
                      border: '2px solid rgba(255,255,255,0.45)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#1e1e24',
                      fontSize: 18,
                      fontWeight: 800,
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

      <button onClick={() => setState(null)} style={btnStyle}>
        ← Mode select
      </button>
    </main>
  );
}

const shellStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 14,
  padding: 24,
  background: '#1e1e24',
  color: '#f5f5f5',
  fontFamily: 'system-ui, sans-serif',
};

const btnStyle: React.CSSProperties = {
  padding: '8px 18px',
  borderRadius: 8,
  border: '1px solid #4b5563',
  background: '#2d2d36',
  color: '#f5f5f5',
  cursor: 'pointer',
  fontSize: 14,
};
