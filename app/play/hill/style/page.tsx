// app/play/hill/style/page.tsx
'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TopBar } from '@/components/TopBar';
import { PlayStyleCard } from '@/components/PlayStyleCard';
import { CTAButton } from '@/components/CTAButton';

const OPTIONS = [
  {
    id: 'hotseat' as const,
    title: 'Hot-seat',
    caption: 'This device',
    desc: 'Pass the device. Everyone takes their turn on the same screen — perfect for couch games and offline play.',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="3"/><path d="M11 18h2"/></svg>,
  },
  {
    id: 'multi' as const,
    title: 'Multiplayer',
    caption: 'Invite friends',
    desc: 'Create a room. Send a code, link, or QR — friends join from their phones, laptops, or tablets in real time.',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3"/><path d="M3 21c.5-3.5 3-6 6-6s5.5 2.5 6 6"/><circle cx="17" cy="7" r="2.5"/><path d="M15 13c.5-1.5 2-3 4-3"/></svg>,
  },
];

function PlayStyleInner() {
  const router = useRouter();
  const search = useSearchParams();
  const mode = (search.get('mode') as 'blitz' | 'survival') ?? 'blitz';
  const [selected, setSelected] = useState<'hotseat' | 'multi'>('multi');

  return (
    <>
      <TopBar/>
      <div className="mx-auto w-full max-w-[1280px] px-5 lg:px-12 pt-5 lg:pt-14 pb-28 lg:pb-14 flex flex-col min-h-[calc(100vh-64px)]">
        <div className="lg:flex lg:items-baseline lg:gap-4 mb-3">
          <span className="font-mono text-[11px] font-bold text-[var(--hill-accent)] tracking-[0.24em] lg:tracking-[0.32em]">
            STEP · 2 / 2
          </span>
          <button onClick={() => router.back()} className="hidden lg:inline-block text-xs text-[var(--hill-muted)] hover:text-[var(--hill-text)] tracking-[0.04em]">← back</button>
          <span className="flex-1 hidden lg:block"/>
          <span className="hidden lg:inline-block font-mono text-xs text-[var(--hill-muted)] tracking-[0.1em]">
            <span className="text-[var(--hill-accent)]">{mode === 'survival' ? '💀 SURVIVAL' : '⚡ BLITZ'}</span>
            <span className="text-[var(--hill-dim)]"> · 4 PLAYERS MAX</span>
          </span>
        </div>
        <h1 className="font-display text-4xl lg:text-[88px] mt-2 mb-2 lg:mb-3 tracking-[-0.04em]">
          How do you<br/>want to play?
        </h1>
        <p className="text-sm text-[var(--hill-muted)] mt-1 lg:hidden">
          <span className="font-mono text-[var(--hill-accent)]">{mode === 'survival' ? '💀 SURVIVAL' : '⚡ BLITZ'}</span>
          <span className="text-[var(--hill-dim)]"> · 4 players max</span>
        </p>

        <div className="flex flex-col gap-3 mt-6 lg:flex-row lg:gap-6 lg:mt-11">
          {OPTIONS.map(o => (
            <div key={o.id} className="lg:flex-1">
              <PlayStyleCard
                {...o}
                selected={selected === o.id}
                onClick={() => setSelected(o.id)}
              />
            </div>
          ))}
        </div>

        <div className="flex-1 hidden lg:block"/>

        <div className="fixed bottom-[88px] left-0 right-0 px-5 lg:static lg:px-0 lg:flex lg:justify-center lg:mt-10"
             style={{ background: 'linear-gradient(180deg, transparent, var(--hill-bg) 35%)' }}>
          <CTAButton
            variant="primary"
            full={false}
            className="w-full lg:w-auto lg:px-8 lg:h-[68px] lg:text-lg"
            onClick={() => router.push(`/r/ABCD?mode=${mode}&style=${selected}`)}
          >
            {selected === 'multi' ? 'Create room  →' : 'Start hot-seat  →'}
          </CTAButton>
        </div>
      </div>
    </>
  );
}

export default function PlayStylePage() {
  return (
    <Suspense fallback={null}>
      <PlayStyleInner />
    </Suspense>
  );
}
