export interface TopBarProps {
    onBack?: () => void;
    code?: string;
    title?: string;
    right?: React.ReactNode;
}

export function TopBar({ onBack, code, title, right }: TopBarProps) {
    return (
        <div className="sticky top-0 z-10 flex items-center justify-between bg-hill-bg border-b border-hill-border px-4 pt-[14px] pb-3">
            <div className="flex items-center gap-2.5">
                {onBack !== undefined && (
                    <button
                        onClick={onBack}
                        className="h-9 w-9 rounded-[10px] bg-hill-surface border border-hill-border inline-flex items-center justify-center text-hill-text active:scale-95"
                        aria-label="Back"
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5"/></svg>
                    </button>
                )}
                {code && (
                    <div className="font-mono text-xs font-bold text-hill-muted tracking-[0.18em]">
                        ROOM · <span className="text-hill-text">{code}</span>
                    </div>
                )}
                {title && <div className="text-[15px] font-semibold">{title}</div>}
            </div>
            {right && <div className="flex items-center gap-2">{right}</div>}
        </div>
    );
}