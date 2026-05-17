// app/login/page.tsx
'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GoogleG } from '@/components/GoogleG';
import { Board } from '@/components/Board';
import { makeHillPieces, HILL_CENTER_ZONE } from '@/lib/pieces';
import type { PlayerNum, SkinId } from '@/lib/skins';

const MOCK_SKINS: Record<PlayerNum, SkinId> = { 1: 'silver', 2: 'gold', 3: 'bronze', 4: 'master' };

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Desktop-only blurred backdrop. Mobile stays solid for legibility. */}
      <div className="hidden lg:flex absolute inset-0 items-center justify-center opacity-20" style={{ filter: 'blur(8px) saturate(0.6)', transform: 'scale(1.4) rotate(-6deg)' }}>
        <Board size={10} cellSize={56}
          pieces={makeHillPieces()}
          centerZone={HILL_CENTER_ZONE}
          skinForPlayer={MOCK_SKINS}
        />
      </div>
      <div className="hidden lg:block absolute inset-0" style={{ background: 'radial-gradient(60% 50% at 50% 45%, rgba(10,10,10,0.4), var(--hill-bg) 80%)' }}/>

      {/* Close button */}
      <button
        onClick={() => router.back()}
        aria-label="Close"
        className="absolute top-6 right-4 lg:top-6 lg:right-8 z-10 w-9 h-9 lg:w-11 lg:h-11 rounded-full bg-[var(--hill-surface)] border border-[var(--hill-border)] flex items-center justify-center text-[var(--hill-text)] lg:hover:border-[var(--hill-accent)] transition"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 3l8 8M11 3l-8 8"/></svg>
      </button>

      <div className="relative z-[2] min-h-screen flex items-center justify-center px-6">
        {/* Mobile: full-bleed; desktop: centered card */}
        <div className="w-full lg:max-w-lg lg:bg-[rgba(20,20,20,0.85)] lg:backdrop-blur-xl lg:border lg:border-[var(--hill-border)] lg:rounded-[20px] lg:shadow-[0_30px_80px_rgba(0,0,0,0.5)] p-6 lg:p-12 mx-auto">
          <div className="flex items-baseline gap-2.5">
            <span className="font-display text-[88px] lg:text-[64px] leading-[0.9] tracking-[-0.04em]">HILL</span>
            <span className="w-7 lg:w-6 h-[3px] lg:h-1 bg-[var(--hill-accent)] self-center" style={{ boxShadow: '0 0 10px var(--hill-accent)' }}/>
          </div>

          <div className="mt-9 lg:mt-7">
            <div className="font-mono text-[11px] font-bold text-[var(--hill-accent)] tracking-[0.24em]">ACCOUNT</div>
            <h2 className="font-display mt-2 text-4xl lg:text-[44px] leading-none tracking-[-0.03em] lg:tracking-[-0.04em]">
              Keep your<br/>crown.
            </h2>
            <p className="text-[15px] text-[var(--hill-muted)] mt-3.5 leading-snug max-w-[320px] lg:max-w-none text-pretty">
              Save your wins, ELO, and arena across every device. One tap, no password.
            </p>
          </div>

          <button
            className="mt-7 w-full h-[60px] rounded-xl bg-[var(--hill-text)] text-[var(--hill-bg)] font-bold text-base tracking-[-0.01em] inline-flex items-center justify-center gap-3 transition lg:hover:brightness-95 lg:hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hill-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--hill-bg)]"
          >
            <GoogleG size={22}/> Continue with Google
          </button>

          <div className="mt-4 px-3.5 py-2.5 rounded-[10px] border border-dashed border-[var(--hill-border)] text-xs lg:text-[13px] text-[var(--hill-muted)] text-center leading-relaxed">
            <Link href="/" className="text-[var(--hill-text)] font-semibold hover:underline">Keep playing as guest →</Link><br/>
            <span className="text-[var(--hill-dim)] font-mono text-[10px] tracking-[0.08em]">STATS WON&apos;T SYNC</span>
          </div>
        </div>
      </div>
    </div>
  );
}
