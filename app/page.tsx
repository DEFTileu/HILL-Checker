// app/page.tsx — Landing
'use client';
import Link from 'next/link';
import { CTAButton } from '@/components/CTAButton';
import { WelcomeChip } from '@/components/WelcomeChip';
import { Board } from '@/components/Board';
import { makeHillPieces, HILL_CENTER_ZONE } from '@/lib/pieces';
import type { SkinId, PlayerNum } from '@/lib/skins';

const MOCK_SKINS: Record<PlayerNum, SkinId> = { 1: 'silver', 2: 'gold', 3: 'bronze', 4: 'master' };

const STEPS = [
  { n: '01', t: 'Spawn a room',     b: 'Pick Blitz or Survival, share the 4-letter code or scan the QR. No download, no account needed to play.' },
  { n: '02', t: 'Push the hill',    b: 'Each player has a shape — circle, square, triangle, hex. Take the 2×2 center and hold it through the clock.' },
  { n: '03', t: 'Climb the arena',  b: 'Wins push your ELO, ELO climbs your tier. Each tier unlocks a new piece finish — bronze through champion.' },
] as const;

export default function Landing() {
  // In a real app, pull from session. WelcomeChip in TopNav already shows desktop signed-in state.
  const signedIn = true;

  return (
    <div className="relative">
      {/* Mobile-only welcome chip — desktop uses TopNav. */}
      {signedIn && (
        <div className="lg:hidden absolute top-16 right-4 z-[2]">
          <WelcomeChip user={{ name: 'Aida K.', tier: 'Gold', skin: 'gold' }}/>
        </div>
      )}

      <div className="mx-auto w-full max-w-[1280px] px-5 lg:px-12 pt-[90px] lg:pt-16 pb-24 lg:pb-14 relative">
        {/* Desktop accent column line under HILL */}
        <div
          className="hidden lg:block absolute top-[100px] left-12 w-1 h-[188px] bg-[var(--hill-accent)]"
          style={{ boxShadow: '0 0 16px var(--hill-accent)' }}
        />

        <div className="lg:flex lg:items-end lg:justify-between lg:gap-14 lg:pl-8">
          <div className="lg:flex-1">
            <div className="hidden lg:block text-xs font-bold text-[var(--hill-accent)] tracking-[0.32em]">
              KING · OF · THE · BOARD
            </div>

            <div
              className="font-display text-[120px] lg:text-[180px] xl:text-[220px] mt-3"
              style={{
                background: 'linear-gradient(180deg, #FAFAFA 0%, #FAFAFA 55%, #707070 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}
            >
              HILL
            </div>

            {/* Mobile accent line under H — replaced on desktop by the column above */}
            <div
              className="lg:hidden w-9 h-1 bg-[var(--hill-accent)] -mt-2"
              style={{ boxShadow: '0 0 12px var(--hill-accent)' }}
            />

            <p className="mt-5 lg:mt-6 text-base lg:text-xl xl:text-2xl leading-snug text-[var(--hill-muted)] max-w-[280px] lg:max-w-[560px] text-pretty">
              <span className="text-[var(--hill-text)] font-semibold">4 players. 3 minutes. One hill.</span>
              <br className="hidden lg:block"/>
              <span className="lg:inline"> Browser-native checkers, re-cut for short attention spans.</span>
            </p>

            <div className="mt-9 flex flex-col gap-3 lg:flex-row lg:gap-3.5 lg:items-center">
              <Link href="/play/hill/mode" className="lg:flex-none">
                <CTAButton variant="primary" full={false} className="h-[60px] lg:h-[68px] text-base lg:text-lg w-full lg:w-auto lg:px-8">
                  →&nbsp;&nbsp;Create Hill Room
                </CTAButton>
              </Link>
              <Link href="/play/classic" className="lg:flex-none">
                <CTAButton variant="secondary" full={false} className="h-14 lg:h-[68px] w-full lg:w-auto lg:px-8 lg:text-lg">
                  Play Classic 2P
                </CTAButton>
              </Link>
              <Link href="/join" className="hidden lg:inline-block ml-2 self-center font-mono text-[11px] tracking-[0.14em] text-[var(--hill-muted)] hover:text-[var(--hill-text)]">
                OR<br/>
                <span className="text-[var(--hill-text)] font-bold">JOIN&nbsp;ROOM&nbsp;→</span>
              </Link>
            </div>
          </div>

          {/* Desktop hero board */}
          <div className="hidden lg:block lg:shrink-0 relative pb-4">
            <div
              className="absolute -top-3.5 -right-3.5 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full font-mono text-[10px] font-bold tracking-[0.18em] text-[var(--hill-accent)] z-[2]"
              style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(191,255,0,0.4)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--hill-danger)] animate-hill-pulse" />
              247 LIVE ROOMS
            </div>
            <Board size={10} cellSize={28}
              pieces={makeHillPieces()}
              centerZone={HILL_CENTER_ZONE}
              skinForPlayer={MOCK_SKINS}
            />
          </div>
        </div>

        {/* How HILL works */}
        <section className="mt-20 lg:mt-28 lg:pl-8">
          <div className="flex items-baseline gap-3.5 mb-7">
            <span className="font-mono text-[11px] font-bold tracking-[0.24em] text-[var(--hill-accent)]">
              HOW · HILL · WORKS
            </span>
            <span className="flex-1 h-px bg-[var(--hill-border)]"/>
            <Link href="/rules" className="text-xs text-[var(--hill-muted)] hover:text-[var(--hill-text)] tracking-[0.04em]">
              Full rules →
            </Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-7">
            {STEPS.map(s => (
              <div
                key={s.n}
                className="bg-[var(--hill-surface)] border border-[var(--hill-border)] rounded-2xl p-6 lg:p-7 lg:hover:border-[rgba(191,255,0,0.45)] lg:hover:shadow-[0_0_0_1px_rgba(191,255,0,0.15),0_16px_40px_rgba(0,0,0,0.45)] transition"
              >
                <div className="font-mono text-[11px] text-[var(--hill-muted)] tracking-[0.18em]">STEP · {s.n}</div>
                <div className="font-display text-2xl lg:text-3xl mt-3 tracking-[-0.03em]">{s.t}</div>
                <div className="mt-3.5 text-sm lg:text-[15px] text-[var(--hill-muted)] leading-relaxed text-pretty">
                  {s.b}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
