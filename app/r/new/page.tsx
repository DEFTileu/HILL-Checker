'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createRoom } from '@/lib/db/rooms';

export default function NewRoomPage() {
  const router = useRouter();
  const [error, setError] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    createRoom('hill-blitz')
      .then(({ id }) => router.replace(`/r/${id}`))
      .catch(() => setError(true));
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-hill-bg text-hill-text">
      {error ? (
        <>
          <p className="text-sm text-hill-muted">Could not create a room.</p>
          <button
            onClick={() => {
              started.current = false;
              setError(false);
              createRoom('hill-blitz')
                .then(({ id }) => router.replace(`/r/${id}`))
                .catch(() => setError(true));
            }}
            className="rounded-[10px] border border-hill-border bg-hill-surface px-4 py-2 text-sm font-semibold"
          >
            Try again
          </button>
        </>
      ) : (
        <p className="font-mono text-[12px] tracking-[0.18em] text-hill-muted">
          CREATING ROOM…
        </p>
      )}
    </div>
  );
}
