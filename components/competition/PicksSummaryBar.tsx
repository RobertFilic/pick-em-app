// ================================================================================
// File: components/competition/PicksSummaryBar.tsx
// ================================================================================

import React from 'react';
import { CheckCircle } from 'lucide-react';

interface PicksSummaryBarProps {
  userId?: string | null;
  picksCount: number;
  isSubmitting: boolean;
  success?: string | null;
  error?: string | null;
  onSubmit: () => void;
  className?: string;
}

export function PicksSummaryBar({
  userId,
  picksCount,
  isSubmitting,
  success,
  error,
  onSubmit,
  className = ''
}: PicksSummaryBarProps) {
  return (
    <div className={`mt-8 p-4 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 shadow-lg sticky bottom-4 flex items-center justify-between ${className}`}>
      
      {/* Status Messages */}
      <div>
        {success && (
          <p className="text-green-600 font-semibold">{success}</p>
        )}
        {error && (
          <p className="text-red-600 font-semibold">{error}</p>
        )}
        {!userId && picksCount > 0 && !success && !error && (
          <p className="text-amber-600 font-medium text-sm">
            💾 {picksCount} picks saved locally
          </p>
        )}
        {userId && picksCount > 0 && !success && !error && (
          <p className="text-blue-600 font-medium text-sm">
            📋 {picksCount} picks ready to save
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button 
        onClick={onSubmit}
        disabled={isSubmitting}
        className={`px-8 py-3 font-bold rounded-md flex items-center transition-colors ${
          userId 
            ? 'bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400' 
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isSubmitting ? 'Saving...' : (userId ? 'Save My Picks' : 'Sign Up to Save')}
        <CheckCircle className="w-5 h-5 ml-2" />
      </button>
    </div>
  );
}