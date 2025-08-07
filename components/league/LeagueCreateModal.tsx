// ================================================================================
// File: components/league/LeagueCreateModal.tsx
// ================================================================================

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { Competition } from '@/lib/types';

interface LeagueCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, competitionId: number) => Promise<void>;
  competitions: Competition[];
  isSubmitting?: boolean;
  error?: string;
}

export function LeagueCreateModal({
  isOpen,
  onClose,
  onSubmit,
  competitions,
  isSubmitting = false,
  error
}: LeagueCreateModalProps) {
  const [leagueName, setLeagueName] = useState('');
  const [selectedCompId, setSelectedCompId] = useState<number | string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!leagueName.trim() || !selectedCompId) {
      return;
    }

    await onSubmit(leagueName.trim(), Number(selectedCompId));
  };

  const handleClose = () => {
    setLeagueName('');
    setSelectedCompId('');
    onClose();
  };

  // Set default competition when modal opens and competitions are available
  React.useEffect(() => {
    if (isOpen && competitions.length > 0 && !selectedCompId) {
      setSelectedCompId(competitions[0].id);
    }
  }, [isOpen, competitions, selectedCompId]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create a New League"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* League Name */}
        <div>
          <label htmlFor="leagueName" className="block mb-1 text-gray-600 dark:text-slate-400">
            League Name
          </label>
          <input 
            id="leagueName" 
            type="text" 
            value={leagueName} 
            onChange={e => setLeagueName(e.target.value)} 
            className="w-full p-2 bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
            placeholder="e.g., The Office Champions"
            required
            disabled={isSubmitting}
          />
        </div>

        {/* Competition Selection */}
        <div>
          <label htmlFor="competition" className="block mb-1 text-gray-600 dark:text-slate-400">
            Link to Competition
          </label>
          <select 
            id="competition" 
            value={selectedCompId || ''} 
            onChange={e => setSelectedCompId(Number(e.target.value))} 
            className="w-full p-2 bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isSubmitting}
          >
            <option value="">Select a competition</option>
            {competitions.map(comp => (
              <option key={comp.id} value={comp.id}>
                {comp.name}
              </option>
            ))}
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-red-500 text-sm" role="alert">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={!leagueName.trim() || !selectedCompId}
            className="flex-1"
          >
            Create League
          </Button>
        </div>
      </form>
    </Modal>
  );
}