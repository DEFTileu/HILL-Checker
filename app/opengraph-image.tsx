import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'HILL — King of the Board';

export default function OG() {
  const cells = ['#E5484D', '#4C7DF7', '#46C56B', '#F5A623'];
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 96px',
          background: '#0A0A0A',
          color: '#FAFAFA',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 40,
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', width: 180, height: 180 }}>
            {cells.map((c) => (
              <div
                key={c}
                style={{ width: '50%', height: '50%', background: c }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 132, fontWeight: 800, letterSpacing: -4 }}>
              HILL
            </div>
            <div style={{ fontSize: 30, color: '#BFFF00', fontWeight: 700 }}>
              KING · OF · THE · BOARD
            </div>
          </div>
        </div>
        <div style={{ fontSize: 34, color: '#A3A3A3', marginTop: 48 }}>
          Blitz checkers with a 4-player King of the Hill mode.
        </div>
      </div>
    ),
    { ...size },
  );
}
