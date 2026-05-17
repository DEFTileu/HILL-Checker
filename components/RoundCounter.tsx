// components/RoundCounter.tsx
interface Props {
  current: number;
  max?: number | null;
  mode?: 'blitz' | 'survival';
}

export function RoundCounter({ current, max, mode = 'blitz' }: Props) {
  return (
    <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-[var(--hill-surface)] border border-[var(--hill-border)] text-xs font-semibold text-[var(--hill-muted)] tracking-[0.04em]">
      <span
        className="w-1.5 h-1.5 rounded-full bg-[var(--hill-accent)]"
        style={{ boxShadow: '0 0 6px var(--hill-accent)' }}
      />
      <span>ROUND</span>
      <span className="font-mono font-bold text-[var(--hill-text)]">
        {current}
        {max != null && <span className="text-[var(--hill-dim)]"> / {max}</span>}
      </span>
      <span className="text-[var(--hill-dim)] pl-1 border-l border-[var(--hill-border)] ml-0.5">
        {mode === 'blitz' ? 'BLITZ' : 'SURVIVAL'}
      </span>
    </div>
  );
}
