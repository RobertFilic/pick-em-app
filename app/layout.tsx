import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import ConsentBanner from '@/components/ConsentBanner';
import Script from 'next/script';

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

// SEO OPTIMIZED: Updated metadata for PlayPredix
export const metadata: Metadata = {
  title: "PlayPredix | Sports Prediction Competitions with Friends",
  description: 'Join sports prediction competitions, compete with friends in private leagues, and test your sports knowledge. Make picks, track scores, and climb the leaderboards! Free to play.',
  
  // Enhanced SEO
  keywords: [
    'sports predictions',
    'pick em games',
    'private leagues',
    'sports competition',
    'leaderboard',
    'friends competition',
    'basketball predictions',
    'sports betting alternative',
    'prediction contest',
    'fantasy sports'
  ].join(', '),
  
  authors: [{ name: "PlayPredix Team" }],
  creator: "PlayPredix",
  publisher: "PlayPredix",
  
  // Open Graph for social sharing
  openGraph: {
    title: "PlayPredix - Sports Prediction Competitions",
    description: 'Compete with friends in sports prediction games. Create private leagues and see who knows sports best!',
    url: 'https://www.playpredix.com',
    siteName: 'PlayPredix',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'PlayPredix - Sports Prediction Competitions',
      }
    ],
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'PlayPredix - Sports Prediction Competitions',
    description: 'Compete with friends in sports prediction games!',
    creator: '@playpredix',
    images: ['/og-image.jpg'],
  },
  
  // Additional metadata
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Schema.org verification
  verification: {
    google: 'vRXsLqBqTwdlK2XX4QD-_gC6VYh1syxpmXwhJrzvjJE',
  },
  
  // Theme colors
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  
  // Additional useful metadata
  category: 'Sports',
  classification: 'Sports Prediction Game',
  
  // Canonical URL
  alternates: {
    canonical: 'https://www.playpredix.com',
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  // SEO OPTIMIZED: Updated JSON-LD structured data for PlayPredix
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'PlayPredix',
    description: 'Sports prediction platform for competing with friends',
    url: 'https://www.playpredix.com',
    applicationCategory: 'SportsApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    author: {
      '@type': 'Organization',
      name: 'PlayPredix',
    },
    featureList: [
      'Create private leagues with friends',
      'Make sports predictions',
      'Real-time leaderboards',
      'Multiple competition types',
      'Free to play'
    ],    
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Analytics with Consent Management */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-ERJB2P6R82'}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            
            // Set default consent BEFORE GA initialization
            gtag('consent', 'default', {
              'analytics_storage': 'denied',
              'ad_storage': 'denied',
              'functionality_storage': 'denied', 
              'personalization_storage': 'denied',
              'security_storage': 'granted',
              'wait_for_update': 500,
              'region': ['US', 'GB', 'EU']
            });
            
            // Initialize GA
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-ERJB2P6R82'}', {
              page_title: document.title,
              page_location: window.location.href,
              send_page_view: false,
              debug_mode: ${process.env.NODE_ENV === 'development'},
              enhanced_measurement: {
                scrolls: true,
                outbound_clicks: true,
                site_search: false,
                video_engagement: false,
                file_downloads: true
              }
            });
          `}
        </Script>
      </head>
      
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

        {/* Consent Banner - Always render, shows/hides based on consent status */}
        <ConsentBanner />

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