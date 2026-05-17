// HILL — desktop / web variants of components.
// These ADD to the existing components, they don't replace them.
// Mobile components in components.jsx remain unchanged.

// ───────────────────────────────────────────────
// Once-only desktop style block — hover/focus rings, table styles
// ───────────────────────────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('hill-web-styles')) {
  const s = document.createElement('style');
  s.id = 'hill-web-styles';
  s.textContent = `
  .hill-web *{box-sizing:border-box}
  .hill-web .web-btn{transition:transform .12s ease, background .15s ease, border-color .15s ease, box-shadow .15s ease, color .15s ease}
  .hill-web .web-btn:hover:not(:disabled){transform:translateY(-2px)}
  .hill-web .web-btn-primary:hover:not(:disabled){background:#D7FF52;box-shadow:0 8px 24px rgba(191,255,0,0.25)}
  .hill-web .web-btn-outline:hover:not(:disabled){border-color:#BFFF00;color:#fff;box-shadow:0 0 0 1px rgba(191,255,0,0.2)}
  .hill-web .web-card{transition:border-color .15s ease, box-shadow .15s ease, transform .15s ease}
  .hill-web .web-card:hover{border-color:rgba(191,255,0,0.45);box-shadow:0 0 0 1px rgba(191,255,0,0.15), 0 16px 40px rgba(0,0,0,0.45)}
  .hill-web .web-link{transition:color .12s, text-decoration-color .12s; text-decoration:underline; text-decoration-color:transparent; text-underline-offset:3px}
  .hill-web .web-link:hover{color:#fff; text-decoration-color:#BFFF00}
  .hill-web .web-row:hover{background:rgba(191,255,0,0.04)}
  .hill-web .web-tab{position:relative; transition:color .12s}
  .hill-web .web-tab:hover{color:#FAFAFA}
  .hill-web .web-tab-active::after{content:""; position:absolute; left:50%; bottom:-19px; transform:translateX(-50%); width:34px; height:3px; border-radius:2px; background:#BFFF00; box-shadow:0 0 10px #BFFF00}
  .hill-web .web-piece:hover{transform:scale(1.06)}
  .hill-web .web-piece{transition:transform .15s ease; cursor:pointer}
  .hill-web .web-input{transition:border-color .15s, box-shadow .15s}
  .hill-web .web-input:focus{outline:none; border-color:#BFFF00; box-shadow:0 0 0 3px rgba(191,255,0,0.15)}
  .hill-web .web-pill{transition:background .15s, color .15s, border-color .15s}
  .hill-web .web-pill:hover:not(.web-pill-active){background:#1f1f1f; color:#FAFAFA}
  `;
  document.head.appendChild(s);
}

