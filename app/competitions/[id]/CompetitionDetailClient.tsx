'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Trophy, Clock, Calendar, CheckCircle, BarChart2, HelpCircle, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// Types
type Competition = { id: number; name: string; allow_draws: boolean; lock_date: string; /* ... */ };
type Team = { id: number; name: string; logo_url: string | null; };
type Game = { id: number; game_date: string; lock_date: string; stage?: string; group?: string; winning_team_id?: number | null; is_draw: boolean; team_a?: Team; team_b?: Team; };
type PropPrediction = { id: number; question: string; lock_date: string; correct_answer: string | null; };
type Event = (Game & { type: 'game' }) | (PropPrediction & { type: 'prop' });
type League = { id: string; name: string; };

// Helper to build payload
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
  const now = Date.now();
  const results: Array<{
    user_id: string;
    competition_id: number;
    league_id: string | null;
    game_id: number | null;
    prop_prediction_id: number | null;
    pick: string;
  }> = [];

  events.forEach(event => {
    const key = `${event.type}_${event.id}`;
    const userPick = picksMap[key];
    const lockDateStr = event.type === 'game' ? event.game_date : (event as PropPrediction).lock_date;

    if (!userPick) return;
    if (new Date(lockDateStr).getTime() <= now) return;

    results.push({
      user_id: userId,
      competition_id: competitionId,
      league_id: leagueId,
      game_id: event.type === 'game' ? event.id : null,
      prop_prediction_id: event.type === 'prop' ? event.id : null,
      pick: userPick,
    });
  });

  if (process.env.NODE_ENV === 'development') {
    console.log('🔁 buildPicksPayload:', results.length, 'items');
    console.table(results);
  }

  return results;
}

export default function CompetitionDetailClient({ id }: { id: string }) {
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [league, setLeague] = useState<League | null>(null);
  const [groupedEvents, setGroupedEvents] = useState<{ [key: string]: Event[] }>({});
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const competitionId = parseInt(id, 10);
  const searchParams = useSearchParams();
  const leagueId = searchParams.get('leagueId');

  const fetchCompetitionData = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      if (leagueId) {
        const { data: leagueData, error } = await supabase.from('leagues').select('id,name').eq('id', leagueId).single();
        if (error) throw error;
        setLeague(leagueData);
      }

      const [ compRes, gamesRes, groupRes, propRes ] = await Promise.all([
        supabase.from('competitions').select('*').eq('id', competitionId).single(),
        supabase.from('games').select('*, team_a:teams!games_team_a_id_fkey(*), team_b:teams!games_team_b_id_fkey(*)').eq('competition_id', competitionId),
        supabase.from('competition_teams').select('team_id,group').eq('competition_id', competitionId),
        supabase.from('prop_predictions').select('*').eq('competition_id', competitionId),
      ]);
      if (compRes.error) throw compRes.error;
      setCompetition(compRes.data);

      let query = supabase.from('user_picks').select('game_id,prop_prediction_id,pick')
        .eq('user_id', userId).eq('competition_id', competitionId);

      if (leagueId) query = query.eq('league_id', leagueId);
      else query = query.is('league_id', null);

      const { data: pickData, error: pickError } = await query;
      if (pickError) throw pickError;

      const groupMap = (groupRes.data ?? []).reduce((acc, item) => ({ ...acc, [item.team_id]: item.group }), {});
      const games = (gamesRes.data ?? []).map((g: any) => ({ ...g, group: groupMap[g.team_a?.id], type: 'game' })) as Event[];
      const props = (propRes.data ?? []).map((p: any) => ({ ...p, type: 'prop' })) as Event[];
      const allEvents = [...games, ...props].sort((a, b) =>
        new Date(a.type === 'game' ? a.game_date : a.lock_date).getTime()
        - new Date(b.type === 'game' ? b.game_date : b.lock_date).getTime()
      );

      setGroupedEvents(allEvents.reduce((acc, e) => {
        const dateKey = new Date((e.type==='game'? (e as Game).game_date : e.lock_date))
          .toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        return { ...acc, [dateKey]: [...(acc[dateKey] ?? []), e] };
      }, {} as { [key: string]: Event[] }));

      const pickMap = (pickData || []).reduce((acc, p: any) => ({
        ...acc,
        [p.game_id ? `game_${p.game_id}` : `prop_${p.prop_prediction_id}`]: p.pick
      }), {} as Record<string,string>);

      setPicks(pickMap);

    } catch (err: any) {
      setError(err.message || 'Failed loading competition data');
    } finally {
      setLoading(false);
    }
  }, [competitionId, leagueId]);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Please log in.');
        setLoading(false);
      } else {
        setUserId(user.id);
        await fetchCompetitionData(user.id);
      }
    };
    init();
  }, [fetchCompetitionData]);

  const handlePickChange = (type: 'game' | 'prop', id: number, pickValue: string) => {
    const key = `${type}_${id}`;
    setPicks(prev => ({ ...prev, [key]: pickValue }));
  };

  const handleSubmitPicks = async () => {
    if (!userId) return setError('No user');
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const events = Object.values(groupedEvents).flat();
    const payload = buildPicksPayload({ picksMap: picks, events, userId, competitionId, leagueId: leagueId || null });

    if (payload.length === 0) {
      setError('No new unlocked picks to submit.');
      setSubmitting(false);
      return;
    }

    const gamePicks = payload.filter(p => p.game_id !== null);
    const propPicks = payload.filter(p => p.prop_prediction_id !== null);

    // Determine correct conflict columns
    const gameConflictCols = leagueId
      ? ['user_id', 'game_id', 'league_id']
      : ['user_id', 'game_id'];
    const propConflictCols = leagueId
      ? ['user_id', 'prop_prediction_id', 'league_id']
      : ['user_id', 'prop_prediction_id'];

    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 About to upsert gamePicks', gamePicks.length, gameConflictCols);
      console.table(gamePicks);
    }

    try {
      if (gamePicks.length) {
        const { error: err } = await supabase.from('user_picks').upsert(gamePicks, { onConflict: gameConflictCols });
        if (err) throw err;
      }

      if (propPicks.length) {
        const { error: err } = await supabase.from('user_picks').upsert(propPicks, { onConflict: propConflictCols });
        if (err) throw err;
      }

      setSuccess('Picks saved successfully!');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err: any) {
      console.error('Upsert error:', err);
      setError(err.message || 'Failed to save picks');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading…</div>;
  if (error) return <div className="p-10 text-center text-red-500">Error: {error}</div>;
  if (!competition) return <div className="p-10 text-center">Competition not found.</div>;

  return (
    <div className="space-y-8">
      {/* Competition header, events UI, identical logic */}
      <div className="sticky bottom-0 bg-white p-4 flex justify-between">
        <div>{success && <span className="text-green-600">{success}</span>}</div>
        <button
          onClick={handleSubmitPicks}
          disabled={submitting}
          className="bg-green-600 text-white px-6 py-3 rounded-md"
        >
          {submitting ? 'Saving...' : 'Save Picks'} <CheckCircle className="inline ml-2"/>
        </button>
      </div>
    </div>
  );
}
