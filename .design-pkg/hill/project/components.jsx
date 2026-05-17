// HILL — shared components
// Brand tokens
const HILL = {
  bg: '#0A0A0A',
  surface: '#141414',
  surface2: '#1A1A1A',
  border: '#1F1F1F',
  borderHi: '#2A2A2A',
  text: '#FAFAFA',
  muted: '#808080',
  dim: '#525252',
  accent: '#BFFF00',
  accentDim: 'rgba(191,255,0,0.12)',
  danger: '#FF3B30',
  p1: '#FFFFFF',
  p2: '#1A1A1A',
  p3: '#FF2D87',
  p4: '#00D9FF',
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  master: '#9B59B6',
  champion: '#BFFF00',
  font: 'Inter, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace',
};

// Once-only style block. Inter from Google + JetBrains Mono.
if (typeof document !== 'undefined' && !document.getElementById('hill-styles')) {
  const linkPre = document.createElement('link');
  linkPre.rel = 'preconnect'; linkPre.href = 'https://fonts.gstatic.com'; linkPre.crossOrigin = '';
  document.head.appendChild(linkPre);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap';
  document.head.appendChild(link);

  const s = document.createElement('style');
  s.id = 'hill-styles';
  s.textContent = `
  .hill-root{font-family:${HILL.font};background:${HILL.bg};color:${HILL.text};font-feature-settings:"ss01","cv11";-webkit-font-smoothing:antialiased;letter-spacing:-0.01em}
  .hill-root *{box-sizing:border-box}
  .hill-mono{font-family:${HILL.mono};letter-spacing:0}
  .hill-display{font-weight:800;letter-spacing:-0.04em;line-height:0.9}
  @keyframes hill-pulse{0%,100%{opacity:0.55}50%{opacity:1}}
  @keyframes hill-glow{0%,100%{box-shadow:0 0 0 0 rgba(191,255,0,0.4),inset 0 0 12px rgba(191,255,0,0.18)}50%{box-shadow:0 0 28px 0 rgba(191,255,0,0.25),inset 0 0 18px rgba(191,255,0,0.32)}}
  @keyframes hill-spin{to{transform:rotate(360deg)}}
  @keyframes hill-rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  @keyframes hill-fadein{from{opacity:0}to{opacity:1}}
  .hill-scroll::-webkit-scrollbar{display:none}
  .hill-btn{cursor:pointer;border:none;font-family:inherit;font-weight:600;letter-spacing:-0.01em;transition:transform .08s ease,background .15s,opacity .15s}
  .hill-btn:active{transform:scale(0.98)}
  .hill-btn:disabled{opacity:0.4;cursor:not-allowed}
  `;
  document.head.appendChild(s);
}

// ───────────────────────────────────────────────
// Skin system — player chooses a skin from their unlocked tier.
// Skin overlay sits ON TOP of the player's base shape; never changes the
// shape (colorblind users still distinguish by shape).
// ───────────────────────────────────────────────
const SKINS = {
  bronze:   { name: 'Bronze',   tier: 'Bronze',   color: HILL.bronze,   tag: 'DEFAULT' },
  silver:   { name: 'Silver',   tier: 'Silver',   color: HILL.silver,   tag: 'GRADIENT' },
  gold:     { name: 'Gold',     tier: 'Gold',     color: HILL.gold,     tag: 'HALO' },
  master:   { name: 'Master',   tier: 'Master',   color: HILL.master,   tag: 'FACETS' },
  champion: { name: 'Champion', tier: 'Champion', color: HILL.champion, tag: 'CROWN' },
};
const TIER_RANK = { Bronze: 0, Silver: 1, Gold: 2, Master: 3, Champion: 4 };
function skinUnlocked(skinId, userTier) { return TIER_RANK[SKINS[skinId].tier] <= TIER_RANK[userTier]; }

