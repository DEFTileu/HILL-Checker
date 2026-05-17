export interface TurnTimerProps {
    seconds: number;
    total?: number;
    size?: number;
    color?: string;
    children?: React.ReactNode;
}

export function TurnTimer({ seconds, total = 10, size = 44, color = '#BFFF00', children }: TurnTimerProps) {
    const r = (size - 4) / 2;
    const c = 2 * Math.PI * r;
    return (
        <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="absolute inset-0" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" />
                <circle
                    cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="2.5"
                    strokeDasharray={c} strokeDashoffset={c * (1 - seconds / total)}
                    strokeLinecap="round" style={{ transition: 'stroke-dashoffset .9s linear' }}
                />
            </svg>
            {children}
        </div>
    );
}