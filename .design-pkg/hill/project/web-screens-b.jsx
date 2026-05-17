// HILL — desktop screens batch B: Leaderboard, ModeSelect, PlayStyle, Lobby

// ─────────────────────────────────────────────────────────────
// 4) LEADERBOARD — desktop (table)
// ─────────────────────────────────────────────────────────────
function ScreenWebLeaderboard({ height = 1000 }) {
  const rows = [
    { rank: 1, name: 'Sam Wilson',   tier: 'Champion', wins: 142, games: 200, wr: 71, elo: 2480, badge: '+12' },
    { rank: 2, name: 'mira_42',      tier: 'Champion', wins: 128, games: 188, wr: 68, elo: 2410, badge: '+8' },
    { rank: 3, name: 'Aida.K',       tier: 'Master',   wins: 117, games: 183, wr: 64, elo: 2245, badge: '+4' },
    { rank: 4, name: 'kettle',       tier: 'Master',   wins: 109, games: 176, wr: 62, elo: 2210 },
    { rank: 5, name: 'Riko',         tier: 'Master',   wins: 102, games: 173, wr: 59, elo: 2188 },
    { rank: 6, name: 'darkhorse',    tier: 'Gold',     wins:  94, games: 162, wr: 58, elo: 2050 },
    { rank: 7, name: 'Player_a3f9',  tier: 'Gold',     wins:  88, games: 160, wr: 55, elo: 1996, isYou: true, badge: '— YOU' },
    { rank: 8, name: 'Marcus J.',    tier: 'Gold',     wins:  82, games: 155, wr: 53, elo: 1955 },
    { rank: 9, name: 'noir',         tier: 'Silver',   wins:  74, games: 145, wr: 51, elo: 1810 },
    { rank: 10, name: 'paperclip',   tier: 'Silver',   wins:  68, games: 138, wr: 49, elo: 1740 },
    { rank: 11, name: 'oz_8',        tier: 'Silver',   wins:  61, games: 130, wr: 47, elo: 1688 },
    { rank: 12, name: 'rust_belt',   tier: 'Bronze',   wins:  54, games: 123, wr: 44, elo: 1502 },
  ];

  return (
    <WebShell height={height} nav={<TopNav active="top" signedIn={true}/>} footer={<WebFooter/>} scroll>
      <Container style={{ paddingTop: 48, paddingBottom: 64 }}>
        {/* Headline */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 8 }}>
          <span className="hill-mono" style={{ fontSize: 11, color: HILL.accent, letterSpacing: '0.32em', fontWeight: 700 }}>RANKED · SEASON&nbsp;03</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 32, marginBottom: 28 }}>
          <h1 className="hill-display" style={{ fontSize: 96, margin: 0, letterSpacing: '-0.05em' }}>TOP 100</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 18 }}>
            <div className="hill-mono" style={{ fontSize: 11, color: HILL.muted, letterSpacing: '0.14em' }}>
              SEASON ENDS IN <span style={{ color: HILL.text, fontWeight: 700 }}>12d 04h</span>
            </div>
          </div>
        </div>

        {/* Filter row + search */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <FilterPill active>Global</FilterPill>
            <FilterPill>Friends · 12</FilterPill>
            <FilterPill>This week</FilterPill>
            <FilterPill>Blitz only</FilterPill>
            <FilterPill>Survival only</FilterPill>
          </div>
          <SearchInput/>
        </div>

        {/* Table */}
        <LeaderboardTable rows={rows}/>

        <div style={{
          marginTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontFamily: HILL.mono, fontSize: 11, color: HILL.dim, letterSpacing: '0.1em',
        }}>
          <span>SHOWING 1–12 OF 100</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="hill-btn web-btn web-btn-outline" style={{
              height: 36, padding: '0 14px', borderRadius: 8, background: HILL.surface,
              border: `1px solid ${HILL.border}`, color: HILL.text, fontSize: 12, fontWeight: 600,
            }}>← Prev</button>
            <button className="hill-btn web-btn web-btn-outline" style={{
              height: 36, padding: '0 14px', borderRadius: 8, background: HILL.surface,
              border: `1px solid ${HILL.border}`, color: HILL.text, fontSize: 12, fontWeight: 600,
            }}>Next →</button>
          </div>
        </div>
      </Container>
    </WebShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 5) MODE SELECT — desktop (2 cards side-by-side)
