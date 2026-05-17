// app/play/hill/mode/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TopBar } from '@/components/TopBar';
import { ModeCard } from '@/components/ModeCard';
import { CTAButton } from '@/components/CTAButton';

export default function ModeSelectPage() {
  const [selected, setSelected] = useState<'blitz' | 'survival'>('blitz');
  const router = useRouter();

  return (
    <>
      <TopBar
        right={
          <Link
            href="/rules"
            aria-label="How to play"
            className="w-9 h-9 rounded-[10px] bg-[var(--hill-surface)] border border-[var(--hill-border)] inline-flex items-center justify-center text-[var(--hill-muted)] text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hill-accent)]"
          >
            ?
          </Link>
        }
      />
      <div className="mx-auto w-full max-w-[1280px] px-5 lg:px-12 pt-5 lg:pt-14 pb-28 lg:pb-14 flex flex-col min-h-[calc(100vh-64px)]">
        <div className="lg:flex lg:items-baseline lg:gap-4 mb-3">
          <span className="font-mono text-[11px] font-bold text-[var(--hill-accent)] tracking-[0.24em] lg:tracking-[0.32em]">
            STEP · 1 / 2
          </span>
          <button onClick={() => router.back()} className="hidden lg:inline-block text-xs text-[var(--hill-muted)] hover:text-[var(--hill-text)] tracking-[0.04em]">← back</button>
        </div>
        <h1 className="font-display text-4xl lg:text-[88px] mt-2 mb-2 lg:mb-3 tracking-[-0.04em]">
          Choose your<br className="lg:hidden"/><span className="hidden lg:inline"> </span>mode.
        </h1>
        <p className="text-sm lg:text-lg text-[var(--hill-muted)] mt-1 max-w-[580px]">
          Pick a ruleset. You can switch in the lobby up until the first move.
        </p>

        {/* Cards: stacked on mobile, side-by-side on desktop */}
        <div className="flex flex-col gap-3 mt-6 lg:flex-row lg:gap-6 lg:mt-12">
          <div className="lg:flex-1">
            <ModeCard mode="blitz" selected={selected === 'blitz'} onClick={() => setSelected('blitz')}/>
          </div>
          <div className="lg:flex-1">
            <ModeCard mode="survival" selected={selected === 'survival'} onClick={() => setSelected('survival')}/>
          </div>
        </div>

        <div className="flex-1 hidden lg:block"/>

        {/* Sticky CTA on mobile, centered on desktop */}
        <div className="fixed bottom-[88px] left-0 right-0 px-5 lg:static lg:px-0 lg:flex lg:justify-center lg:mt-10"
             style={{ background: 'linear-gradient(180deg, transparent, var(--hill-bg) 35%)' }}>
          <CTAButton
            variant="primary"
            full={false}
            className="w-full lg:w-auto lg:px-8 lg:h-[68px] lg:text-lg"
            onClick={() => router.push(`/play/hill/style?mode=${selected}`)}
          >
            Continue · <span className="font-mono opacity-70 text-[13px]">{selected.toUpperCase()}</span> →
          </CTAButton>
        </div>
      </div>
    </>
  );
}
