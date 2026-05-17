// HILL — desktop screens batch C: Classic 2P, Hill 4P, Death, Game Over

// ─────────────────────────────────────────────────────────────
// 8) CLASSIC 2P GAME — desktop (P1 left of board, P2 right)
// ─────────────────────────────────────────────────────────────
function ScreenWebClassic({ height = 980 }) {
  const pieces = [
    { player: 1, kind: 'pawn', pos: [5, 0] }, { player: 1, kind: 'pawn', pos: [5, 2] },
    { player: 1, kind: 'pawn', pos: [6, 1] }, { player: 1, kind: 'pawn', pos: [6, 3] },
    { player: 1, kind: 'pawn', pos: [6, 5] }, { player: 1, kind: 'pawn', pos: [6, 7] },
    { player: 1, kind: 'pawn', pos: [7, 0] }, { player: 1, kind: 'pawn', pos: [7, 2] },
    { player: 1, kind: 'king', pos: [4, 5] },
    { player: 2, kind: 'pawn', pos: [0, 1] }, { player: 2, kind: 'pawn', pos: [0, 3] },
    { player: 2, kind: 'pawn', pos: [0, 5] }, { player: 2, kind: 'pawn', pos: [1, 0] },
    { player: 2, kind: 'pawn', pos: [1, 4] }, { player: 2, kind: 'pawn', pos: [1, 6] },
    { player: 2, kind: 'pawn', pos: [2, 3] }, { player: 2, kind: 'pawn', pos: [3, 4] },
  ];

  return (
    <WebShell height={height} nav={<TopNav active="hill" signedIn={true}/>}>
      <Container style={{ paddingTop: 28, paddingBottom: 28, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <a className="web-link" style={{ fontSize: 13, color: HILL.muted, cursor: 'pointer' }}>← Back to menu</a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="hill-mono" style={{ fontSize: 11, color: HILL.muted, letterSpacing: '0.14em' }}>CLASSIC · 8×8 · 2P</span>
            <span style={{ width: 1, height: 14, background: HILL.border, margin: '0 4px' }}/>
            <button className="hill-btn web-btn web-btn-outline" style={{
              padding: '6px 14px', borderRadius: 8, background: HILL.surface, border: `1px solid ${HILL.border}`,
              fontSize: 11, color: HILL.muted, letterSpacing: '0.1em', fontWeight: 700,
            }}>RESIGN</button>
          </div>
        </div>

        {/* Turn indicator above */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 14,
            padding: '12px 22px 12px 16px',
            background: HILL.surface,
            border: `1.5px solid ${HILL.accent}`,
            borderRadius: 999,
            fontSize: 16, fontWeight: 700,
            boxShadow: `0 0 24px rgba(191,255,0,0.15)`,
          }}>
            <PieceShape player={1} size={28} skin="silver"/>
            <span>WHITE'S TURN</span>
            <span style={{ width: 1, height: 18, background: HILL.borderHi }}/>
            <span className="hill-mono" style={{ color: HILL.accent, fontSize: 16, fontWeight: 700 }}>0:07</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 36, flex: 1 }}>
          {/* P1 left panel */}
          <ClassicPlayerCard player={1} name="Aida K." tier="Gold" skin="silver" you isActive captured={3} pieces={9} alignment="right"/>

          {/* Board */}
          <Board size={8} pieces={pieces} cellSize={66}
            skinForPlayer={{ 1: 'silver', 2: 'gold' }}
            selected={[4, 5]}
            highlighted={[[3, 4], [3, 6], [2, 3], [2, 7]]}
            lastMove={[[3, 4], [4, 5]]}
          />

          {/* P2 right panel */}
          <ClassicPlayerCard player={2} name="Marcus J." tier="Gold" skin="gold" captured={4} pieces={8} alignment="left"/>
        </div>

        {/* Below: move history strip */}
        <div style={{ marginTop: 28, display: 'flex', justifyContent: 'center' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 18px',
            background: HILL.surface, border: `1px solid ${HILL.border}`, borderRadius: 999,
            fontFamily: HILL.mono, fontSize: 12, color: HILL.muted, letterSpacing: '0.06em',
          }}>
            <span style={{ color: HILL.dim }}>MOVES</span>
            <span style={{ width: 1, height: 14, background: HILL.border }}/>
            {['1. c3-d4','d6-c5','2. e3-f4','b6-a5','3. f4×e5','— ←'].map((m, i) => (
              <span key={i} style={{ color: i === 5 ? HILL.accent : HILL.text, fontWeight: i === 5 ? 700 : 500 }}>{m}</span>
            ))}
          </div>
        </div>
      </Container>
    </WebShell>
  );
}

