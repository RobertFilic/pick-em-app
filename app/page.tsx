'use client';

import Link from 'next/link';
// FIXED: Replaced deprecated 'Basketball' icon with 'Dribbble'
import { Trophy, Users, BarChart2, ArrowRight, Dribbble } from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: Trophy,
      title: 'Prove Your Prowess',
      description: 'Predict every game of EuroBasket 2025, from the group stage to the final buzzer.',
    },
    {
      icon: Users,
      title: 'Challenge Your Crew',
      description: 'Create private leagues and go head-to-head with friends for ultimate bragging rights.',
    },
    {
      icon: BarChart2,
      title: 'Climb the Ranks',
      description: 'Track your stats and rise through the global leaderboards with every correct pick.',
    },
  ];

  return (
    <div className="bg-white dark:bg-black text-gray-800 dark:text-gray-200 font-sans">
      {/* Background Gradient */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white via-blue-50 to-white dark:from-black dark:via-blue-900/20 dark:to-black -z-10"></div>

      {/* Hero Section */}
      <section className="text-center py-24 sm:py-40">
        <div className="container mx-auto px-6">
          <div className="inline-block bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded-full px-4 py-2 mb-6 font-semibold text-sm">
            Coming Soon: EuroBasket 2025 Edition
          </div>
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-sky-400 dark:from-blue-400 dark:to-sky-300">
            The Ultimate Basketball Pick&apos;em
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Think you know basketball? Prove it. Predict the winners of EuroBasket 2025 and compete for glory. Join the waitlist for exclusive early access.
          </p>
          <Link
            href="/login"
            className="mt-10 inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 font-bold text-lg transition-transform transform hover:scale-105 duration-300 ease-in-out"
          >
            Get Early Access
            <ArrowRight className="w-6 h-6 ml-3" />
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white/50 dark:bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-left p-8 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 ease-in-out">
                <feature.icon className="w-10 h-10 text-blue-500 mb-5" />
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="text-center py-24">
        <div className="container mx-auto px-6">
          {/* FIXED: Replaced deprecated 'Basketball' icon with 'Dribbble' */}
          <Dribbble className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-6" />
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Your Champion Awaits.
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            The court is calling. Be the first to answer.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex items-center justify-center px-8 py-4 bg-gray-800 text-white dark:bg-white dark:text-black rounded-full shadow-lg hover:bg-gray-900 dark:hover:bg-gray-200 font-bold text-lg transition-transform transform hover:scale-105 duration-300 ease-in-out"
          >
            Join the Waitlist
          </Link>
        </div>
      </section>
    </div>
  );
}