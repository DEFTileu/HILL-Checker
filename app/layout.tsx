import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { AuthProvider } from '@/lib/auth';
import { TopNav } from '@/components/TopNav';
import { BottomNav } from '@/components/BottomNav';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  variable: '--font-jetbrains',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  ),
  title: 'HILL — King of the Board',
  description:
    'Blitz checkers with a 4-player King of the Hill mode. 4 players. 3 minutes. One hill.',
  openGraph: {
    title: 'HILL — King of the Board',
    description:
      'Blitz checkers with a 4-player King of the Hill mode.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HILL — King of the Board',
    description:
      'Blitz checkers with a 4-player King of the Hill mode.',
  },
};

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-hill-bg text-hill-text">
        <AuthProvider>
          {/* Desktop sticky header. Renders only on lg+ via `hidden lg:flex` inside. */}
          <TopNav />
          {/*
            Bottom safe area for mobile so BottomNav doesn't sit on top of content.
            On desktop the bottom nav is hidden so we zero out the padding via lg:.
          */}
          <main className="pb-[88px] lg:pb-0">{children}</main>
          <BottomNav />
        </AuthProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
