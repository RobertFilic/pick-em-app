// ================================================================================
// File: components/competition/EventsByDateSection.tsx
// ================================================================================

import React from 'react';
import { Calendar } from 'lucide-react';
import { GameCard } from './GameCard';
import { PropPredictionCard } from './PropPredictionCard';

// Event types
type Team = {
  id: number;
  name: string;
  logo_url: string | null;
};

type Game = {
  id: number;
  game_date: string;
  stage: string | null;
  group: string | null;
  team_a: Team | null;
  team_b: Team | null;
  winning_team_id: number | null;
  is_draw: boolean;
};

type PropPrediction = {
  id: number;
  question: string;
  lock_date: string;
  correct_answer: string | null;
};

type Event = (Game & { type: 'game' }) | (PropPrediction & { type: 'prop' });

interface EventsByDateSectionProps {
  groupedEvents: { [date: string]: Event[] };
  picks: { [key: string]: string };
  allowDraws: boolean;
  isLocked: (date: string) => boolean;
  onPickChange: (type: 'game' | 'prop', id: number, pick: string) => void;
  className?: string;
}

export function EventsByDateSection({
  groupedEvents,
  picks,
  allowDraws,
  isLocked,
  onPickChange,
  className = ''
}: EventsByDateSectionProps) {
  return (
    <div className={`space-y-8 ${className}`}>
      {Object.entries(groupedEvents).map(([date, eventsOnDate]) => (
        <div key={date}>
          <h2 className="text-xl font-bold mb-4 flex items-center text-gray-700 dark:text-gray-300">
            <Calendar className="w-6 h-6 mr-3" />
            {date}
          </h2>
          
          <div className="space-y-6">
            {eventsOnDate.map(event => {
              if (event.type === 'prop') {
                const prop = event as PropPrediction & { type: 'prop' };
                const userPick = picks[`prop_${prop.id}`];
                
                return (
                  <PropPredictionCard
                    key={`prop_${prop.id}`}
                    prop={prop}
                    userPick={userPick}
                    isLocked={isLocked(prop.lock_date)}
                    onPickChange={(propId, pick) => onPickChange('prop', propId, pick)}
                  />
                );
              }
              
              // Handle game events
              const game = event as Game & { type: 'game' };
              const userPick = picks[`game_${game.id}`];
              
              return (
                <GameCard
                  key={`game_${game.id}`}
                  game={game}
                  userPick={userPick}
                  allowDraws={allowDraws}
                  isLocked={isLocked(game.game_date)}
                  onPickChange={(gameId, pick) => onPickChange('game', gameId, pick)}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}