// ─────────────────────────────────────────────────────────────
function ScreenWebModeSelect({ selected = 'blitz', height = 900 }) {
  return (
    <WebShell height={height} nav={<TopNav active="hill" signedIn={true}/>} footer={<WebFooter/>}>
      <Container style={{ paddingTop: 56, paddingBottom: 56, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
          <span className="hill-mono" style={{ fontSize: 11, color: HILL.accent, letterSpacing: '0.32em', fontWeight: 700 }}>STEP · 1 / 2</span>
          <a className="web-link" style={{ fontSize: 12, color: HILL.muted, cursor: 'pointer' }}>← back</a>
        </div>
        <h1 className="hill-display" style={{ fontSize: 88, marginTop: 14, marginBottom: 12, letterSpacing: '-0.04em' }}>
          Choose your mode.
        </h1>
        <p style={{ fontSize: 18, color: HILL.muted, maxWidth: 580, lineHeight: 1.4, marginTop: 0 }}>
          Pick a ruleset. You can switch in the lobby up until the first move.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22, marginTop: 50 }}>
          <BigModeCard mode="blitz" selected={selected === 'blitz'}/>
          <BigModeCard mode="survival" selected={selected === 'survival'}/>
        </div>

        <div style={{ flex: 1 }}/>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 40 }}>
          <WebButton variant="primary" size="xl"
            leading={<span>Continue</span>}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              · <span className="hill-mono" style={{ fontSize: 13, opacity: 0.7 }}>{selected.toUpperCase()}</span>
              <span style={{ fontSize: 18 }}>→</span>
            </span>
          </WebButton>
        </div>
      </Container>
    </WebShell>
  );
}

