// ================================================================================
// File: components/competition/GameCard.tsx
// ================================================================================

import React from 'react';
import Image from 'next/image';
import { Clock } from 'lucide-react';

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

interface GameCardProps {
  game: Game;
  userPick?: string;
  allowDraws: boolean;
  isLocked: boolean;
  onPickChange: (gameId: number, pick: string) => void;
  className?: string;
}

export function GameCard({
  game,
  userPick,
  allowDraws,
  isLocked,
  onPickChange,
  className = ''
}: GameCardProps) {
  const hasResult = game.winning_team_id !== null || game.is_draw;
  const correctAnswer = game.is_draw ? 'draw' : game.winning_team_id?.toString();
  const isCorrect = hasResult && userPick === correctAnswer;

  const getResultBadge = (pick: string) => {
    if (!hasResult || userPick !== pick) return null;
    
    return isCorrect ? (
      <span className="absolute top-1 right-1 text-xs bg-green-500 text-white rounded-full px-2 py-0.5">
        +1 Point
      </span>
    ) : (
      <span className="absolute top-1 right-1 text-xs bg-red-500 text-white rounded-full px-2 py-0.5">
        Incorrect
      </span>
    );
  };

  const getButtonClass = (pick: string) => {
    const isSelected = userPick === pick;
    return `relative flex flex-col items-center justify-center p-3 rounded-md border-2 transition-all ${
      isSelected 
        ? 'bg-blue-600 text-white border-blue-600' 
        : 'bg-gray-50 dark:bg-gray-800 hover:border-blue-500 border-gray-200 dark:border-gray-700'
    }`;
  };

  return (
    <div className={`bg-white dark:bg-gray-900 p-4 rounded-lg border ${
      hasResult ? 'border-gray-300 dark:border-gray-700' : 'border-gray-200 dark:border-gray-800'
    } ${isLocked ? 'opacity-70' : ''} ${className}`}>
      
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
          {game.stage} {game.group ? `- ${game.group}` : ''}
        </p>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <Clock className="w-4 h-4 mr-1.5" />
          {new Date(game.game_date).toLocaleTimeString(undefined, { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
          {isLocked && (
            <span className="ml-2 text-xs font-bold text-red-500">(LOCKED)</span>
          )}
        </div>
      </div>

      {/* Teams & Draw Options */}
      <div className={`grid ${allowDraws ? 'grid-cols-3' : 'grid-cols-2'} gap-2 items-center`}>
        
        {/* Team A */}
        <button 
          disabled={isLocked}
          onClick={() => onPickChange(game.id, game.team_a!.id.toString())}
          className={getButtonClass(game.team_a!.id.toString())}
        >
          {getResultBadge(game.team_a!.id.toString())}
          {game.team_a?.logo_url && (
            <Image 
              src={game.team_a.logo_url} 
              alt={`${game.team_a.name} logo`} 
              width={40} 
              height={40} 
              className="w-10 h-10 rounded-full mb-2 object-cover"
            />
          )}
          <span className="font-semibold text-center text-sm">
            {game.team_a?.name}
          </span>
        </button>

        {/* Draw Option */}
        {allowDraws && (
          <button 
            disabled={isLocked}
            onClick={() => onPickChange(game.id, 'draw')}
            className={`${getButtonClass('draw')} h-full`}
          >
            {getResultBadge('draw')}
            <span className="font-bold text-lg">DRAW</span>
          </button>
        )}

        {/* Team B */}
        <button 
          disabled={isLocked}
          onClick={() => onPickChange(game.id, game.team_b!.id.toString())}
          className={getButtonClass(game.team_b!.id.toString())}
        >
          {getResultBadge(game.team_b!.id.toString())}
          {game.team_b?.logo_url && (
            <Image 
              src={game.team_b.logo_url} 
              alt={`${game.team_b.name} logo`} 
              width={40} 
              height={40} 
              className="w-10 h-10 rounded-full mb-2 object-cover"
            />
          )}
          <span className="font-semibold text-center text-sm">
            {game.team_b?.name}
          </span>
        </button>
      </div>

      {/* Result Display */}
      {hasResult && (
        <p className="text-xs text-gray-400 mt-2 text-center">
          Correct Answer: {game.is_draw ? 'Draw' : (
            game.winning_team_id === game.team_a?.id ? game.team_a.name : game.team_b?.name
          )}
        </p>
      )}
    </div>
  );
}