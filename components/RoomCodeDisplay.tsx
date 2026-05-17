// components/RoomCodeDisplay.tsx
interface Props { code?: string; }

/**
 * Big monospace room code. Sizes up dramatically on desktop where the lobby
 * uses it as a hero element.
 */
export function RoomCodeDisplay({ code = 'ABCD' }: Props) {
  return (
    <div className="text-center lg:text-left">
      <div className="text-[10px] font-bold text-[var(--hill-muted)] tracking-[0.24em]">
        ROOM CODE
      </div>
      <div
        className="mt-1.5 lg:mt-2 font-mono font-bold text-[var(--hill-text)] text-[56px] lg:text-[120px] xl:text-[132px] leading-none tracking-[0.08em] lg:tracking-[0.04em]"
        style={{ textShadow: '0 0 24px rgba(191,255,0,0.15)' }}
      >
        {code}
      </div>
    </div>
  );
}
