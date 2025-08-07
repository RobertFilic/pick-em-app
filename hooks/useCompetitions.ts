// ================================================================================
// File: hooks/useCompetitions.ts
// ================================================================================

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Competition } from '@/lib/types';
import { formatErrorMessage } from '@/lib/utils';

interface UseCompetitionsReturn {
  competitions: Competition[];
  loading: boolean;
  error: string | null;
  fetchCompetitions: () => Promise<void>;
  getCompetitionById: (id: number) => Competition | undefined;
}

export function useCompetitions(): UseCompetitionsReturn {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompetitions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: competitionsData, error: competitionsError } = await supabase
        .from('competitions')
        .select('id, name, description')
        .order('name');

      if (competitionsError) throw competitionsError;

      setCompetitions(competitionsData || []);
    } catch (err) {
      const errorMessage = formatErrorMessage(err);
      setError(errorMessage);
      console.error('Error fetching competitions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getCompetitionById = useCallback((id: number): Competition | undefined => {
    return competitions.find(comp => comp.id === id);
  }, [competitions]);

  return {
    competitions,
    loading,
    error,
    fetchCompetitions,
    getCompetitionById,
  };
}