// ================================================================================
// File: hooks/useLeagues.ts
// ================================================================================

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { League, Profile, LeagueJoinResponse } from '@/lib/types';
import { generateInviteCode, validateLeagueName, validateInviteCode, formatErrorMessage } from '@/lib/utils';

interface UseLeaguesReturn {
  leagues: League[];
  loading: boolean;
  error: string | null;
  fetchLeagues: () => Promise<void>;
  createLeague: (name: string, competitionId: number, profile: Profile) => Promise<{ success: boolean; error?: string }>;
  joinLeague: (inviteCode: string) => Promise<{ success: boolean; message: string }>;
  deleteLeague: (leagueId: string) => Promise<{ success: boolean; error?: string }>;
}

export function useLeagues(): UseLeaguesReturn {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeagues = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: leaguesData, error: leaguesError } = await supabase
        .from('leagues')
        .select(`*, competitions(name), league_members(profiles(username))`)
        .order('created_at', { ascending: false });

      if (leaguesError) throw leaguesError;

      setLeagues(leaguesData as League[]);
    } catch (err) {
      const errorMessage = formatErrorMessage(err);
      setError(errorMessage);
      console.error('Error fetching leagues:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createLeague = useCallback(async (
    name: string, 
    competitionId: number, 
    profile: Profile
  ): Promise<{ success: boolean; error?: string }> => {
    // Validate inputs
    const nameError = validateLeagueName(name);
    if (nameError) {
      return { success: false, error: nameError };
    }

    if (!competitionId) {
      return { success: false, error: 'Please select a competition' };
    }

    setError(null);

    try {
      const inviteCode = generateInviteCode();

      // Create league
      const { data: leagueData, error: leagueError } = await supabase
        .from('leagues')
        .insert({
          name: name.trim(),
          admin_id: profile.id,
          competition_id: competitionId,
          invite_code: inviteCode
        })
        .select()
        .single();

      if (leagueError) throw leagueError;

      // Add creator as first member
      const { error: memberError } = await supabase
        .from('league_members')
        .insert({ league_id: leagueData.id, user_id: profile.id });

      if (memberError) throw memberError;

      // Refresh leagues list
      await fetchLeagues();

      return { success: true };
    } catch (err) {
      const errorMessage = formatErrorMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [fetchLeagues]);

  const joinLeague = useCallback(async (
    inviteCode: string
  ): Promise<{ success: boolean; message: string }> => {
    // Validate invite code
    const codeError = validateInviteCode(inviteCode);
    if (codeError) {
      return { success: false, message: codeError };
    }

    setError(null);

    try {
      const { data, error } = await supabase.rpc('join_league', {
        invite_code_to_join: inviteCode.trim()
      });

      if (error) throw error;

      const result = data as LeagueJoinResponse;

      if (result.success) {
        // Refresh leagues list
        await fetchLeagues();
      }

      return {
        success: result.success,
        message: result.message
      };
    } catch (err) {
      const errorMessage = formatErrorMessage(err);
      setError(errorMessage);
      return {
        success: false,
        message: 'An error occurred while joining the league'
      };
    }
  }, [fetchLeagues]);

  const deleteLeague = useCallback(async (
    leagueId: string
  ): Promise<{ success: boolean; error?: string }> => {
    setError(null);

    try {
      const { error } = await supabase.from('leagues').delete().eq('id', leagueId);
      
      if (error) throw error;

      // Refresh leagues list
      await fetchLeagues();

      return { success: true };
    } catch (err) {
      const errorMessage = formatErrorMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [fetchLeagues]);

  return {
    leagues,
    loading,
    error,
    fetchLeagues,
    createLeague,
    joinLeague,
    deleteLeague,
  };
}