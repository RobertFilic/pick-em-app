// ================================================================================
// File: components/competition/PropPredictionCard.tsx
// ================================================================================

import React from 'react';
import { Clock, HelpCircle } from 'lucide-react';

type PropPrediction = {
  id: number;
  question: string;
  lock_date: string;
  correct_answer: string | null;
};

interface PropPredictionCardProps {
  prop: PropPrediction;
  userPick?: string;
  isLocked: boolean;
  onPickChange: (propId: number, pick: string) => void;
  className?: string;
}

export function PropPredictionCard({
  prop,
  userPick,
  isLocked,
  onPickChange,
  className = ''
}: PropPredictionCardProps) {
  const hasResult = prop.correct_answer !== null;
  const isCorrect = hasResult && userPick === prop.correct_answer;

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
    return `relative w-full p-2 rounded-md border-2 font-semibold transition-all ${
      isSelected 
        ? 'bg-blue-600 text-white border-blue-600' 
        : 'bg-gray-50 dark:bg-gray-800 hover:border-blue-500 border-gray-200 dark:border-gray-700'
    }`;
  };

  return (
    <div className={`bg-white dark:bg-gray-900 p-4 rounded-lg border-2 ${
      hasResult 
        ? 'border-gray-300 dark:border-gray-700' 
        : 'border-dashed border-blue-300 dark:border-blue-800'
    } ${isLocked ? 'opacity-70' : ''} ${className}`}>
      
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <HelpCircle className="w-5 h-5 mr-2 text-blue-500 flex-shrink-0" />
          <p className="font-semibold">{prop.question}</p>
        </div>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <Clock className="w-4 h-4 mr-1.5" />
          {new Date(prop.lock_date).toLocaleTimeString(undefined, { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
          {isLocked && (
            <span className="ml-2 text-xs font-bold text-red-500">(LOCKED)</span>
          )}
        </div>
      </div>

      {/* Yes/No Options */}
      <div className="flex items-center space-x-2">
        <button 
          disabled={isLocked}
          onClick={() => onPickChange(prop.id, 'Yes')}
          className={getButtonClass('Yes')}
        >
          Yes
          {getResultBadge('Yes')}
        </button>
        
        <button 
          disabled={isLocked}
          onClick={() => onPickChange(prop.id, 'No')}
          className={getButtonClass('No')}
        >
          No
          {getResultBadge('No')}
        </button>
      </div>

      {/* Result Display */}
      {hasResult && (
        <p className="text-xs text-gray-400 mt-2 text-center">
          Correct Answer: {prop.correct_answer}
        </p>
      )}
    </div>
  );
}