// ───────────────────────────────────────────────
// Piece shapes (each player has a distinct shape for color-blindness)
// P1: circle, P2: square, P3: triangle, P4: hexagon
// Skins layer effects on top WITHOUT replacing the base color or shape.
// ───────────────────────────────────────────────
let __pieceIdCounter = 0;
function PieceShape({ player, size = 28, isKing = false, dimmed = false, skin = 'bronze' }) {
  const fill = [HILL.p1, HILL.p2, HILL.p3, HILL.p4][player - 1];
  const stroke = player === 2 ? '#3a3a3a' : 'rgba(0,0,0,0.35)';
  const innerShine = player === 2 ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.25)';
  const s = size;
  const half = s / 2;
  const uid = React.useMemo(() => `pc${++__pieceIdCounter}`, []);

  // Base shape factory — same path used as fill and as clipPath
  const buildShape = (props) => {
    if (player === 1) return <circle key="shape" cx={half} cy={half} r={half - 1.5} {...props} />;
    if (player === 2) return <rect key="shape" x={2} y={2} width={s - 4} height={s - 4} rx={s * 0.18} {...props} />;
    if (player === 3) {
      const pad = 2;
      const pts = `${half},${pad + 1} ${s - pad},${s - pad - 1} ${pad},${s - pad - 1}`;
      return <polygon key="shape" points={pts} strokeLinejoin="round" {...props} />;
    }
    const r = half - 1.5;
    const pts = [];
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 2;
      pts.push(`${half + r * Math.cos(a)},${half + r * Math.sin(a)}`);
    }
    return <polygon key="shape" points={pts.join(' ')} strokeLinejoin="round" {...props} />;
  };

  const isChampion = skin === 'champion';
  const isGold = skin === 'gold' || isChampion;
  const isMaster = skin === 'master';
  const isSilver = skin === 'silver';

  // Outer glow via drop-shadow on the SVG container
  const glowColor = isChampion ? HILL.accent : (skin === 'gold' ? '#FFD700' : isMaster ? '#B380E0' : null);
  const baseShadow = 'drop-shadow(0 1px 1px rgba(0,0,0,0.35))';
  const glow = glowColor
    ? `drop-shadow(0 0 ${Math.max(1.5, s * 0.14)}px ${glowColor}) drop-shadow(0 0 ${Math.max(3, s * 0.28)}px ${glowColor}99) ${baseShadow}`
    : baseShadow;

  return (
    <div style={{ position: 'relative', width: s, height: s, opacity: dimmed ? 0.35 : 1, filter: dimmed ? 'grayscale(0.6)' : 'none' }}>
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ display: 'block', filter: glow, overflow: 'visible' }}>
        <defs>
          <clipPath id={`clip-${uid}`}>{buildShape({ fill: '#000' })}</clipPath>
          <linearGradient id={`silver-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.35" />
          </linearGradient>
          <radialGradient id={`gold-${uid}`} cx="50%" cy="38%" r="60%">
            <stop offset="0" stopColor="#FFF1A8" stopOpacity="0.85" />
            <stop offset="0.5" stopColor="#FFD700" stopOpacity="0.35" />
            <stop offset="1" stopColor="#FFD700" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`champ-${uid}`} cx="50%" cy="40%" r="65%">
            <stop offset="0" stopColor="#FAFFD6" stopOpacity="0.85" />
            <stop offset="0.6" stopColor="#BFFF00" stopOpacity="0.35" />
            <stop offset="1" stopColor="#BFFF00" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* base shape (player color + shape stays untouched) */}
        {buildShape({ fill, stroke, strokeWidth: 1.5 })}

        {/* Silver: vertical gradient overlay clipped to shape */}
        {isSilver && (
          <g clipPath={`url(#clip-${uid})`}>
            <rect x="0" y="0" width={s} height={s} fill={`url(#silver-${uid})`} />
          </g>
        )}

        {/* Gold / Champion: warm radial sheen on top */}
        {(skin === 'gold' || isChampion) && (
          <g clipPath={`url(#clip-${uid})`}>
            <rect x="0" y="0" width={s} height={s} fill={`url(#${isChampion ? 'champ' : 'gold'}-${uid})`} />
          </g>
        )}

        {/* Master: gem-style facets — internal diamond + ridge lines */}
        {isMaster && (
          <g clipPath={`url(#clip-${uid})`}>
            <polygon
              points={`${half},${half - s * 0.22} ${half + s * 0.18},${half} ${half},${half + s * 0.22} ${half - s * 0.18},${half}`}
              fill="rgba(255,255,255,0.32)"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth={Math.max(0.4, s * 0.018)}
            />
            <line x1={half} y1={half - s * 0.22} x2={half} y2={2}    stroke="rgba(255,255,255,0.25)" strokeWidth={Math.max(0.4, s * 0.022)} />
            <line x1={half + s * 0.18} y1={half} x2={s - 2} y2={half} stroke="rgba(0,0,0,0.25)"       strokeWidth={Math.max(0.4, s * 0.022)} />
            <line x1={half} y1={half + s * 0.22} x2={half} y2={s - 2} stroke="rgba(0,0,0,0.18)"       strokeWidth={Math.max(0.4, s * 0.022)} />
            <line x1={half - s * 0.18} y1={half} x2={2} y2={half}     stroke="rgba(255,255,255,0.2)"  strokeWidth={Math.max(0.4, s * 0.022)} />
          </g>
        )}

        {/* base top highlight (after overlays so it sells the form) */}
        <g clipPath={isMaster ? `url(#clip-${uid})` : undefined}>
          <ellipse cx={half} cy={half * 0.55} rx={half * 0.55} ry={half * 0.22} fill={innerShine} />
        </g>

        {/* Master sparkle */}
        {isMaster && s >= 14 && (
          <g transform={`translate(${s * 0.74}, ${s * 0.24})`} style={{ pointerEvents: 'none' }}>
            <circle r={Math.max(0.8, s * 0.045)} fill="#fff" />
            <line x1="0" y1={-s * 0.11} x2="0" y2={s * 0.11} stroke="#fff" strokeWidth={Math.max(0.5, s * 0.022)} strokeLinecap="round" />
            <line x1={-s * 0.11} y1="0" x2={s * 0.11} y2="0" stroke="#fff" strokeWidth={Math.max(0.5, s * 0.022)} strokeLinecap="round" />
          </g>
        )}
      </svg>

      {/* Champion: small crown ✦ icon top-right corner */}
      {isChampion && (
        <div style={{
          position: 'absolute', top: -s * 0.08, right: -s * 0.1,
          width: s * 0.5, height: s * 0.5,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: s * 0.34, lineHeight: 1,
          color: HILL.accent, fontWeight: 900,
          textShadow: '0 0 6px rgba(191,255,0,0.85)',
          pointerEvents: 'none',
        }}>✦</div>
      )}

      {/* King marker (centered above) — same glyph, different position than champion */}
      {isKing && (
        <div style={{
          position: 'absolute', top: -s * 0.22, left: '50%', transform: 'translateX(-50%)',
          fontSize: s * 0.42, lineHeight: 1, color: HILL.accent,
          textShadow: '0 0 6px rgba(191,255,0,0.7)', fontWeight: 900,
          pointerEvents: 'none',
        }}>✦</div>
      )}
    </div>
  );
}

