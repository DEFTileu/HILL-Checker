import { ImageResponse } from 'next/og';

export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

// P1 circle-red, P2 square-blue, P3 triangle-green, P4 hex-amber — flattened
// to four solid quadrants for a crisp favicon.
export default function Icon() {
  const cells = ['#E5484D', '#4C7DF7', '#46C56B', '#F5A623'];
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexWrap: 'wrap',
          background: '#0A0A0A',
        }}
      >
        {cells.map((c) => (
          <div
            key={c}
            style={{ width: '50%', height: '50%', background: c }}
          />
        ))}
      </div>
    ),
    { ...size },
  );
}
