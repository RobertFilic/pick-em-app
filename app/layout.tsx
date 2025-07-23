import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';

// Modern font stack - Plus Jakarta Sans is trending in 2024-2025
const plusJakartaSans = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  weight: ['300', '400', '500', '600', '700']
});

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'Pick\'em - Sports Predictions Made Simple',
  description: 'The most intuitive sports prediction platform. Make picks, compete with friends, and climb the leaderboards.',
  keywords: 'sports predictions, pick em, fantasy sports, betting',
  authors: [{ name: 'Pick\'em Team' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' }
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const htmlClasses = `${plusJakartaSans.variable} ${inter.variable}`;
  const bodyClasses = [
    plusJakartaSans.className,
    'antialiased',
    'selection:bg-violet-200',
    'selection:text-violet-900',
    'dark:selection:bg-violet-800',
    'dark:selection:text-violet-100',
    'overflow-x-hidden',
    'bg-gradient-to-br',
    'from-slate-50',
    'via-white',
    'to-slate-100',
    'dark:bg-gradient-to-br',
    'dark:from-slate-950',
    'dark:via-slate-900',
    'dark:to-black',
    'text-slate-900',
    'dark:text-slate-100',
    'min-h-screen',
    'relative'
  ].join(' ');

  return (
    <html lang="en" className={htmlClasses} suppressHydrationWarning>
      <body className={bodyClasses}>
        {/* Ambient background effects */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          {/* Primary gradient orb */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse" />
          {/* Secondary gradient orb */}
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-400/15 to-cyan-600/15 rounded-full blur-3xl animate-pulse delay-1000" />
          {/* Subtle noise texture overlay */}
          <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.02] bg-[url('data:image/svg+xml,%3Csvg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)"/%3E%3C/svg%3E')]" />
        </div>

        {/* Header with glassmorphism */}
        <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-700/50 supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-slate-900/60">
          <Header />
        </div>

        {/* Main content area with improved spacing and constraints */}
        <main className="relative">
          {/* Content wrapper with better responsive design */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Additional content padding for better breathing room */}
            <div className="py-8 sm:py-12 lg:py-16">
              {children}
            </div>
          </div>

          {/* Subtle bottom spacing */}
          <div className="h-16 sm:h-24" />
        </main>

        {/* Enhanced focus management for accessibility */}
        <div className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-violet-600 focus:text-white focus:rounded-lg focus:shadow-lg">
          <a href="#main-content">Skip to main content</a>
        </div>

        {/* Modern scroll indicator */}
        <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-purple-600 transform origin-left scale-x-0 transition-transform duration-150 ease-out z-[60] [transform:scaleX(var(--scroll-progress,0))]" />
      </body>
    </html>
  );
}