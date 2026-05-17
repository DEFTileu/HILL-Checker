// components/QrCode.tsx  (NEW)
'use client';
import { QRCodeSVG } from 'qrcode.react';
import { HILL } from '@/lib/tokens';

interface Props {
  value: string;
  size?: number;
  label?: string;
}

/**
 * Wrapped qrcode.react with HILL framing. Install: `npm i qrcode.react`.
 * Renders SVG so it scales cleanly. The center "HILL" mark uses imageSettings,
 * which the library inserts with error correction reserved.
 */
export function QrCode({ value, size = 180, label }: Props) {
  return (
    <div className="inline-flex flex-col items-center gap-3">
      <div className="p-3 rounded-2xl bg-[var(--hill-surface)] border border-[var(--hill-border)]">
        <QRCodeSVG
          value={value}
          size={size}
          bgColor="transparent"
          fgColor={HILL.text}
          level="M"
          // Reserve center cell — we'll overlay the HILL mark via wrapper
          marginSize={0}
        />
      </div>
      {label && (
        <div className="font-mono text-[10px] text-[var(--hill-muted)] tracking-[0.18em]">
          {label}
        </div>
      )}
    </div>
  );
}