// ───────────────────────────────────────────────
// Board — N×N checkers grid with optional center "Hill" zone
// ───────────────────────────────────────────────
function Board({ size = 8, pieces = [], centerZone = [], highlighted = [], selected = null, lastMove = null, cellSize = null, skinForPlayer = {} }) {
  const cs = cellSize || (size === 10 ? 33 : 41);
  const total = size * cs;
  const isCenter = (r, c) => centerZone.some(([a, b]) => a === r && b === c);
  const isHi = (r, c) => highlighted.some(([a, b]) => a === r && b === c);
  const isSel = (r, c) => selected && selected[0] === r && selected[1] === c;
  const isLast = (r, c) => lastMove && lastMove.some(([a, b]) => a === r && b === c);

  // Coordinate labels (1-8 / a-h style) — subtle
  return (
    <div style={{
      position: 'relative', width: total, height: total,
      background: HILL.surface,
      borderRadius: 6, padding: 0, overflow: 'hidden',
      boxShadow: '0 0 0 1px ' + HILL.borderHi + ', 0 20px 40px rgba(0,0,0,0.5), 0 0 0 6px ' + HILL.surface,
    }}>
      {/* squares */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${size}, ${cs}px)`, gridTemplateRows: `repeat(${size}, ${cs}px)` }}>
        {Array.from({ length: size * size }).map((_, i) => {
          const r = Math.floor(i / size);
          const c = i % size;
          const dark = (r + c) % 2 === 1;
          const bg = dark ? '#1A1A1A' : '#262626';
          return <div key={i} style={{ background: bg, position: 'relative' }} />;
        })}
      </div>

      {/* hill zone outline */}
      {centerZone.length > 0 && (() => {
        const rs = centerZone.map(p => p[0]); const cs2 = centerZone.map(p => p[1]);
        const top = Math.min(...rs) * cs; const left = Math.min(...cs2) * cs;
        const h = (Math.max(...rs) - Math.min(...rs) + 1) * cs;
        const w = (Math.max(...cs2) - Math.min(...cs2) + 1) * cs;
        return (
          <div style={{
            position: 'absolute', top, left, width: w, height: h,
            border: `1.5px solid ${HILL.accent}`,
            background: `linear-gradient(135deg, rgba(191,255,0,0.06), rgba(191,255,0,0.02))`,
            animation: 'hill-glow 2.4s ease-in-out infinite',
            pointerEvents: 'none',
            borderRadius: 3,
          }}>
            <div style={{
              position: 'absolute', top: 3, left: 5,
              fontFamily: HILL.mono, fontSize: 8, fontWeight: 700,
              color: HILL.accent, letterSpacing: '0.12em',
              opacity: 0.9,
            }}>HILL</div>
          </div>
        );
      })()}

      {/* highlighted move targets */}
      {highlighted.map(([r, c], i) => (
        <div key={`h${i}`} style={{
          position: 'absolute', top: r * cs + cs * 0.35, left: c * cs + cs * 0.35,
          width: cs * 0.3, height: cs * 0.3, borderRadius: '50%',
          background: HILL.accent, opacity: 0.6,
          boxShadow: `0 0 8px ${HILL.accent}`,
          pointerEvents: 'none',
        }} />
      ))}

      {/* selected square ring */}
      {selected && (
        <div style={{
          position: 'absolute', top: selected[0] * cs, left: selected[1] * cs,
          width: cs, height: cs,
          boxShadow: `inset 0 0 0 2px ${HILL.accent}`,
          pointerEvents: 'none',
        }} />
      )}

      {/* last move trace */}
      {lastMove && lastMove.map(([r, c], i) => (
        <div key={`l${i}`} style={{
          position: 'absolute', top: r * cs, left: c * cs, width: cs, height: cs,
          background: 'rgba(191,255,0,0.08)',
          pointerEvents: 'none',
        }} />
      ))}

      {/* pieces */}
      {pieces.map((p, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: p.pos[0] * cs + (cs - cs * 0.7) / 2,
          left: p.pos[1] * cs + (cs - cs * 0.7) / 2,
          width: cs * 0.7, height: cs * 0.7,
          transition: 'top .25s ease, left .25s ease',
        }}>
          <PieceShape
            player={p.player}
            size={cs * 0.7}
            isKing={p.kind === 'king'}
            dimmed={p.dimmed}
            skin={p.skin || skinForPlayer[p.player] || 'bronze'}
          />
        </div>
      ))}
    </div>
  );
}

// ───────────────────────────────────────────────
// ArenaBadge — tier chip
// ───────────────────────────────────────────────
const TIER_META = {
  Bronze:   { color: HILL.bronze,   icon: '🥉', short: 'Bronze' },
  Silver:   { color: HILL.silver,   icon: '🥈', short: 'Silver' },
  Gold:     { color: HILL.gold,     icon: '🥇', short: 'Gold' },
  Master:   { color: HILL.master,   icon: '◆',  short: 'Master' },
  Champion: { color: HILL.champion, icon: '👑', short: 'Champion' },
};
function ArenaBadge({ tier = 'Bronze', size = 'sm', label = true }) {
  const m = TIER_META[tier];
  const sm = size === 'sm';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: sm ? 4 : 6,
      padding: sm ? '2px 7px 2px 5px' : '4px 10px 4px 8px',
      borderRadius: 999,
      background: 'rgba(255,255,255,0.04)',
      border: `1px solid ${m.color}40`,
      fontSize: sm ? 10 : 12,
      fontWeight: 600,
      color: m.color,
      letterSpacing: 0.2,
      textTransform: 'uppercase',
      lineHeight: 1,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ fontSize: sm ? 10 : 13, filter: tier === 'Master' ? 'none' : 'none' }}>{m.icon}</span>
      {label && <span>{m.short}</span>}
    </span>
  );
}

// ───────────────────────────────────────────────
// CTAButton
// ───────────────────────────────────────────────
function CTAButton({ variant = 'primary', children, onClick, disabled, full = true, style = {} }) {
  const primary = variant === 'primary';
  const danger = variant === 'danger';
  const ghost = variant === 'ghost';
  return (
    <button className="hill-btn" disabled={disabled} onClick={onClick} style={{
      width: full ? '100%' : 'auto',
      height: 54,
      padding: '0 24px',
      borderRadius: 12,
      background: primary ? HILL.accent : danger ? 'transparent' : ghost ? 'transparent' : 'transparent',
      color: primary ? '#0A0A0A' : danger ? HILL.danger : HILL.text,
      border: primary ? 'none' : `1.5px solid ${danger ? HILL.danger + '60' : HILL.borderHi}`,
      fontSize: 17, fontWeight: 700,
      letterSpacing: '-0.01em',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      ...style,
    }}>
      {children}
    </button>
  );
}

// ───────────────────────────────────────────────
// Sticky top bar (mobile) — back + optional room code
// ───────────────────────────────────────────────
function TopBar({ onBack = true, code, right, title }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 16px 12px',
      background: HILL.bg,
      borderBottom: `1px solid ${HILL.border}`,
      position: 'sticky', top: 0, zIndex: 5,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {onBack && (
          <button className="hill-btn" style={{
            width: 36, height: 36, borderRadius: 10,
            background: HILL.surface, border: `1px solid ${HILL.border}`,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: HILL.text,
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5"/></svg>
          </button>
        )}
        {code && (
          <div style={{
            fontFamily: HILL.mono, fontSize: 12, fontWeight: 700,
            color: HILL.muted, letterSpacing: '0.18em',
          }}>ROOM · <span style={{ color: HILL.text }}>{code}</span></div>
        )}
        {title && <div style={{ fontSize: 15, fontWeight: 600 }}>{title}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{right}</div>
    </div>
  );
}

// ───────────────────────────────────────────────
// Player dot (small color+shape glyph for panels)
// ───────────────────────────────────────────────
function PlayerDot({ player, size = 20, skin = 'bronze' }) {
  return <PieceShape player={player} size={size} skin={skin} />;
}

// ───────────────────────────────────────────────
// TurnTimer — circular countdown ring
// ───────────────────────────────────────────────
function TurnTimer({ seconds = 10, total = 10, size = 44, color = HILL.accent, children }) {
  const r = (size - 4) / 2;
  const c = 2 * Math.PI * r;
  const pct = seconds / total;
  const off = c * (1 - pct);
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="2.5"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.9s linear' }}
        />
      </svg>
      {children}
    </div>
  );
}

// ───────────────────────────────────────────────
// PlayerSlot (for lobby + in-game panel)
// ───────────────────────────────────────────────
function PlayerSlot({ player, name, tier, isHost, empty, eliminated, isActive, secondsLeft, secondsTotal = 10, you, compact = false, skin = 'bronze' }) {
  const color = [HILL.p1, HILL.p2, HILL.p3, HILL.p4][player - 1];
  return (
    <div style={{
      position: 'relative',
      background: HILL.surface,
      border: `1.5px solid ${isActive ? HILL.accent : empty ? 'rgba(255,255,255,0.06)' : HILL.border}`,
      borderRadius: 14,
      padding: compact ? '10px 12px' : '14px',
      minHeight: compact ? 64 : 88,
      display: 'flex', alignItems: 'center', gap: compact ? 10 : 12,
      overflow: 'hidden',
      opacity: eliminated ? 0.55 : 1,
      transition: 'border-color .15s',
    }}>
      {/* color stripe accent */}
      <div style={{
        position: 'absolute', top: 0, bottom: 0, left: 0, width: 3,
        background: empty ? 'transparent' : color,
        opacity: eliminated ? 0.3 : 1,
      }} />

      {/* dot / timer */}
      {isActive && secondsLeft != null ? (
        <TurnTimer seconds={secondsLeft} total={secondsTotal} size={compact ? 36 : 44}>
          <PlayerDot player={player} size={compact ? 18 : 22} skin={skin} />
        </TurnTimer>
      ) : (
        <div style={{
          width: compact ? 36 : 44, height: compact ? 36 : 44,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(255,255,255,0.03)', borderRadius: 999,
          border: empty ? `1px dashed ${HILL.borderHi}` : '1px solid rgba(255,255,255,0.06)',
        }}>
          {empty ? <span style={{ color: HILL.dim, fontSize: 18, lineHeight: 1 }}>+</span> : <PlayerDot player={player} size={compact ? 18 : 22} skin={skin} />}
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontSize: compact ? 14 : 15, fontWeight: 700,
            color: empty ? HILL.dim : HILL.text,
            textDecoration: eliminated ? 'line-through' : 'none',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{empty ? 'Waiting…' : name}</span>
          {you && !empty && <span style={{ fontSize: 9, fontWeight: 700, color: HILL.accent, letterSpacing: '0.1em' }}>YOU</span>}
          {isHost && !empty && <span style={{ fontSize: 9, fontWeight: 700, color: HILL.muted, letterSpacing: '0.1em' }}>HOST</span>}
        </div>
        <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
          {empty ? (
            <span style={{ fontSize: 11, color: HILL.dim, fontFamily: HILL.mono }}>Slot P{player} · open</span>
          ) : eliminated ? (
            <span style={{ fontSize: 11, color: HILL.danger, fontWeight: 700, letterSpacing: '0.08em' }}>ELIMINATED</span>
          ) : (
            <ArenaBadge tier={tier} />
          )}
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────
// RoundCounter
// ───────────────────────────────────────────────
function RoundCounter({ current, max, mode = 'blitz' }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '6px 10px 6px 8px',
      background: HILL.surface,
      border: `1px solid ${HILL.border}`,
      borderRadius: 999,
      fontSize: 12, fontWeight: 600,
      color: HILL.muted, letterSpacing: '0.04em',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: HILL.accent, boxShadow: `0 0 6px ${HILL.accent}` }} />
      <span>ROUND</span>
      <span className="hill-mono" style={{ color: HILL.text, fontWeight: 700 }}>
        {current}{max != null ? <span style={{ color: HILL.dim }}> / {max}</span> : null}
      </span>
      <span style={{ color: HILL.dim, paddingLeft: 4, borderLeft: `1px solid ${HILL.border}`, marginLeft: 2 }}>
        {mode === 'blitz' ? 'BLITZ' : 'SURVIVAL'}
      </span>
    </div>
  );
}

// ───────────────────────────────────────────────
// RoomCodeDisplay
// ───────────────────────────────────────────────
function RoomCodeDisplay({ code = 'ABCD' }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: HILL.muted, letterSpacing: '0.24em' }}>ROOM CODE</div>
      <div className="hill-mono" style={{
        marginTop: 6,
        fontSize: 56, fontWeight: 700, color: HILL.text,
        letterSpacing: '0.08em',
        textShadow: `0 0 24px rgba(191,255,0,0.15)`,
      }}>{code}</div>
    </div>
  );
}

// ───────────────────────────────────────────────
// ModeCard
// ───────────────────────────────────────────────
function ModeCard({ mode = 'blitz', selected, onClick }) {
  const isBlitz = mode === 'blitz';
  return (
    <div onClick={onClick} className="hill-btn" style={{
      position: 'relative',
      padding: '20px 18px',
      background: selected ? 'rgba(191,255,0,0.04)' : HILL.surface,
      border: `1.5px solid ${selected ? HILL.accent : HILL.border}`,
      borderRadius: 16,
      cursor: 'pointer',
      transition: 'all .18s',
      boxShadow: selected ? '0 0 24px rgba(191,255,0,0.15)' : 'none',
      textAlign: 'left',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: isBlitz ? 'rgba(191,255,0,0.08)' : 'rgba(255,59,48,0.08)',
            border: `1px solid ${isBlitz ? 'rgba(191,255,0,0.3)' : 'rgba(255,59,48,0.3)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22,
            color: isBlitz ? HILL.accent : HILL.danger,
          }}>
            {isBlitz ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L4 14h7l-2 8 9-12h-7l2-8z"/></svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="11" r="2"/><circle cx="15" cy="11" r="2"/><path d="M6 18c0-2 0-6 6-6s6 4 6 6"/><circle cx="12" cy="12" r="9.5"/></svg>
            )}
          </div>
          <div>
            <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.02em' }}>
              {isBlitz ? 'BLITZ' : 'SURVIVAL'}
            </div>
            <div style={{ fontSize: 12, color: HILL.muted, marginTop: 2, fontFamily: HILL.mono, letterSpacing: '0.04em' }}>
              {isBlitz ? '~3 MIN' : '~5-7 MIN'}
            </div>
          </div>
        </div>
        <div style={{
          width: 22, height: 22, borderRadius: '50%',
          border: `1.5px solid ${selected ? HILL.accent : HILL.borderHi}`,
          background: selected ? HILL.accent : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {selected && <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#0A0A0A" strokeWidth="2.5" strokeLinecap="round"><path d="M2 6l3 3 5-6"/></svg>}
        </div>
      </div>
      <div style={{ fontSize: 14, color: HILL.text, marginTop: 14, lineHeight: 1.45 }}>
        {isBlitz
          ? '7 rounds. Multiple kings can rule. Most pieces on the Hill at the bell wins the round.'
          : 'Last player with pieces wins. Tighter board pressure, slower burn — outlast everyone.'}
      </div>
      <div style={{
        display: 'flex', gap: 14, marginTop: 14, paddingTop: 14,
        borderTop: `1px solid ${HILL.border}`,
        fontSize: 11, color: HILL.muted, fontFamily: HILL.mono, letterSpacing: '0.04em',
      }}>
        <span>{isBlitz ? '10s / TURN' : '15s / TURN'}</span>
        <span style={{ color: HILL.border }}>·</span>
        <span>{isBlitz ? '7 ROUNDS' : 'NO LIMIT'}</span>
        <span style={{ color: HILL.border }}>·</span>
        <span>2–4 PLAYERS</span>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────
// BottomNav — fixed mobile tab bar (3 tabs)
// Visible on /, /leaderboard, /profile
// ───────────────────────────────────────────────
function BottomNav({ active = 'hill' }) {
  const tabs = [
    { id: 'hill', label: 'HILL', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 19l5-8 4 5 3-4 6 7"/><path d="M3 19h18"/>
      </svg>
    ) },
    { id: 'top', label: 'TOP', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 4h10v4a5 5 0 01-10 0V4z"/><path d="M7 4H4v2a3 3 0 003 3M17 4h3v2a3 3 0 01-3 3"/><path d="M9 13h6l-1 4h-4l-1-4zM8 21h8"/>
      </svg>
    ) },
    { id: 'me', label: 'ME', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6"/>
      </svg>
    ) },
  ];
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      background: HILL.surface,
      borderTop: `1px solid ${HILL.border}`,
      paddingBottom: 28, // safe-area-inset-bottom approximation
      paddingTop: 8,
      display: 'flex',
      zIndex: 10,
    }}>
      {tabs.map((t) => {
        const isActive = active === t.id;
        return (
          <div key={t.id} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            color: isActive ? HILL.accent : HILL.muted,
            position: 'relative',
            padding: '6px 0 4px',
            minHeight: 44,
          }}>
            {isActive && <div style={{
              position: 'absolute', top: -8, width: 28, height: 3, borderRadius: 2,
              background: HILL.accent, boxShadow: `0 0 8px ${HILL.accent}`,
            }} />}
            <div style={{
              filter: isActive ? `drop-shadow(0 0 4px ${HILL.accent}60)` : 'none',
            }}>{t.icon}</div>
            <div style={{
              fontSize: 10, fontWeight: 800, letterSpacing: '0.18em',
            }}>{t.label}</div>
          </div>
        );
      })}
    </div>
  );
}

