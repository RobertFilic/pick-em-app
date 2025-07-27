/*
================================================================================
File: app/layout.tsx (Redesigned)
================================================================================
*/
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Pick'em - Sports Predictions Made Simple",
  description: 'The most intuitive sports prediction platform. Make picks, compete with friends, and climb the leaderboards.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} text-white bg-[#1a1a2e]`} style={{ background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)' }}>
        {/* Animated background elements that will appear on every page */}
        <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden">
          <div 
            className="absolute bg-gradient-to-r from-pink-500/10 to-violet-500/10 rounded-full animate-[float_20s_infinite_linear]"
            style={{ width: '120px', height: '120px', top: '20%', left: '10%', animationDelay: '0s' }}
          ></div>
          <div 
            className="absolute bg-gradient-to-r from-teal-400/10 to-cyan-500/10 rounded-full animate-[float_20s_infinite_linear]"
            style={{ width: '150px', height: '150px', top: '60%', right: '10%', animationDelay: '-7s' }}
          ></div>
          <div 
            className="absolute bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-full animate-[float_20s_infinite_linear]"
            style={{ width: '80px', height: '80px', top: '80%', left: '30%', animationDelay: '-14s' }}
          ></div>
        </div>

        <Header />
        
        <main className="relative z-10 container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
