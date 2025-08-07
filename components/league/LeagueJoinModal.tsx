// ================================================================================
// File: components/league/LeagueJoinModal.tsx
// ================================================================================

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface LeagueJoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (inviteCode: string) => Promise<void>;
  isSubmitting?: boolean;
  error?: string;
}

export function LeagueJoinModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  error
}: LeagueJoinModalProps) {
  const [inviteCode, setInviteCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteCode.trim()) {
      return;
    }

    await onSubmit(inviteCode.trim());
  };

  const handleClose = () => {
    setInviteCode('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Join a League"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Invite Code */}
        <div>
          <label htmlFor="inviteCode" className="block mb-1 text-gray-600 dark:text-slate-400">
            Invite Code
          </label>
          <input 
            id="inviteCode" 
            type="text" 
            value={inviteCode} 
            onChange={e => setInviteCode(e.target.value.toUpperCase())} 
            className="w-full p-2 bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
            placeholder="LEAGUE-XXXXXX"
            required
            disabled={isSubmitting}
          />
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Enter the invite code shared by your league admin
          </p>
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
            disabled={!inviteCode.trim()}
            className="flex-1"
          >
            Join League
          </Button>
        </div>
      </form>
    </Modal>
  );
}