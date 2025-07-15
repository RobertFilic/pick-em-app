import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header'; // We will create this component next

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Pick \'em App',
  description: 'A modern Pick \'em app built with Next.js and Supabase',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100`}>
        {/* The Header will be displayed on every page */}
        <Header />
        <main className="container mx-auto p-4">
          {children}
        </main>
      </body>
    </html>
  );
}