// ───────────────────────────────────────────────
// TopNav — sticky header used on landing / leaderboard / profile etc.
// ───────────────────────────────────────────────
function TopNav({ active = 'hill', signedIn = true, userName = 'Aida K.', userTier = 'Gold', userSkin = 'gold', samplePlayer = 1, onSignIn, sticky = true }) {
  const tabs = [
    { id: 'hill', label: 'HILL' },
    { id: 'top',  label: 'TOP' },
    { id: 'me',   label: 'ME' },
  ];
  return (
    <header style={{
      position: sticky ? 'sticky' : 'relative', top: 0, zIndex: 10,
      height: 64,
      background: 'rgba(10,10,10,0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: `1px solid ${HILL.border}`,
      display: 'flex', alignItems: 'center',
    }}>
      <div style={{
        width: '100%', maxWidth: 1280, margin: '0 auto',
        padding: '0 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 32,
      }}>
        {/* Left: wordmark */}
        <a className="web-link" style={{ display: 'inline-flex', alignItems: 'baseline', gap: 8, textDecoration: 'none', color: HILL.text }}>
          <span className="hill-display" style={{ fontSize: 28, letterSpacing: '-0.04em' }}>HILL</span>
          <span style={{ width: 18, height: 3, background: HILL.accent, boxShadow: `0 0 8px ${HILL.accent}`, alignSelf: 'center' }} />
        </a>

        {/* Center: nav tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 38 }}>
          {tabs.map(t => {
            const isActive = active === t.id;
            return (
              <a key={t.id} className={`web-tab ${isActive ? 'web-tab-active' : ''}`} style={{
                fontSize: 12, fontWeight: 800, letterSpacing: '0.22em',
                color: isActive ? HILL.text : HILL.muted,
                textDecoration: 'none', cursor: 'pointer',
                padding: '4px 2px',
              }}>{t.label}</a>
            );
          })}
        </nav>

        {/* Right: welcome chip OR sign-in button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 240, justifyContent: 'flex-end' }}>
          {signedIn ? (
            <div className="web-card" style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '5px 12px 5px 5px',
              background: HILL.surface, border: `1px solid ${HILL.border}`, borderRadius: 999,
              fontSize: 13, fontWeight: 600,
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: 'linear-gradient(135deg,#3a3a3a,#1a1a1a)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize: 13, fontWeight: 800, color: HILL.text, position:'relative', flexShrink: 0,
              }}>
                {userName[0]}
                <div style={{
                  position:'absolute', bottom:-2, right:-2,
                  width:14, height:14, borderRadius:'50%',
                  background: HILL.bg, padding: 1.5,
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}><GoogleG size={10}/></div>
              </div>
              <span style={{ color: HILL.text }}>{userName}</span>
              <ArenaBadge tier={userTier} />
            </div>
          ) : (
            <button className="web-btn web-btn-outline hill-btn" onClick={onSignIn} style={{
              height: 40, padding: '0 16px', borderRadius: 10,
              background: 'transparent', border: `1.5px solid ${HILL.borderHi}`, color: HILL.text,
              fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>
              <GoogleG size={16}/> Sign in with Google
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

// ───────────────────────────────────────────────
// WebShell — page-level frame (full-bleed dark bg + max-width centered content)
// ───────────────────────────────────────────────
function WebShell({ children, width = 1280, height = 800, nav = null, footer = null, padded = true, scroll = false }) {
  return (
    <div className="hill-root hill-web" style={{
      width, height,
      background: HILL.bg, color: HILL.text,
      display: 'flex', flexDirection: 'column',
      overflow: scroll ? 'auto' : 'hidden',
      position: 'relative',
    }}>
      {nav}
      <main style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
      {footer}
    </div>
  );
}

// ───────────────────────────────────────────────
// Container — max-width 1280, generous side padding
// ───────────────────────────────────────────────
function Container({ children, style = {}, padded = true }) {
  return (
    <div style={{
      width: '100%', maxWidth: 1280, margin: '0 auto',
      padding: padded ? '0 64px' : 0,
      ...style,
    }}>
      {children}
    </div>
  );
}

// ───────────────────────────────────────────────
// Web CTA button — hover lift + bigger sizes
// ───────────────────────────────────────────────
function WebButton({ variant = 'primary', children, size = 'md', disabled, full = false, leading = null, style = {}, onClick }) {
  const primary = variant === 'primary';
  const danger = variant === 'danger';
  const heights = { sm: 38, md: 48, lg: 60, xl: 68 };
  const h = heights[size];
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`hill-btn web-btn ${primary ? 'web-btn-primary' : 'web-btn-outline'}`}
      style={{
        width: full ? '100%' : 'auto',
        height: h,
        padding: size === 'xl' ? '0 32px' : '0 24px',
        borderRadius: 12,
        background: primary ? HILL.accent : danger ? 'transparent' : 'transparent',
        color: primary ? '#0A0A0A' : danger ? HILL.danger : HILL.text,
        border: primary ? 'none' : `1.5px solid ${danger ? HILL.danger + '60' : HILL.borderHi}`,
        fontSize: size === 'xl' ? 18 : size === 'lg' ? 17 : 15, fontWeight: 700,
        letterSpacing: '-0.01em',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style,
      }}>
      {leading}{children}
    </button>
  );
}

// ───────────────────────────────────────────────
// Footer
// ───────────────────────────────────────────────
function WebFooter() {
  return (
    <footer style={{
      borderTop: `1px solid ${HILL.border}`,
      padding: '24px 0',
      marginTop: 'auto',
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto', padding: '0 64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontFamily: HILL.mono, fontSize: 11, color: HILL.dim, letterSpacing: '0.14em',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span className="hill-display" style={{ fontSize: 16, color: HILL.muted, letterSpacing: '-0.04em' }}>HILL</span>
          <span>· v1.0 · 2026</span>
        </div>
        <div style={{ display: 'flex', gap: 22 }}>
          <a className="web-link" style={{ color: HILL.muted, cursor: 'pointer' }}>GITHUB</a>
          <a className="web-link" style={{ color: HILL.muted, cursor: 'pointer' }}>ABOUT</a>
          <a className="web-link" style={{ color: HILL.muted, cursor: 'pointer' }}>PRIVACY</a>
          <a className="web-link" style={{ color: HILL.muted, cursor: 'pointer' }}>HOW TO PLAY</a>
        </div>
      </div>
    </footer>
  );
}

// ───────────────────────────────────────────────
// FakeQrCode — deterministic SVG pseudo-QR. NOT a real QR; for design mock.
// ───────────────────────────────────────────────
function FakeQrCode({ value = 'ABCD', size = 180, fg = HILL.text, bg = HILL.surface }) {
  // Deterministic pseudo-random grid seeded from value
  const grid = 21;
  const cell = size / grid;
  let seed = 0;
  for (let i = 0; i < value.length; i++) seed = (seed * 31 + value.charCodeAt(i)) >>> 0;
  const rand = (i, j) => {
    let n = (seed ^ (i * 374761393) ^ (j * 668265263)) >>> 0;
    n = (n ^ (n >>> 13)) * 1274126177; n = n >>> 0;
    return ((n ^ (n >>> 16)) & 0xffff) / 0xffff;
  };
  const isFinder = (i, j) => {
    const inBox = (oi, oj) => i >= oi && i < oi + 7 && j >= oj && j < oj + 7;
    return inBox(0,0) || inBox(0, grid-7) || inBox(grid-7, 0);
  };
  const finderFilled = (i, j) => {
    const local = (oi, oj) => { const li = i - oi, lj = j - oj; return (li === 0 || li === 6 || lj === 0 || lj === 6) || (li >= 2 && li <= 4 && lj >= 2 && lj <= 4); };
    if (i < 7 && j < 7) return local(0,0);
    if (i < 7 && j >= grid-7) return local(0, grid-7);
    if (i >= grid-7 && j < 7) return local(grid-7, 0);
    return false;
  };
  const cells = [];
  for (let i = 0; i < grid; i++) {
    for (let j = 0; j < grid; j++) {
      let on = false;
      if (isFinder(i, j)) on = finderFilled(i, j);
      else on = rand(i, j) > 0.52;
      if (on) cells.push(<rect key={`${i}-${j}`} x={j * cell} y={i * cell} width={cell} height={cell} fill={fg} />);
    }
  }
  return (
    <div style={{
      width: size + 24, height: size + 24, padding: 12,
      background: bg, borderRadius: 16,
      border: `1px solid ${HILL.border}`,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} shapeRendering="crispEdges">
        <rect width={size} height={size} fill="transparent" />
        {cells}
      </svg>
    </div>
  );
}

// ───────────────────────────────────────────────
// PieceSamplePreview — small piece visual for lobby slots + skin selector
// ───────────────────────────────────────────────
function PieceSamplePreview({ player = 1, skin = 'bronze', size = 36, withBackdrop = true }) {
  if (!withBackdrop) return <PieceShape player={player} size={size} skin={skin} />;
  return (
    <div className="web-piece" style={{
      width: size + 18, height: size + 18, borderRadius: 12,
      background: 'linear-gradient(135deg,#1a1a1a,#0a0a0a)',
      border: `1px solid ${HILL.border}`,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <PieceShape player={player} size={size} skin={skin} />
    </div>
  );
}

// ───────────────────────────────────────────────
// LeaderboardTable — full desktop table
// ───────────────────────────────────────────────
function LeaderboardTable({ rows = [] }) {
  return (
    <div style={{
      background: HILL.surface,
      border: `1px solid ${HILL.border}`,
      borderRadius: 16, overflow: 'hidden',
    }}>
      {/* sticky header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '64px 1fr 140px 90px 90px 100px 100px',
        gap: 16, alignItems: 'center',
        padding: '14px 22px',
        background: HILL.surface2,
        borderBottom: `1px solid ${HILL.border}`,
        position: 'sticky', top: 0,
        fontFamily: HILL.mono, fontSize: 10, fontWeight: 700,
        color: HILL.muted, letterSpacing: '0.18em',
      }}>
        <div>RANK</div>
        <div>PLAYER</div>
        <div>ARENA</div>
        <div style={{ textAlign: 'right' }}>WINS</div>
        <div style={{ textAlign: 'right' }}>GAMES</div>
        <div style={{ textAlign: 'right' }}>WIN RATE</div>
        <div style={{ textAlign: 'right' }}>ELO</div>
      </div>

      {rows.map((r, i) => {
        const rankColor = r.rank === 1 ? HILL.gold : r.rank === 2 ? HILL.silver : r.rank === 3 ? HILL.bronze : HILL.muted;
        return (
          <div key={r.rank} className="web-row" style={{
            display: 'grid',
            gridTemplateColumns: '64px 1fr 140px 90px 90px 100px 100px',
            gap: 16, alignItems: 'center',
            padding: '14px 22px',
            borderLeft: r.isYou ? `3px solid ${HILL.accent}` : '3px solid transparent',
            background: r.isYou ? 'rgba(191,255,0,0.04)' : 'transparent',
            borderBottom: i < rows.length - 1 ? `1px solid ${HILL.border}` : 'none',
            cursor: 'pointer',
          }}>
            <div className="hill-mono" style={{
              fontSize: r.rank <= 3 ? 22 : 16, fontWeight: 800, color: rankColor,
            }}>{r.rank}</div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg,#2a2a2a,#0f0f0f)',
                border: `1px solid ${HILL.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 14, color: HILL.text,
                flexShrink: 0,
              }}>{r.name[0].toUpperCase()}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: HILL.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</span>
                {r.isYou && <span style={{ fontSize: 9, color: HILL.accent, fontWeight: 800, letterSpacing: '0.1em' }}>YOU</span>}
                {r.badge && <span style={{ fontSize: 10, color: HILL.muted, fontFamily: HILL.mono, letterSpacing: '0.1em' }}>{r.badge}</span>}
              </div>
            </div>

            <div><ArenaBadge tier={r.tier} /></div>

            <div className="hill-mono" style={{ fontSize: 15, fontWeight: 700, textAlign: 'right', color: HILL.text }}>{r.wins}</div>
            <div className="hill-mono" style={{ fontSize: 14, fontWeight: 500, textAlign: 'right', color: HILL.muted }}>{r.games}</div>
            <div className="hill-mono" style={{ fontSize: 14, fontWeight: 500, textAlign: 'right', color: HILL.muted }}>{r.wr}%</div>
            <div className="hill-mono" style={{ fontSize: 15, fontWeight: 700, textAlign: 'right', color: r.rank <= 3 ? HILL.accent : HILL.text }}>{r.elo}</div>
          </div>
        );
      })}
    </div>
  );
}

// ───────────────────────────────────────────────
// FilterPill — used above leaderboard table
// ───────────────────────────────────────────────
function FilterPill({ active, children, leading = null }) {
  return (
    <div className={`web-pill ${active ? 'web-pill-active' : ''}`} style={{
      padding: '9px 16px', borderRadius: 999,
      background: active ? HILL.text : HILL.surface,
      color: active ? HILL.bg : HILL.muted,
      border: active ? 'none' : `1px solid ${HILL.border}`,
      fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em',
      cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', gap: 8,
    }}>
      {leading}{children}
    </div>
  );
}

// ───────────────────────────────────────────────
// SearchInput — top-right of leaderboard table
// ───────────────────────────────────────────────
function SearchInput({ placeholder = 'Search players', width = 260 }) {
  return (
    <div style={{
      width, height: 38,
      background: HILL.surface, border: `1px solid ${HILL.border}`,
      borderRadius: 10,
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '0 12px',
    }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={HILL.muted} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
      <input className="web-input" style={{
        flex: 1, background: 'transparent', border: 'none', outline: 'none',
        color: HILL.text, fontSize: 13, fontFamily: HILL.font,
      }} placeholder={placeholder} defaultValue="" />
      <span className="hill-mono" style={{
        fontSize: 10, color: HILL.dim, letterSpacing: '0.08em',
        padding: '2px 6px', border: `1px solid ${HILL.border}`, borderRadius: 4,
      }}>⌘ K</span>
    </div>
  );
}

// ───────────────────────────────────────────────
// SidePlayerPanel — vertical panel used flanking the board on desktop Hill game
// ───────────────────────────────────────────────
function SidePlayerPanel({ player, name, tier, eliminated, isActive, secondsLeft, secondsTotal = 10, you, alivePieces = 8, skin = 'bronze', alignment = 'left' }) {
  const color = [HILL.p1, HILL.p2, HILL.p3, HILL.p4][player - 1];
  return (
    <div style={{
      position: 'relative',
      background: HILL.surface,
      border: `1.5px solid ${isActive ? HILL.accent : HILL.border}`,
      borderRadius: 16,
      padding: '16px 16px 14px',
      width: 220,
      display: 'flex', flexDirection: 'column', gap: 12,
      opacity: eliminated ? 0.55 : 1,
      boxShadow: isActive ? '0 0 24px rgba(191,255,0,0.15)' : 'none',
      transition: 'border-color .15s, box-shadow .15s',
    }}>
      {/* color stripe — left or right */}
      <div style={{
        position: 'absolute', top: 0, bottom: 0, [alignment === 'left' ? 'left' : 'right']: 0, width: 3,
        background: color, opacity: eliminated ? 0.3 : 1,
      }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {isActive && secondsLeft != null ? (
          <TurnTimer seconds={secondsLeft} total={secondsTotal} size={50}>
            <PlayerDot player={player} size={26} skin={skin} />
          </TurnTimer>
        ) : (
          <div style={{
            width: 50, height: 50, borderRadius: 999,
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid rgba(255,255,255,0.06)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <PlayerDot player={player} size={26} skin={skin}/>
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 15, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textDecoration: eliminated ? 'line-through' : 'none' }}>{name}</span>
            {you && <span style={{ fontSize: 9, fontWeight: 700, color: HILL.accent, letterSpacing: '0.1em' }}>YOU</span>}
          </div>
          <div style={{ marginTop: 4 }}>
            {eliminated
              ? <span style={{ fontSize: 11, color: HILL.danger, fontWeight: 700, letterSpacing: '0.08em' }}>ELIMINATED</span>
              : <ArenaBadge tier={tier} />
            }
          </div>
        </div>
      </div>

      {/* piece count + skin sample row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 12px',
        background: HILL.surface2, borderRadius: 10,
        border: `1px solid ${HILL.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <PieceShape player={player} size={18} skin={skin}/>
          <span className="hill-mono" style={{ fontSize: 11, color: HILL.muted, letterSpacing: '0.08em' }}>PIECES</span>
        </div>
        <span className="hill-mono" style={{ fontSize: 18, fontWeight: 800, color: eliminated ? HILL.danger : HILL.text }}>{alivePieces}</span>
      </div>

      {isActive && (
        <div style={{
          fontFamily: HILL.mono, fontSize: 10, fontWeight: 700,
          color: HILL.accent, letterSpacing: '0.18em', textAlign: 'center',
        }}>● THINKING · {secondsLeft}s</div>
      )}
    </div>
  );
}

// Export
Object.assign(window, {
  TopNav, WebShell, Container, WebButton, WebFooter,
  FakeQrCode, PieceSamplePreview, LeaderboardTable,
  FilterPill, SearchInput, SidePlayerPanel,
});
