// app/about/page.tsx
'use client';

import Link from 'next/link';
import { Trophy, Users, Target, Star, ArrowRight, CheckCircle, HelpCircle } from 'lucide-react';

export default function AboutPage() {
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
              <Link href="/contact" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            About PlayPredix
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Bringing friends together through friendly competition. Make predictions, 
            compete with friends, and see who knows sports best!
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-6">
              <Target className="w-8 h-8 mr-3 text-blue-600" />
              <h2 className="text-3xl font-bold">Our Mission</h2>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              Sports are more fun with friends. PlayPredix transforms your sports knowledge into 
              friendly competition, creating connections and memories that last beyond the final whistle. 
              Whether you&apos;re predicting game outcomes or answering sports trivia, every pick brings you 
              closer to your friends, family, and fellow fans.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose PlayPredix?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <Trophy className="w-12 h-12 mb-4 text-yellow-500" />
              <h3 className="text-xl font-semibold mb-3">Multiple Competition Types</h3>
              <p className="text-gray-600 dark:text-gray-300">
                From game predictions to sports trivia, we offer diverse ways to test your sports knowledge 
                across different leagues and tournaments.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <Users className="w-12 h-12 mb-4 text-blue-500" />
              <h3 className="text-xl font-semibold mb-3">Private Leagues</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Create private leagues with friends, family, or coworkers. Share invite codes and compete 
                in your own exclusive competitions.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <Star className="w-12 h-12 mb-4 text-green-500" />
              <h3 className="text-xl font-semibold mb-3">Play with Friends</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Real-time leaderboards, group chats, and friendly rivalry make every game more exciting 
                when you&apos;re competing with people you know.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
            <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="font-semibold mb-2">Browse Competitions</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Explore available competitions and find ones that interest you
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="font-semibold mb-2">Make Your Picks</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Predict game outcomes and answer sports questions before deadlines
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="font-semibold mb-2">Join Leagues</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Create or join private leagues to compete with friends
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-yellow-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  4
                </div>
                <h3 className="font-semibold mb-2">Track Results</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Watch leaderboards update as games finish and see who comes out on top
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Scoring System */}
        <section className="mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-6">
              <CheckCircle className="w-8 h-8 mr-3 text-green-600" />
              <h2 className="text-3xl font-bold">How Scoring Works</h2>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">Simple Point System</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                    <span><strong>1 point</strong> for each correct game prediction</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                    <span><strong>1 point</strong> for each correct answer to prediction questions</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                    <span><strong>0 points</strong> for incorrect predictions</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3">Leaderboard Rankings</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  Players are ranked by total points scored. Leaderboards update in real-time as 
                  games conclude and results are confirmed.
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  <strong>Tiebreaker:</strong> If multiple players have the same score, they are ranked by:
                </p>
                <ol className="list-decimal list-inside mt-2 text-gray-600 dark:text-gray-300 ml-4">
                  <li>Total number of predictions made (more predictions = higher rank)</li>
                  <li>Time of last prediction (earlier submission = higher rank)</li>
                </ol>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3">Prediction Deadlines</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  All predictions must be made before the game starts or the question deadline passes. 
                  Once locked, predictions cannot be changed. This ensures fair play and maintains 
                  the integrity of the competition.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-8">
              <HelpCircle className="w-8 h-8 mr-3 text-blue-600" />
              <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Do I need to create an account to make predictions?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  No! You can browse competitions and make predictions as a guest. However, creating an account 
                  lets you save your picks, join private leagues, and track your performance over time.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">How do private leagues work?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Private leagues allow you to compete with specific groups of people. Create a league, 
                  share the invite code with friends, and only league members can see your mutual rankings 
                  and compete together.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Can I change my predictions after submitting them?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  You can modify your predictions until the game starts or the question deadline passes. 
                  Once locked, predictions cannot be changed to ensure fair competition.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">What types of competitions are available?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We offer various competition types including game outcome predictions, sports trivia questions, 
                  and tournament brackets. New competition formats are added regularly.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Is PlayPredix free to use?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Yes! PlayPredix is completely free to use. Create an account, join competitions, 
                  make predictions, and compete with friends at no cost.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">How often are results updated?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Results and leaderboards are updated in real-time as games conclude and official 
                  results are confirmed. You&apos;ll see your points and ranking update automatically.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Competing?</h2>
            <p className="text-xl mb-6 opacity-90">
              Join thousands of sports fans making predictions and competing with friends
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/"
                className="bg-white text-blue-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors inline-flex items-center"
              >
                Browse Competitions
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                href="/login"
                className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Sign Up Free
              </Link>
            </div>
          </div>
        </section>

        {/* Footer Links */}
        <footer className="text-center py-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-center gap-8 mb-4">
            <Link href="/privacy" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
              Terms of Service
            </Link>
            <Link href="/contact" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
              Contact Us
            </Link>
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            © 2025 PlayPredix. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}