// app/profile/page.tsx
'use client';
import { useState } from 'react';
import { GoogleG } from '@/components/GoogleG';
import { PieceShape } from '@/components/PieceShape';
import { SkinCard } from '@/components/SkinCard';
import { TIER_META } from '@/lib/tiers';
import { SKINS, skinUnlocked, UNLOCK_WINS, type SkinId, type TierId } from '@/lib/skins';

const DEMO = {
  signedIn: true,
  email: 'aida.k@gmail.com',
  name: 'Aida K.',
  tier: 'Gold' as TierId,
  initialSkin: 'gold' as SkinId,
  stats: {
    wins: 88, games: 160, wr: 55, streak: 7, faveMode: 'BLITZ',
    longestStreak: '7 wins', bestRound: '12 pieces on hill',
    captured: '1,204', hillHeld: '14m 22s', kingsCrowned: '32', eliminated: '47 (29%)',
  },
};

export default function ProfilePage() {
  const [skin, setSkin] = useState<SkinId>(DEMO.initialSkin);
  const tierColor = TIER_META[DEMO.tier].color;

  const Identity = (
    <div>
      <div className="relative w-[110px] h-[110px] lg:w-[220px] lg:h-[220px] mx-auto">
        {/* Tier ring (desktop only — mobile uses a simpler 2px border) */}
        <div
          className="hidden lg:block absolute inset-0 rounded-full p-1"
          style={{ background: `conic-gradient(${tierColor} 0deg, ${tierColor} 220deg, var(--hill-border) 220deg, var(--hill-border) 360deg)` }}
        >
          <div className="w-full h-full rounded-full bg-gradient-to-br from-[#2a2a2a] to-[#0a0a0a] flex items-center justify-center text-[84px] font-black border-2 border-[var(--hill-bg)]">
            A
          </div>
        </div>
        {/* Mobile avatar */}
        <div className="lg:hidden w-full h-full rounded-full bg-gradient-to-br from-[#2a2a2a] to-[#0a0a0a] flex items-center justify-center text-[44px] font-extrabold border-2 border-[var(--hill-border)]">
          A
        </div>

        {DEMO.signedIn && (
          <div className="absolute -top-0.5 -right-0.5 lg:top-1.5 lg:right-1.5 w-6 h-6 lg:w-10 lg:h-10 rounded-full bg-[var(--hill-bg)] p-0.5 lg:p-1 border-[1.5px] border-[var(--hill-border)] flex items-center justify-center">
            <GoogleG size={16} className="lg:hidden"/>
            <GoogleG size={26} className="hidden lg:block"/>
          </div>
        )}

        <div className="absolute -bottom-1 -left-1 lg:-bottom-1 lg:-left-1 w-[38px] h-[38px] lg:w-[70px] lg:h-[70px] rounded-full bg-[var(--hill-bg)] border-[1.5px] lg:border-2 border-[var(--hill-borderHi)] flex items-center justify-center">
          <PieceShape player={1} size={24} skin={skin}/>
          <span className="lg:hidden"/>
        </div>

        {/* Mobile tier chip directly under avatar (desktop has its own under-avatar treatment) */}
        <div className="lg:hidden absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1.5 pl-2.5 rounded-full bg-[var(--hill-bg)] flex items-center gap-1.5 text-[11px] font-extrabold tracking-[0.12em] whitespace-nowrap"
             style={{ border: `1.5px solid ${tierColor}60`, color: tierColor }}>
          <span>{TIER_META[DEMO.tier].icon}</span> {DEMO.tier.toUpperCase()} · TIER III
        </div>
      </div>

      <div className="hidden lg:block text-center mt-4">
        <div
          className="inline-flex items-center gap-2 px-4 py-2 pl-3 rounded-full bg-[var(--hill-surface)] font-extrabold text-[13px] tracking-[0.14em]"
          style={{ border: `1.5px solid ${tierColor}50`, color: tierColor }}
        >
          <span className="text-base">{TIER_META[DEMO.tier].icon}</span>
          {DEMO.tier.toUpperCase()} · TIER III
        </div>
      </div>

      {DEMO.signedIn ? (
        <div className="mt-9 lg:mt-6">
          <div className="flex items-center gap-2.5 lg:gap-3 px-3.5 lg:px-4 py-2.5 lg:py-3.5 rounded-[10px] lg:rounded-xl border" style={{ background: 'rgba(191,255,0,0.04)', borderColor: 'rgba(191,255,0,0.2)' }}>
            <GoogleG size={16} className="lg:hidden"/>
            <GoogleG size={20} className="hidden lg:block"/>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-[var(--hill-muted)] tracking-[0.14em] font-bold">SIGNED IN AS</div>
              <div className="text-[13px] lg:text-sm font-semibold truncate">{DEMO.email}</div>
            </div>
            <button className="text-[11px] lg:text-xs text-[var(--hill-muted)] font-semibold tracking-[0.04em] hover:text-[var(--hill-text)]">
              Sign out
            </button>
          </div>
        </div>
      ) : (
        <button className="mt-9 w-full h-14 rounded-xl bg-[var(--hill-text)] text-[var(--hill-bg)] text-[15px] font-bold inline-flex items-center justify-center gap-2.5 transition lg:hover:brightness-95 lg:hover:-translate-y-0.5">
          <GoogleG size={20}/> Sign in with Google
        </button>
      )}
    </div>
  );

  const NameInput = (
    <div>
      <div className="text-[10px] font-bold text-[var(--hill-muted)] tracking-[0.18em] mb-2 lg:mb-2.5">DISPLAY NAME</div>
      <div className="flex items-center px-4 lg:px-5 py-3.5 lg:py-4 bg-[var(--hill-surface)] border border-[var(--hill-borderHi)] rounded-xl text-[17px] lg:text-[22px] font-bold lg:font-bold tracking-[-0.01em] transition focus-within:border-[var(--hill-accent)] focus-within:shadow-[0_0_0_3px_rgba(191,255,0,0.15)]">
        <input
          defaultValue={DEMO.name}
          className="flex-1 bg-transparent outline-none text-[var(--hill-text)]"
        />
        <span className="font-mono text-[11px] text-[var(--hill-dim)] tracking-[0.08em] ml-2 shrink-0">SAVED ✓</span>
      </div>
    </div>
  );

  const Stats = (
    <div className="grid grid-cols-3 lg:grid-cols-5 bg-[var(--hill-surface)] border border-[var(--hill-border)] rounded-[14px] overflow-hidden">
      {[
        ['TOTAL WINS', String(DEMO.stats.wins)],
        ['GAMES',      String(DEMO.stats.games)],
        ['WIN RATE',   `${DEMO.stats.wr}%`],
        // Hidden on mobile — only the 3-column subset shows there.
        ['STREAK',     String(DEMO.stats.streak)],
        ['FAVE MODE',  DEMO.stats.faveMode],
      ].map(([k, v], i, arr) => (
        <div
          key={k}
          className={[
            'p-4 lg:p-5 text-center',
            i < arr.length - 1 ? 'border-r border-[var(--hill-border)]' : '',
            // Mobile shows only first 3 cells; hide the rest at < lg
            i >= 3 ? 'hidden lg:block' : '',
            // The 3rd cell shouldn't have a right border on mobile (it's the last visible there)
            i === 2 ? 'lg:border-r border-r-0 lg:border-r-[var(--hill-border)]' : '',
          ].join(' ')}
        >
          <div className="font-mono text-[26px] lg:text-[32px] font-extrabold tracking-[-0.01em]">{v}</div>
          <div className="text-[10px] text-[var(--hill-muted)] tracking-[0.14em] lg:tracking-[0.16em] mt-1 font-bold">{k}</div>
        </div>
      ))}
    </div>
  );

  const Progress = (
    <div>
      <div className="flex justify-between font-mono text-[11px] text-[var(--hill-muted)] tracking-[0.08em] lg:tracking-[0.1em] mb-1.5 lg:mb-2">
        <span style={{ color: tierColor }}>{DEMO.tier.toUpperCase()} · TIER III</span>
        <span>1,996 / 2,236 ELO · 240 to <span className="text-[var(--hill-master)]">MASTER</span></span>
      </div>
      <div className="h-1.5 lg:h-2.5 rounded-sm bg-[var(--hill-surface)] overflow-hidden border border-[var(--hill-border)]">
        <div className="h-full" style={{ width: '62%', background: `linear-gradient(90deg, ${tierColor}, var(--hill-accent))`, boxShadow: '0 0 12px var(--hill-accent)' }}/>
      </div>
    </div>
  );

  const Skins = (
    <div>
      <div className="flex justify-between items-center mb-2 lg:mb-3">
        <div className="text-[10px] font-bold text-[var(--hill-muted)] tracking-[0.18em]">PIECE SKIN</div>
        <div className="font-mono text-[10px] text-[var(--hill-dim)] tracking-[0.08em] lg:tracking-[0.1em]">
          SHAPE STAYS THE SAME · 4 OF 5 UNLOCKED
        </div>
      </div>
      {/* Mobile: horizontal scrolling; desktop: 5-up grid */}
      <div className="hill-scroll flex gap-2 overflow-x-auto px-5 -mx-5 lg:grid lg:grid-cols-5 lg:gap-3 lg:px-0 lg:mx-0">
        {(Object.keys(SKINS) as SkinId[]).map(sk => {
          const unlocked = skinUnlocked(sk, DEMO.tier);
          const tier = SKINS[sk].tier;
          const unlockText = unlocked ? null : `Unlock at ${tier} · ${UNLOCK_WINS[tier]} wins`;
          return (
            <SkinCard
              key={sk}
              skinId={sk}
              samplePlayer={1}
              selected={skin === sk}
              locked={!unlocked}
              unlockText={unlockText}
              onClick={() => unlocked && setSkin(sk)}
            />
          );
        })}
      </div>
      <div className="mt-2 lg:mt-2 text-[11px] text-[var(--hill-muted)] font-mono tracking-[0.04em]">
        <span className="text-[var(--hill-accent)]">✓</span> Auto-saved · applies to all your pieces
      </div>
    </div>
  );

  const DetailedStats = (
    <div>
      <div className="text-[10px] font-bold text-[var(--hill-muted)] tracking-[0.18em] mb-2.5">DETAILED STATS</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5 lg:gap-2.5">
        {[
          ['Longest streak',      DEMO.stats.longestStreak],
          ['Best round (Blitz)',  DEMO.stats.bestRound],
          ['Pieces captured',     DEMO.stats.captured],
          ['Hill seconds held',   DEMO.stats.hillHeld],
          ['Kings crowned',       DEMO.stats.kingsCrowned],
          ['Times eliminated',    DEMO.stats.eliminated],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between items-center px-3.5 lg:px-4 py-3 lg:py-3.5 bg-[var(--hill-surface)] border border-[var(--hill-border)] rounded-[10px] text-[13px] lg:text-sm">
            <span className="text-[var(--hill-muted)]">{k}</span>
            <span className="font-mono font-bold text-[var(--hill-text)]">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-[1280px] px-5 lg:px-12 pt-6 lg:pt-12 pb-10 lg:pb-16">
      {/* Mobile header (TopBar would normally go here — TopNav covers desktop) */}
      <div className="lg:hidden text-[10px] font-bold text-[var(--hill-muted)] tracking-[0.18em] mb-5">PROFILE</div>

      {/* Desktop heading bar */}
      <div className="hidden lg:flex items-baseline gap-3.5 mb-7">
        <span className="font-mono text-[11px] font-bold text-[var(--hill-accent)] tracking-[0.24em]">· ME ·</span>
        <h1 className="font-display text-[72px] m-0 tracking-[-0.04em]">Profile</h1>
        <span className="flex-1"/>
        <div className="font-mono text-[11px] text-[var(--hill-dim)] tracking-[0.14em]">SAVED · <span className="text-[var(--hill-accent)]">✓</span></div>
      </div>

      {/* Layout: single column on mobile, 1fr/2fr split on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-9 lg:gap-12">
        <div className="flex flex-col items-center lg:items-stretch gap-6">
          {Identity}
        </div>
        <div className="flex flex-col gap-5 lg:gap-6">
          {NameInput}
          {Stats}
          {Progress}
          {Skins}
          {DetailedStats}
          <div className="flex lg:justify-end">
            <button className="h-12 lg:h-10 w-full lg:w-auto lg:px-4 rounded-xl bg-transparent text-[var(--hill-danger)] border text-sm lg:text-xs font-bold tracking-[0.04em] lg:tracking-[0.08em] transition lg:hover:border-[var(--hill-danger)]"
                    style={{ borderColor: 'rgba(255,59,48,0.25)' }}>
              RESET ACCOUNT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
