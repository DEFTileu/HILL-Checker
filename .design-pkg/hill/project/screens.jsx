// HILL — screen compositions
// Each Screen* function returns the contents of a mobile viewport (390×844 ish).
// Wrap with PhoneShell which uses IOSDevice (dark) for the bezel.

const PHONE_W = 390;
const PHONE_H = 844;

// Mock player→skin map used across the design (each mock player has picked
// the highest skin their arena tier allows).
const MOCK_SKINS = { 1: 'silver', 2: 'gold', 3: 'bronze', 4: 'master' };

function PhoneShell({ children, statusTime = '9:41', noScroll = false }) {
  // Mimic iOS device frame but darker. Use IOSDevice for bezel+status bar+home indicator.
  return (
    <IOSDevice width={PHONE_W} height={PHONE_H} dark={true}>
      <div className="hill-root" style={{
        background: HILL.bg, minHeight: '100%',
        paddingTop: 56, /* status bar */
        paddingBottom: 24, /* home indicator */
        overflow: noScroll ? 'hidden' : 'auto',
        position: 'relative',
        height: noScroll ? PHONE_H : 'auto',
      }}>
        {children}
      </div>
    </IOSDevice>
  );
}

// ─────────────────────────────────────────────────────────────
// 1) LANDING
// ─────────────────────────────────────────────────────────────
function ScreenLanding({ signedIn = false }) {
  return (
    <PhoneShell noScroll>
      {/* Welcome chip top-right */}
      <div style={{ position: 'absolute', top: 64, right: 16, zIndex: 2,
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '5px 10px 5px 5px',
        background: HILL.surface,
        border: `1px solid ${HILL.border}`,
        borderRadius: 999,
        fontSize: 12, fontWeight: 600,
      }}>
        {signedIn ? (
          <>
            <div style={{ width: 26, height: 26, borderRadius: '50%',
              background: 'linear-gradient(135deg,#3a3a3a,#1a1a1a)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize: 12, fontWeight: 800, color: HILL.text, position: 'relative',
            }}>
              A
              <div style={{
                position: 'absolute', bottom: -2, right: -2,
                width: 13, height: 13, borderRadius: '50%',
                background: HILL.bg, padding: 1.5,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><GoogleG size={9}/></div>
            </div>
            <span style={{ color: HILL.text }}>Aida K.</span>
            <ArenaBadge tier="Gold" />
          </>
        ) : (
          <>
            <div style={{ width: 26, height: 26, borderRadius: '50%',
              background: 'linear-gradient(135deg,#2a2a2a,#0f0f0f)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize: 11, fontWeight: 800, color: HILL.muted,
            }}>?</div>
            <span className="hill-mono" style={{ color: HILL.text }}>Player_a3f9</span>
            <span style={{ color: HILL.muted }}>·</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: HILL.accent, letterSpacing: '0.04em' }}>Sign&nbsp;in</span>
          </>
        )}
      </div>

      {/* Big HILL logo */}
      <div style={{ padding: '90px 24px 0', position: 'relative' }}>
        <div className="hill-display" style={{
          fontSize: 168, lineHeight: 0.85,
          background: `linear-gradient(180deg, #FAFAFA 0%, #FAFAFA 55%, #707070 100%)`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>HILL</div>
        {/* accent line under H */}
        <div style={{
          position: 'absolute', top: 240, left: 24,
          width: 36, height: 4, background: HILL.accent,
          boxShadow: `0 0 12px ${HILL.accent}`,
        }} />
        <div style={{
          marginTop: 24,
          fontSize: 17, lineHeight: 1.35, color: HILL.muted,
          maxWidth: 280,
        }}>
          King of the Board.<br/>
          <span style={{ color: HILL.text, fontWeight: 600 }}>4 players. 3 minutes.</span>
        </div>
      </div>

      {/* CTAs anchored toward bottom (above nav bar) */}
      <div style={{ position: 'absolute', bottom: 92, left: 0, right: 0, padding: '0 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <CTAButton variant="primary" style={{ height: 60, fontSize: 18 }}>→  Create Hill Room</CTAButton>
          <CTAButton variant="secondary" style={{ height: 56 }}>Play Classic</CTAButton>
        </div>
        <div style={{ marginTop: 14, textAlign: 'center', fontSize: 10, color: HILL.dim, fontFamily: HILL.mono, letterSpacing: '0.16em' }}>
          v1.0 · 2026 HILL
        </div>
      </div>

      <BottomNav active="hill" />
    </PhoneShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 2) CLASSIC 2P GAME
// ─────────────────────────────────────────────────────────────
function ScreenClassic() {
  // Set up a realistic 8x8 mid-game position
  const pieces = [
    // White (P1) — bottom three rows partially
    { player: 1, kind: 'pawn', pos: [5, 0] },
    { player: 1, kind: 'pawn', pos: [5, 2] },
    { player: 1, kind: 'pawn', pos: [6, 1] },
    { player: 1, kind: 'pawn', pos: [6, 3] },
    { player: 1, kind: 'pawn', pos: [6, 5] },
    { player: 1, kind: 'pawn', pos: [6, 7] },
    { player: 1, kind: 'pawn', pos: [7, 0] },
    { player: 1, kind: 'pawn', pos: [7, 2] },
    { player: 1, kind: 'king', pos: [4, 5] },
    // Black (P2)
    { player: 2, kind: 'pawn', pos: [0, 1] },
    { player: 2, kind: 'pawn', pos: [0, 3] },
    { player: 2, kind: 'pawn', pos: [0, 5] },
    { player: 2, kind: 'pawn', pos: [1, 0] },
    { player: 2, kind: 'pawn', pos: [1, 4] },
    { player: 2, kind: 'pawn', pos: [1, 6] },
    { player: 2, kind: 'pawn', pos: [2, 3] },
    { player: 2, kind: 'pawn', pos: [3, 4] },
  ];

  return (
    <PhoneShell noScroll>
      <TopBar onBack right={
        <button className="hill-btn" style={{
          padding: '6px 10px', borderRadius: 8, background: HILL.surface,
          border: `1px solid ${HILL.border}`, fontSize: 11, color: HILL.muted,
          letterSpacing: '0.08em',
        }}>RESIGN</button>
      } />

      {/* Above board: turn indicator */}
      <div style={{ padding: '20px 16px 14px', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          padding: '8px 14px 8px 10px',
          background: HILL.surface,
          border: `1.5px solid ${HILL.accent}`,
          borderRadius: 999,
          fontSize: 13, fontWeight: 700,
          boxShadow: `0 0 18px rgba(191,255,0,0.12)`,
        }}>
          <PieceShape player={1} size={22} skin="silver" />
          <span>White's turn</span>
          <span className="hill-mono" style={{ color: HILL.accent, fontSize: 12 }}>0:07</span>
        </div>
      </div>

      {/* Board centered */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0' }}>
        <Board size={8} pieces={pieces} cellSize={41}
          skinForPlayer={{ 1: 'silver', 2: 'gold' }}
          selected={[4, 5]}
          highlighted={[[3, 4], [3, 6], [2, 3], [2, 7]]}
          lastMove={[[3, 4], [4, 5]]}
        />
      </div>

      {/* Score line under board */}
      <div style={{
        margin: '20px 32px 0', display: 'flex', justifyContent: 'space-between',
        fontFamily: HILL.mono, fontSize: 12, color: HILL.muted, letterSpacing: '0.04em',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <PieceShape player={1} size={16} skin="silver"/> <span style={{color: HILL.text, fontWeight:700}}>9</span> · captured 3
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          captured 4 · <span style={{color: HILL.text, fontWeight:700}}>8</span> <PieceShape player={2} size={16} skin="gold"/>
        </div>
      </div>
    </PhoneShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 3) HILL MODE SELECT
// ─────────────────────────────────────────────────────────────
function ScreenModeSelect({ selected = 'blitz' }) {
  return (
    <PhoneShell noScroll>
      <TopBar onBack title="" />
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: HILL.accent, letterSpacing: '0.24em' }}>STEP 1 / 2</div>
        <h1 className="hill-display" style={{ fontSize: 40, marginTop: 8, marginBottom: 6 }}>
          Choose your<br/>mode.
        </h1>
        <p style={{ fontSize: 14, color: HILL.muted, marginTop: 4 }}>
          Pick a ruleset. You can switch in the lobby.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 26 }}>
          <ModeCard mode="blitz" selected={selected === 'blitz'} />
          <ModeCard mode="survival" selected={selected === 'survival'} />
        </div>
      </div>

      {/* sticky bottom CTA */}
      <div style={{
        position: 'absolute', bottom: 24, left: 0, right: 0, padding: '12px 20px 0',
        background: `linear-gradient(180deg, transparent, ${HILL.bg} 35%)`,
      }}>
        <CTAButton variant="primary">
          Continue ·
          <span className="hill-mono" style={{ fontWeight: 700, fontSize: 13, opacity: 0.7, marginLeft: 4 }}>
            {selected.toUpperCase()}
          </span>
        </CTAButton>
      </div>
    </PhoneShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 4) ROOM LOBBY
// ─────────────────────────────────────────────────────────────
function ScreenLobby({ filled = 'partial', mode = 'blitz' }) {
  const slots = filled === 'partial' ? [
    { player: 1, name: 'Aida', tier: 'Silver', isHost: true, you: true, skin: 'silver' },
    { player: 2, empty: true },
    { player: 3, name: 'Sam', tier: 'Bronze', skin: 'bronze' },
    { player: 4, empty: true },
  ] : [
    { player: 1, name: 'Aida', tier: 'Silver', isHost: true, you: true, skin: 'silver' },
    { player: 2, name: 'Marcus', tier: 'Gold', skin: 'gold' },
    { player: 3, name: 'Sam', tier: 'Bronze', skin: 'bronze' },
    { player: 4, name: 'Riko', tier: 'Master', skin: 'master' },
  ];
  const ready = slots.filter(s => !s.empty).length >= 2;

  return (
    <PhoneShell>
      <TopBar onBack right={
        <button className="hill-btn" style={{
          width: 36, height: 36, borderRadius: 10, background: HILL.surface,
          border: `1px solid ${HILL.border}`, display:'inline-flex', alignItems:'center', justifyContent:'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={HILL.text} strokeWidth="2" strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l7 4M15.6 6.5l-7 4"/></svg>
        </button>
      } />

      <div style={{ padding: '12px 20px 0' }}>
        <RoomCodeDisplay code="ABCD" />

        {/* copy/share row */}
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button className="hill-btn" style={{
            flex: 1, height: 42, borderRadius: 10, background: HILL.surface,
            border: `1px solid ${HILL.border}`, color: HILL.text,
            fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems:'center', justifyContent:'center', gap: 8,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
            Copy link
          </button>
          <button className="hill-btn" style={{
            flex: 1, height: 42, borderRadius: 10, background: HILL.surface,
            border: `1px solid ${HILL.border}`, color: HILL.text,
            fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems:'center', justifyContent:'center', gap: 8,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
            Share
          </button>
        </div>

        {/* mode (locked) */}
        <div style={{ marginTop: 22 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: HILL.muted, letterSpacing: '0.18em', marginBottom: 8 }}>MODE · LOCKED</div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 14px',
            background: HILL.surface, border: `1px solid ${HILL.border}`, borderRadius: 12,
          }}>
            <span style={{ fontSize: 18 }}>{mode === 'survival' ? '💀' : '⚡'}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: '-0.01em' }}>
                {mode === 'survival' ? 'SURVIVAL' : 'BLITZ'}
              </div>
              <div style={{ fontSize: 11, color: HILL.muted, marginTop: 2 }}>
                {mode === 'survival' ? 'Last alive wins · ~5-7 min' : '7 rounds · ~3 min'}
              </div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={HILL.muted} strokeWidth="2" strokeLinecap="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>
          </div>
          <a style={{
            display: 'inline-block', marginTop: 8,
            fontSize: 11, color: HILL.muted, textDecoration: 'none',
            fontWeight: 600, letterSpacing: '0.04em',
          }}>← change mode</a>
        </div>

        {/* 2x2 player slots */}
        <div style={{ marginTop: 18 }}>
          <div style={{ display: 'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: HILL.muted, letterSpacing: '0.18em' }}>PLAYERS</div>
            <div className="hill-mono" style={{ fontSize: 11, color: HILL.muted }}>
              {slots.filter(s=>!s.empty).length}/4
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {slots.map((s, i) => <PlayerSlot key={i} {...s} />)}
          </div>
        </div>
      </div>

      {/* sticky bottom Start */}
      <div style={{ position: 'sticky', bottom: 0, padding: '16px 20px 12px',
        background: `linear-gradient(180deg, transparent, ${HILL.bg} 30%)`, marginTop: 24,
      }}>
        <CTAButton variant="primary" disabled={!ready}>
          {ready ? 'Start Game' : 'Waiting for 2+ players…'}
        </CTAButton>
      </div>
    </PhoneShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 5) HILL 4P GAME
// ─────────────────────────────────────────────────────────────
function makeHillPieces() {
  // 10x10 board, 4 players, mid-game.
  // P1 starts top-left corner, P2 top-right, P3 bottom-right, P4 bottom-left.
  const ps = [];
  // P1 (white) - top-left territory
  [[0,1],[0,3],[1,0],[1,2],[2,1],[3,4]].forEach(p => ps.push({ player: 1, kind: 'pawn', pos: p }));
  ps.push({ player: 1, kind: 'king', pos: [4, 4] }); // a king ON the hill!

  // P2 (black) - top-right
  [[0,6],[0,8],[1,7],[1,9],[2,8],[3,7]].forEach(p => ps.push({ player: 2, kind: 'pawn', pos: p }));
  ps.push({ player: 2, kind: 'pawn', pos: [4, 5] }); // also on hill

  // P3 (pink) - bottom-right (eliminated player — fewer pieces, dimmed)
  [[9,6],[9,8],[8,7]].forEach(p => ps.push({ player: 3, kind: 'pawn', pos: p, dimmed: true }));

  // P4 (cyan) - bottom-left
  [[9,1],[9,3],[8,0],[8,2],[7,1],[6,4]].forEach(p => ps.push({ player: 4, kind: 'pawn', pos: p }));
  ps.push({ player: 4, kind: 'king', pos: [5, 5] }); // king on hill!

  return ps;
}

function ScreenHillGame({ overlay = null, mode = 'blitz' }) {
  const pieces = makeHillPieces();
  const centerZone = [[4,4],[4,5],[5,4],[5,5]];
  const players = [
    { player: 1, name: 'Aida', tier: 'Silver', you: true, skin: 'silver' },
    { player: 2, name: 'Marcus', tier: 'Gold', isActive: true, secondsLeft: 6, secondsTotal: 10, skin: 'gold' },
    { player: 3, name: 'Sam', tier: 'Bronze', eliminated: true, skin: 'bronze' },
    { player: 4, name: 'Riko', tier: 'Master', skin: 'master' },
  ];

  return (
    <PhoneShell noScroll>
      <TopBar onBack code="ABCD" right={
        <div style={{ display:'flex', gap:6 }}>
          <button className="hill-btn" style={{ width: 32, height: 32, borderRadius: 8, background: HILL.surface, border:`1px solid ${HILL.border}`, display:'inline-flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={HILL.text} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M9 9h.01M15 9h.01M8 15c1 1 2.5 2 4 2s3-1 4-2"/></svg>
          </button>
        </div>
      } />

      <div style={{ padding: '12px 16px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <RoundCounter current={mode === 'blitz' ? 3 : 5} max={mode === 'blitz' ? 7 : null} mode={mode} />
        <div style={{
          display:'inline-flex', alignItems:'center', gap:6,
          fontSize: 11, color: HILL.muted, fontFamily: HILL.mono,
          letterSpacing: '0.08em',
        }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background: HILL.danger, animation: 'hill-pulse 1.4s ease-in-out infinite' }}/>
          LIVE
        </div>
      </div>

      {/* Board */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0 10px' }}>
        <Board size={10} pieces={pieces} centerZone={centerZone} cellSize={33}
          skinForPlayer={MOCK_SKINS}
          selected={[2, 8]}
          highlighted={[[3, 7], [3, 9]]}
        />
      </div>

      {/* 2x2 player panel */}
      <div style={{ padding: '0 12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {players.map((p, i) => <PlayerSlot key={i} {...p} compact />)}
        </div>
      </div>

      {/* Hill-status mini banner */}
      <div style={{ padding: '8px 16px 0' }}>
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding: '8px 12px',
          background: 'rgba(191,255,0,0.04)',
          border: `1px solid rgba(191,255,0,0.2)`,
          borderRadius: 10, fontSize: 11, letterSpacing: '0.04em',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, color: HILL.muted, fontFamily: HILL.mono }}>
            <span style={{ color: HILL.accent }}>◆</span> ON HILL
          </div>
          <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
            <span style={{ display:'flex', alignItems:'center', gap: 4 }}><PieceShape player={1} size={14} skin="silver"/><span className="hill-mono" style={{color:HILL.text,fontWeight:700}}>1</span></span>
            <span style={{ display:'flex', alignItems:'center', gap: 4 }}><PieceShape player={2} size={14} skin="gold"/><span className="hill-mono" style={{color:HILL.text,fontWeight:700}}>1</span></span>
            <span style={{ display:'flex', alignItems:'center', gap: 4 }}><PieceShape player={4} size={14} skin="master"/><span className="hill-mono" style={{color:HILL.text,fontWeight:700}}>1</span></span>
          </div>
        </div>
      </div>

      {overlay}
    </PhoneShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 6) DEATH SCREEN OVERLAY
// ─────────────────────────────────────────────────────────────
function DeathOverlay({ round = 3 }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: `radial-gradient(120% 80% at 50% 30%, rgba(255,59,48,0.28), rgba(10,10,10,0.85) 60%, rgba(10,10,10,0.96))`,
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      zIndex: 50,
      display: 'flex', flexDirection: 'column',
      animation: 'hill-fadein .35s ease',
      paddingTop: 56, paddingBottom: 24,
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
        {/* Crossed-out player chip */}
        <div style={{
          display:'inline-flex', alignItems:'center', gap:8,
          padding: '6px 12px 6px 8px',
          background: 'rgba(0,0,0,0.4)',
          border: `1px solid rgba(255,59,48,0.4)`,
          borderRadius: 999,
          fontSize: 11, color: HILL.danger,
          fontFamily: HILL.mono, letterSpacing: '0.18em', fontWeight: 700,
        }}>
          <PieceShape player={3} size={16} skin="bronze"/>
          SAM · OUT
        </div>

        <div className="hill-display" style={{
          fontSize: 84, marginTop: 24,
          color: HILL.danger,
          letterSpacing: '-0.04em',
          textShadow: '0 0 32px rgba(255,59,48,0.5)',
          animation: 'hill-rise .5s ease',
        }}>YOU<br/>DIED.</div>

        <div style={{
          marginTop: 16, fontSize: 14, color: 'rgba(255,255,255,0.7)',
          fontFamily: HILL.mono, letterSpacing: '0.08em',
        }}>
          ELIMINATED · ROUND {round}
        </div>

        <div style={{
          marginTop: 36, padding: '12px 18px',
          background: 'rgba(0,0,0,0.4)',
          border: `1px solid ${HILL.border}`,
          borderRadius: 12,
          fontSize: 12, color: HILL.muted, textAlign: 'center', maxWidth: 280,
        }}>
          Hold tight — match continues without you. Watch to spectate.
        </div>
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <CTAButton variant="primary" style={{ height: 56 }}>👁  Spectate</CTAButton>
        <CTAButton variant="secondary" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>←  Leave Room</CTAButton>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 7) GAME OVER OVERLAY
// ─────────────────────────────────────────────────────────────
function GameOverOverlay({ kind = 'solo' }) {
  // kind: 'solo' | 'joint' | 'none'
  const winners = kind === 'solo'
    ? [{ player: 4, name: 'Riko', tier: 'Master', pieces: 7, skin: 'master' }]
    : kind === 'joint'
      ? [{ player: 1, name: 'Aida', tier: 'Silver', pieces: 4, skin: 'silver' }, { player: 4, name: 'Riko', tier: 'Master', pieces: 4, skin: 'master' }]
      : [];

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: kind === 'none'
        ? 'rgba(10,10,10,0.96)'
        : `radial-gradient(120% 80% at 50% 40%, rgba(191,255,0,0.18), rgba(10,10,10,0.85) 55%, rgba(10,10,10,0.97))`,
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      zIndex: 50,
      display: 'flex', flexDirection: 'column',
      animation: 'hill-fadein .4s ease',
      paddingTop: 56, paddingBottom: 24,
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
        <div style={{
          fontSize: 11, fontWeight: 700, color: HILL.accent,
          fontFamily: HILL.mono, letterSpacing: '0.24em',
        }}>
          MATCH · 7 ROUNDS · 3:14
        </div>

        {kind !== 'none' && (
          <div style={{ fontSize: 38, marginTop: 14, opacity: 0.92 }}>👑</div>
        )}

        <div className="hill-display" style={{
          fontSize: kind === 'joint' ? 48 : 64,
          marginTop: 6,
          textAlign: 'center',
          background: kind === 'none'
            ? 'linear-gradient(180deg,#808080,#404040)'
            : `linear-gradient(180deg,#FAFAFA,${HILL.accent})`,
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
          textShadow: kind === 'none' ? 'none' : '0 0 40px rgba(191,255,0,0.25)',
          animation: 'hill-rise .5s ease',
        }}>
          {kind === 'solo' && <>RIKO<br/>WINS.</>}
          {kind === 'joint' && <>JOINT<br/>KINGS.</>}
          {kind === 'none' && <>NO KING<br/>TODAY.</>}
        </div>

        {/* Winner chips */}
        {winners.length > 0 && (
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 280 }}>
            {winners.map((w, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px',
                background: 'rgba(191,255,0,0.05)',
                border: `1.5px solid ${HILL.accent}`,
                borderRadius: 12,
                boxShadow: '0 0 20px rgba(191,255,0,0.12)',
              }}>
                <PieceShape player={w.player} size={32} isKing skin={w.skin} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{w.name}</div>
                  <div style={{ marginTop: 3 }}><ArenaBadge tier={w.tier} /></div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="hill-mono" style={{ fontSize: 22, fontWeight: 700, color: HILL.accent }}>+24</div>
                  <div style={{ fontSize: 10, color: HILL.muted, fontFamily: HILL.mono, letterSpacing: '0.08em' }}>ELO</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {kind === 'none' && (
          <div style={{ marginTop: 22, fontSize: 13, color: HILL.muted, textAlign: 'center', maxWidth: 240 }}>
            Survival ended with no last player standing. Nobody scores.
          </div>
        )}
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <CTAButton variant="primary">Play again</CTAButton>
        <div style={{ display: 'flex', gap: 10 }}>
          <CTAButton variant="secondary">Share result</CTAButton>
          <CTAButton variant="secondary">Lobby</CTAButton>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 8) LEADERBOARD
// ─────────────────────────────────────────────────────────────
function ScreenLeaderboard() {
  const rows = [
    { rank: 1, name: 'Sam Wilson',   tier: 'Champion', wins: 142, wr: 71, elo: 2480 },
    { rank: 2, name: 'mira_42',      tier: 'Champion', wins: 128, wr: 68, elo: 2410 },
    { rank: 3, name: 'Aida.K',       tier: 'Master',   wins: 117, wr: 64, elo: 2245 },
    { rank: 4, name: 'kettle',       tier: 'Master',   wins: 109, wr: 62, elo: 2210 },
    { rank: 5, name: 'Riko',         tier: 'Master',   wins: 102, wr: 59, elo: 2188 },
    { rank: 6, name: 'darkhorse',    tier: 'Gold',     wins:  94, wr: 58, elo: 2050 },
    { rank: 7, name: 'Player_a3f9',  tier: 'Gold',     wins:  88, wr: 55, elo: 1996, isYou: true },
    { rank: 8, name: 'Marcus J.',    tier: 'Gold',     wins:  82, wr: 53, elo: 1955 },
    { rank: 9, name: 'noir',         tier: 'Silver',   wins:  74, wr: 51, elo: 1810 },
  ];

  return (
    <PhoneShell>
      <TopBar onBack right={
        <button className="hill-btn" style={{
          padding: '6px 10px', borderRadius: 8, background: HILL.surface,
          border: `1px solid ${HILL.border}`, fontSize: 11, color: HILL.muted, letterSpacing: '0.08em', fontFamily: HILL.mono,
        }}>SEASON 03</button>
      } />

      <div style={{ padding: '12px 20px 16px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: HILL.accent, letterSpacing: '0.24em' }}>RANKED</div>
        <h1 className="hill-display" style={{ fontSize: 56, marginTop: 6, marginBottom: 12 }}>TOP 100</h1>

        {/* sticky filter pills */}
        <div style={{ display: 'flex', gap: 6 }}>
          {['Global', 'Friends', 'This week'].map((p, i) => (
            <div key={p} style={{
              padding: '8px 14px', borderRadius: 999,
              background: i === 0 ? HILL.text : HILL.surface,
              color: i === 0 ? HILL.bg : HILL.muted,
              border: i === 0 ? 'none' : `1px solid ${HILL.border}`,
              fontSize: 12, fontWeight: 700, letterSpacing: '-0.01em',
            }}>{p} {p==='Friends' && <span style={{opacity:0.5, marginLeft:4}}>·</span>}</div>
          ))}
        </div>
      </div>

      {/* Top-3 podium-ish */}
      <div style={{ padding: '0 20px 12px' }}>
        <div style={{
          background: `linear-gradient(180deg, ${HILL.surface}, ${HILL.surface2})`,
          border: `1px solid ${HILL.border}`,
          borderRadius: 16, padding: '14px 14px 14px',
        }}>
          {rows.slice(0, 3).map((r, i) => (
            <LeaderboardRow key={r.rank} row={r} top3 last={i === 2} />
          ))}
        </div>
      </div>

      {/* rest */}
      <div style={{ padding: '0 20px' }}>
        {rows.slice(3).map((r) => <LeaderboardRow key={r.rank} row={r} />)}
      </div>

      <div style={{ padding: '12px 20px 100px', textAlign: 'center', fontSize: 12, color: HILL.dim, fontFamily: HILL.mono, letterSpacing: '0.08em' }}>
        SHOWING 1–9 OF 100
      </div>

      <BottomNav active="top" />
    </PhoneShell>
  );
}

function LeaderboardRow({ row, top3 = false, last = false }) {
  const rankColor = row.rank === 1 ? HILL.gold : row.rank === 2 ? HILL.silver : row.rank === 3 ? HILL.bronze : HILL.muted;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: top3 ? '10px 4px' : '12px 14px',
      borderRadius: top3 ? 0 : 12,
      borderBottom: top3 && !last ? `1px solid ${HILL.border}` : 'none',
      background: row.isYou ? 'rgba(191,255,0,0.04)' : (top3 ? 'transparent' : HILL.surface),
      border: row.isYou ? `1.5px solid ${HILL.accent}` : (top3 ? 'none' : `1px solid ${HILL.border}`),
      marginBottom: top3 ? 0 : 6,
    }}>
      <div className="hill-mono" style={{
        width: 32, textAlign: 'right',
        fontSize: top3 ? 22 : 15, fontWeight: 800,
        color: rankColor,
      }}>{row.rank}</div>

      <div style={{
        width: top3 ? 38 : 32, height: top3 ? 38 : 32, borderRadius: '50%',
        background: 'linear-gradient(135deg,#2a2a2a,#0f0f0f)',
        border: `1px solid ${HILL.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: 14, color: HILL.text,
        flexShrink: 0,
      }}>{row.name[0].toUpperCase()}</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: top3 ? 16 : 14, fontWeight: 700, whiteSpace: 'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{row.name}</span>
          {row.isYou && <span style={{ fontSize: 9, color: HILL.accent, fontWeight: 800, letterSpacing: '0.1em' }}>YOU</span>}
        </div>
        <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
          <ArenaBadge tier={row.tier} />
          <span className="hill-mono" style={{ fontSize: 11, color: HILL.muted }}>
            {row.wr}% wr
          </span>
        </div>
      </div>

      <div style={{ textAlign: 'right' }}>
        <div className="hill-mono" style={{ fontSize: top3 ? 18 : 15, fontWeight: 700, color: HILL.text }}>{row.wins}<span style={{ color: HILL.muted, fontWeight: 500, fontSize: 11 }}>w</span></div>
        <div className="hill-mono" style={{ fontSize: 10, color: HILL.dim, letterSpacing: '0.04em' }}>{row.elo} ELO</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 9) PROFILE
// ─────────────────────────────────────────────────────────────
function ScreenProfile({ signedIn = true, userTier = 'Gold', skin = 'gold' }) {
  return (
    <PhoneShell>
      <TopBar onBack title="Profile" />

      <div style={{ padding: '20px 20px 100px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Big avatar — shows user's current skin'd piece in a corner */}
        <div style={{
          width: 110, height: 110, borderRadius: '50%',
          background: 'linear-gradient(135deg,#2a2a2a,#0a0a0a)',
          border: `2px solid ${HILL.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 44, fontWeight: 800, color: HILL.text,
          position: 'relative',
        }}>
          A
          {signedIn && (
            <div style={{
              position: 'absolute', top: -2, right: -2,
              width: 24, height: 24, borderRadius: '50%',
              background: HILL.bg, padding: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1.5px solid ${HILL.border}`,
            }}><GoogleG size={16}/></div>
          )}
          {/* current-skin piece sample bottom-left */}
          <div style={{
            position: 'absolute', bottom: -4, left: -4,
            width: 38, height: 38, borderRadius: '50%',
            background: HILL.bg, border: `1.5px solid ${HILL.borderHi}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><PieceShape player={1} size={24} skin={skin} /></div>
          {/* big arena badge ring underneath */}
          <div style={{
            position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)',
            padding: '6px 12px 6px 10px',
            background: HILL.bg,
            border: `1.5px solid ${HILL.gold}60`,
            borderRadius: 999,
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 11, fontWeight: 800, color: HILL.gold, letterSpacing: '0.12em',
          }}>
            <span>🥇</span> GOLD · TIER III
          </div>
        </div>

        {/* Sign-in CTA / signed-in chip */}
        {!signedIn ? (
          <div style={{ width: '100%', marginTop: 36 }}>
            <button className="hill-btn" style={{
              width: '100%', height: 56, borderRadius: 12,
              background: HILL.text, color: HILL.bg,
              fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}>
              <GoogleG size={20}/> Sign in with Google
            </button>
            <div style={{ marginTop: 10, fontSize: 12, color: HILL.muted, textAlign: 'center', lineHeight: 1.4 }}>
              Your wins and stats will transfer<br/>to your account.
            </div>
          </div>
        ) : (
          <div style={{ width: '100%', marginTop: 30,
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px',
            background: 'rgba(191,255,0,0.04)',
            border: `1px solid rgba(191,255,0,0.2)`,
            borderRadius: 10,
          }}>
            <GoogleG size={16}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, color: HILL.muted, letterSpacing: '0.14em', fontWeight: 700 }}>SIGNED IN AS</div>
              <div style={{ fontSize: 13, fontWeight: 600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>aida.k@gmail.com</div>
            </div>
            <a style={{ fontSize: 11, color: HILL.muted, fontWeight: 600, letterSpacing: '0.04em' }}>Sign out</a>
          </div>
        )}

        {/* Display name input */}
        <div style={{ width: '100%', marginTop: 36 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: HILL.muted, letterSpacing: '0.18em', marginBottom: 8 }}>DISPLAY NAME</div>
          <div style={{
            display: 'flex', alignItems: 'center',
            padding: '14px 16px',
            background: HILL.surface, border: `1px solid ${HILL.borderHi}`, borderRadius: 12,
            fontSize: 17, fontWeight: 600,
          }}>
            Player_a3f9
            <span style={{ flex: 1 }} />
            <span style={{ fontSize: 11, color: HILL.dim, fontFamily: HILL.mono, letterSpacing: '0.08em' }}>SAVED ✓</span>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{
          width: '100%', marginTop: 22,
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          background: HILL.surface,
          border: `1px solid ${HILL.border}`,
          borderRadius: 14, overflow: 'hidden',
        }}>
          {[
            { label: 'TOTAL WINS', value: '88' },
            { label: 'GAMES', value: '160' },
            { label: 'WIN RATE', value: '55%' },
          ].map((s, i) => (
            <div key={s.label} style={{
              padding: '16px 12px',
              borderRight: i < 2 ? `1px solid ${HILL.border}` : 'none',
              textAlign: 'center',
            }}>
              <div className="hill-mono" style={{ fontSize: 26, fontWeight: 700 }}>{s.value}</div>
              <div style={{ fontSize: 10, color: HILL.muted, letterSpacing: '0.14em', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Progress to next tier */}
        <div style={{ width: '100%', marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: HILL.muted, marginBottom: 6, fontFamily: HILL.mono, letterSpacing: '0.08em' }}>
            <span>GOLD · TIER III</span>
            <span>→ MASTER · 240 ELO</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: HILL.surface, overflow: 'hidden' }}>
            <div style={{
              width: '62%', height: '100%',
              background: `linear-gradient(90deg, ${HILL.gold}, ${HILL.accent})`,
              boxShadow: `0 0 12px ${HILL.accent}`,
            }} />
          </div>
        </div>

        {/* Skin selector */}
        <div style={{ width: '100%', marginTop: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: HILL.muted, letterSpacing: '0.18em' }}>PIECE SKIN</div>
            <div className="hill-mono" style={{ fontSize: 10, color: HILL.dim, letterSpacing: '0.08em' }}>
              SHAPE STAYS THE SAME
            </div>
          </div>
          <div className="hill-scroll" style={{
            display: 'flex', gap: 8,
            overflowX: 'auto', overflowY: 'hidden',
            paddingBottom: 4, margin: '0 -20px', padding: '4px 20px',
            scrollbarWidth: 'none',
          }}>
            {Object.keys(SKINS).map((sk) => {
              const unlocked = skinUnlocked(sk, userTier);
              const tier = SKINS[sk].tier;
              const winsNeeded = { Silver: 5, Gold: 25, Master: 75, Champion: 150 }[tier];
              const unlockText = unlocked ? null : `Unlock at ${tier}\u00a0\u00b7\u00a0${winsNeeded}\u00a0wins`;
              return (
                <SkinCard key={sk} skinId={sk} samplePlayer={1}
                  selected={skin === sk} locked={!unlocked} unlockText={unlockText} />
              );
            })}
          </div>
          <div style={{
            marginTop: 8, fontSize: 11, color: HILL.muted, fontFamily: HILL.mono,
            letterSpacing: '0.04em',
          }}>
            <span style={{ color: HILL.accent }}>✓</span> Auto-saved · applies to all your pieces
          </div>
        </div>

        {/* Stat lines */}
        <div style={{ width: '100%', marginTop: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            ['Longest streak', '7 wins'],
            ['Favorite mode', 'Blitz 4P'],
            ['Pieces captured', '1,204'],
            ['Hill seconds held', '14m 22s'],
          ].map(([k, v]) => (
            <div key={k} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 14px',
              background: HILL.surface, border: `1px solid ${HILL.border}`, borderRadius: 10,
              fontSize: 13,
            }}>
              <span style={{ color: HILL.muted }}>{k}</span>
              <span className="hill-mono" style={{ fontWeight: 700 }}>{v}</span>
            </div>
          ))}
        </div>

        <button className="hill-btn" style={{
          marginTop: 22, width: '100%', height: 48, borderRadius: 12,
          background: 'transparent', color: HILL.danger,
          border: `1px solid ${HILL.danger}40`,
          fontSize: 14, fontWeight: 700, letterSpacing: '0.04em',
        }}>RESET ACCOUNT</button>

        <div style={{ height: 24 }} />
      </div>

      <BottomNav active="me" />
    </PhoneShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 10) SIGN IN (modal/screen)
// ─────────────────────────────────────────────────────────────
function ScreenSignIn() {
  return (
    <PhoneShell noScroll>
      {/* close button */}
      <div style={{ position: 'absolute', top: 64, right: 16, zIndex: 5 }}>
        <button className="hill-btn" style={{
          width: 36, height: 36, borderRadius: 18,
          background: HILL.surface, border: `1px solid ${HILL.border}`,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          color: HILL.text,
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 3l8 8M11 3l-8 8"/></svg>
        </button>
      </div>

      {/* HILL mark, smaller, top-left */}
      <div style={{ padding: '90px 24px 0', display: 'flex', flexDirection: 'column', height: 'calc(100% - 24px)' }}>
        <div className="hill-display" style={{
          fontSize: 88, lineHeight: 0.9,
          color: HILL.text,
        }}>HILL</div>
        <div style={{
          width: 28, height: 3, background: HILL.accent,
          boxShadow: `0 0 10px ${HILL.accent}`, marginTop: 12,
        }} />

        <div style={{ marginTop: 36 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: HILL.accent, letterSpacing: '0.24em' }}>ACCOUNT</div>
          <h2 className="hill-display" style={{ fontSize: 36, marginTop: 8, lineHeight: 1, letterSpacing: '-0.03em' }}>
            Keep your<br/>crown.
          </h2>
          <p style={{ fontSize: 15, color: HILL.muted, marginTop: 14, lineHeight: 1.45, maxWidth: 320 }}>
            Save your wins, ELO, and arena across every device. One tap, no password.
          </p>
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ paddingBottom: 24 }}>
          <button className="hill-btn" style={{
            width: '100%', height: 60, borderRadius: 12,
            background: HILL.text, color: HILL.bg,
            fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 12,
          }}>
            <GoogleG size={22}/> Continue with Google
          </button>

          <div style={{
            marginTop: 14, padding: '10px 14px',
            border: `1px dashed ${HILL.border}`,
            borderRadius: 10,
            fontSize: 12, color: HILL.muted, textAlign: 'center', lineHeight: 1.5,
          }}>
            You can keep playing as guest without signing in.<br/>
            <span style={{ color: HILL.dim, fontFamily: HILL.mono, fontSize: 10, letterSpacing: '0.08em' }}>STATS WON'T SYNC</span>
          </div>
        </div>
      </div>
    </PhoneShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 11) PLAY STYLE — Hot-seat vs Multiplayer
// ─────────────────────────────────────────────────────────────
function ScreenPlayStyle({ selected = 'multi', mode = 'blitz' }) {
  const options = [
    {
      id: 'hotseat',
      title: 'Hot-seat',
      caption: 'This device',
      desc: 'Pass the phone. Everyone takes their turn on the same screen — perfect for couch games.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="3"/><path d="M11 18h2"/>
        </svg>
      ),
    },
    {
      id: 'multi',
      title: 'Multiplayer',
      caption: 'Invite friends',
      desc: 'Create a room. Send a code or link, friends join from their own devices in real time.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="8" r="3"/><path d="M3 21c.5-3.5 3-6 6-6s5.5 2.5 6 6"/><circle cx="17" cy="7" r="2.5"/><path d="M15 13c.5-1.5 2-3 4-3"/>
        </svg>
      ),
    },
  ];

  return (
    <PhoneShell noScroll>
      <TopBar onBack />
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: HILL.accent, letterSpacing: '0.24em' }}>STEP 2 / 2</div>
        <h1 className="hill-display" style={{ fontSize: 40, marginTop: 8, marginBottom: 6 }}>
          How do you<br/>want to play?
        </h1>
        <p style={{ fontSize: 14, color: HILL.muted, marginTop: 4 }}>
          <span className="hill-mono" style={{ color: HILL.accent }}>{mode === 'survival' ? '💀 SURVIVAL' : '⚡ BLITZ'}</span>
          <span style={{ color: HILL.dim }}> · 4 players max</span>
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 26 }}>
          {options.map((o) => {
            const sel = o.id === selected;
            return (
              <div key={o.id} className="hill-btn" style={{
                padding: '20px 18px',
                background: sel ? 'rgba(191,255,0,0.04)' : HILL.surface,
                border: `1.5px solid ${sel ? HILL.accent : HILL.border}`,
                borderRadius: 16,
                boxShadow: sel ? '0 0 24px rgba(191,255,0,0.15)' : 'none',
                textAlign: 'left',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: sel ? 'rgba(191,255,0,0.08)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${sel ? 'rgba(191,255,0,0.3)' : HILL.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: sel ? HILL.accent : HILL.text,
                    }}>{o.icon}</div>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>{o.title}</div>
                      <div style={{ fontSize: 11, color: HILL.muted, marginTop: 2, fontFamily: HILL.mono, letterSpacing: '0.04em' }}>
                        {o.caption.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    border: `1.5px solid ${sel ? HILL.accent : HILL.borderHi}`,
                    background: sel ? HILL.accent : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {sel && <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#0A0A0A" strokeWidth="2.5" strokeLinecap="round"><path d="M2 6l3 3 5-6"/></svg>}
                  </div>
                </div>
                <div style={{ fontSize: 13, color: HILL.text, marginTop: 14, lineHeight: 1.45 }}>{o.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{
        position: 'absolute', bottom: 24, left: 0, right: 0, padding: '12px 20px 0',
        background: `linear-gradient(180deg, transparent, ${HILL.bg} 35%)`,
      }}>
        <CTAButton variant="primary">
          {selected === 'multi' ? 'Create room  →' : 'Start hot-seat  →'}
        </CTAButton>
      </div>
    </PhoneShell>
  );
}

Object.assign(window, {
  PhoneShell,
  ScreenLanding, ScreenClassic, ScreenModeSelect, ScreenLobby,
  ScreenHillGame, DeathOverlay, GameOverOverlay,
  ScreenLeaderboard, ScreenProfile,
  ScreenSignIn, ScreenPlayStyle,
});
