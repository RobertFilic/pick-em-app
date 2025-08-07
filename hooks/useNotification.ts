// ================================================================================
// File: hooks/useNotification.ts
// ================================================================================

import { useState, useCallback } from 'react';
import type { NotificationState, NotificationType } from '@/lib/types';

interface UseNotificationReturn {
  notification: NotificationState;
  showNotification: (message: string, type: NotificationType) => void;
  hideNotification: () => void;
}

const DEFAULT_DURATION = 3000; // 3 seconds

export function useNotification(duration: number = DEFAULT_DURATION): UseNotificationReturn {
  const [notification, setNotification] = useState<NotificationState>(null);

  const showNotification = useCallback((message: string, type: NotificationType) => {
    // Clear any existing notification first
    setNotification(null);
    
    // Show new notification
    setNotification({ message, type });
    
    // Auto-hide after duration
    setTimeout(() => {
      setNotification(null);
    }, duration);
  }, [duration]);

  const hideNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return {
    notification,
    showNotification,
    hideNotification,
  };
}