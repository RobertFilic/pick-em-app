'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Trophy, Clock, CheckCircle, BarChart2, Info } from 'lucide-react';
import Link from 'next/link';

// Define the types for our data
type Competition = {
  id: number;
  name: string;
  description: string | null;
  lock_date: string;
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
  group: string | null; // Added to store group info
  team_a: Team | null;
  team_b: Team | null;
};

type Pick = {
  game_id: number;
  pick: string; // Will store team_id or 'draw'
};

// The props for this page component will include the dynamic `id`
type PageProps = {
  params: { id: string };
};

export default function CompetitionPage({ params }: PageProps) {
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [picks, setPicks] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const competitionId = parseInt(params.id);

  const isGameLocked = (gameDate: string) => new Date(gameDate) < new Date();

  const fetchAllData = useCallback(async (currentUserId: string) => {
    setLoading(true);
    setError(null);

    try {
      // Fetch competition details, games, groupings, and user's existing picks in parallel
      const [competitionRes, gamesRes, groupingsRes, picksRes] = await Promise.all([
        supabase.from('competitions').select('*').eq('id', competitionId).single(),
        supabase.from('games').select('*, team_a:teams!games_team_a_id_fkey(*), team_b:teams!games_team_b_id_fkey(*)').eq('competition_id', competitionId).order('game_date', { ascending: true }),
        supabase.from('competition_teams').select('team_id, group').eq('competition_id', competitionId),
        supabase.from('user_picks').select('game_id, pick').eq('user_id', currentUserId).eq('competition_id', competitionId)
      ]);

      if (competitionRes.error) throw competitionRes.error;
      setCompetition(competitionRes.data);
      
      if (gamesRes.error) throw gamesRes.error;
      if (groupingsRes.error) throw groupingsRes.error;

      // Create a map of team IDs to their group name
      const groupMap = groupingsRes.data.reduce((acc, item) => {
          acc[item.team_id] = item.group;
          return acc;
      }, {} as { [key: number]: string });

      // Add the group information to each game object
      const gamesWithGroups = gamesRes.data.map(game => ({
          ...game,
          group: game.team_a ? groupMap[game.team_a.id] : null
      }));
      setGames(gamesWithGroups as Game[]);

      if (picksRes.error) throw picksRes.error;
      const existingPicks = picksRes.data.reduce((acc, pick) => {
        acc[pick.game_id] = pick.pick;
        return acc;
      }, {} as { [key: number]: string });
      setPicks(existingPicks);

    } catch (err: any) {
      setError(err.message);
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
        fetchAllData(user.id);
      } else {
        setLoading(false);
        setError("You must be logged in to view this page.");
      }
    };
    getAndSetUser();
  }, [fetchAllData]);

  const handlePickChange = (gameId: number, pick: string) => {
    setPicks(prev => ({ ...prev, [gameId]: pick }));
  };

  const handleSubmitPicks = async () => {
    if (!userId) {
      setError("User not found. Please log in again.");
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const picksToUpsert = Object.entries(picks).map(([game_id, pick]) => ({
      user_id: userId,
      competition_id: competitionId,
      game_id: parseInt(game_id),
      pick: pick,
    }));

    if (picksToUpsert.length === 0) {
        setError("You haven't made any picks.");
        setSubmitting(false);
        return;
    }

    const { error: upsertError } = await supabase.from('user_picks').upsert(picksToUpsert, {
      onConflict: 'user_id, game_id',
    });

    if (upsertError) {
      setError(upsertError.message);
    } else {
      setSuccess("Your picks have been saved successfully!");
      setTimeout(() => setSuccess(null), 3000);
    }
    setSubmitting(false);
  };
  
  if (loading) {
    return <div className="text-center p-10">Loading competition...</div>;
  }

  if (error && !competition) {
    return <div className="text-center p-10 text-red-500">Error: {error}</div>;
  }
  
  if (!competition) {
    return <div className="text-center p-10">Competition not found.</div>;
  }

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
        
        {/* Added Note Section */}
        <div className="mt-4 sm:ml-12 p-4 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 rounded-r-lg flex items-start">
            <Info className="w-5 h-5 mr-3 mt-1 text-blue-500 flex-shrink-0" />
            <div>
                <h4 className="font-bold text-blue-800 dark:text-blue-300">A Note on Predictions</h4>
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">You can change your picks for any game as many times as you like until the scheduled start time of that specific game. Once a game begins, its prediction is locked permanently.</p>
            </div>
        </div>
      </div>

      <div className="space-y-6">
        {games.map(game => (
          <div key={game.id} className={`bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800 ${isGameLocked(game.game_date) ? 'opacity-60' : ''}`}>
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                {game.stage} {game.group ? `- ${game.group}` : ''}
              </p>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Clock className="w-4 h-4 mr-1.5"/>
                {new Date(game.game_date).toLocaleString()}
                {isGameLocked(game.game_date) && <span className="ml-2 text-xs font-bold text-red-500">(LOCKED)</span>}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 items-center">
              <button 
                disabled={isGameLocked(game.game_date)}
                onClick={() => handlePickChange(game.id, game.team_a!.id.toString())}
                className={`flex flex-col items-center justify-center p-3 rounded-md border-2 transition-all ${picks[game.id] === game.team_a!.id.toString() ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 dark:bg-gray-800 hover:border-blue-500'}`}
              >
                <img src={game.team_a?.logo_url || `https://placehold.co/40x40/E2E8F0/4A5568?text=${game.team_a?.name.charAt(0)}`} alt="" className="w-10 h-10 rounded-full mb-2"/>
                <span className="font-semibold text-center">{game.team_a?.name}</span>
              </button>
              <button 
                disabled={isGameLocked(game.game_date)}
                onClick={() => handlePickChange(game.id, 'draw')}
                className={`flex flex-col items-center justify-center p-3 rounded-md border-2 h-full transition-all ${picks[game.id] === 'draw' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 dark:bg-gray-800 hover:border-blue-500'}`}
              >
                <span className="font-bold text-lg">DRAW</span>
              </button>
              <button 
                disabled={isGameLocked(game.game_date)}
                onClick={() => handlePickChange(game.id, game.team_b!.id.toString())}
                className={`flex flex-col items-center justify-center p-3 rounded-md border-2 transition-all ${picks[game.id] === game.team_b!.id.toString() ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 dark:bg-gray-800 hover:border-blue-500'}`}
              >
                <img src={game.team_b?.logo_url || `https://placehold.co/40x40/E2E8F0/4A5568?text=${game.team_b?.name.charAt(0)}`} alt="" className="w-10 h-10 rounded-full mb-2"/>
                <span className="font-semibold text-center">{game.team_b?.name}</span>
              </button>
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