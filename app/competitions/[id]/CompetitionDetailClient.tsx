/*
================================================================================
File: app/competitions/[id]/CompetitionDetailClient.tsx (Refactored)
================================================================================
Clean, component-based version using custom hooks and UI components
*/

'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';

// Import hooks
import { useCompetitionDetail } from '@/hooks/useCompetitionDetail';

// Import UI components
import { LoadingSpinner } from '@/components/ui';
import { AuthModal } from '@/components/auth';

// Import feature components
import { 
  CompetitionHeader, 
  EventsByDateSection, 
  PicksSummaryBar 
} from '@/components/competition';

export default function CompetitionDetailClient({ id }: { id: string }) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const competitionId = parseInt(id, 10);
  const searchParams = useSearchParams();
  const leagueId = searchParams.get('leagueId');
  
  const {
    // Data
    competition,
    league,
    groupedEvents,
    picks,
    userId,
    
    // States
    loading,
    submitting,
    error,
    success,
    
    // Actions
    handlePickChange,
    handleSubmitPicks,
    isLocked,
    
    // Utilities
    picksCount,
  } = useCompetitionDetail(competitionId, leagueId);

  // Computed values
  const leaderboardUrl = leagueId 
    ? `/leagues/${leagueId}/leaderboard` 
    : `/competitions/${competitionId}/leaderboard`;

  // Handlers
  const handleSubmitClick = async () => {
    if (!userId) {
      setShowAuthModal(true);
      return;
    }
    
    await handleSubmitPicks();
  };

  const handleSignupClick = () => {
    setShowAuthModal(true);
  };

  // Loading state
  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  // Error state
  if (error && !competition) {
    return (
      <div className="text-center p-10 text-red-500">
        Error: {error}
      </div>
    );
  }

  // Not found state
  if (!competition) {
    return (
      <div className="text-center p-10">
        Competition not found.
      </div>
    );
  }

  return (
    <>
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />

      <div>
        {/* Competition Header */}
        <CompetitionHeader
          competition={competition}
          league={league}
          userId={userId}
          picksCount={picksCount}
          leaderboardUrl={leaderboardUrl}
          onSignupClick={handleSignupClick}
        />

        {/* Events by Date */}
        <EventsByDateSection
          groupedEvents={groupedEvents}
          picks={picks}
          allowDraws={competition.allow_draws}
          isLocked={isLocked}
          onPickChange={handlePickChange}
        />
        
        {/* Picks Summary Bar */}
        <PicksSummaryBar
          userId={userId}
          picksCount={picksCount}
          isSubmitting={submitting}
          success={success}
          error={error}
          onSubmit={handleSubmitClick}
        />
      </div>
    </>
  );
}