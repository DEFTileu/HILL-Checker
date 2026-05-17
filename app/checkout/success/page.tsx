// Post-Stripe-redirect landing. The webhook grants the skin asynchronously
// (~1s after payment), so we poll the profile a few times before pointing the
// user back. useSearchParams must sit inside <Suspense> for Next 16.
'use client';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';

function SuccessInner() {
  const params = useSearchParams();
  const sessionId = params.get('session_id');
  const { refresh } = useAuth();
  const [synced, setSynced] = useState(false);

  // Refresh the profile a few times over ~5s so owned_skins is up to date by
  // the time the user clicks through (the webhook grants asynchronously,
  // typically within ~1s of payment).
  useEffect(() => {
    let attempts = 0;
    let cancelled = false;
    const tick = async () => {
      attempts += 1;
      await refresh();
      if (cancelled) return;
      if (attempts >= 6) setSynced(true);
    };
    const id = setInterval(tick, 800);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [refresh]);

  const ready = synced;

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-[520px] flex-col items-center justify-center px-6 text-center">
      <div
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-full text-4xl"
        style={{
          background: 'rgba(191,255,0,0.08)',
          border: '2px solid var(--hill-accent)',
          animation: 'hill-pulse 1.4s ease-in-out infinite',
        }}
      >
        🎉
      </div>
      <h1 className="font-display m-0 text-[44px] tracking-[-0.04em]">
        Skin unlocked!
      </h1>
      <p className="mt-3 text-sm text-[var(--hill-muted)]">
        {ready
          ? 'Your new skin is ready — pick it on your profile.'
          : 'Payment received. Granting your skin (a second or two)…'}
      </p>
      {!sessionId && (
        <p className="mt-2 font-mono text-[11px] text-[var(--hill-dim)]">
          (No session id in URL — did you land here directly?)
        </p>
      )}
      <Link
        href="/profile"
        className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-[var(--hill-text)] px-7 text-[15px] font-bold text-[var(--hill-bg)] transition lg:hover:brightness-95"
      >
        Go to profile
      </Link>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center font-mono text-[12px] tracking-[0.18em] text-[var(--hill-muted)]">
          LOADING…
        </div>
      }
    >
      <SuccessInner />
    </Suspense>
  );
}
