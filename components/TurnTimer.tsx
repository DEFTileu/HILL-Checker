// components/TurnTimer.tsx
import type { ReactNode } from 'react';
import { HILL } from '@/lib/tokens';

interface Props {
  seconds: number;
  total: number;
  size?: number;
  color?: string;
  children?: ReactNode;
}

export function TurnTimer({ seconds, total, size = 44, color = HILL.accent, children }: Props) {
  const r = (size - 4) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - seconds / total);
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={2.5}/>
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={2.5}
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.9s linear' }}
        />
      </svg>
      {children}
    </div>
  );
}
