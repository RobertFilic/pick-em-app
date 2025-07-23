'use client';

import Link from 'next/link';
import { Trophy, Users, BarChart2, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: Trophy,
      title: 'Multiple Competitions',
      description: 'Participate in various tournaments and events, from local leagues to world championships.',
    },
    {
      icon: Users,
      title: 'Challenge Your Friends',
      description: 'Create private groups and compete against your friends to see who is the ultimate prediction champion.',
    },
    {
      icon: BarChart2,
      title: 'Live Leaderboards',
      description: 'Track your score in real-time and climb the leaderboard with every correct pick.',
    },
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Hero Section */}
      <section className="text-center py-20 sm:py-32">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
            The Ultimate Pick&apos;em Challenge is Coming
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Get ready to prove your sports knowledge. Compete against friends, climb the leaderboards, and become a prediction legend. Sign up now for exclusive early access.
          </p>
          <Link
            href="/login"
            className="mt-10 inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-lg transition-transform transform hover:scale-105"
          >
            Join the Waitlist
            <ArrowRight className="w-6 h-6 ml-3" />
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            What to Expect
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-8 border border-gray-200 dark:border-gray-800 rounded-lg">
                <feature.icon className="w-12 h-12 mx-auto text-blue-500 mb-6" />
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="text-center py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold">
            Ready to Play?
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Be the first to know when we launch.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-lg transition-transform transform hover:scale-105"
          >
            Get Early Access
          </Link>
        </div>
      </section>
    </div>
  );
}