// Desktop ModeCard — bigger, more visual
function BigModeCard({ mode = 'blitz', selected }) {
  const isBlitz = mode === 'blitz';
  return (
    <div className="hill-btn web-card" style={{
      position: 'relative',
      padding: '32px 30px 28px',
      background: selected ? 'rgba(191,255,0,0.04)' : HILL.surface,
      border: `1.5px solid ${selected ? HILL.accent : HILL.border}`,
      borderRadius: 22,
      boxShadow: selected ? '0 0 36px rgba(191,255,0,0.15)' : 'none',
      textAlign: 'left',
      cursor: 'pointer',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 18,
            background: isBlitz ? 'rgba(191,255,0,0.08)' : 'rgba(255,59,48,0.08)',
            border: `1px solid ${isBlitz ? 'rgba(191,255,0,0.3)' : 'rgba(255,59,48,0.3)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: isBlitz ? HILL.accent : HILL.danger,
          }}>
            {isBlitz
              ? <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L4 14h7l-2 8 9-12h-7l2-8z"/></svg>
              : <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="11" r="2"/><circle cx="15" cy="11" r="2"/><path d="M6 18c0-2 0-6 6-6s6 4 6 6"/><circle cx="12" cy="12" r="9.5"/></svg>
            }
          </div>
          <div>
            <div className="hill-display" style={{ fontSize: 42, letterSpacing: '-0.03em' }}>
              {isBlitz ? 'BLITZ' : 'SURVIVAL'}
            </div>
            <div className="hill-mono" style={{ fontSize: 12, color: HILL.muted, marginTop: 4, letterSpacing: '0.14em' }}>
              {isBlitz ? '~3 MINUTES · 7 ROUNDS' : '~5-7 MINUTES · LAST ALIVE'}
            </div>
          </div>
        </div>
        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          border: `2px solid ${selected ? HILL.accent : HILL.borderHi}`,
          background: selected ? HILL.accent : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {selected && <svg width="16" height="16" viewBox="0 0 12 12" fill="none" stroke="#0A0A0A" strokeWidth="2.5" strokeLinecap="round"><path d="M2 6l3 3 5-6"/></svg>}
        </div>
      </div>

      <div style={{ fontSize: 17, color: HILL.text, marginTop: 22, lineHeight: 1.5, textWrap: 'pretty', maxWidth: 480 }}>
        {isBlitz
          ? 'Seven rounds, fixed clock. Multiple kings can rule. Most pieces on the hill when the bell rings takes the round.'
          : 'Last player with pieces takes everything. Tighter board pressure, slower burn — outlast everyone or be eliminated.'}
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14,
        marginTop: 24, paddingTop: 22, borderTop: `1px solid ${HILL.border}`,
      }}>
        {[
          ['CLOCK', isBlitz ? '10s / turn' : '15s / turn'],
          ['ROUNDS', isBlitz ? '7' : 'No limit'],
          ['PLAYERS', '2–4'],
        ].map(([k, v]) => (
          <div key={k}>
            <div className="hill-mono" style={{ fontSize: 10, color: HILL.muted, letterSpacing: '0.16em', fontWeight: 700 }}>{k}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: HILL.text, marginTop: 4 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 6) PLAY STYLE — desktop (Hot-seat vs Multiplayer side-by-side)
// ─────────────────────────────────────────────────────────────
function ScreenWebPlayStyle({ selected = 'multi', mode = 'blitz', height = 900 }) {
  const options = [
    {
      id: 'hotseat',
      title: 'Hot-seat',
      caption: 'This device',
      desc: 'Pass the laptop. Everyone takes their turn on the same screen — perfect for couch games and offline play.',
      icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 21h8M12 18v3"/></svg>,
    },
    {
      id: 'multi',
      title: 'Multiplayer',
      caption: 'Invite friends',
      desc: 'Create a room. Share the 4-letter code, link, or QR — friends join from their phones, laptops, or tablets in real time.',
      icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3"/><path d="M3 21c.5-3.5 3-6 6-6s5.5 2.5 6 6"/><circle cx="17" cy="7" r="2.5"/><path d="M15 13c.5-1.5 2-3 4-3"/></svg>,
    },
  ];

  return (
    <WebShell height={height} nav={<TopNav active="hill" signedIn={true}/>} footer={<WebFooter/>}>
      <Container style={{ paddingTop: 56, paddingBottom: 56, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
          <span className="hill-mono" style={{ fontSize: 11, color: HILL.accent, letterSpacing: '0.32em', fontWeight: 700 }}>STEP · 2 / 2</span>
          <a className="web-link" style={{ fontSize: 12, color: HILL.muted, cursor: 'pointer' }}>← back</a>
          <span style={{ flex: 1 }}/>
          <span className="hill-mono" style={{ fontSize: 12, color: HILL.muted, letterSpacing: '0.1em' }}>
            <span style={{ color: HILL.accent }}>{mode === 'survival' ? '💀 SURVIVAL' : '⚡ BLITZ'}</span>
            <span style={{ color: HILL.dim }}> · 4 PLAYERS MAX</span>
          </span>
        </div>
        <h1 className="hill-display" style={{ fontSize: 88, marginTop: 14, marginBottom: 12, letterSpacing: '-0.04em' }}>
          How do you want<br/>to play?
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22, marginTop: 44 }}>
          {options.map(o => {
            const sel = o.id === selected;
            return (
              <div key={o.id} className="hill-btn web-card" style={{
                padding: '32px 30px 28px',
                background: sel ? 'rgba(191,255,0,0.04)' : HILL.surface,
                border: `1.5px solid ${sel ? HILL.accent : HILL.border}`,
                borderRadius: 22,
                boxShadow: sel ? '0 0 36px rgba(191,255,0,0.15)' : 'none',
                cursor: 'pointer',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                    <div style={{
                      width: 72, height: 72, borderRadius: 18,
                      background: sel ? 'rgba(191,255,0,0.08)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${sel ? 'rgba(191,255,0,0.3)' : HILL.border}`,
                      color: sel ? HILL.accent : HILL.text,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>{o.icon}</div>
                    <div>
                      <div className="hill-display" style={{ fontSize: 38, letterSpacing: '-0.03em' }}>{o.title}</div>
                      <div className="hill-mono" style={{ fontSize: 12, color: HILL.muted, marginTop: 4, letterSpacing: '0.14em' }}>
                        {o.caption.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%',
                    border: `2px solid ${sel ? HILL.accent : HILL.borderHi}`,
                    background: sel ? HILL.accent : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {sel && <svg width="16" height="16" viewBox="0 0 12 12" fill="none" stroke="#0A0A0A" strokeWidth="2.5" strokeLinecap="round"><path d="M2 6l3 3 5-6"/></svg>}
                  </div>
                </div>
                <div style={{ fontSize: 17, color: HILL.text, marginTop: 22, lineHeight: 1.5, textWrap: 'pretty', maxWidth: 460 }}>{o.desc}</div>
              </div>
            );
          })}
        </div>

        <div style={{ flex: 1 }}/>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
          <WebButton variant="primary" size="xl">
            {selected === 'multi' ? 'Create room  →' : 'Start hot-seat  →'}
          </WebButton>
        </div>
      </Container>
    </WebShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 7) ROOM LOBBY — desktop (2-column)
