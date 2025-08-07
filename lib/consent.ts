'use client';

// Create a type-safe interface for gtag with consent commands
interface GtagConsentFunction {
  (command: 'consent', action: 'default' | 'update', parameters: Record<string, unknown>): void;
}

export type ConsentSettings = {
  analytics_storage: 'granted' | 'denied';
  ad_storage: 'granted' | 'denied';
  functionality_storage: 'granted' | 'denied';
  personalization_storage: 'granted' | 'denied';
  security_storage: 'granted' | 'denied';
};

// Type guard to check if gtag supports consent
const isGtagWithConsent = (gtag: unknown): gtag is GtagConsentFunction => {
  return typeof gtag === 'function';
};

export const consentManager = {
  // Default consent (before user choice)
  setDefaultConsent: () => {
    if (typeof window !== 'undefined' && window.gtag && isGtagWithConsent(window.gtag)) {
      const gtagConsent = window.gtag as GtagConsentFunction;
      gtagConsent('consent', 'default', {
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
    if (typeof window !== 'undefined' && window.gtag && isGtagWithConsent(window.gtag)) {
      const gtagConsent = window.gtag as GtagConsentFunction;
      gtagConsent('consent', 'update', settings);
      
      // Store user preferences
      localStorage.setItem('consent-preferences', JSON.stringify({
        ...settings,
        timestamp: Date.now(),
      }));
      
      // Send a page view if analytics consent is granted
      if (settings.analytics_storage === 'granted') {
        // Use the regular gtag for events
        window.gtag('event', 'page_view', {
          page_title: document.title,
          page_location: window.location.href,
        });
      }
    }
  },

  // Check if user has previously made a choice
  hasStoredConsent: (): boolean => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('consent-preferences');
    if (!stored) return false;
    
    try {
      const parsed = JSON.parse(stored) as { timestamp: number };
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
      const parsed = JSON.parse(stored) as Partial<ConsentSettings> & { timestamp: number };
      // Remove timestamp before returning
      const { timestamp, ...consentSettings } = parsed;
      return consentSettings;
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