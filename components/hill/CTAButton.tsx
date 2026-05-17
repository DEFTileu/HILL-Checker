'use client';
export interface CTAButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    full?: boolean;
}

export function CTAButton({ variant = 'primary', full = true, className = '', children, ...rest }: CTAButtonProps) {
    const base = 'inline-flex items-center justify-center gap-2 rounded-xl h-[54px] px-6 text-[17px] font-bold tracking-[-0.01em] transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed';
    const v = {
        primary:   'bg-hill-accent text-hill-bg',
        secondary: 'bg-transparent text-hill-text border border-hill-border-hi',
        danger:    'bg-transparent text-hill-danger border border-hill-danger/40',
    }[variant];
    return (
        <button className={`${base} ${v} ${full ? 'w-full' : ''} ${className}`} {...rest}>{children}</button>
    );
}