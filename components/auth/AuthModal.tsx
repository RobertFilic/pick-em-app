// ================================================================================
// File: components/auth/AuthModal.tsx
// ================================================================================

import React from 'react';
import Link from 'next/link';
import { UserPlus, LogIn } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Private Leagues"
    >
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-400">
          Sign up or log in to create and join private leagues with your friends!
        </p>
        
        <div className="flex gap-3">
          <Link
            href="/login"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            onClick={onClose}
          >
            <UserPlus className="w-4 h-4" />
            Sign Up
          </Link>
          <Link
            href="/login"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={onClose}
          >
            <LogIn className="w-4 h-4" />
            Log In
          </Link>
        </div>
      </div>
    </Modal>
  );
}