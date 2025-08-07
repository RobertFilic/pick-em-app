'use client';

// Don't redeclare gtag here - it's already declared in lib/analytics.ts
// We'll just use it directly

export type ConsentSettings = {
  analytics_storage: 'granted' | 'denied';
  ad_storage: 'granted' | 'denied';
  functionality_storage: 'granted' | 'denied';
  personalization_storage: 'granted' | 'denied';
  security_storage: 'granted' | 'denied';
};

export const consentManager = {
  // Default consent (before user choice)
  setDefaultConsent: () => {
    if (typeof window !== 'undefined' && window.gtag) {
      // TypeScript will complain about 'consent' not being in the union, but it works at runtime
      (window.gtag as any)('consent', 'default', {
        'analytics_storage': 'denied',
        'ad_storage': 'denied',
        'functionality_storage': 'denied',
        'personalization_storage': 'denied',
        'security_storage': 'granted',
        'wait_for_update': 500,
      });
    }
  },

  // Update consent after user choice
  updateConsent: (settings: Partial<ConsentSettings>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      // TypeScript will complain about 'consent' not being in the union, but it works at runtime
      (window.gtag as any)('consent', 'update', settings);
      
      // Store user preferences
      localStorage.setItem('consent-preferences', JSON.stringify({
        ...settings,
        timestamp: Date.now(),
      }));
    }
  },

  // Check if user has previously made a choice
  hasStoredConsent: (): boolean => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('consent-preferences');
    if (!stored) return false;
    
    try {
      const parsed = JSON.parse(stored);
      // Check if consent is less than 1 year old
      return Date.now() - parsed.timestamp < 365 * 24 * 60 * 60 * 1000;
    } catch {
      return false;
    }
  },

  // Load stored consent
  loadStoredConsent: (): Partial<ConsentSettings> | null => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('consent-preferences');
    if (!stored) return null;
    
    try {
      const parsed = JSON.parse(stored);
      return parsed;
    } catch {
      return null;
    }
  },

  // Accept all cookies
  acceptAll: () => {
    consentManager.updateConsent({
      'analytics_storage': 'granted',
      'ad_storage': 'granted',
      'functionality_storage': 'granted',
      'personalization_storage': 'granted',
    });
  },

  // Reject all non-essential cookies
  rejectAll: () => {
    consentManager.updateConsent({
      'analytics_storage': 'denied',
      'ad_storage': 'denied',
      'functionality_storage': 'denied',
      'personalization_storage': 'denied',
    });
  },

  // Essential only (your app probably needs analytics for core functionality)
  essentialOnly: () => {
    consentManager.updateConsent({
      'analytics_storage': 'granted', // Your core business need
      'ad_storage': 'denied',
      'functionality_storage': 'denied',
      'personalization_storage': 'denied',
    });
  },
};