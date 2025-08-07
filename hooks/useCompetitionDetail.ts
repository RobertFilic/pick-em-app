// ================================================================================
// File: hooks/useCompetitionDetail.ts
// ================================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { formatErrorMessage } from '@/lib/utils';

// Types
type Competition = {
  id: number;
  name: string;
  description: string | null;
  lock_date: string;
  allow_draws: boolean;
};

type Team = {
  id: number;
  name: string;
  logo_url: string | null;
};

type Game = {
  id: number;
  game_date: string;
  stage: string | null;
  group: string | null;
  team_a: Team | null;
  team_b: Team | null;
  winning_team_id: number | null;
  is_draw: boolean;
};

type PropPrediction = {
  id: number;
  question: string;
  lock_date: string;
  correct_answer: string | null;
};

type Event = (Game & { type: 'game' }) | (PropPrediction & { type: 'prop' });

type League = {
  id: string;
  name: string;
};

interface UseCompetitionDetailReturn {
  // Data
  competition: Competition | null;
  league: League | null;
  groupedEvents: { [key: string]: Event[] };
  picks: { [key: string]: string };
  userId: string | null;
  
  // States
  loading: boolean;
  submitting: boolean;
  error: string | null;
  success: string | null;
  
  // Actions
  handlePickChange: (type: 'game' | 'prop', id: number, pick: string) => void;
  handleSubmitPicks: () => Promise<boolean>; // Returns success state
  isLocked: (date: string) => boolean;
  
  // Utilities
  storageKey: string;
  picksCount: number;
}

const PICKS_STORAGE_KEY = 'temp_picks_';

function buildPicksPayload({
  picksMap,
  events,
  userId,
  competitionId,
  leagueId,
}: {
  picksMap: Record<string, string>;
  events: Event[];
  userId: string;
  competitionId: number;
  leagueId: string | null;
}) {
  const now = new Date();
  const results: {
    user_id: string;
    competition_id: number;
    league_id: string | null;
    game_id: number | null;
    prop_prediction_id: number | null;
    pick: string;
  }[] = [];

  events.forEach(event => {
    const key = `${event.type}_${event.id}`;
    const userPick = picksMap[key];
    const lockDateStr = event.type === 'game' ? (event as Game).game_date : (event as PropPrediction).lock_date;
    
    if (userPick && new Date(lockDateStr) > now) {
      results.push({
        user_id: userId,
        competition_id: competitionId,
        league_id: leagueId,
        game_id: event.type === 'game' ? event.id : null,
        prop_prediction_id: event.type === 'prop' ? event.id : null,
        pick: userPick,
      });
    }
  });
  return results;
}

