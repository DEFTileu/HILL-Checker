// app/rules/page.tsx — How to play HILL (Classic 2P + Hill 4P)
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TopBar } from '@/components/TopBar';
import { CTAButton } from '@/components/CTAButton';
import { Board } from '@/components/Board';
import { HILL_CENTER_ZONE, type Piece } from '@/lib/pieces';
import type { PlayerNum } from '@/lib/tokens';

type Tab = 'classic' | 'hill';

// --- Static board snapshots (display only — not engine state) ---------------

// Hill 4P starting formation: 4 corners, 5 pawns each, apex toward center.
// Mirrors HILL_START in lib/engine/presets.ts.
const HILL_START: Record<PlayerNum, [number, number][]> = {
  1: [[0, 1], [0, 3], [1, 0], [1, 2], [2, 1]], // top-left    — circle / white
  2: [[0, 9], [0, 7], [1, 8], [1, 6], [2, 7]], // top-right   — square / black
  3: [[9, 8], [9, 6], [8, 9], [8, 7], [7, 8]], // bottom-right — triangle / pink
  4: [[9, 0], [9, 2], [8, 1], [8, 3], [7, 2]], // bottom-left — hexagon / cyan
};
const HILL_DEMO: Piece[] = ([1, 2, 3, 4] as PlayerNum[]).flatMap((player) =>
  HILL_START[player].map((pos): Piece => ({ player, kind: 'pawn', pos })),
);

// Classic 2P standard opening: 12 pieces a side on the dark squares.
// P1 rows 5-7 (white, bottom), P2 rows 0-2 (black, top).
function classicDemo(): Piece[] {
  const ps: Piece[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c) % 2 !== 1) continue; // dark squares only
      if (r <= 2) ps.push({ player: 2, kind: 'pawn', pos: [r, c] });
      else if (r >= 5) ps.push({ player: 1, kind: 'pawn', pos: [r, c] });
    }
  }
  return ps;
}
const CLASSIC_DEMO = classicDemo();

// --- Small presentational helpers ------------------------------------------

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl lg:text-4xl font-bold uppercase tracking-wider mt-12 lg:mt-16 mb-4 lg:mb-5">
      {children}
    </h2>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-base lg:text-lg text-[var(--hill-muted)] leading-relaxed text-pretty">
      {children}
    </p>
  );
}

function Bullets({ items }: { items: { icon: string; text: React.ReactNode }[] }) {
  return (
    <ul className="flex flex-col gap-3.5">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-3 text-base lg:text-lg text-[var(--hill-muted)] leading-relaxed">
          <span className="shrink-0 text-xl leading-7 select-none" aria-hidden>{it.icon}</span>
          <span className="text-pretty">{it.text}</span>
        </li>
      ))}
    </ul>
  );
}

function Card({
  title, accent = false, children,
}: { title: string; accent?: boolean; children: React.ReactNode }) {
  return (
    <div
      className={[
        'flex-1 bg-[var(--hill-surface)] rounded-2xl p-6 border',
        accent ? 'border-[rgba(191,255,0,0.35)]' : 'border-[var(--hill-border)]',
      ].join(' ')}
    >
      <div
        className={[
          'font-mono text-xs font-bold tracking-[0.2em] mb-3',
          accent ? 'text-[var(--hill-accent)]' : 'text-[var(--hill-muted)]',
        ].join(' ')}
      >
        {title}
      </div>
      <ul className="flex flex-col gap-2.5 text-sm lg:text-base text-[var(--hill-muted)] leading-relaxed">
        {children}
      </ul>
    </div>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span className="text-[var(--hill-accent)] shrink-0" aria-hidden>·</span>
      <span className="text-pretty">{children}</span>
    </li>
  );
}

function BoardFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-6 w-full overflow-x-auto">
      <div className="flex justify-center min-w-min px-1">{children}</div>
    </div>
  );
}

// --- Page ------------------------------------------------------------------

