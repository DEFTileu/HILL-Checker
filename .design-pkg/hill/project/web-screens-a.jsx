// HILL — desktop screen compositions.
// Each ScreenWeb* returns a fixed-size (1280×N) static frame in the dark HILL.
// All tokens reused verbatim from components.jsx.

const WEB_W = 1280;

// ─────────────────────────────────────────────────────────────
// 1) LANDING — desktop
// ─────────────────────────────────────────────────────────────
function ScreenWebLanding({ signedIn = true, height = 900 }) {
  const steps = [
    {
      n: '01',
      title: 'Spawn a room',
      body: 'Pick Blitz or Survival, share the 4-letter code or scan the QR. No download, no account needed to play.',
    },
    {
      n: '02',
      title: 'Push the hill',
      body: 'Each player has a shape — circle, square, triangle, hex. Take the 2×2 center and hold it through the clock.',
    },
    {
      n: '03',
      title: 'Climb the arena',
      body: 'Wins push your ELO, ELO climbs your tier. Each tier unlocks a new piece finish — bronze through champion.',
    },
  ];

  return (
    <WebShell height={height} nav={<TopNav active="hill" signedIn={signedIn}/>} footer={<WebFooter/>}>
      <Container style={{ paddingTop: 68, paddingBottom: 56, position: 'relative' }}>
        {/* accent column line */}
        <div style={{
          position: 'absolute', top: 80, left: 64, width: 4, height: 188,
          background: HILL.accent, boxShadow: `0 0 16px ${HILL.accent}`,
        }} />

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 56, paddingLeft: 32 }}>
          <div style={{ flex: '1 1 auto' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: HILL.accent, letterSpacing: '0.32em' }}>
              KING · OF · THE · BOARD
            </div>
            <div className="hill-display" style={{
              fontSize: 220, lineHeight: 0.82, marginTop: 12,
              background: `linear-gradient(180deg, #FAFAFA 0%, #FAFAFA 55%, #707070 100%)`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>HILL</div>
            <div style={{ marginTop: 22, fontSize: 26, lineHeight: 1.3, color: HILL.muted, maxWidth: 560 }}>
              <span style={{ color: HILL.text, fontWeight: 600 }}>4 players. 3 minutes. One hill.</span><br/>
              Browser-native checkers, re-cut for short attention spans.
            </div>

            <div style={{ display: 'flex', gap: 14, marginTop: 36 }}>
              <WebButton variant="primary" size="xl"
                leading={<span style={{ fontSize: 22, lineHeight: 1 }}>→</span>}>
                Create Hill Room
              </WebButton>
              <WebButton variant="outline" size="xl">Play Classic 2P</WebButton>
              <div style={{ display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
                <div className="hill-mono" style={{ fontSize: 11, color: HILL.muted, letterSpacing: '0.14em' }}>
                  OR<br/>
                  <a className="web-link" style={{ color: HILL.text, fontWeight: 700, cursor: 'pointer' }}>JOIN&nbsp;ROOM&nbsp;→</a>
                </div>
              </div>
            </div>
          </div>

          {/* Right side: live preview — a stylized mini board */}
          <div style={{ flex: '0 0 auto', paddingRight: 0, paddingBottom: 18, position: 'relative' }}>
            <div style={{
              position: 'absolute', top: -14, right: -14, padding: '5px 10px',
              background: 'rgba(0,0,0,0.6)',
              border: `1px solid rgba(191,255,0,0.4)`,
              borderRadius: 999,
              fontSize: 10, fontFamily: HILL.mono, letterSpacing: '0.18em', color: HILL.accent, fontWeight: 700,
              display: 'inline-flex', alignItems: 'center', gap: 6, zIndex: 2,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: HILL.danger, animation: 'hill-pulse 1.4s ease-in-out infinite' }}/>
              247 LIVE ROOMS
            </div>
            <Board size={10} cellSize={28}
              pieces={makeHillPieces()}
              centerZone={[[4,4],[4,5],[5,4],[5,5]]}
              skinForPlayer={MOCK_SKINS}
            />
          </div>
        </div>

        {/* How HILL works — 3 columns */}
        <div style={{ marginTop: 110, paddingLeft: 32 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 28 }}>
            <span className="hill-mono" style={{ fontSize: 11, color: HILL.accent, letterSpacing: '0.24em', fontWeight: 700 }}>HOW · HILL · WORKS</span>
            <span style={{ flex: 1, height: 1, background: HILL.border }} />
            <a className="web-link" style={{ fontSize: 12, color: HILL.muted, cursor: 'pointer', letterSpacing: '0.04em' }}>Full rules →</a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }}>
            {steps.map(s => (
              <div key={s.n} className="web-card" style={{
                background: HILL.surface, border: `1px solid ${HILL.border}`,
                borderRadius: 16, padding: '28px 26px',
              }}>
                <div className="hill-mono" style={{ fontSize: 11, color: HILL.muted, letterSpacing: '0.18em' }}>STEP · {s.n}</div>
                <div className="hill-display" style={{ fontSize: 32, marginTop: 12, color: HILL.text, letterSpacing: '-0.03em' }}>
                  {s.title}
                </div>
                <div style={{ marginTop: 14, fontSize: 14, color: HILL.muted, lineHeight: 1.55, textWrap: 'pretty' }}>
                  {s.body}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </WebShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 2) SIGN IN — desktop
// ─────────────────────────────────────────────────────────────
function ScreenWebSignIn({ height = 800 }) {
  return (
    <div className="hill-root hill-web" style={{
      width: WEB_W, height,
      background: HILL.bg, color: HILL.text,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* faint blurred board behind */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity: 0.18, filter: 'blur(8px) saturate(0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transform: 'scale(1.4) rotate(-6deg)',
      }}>
        <Board size={10} cellSize={56}
          pieces={makeHillPieces()}
          centerZone={[[4,4],[4,5],[5,4],[5,5]]}
          skinForPlayer={MOCK_SKINS}/>
      </div>
      {/* dark overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(60% 50% at 50% 45%, rgba(10,10,10,0.4), ${HILL.bg} 80%)`,
      }}/>

      {/* X close */}
      <div style={{ position: 'absolute', top: 24, right: 32, zIndex: 5 }}>
        <button className="hill-btn web-btn web-btn-outline" style={{
          width: 44, height: 44, borderRadius: 22,
          background: HILL.surface, border: `1px solid ${HILL.border}`,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: HILL.text,
        }}>
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 3l8 8M11 3l-8 8"/></svg>
        </button>
      </div>

      {/* Centered card */}
      <div style={{
        position: 'relative', zIndex: 2,
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: 480,
          background: 'rgba(20,20,20,0.85)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${HILL.border}`,
          borderRadius: 20,
          padding: '40px 40px 32px',
          boxShadow: '0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(191,255,0,0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span className="hill-display" style={{ fontSize: 64, letterSpacing: '-0.04em' }}>HILL</span>
            <span style={{ width: 24, height: 4, background: HILL.accent, boxShadow: `0 0 10px ${HILL.accent}`, alignSelf: 'center' }} />
          </div>

          <div style={{ marginTop: 28 }}>
            <div className="hill-mono" style={{ fontSize: 11, color: HILL.accent, letterSpacing: '0.24em', fontWeight: 700 }}>ACCOUNT</div>
            <h2 className="hill-display" style={{ fontSize: 44, marginTop: 10, marginBottom: 0, lineHeight: 1, letterSpacing: '-0.04em' }}>
              Keep your<br/>crown.
            </h2>
            <p style={{ fontSize: 15, color: HILL.muted, marginTop: 16, lineHeight: 1.55, textWrap: 'pretty' }}>
              Sign in to save your ELO, arena tier, and unlocked piece finishes across every device. One tap, no password.
            </p>
          </div>

          <button className="hill-btn web-btn web-btn-primary" style={{
            marginTop: 28,
            width: '100%', height: 60, borderRadius: 12,
            background: HILL.text, color: HILL.bg,
            fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            border: 'none',
          }}>
            <GoogleG size={22}/> Continue with Google
          </button>

          <div style={{
            marginTop: 18, padding: '12px 14px',
            border: `1px dashed ${HILL.border}`, borderRadius: 10,
            fontSize: 13, color: HILL.muted, textAlign: 'center', lineHeight: 1.5,
          }}>
            <a className="web-link" style={{ color: HILL.text, cursor: 'pointer', fontWeight: 600 }}>Keep playing as guest →</a><br/>
            <span style={{ color: HILL.dim, fontFamily: HILL.mono, fontSize: 10, letterSpacing: '0.08em' }}>STATS WON'T SYNC</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 3) PROFILE — desktop (2-column)
// ─────────────────────────────────────────────────────────────
function ScreenWebProfile({ signedIn = true, userTier = 'Gold', skin = 'gold', height = 1180 }) {
  const tierColor = TIER_META[userTier].color;
  return (
    <WebShell height={height} nav={<TopNav active="me" signedIn={signedIn}/>} footer={<WebFooter/>} scroll>
      <Container style={{ paddingTop: 48, paddingBottom: 64 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 28 }}>
          <span className="hill-mono" style={{ fontSize: 11, color: HILL.accent, letterSpacing: '0.24em', fontWeight: 700 }}>· ME ·</span>
          <h1 className="hill-display" style={{ fontSize: 72, margin: 0, letterSpacing: '-0.04em' }}>Profile</h1>
          <span style={{ flex: 1 }}/>
          <div className="hill-mono" style={{ fontSize: 11, color: HILL.dim, letterSpacing: '0.14em' }}>SAVED&nbsp;·&nbsp;<span style={{ color: HILL.accent }}>✓</span></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 48 }}>
          {/* LEFT */}
          <div>
            {/* Avatar */}
            <div style={{
              position: 'relative',
              width: 220, height: 220, margin: '0 auto',
            }}>
              {/* tier ring */}
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: `conic-gradient(${tierColor} 0deg, ${tierColor} 220deg, ${HILL.border} 220deg, ${HILL.border} 360deg)`,
                padding: 4,
              }}>
                <div style={{
                  width: '100%', height: '100%', borderRadius: '50%',
                  background: 'linear-gradient(135deg,#2a2a2a,#0a0a0a)',
                  border: `2px solid ${HILL.bg}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 84, fontWeight: 900, color: HILL.text,
                }}>A</div>
              </div>
              {/* Google G overlay */}
              {signedIn && (
                <div style={{
                  position: 'absolute', top: 6, right: 6,
                  width: 40, height: 40, borderRadius: '50%',
                  background: HILL.bg, padding: 4,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `1.5px solid ${HILL.border}`,
                }}><GoogleG size={26}/></div>
              )}
              {/* current skin piece bottom-left */}
              <div style={{
                position: 'absolute', bottom: -4, left: -4,
                width: 70, height: 70, borderRadius: '50%',
                background: HILL.bg, border: `2px solid ${HILL.borderHi}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><PieceShape player={1} size={42} skin={skin}/></div>
            </div>

            {/* Tier badge under */}
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '8px 16px 8px 12px',
                background: HILL.surface,
                border: `1.5px solid ${tierColor}50`,
                borderRadius: 999,
                fontSize: 13, fontWeight: 800, color: tierColor,
                letterSpacing: '0.14em',
              }}>
                <span style={{ fontSize: 16 }}>{TIER_META[userTier].icon}</span>
                {userTier.toUpperCase()} · TIER III
              </div>
            </div>

            {/* Signed in chip / sign in CTA */}
            <div style={{ marginTop: 22 }}>
              {signedIn ? (
                <>
                  <div className="web-card" style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 16px',
                    background: 'rgba(191,255,0,0.04)',
                    border: `1px solid rgba(191,255,0,0.2)`,
                    borderRadius: 12,
                  }}>
                    <GoogleG size={20}/>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 10, color: HILL.muted, letterSpacing: '0.14em', fontWeight: 700 }}>SIGNED IN AS</div>
                      <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>aida.k@gmail.com</div>
                    </div>
                  </div>
                  <a className="web-link" style={{
                    display: 'inline-block', marginTop: 12,
                    fontSize: 12, color: HILL.muted, fontWeight: 600, cursor: 'pointer',
                    letterSpacing: '0.04em',
                  }}>Sign out →</a>
                </>
              ) : (
                <button className="hill-btn web-btn web-btn-primary" style={{
                  width: '100%', height: 56, borderRadius: 12,
                  background: HILL.text, color: HILL.bg, border: 'none',
                  fontSize: 15, fontWeight: 700,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                }}>
                  <GoogleG size={20}/> Sign in with Google
                </button>
              )}
            </div>

            {/* Account meta */}
            <div style={{ marginTop: 22, padding: '14px 16px',
              background: HILL.surface, border: `1px solid ${HILL.border}`, borderRadius: 12,
              display: 'flex', flexDirection: 'column', gap: 10,
              fontFamily: HILL.mono, fontSize: 11, letterSpacing: '0.06em',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: HILL.muted }}>
                <span>JOINED</span><span style={{ color: HILL.text }}>OCT 14 · 2025</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: HILL.muted }}>
                <span>LAST WIN</span><span style={{ color: HILL.text }}>3 HOURS AGO</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: HILL.muted }}>
                <span>FRIENDS</span><span style={{ color: HILL.text }}>12</span>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Display name */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: HILL.muted, letterSpacing: '0.18em', marginBottom: 10 }}>DISPLAY NAME</div>
              <div className="web-input" style={{
                display: 'flex', alignItems: 'center',
                padding: '16px 20px',
                background: HILL.surface, border: `1px solid ${HILL.borderHi}`, borderRadius: 12,
                fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em',
                cursor: 'text',
              }}>
                <span>Aida K.</span>
                <span style={{ width: 2, height: 24, background: HILL.accent, marginLeft: 4, animation: 'hill-pulse 1.2s ease-in-out infinite' }}/>
                <span style={{ flex: 1 }}/>
                <span className="hill-mono" style={{ fontSize: 11, color: HILL.dim, letterSpacing: '0.1em' }}>SAVED ✓</span>
              </div>
            </div>

            {/* 5-stat grid in one row */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
              background: HILL.surface,
              border: `1px solid ${HILL.border}`,
              borderRadius: 14, overflow: 'hidden',
            }}>
              {[
                ['TOTAL WINS', '88'],
                ['GAMES', '160'],
                ['WIN RATE', '55%'],
                ['STREAK', '7'],
                ['FAVE MODE', 'BLITZ'],
              ].map(([k, v], i) => (
                <div key={k} style={{
                  padding: '20px 14px',
                  borderRight: i < 4 ? `1px solid ${HILL.border}` : 'none',
                  textAlign: 'center',
                }}>
                  <div className="hill-mono" style={{ fontSize: 32, fontWeight: 800, color: HILL.text, letterSpacing: '-0.01em' }}>{v}</div>
                  <div style={{ fontSize: 10, color: HILL.muted, letterSpacing: '0.16em', marginTop: 4, fontWeight: 700 }}>{k}</div>
                </div>
              ))}
            </div>

            {/* Tier progress */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: HILL.muted, marginBottom: 8, fontFamily: HILL.mono, letterSpacing: '0.1em' }}>
                <span><span style={{ color: tierColor }}>{userTier.toUpperCase()} · TIER III</span></span>
                <span>1,996 / 2,236 ELO  ·  240 to <span style={{ color: HILL.master }}>MASTER</span></span>
              </div>
              <div style={{ height: 10, borderRadius: 5, background: HILL.surface, overflow: 'hidden', border: `1px solid ${HILL.border}` }}>
                <div style={{
                  width: '62%', height: '100%',
                  background: `linear-gradient(90deg, ${tierColor}, ${HILL.accent})`,
                  boxShadow: `0 0 12px ${HILL.accent}`,
                }}/>
              </div>
            </div>

            {/* Piece skin selector — 5 cards horizontal */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: HILL.muted, letterSpacing: '0.18em' }}>PIECE SKIN</div>
                <div className="hill-mono" style={{ fontSize: 10, color: HILL.dim, letterSpacing: '0.1em' }}>SHAPE STAYS THE SAME · 4 OF 5 UNLOCKED</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
                {Object.keys(SKINS).map((sk) => {
                  const unlocked = skinUnlocked(sk, userTier);
                  const tier = SKINS[sk].tier;
                  const winsNeeded = { Silver: 5, Gold: 25, Master: 75, Champion: 150 }[tier];
                  const unlockText = unlocked ? null : `Unlock at ${tier}\u00a0\u00b7\u00a0${winsNeeded}\u00a0wins`;
                  const selected = sk === skin;
                  return (
                    <div key={sk} className="hill-btn web-card" style={{
                      position: 'relative',
                      padding: '18px 14px 14px',
                      background: selected ? 'rgba(191,255,0,0.05)' : HILL.surface,
                      border: `1.5px solid ${selected ? HILL.accent : HILL.border}`,
                      borderRadius: 14,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                      boxShadow: selected ? '0 0 18px rgba(191,255,0,0.12)' : 'none',
                      opacity: unlocked ? 1 : 0.55,
                    }}>
                      <div style={{
                        width: 76, height: 76, borderRadius: 14,
                        background: unlocked ? 'linear-gradient(135deg,#1f1f1f,#0f0f0f)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${HILL.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        position: 'relative',
                        filter: unlocked ? 'none' : 'grayscale(0.7) brightness(0.7)',
                      }}>
                        <PieceShape player={1} size={48} skin={sk}/>
                        {!unlocked && (
                          <div style={{
                            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(10,10,10,0.55)', borderRadius: 14,
                          }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={HILL.muted} strokeWidth="2" strokeLinecap="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: 'center', minHeight: 30 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>{SKINS[sk].name}</div>
                        <div className="hill-mono" style={{ fontSize: 9, color: SKINS[sk].color, letterSpacing: '0.14em', marginTop: 2 }}>
                          {SKINS[sk].tag}
                        </div>
                      </div>
                      {selected && !unlocked === false && (
                        <div style={{
                          fontSize: 9, fontWeight: 800, letterSpacing: '0.14em',
                          color: HILL.bg, background: HILL.accent,
                          padding: '4px 8px', borderRadius: 4,
                        }}>SELECTED</div>
                      )}
                      {!unlocked && (
                        <div style={{ fontSize: 9, color: HILL.muted, fontFamily: HILL.mono, letterSpacing: '0.08em', textAlign: 'center', lineHeight: 1.3 }}>
                          {unlockText}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detailed stats grid */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: HILL.muted, letterSpacing: '0.18em', marginBottom: 10 }}>DETAILED STATS</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  ['Longest win streak', '7 wins'],
                  ['Best round (Blitz)',  '12 pieces on hill'],
                  ['Pieces captured',     '1,204'],
                  ['Hill seconds held',   '14m 22s'],
                  ['Kings crowned',       '32'],
                  ['Times eliminated',    '47 (29%)'],
                ].map(([k, v]) => (
                  <div key={k} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '14px 16px',
                    background: HILL.surface, border: `1px solid ${HILL.border}`, borderRadius: 10,
                    fontSize: 14,
                  }}>
                    <span style={{ color: HILL.muted }}>{k}</span>
                    <span className="hill-mono" style={{ fontWeight: 700, color: HILL.text }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reset button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
              <button className="hill-btn web-btn" style={{
                height: 38, padding: '0 18px', borderRadius: 10,
                background: 'transparent', color: HILL.danger,
                border: `1px solid ${HILL.danger}40`,
                fontSize: 12, fontWeight: 700, letterSpacing: '0.08em',
              }}>RESET ACCOUNT</button>
            </div>
          </div>
        </div>
      </Container>
    </WebShell>
  );
}

Object.assign(window, {
  ScreenWebLanding, ScreenWebSignIn, ScreenWebProfile,
});
