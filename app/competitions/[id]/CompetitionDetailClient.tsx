/*
================================================================================
File: app/competitions/[id]/CompetitionDetailClient.tsx (Final Fix)
================================================================================
This version is updated to work with the rebuilt user_picks table. It uses
the correct unique index names in the 'onConflict' parameter to save picks
for both public competitions and private leagues.
*/

'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Trophy, Clock, Calendar, CheckCircle, BarChart2, HelpCircle, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// --- Type Definitions ---
type Competition = { id: number; name: string; description: string | null; lock_date: string; allow_draws: boolean; };
type Team = { id: number; name: string; logo_url: string | null; };
type Game = { id: number; game_date: string; stage: string | null; group: string | null; team_a: Team | null; team_b: Team | null; winning_team_id: number | null; is_draw: boolean; };
type PropPrediction = { id: number; question: string; lock_date: string; correct_answer: string | null; };
type Event = (Game & { type: 'game' }) | (PropPrediction & { type: 'prop' });
type League = { id: string; name: string; };

// --- Helper Function to Build the Payload ---
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


// --- Main Page Component ---
export default function CompetitionDetailClient({ id }: { id: string }) {
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [league, setLeague] = useState<League | null>(null);
  const [groupedEvents, setGroupedEvents] = useState<{ [key: string]: Event[] }>({});
  const [picks, setPicks] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const competitionId = parseInt(id, 10);
  
  const searchParams = useSearchParams();
  const leagueId = searchParams.get('leagueId');

  const leaderboardUrl = leagueId ? `/leagues/${leagueId}/leaderboard` : `/competitions/${competitionId}/leaderboard`;

  const isLocked = (lockDate: string) => new Date(lockDate) < new Date();

  const fetchCompetitionData = useCallback(async (currentUserId: string) => {
    setLoading(true);
    setError(null);
    try {
      if (leagueId) {
        const { data: leagueData, error: leagueError } = await supabase.from('leagues').select('id, name').eq('id', leagueId).single();
        if (leagueError) throw leagueError;
        setLeague(leagueData);
      }

      const [competitionRes, gamesRes, groupingsRes, propPredictionsRes] = await Promise.all([
        supabase.from('competitions').select('*').eq('id', competitionId).single(),
        supabase.from('games').select('*, team_a:teams!games_team_a_id_fkey(*), team_b:teams!games_team_b_id_fkey(*)').eq('competition_id', competitionId),
        supabase.from('competition_teams').select('team_id, group').eq('competition_id', competitionId),
        supabase.from('prop_predictions').select('*').eq('competition_id', competitionId),
      ]);

      if (competitionRes.error) throw competitionRes.error;
      setCompetition(competitionRes.data);

      let picksQuery = supabase.from('user_picks').select('game_id, prop_prediction_id, pick').eq('user_id', currentUserId).eq('competition_id', competitionId);
      if (leagueId) {
        picksQuery = picksQuery.eq('league_id', leagueId);
      } else {
        picksQuery = picksQuery.is('league_id', null);
      }
      const { data: picksData, error: picksError } = await picksQuery;
      if (picksError) throw picksError;

      const groupMap = groupingsRes.data!.reduce((acc, item) => { acc[item.team_id] = item.group; return acc; }, {} as { [key: number]: string });
      const gamesWithGroups: Event[] = gamesRes.data!.map(game => ({ ...game, group: game.team_a ? groupMap[game.team_a.id] : null, type: 'game' }));
      const propsWithType: Event[] = propPredictionsRes.data!.map(p => ({ ...p, type: 'prop' }));
      const allEvents = [...gamesWithGroups, ...propsWithType].sort((a, b) => new Date(a.type === 'game' ? a.game_date : a.lock_date).getTime() - new Date(b.type === 'game' ? b.game_date : b.lock_date).getTime());
      const eventsByDate = allEvents.reduce((acc, event) => {
        const dateStr = event.type === 'game' ? event.game_date : event.lock_date;
        const date = new Date(dateStr).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        if (!acc[date]) { acc[date] = []; }
        acc[date].push(event);
        return acc;
      }, {} as { [key: string]: Event[] });
      setGroupedEvents(eventsByDate);
      
      const existingPicks = picksData.reduce((acc, pick) => {
        const key = pick.game_id ? `game_${pick.game_id}` : `prop_${pick.prop_prediction_id}`;
        acc[key] = pick.pick;
        return acc;
      }, {} as { [key: string]: string });
      setPicks(existingPicks);

    } catch (err) {
      if (err instanceof Error) { setError(err.message); } 
      else { setError("An unknown error occurred"); }
    } finally {
      setLoading(false);
    }
  }, [competitionId, leagueId]);

  useEffect(() => {
    const getAndSetUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        fetchCompetitionData(user.id);
      } else {
        setLoading(false);
        setError("You must be logged in to view this page.");
      }
    };
    getAndSetUser();
  }, [fetchCompetitionData]);
  
  const handlePickChange = (type: 'game' | 'prop', id: number, pickValue: string) => {
    const key = `${type}_${id}`;
    setPicks(prev => ({ ...prev, [key]: pickValue }));
  };

  const handleSubmitPicks = async () => {
    if (!userId) { setError("User not found."); return; }
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
      return;
    }

    const gamePicks = payload.filter(p => p.game_id !== null);
    const propPicks = payload.filter(p => p.prop_prediction_id !== null);
