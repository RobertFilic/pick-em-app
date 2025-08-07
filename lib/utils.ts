// ================================================================================
// File: lib/utils.ts  
// ================================================================================

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a random invite code for leagues
 */
export function generateInviteCode(): string {
  return `LEAGUE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

/**
 * Validate league name
 */
export function validateLeagueName(name: string): string | null {
  const trimmedName = name.trim();
  
  if (!trimmedName) {
    return "League name is required";
  }
  
  if (trimmedName.length < 2) {
    return "League name must be at least 2 characters";
  }
  
  if (trimmedName.length > 50) {
    return "League name must be less than 50 characters";
  }
  
  return null;
}

/**
 * Validate invite code format
 */
export function validateInviteCode(code: string): string | null {
  const trimmedCode = code.trim();
  
  if (!trimmedCode) {
    return "Invite code is required";
  }
  
  if (!/^LEAGUE-[A-Z0-9]{6}$/i.test(trimmedCode)) {
    return "Invalid invite code format";
  }
  
  return null;
}

/**
 * Format error messages for user display
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
}

/**
 * Debounce function to limit function calls
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Copy text to clipboard with error handling
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'absolute';
      textArea.style.left = '-999999px';
      
      document.body.prepend(textArea);
      textArea.select();
      
      try {
        document.execCommand('copy');
        return true;
      } catch (error) {
        console.error('Fallback copy failed:', error);
        return false;
      } finally {
        textArea.remove();
      }
    }
  } catch (error) {
    console.error('Copy to clipboard failed:', error);
    return false;
  }
}

/**
 * Format competition description for display
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Check if user is league admin
 */
export function isLeagueAdmin(userId: string, league: { admin_id: string }): boolean {
  return userId === league.admin_id;
}

/**
 * Get member count display text
 */
export function getMemberCountText(count: number): string {
  if (count === 0) return 'No members';
  if (count === 1) return '1 member';
  return `${count} members`;
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(dateObj);
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Create a delay for testing/demo purposes
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if we're in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}