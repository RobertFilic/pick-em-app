'use client';

import Link from 'next/link';
import { Trophy, Users, BarChart2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

// Optional: Replace with SVG illustrations or sports icons later
const BasketballIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-6"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07M2.12 12h19.76M12 2.12v19.76"></path>
  </svg>
);

export default function LandingPage() {
  const features = [
    {
      icon: Trophy,
      title: 'Call Every Shot',
      description: 'Predict game-by-game from Paris to Podgorica. Your picks decide your path to glory.',
    },
    {
      icon: Users,
      title: 'Squad Up',
      description: 'Create private leagues with your crew and settle who’s the real basketball brain.',
    },
    {
      icon: BarChart2,
      title: 'Own the Leaderboard',
      description: 'Live rankings. Daily scores. Global spotlight. Climb your way to the top.',
    },
  ];

  return (
    <div className="bg-white dark:bg-black text-gray-900 dark:text-gray-100 font-sans relative overflow-x-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white via-blue-50 to-white dark:from-black dark:via-blue-900/20 dark:to-black"></div>

      {/* Hero */}
      <section className="text-center py-28 sm:py-40 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 40 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-block bg-yellow-200 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-400 px-4 py-2 rounded-full text-sm font-semibold mb-6 tracking-wide uppercase">
            Including EuroBasket 2025 Challenge
          </div>
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-orange-600 dark:from-yellow-400 dark:to-orange-400 drop-shadow-xl">
            WHO&apos;S GOT NEXT?
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            Think you know Euro hoops? Prove it. Predict the champions, beat your rivals, and climb the leaderboard.
          </p>
          <Link
            href="/login"
            className="mt-10 inline-flex items-center justify-center px-8 py-4 bg-yellow-500 text-black font-bold text-lg rounded-full hover:bg-yellow-600 shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Get Early Access
            <ArrowRight className="ml-3 w-5 h-5" />
          </Link>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white/60 dark:bg-black/40 backdrop-blur-md">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <feature.icon className="w-10 h-10 text-yellow-500 mb-5" />
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-base">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="text-center py-28 px-6">
        <div className="max-w-2xl mx-auto">
          <BasketballIcon />
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            The Court is Calling.
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Step up, show out, and secure your shot at EuroBasket glory.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex items-center justify-center px-8 py-4 bg-black text-white dark:bg-white dark:text-black rounded-full shadow-lg hover:shadow-2xl font-bold text-lg transition-transform transform hover:scale-105 duration-300"
          >
            Join the Waitlist
          </Link>
        </div>
      </section>
    </div>
  );
}
