'use client';
import { useEffect, useState } from 'react';
import { Leaderboard, type LeaderboardRow } from '@/components/Leaderboard';
import { getLeaderboard, toLeaderboardRows } from '@/lib/db/leaderboard';
import { useAuth } from '@/lib/auth';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<LeaderboardRow[] | null>(null);

  useEffect(() => {
    let active = true;
    getLeaderboard().then((entries) => {
      if (!active) return;
      setRows(toLeaderboardRows(entries, user?.id));
    });
    return () => {
      active = false;
    };
  }, [user]);

  if (rows === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-hill-bg text-hill-muted font-mono text-[12px] tracking-[0.18em]">
        LOADING…
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="relative min-h-screen bg-hill-bg text-hill-text">
        <div className="flex min-h-screen flex-col items-center justify-center gap-2 px-6 text-center">
          <div className="text-xl font-extrabold">No ranked games yet</div>
          <p className="max-w-[240px] text-sm text-hill-muted">
            Play a game to appear on the leaderboard.
          </p>
        </div>
        <Leaderboard rows={[]} total={0} />
      </div>
    );
  }

  return <Leaderboard rows={rows} total={rows.length} />;
}
