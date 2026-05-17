'use client';
import { use, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { hillBlitz, hillSurvival, classic2P } from '@/lib/engine/presets';
import { applyMove, createInitialState } from '@/lib/engine/apply';
import { getLegalMoves } from '@/lib/engine/rules';
import { checkWinners } from '@/lib/engine/endgame';
import { forfeitPlayer } from '@/lib/engine/forfeit';
import type { Action, GameState, Player } from '@/lib/engine/types';
import { useAuth } from '@/lib/auth';
import {
  getRoom,
  updateRoomState,
  type RoomMode,
  type RoomRow,
} from '@/lib/db/rooms';
import { recordGame } from '@/lib/db/games';
import {
  subscribeToRoom,
  broadcastMove,
  broadcastGameStart,
  broadcastSyncRequest,
  broadcastSyncResponse,
  broadcastForfeit,
  broadcastGameResult,
  trackPresence,
} from '@/lib/multiplayer/channel';
import {
  assignSlots,
  orderPresence,
  toTuple,
  winnersToGameOver,
  type PresenceEntry,
  type SlotMap,
} from '@/lib/multiplayer/adapt';
import { Lobby } from '@/components/Lobby';
import { GameView } from '@/components/GameView';
import { toGameViewModel, type PlayerMeta } from '@/lib/game-ui-view';
import type { GameMode, LobbyPlayer } from '@/lib/game-ui';

const PRESET: Record<RoomMode, typeof hillBlitz> = {
  'hill-blitz': hillBlitz,
  'hill-survival': hillSurvival,
  'classic-2p': classic2P,
};
const toGameMode = (m: RoomMode): GameMode =>
  m === 'classic-2p' ? 'classic' : m === 'hill-survival' ? 'survival' : 'blitz';

export default function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(params);
  const router = useRouter();
  const { user, profile } = useAuth();

  const [room, setRoom] = useState<RoomRow | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [presence, setPresence] = useState<PresenceEntry[]>([]);
  const [mode, setMode] = useState<RoomMode>('hill-blitz');
  const [state, setState] = useState<GameState | null>(null);
  const [slots, setSlots] = useState<SlotMap>({});
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  // Per-user ELO delta after the recorded game. Host fills it from
  // recordGame()'s response; everyone else from the broadcast.
  const [eloDeltas, setEloDeltas] = useState<Record<string, number> | null>(
    null,
  );
  const [now, setNow] = useState(() => Date.now());
  // startedAtMs mirrors the startedAt ref for render-safe reads (elapsed timer display).
  const [startedAtMs, setStartedAtMs] = useState(0);

  const [disconnectedAt, setDisconnectedAt] = useState<
    Partial<Record<Player, number>>
  >({});
  const forfeitTimers = useRef<
    Partial<Record<Player, ReturnType<typeof setTimeout>>>
  >({});
  const presenceRef = useRef<PresenceEntry[]>([]);

  const chRef = useRef<RealtimeChannel | null>(null);
  const stateRef = useRef<GameState | null>(null);
  const slotsRef = useRef<SlotMap>({});
  const isHostRef = useRef(false);
  const elimRound = useRef<Partial<Record<Player, number>>>({});
  const prevAlive = useRef<Player[]>([]);
  const recorded = useRef(false);
  const startedAt = useRef<number>(0);

  // Sync mutable refs after every render so callbacks/effects always see the
  // latest values. useLayoutEffect runs synchronously after DOM mutations and
  // before any effects fire, which is the correct place to write refs.
  const isHost = !!user && !!room && room.host_user_id === user.id;
  useLayoutEffect(() => {
    stateRef.current = state;
    slotsRef.current = slots;
    isHostRef.current = isHost;
  });

  const winners = useMemo(() => (state ? checkWinners(state) : null), [state]);

  // Apply an engine action locally; mover also broadcasts.
  const applyAction = useCallback((action: Action, broadcast: boolean) => {
    setState((prev) => (prev ? applyMove(prev, action) : prev));
    if (broadcast && chRef.current && stateRef.current) {
      broadcastMove(chRef.current, action);
    }
  }, []);

  // Apply a forfeit locally; host also broadcasts. Mirrors applyAction.
  const applyForfeit = useCallback((player: Player, broadcast: boolean) => {
    setState((prev) => (prev ? forfeitPlayer(prev, player) : prev));
    if (
      broadcast &&
      isHostRef.current &&
      chRef.current &&
      stateRef.current
    ) {
      broadcastForfeit(chRef.current, player);
    }
    setDisconnectedAt((prev) => {
      if (prev[player] == null) return prev;
      const copy = { ...prev };
      delete copy[player];
      return copy;
    });
    const t = forfeitTimers.current[player];
    if (t) {
      clearTimeout(t);
      delete forfeitTimers.current[player];
    }
  }, []);

  // Load room + subscribe.
  useEffect(() => {
    let active = true;
    if (!user || !profile) return;

    (async () => {
      const r = await getRoom(roomId);
      if (!active) return;
      if (!r) {
        setNotFound(true);
        return;
      }
      setRoom(r);
      setMode(r.mode);
      if (r.status === 'playing' && r.state) {
        setState(r.state.game);
        setSlots(r.state.slots);
        const ts = Date.now();
        startedAt.current = ts;
        setStartedAtMs(ts);
      }

      const slotOf = (userId: string): Player | null => {
        const sl = slotsRef.current;
        for (const key of Object.keys(sl) as unknown as Player[]) {
          const p = Number(key) as Player;
          if (sl[p]?.userId === userId) return p;
        }
        return null;
      };

      const ch = subscribeToRoom(roomId, {
        onPresenceSync: (e) => {
          presenceRef.current = e;
          setPresence(e);
        },
        onPresenceJoin: (userIds) => {
          for (const uid of userIds) {
            const p = slotOf(uid);
            if (p == null) continue;
            setDisconnectedAt((prev) => {
              if (prev[p] == null) return prev;
              const copy = { ...prev };
              delete copy[p];
              return copy;
            });
            const t = forfeitTimers.current[p];
            if (t) {
              clearTimeout(t);
              delete forfeitTimers.current[p];
            }
          }
        },
        onPresenceLeave: (userIds) => {
          for (const uid of userIds) {
            const p = slotOf(uid);
            if (p == null) continue;
            if (!stateRef.current || checkWinners(stateRef.current)) continue;
            setDisconnectedAt((prev) => ({ ...prev, [p]: Date.now() }));
            if (!isHostRef.current) continue;
            const existing = forfeitTimers.current[p];
            if (existing) clearTimeout(existing);
            forfeitTimers.current[p] = setTimeout(() => {
              delete forfeitTimers.current[p];
              const stillGone = !presenceRef.current.some(
                (e) => e.userId === uid,
              );
              if (
                stillGone &&
                stateRef.current &&
                !checkWinners(stateRef.current)
              ) {
                applyForfeit(p, true);
              }
            }, 10_000);
          }
        },
        onForfeit: (p) => applyForfeit(p, false),
        onMove: (action) => applyAction(action, false),
        onGameStart: ({ state: s, slots: sl }) => {
          const ts = Date.now();
          startedAt.current = ts;
          setStartedAtMs(ts);
          recorded.current = false;
          setEloDeltas(null);
          elimRound.current = {};
          prevAlive.current = [...s.alivePlayers];
          setSlots(sl);
          setState(s);
          setRoom((cur) => (cur ? { ...cur, status: 'playing' } : cur));
        },
        onSyncRequest: () => {
          if (stateRef.current && chRef.current) {
            broadcastSyncResponse(chRef.current, stateRef.current);
          }
        },
        onSyncResponse: (s) => {
          if (!stateRef.current) setState(s);
        },
        onModeChange: (m) => setMode(m),
        onGameResult: (m) => setEloDeltas(m),
      });
      chRef.current = ch;

      ch.subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') return;
        await trackPresence(ch, {
          userId: user.id,
          displayName: profile.displayName,
          tier: profile.arenaTier,
          skin: profile.selectedSkin,
          joinedAt: Date.now(),
        });
        if (r.status === 'playing') broadcastSyncRequest(ch);
      });
    })();

    return () => {
      active = false;
      for (const key of Object.keys(forfeitTimers.current)) {
        const tm = forfeitTimers.current[Number(key) as Player];
        if (tm) clearTimeout(tm);
      }
      forfeitTimers.current = {};
      if (chRef.current) {
        chRef.current.unsubscribe();
        chRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, user, profile]);

  // Host side-effects: snapshot, elimination, result recording.
  useEffect(() => {
    if (!state || !isHostRef.current) return;

    const dropped = prevAlive.current.filter(
      (p) => !state.alivePlayers.includes(p),
    );
    for (const p of dropped) {
      if (elimRound.current[p] == null) elimRound.current[p] = state.round;
    }
    prevAlive.current = [...state.alivePlayers];

    void updateRoomState(roomId, {
      state: { game: state, slots: slotsRef.current },
      status: winners ? 'finished' : 'playing',
    });

    if (winners && !recorded.current) {
      recorded.current = true;
      const sl = slotsRef.current;
      const players = (Object.keys(sl) as unknown as Player[])
        .map(Number)
        .filter((p): p is Player => !!sl[p as Player])
        .map((p) => ({
          userId: sl[p]!.userId,
          slot: p,
          eliminatedRound: elimRound.current[p] ?? null,
        }));
      const winnerIds = winners
        .map((p) => sl[p]?.userId)
        .filter((x): x is string => !!x);
      void recordGame({
        mode: state.config.mode,
        winners: winnerIds,
        players,
      }).then((changes) => {
        if (!changes) return;
        const deltas: Record<string, number> = {};
        for (const [uid, c] of Object.entries(changes)) deltas[uid] = c.delta;
        setEloDeltas(deltas);
        if (chRef.current) broadcastGameResult(chRef.current, deltas);
      });
    }
  }, [state, winners, roomId]);

  // Host timer authority: skip on deadline expiry.
  useEffect(() => {
    if (!state || winners) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [state, winners]);

  useEffect(() => {
    if (!state || winners || !isHostRef.current) return;
    if (state.turnDeadline && now >= state.turnDeadline) {
      // Intentional: host-authority timer expiry must advance game state from
      // this effect (external clock is the trigger). setSelected is already
      // deferred via queueMicrotask below.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      applyAction({ type: 'skip' }, true);
      // Defer setSelected to avoid synchronous setState inside effect body.
      queueMicrotask(() => setSelected(null));
    }
  }, [now, state, winners, applyAction]);

  // Derived.
  const mySlotPlayer = useMemo<Player | null>(() => {
    if (!user) return null;
    for (const p of Object.keys(slots) as unknown as Player[]) {
      if (slots[Number(p) as Player]?.userId === user.id) {
        return Number(p) as Player;
      }
    }
    return null;
  }, [slots, user]);

  const canMove =
    !!state && !winners && state.currentPlayer === mySlotPlayer;

  const legalMoves = useMemo(
    () =>
      state && selected && canMove ? getLegalMoves(state, selected) : [],
    [state, selected, canMove],
  );
  const moveTo = (r: number, c: number) =>
    legalMoves.find((m) => m.to.row === r && m.to.col === c);

  const handleSquare = useCallback(
    (r: number, c: number) => {
      if (!state || winners || !canMove) return;
      const m = moveTo(r, c);
      if (m) {
        // Compute the post-move state synchronously so we know whether a
        // chain jump remains. stateRef.current is still the pre-move state
        // here (it syncs in useLayoutEffect, after this handler), so reading
        // it would always see mandatoryJumpFrom=null and break multi-jump.
        const next = applyMove(state, m);
        applyAction(m, true);
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
    [state, winners, canMove, legalMoves],
  );

  // Render.
  if (notFound) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-hill-bg text-hill-text">
        <div className="text-2xl font-extrabold">Room not found</div>
        <button
          onClick={() => router.push('/')}
          className="rounded-[10px] border border-hill-border bg-hill-surface px-4 py-2 text-sm font-semibold"
        >
          Home
        </button>
      </div>
    );
  }
  if (!room) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-hill-bg text-hill-muted font-mono text-[12px] tracking-[0.18em]">
        LOADING…
      </div>
    );
  }

  // GAME view
  if (state && room.status === 'playing') {
    const go = winners
      ? winnersToGameOver(winners, slots, eloDeltas ?? undefined)
      : null;
    const elapsed = Math.max(0, Math.floor((now - startedAtMs) / 1000));
    const dur = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')}`;

    const meta: PlayerMeta[] = (Object.keys(slots) as unknown as Player[])
      .map(Number)
      .filter((p): p is Player => !!slots[p as Player])
      .map((p) => {
        const dcAt = disconnectedAt[p];
        return {
          player: p as Player,
          name: slots[p as Player]!.displayName,
          tier: slots[p as Player]!.tier,
          skin: slots[p as Player]!.skin,
          isYou: slots[p as Player]!.userId === user?.id,
          disconnectSecondsLeft:
            dcAt != null
              ? Math.max(0, Math.ceil((dcAt + 10_000 - now) / 1000))
              : undefined,
        };
      });

    const vm = toGameViewModel(state, meta);
    const remaining = state.turnDeadline
      ? Math.max(0, Math.ceil((state.turnDeadline - now) / 1000))
      : 0;

    return (
      <GameView
        vm={vm}
        mode="multiplayer"
        localPlayer={mySlotPlayer ?? undefined}
        roomCode={roomId}
        remaining={remaining}
        selected={selected ? toTuple(selected) : null}
        legalTargets={legalMoves.map((m) => toTuple(m.to))}
        isYourTurn={canMove}
        onSquareClick={handleSquare}
        onResign={() => router.push('/')}
        gameOver={
          go
            ? {
                kind: go.kind,
                winners: go.winners,
                matchDuration: dur,
                roundCount: state.round,
                mode: state.config.mode,
                onPlayAgain: () => router.push('/r/new'),
                onLobby: () => router.push('/'),
              }
            : null
        }
      />
    );
  }

  // LOBBY view
  const cfg = PRESET[mode];
  const sorted = orderPresence(presence, room.host_user_id);
  const lobbyPlayers = cfg.players.map((p, i) => {
    const e = sorted[i];
    if (!e) return { player: p, empty: true as const };
    const lp: LobbyPlayer = {
      player: p,
      name: e.displayName,
      tier: e.tier,
      skin: e.skin,
      isHost: e.userId === room.host_user_id,
      isYou: e.userId === user?.id,
    };
    return lp;
  });

  const onStart = () => {
    if (!isHost || !chRef.current) return;
    const filled = presence.length;
    if (filled < 2) return;
    const sl = assignSlots(
      presence,
      cfg.players.slice(0, filled),
      room.host_user_id,
    );
    const initial = createInitialState(cfg);
    const ts = Date.now();
    startedAt.current = ts;
    setStartedAtMs(ts);
    recorded.current = false;
    setEloDeltas(null);
    elimRound.current = {};
    prevAlive.current = [...initial.alivePlayers];
    setSlots(sl);
    setState(initial);
    setRoom({ ...room, status: 'playing' });
    broadcastGameStart(chRef.current, { state: initial, slots: sl });
    void updateRoomState(roomId, {
      state: { game: initial, slots: sl },
      status: 'playing',
    });
  };


  return (
    <Lobby
      roomCode={roomId}
      mode={toGameMode(mode)}
      players={lobbyPlayers}
      isHost={isHost}
      onStart={onStart}
      onCopyLink={() => {
        void navigator.clipboard.writeText(window.location.href);
      }}
      onShare={() => {
        if (navigator.share) {
          void navigator.share({ url: window.location.href });
        } else {
          void navigator.clipboard.writeText(window.location.href);
        }
      }}
      onBack={() => router.push('/')}
    />
  );
}