export function useCompetitionDetail(
  competitionId: number,
  leagueId: string | null
): UseCompetitionDetailReturn {
  // Core state
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [league, setLeague] = useState<League | null>(null);
  const [groupedEvents, setGroupedEvents] = useState<{ [key: string]: Event[] }>({});
  const [picks, setPicks] = useState<{ [key: string]: string }>({});
  const [userId, setUserId] = useState<string | null>(null);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Refs for stable references
  const hasInitializedRef = useRef(false);
  const userIdRef = useRef(userId);
  const loadingRef = useRef(loading);
  
  // Update refs
  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);
  
  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);
  
  // Storage key
  const storageKey = `${PICKS_STORAGE_KEY}${competitionId}${leagueId ? `_${leagueId}` : ''}`;
  
  // Utility functions
  const isLocked = useCallback((lockDate: string) => {
    return new Date(lockDate) < new Date();
  }, []);
  
  const picksCount = Object.keys(picks).length;
  
  // LocalStorage helpers
  const loadTempPicks = useCallback(() => {
    if (typeof window !== 'undefined') {
      const tempPicks = localStorage.getItem(storageKey);
      if (tempPicks) {
        try {
          return JSON.parse(tempPicks);
        } catch (e) {
          console.error('Error parsing temp picks:', e);
        }
      }
    }
    return {};
  }, [storageKey]);

  const saveTempPicks = useCallback((newPicks: { [key: string]: string }) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(newPicks));
    }
  }, [storageKey]);
  
  // Data fetching
  const fetchCompetitionData = useCallback(async (currentUserId: string | null) => {
    setLoading(true);
    setError(null);
    
    try {
      // League data (only for authenticated users with leagueId)
      if (leagueId && currentUserId) {
        const { data: leagueData, error: leagueError } = await supabase
          .from('leagues')
          .select('id, name')
          .eq('id', leagueId)
          .single();
        if (leagueError) throw leagueError;
        setLeague(leagueData);
      }

      // Public competition data
      const [competitionRes, gamesRes, groupingsRes, propPredictionsRes] = await Promise.all([
        supabase.from('competitions').select('*').eq('id', competitionId).single(),
        supabase.from('games').select('*, team_a:teams!games_team_a_id_fkey(*), team_b:teams!games_team_b_id_fkey(*)').eq('competition_id', competitionId),
        supabase.from('competition_teams').select('team_id, group').eq('competition_id', competitionId),
        supabase.from('prop_predictions').select('*').eq('competition_id', competitionId),
      ]);

      if (competitionRes.error) throw competitionRes.error;
      setCompetition(competitionRes.data);

      // Load existing picks
      let existingPicks = {};
      if (currentUserId) {
        // Authenticated user - load from database
        let picksQuery = supabase
          .from('user_picks')
          .select('game_id, prop_prediction_id, pick')
          .eq('user_id', currentUserId)
          .eq('competition_id', competitionId);
          
        if (leagueId) {
          picksQuery = picksQuery.eq('league_id', leagueId);
        } else {
          picksQuery = picksQuery.is('league_id', null);
        }
        
        const { data: picksData, error: picksError } = await picksQuery;
        if (picksError) throw picksError;

        existingPicks = picksData.reduce((acc, pick) => {
          const key = pick.game_id ? `game_${pick.game_id}` : `prop_${pick.prop_prediction_id}`;
          acc[key] = pick.pick;
          return acc;
        }, {} as { [key: string]: string });
      } else {
        // Non-authenticated user - load from localStorage
        existingPicks = loadTempPicks();
      }

      // Process and set data
      const groupMap = groupingsRes.data!.reduce((acc, item) => { 
        acc[item.team_id] = item.group; 
        return acc; 
      }, {} as { [key: number]: string });
      
      const gamesWithGroups: Event[] = gamesRes.data!.map(game => ({ 
        ...game, 
        group: game.team_a ? groupMap[game.team_a.id] : null, 
        type: 'game' 
      }));
      
      const propsWithType: Event[] = propPredictionsRes.data!.map(p => ({ 
        ...p, 
        type: 'prop' 
      }));
      
      const allEvents = [...gamesWithGroups, ...propsWithType].sort((a, b) => 
        new Date(a.type === 'game' ? a.game_date : a.lock_date).getTime() - 
        new Date(b.type === 'game' ? b.game_date : b.lock_date).getTime()
      );
      
      const eventsByDate = allEvents.reduce((acc, event) => {
        const dateStr = event.type === 'game' ? event.game_date : event.lock_date;
        const date = new Date(dateStr).toLocaleDateString(undefined, { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        if (!acc[date]) { 
          acc[date] = []; 
        }
        acc[date].push(event);
        return acc;
      }, {} as { [key: string]: Event[] });
      
      setGroupedEvents(eventsByDate);
      setPicks(existingPicks);

    } catch (err) {
      console.error('Competition fetch error:', err);
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [competitionId, leagueId, loadTempPicks]);

  // Transfer temporary picks to authenticated user
  const transferTempPicks = useCallback(async (newUserId: string) => {
    const tempPicks = loadTempPicks();
    if (Object.keys(tempPicks).length === 0) {
      return;
    }

    try {
      const allEvents = Object.values(groupedEvents).flat();
      const payload = buildPicksPayload({
        picksMap: tempPicks,
        events: allEvents,
        userId: newUserId,
        competitionId,
        leagueId: leagueId || null,
      });

      const gamePicks = payload.filter(p => p.game_id !== null);
      const propPicks = payload.filter(p => p.prop_prediction_id !== null);

      // Save game picks
      for (const gamePick of gamePicks) {
        const { error: gameUpsertError } = await supabase.rpc('upsert_game_pick', {
          p_user_id: gamePick.user_id,
          p_competition_id: gamePick.competition_id,
          p_game_id: gamePick.game_id,
          p_league_id: gamePick.league_id,
          p_pick: gamePick.pick
        });
        if (gameUpsertError) throw gameUpsertError;
      }

      // Save prop picks
      for (const propPick of propPicks) {
        const { error: propUpsertError } = await supabase.rpc('upsert_prop_pick', {
          p_user_id: propPick.user_id,
          p_competition_id: propPick.competition_id,
          p_prop_prediction_id: propPick.prop_prediction_id,
          p_league_id: propPick.league_id,
          p_pick: propPick.pick
        });
        if (propUpsertError) throw propUpsertError;
      }

      // Clear temporary picks after successful transfer
      localStorage.removeItem(storageKey);
      setSuccess("Your picks have been saved successfully!");
      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      console.error('Error transferring picks:', err);
      setError("Error transferring your picks. Please try again.");
    }
  }, [loadTempPicks, groupedEvents, competitionId, leagueId, storageKey]);

  // Initial load
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const getAndSetUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error && error.message !== 'Auth session missing!') {
          console.error('Auth error:', error);
        }
        setUserId(user?.id || null);
        await fetchCompetitionData(user?.id || null);
      } catch (err) {
        console.error('Unexpected auth error:', err);
        setUserId(null);
        await fetchCompetitionData(null);
      }
    };
    getAndSetUser();
  }, [fetchCompetitionData]);

  // Auth listener
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const newUserId = session?.user?.id || null;
      
      // Skip INITIAL_SESSION events
      if (event === 'INITIAL_SESSION') {
        return;
      }
      
      // Only handle actual auth changes after initial load
      if (!hasInitializedRef.current) {
        return;
      }

      // Ignore redundant events for the same user
      if (newUserId && newUserId === userIdRef.current && !loadingRef.current) {
        return;
      }
      
      setUserId(newUserId);
      
      if (event === 'SIGNED_IN' && newUserId) {
        await transferTempPicks(newUserId);
        await fetchCompetitionData(newUserId);
      } else if (event === 'SIGNED_OUT') {
        await fetchCompetitionData(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchCompetitionData, transferTempPicks]);

  // Pick change handler
  const handlePickChange = useCallback((type: 'game' | 'prop', id: number, pickValue: string) => {
    const key = `${type}_${id}`;
    const newPicks = { ...picks, [key]: pickValue };
    setPicks(newPicks);
    
    // Save to localStorage for non-authenticated users
    if (!userId) {
      saveTempPicks(newPicks);
    }
  }, [picks, userId, saveTempPicks]);

  // Submit picks handler
  const handleSubmitPicks = useCallback(async (): Promise<boolean> => {
    if (!userId) {
      // Non-authenticated user - caller should show auth modal
      return false;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const allEvents = Object.values(groupedEvents).flat();
    const payload = buildPicksPayload({
      picksMap: picks,
      events: allEvents,
      userId,
      competitionId,
      leagueId: leagueId || null,
    });

    if (payload.length === 0) {
      setError("No new unlocked picks to submit.");
      setSubmitting(false);
      return false;
    }

    const gamePicks = payload.filter(p => p.game_id !== null);
    const propPicks = payload.filter(p => p.prop_prediction_id !== null);

    try {
      // Process game picks
      for (const gamePick of gamePicks) {
        const { error: gameUpsertError } = await supabase.rpc('upsert_game_pick', {
          p_user_id: gamePick.user_id,
          p_competition_id: gamePick.competition_id,
          p_game_id: gamePick.game_id,
          p_league_id: gamePick.league_id,
          p_pick: gamePick.pick
        });
        if (gameUpsertError) throw gameUpsertError;
      }

      // Process prop picks
      for (const propPick of propPicks) {
        const { error: propUpsertError } = await supabase.rpc('upsert_prop_pick', {
          p_user_id: propPick.user_id,
          p_competition_id: propPick.competition_id,
          p_prop_prediction_id: propPick.prop_prediction_id,
          p_league_id: propPick.league_id,
          p_pick: propPick.pick
        });
        if (propUpsertError) throw propUpsertError;
      }

      setSuccess("Your picks have been saved successfully!");
      setTimeout(() => setSuccess(null), 3000);
      return true;

    } catch (err) {
      console.error('Pick save error:', err);
      setError(formatErrorMessage(err));
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [userId, groupedEvents, picks, competitionId, leagueId]);

  return {
    // Data
    competition,
    league,
    groupedEvents,
    picks,
    userId,
    
    // States
    loading,
    submitting,
    error,
    success,
    
    // Actions
    handlePickChange,
    handleSubmitPicks,
    isLocked,
    
    // Utilities
    storageKey,
    picksCount,
  };
}