// ================================================================================
// File: components/competition/CompetitionCard.tsx
// ================================================================================

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Competition } from '@/lib/types';

interface CompetitionCardProps {
  competition: Competition;
  showGuestMessage?: boolean;
  className?: string;
}

export function CompetitionCard({ 
  competition, 
  showGuestMessage = false,
  className 
}: CompetitionCardProps) {
  return (
    <Link 
      href={`/competitions/${competition.id}`}
      className={cn(
        'bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 flex items-center justify-between hover:border-blue-500 dark:hover:border-violet-500 transition-all group',
        className
      )}
    >
      <div className="flex-1">
        <h3 className="text-xl font-semibold mb-1 text-gray-900 dark:text-white">
          {competition.name}
        </h3>
        {competition.description && (
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
            {competition.description}
          </p>
        )}
        {showGuestMessage && (
          <p className="text-blue-600 dark:text-blue-400 text-sm">
            👆 Click to start making predictions
          </p>
        )}
      </div>
      <ArrowRight className="w-5 h-5 text-gray-400 dark:text-slate-400 group-hover:translate-x-1 transition-transform ml-4 flex-shrink-0" />
    </Link>
  );
}