// app/profile/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { GoogleG } from '@/components/GoogleG';
import { PieceShape } from '@/components/PieceShape';
import { SkinCard } from '@/components/SkinCard';
import { useAuth, signInToLinkedGoogle } from '@/lib/auth';
import { TIER_META } from '@/lib/tiers';
import { getTierProgress, TIER_ELO_THRESHOLDS } from '@/lib/arena';
import { EloInfoModal } from '@/components/EloInfoModal';
import {
  SKINS,
  PREMIUM_SKIN_IDS,
  skinUnlocked,
  SKIN_REQUIREMENTS,
  type SkinId,
  type TierSkinId,
} from '@/lib/skins';
import { PREMIUM_SKIN_PRICES } from '@/lib/stripe-products';
import { startSkinCheckout } from '@/lib/db/checkout';

// Stats the profile/schema does not (yet) track. Shown as honest placeholders
// rather than fabricated numbers.
const NA = '—';

export default function ProfilePage() {
  const {
    user,
    profile,
    loading,
    changeName,
    selectSkin,
    resetAccount,
    linkGoogle,
    logout,
  } = useAuth();
  const [skinSel, setSkinSel] = useState<SkinId | null>(null);
  const [buying, setBuying] = useState<string | null>(null);
  const [buyErr, setBuyErr] = useState<string | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  // A Google account already linked to another HILL profile only surfaces
  // AFTER the OAuth round-trip, as ?error_code=identity_already_exists (query
  // or hash) back on this page. Auto-recover with no UI: strip the param so a
  // refresh doesn't re-trigger, then sign straight into that existing profile
  // via plain OAuth (no linkIdentity → can't loop on the same conflict).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const search = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const code = search.get('error_code') ?? hash.get('error_code');
    if (code === 'identity_already_exists') {
      window.history.replaceState({}, '', '/profile');
      void signInToLinkedGoogle();
    }
  }, []);

  if (loading || !profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center font-mono text-[12px] tracking-[0.18em] text-[var(--hill-muted)]">
        LOADING…
      </div>
    );
  }

  const signedIn = !!user && !user.is_anonymous;
  const tier = profile.arenaTier;
  const tierColor = TIER_META[tier].color;
  const skin: SkinId = skinSel ?? profile.selectedSkin;
  const avatarLetter = profile.displayName.charAt(0).toUpperCase() || 'H';

  const wins = profile.totalWins;
  const games = profile.totalGames;
  const winRate = games > 0 ? Math.round((wins / games) * 100) : 0;
  const ownedPremium = profile.ownedSkins;
  const tierUnlockedCount = (Object.keys(SKINS) as TierSkinId[]).filter((sk) =>
    skinUnlocked(sk, tier),
  ).length;
  const unlockedCount = tierUnlockedCount + ownedPremium.length;
  const totalSkins = Object.keys(SKINS).length + PREMIUM_SKIN_IDS.length;

  const pickSkin = (sk: SkinId) => {
    setSkinSel(sk);
    void selectSkin(sk);
  };

  const buySkin = async (sk: string) => {
    setBuyErr(null);
    setBuying(sk);
    const r = await startSkinCheckout(sk);
    // On success the helper navigates away to Stripe; only reached on failure.
    if (!r.ok) {
      setBuyErr(r.error);
      setBuying(null);
    }
  };

  const Identity = (
    <div>
      <div className="relative w-[110px] h-[110px] lg:w-[220px] lg:h-[220px] mx-auto">
        {/* Tier ring (desktop only — mobile uses a simpler 2px border) */}
        <div
          className="hidden lg:block absolute inset-0 rounded-full p-1"
          style={{ background: `conic-gradient(${tierColor} 0deg, ${tierColor} 220deg, var(--hill-border) 220deg, var(--hill-border) 360deg)` }}
        >
          <div className="w-full h-full rounded-full bg-gradient-to-br from-[#2a2a2a] to-[#0a0a0a] flex items-center justify-center text-[84px] font-black border-2 border-[var(--hill-bg)]">
            {avatarLetter}
          </div>
        </div>
        {/* Mobile avatar */}
        <div className="lg:hidden w-full h-full rounded-full bg-gradient-to-br from-[#2a2a2a] to-[#0a0a0a] flex items-center justify-center text-[44px] font-extrabold border-2 border-[var(--hill-border)]">
          {avatarLetter}
        </div>

        {signedIn && (
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
          <span>{TIER_META[tier].icon}</span> {tier.toUpperCase()}
        </div>
      </div>

      <div className="hidden lg:block text-center mt-4">
        <div
          className="inline-flex items-center gap-2 px-4 py-2 pl-3 rounded-full bg-[var(--hill-surface)] font-extrabold text-[13px] tracking-[0.14em]"
          style={{ border: `1.5px solid ${tierColor}50`, color: tierColor }}
        >
          <span className="text-base">{TIER_META[tier].icon}</span>
          {tier.toUpperCase()}
        </div>
      </div>

      {signedIn ? (
        <div className="mt-9 lg:mt-6">
          <div className="flex items-center gap-2.5 lg:gap-3 px-3.5 lg:px-4 py-2.5 lg:py-3.5 rounded-[10px] lg:rounded-xl border" style={{ background: 'rgba(191,255,0,0.04)', borderColor: 'rgba(191,255,0,0.2)' }}>
            <GoogleG size={16} className="lg:hidden"/>
            <GoogleG size={20} className="hidden lg:block"/>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-[var(--hill-muted)] tracking-[0.14em] font-bold">SIGNED IN AS</div>
              <div className="text-[13px] lg:text-sm font-semibold truncate">{profile.email ?? 'Linked account'}</div>
            </div>
            <button
              onClick={() => void logout()}
              className="text-[11px] lg:text-xs text-[var(--hill-muted)] font-semibold tracking-[0.04em] hover:text-[var(--hill-text)]"
            >
              Sign out
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => void linkGoogle()}
          className="mt-9 w-full h-14 rounded-xl bg-[var(--hill-text)] text-[var(--hill-bg)] text-[15px] font-bold inline-flex items-center justify-center gap-2.5 transition lg:hover:brightness-95 lg:hover:-translate-y-0.5"
        >
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
          defaultValue={profile.displayName}
          onBlur={(e) => {
            const v = e.target.value.trim();
            if (v && v !== profile.displayName) void changeName(v);
          }}
          className="flex-1 bg-transparent outline-none text-[var(--hill-text)]"
        />
      </div>
    </div>
  );

  const Stats = (
    <div className="grid grid-cols-3 lg:grid-cols-5 bg-[var(--hill-surface)] border border-[var(--hill-border)] rounded-[14px] overflow-hidden">
      {[
        ['TOTAL WINS', String(wins)],
        ['GAMES',      String(games)],
        ['WIN RATE',   `${winRate}%`],
        // Hidden on mobile — only the 3-column subset shows there.
        ['STREAK',     NA],
        ['FAVE MODE',  NA],
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

  const prog = getTierProgress(profile.elo);
  const nextFloor = prog.nextTier ? TIER_ELO_THRESHOLDS[prog.nextTier] : null;
  const Progress = (
    <div>
      <div className="flex justify-between font-mono text-[11px] text-[var(--hill-muted)] tracking-[0.08em] lg:tracking-[0.1em] mb-1.5 lg:mb-2">
        <span style={{ color: tierColor }}>
          {prog.nextTier && nextFloor !== null
            ? `${prog.currentTier.toUpperCase()} · ${profile.elo} / ${nextFloor} ELO`
            : `CHAMPION · MAX TIER · ${profile.elo} ELO`}
        </span>
        {prog.nextTier && (
          <span>
            {prog.nextTier.toUpperCase()} in {prog.eloToNext}
          </span>
        )}
      </div>
      <div className="h-1.5 lg:h-2.5 rounded-sm bg-[var(--hill-surface)] overflow-hidden border border-[var(--hill-border)]">
        <div
          className="h-full transition-[width] duration-700"
          style={{
            width: `${prog.progressPct}%`,
            background: `linear-gradient(90deg, ${tierColor}, var(--hill-accent))`,
          }}
        />
      </div>
      <button
        type="button"
        onClick={() => setInfoOpen(true)}
        className="mt-2 inline-flex items-center gap-1 font-mono text-[10px] tracking-[0.12em] text-[var(--hill-muted)] transition lg:hover:text-[var(--hill-accent)]"
      >
        HOW DOES ELO WORK? →
      </button>
    </div>
  );

  const Skins = (
    <div>
      <div className="flex justify-between items-center mb-1">
        <div className="text-[10px] font-bold text-[var(--hill-muted)] tracking-[0.18em]">PIECE SKIN</div>
        <div className="font-mono text-[10px] text-[var(--hill-dim)] tracking-[0.08em] lg:tracking-[0.1em]">
          {unlockedCount} OF {totalSkins} UNLOCKED
        </div>
      </div>
      <p className="mb-2 lg:mb-3 text-[10px] text-[var(--hill-muted)] leading-[1.4]">
        Previews show a circle (slot 1). Your in-game shape — circle, square,
        triangle or hexagon — is set by your player slot; the skin only
        changes the finish.
      </p>
      {/* Tier skins — Mobile: horizontal scrolling; desktop: 5-up grid */}
      <div className="hill-scroll flex gap-2 overflow-x-auto px-5 -mx-5 lg:grid lg:grid-cols-5 lg:gap-3 lg:px-0 lg:mx-0">
        {(Object.keys(SKINS) as TierSkinId[]).map(sk => {
          const unlocked = skinUnlocked(sk, tier);
          const skTier = SKINS[sk].tier;
          const unlockText = unlocked
            ? null
            : `Unlock at ${skTier} · ${SKIN_REQUIREMENTS[sk]} ELO`;
          return (
            <SkinCard
              key={sk}
              skinId={sk}
              samplePlayer={1}
              selected={skin === sk}
              locked={!unlocked}
              unlockText={unlockText}
              onClick={() => unlocked && pickSkin(sk)}
            />
          );
        })}
      </div>

      {/* Premium skins — purchased via Stripe, never tier-gated */}
      <div className="mt-5 lg:mt-6 mb-2 lg:mb-3 flex items-center gap-2">
        <div className="text-[10px] font-bold text-[var(--hill-muted)] tracking-[0.18em]">PREMIUM</div>
        <div className="font-mono text-[9px] text-[var(--hill-dim)] tracking-[0.1em]">ANIMATED · BUY ONCE · KEEP FOREVER</div>
      </div>
      <div className="hill-scroll flex gap-2 overflow-x-auto px-5 -mx-5 lg:grid lg:grid-cols-3 lg:gap-3 lg:px-0 lg:mx-0">
        {PREMIUM_SKIN_IDS.map((sk) => {
          const owned = ownedPremium.includes(sk);
          const meta = PREMIUM_SKIN_PRICES[sk];
          const isSel = skin === sk;
          return (
            <div
              key={sk}
              className={[
                'relative shrink-0 flex flex-col items-center gap-2 rounded-[14px] border-[1.5px] transition',
                'min-w-[140px] px-3 pt-3.5 pb-3 lg:min-w-0 lg:px-3.5 lg:pt-[18px] lg:pb-3.5',
                isSel
                  ? 'border-[var(--hill-accent)] bg-[rgba(191,255,0,0.05)] shadow-[inset_0_0_12px_rgba(191,255,0,0.18)]'
                  : 'border-[var(--hill-border)] bg-[var(--hill-surface)]',
              ].join(' ')}
            >
              <button
                type="button"
                disabled={!owned}
                onClick={() => owned && pickSkin(sk)}
                className={[
                  'flex h-14 w-14 lg:h-[76px] lg:w-[76px] items-center justify-center rounded-xl lg:rounded-[14px] border border-[var(--hill-border)] bg-gradient-to-br from-[#1f1f1f] to-[#0f0f0f]',
                  owned ? 'cursor-pointer' : 'cursor-default',
                ].join(' ')}
                aria-label={owned ? `Select ${meta.displayName}` : `${meta.displayName} (locked)`}
              >
                <PieceShape player={1} size={34} skin={sk} />
              </button>

              <div className="text-center min-h-[24px]">
                <div className="text-[13px] lg:text-sm font-bold text-[var(--hill-text)] tracking-[-0.01em]">
                  {meta.displayName}
                </div>
              </div>

              {owned ? (
                <div className="text-[9px] font-extrabold tracking-[0.14em] text-[var(--hill-bg)] bg-[var(--hill-accent)] px-1.5 py-[3px] rounded">
                  {isSel ? 'SELECTED' : 'OWNED'}
                </div>
              ) : (
                <button
                  type="button"
                  disabled={buying === sk}
                  onClick={() => void buySkin(sk)}
                  className="w-full h-8 rounded-lg bg-[var(--hill-accent)] text-[var(--hill-bg)] text-[12px] font-extrabold tracking-[0.02em] transition lg:hover:brightness-95 disabled:opacity-60"
                >
                  {buying === sk ? 'Opening…' : `Buy $${meta.priceUsd.toFixed(2)}`}
                </button>
              )}
            </div>
          );
        })}
      </div>
      {buyErr && (
        <div className="mt-2 text-[11px] font-mono tracking-[0.04em] text-[var(--hill-danger)]">
          {buyErr}
        </div>
      )}

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
          ['Longest streak',      NA],
          ['Best round (Blitz)',  NA],
          ['Pieces captured',     NA],
          ['Hill seconds held',   NA],
          ['Kings crowned',       NA],
          ['Times eliminated',    NA],
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
            <button
              onClick={() => {
                if (
                  typeof window !== 'undefined' &&
                  window.confirm(
                    'Reset account? This clears your wins, ELO, and skin.',
                  )
                ) {
                  void resetAccount();
                }
              }}
              className="h-12 lg:h-10 w-full lg:w-auto lg:px-4 rounded-xl bg-transparent text-[var(--hill-danger)] border text-sm lg:text-xs font-bold tracking-[0.04em] lg:tracking-[0.08em] transition lg:hover:border-[var(--hill-danger)]"
              style={{ borderColor: 'rgba(255,59,48,0.25)' }}
            >
              RESET ACCOUNT
            </button>
          </div>
        </div>
      </div>

      <EloInfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />
    </div>
  );
}