console.log("Submitting Game Picks:", gamePicks);
    console.log("Submitting Prop Picks:", propPicks);
    console.log(`🧮 Sending ${gamePicks.length} picks`);
console.table(gamePicks.map(p => ({
  game_id: p.game_id,
  league_id: p.league_id,
  pick: p.pick,
})));

    try {
      if (gamePicks.length > 0) {
        const { error: gameUpsertError } = await supabase.from('user_picks').upsert(gamePicks, {
          onConflict: leagueId 
            ? 'user_id,league_id,game_id'  // For league games: all 3 columns are indexed
            : 'user_id,game_id',           // For public games: only these 2 columns are indexed (league_id is in WHERE clause)
        });
        if (gameUpsertError) throw gameUpsertError;
      }

      if (propPicks.length > 0) {
        const { error: propUpsertError } = await supabase.from('user_picks').upsert(propPicks, {
          onConflict: leagueId 
            ? 'user_id,league_id,prop_prediction_id'  // For league props: all 3 columns are indexed
            : 'user_id,prop_prediction_id',           // For public props: only these 2 columns are indexed (league_id is in WHERE clause)
        });
        if (propUpsertError) throw propUpsertError;
      }

      setSuccess("Your picks have been saved successfully!");
      setTimeout(() => setSuccess(null), 3000);

    } catch (upsertError) {
      if (upsertError instanceof Error) { 
        setError(upsertError.message); 
      } else { 
        setError("An unknown error occurred while saving picks."); 
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) { return <div className="text-center p-10">Loading...</div>; }
  if (error) { return <div className="text-center p-10 text-red-500">Error: {error}</div>; }
  if (!competition) { return <div className="text-center p-10">Competition not found.</div>; }

  return (
    <div>
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
            <div className="flex items-center">
              <Trophy className="w-8 h-8 mr-4 text-blue-500 dark:text-violet-400" />
              <div>
                <h1 className="text-4xl font-bold">{competition.name}</h1>
                {league && <p className="text-lg text-slate-400 flex items-center gap-2"><Users size={16}/> Playing in league: <strong>{league.name}</strong></p>}
              </div>
            </div>
            <Link 
              href={leaderboardUrl}
              className="mt-4 sm:mt-0 inline-flex items-center justify-center px-4 py-2 bg-gray-200 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-800 dark:text-slate-300 rounded-full hover:bg-gray-300 dark:hover:bg-slate-700 transition-colors"
            >
                <BarChart2 className="w-5 h-5 mr-2" />
                View Leaderboard
            </Link>
        </div>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedEvents).map(([date, eventsOnDate]) => (
          <div key={date}>
            <h2 className="text-xl font-bold mb-4 flex items-center text-gray-700 dark:text-gray-300">
                <Calendar className="w-6 h-6 mr-3" />
                {date}
            </h2>
            <div className="space-y-6">
              {eventsOnDate.map(event => {
                // FIXED: Removed the unused 'eventDate' variable
                if (event.type === 'prop') {
                  const prop = event;
                  const userPick = picks[`prop_${prop.id}`];
                  const hasResult = prop.correct_answer !== null;
                  const isCorrect = hasResult && userPick === prop.correct_answer;
                  
                  return (
                    <div key={`prop_${prop.id}`} className={`bg-white dark:bg-gray-900 p-4 rounded-lg border-2 ${hasResult ? 'border-gray-300 dark:border-gray-700' : 'border-dashed border-blue-300 dark:border-blue-800'} ${isLocked(prop.lock_date) ? 'opacity-70' : ''}`}>
                      <div className="flex justify-between items-center mb-3">
                        <div className="relative group flex items-center">
                          <HelpCircle className="w-5 h-5 mr-2 text-blue-500" />
                          <p className="font-semibold">{prop.question}</p>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="w-4 h-4 mr-1.5"/>
                          {new Date(prop.lock_date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          {isLocked(prop.lock_date) && <span className="ml-2 text-xs font-bold text-red-500">(LOCKED)</span>}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                          <button 
                              disabled={isLocked(prop.lock_date)}
                              className={`relative w-full p-2 rounded-md border-2 font-semibold transition-all ${userPick === 'Yes' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 dark:bg-gray-800 hover:border-blue-500'}`}
                              onClick={() => handlePickChange('prop', prop.id, 'Yes')}
                          >
                              Yes
                              {hasResult && userPick === 'Yes' && (isCorrect ? <span className="absolute top-1 right-1 text-xs bg-green-500 text-white rounded-full px-2 py-0.5">+1 Point</span> : <span className="absolute top-1 right-1 text-xs bg-red-500 text-white rounded-full px-2 py-0.5">Incorrect</span>)}
                          </button>
                          <button 
                              disabled={isLocked(prop.lock_date)}
                              onClick={() => handlePickChange('prop', prop.id, 'No')}
                              className={`relative w-full p-2 rounded-md border-2 font-semibold transition-all ${userPick === 'No' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 dark:bg-gray-800 hover:border-blue-500'}`}
                          >
                              No
                              {hasResult && userPick === 'No' && (isCorrect ? <span className="absolute top-1 right-1 text-xs bg-green-500 text-white rounded-full px-2 py-0.5">+1 Point</span> : <span className="absolute top-1 right-1 text-xs bg-red-500 text-white rounded-full px-2 py-0.5">Incorrect</span>)}
                          </button>
                      </div>
                      {hasResult && <p className="text-xs text-gray-400 mt-2 text-center">Correct Answer: {prop.correct_answer}</p>}
                    </div>
                  )
                }
                
                const game = event;
                const userPick = picks[`game_${game.id}`];
                const hasResult = game.winning_team_id !== null || game.is_draw;
                const correctAnswer = game.is_draw ? 'draw' : game.winning_team_id?.toString();
                const isCorrect = hasResult && userPick === correctAnswer;

                return (
                  <div key={`game_${game.id}`} className={`bg-white dark:bg-gray-900 p-4 rounded-lg border ${hasResult ? 'border-gray-300 dark:border-gray-700' : 'border-gray-200 dark:border-gray-800'} ${isLocked(game.game_date) ? 'opacity-70' : ''}`}>
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                        {game.stage} {game.group ? `- ${game.group}` : ''}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="w-4 h-4 mr-1.5"/>
                        {new Date(game.game_date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        {isLocked(game.game_date) && <span className="ml-2 text-xs font-bold text-red-500">(LOCKED)</span>}
                      </div>
                    </div>
                    <div className={`grid ${competition.allow_draws === true ? 'grid-cols-3' : 'grid-cols-2'} gap-2 items-center`}>
                      <button 
                        disabled={isLocked(game.game_date)}
                        onClick={() => handlePickChange('game', game.id, game.team_a!.id.toString())}
                        className={`relative flex flex-col items-center justify-center p-3 rounded-md border-2 transition-all ${userPick === game.team_a!.id.toString() ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 dark:bg-gray-800 hover:border-blue-500'}`}
                      >
                        {hasResult && userPick === game.team_a!.id.toString() && (isCorrect ? <span className="absolute top-1 right-1 text-xs bg-green-500 text-white rounded-full px-2 py-0.5">+1 Point</span> : <span className="absolute top-1 right-1 text-xs bg-red-500 text-white rounded-full px-2 py-0.5">Incorrect</span>)}
                        {game.team_a?.logo_url && <Image src={game.team_a.logo_url} alt={`${game.team_a.name} logo`} width={40} height={40} className="w-10 h-10 rounded-full mb-2 object-cover"/>}
                        <span className="font-semibold text-center">{game.team_a?.name}</span>
                      </button>
                      
                      {competition.allow_draws === true && (
                        <button 
                          disabled={isLocked(game.game_date)}
                          onClick={() => handlePickChange('game', game.id, 'draw')}
                          className={`relative flex flex-col items-center justify-center p-3 rounded-md border-2 h-full transition-all ${userPick === 'draw' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 dark:bg-gray-800 hover:border-blue-500'}`}
                        >
                          {hasResult && userPick === 'draw' && (isCorrect ? <span className="absolute top-1 right-1 text-xs bg-green-500 text-white rounded-full px-2 py-0.5">+1 Point</span> : <span className="absolute top-1 right-1 text-xs bg-red-500 text-white rounded-full px-2 py-0.5">Incorrect</span>)}
                          <span className="font-bold text-lg">DRAW</span>
                        </button>
                      )}

                      <button 
                        disabled={isLocked(game.game_date)}
                        onClick={() => handlePickChange('game', game.id, game.team_b!.id.toString())}
                        className={`relative flex flex-col items-center justify-center p-3 rounded-md border-2 transition-all ${userPick === game.team_b!.id.toString() ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 dark:bg-gray-800 hover:border-blue-500'}`}
                      >
                        {hasResult && userPick === game.team_b!.id.toString() && (isCorrect ? <span className="absolute top-1 right-1 text-xs bg-green-500 text-white rounded-full px-2 py-0.5">+1 Point</span> : <span className="absolute top-1 right-1 text-xs bg-red-500 text-white rounded-full px-2 py-0.5">Incorrect</span>)}
                        {game.team_b?.logo_url && <Image src={game.team_b.logo_url} alt={`${game.team_b.name} logo`} width={40} height={40} className="w-10 h-10 rounded-full mb-2 object-cover"/>}
                        <span className="font-semibold text-center">{game.team_b?.name}</span>
                      </button>
                    </div>
                    {hasResult && <p className="text-xs text-gray-400 mt-2 text-center">Correct Answer: {game.is_draw ? 'Draw' : (game.winning_team_id === game.team_a?.id ? game.team_a.name : game.team_b?.name)}</p>}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 shadow-lg sticky bottom-4 flex items-center justify-between">
        <div>
            {success && <p className="text-green-600 font-semibold">{success}</p>}
            {error && <p className="text-red-600 font-semibold">{error}</p>}
        </div>
        <button 
          onClick={handleSubmitPicks}
          disabled={submitting}
          className="px-8 py-3 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 disabled:bg-gray-400 flex items-center"
        >
          {submitting ? 'Saving...' : 'Save My Picks'}
          <CheckCircle className="w-5 h-5 ml-2"/>
        </button>
      </div>

    </div>
  );
}
