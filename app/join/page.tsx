'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TopBar } from '@/components/TopBar';
import { CTAButton } from '@/components/CTAButton';

export default function JoinPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const ready = code.length === 4 && !loading;

  async function submit() {
    if (!ready) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/rooms/${code}`);
      if (res.ok) {
        router.push(`/r/${code}`);
        return;
      }
      setError(
        res.status === 404
          ? `No room "${code}". Check the code and try again.`
          : 'Something went wrong. Try again.',
      );
    } catch {
      setError('Network error. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--hill-bg)] text-[var(--hill-text)]">
      <TopBar hideOnDesktop={false} />

      <div className="mx-auto w-full max-w-[440px] px-5 lg:px-0 pt-10 lg:pt-20 pb-16">
        <span className="font-mono text-[11px] font-bold tracking-[0.24em] text-[var(--hill-accent)]">
          · MULTIPLAYER ·
        </span>
        <h1 className="font-display text-[44px] lg:text-[64px] m-0 tracking-[-0.04em] mt-2">
          JOIN A ROOM
        </h1>
        <p className="mt-2 text-[15px] text-[var(--hill-muted)]">
          Got a code? Enter it below.
        </p>

        <form
          className="mt-9"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <label className="block text-[10px] font-bold text-[var(--hill-muted)] tracking-[0.18em] mb-2.5">
            ROOM CODE
          </label>
          <input
            autoFocus
            value={code}
            onChange={(e) => {
              const v = e.target.value
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, '')
                .slice(0, 4);
              setCode(v);
              if (error) setError(null);
            }}
            inputMode="text"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            maxLength={4}
            placeholder="ABCD"
            aria-invalid={!!error}
            className={[
              'w-full bg-[var(--hill-surface)] border rounded-xl',
              'px-5 py-5 font-mono text-[34px] lg:text-[40px] font-bold',
              'tracking-[0.4em] text-center uppercase outline-none transition',
              'placeholder:text-[var(--hill-dim)]',
              error
                ? 'border-[var(--hill-danger)]'
                : 'border-[var(--hill-borderHi)] focus:border-[var(--hill-accent)] focus:shadow-[0_0_0_3px_rgba(191,255,0,0.15)]',
            ].join(' ')}
          />

          {error && (
            <div
              role="alert"
              className="mt-3 text-[13px] font-medium text-[var(--hill-danger)]"
            >
              {error}
            </div>
          )}

          <div className="mt-6">
            <CTAButton type="submit" variant="primary" disabled={!ready}>
              {loading ? 'Checking…' : 'Enter Room →'}
            </CTAButton>
          </div>
        </form>

        <div className="mt-8 text-center text-[13px] text-[var(--hill-muted)]">
          Don&apos;t have a code?{' '}
          <Link
            href="/play/hill/style"
            className="font-bold text-[var(--hill-text)] hover:text-[var(--hill-accent)]"
          >
            Create →
          </Link>
        </div>
      </div>
    </div>
  );
}
