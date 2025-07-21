'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Trophy, Clock, Calendar, CheckCircle, BarChart2, Info, HelpCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// Define the types for our data
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
};

type PropPrediction = {
  id: number;
  question: string;
  lock_date: string;
};

// A new union type to handle both games and props in one list
type Event = (Game & { type: 'game' }) | (PropPrediction & { type: 'prop' });


// This component receives the competition ID as a simple prop
export default function CompetitionDetailClient({ id }: { id: string }) {
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [groupedEvents, setGroupedEvents] = useState<{ [key: string]: Event[] }>({});
  const [picks, setPicks] = useState<{ [key: string]: string }>({}); // Key can be game_id or prop_id
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const competitionId = parseInt(id, 10);

  const isLocked = (lockDate: string) => new Date(lockDate) < new Date();

  const fetchCompetitionData = useCallback(async (currentUserId: string) => {
    setLoading(true);
    setError(null);
    try {
      const [competitionRes, gamesRes, groupingsRes, propPredictionsRes, picksRes] = await Promise.all([
        supabase.from('competitions').select('*').eq('id', competitionId).single(),
        supabase.from('games').select('*, team_a:teams!games_team_a_id_fkey(*), team_b:teams!games_team_b_id_fkey(*)').eq('competition_id', competitionId),
        supabase.from('competition_teams').select('team_id, group').eq('competition_id', competitionId),
        supabase.from('prop_predictions').select('*').eq('competition_id', competitionId),
        supabase.from('user_picks').select('game_id, prop_prediction_id, pick').eq('user_id', currentUserId).eq('competition_id', competitionId),
      ]);

      if (competitionRes.error) throw competitionRes.error;
      setCompetition(competitionRes.data);

      if (gamesRes.error) throw gamesRes.error;
      if (groupingsRes.error) throw groupingsRes.error;
      if (propPredictionsRes.error) throw propPredictionsRes.error;

      const groupMap = groupingsRes.data.reduce((acc, item) => {
          acc[item.team_id] = item.group;
          return acc;
      }, {} as { [key: number]: string });

      const gamesWithGroups: Event[] = gamesRes.data.map(game => ({
          ...game,
          group: game.team_a ? groupMap[game.team_a.id] : null,
          type: 'game'
      }));

      const propsWithType: Event[] = propPredictionsRes.data.map(p => ({ ...p, type: 'prop' }));

      // Combine games and props into a single array and sort by date
      const allEvents = [...gamesWithGroups, ...propsWithType].sort((a, b) => {
        const dateA = new Date(a.type === 'game' ? a.game_date : a.lock_date);
        const dateB = new Date(b.type === 'game' ? b.game_date : b.lock_date);
        return dateA.getTime() - dateB.getTime();
      });

      // Group all events by date
      const eventsByDate = allEvents.reduce((acc, event) => {
        const dateStr = event.type === 'game' ? event.game_date : event.lock_date;
        const date = new Date(dateStr).toLocaleDateString(undefined, {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        if (!acc[date]) { acc[date] = []; }
        acc[date].push(event);
        return acc;
      }, {} as { [key: string]: Event[] });
      setGroupedEvents(eventsByDate);
      
      if (picksRes.error) throw picksRes.error;
      const existingPicks = picksRes.data.reduce((acc, pick) => {
        const key = pick.game_id ? `game_${pick.game_id}` : `prop_${pick.prop_prediction_id}`;
        acc[key] = pick.pick;
        return acc;
      }, {} as { [key: string]: string });
      setPicks(existingPicks);

    } catch (err) {
      if (err instanceof Error) { setError(err.message); } 
      else { setError("An unknown error occurred"); }
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [competitionId]);

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
    if (!userId) {
      setError("User not found. Please log in again.");
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const allPicks = Object.entries(picks).map(([key, pick]) => {
      const [type, id] = key.split('_');
      return {
        user_id: userId,
        competition_id: competitionId,
        game_id: type === 'game' ? parseInt(id) : null,
        prop_prediction_id: type === 'prop' ? parseInt(id) : null,
        pick: pick,
      };
    });

    if (allPicks.length === 0) {
        setError("You haven't made any picks.");
        setSubmitting(false);
        return;
    }

    const gamePicks = allPicks.filter(p => p.game_id !== null);
    const propPicks = allPicks.filter(p => p.prop_prediction_id !== null);

    try {
      if (gamePicks.length > 0) {
        const { error: gameUpsertError } = await supabase.from('user_picks').upsert(gamePicks, {
          onConflict: 'user_id, game_id',
        });
        if (gameUpsertError) throw gameUpsertError;
      }

      if (propPicks.length > 0) {
        const { error: propUpsertError } = await supabase.from('user_picks').upsert(propPicks, {
          onConflict: 'user_id, prop_prediction_id',
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

  if (loading) { return <div className="text-center p-10">Loading competition...</div>; }
  if (error) { return <div className="text-center p-10 text-red-500">Error: {error}</div>; }
  if (!competition) { return <div className="text-center p-10">Competition not found.</div>; }

  return (
    <div>
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
            <div className="flex items-center">
              <Trophy className="w-8 h-8 mr-4 text-blue-500" />
              <h1 className="text-4xl font-bold">{competition.name}</h1>
            </div>
            <Link 
              href={`/competitions/${competitionId}/leaderboard`}
              className="mt-4 sm:mt-0 inline-flex items-center justify-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold transition-colors"
            >
                <BarChart2 className="w-5 h-5 mr-2" />
                View Leaderboard
            </Link>
        </div>
        <p className="text-gray-600 dark:text-gray-400 sm:ml-12">{competition.description}</p>
        
        <div className="mt-4 sm:ml-12 p-4 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 rounded-r-lg flex items-start">
            <Info className="w-5 h-5 mr-3 mt-1 text-blue-500 flex-shrink-0" />
            <div>
                <h4 className="font-bold text-blue-800 dark:text-blue-300">A Note on Predictions</h4>
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">You can change your picks for any game as many times as you like until the scheduled start time of that specific game. Once a game begins, its prediction is locked permanently.</p>
            </div>
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
                if (event.type === 'prop') {
                  const prop = event;
                  return (
                    <div key={`prop_${prop.id}`} className={`bg-white dark:bg-gray-900 p-4 rounded-lg border-2 border-dashed border-blue-300 dark:border-blue-800 ${isLocked(prop.lock_date) ? 'opacity-60' : ''}`}>
                      <div className="flex justify-between items-center mb-3">
                        <div className="relative group flex items-center">
                          <HelpCircle className="w-5 h-5 mr-2 text-blue-500" />
                          <p className="font-semibold">{prop.question}</p>
                          <div className="absolute bottom-full mb-2 w-max px-3 py-1.5 text-sm text-white bg-gray-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            A special prediction event, not a standard game.
                          </div>
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
                              onClick={() => handlePickChange('prop', prop.id, 'Yes')}
                              className={`w-full p-2 rounded-md border-2 font-semibold transition-all ${picks[`prop_${prop.id}`] === 'Yes' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 dark:bg-gray-800 hover:border-blue-500'}`}
                          >
                              Yes
                          </button>
                          <button 
                              disabled={isLocked(prop.lock_date)}
                              onClick={() => handlePickChange('prop', prop.id, 'No')}
                              className={`w-full p-2 rounded-md border-2 font-semibold transition-all ${picks[`prop_${prop.id}`] === 'No' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 dark:bg-gray-800 hover:border-blue-500'}`}
                          >
                              No
                          </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-2 text-center">A correct answer is worth 1 point.</p>
                    </div>
                  )
                }
                
                const game = event;
                return (
                  <div key={`game_${game.id}`} className={`bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800 ${isLocked(game.game_date) ? 'opacity-60' : ''}`}>
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
                        className={`flex flex-col items-center justify-center p-3 rounded-md border-2 transition-all ${picks[`game_${game.id}`] === game.team_a!.id.toString() ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 dark:bg-gray-800 hover:border-blue-500'}`}
                      >
                        {game.team_a?.logo_url && (
                          <Image 
                            src={game.team_a.logo_url} 
                            alt={`${game.team_a.name} logo`} 
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full mb-2 object-cover"
                          />
                        )}
                        <span className="font-semibold text-center">{game.team_a?.name}</span>
                      </button>
                      
                      {competition.allow_draws === true && (
                        <button 
                          disabled={isLocked(game.game_date)}
                          onClick={() => handlePickChange('game', game.id, 'draw')}
                          className={`flex flex-col items-center justify-center p-3 rounded-md border-2 h-full transition-all ${picks[`game_${game.id}`] === 'draw' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 dark:bg-gray-800 hover:border-blue-500'}`}
                        >
                          <span className="font-bold text-lg">DRAW</span>
                        </button>
                      )}

                      <button 
                        disabled={isLocked(game.game_date)}
                        onClick={() => handlePickChange('game', game.id, game.team_b!.id.toString())}
                        className={`flex flex-col items-center justify-center p-3 rounded-md border-2 transition-all ${picks[`game_${game.id}`] === game.team_b!.id.toString() ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 dark:bg-gray-800 hover:border-blue-500'}`}
                      >
                        {game.team_b?.logo_url && (
                          <Image 
                            src={game.team_b.logo_url} 
                            alt={`${game.team_b.name} logo`} 
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full mb-2 object-cover"
                          />
                        )}
                        <span className="font-semibold text-center">{game.team_b?.name}</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-lg sticky bottom-4 flex items-center justify-between">
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