// ─────────────────────────────────────────────────────────────
function ScreenWebLobby({ filled = 'partial', mode = 'blitz', height = 980 }) {
  const slots = filled === 'partial' ? [
    { player: 1, name: 'Aida K.',  tier: 'Gold',   isHost: true, you: true,  skin: 'gold' },
    { player: 2, empty: true },
    { player: 3, name: 'Sam',      tier: 'Bronze', skin: 'bronze' },
    { player: 4, empty: true },
  ] : [
    { player: 1, name: 'Aida K.', tier: 'Gold',   isHost: true, you: true, skin: 'gold' },
    { player: 2, name: 'Marcus',  tier: 'Gold',   skin: 'gold' },
    { player: 3, name: 'Sam',     tier: 'Bronze', skin: 'bronze' },
    { player: 4, name: 'Riko',    tier: 'Master', skin: 'master' },
  ];
  const ready = slots.filter(s => !s.empty).length >= 2;

  return (
    <WebShell height={height} nav={<TopNav active="hill" signedIn={true}/>} footer={<WebFooter/>}>
      <Container style={{ paddingTop: 48, paddingBottom: 48, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, marginBottom: 28 }}>
          <a className="web-link" style={{ fontSize: 13, color: HILL.muted, cursor: 'pointer' }}>← Leave room</a>
          <span style={{ flex: 1 }}/>
          <span className="hill-mono" style={{ fontSize: 11, color: HILL.muted, letterSpacing: '0.14em' }}>
            LIVE LOBBY · <span style={{ color: HILL.accent }}>● {slots.filter(s => !s.empty).length}/4</span>
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: 56 }}>
          {/* LEFT */}
          <div>
            <div className="hill-mono" style={{ fontSize: 11, fontWeight: 700, color: HILL.muted, letterSpacing: '0.24em' }}>
              ROOM CODE
            </div>
            <div className="hill-display hill-mono" style={{
              marginTop: 8,
              fontSize: 132, lineHeight: 1, letterSpacing: '0.04em', color: HILL.text,
              fontWeight: 700,
              textShadow: `0 0 40px rgba(191,255,0,0.15)`,
            }}>
              ABCD
            </div>
            <div className="hill-mono" style={{ fontSize: 12, color: HILL.muted, marginTop: 8, letterSpacing: '0.06em' }}>
              hill.gg/r/<span style={{ color: HILL.text }}>ABCD</span>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button className="hill-btn web-btn web-btn-outline" style={{
                flex: 1, height: 46, borderRadius: 10,
                background: HILL.surface, border: `1px solid ${HILL.border}`, color: HILL.text,
                fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                Copy link
              </button>
              <button className="hill-btn web-btn web-btn-outline" style={{
                flex: 1, height: 46, borderRadius: 10,
                background: HILL.surface, border: `1px solid ${HILL.border}`, color: HILL.text,
                fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
                Share
              </button>
            </div>

            {/* Mode locked */}
            <div style={{ marginTop: 28 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: HILL.muted, letterSpacing: '0.18em', marginBottom: 10 }}>MODE · LOCKED</div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 16px',
                background: HILL.surface, border: `1px solid ${HILL.border}`, borderRadius: 12,
              }}>
                <span style={{ fontSize: 22 }}>{mode === 'survival' ? '💀' : '⚡'}</span>
                <div style={{ flex: 1 }}>
                  <div className="hill-display" style={{ fontSize: 22, letterSpacing: '-0.02em' }}>
                    {mode === 'survival' ? 'SURVIVAL' : 'BLITZ'}
                  </div>
                  <div style={{ fontSize: 12, color: HILL.muted, marginTop: 2 }}>
                    {mode === 'survival' ? 'Last alive wins · ~5-7 min' : '7 rounds · ~3 min'}
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={HILL.muted} strokeWidth="2" strokeLinecap="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>
              </div>
              <a className="web-link" style={{
                display: 'inline-block', marginTop: 10,
                fontSize: 12, color: HILL.muted, cursor: 'pointer',
                fontWeight: 600, letterSpacing: '0.04em',
              }}>← change mode</a>
            </div>

            {/* QR code */}
            <div style={{ marginTop: 28 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: HILL.muted, letterSpacing: '0.18em', marginBottom: 10 }}>SCAN TO JOIN ON MOBILE</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <FakeQrCode value="ABCD" size={156}/>
                <div style={{ fontSize: 13, color: HILL.muted, lineHeight: 1.5, textWrap: 'pretty', maxWidth: 200 }}>
                  Friends point their phone camera at this — opens the lobby instantly. <span style={{ color: HILL.text }}>No app install.</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 className="hill-display" style={{ fontSize: 44, margin: 0, letterSpacing: '-0.04em' }}>Players</h2>
              <div className="hill-mono" style={{ fontSize: 13, color: HILL.muted, letterSpacing: '0.1em' }}>
                <span style={{ color: HILL.text, fontWeight: 700 }}>{slots.filter(s=>!s.empty).length}</span> · OF · 4
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {slots.map((s, i) => <LobbyPlayerCard key={i} {...s}/>)}
            </div>

            {/* Recent chat / invite history */}
            <div style={{ marginTop: 22 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: HILL.muted, letterSpacing: '0.18em', marginBottom: 10 }}>RECENT</div>
              <div style={{
                background: HILL.surface, border: `1px solid ${HILL.border}`,
                borderRadius: 12, padding: '10px 14px',
                display: 'flex', flexDirection: 'column', gap: 8,
                fontSize: 12, color: HILL.muted, fontFamily: HILL.mono, letterSpacing: '0.04em',
              }}>
                <div><span style={{ color: HILL.accent }}>●</span> 0:48&nbsp;ago &nbsp;·&nbsp; Sam joined as P3</div>
                <div><span style={{ color: HILL.muted }}>○</span> 2:14&nbsp;ago &nbsp;·&nbsp; Aida created room, mode set to {mode.toUpperCase()}</div>
                <div><span style={{ color: HILL.muted }}>○</span> 2:14&nbsp;ago &nbsp;·&nbsp; Room ABCD is live</div>
              </div>
            </div>

            <div style={{ marginTop: 28, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <WebButton variant="outline" size="lg">Cancel</WebButton>
              <WebButton variant="primary" size="lg" disabled={!ready}>
                {ready ? 'Start Game  →' : 'Waiting for 2+ players…'}
              </WebButton>
            </div>
          </div>
        </div>
      </Container>
    </WebShell>
  );
}

function LobbyPlayerCard({ player, name, tier, isHost, empty, you, skin = 'bronze' }) {
  const color = [HILL.p1, HILL.p2, HILL.p3, HILL.p4][player - 1];
  return (
    <div className="web-card" style={{
      position: 'relative',
      background: HILL.surface,
      border: `1.5px solid ${empty ? 'rgba(255,255,255,0.06)' : HILL.border}`,
      borderRadius: 14, padding: '18px 18px',
      display: 'flex', alignItems: 'center', gap: 16,
      minHeight: 96,
      animation: empty ? 'hill-pulse 2.4s ease-in-out infinite' : 'none',
    }}>
      <div style={{
        position: 'absolute', top: 0, bottom: 0, left: 0, width: 3,
        background: empty ? 'transparent' : color,
      }}/>
      <PieceSamplePreview player={player} skin={skin} size={44} withBackdrop={!empty}/>
      {empty && (
        <div style={{
          width: 62, height: 62, borderRadius: 14, marginLeft: -62 + 0,
          border: `1px dashed ${HILL.borderHi}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: HILL.dim, fontSize: 28, fontWeight: 300,
        }}>+</div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 18, fontWeight: 700, color: empty ? HILL.dim : HILL.text,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{empty ? `Slot P${player}` : name}</span>
          {you && !empty && <span style={{ fontSize: 10, fontWeight: 800, color: HILL.accent, letterSpacing: '0.12em' }}>YOU</span>}
          {isHost && !empty && <span style={{ fontSize: 10, fontWeight: 700, color: HILL.muted, letterSpacing: '0.12em' }}>HOST</span>}
        </div>
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          {empty
            ? <span style={{ fontSize: 12, color: HILL.dim, fontFamily: HILL.mono, letterSpacing: '0.06em' }}>Waiting for player…</span>
            : <ArenaBadge tier={tier}/>
          }
        </div>
      </div>
      {empty && (
        <button className="hill-btn web-btn web-btn-outline" style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
          padding: '6px 10px', borderRadius: 8,
          background: 'transparent', border: `1px solid ${HILL.border}`, color: HILL.muted,
        }}>+ AI BOT</button>
      )}
    </div>
  );
}

Object.assign(window, {
  ScreenWebLeaderboard, ScreenWebModeSelect, ScreenWebPlayStyle, ScreenWebLobby,
  BigModeCard, LobbyPlayerCard,
});