function ClassicPlayerCard({ player, name, tier, skin, you, isActive, captured, pieces, alignment = 'right' }) {
  const color = [HILL.p1, HILL.p2, HILL.p3, HILL.p4][player - 1];
  return (
    <div style={{
      position: 'relative',
      width: 240,
      background: HILL.surface,
      border: `1.5px solid ${isActive ? HILL.accent : HILL.border}`,
      borderRadius: 16, padding: '22px 20px',
      display: 'flex', flexDirection: 'column', gap: 16,
      boxShadow: isActive ? '0 0 28px rgba(191,255,0,0.15)' : 'none',
    }}>
      <div style={{
        position: 'absolute', top: 0, bottom: 0, [alignment]: 0, width: 3,
        background: color,
      }}/>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <PieceSamplePreview player={player} skin={skin} size={42}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 16, fontWeight: 700, whiteSpace: 'nowrap' }}>{name}</span>
            {you && <span style={{ fontSize: 10, fontWeight: 800, color: HILL.accent, letterSpacing: '0.1em' }}>YOU</span>}
          </div>
          <div style={{ marginTop: 6 }}><ArenaBadge tier={tier}/></div>
        </div>
      </div>

      <div style={{
        display: 'flex', flexDirection: 'column', gap: 6,
        padding: '12px 14px',
        background: HILL.surface2, borderRadius: 10, border: `1px solid ${HILL.border}`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="hill-mono" style={{ fontSize: 10, color: HILL.muted, letterSpacing: '0.14em' }}>PIECES</span>
          <span className="hill-mono" style={{ fontSize: 22, fontWeight: 800, color: HILL.text }}>{pieces}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="hill-mono" style={{ fontSize: 10, color: HILL.muted, letterSpacing: '0.14em' }}>CAPTURED</span>
          <span className="hill-mono" style={{ fontSize: 16, fontWeight: 700, color: HILL.accent }}>{captured}</span>
        </div>
      </div>

      {isActive && (
        <div style={{
          textAlign: 'center', fontSize: 10, fontWeight: 800,
          color: HILL.accent, fontFamily: HILL.mono, letterSpacing: '0.2em',
        }}>● ACTIVE TURN</div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 9) HILL 4P GAME — desktop (panels flanking the board)
// ─────────────────────────────────────────────────────────────
function ScreenWebHillGame({ overlay = null, mode = 'blitz', blurBoard = false, height = 1020 }) {
  const pieces = makeHillPieces();
  const centerZone = [[4,4],[4,5],[5,4],[5,5]];
  // P1 + P4 left stack; P2 + P3 right stack
  const left = [
    { player: 1, name: 'Aida K.',  tier: 'Gold',   you: true,   alivePieces: 7, skin: 'gold' },
    { player: 4, name: 'Riko',     tier: 'Master', alivePieces: 7, skin: 'master' },
  ];
  const right = [
    { player: 2, name: 'Marcus',   tier: 'Gold',   isActive: true, secondsLeft: 6, secondsTotal: 10, alivePieces: 7, skin: 'gold' },
    { player: 3, name: 'Sam',      tier: 'Bronze', eliminated: true, alivePieces: 3, skin: 'bronze' },
  ];

  return (
    <WebShell height={height} nav={<TopNav active="hill" signedIn={true}/>}>
      <Container style={{ paddingTop: 24, paddingBottom: 24, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top bar: back · round counter · room code */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <a className="web-link" style={{ fontSize: 13, color: HILL.muted, cursor: 'pointer' }}>← Back to menu</a>
          <RoundCounter current={mode === 'blitz' ? 3 : 5} max={mode === 'blitz' ? 7 : null} mode={mode}/>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="hill-mono" style={{ fontSize: 11, color: HILL.muted, letterSpacing: '0.18em' }}>
              ROOM · <span style={{ color: HILL.text, fontWeight: 700 }}>ABCD</span>
            </span>
            <span className="hill-mono" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 11, color: HILL.muted, letterSpacing: '0.18em',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: HILL.danger, animation: 'hill-pulse 1.4s ease-in-out infinite' }}/>
              LIVE
            </span>
          </div>
        </div>

        {/* Turn timer banner above board */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 14,
            padding: '10px 22px 10px 14px',
            background: HILL.surface,
            border: `1.5px solid ${HILL.accent}`,
            borderRadius: 999,
            fontSize: 15, fontWeight: 700,
            boxShadow: `0 0 24px rgba(191,255,0,0.15)`,
          }}>
            <PieceShape player={2} size={24} skin="gold"/>
            <span>MARCUS' TURN</span>
            <span style={{ width: 1, height: 16, background: HILL.borderHi }}/>
            <span className="hill-mono" style={{ color: HILL.accent, fontSize: 15, fontWeight: 700 }}>0:06</span>
          </div>
        </div>

        {/* Board flanked by panels */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28,
          filter: blurBoard ? 'blur(6px)' : 'none', transition: 'filter .3s',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {left.map((p, i) => <SidePlayerPanel key={i} {...p} alignment="left"/>)}
          </div>

          <Board size={10} pieces={pieces} centerZone={centerZone} cellSize={56}
            skinForPlayer={MOCK_SKINS}
            selected={[2, 8]}
            highlighted={[[3, 7], [3, 9]]}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {right.map((p, i) => <SidePlayerPanel key={i} {...p} alignment="right"/>)}
          </div>
        </div>

        {/* Hill status bar */}
        <div style={{ marginTop: 22, display: 'flex', justifyContent: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 18,
            padding: '10px 22px',
            background: 'rgba(191,255,0,0.04)',
            border: `1px solid rgba(191,255,0,0.2)`,
            borderRadius: 999, fontSize: 12, letterSpacing: '0.06em',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: HILL.muted, fontFamily: HILL.mono }}>
              <span style={{ color: HILL.accent }}>◆</span> ON THE HILL
            </span>
            <span style={{ width: 1, height: 14, background: HILL.borderHi }}/>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><PieceShape player={1} size={16} skin="gold"/><span className="hill-mono" style={{ color: HILL.text, fontWeight: 700 }}>1</span></span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><PieceShape player={2} size={16} skin="gold"/><span className="hill-mono" style={{ color: HILL.text, fontWeight: 700 }}>1</span></span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><PieceShape player={4} size={16} skin="master"/><span className="hill-mono" style={{ color: HILL.text, fontWeight: 700 }}>1</span></span>
            <span style={{ width: 1, height: 14, background: HILL.borderHi }}/>
            <span className="hill-mono" style={{ fontSize: 11, color: HILL.muted, letterSpacing: '0.1em' }}>3-WAY TIE</span>
          </div>
        </div>
      </Container>

      {overlay}
    </WebShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 10) DEATH OVERLAY — desktop
// ─────────────────────────────────────────────────────────────
function WebDeathOverlay({ round = 3 }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: `radial-gradient(80% 60% at 50% 35%, rgba(255,59,48,0.32), rgba(10,10,10,0.7) 60%, rgba(10,10,10,0.92))`,
      backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
      zIndex: 50,
      display: 'flex', flexDirection: 'column',
      animation: 'hill-fadein .35s ease',
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          padding: '8px 16px 8px 10px',
          background: 'rgba(0,0,0,0.45)',
          border: `1px solid rgba(255,59,48,0.4)`,
          borderRadius: 999,
          fontSize: 12, color: HILL.danger,
          fontFamily: HILL.mono, letterSpacing: '0.24em', fontWeight: 700,
        }}>
          <PieceShape player={3} size={20} skin="bronze"/>
          SAM · ELIMINATED
        </div>

        <div className="hill-display" style={{
          fontSize: 'clamp(120px, 15vw, 220px)', marginTop: 24,
          color: HILL.danger, letterSpacing: '-0.05em', lineHeight: 0.85, textAlign: 'center',
          textShadow: '0 0 60px rgba(255,59,48,0.5)',
          animation: 'hill-rise .5s ease',
        }}>YOU DIED.</div>

        <div style={{
          marginTop: 22, fontSize: 18, color: 'rgba(255,255,255,0.7)',
          fontFamily: HILL.mono, letterSpacing: '0.18em',
        }}>
          ELIMINATED · ROUND&nbsp;<span style={{ color: HILL.text }}>{round}</span>&nbsp;/&nbsp;7
        </div>

        <div style={{
          marginTop: 36, padding: '14px 24px',
          background: 'rgba(0,0,0,0.45)',
          border: `1px solid ${HILL.border}`, borderRadius: 12,
          fontSize: 14, color: HILL.muted, textAlign: 'center', maxWidth: 460, textWrap: 'pretty',
        }}>
          Hold tight — the match continues without you. Watch to spectate, or leave to find your next room.
        </div>

        <div style={{ display: 'flex', gap: 14, marginTop: 36 }}>
          <WebButton variant="primary" size="lg" leading={<span style={{ fontSize: 18 }}>👁</span>}>Spectate</WebButton>
          <WebButton variant="outline" size="lg" leading={<span>←</span>}>Leave Room</WebButton>
        </div>
        <div className="hill-mono" style={{ marginTop: 16, fontSize: 11, color: HILL.dim, letterSpacing: '0.14em' }}>
          ESC TO LEAVE · SPACE TO SPECTATE
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 11) GAME OVER OVERLAY — desktop
// ─────────────────────────────────────────────────────────────
function WebGameOverOverlay({ kind = 'solo' }) {
  const winners = kind === 'solo'
    ? [{ player: 4, name: 'Riko',  tier: 'Master', pieces: 7, skin: 'master', elo: 24 }]
    : kind === 'joint'
      ? [
          { player: 1, name: 'Aida K.', tier: 'Gold',   pieces: 4, skin: 'gold',   elo: 16 },
          { player: 4, name: 'Riko',    tier: 'Master', pieces: 4, skin: 'master', elo: 16 },
        ]
      : [];

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: kind === 'none'
        ? 'rgba(10,10,10,0.92)'
        : `radial-gradient(80% 60% at 50% 45%, rgba(191,255,0,0.18), rgba(10,10,10,0.75) 55%, rgba(10,10,10,0.95))`,
      backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
      zIndex: 50,
      display: 'flex', flexDirection: 'column',
      animation: 'hill-fadein .4s ease',
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px' }}>
        <div className="hill-mono" style={{
          fontSize: 12, fontWeight: 700, color: HILL.accent,
          letterSpacing: '0.32em',
        }}>
          MATCH · 7 ROUNDS · 3:14
        </div>

        {kind !== 'none' && (
          <div style={{ fontSize: 56, marginTop: 14, opacity: 0.92 }}>👑</div>
        )}

        <div className="hill-display" style={{
          fontSize: 'clamp(100px, 12vw, 180px)',
          marginTop: 6,
          textAlign: 'center', lineHeight: 0.85, letterSpacing: '-0.05em',
          background: kind === 'none'
            ? 'linear-gradient(180deg,#808080,#404040)'
            : `linear-gradient(180deg,#FAFAFA,${HILL.accent})`,
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
          textShadow: kind === 'none' ? 'none' : '0 0 60px rgba(191,255,0,0.3)',
          animation: 'hill-rise .5s ease',
        }}>
          {kind === 'solo' && <>RIKO WINS.</>}
          {kind === 'joint' && <>JOINT KINGS.</>}
          {kind === 'none' && <>NO KING TODAY.</>}
        </div>

        {/* Winner cards arranged HORIZONTALLY */}
        {winners.length > 0 && (
          <div style={{
            marginTop: 30, display: 'flex', gap: 16,
            justifyContent: 'center', flexWrap: 'wrap',
          }}>
            {winners.map((w, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '18px 22px',
                background: 'rgba(191,255,0,0.05)',
                border: `1.5px solid ${HILL.accent}`,
                borderRadius: 16,
                boxShadow: '0 0 28px rgba(191,255,0,0.15)',
                minWidth: 280,
              }}>
                <PieceShape player={w.player} size={48} isKing skin={w.skin}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em' }}>{w.name}</div>
                  <div style={{ marginTop: 5 }}><ArenaBadge tier={w.tier}/></div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="hill-mono" style={{ fontSize: 32, fontWeight: 800, color: HILL.accent, letterSpacing: '-0.01em' }}>+{w.elo}</div>
                  <div className="hill-mono" style={{ fontSize: 10, color: HILL.muted, letterSpacing: '0.16em', fontWeight: 700 }}>ELO</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {kind === 'none' && (
          <div style={{ marginTop: 22, fontSize: 16, color: HILL.muted, textAlign: 'center', maxWidth: 360, textWrap: 'pretty' }}>
            Survival ended with no last player standing. Nobody scores ELO this round.
          </div>
        )}

        <div style={{ display: 'flex', gap: 14, marginTop: 40 }}>
          <WebButton variant="primary" size="lg">Play Again</WebButton>
          <WebButton variant="outline" size="lg" leading={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l7 4M15.6 6.5l-7 4"/></svg>}>Share Result</WebButton>
          <WebButton variant="outline" size="lg">Lobby</WebButton>
        </div>
        <div className="hill-mono" style={{ marginTop: 16, fontSize: 11, color: HILL.dim, letterSpacing: '0.14em' }}>
          ESC TO RETURN · ENTER TO REMATCH
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  ScreenWebClassic, ScreenWebHillGame, WebDeathOverlay, WebGameOverOverlay,
  ClassicPlayerCard,
});