// ───────────────────────────────────────────────
// Google G icon (full color) — for sign-in
// ───────────────────────────────────────────────
function GoogleG({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" style={{ display: 'block' }}>
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.6 8.4 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.3C29.2 35 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4 5.6l6.2 5.3c-.4.3 6.5-4.7 6.5-15 0-1.3-.1-2.6-.4-3.9z"/>
    </svg>
  );
}

// ───────────────────────────────────────────────
// SkinCard — horizontal card for the profile skin selector
// ───────────────────────────────────────────────
function SkinCard({ skinId, samplePlayer = 1, selected, locked, unlockText }) {
  const meta = SKINS[skinId];
  return (
    <div className="hill-btn" style={{
      position: 'relative',
      minWidth: 116, padding: '14px 12px 12px',
      background: selected ? 'rgba(191,255,0,0.05)' : HILL.surface,
      border: `1.5px solid ${selected ? HILL.accent : HILL.border}`,
      borderRadius: 14,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      boxShadow: selected ? '0 0 18px rgba(191,255,0,0.12)' : 'none',
      opacity: locked ? 0.55 : 1,
      flexShrink: 0,
    }}>
      {/* Sample piece */}
      <div style={{
        width: 56, height: 56, borderRadius: 12,
        background: locked ? 'rgba(255,255,255,0.03)' : 'linear-gradient(135deg,#1f1f1f,#0f0f0f)',
        border: `1px solid ${HILL.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', filter: locked ? 'grayscale(0.7) brightness(0.7)' : 'none',
      }}>
        <PieceShape player={samplePlayer} size={32} skin={skinId} />
        {locked && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(10,10,10,0.55)', borderRadius: 12,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={HILL.muted} strokeWidth="2" strokeLinecap="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>
          </div>
        )}
      </div>

      {/* name + tag */}
      <div style={{ textAlign: 'center', minHeight: 28 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: HILL.text, letterSpacing: '-0.01em' }}>{meta.name}</div>
        <div className="hill-mono" style={{ fontSize: 9, color: meta.color, letterSpacing: '0.14em', marginTop: 2 }}>
          {meta.tag}
        </div>
      </div>

      {/* status pill */}
      {selected && !locked && (
        <div style={{
          fontSize: 9, fontWeight: 800, letterSpacing: '0.14em',
          color: HILL.bg, background: HILL.accent,
          padding: '3px 6px', borderRadius: 4,
        }}>SELECTED</div>
      )}
      {locked && unlockText && (
        <div style={{
          fontSize: 9, color: HILL.muted, fontFamily: HILL.mono,
          letterSpacing: '0.08em', textAlign: 'center', lineHeight: 1.3,
        }}>{unlockText}</div>
      )}
      {!selected && !locked && (
        <div style={{ fontSize: 9, color: HILL.muted, fontFamily: HILL.mono, letterSpacing: '0.14em' }}>TAP</div>
      )}
    </div>
  );
}

// Export everything
Object.assign(window, {
  HILL, PieceShape, Board, ArenaBadge, CTAButton, TopBar,
  PlayerDot, TurnTimer, PlayerSlot, RoundCounter, RoomCodeDisplay, ModeCard, TIER_META,
  BottomNav, GoogleG,
  SKINS, TIER_RANK, skinUnlocked, SkinCard,
});
