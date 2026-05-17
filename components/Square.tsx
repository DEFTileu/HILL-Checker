// components/Square.tsx
'use client';
interface Props {
  dark: boolean;
  isLegalTarget?: boolean;
  isLastMove?: boolean;
  onClick?: () => void;
}

/**
 * Single board cell. Dark squares are interactive; legal-target dark squares
 * cursor-pointer + lime tint on hover (desktop only).
 */
export function Square({ dark, isLegalTarget, isLastMove, onClick }: Props) {
  const base = dark ? 'bg-[#1A1A1A]' : 'bg-[#262626]';
  const lastMove = isLastMove ? 'bg-[rgba(191,255,0,0.08)]' : '';
  const interactive = dark && isLegalTarget
    ? 'cursor-pointer lg:hover:bg-[rgba(191,255,0,0.14)] transition-colors'
    : '';
  return (
    <div
      onClick={onClick}
      className={['relative w-full h-full', base, lastMove, interactive].join(' ')}
    />
  );
}
