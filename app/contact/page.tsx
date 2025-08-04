// app/terms/page.tsx
import Link from 'next/link';

export default function TermsPage() {
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center">Terms of Service</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            <strong>Last updated:</strong> [Date]
          </p>
          
          <div className="prose dark:prose-invert max-w-none">
            <p className="mb-4">
              These Terms of Service govern your use of PlayPredix and the services we provide.
            </p>
            
            <h2 className="text-2xl font-semibold mt-6 mb-4">Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing and using PlayPredix, you accept and agree to be bound by the terms 
              and provision of this agreement.
            </p>
            
            <h2 className="text-2xl font-semibold mt-6 mb-4">Use of Service</h2>
            <p className="mb-4">
              PlayPredix is a sports prediction platform for entertainment purposes. Users must 
              be at least 13 years old to create an account.
            </p>
            
            <h2 className="text-2xl font-semibold mt-6 mb-4">User Conduct</h2>
            <p className="mb-4">
              Users agree to use the service responsibly and not engage in activities that could 
              harm other users or the platform.
            </p>
            
            <h2 className="text-2xl font-semibold mt-6 mb-4">Changes to Terms</h2>
            <p className="mb-4">
              We reserve the right to modify these terms at any time. Continued use of the service 
              constitutes acceptance of modified terms.
            </p>
            
            <h2 className="text-2xl font-semibold mt-6 mb-4">Contact</h2>
            <p>
              Questions about these Terms should be sent to us at{' '}
              <Link href="/contact" className="text-blue-600 hover:underline">
                our contact page
              </Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}