export default function RulesPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('hill'); // Hill 4P is the hook → default

  return (
    <>
      <TopBar title="RULES" />
      <div className="mx-auto w-full max-w-3xl px-5 lg:px-8 pt-5 lg:pt-14 pb-28 lg:pb-20">
        {/* Hero */}
        <div className="font-mono text-[11px] font-bold text-[var(--hill-accent)] tracking-[0.24em] lg:tracking-[0.32em]">
          HOW · TO · PLAY
        </div>
        <h1 className="font-display text-4xl lg:text-[72px] mt-3 mb-1 tracking-[-0.04em]">
          How to HILL
        </h1>
        <div
          className="w-12 h-1 bg-[var(--hill-accent)] mt-1 mb-4"
          style={{ boxShadow: '0 0 12px var(--hill-accent)' }}
        />
        <p className="text-base lg:text-lg text-[var(--hill-muted)]">
          Two modes. One board. New rules.
        </p>

        {/* Segmented switcher */}
        <div className="mt-8 lg:flex lg:justify-center">
          <div
            role="tablist"
            aria-label="Game mode rules"
            className="flex w-full lg:max-w-md gap-1 p-1 rounded-full bg-[var(--hill-surface)] border border-[var(--hill-border)]"
          >
            {([
              ['classic', '⚔ Classic 2P'],
              ['hill', '👑 Hill 4P'],
            ] as [Tab, string][]).map(([id, label]) => {
              const on = tab === id;
              return (
                <button
                  key={id}
                  role="tab"
                  aria-selected={on}
                  onClick={() => setTab(id)}
                  className={[
                    'flex-1 h-11 rounded-full text-sm font-bold tracking-[0.02em] transition',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hill-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--hill-bg)]',
                    on
                      ? 'bg-[var(--hill-accent)] text-[var(--hill-bg)]'
                      : 'text-[var(--hill-muted)] lg:hover:text-[var(--hill-text)]',
                  ].join(' ')}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ---- HILL 4P ---- */}
        {tab === 'hill' && (
          <div>
            <SectionHeader>The Board</SectionHeader>
            <BoardFrame>
              <Board
                size={10}
                cellSize={30}
                pieces={HILL_DEMO}
                centerZone={HILL_CENTER_ZONE}
              />
            </BoardFrame>
            <Body>
              4 players. 10×10 board. Each player starts in their corner with 5
              pieces in a triangular formation. Your goal: reach the Hill (the
              2×2 center) or be the last one standing.
            </Body>

            <SectionHeader>Movement</SectionHeader>
            <Bullets
              items={[
                { icon: '⤡', text: 'Move diagonally TOWARD the center — out of your corner.' },
                { icon: '🔁', text: 'Multi-jump captures are mandatory — chain them until you can’t jump again.' },
                { icon: '⚔', text: 'You can capture ANY of the 3 other players. Pawns jump in all 4 diagonals for captures; plain moves are still toward-center only.' },
                { icon: '👑', text: 'Land on the HILL (any of the 4 center squares) → your pawn becomes a KING → moves any number of squares diagonally, any direction.' },
              ]}
            />

            <SectionHeader>Win Conditions</SectionHeader>
            <div className="flex flex-col gap-4 lg:flex-row">
              <Card title="BLITZ · 7 ROUNDS" accent>
                <Li>Lasts up to 7 rounds, or ends early on a last survivor.</Li>
                <Li>At the end of round 7, every player with a piece in the Hill wins — 1 to 4 <span className="text-[var(--hill-text)] font-semibold">JOINT KINGS</span>.</Li>
                <Li>Only 1 player alive before round 7 → solo winner.</Li>
                <Li>Empty Hill at the end → no king today (draw).</Li>
              </Card>
              <Card title="SURVIVAL · 20 ROUNDS">
                <Li>Up to 20 rounds. Last survivor wins.</Li>
                <Li>If it reaches round 20 → anyone with a piece in the Hill wins (1+ possible).</Li>
                <Li>Hill empty at round 20 → draw.</Li>
              </Card>
            </div>

            <SectionHeader>Rhythm</SectionHeader>
            <Bullets
              items={[
                { icon: '⏱', text: '10-second turn timer per player.' },
                { icon: '⏭', text: 'No move in time → your turn is skipped. You are NOT eliminated.' },
                { icon: '🔄', text: 'A "round" = one full cycle of all currently-alive players moving once.' },
                { icon: '💀', text: 'Lose all your pieces and you’re eliminated — the YOU DIED screen lets you spectate or leave.' },
              ]}
            />

            <SectionHeader>Tips</SectionHeader>
            <Bullets
              items={[
                { icon: '🛡', text: 'Don’t rush the Hill — without a king, you’re vulnerable.' },
                { icon: '👀', text: 'Watch all 3 opponents — captures are open against any of them.' },
                { icon: '⚡', text: 'In Blitz, the last round is chaos — race for the Hill.' },
                { icon: '♟', text: 'In Survival, defense wins. Save your king pieces for the late game.' },
              ]}
            />
          </div>
        )}

        {/* ---- CLASSIC 2P ---- */}
        {tab === 'classic' && (
          <div>
            <SectionHeader>The Board</SectionHeader>
            <BoardFrame>
              <Board size={8} cellSize={34} pieces={CLASSIC_DEMO} />
            </BoardFrame>
            <Body>
              The traditional way. 8×8 board. 12 pieces each side. White starts.
            </Body>

            <SectionHeader>Movement</SectionHeader>
            <Bullets
              items={[
                { icon: '⤡', text: 'Pawns move diagonally forward, one square at a time.' },
                { icon: '🔁', text: 'Captures are mandatory — jump diagonally over an enemy into the empty square beyond. Chain multi-jumps when you can.' },
                { icon: '👑', text: 'Reach the opposite edge → become a king. Kings move multiple squares in any diagonal direction.' },
              ]}
            />

            <SectionHeader>Win</SectionHeader>
            <div className="flex flex-col gap-4 lg:flex-row">
              <Card title="CAPTURE ALL" accent>
                <Li>Capture every one of your opponent’s pieces.</Li>
              </Card>
              <Card title="OR · LOCK OUT">
                <Li>Leave the opponent with no legal move on their turn.</Li>
              </Card>
            </div>

            <SectionHeader>Tips</SectionHeader>
            <Bullets
              items={[
                { icon: '🎯', text: 'Control the center early.' },
                { icon: '🛡', text: 'Defend the back row to delay the opponent’s kings.' },
                { icon: '⚖', text: 'Trade pieces when you’re ahead.' },
              ]}
            />
          </div>
        )}

        {/* CTA */}
        <div className="mt-14 lg:mt-16 lg:flex lg:justify-center">
          <CTAButton
            variant="primary"
            full={false}
            className="w-full lg:w-auto lg:px-10 lg:h-[64px] lg:text-lg"
            onClick={() => router.push('/play/hill/mode')}
          >
            Got it — let&apos;s play →
          </CTAButton>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-[var(--hill-muted)] hover:text-[var(--hill-text)] tracking-[0.04em]"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </>
  );
}
