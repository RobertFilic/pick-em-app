// app/contact/page.tsx
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              PlayPredix
            </Link>
            <div className="flex gap-4">
              <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                Home
              </Link>
              <Link href="/about" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                About
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center">Contact Us</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-blue-600" />
            <h2 className="text-2xl font-semibold mb-4">Follow us on Twitter</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              The best way to reach us is through Twitter. We&apos;re active and respond quickly!
            </p>
            
            <a
              href="https://twitter.com/playpredix"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              @PlayPredix on Twitter
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}