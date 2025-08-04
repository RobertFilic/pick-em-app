// app/contact/page.tsx
import Link from 'next/link';
import { Mail, MessageCircle, HelpCircle } from 'lucide-react';

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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center">Contact Us</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">Get in Touch</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Have questions, feedback, or need support? We&apos;d love to hear from you!
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <Mail className="w-6 h-6 mr-3 text-blue-600" />
                <div>
                  <h3 className="font-semibold">Email Support</h3>
                  <p className="text-gray-600 dark:text-gray-300">support@playpredix.com</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <MessageCircle className="w-6 h-6 mr-3 text-green-600" />
                <div>
                  <h3 className="font-semibold">General Inquiries</h3>
                  <p className="text-gray-600 dark:text-gray-300">hello@playpredix.com</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <HelpCircle className="w-6 h-6 mr-3 text-purple-600" />
                <div>
                  <h3 className="font-semibold">FAQ</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Check our{' '}
                    <Link href="/about#faq" className="text-blue-600 hover:underline">
                      FAQ section
                    </Link>{' '}
                    for quick answers
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Contact Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold mb-6">Get in Touch</h2>
            <div className="text-center">
              <div className="mb-6">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-blue-600" />
                <h3 className="text-xl font-semibold mb-2">Follow us on Twitter</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  The best way to reach us is through Twitter. We&apos;re active and respond quickly!
                </p>
              </div>
              
              <a
                href="https://twitter.com/playpredix"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                @PlayPredix on Twitter
              </a>
              
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  You can also check our{' '}
                  <Link href="/about" className="text-blue-600 hover:underline">
                    FAQ section
                  </Link>{' '}
                  for quick answers to common questions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}