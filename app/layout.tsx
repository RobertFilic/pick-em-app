import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';

// Load fonts with CSS variable support
const plusJakartaSans = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  weight: ['300', '400', '500', '600', '700'],
});

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

// SEO OPTIMIZED: Merged your original metadata with the SEO-focused content
export const metadata: Metadata = {
  title: "Pick'em App | EuroBasket 2025 Challenge",
  description: 'Join the ultimate EuroBasket 2025 pick em challenge. Compete with friends, track your score on the live leaderboard, and prove your basketball knowledge.',
  keywords: 'EuroBasket 2025, Pick em, Basketball Prediction Game, Office Pool, Sports Betting Game',
  authors: [{ name: "Pick'em Team" }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  other: {
    'google-site-verification': 'ID924kGiPoGLZv2L2ZlqV1kCddoPuOJdWv4qB44scqE',
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  // SEO OPTIMIZED: Added JSON-LD structured data for the SportsEvent
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: "FIBA EuroBasket 2025 Pick'em Challenge",
    startDate: '2025-08-27',
    endDate: '2025-09-14',
    description: 'A friendly prediction game for the FIBA EuroBasket 2025 tournament.',
    location: {
      '@type': 'Place',
      name: 'Cyprus, Finland, Latvia, Poland',
    },
    organizer: {
      '@type': 'Organization',
      name: "Pick'em App",
    },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`
          ${plusJakartaSans.variable} 
          ${inter.variable}
          antialiased 
          selection:bg-violet-200 selection:text-violet-900 
          dark:selection:bg-violet-800 dark:selection:text-violet-100 
          overflow-x-hidden 
          bg-gradient-to-br from-slate-50 via-white to-slate-100 
          dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-black 
          text-slate-900 dark:text-slate-100 
          min-h-screen relative
        `}
      >
        {/* SEO OPTIMIZED: Added script tag for JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        {/* Background Glow Effects */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-400/15 to-cyan-600/15 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        {/* Header */}
        <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-700/50">
          <Header />
        </div>

        {/* Main Content */}
        <main id="main-content" className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-8 sm:py-12 lg:py-16">
              {children}
            </div>
          </div>
          <div className="h-16 sm:h-24" />
        </main>

        {/* Accessibility Skip Link */}
        <div className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-violet-600 focus:text-white focus:rounded-lg focus:shadow-lg">
          <a href="#main-content">Skip to main content</a>
        </div>

        {/* Progress Bar Placeholder */}
        <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-purple-600 transform origin-left scale-x-0 transition-transform duration-150 ease-out z-[60]" />
      </body>
    </html>
  );
}