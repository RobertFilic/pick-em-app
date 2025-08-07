// ================================================================================
// File: components/ui/Notification.tsx
// ================================================================================

import React from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NotificationState } from '@/lib/types';

interface NotificationProps {
  notification: NotificationState;
  onClose?: () => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const positionClasses = {
  'top-right': 'top-5 right-5',
  'top-left': 'top-5 left-5', 
  'bottom-right': 'bottom-5 right-5',
  'bottom-left': 'bottom-5 left-5'
};

export function Notification({ 
  notification, 
  onClose,
  position = 'top-right' 
}: NotificationProps) {
  if (!notification) return null;

  const isSuccess = notification.type === 'success';

  return (
    <div 
      className={cn(
        'fixed p-4 rounded-lg shadow-lg z-[1001] text-white transition-all transform animate-in slide-in-from-top-2',
        positionClasses[position],
        isSuccess ? 'bg-green-500/90' : 'bg-red-500/90'
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        {isSuccess ? (
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
        ) : (
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
        )}
        <span className="flex-1">{notification.message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}