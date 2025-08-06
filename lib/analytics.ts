// lib/analytics.ts

// Declare gtag function type
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
  }
}

// Generic event tracking function
export const trackEvent = (
  eventName: string,
  parameters?: Record<string, unknown>
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

// User engagement events
export const analytics = {
  // Page views (automatically tracked, but useful for SPA navigation)
  trackPageView: (pagePath: string, pageTitle: string) => {
    trackEvent('page_view', {
      page_path: pagePath,
      page_title: pageTitle,
    });
  },

  // User registration and authentication
  trackUserSignup: (method: string = 'email') => {
    trackEvent('sign_up', {
      method: method,
    });
  },

  trackUserLogin: (method: string = 'email') => {
    trackEvent('login', {
      method: method,
    });
  },

  trackUserLogout: () => {
    trackEvent('logout', {});
  },

  // Competition engagement
  trackCompetitionView: (competitionId: string, competitionName: string, userType: 'guest' | 'authenticated') => {
    trackEvent('view_item', {
      item_id: competitionId,
      item_name: competitionName,
      item_category: 'competition',
      user_type: userType,
    });
  },

  trackPickMade: (type: 'game' | 'prop', competitionId: string, isGuest: boolean, pickValue?: string) => {
    trackEvent('pick_made', {
      pick_type: type,
      competition_id: competitionId,
      user_type: isGuest ? 'guest' : 'registered',
      pick_value: pickValue,
    });
  },

  trackPicksSaved: (totalPicks: number, competitionId: string, leagueId?: string) => {
    trackEvent('picks_saved', {
      picks_count: totalPicks,
      competition_id: competitionId,
      league_id: leagueId || null,
      value: totalPicks, // For GA4 value tracking
    });
  },

  trackPicksSubmitAttempt: (isGuest: boolean, picksCount: number) => {
    trackEvent('picks_submit_attempt', {
      user_type: isGuest ? 'guest' : 'registered',
      picks_count: picksCount,
    });
  },

  // League engagement
  trackLeagueCreated: (leagueId: string, competitionId: string, leagueName: string) => {
    trackEvent('league_created', {
      league_id: leagueId,
      competition_id: competitionId,
      league_name: leagueName,
    });
  },

  trackLeagueJoined: (leagueId: string, leagueName: string, method: 'invite_code') => {
    trackEvent('join_group', {
      group_id: leagueId,
      group_name: leagueName,
      method: method,
    });
  },

  trackLeagueDeleted: (leagueId: string) => {
    trackEvent('league_deleted', {
      league_id: leagueId,
    });
  },

  trackLeaderboardView: (type: 'competition' | 'league', id: string, name?: string) => {
    trackEvent('leaderboard_view', {
      leaderboard_type: type,
      leaderboard_id: id,
      leaderboard_name: name,
    });
  },

  trackInviteCodeCopy: (leagueId: string, leagueName: string) => {
    trackEvent('share', {
      method: 'copy_invite_code',
      content_type: 'league_invite',
      item_id: leagueId,
      item_name: leagueName,
    });
  },

  // Navigation and UI interactions
  trackNavigation: (from: string, to: string, method: 'click' | 'redirect') => {
    trackEvent('navigation', {
      from_page: from,
      to_page: to,
      method: method,
    });
  },

  trackModalOpen: (modalType: 'auth' | 'create_league' | 'join_league') => {
    trackEvent('modal_open', {
      modal_type: modalType,
    });
  },

  trackModalClose: (modalType: 'auth' | 'create_league' | 'join_league') => {
    trackEvent('modal_close', {
      modal_type: modalType,
    });
  },

  // Guest to registered user conversion
  trackGuestPicksTransferred: (picksCount: number, competitionId: string) => {
    trackEvent('guest_conversion', {
      picks_transferred: picksCount,
      competition_id: competitionId,
      value: picksCount,
    });
  },

  trackAuthPromptShown: (trigger: 'save_picks' | 'create_league' | 'join_league') => {
    trackEvent('auth_prompt_shown', {
      trigger: trigger,
    });
  },

  // Social and sharing
  trackTwitterClick: (context: 'contact' | 'footer' | 'header') => {
    trackEvent('social_click', {
      platform: 'twitter',
      context: context,
    });
  },

  trackExternalLinkClick: (url: string, context: string) => {
    trackEvent('external_link_click', {
      url: url,
      context: context,
    });
  },

  // Error tracking
  trackError: (errorType: string, errorMessage: string, context?: string) => {
    trackEvent('exception', {
      description: `${errorType}: ${errorMessage}`,
      context: context,
      fatal: false,
    });
  },

  // Engagement milestones
  trackMilestone: (milestone: string, value?: number, context?: string) => {
    trackEvent('milestone_reached', {
      milestone_name: milestone,
      milestone_value: value,
      context: context,
    });
  },

  // Feature usage
  trackFeatureUsage: (feature: string, action: string, value?: string | number) => {
    trackEvent('feature_usage', {
      feature_name: feature,
      action: action,
      value: value,
    });
  },

  // Search and discovery
  trackSearch: (searchTerm: string, resultCount?: number) => {
    trackEvent('search', {
      search_term: searchTerm,
      result_count: resultCount,
    });
  },

  // Add to analytics.ts
trackPerformance: (metric: string, value: number, context?: string) => {
  trackEvent('performance_metric', {
    metric_name: metric,
    metric_value: value,
    context: context,
  });
},

trackEngagement: (engagementType: 'scroll' | 'time_on_page' | 'interaction', value: number) => {
  trackEvent('user_engagement', {
    engagement_type: engagementType,
    engagement_value: value,
  });
},
};

// Hook for tracking page views in Next.js
export const usePageTracking = () => {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    const title = document.title;
    analytics.trackPageView(path, title);
  }
};

