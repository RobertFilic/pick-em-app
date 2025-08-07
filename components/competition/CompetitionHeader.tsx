// ================================================================================
// File: components/competition/CompetitionHeader.tsx
// ================================================================================

import React from 'react';
import Link from 'next/link';
import { Trophy, Users, BarChart2, UserPlus } from 'lucide-react';

type Competition = {
  id: number;
  name: string;
  description: string | null;
};

type League = {
  id: string;
  name: string;
};

interface CompetitionHeaderProps {
  competition: Competition;
  league?: League | null;
  userId?: string | null;
  leaderboardUrl: string;
  onSignupClick?: () => void;
  className?: string;
}

export function CompetitionHeader({
  competition,
  league,
  userId,
  leaderboardUrl,
  onSignupClick,
  className = ''
}: CompetitionHeaderProps) {
  return (
    <div className={`bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 mb-8 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
        
        {/* Title & Info */}
        <div className="flex items-center">
          <Trophy className="w-8 h-8 mr-4 text-blue-500 dark:text-violet-400" />
          <div>
            <h1 className="text-4xl font-bold">{competition.name}</h1>
            {league && (
              <p className="text-lg text-slate-400 flex items-center gap-2">
                <Users size={16} />
                Playing in league: <strong>{league.name}</strong>
              </p>
            )}
            {!userId && (
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                👤 You&apos;re browsing as a guest - your picks will be saved locally until you sign up!
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4 sm:mt-0">
          <Link 
            href={leaderboardUrl}
            className="inline-flex items-center justify-center px-4 py-2 bg-gray-200 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-800 dark:text-slate-300 rounded-full hover:bg-gray-300 dark:hover:bg-slate-700 transition-colors"
          >
            <BarChart2 className="w-5 h-5 mr-2" />
            View Leaderboard
          </Link>
          
          {!userId && (
            <button
              onClick={onSignupClick}
              className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Sign Up
            </button>
          )}
        </div>
      </div>
    </div>
  );
}