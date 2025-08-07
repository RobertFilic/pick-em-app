// ================================================================================
// File: components/league/LeagueCard.tsx
// ================================================================================

import React from 'react';
import Link from 'next/link';
import { Users, Copy, BarChart2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { League, Profile } from '@/lib/types';
import { isLeagueAdmin, getMemberCountText } from '@/lib/utils';

interface LeagueCardProps {
  league: League;
  profile: Profile | null;
  onCopyInviteCode: (code: string) => void;
  onDeleteLeague: (leagueId: string) => void;
  className?: string;
}

export function LeagueCard({
  league,
  profile,
  onCopyInviteCode,
  onDeleteLeague,
  className
}: LeagueCardProps) {
  const handleCopyCode = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCopyInviteCode(league.invite_code);
  };

  const handleDeleteLeague = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDeleteLeague(league.id);
  };

  const handleLeaderboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const isAdmin = profile && isLeagueAdmin(profile.id, league);

  return (
    <Link 
      href={`/competitions/${league.competition_id}?leagueId=${league.id}`}
      className={cn(
        'group block bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-violet-500 transition-all',
        className
      )}
    >
      <div className="flex flex-col h-full">
        {/* League Info */}
        <div className="flex-grow">
          <h3 className="text-xl font-bold text-blue-600 dark:text-violet-400 mb-1">
            {league.name}
          </h3>
          <p className="text-gray-600 dark:text-slate-400 mb-4 text-sm">
            Competition: {league.competitions?.name || 'N/A'}
          </p>
          
          {/* Invite Code */}
          <div className="flex items-center gap-2 text-sm bg-gray-100 dark:bg-slate-800 p-2 rounded-lg">
            <span className="text-gray-500 dark:text-slate-400">Invite Code:</span>
            <strong className="text-gray-800 dark:text-white">{league.invite_code}</strong>
            <button 
              onClick={handleCopyCode}
              className="ml-auto p-1 text-gray-500 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors"
              aria-label="Copy invite code"
              title="Copy invite code"
            >
              <Copy size={16} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-slate-800">
          {/* Member Count */}
          <span className="text-gray-500 dark:text-slate-400 text-sm flex items-center gap-2">
            <Users size={16} /> 
            {getMemberCountText(league.league_members.length)}
          </span>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Leaderboard Link */}
            <Link 
              href={`/leagues/${league.id}/leaderboard`} 
              onClick={handleLeaderboardClick}
              className="p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors" 
              title="View League Leaderboard"
            >
              <BarChart2 size={16} />
            </Link>

            {/* Delete Button (Admin Only) */}
            {isAdmin && (
              <button 
                onClick={handleDeleteLeague}
                className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-colors" 
                title="Delete League"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}