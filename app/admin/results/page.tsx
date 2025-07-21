'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ClipboardList, CheckCircle, Edit, XCircle, CalendarClock } from 'lucide-react';

// --- Type Definitions ---
// FIXED: The types for joined tables are now correctly defined as arrays
// to match the data structure returned by the Supabase query during build.
type GameForResult = {
  id: number;
  stage: string | null;
  game_date: string;
  competitions: { name: string }[] | null;
  team_a: { id: number; name: string }[] | null;
  team_b: { id: number; name: string }[] | null;
  winning_team_id: number | null;
  is_draw: boolean;
};

// --- Main Page Component ---
export default function ResultsPage() {
  // --- State Management ---
  const [pendingGames, setPendingGames] = useState<GameForResult[]>([]);
  const [completedGames, setCompletedGames] = useState<GameForResult[]>([]);
  const [scheduledGames, setScheduledGames] = useState<GameForResult[]>([]);
  const [results, setResults] = useState<{ [key: number]: string }>({});
  const [editingGameId, setEditingGameId] = useState<number | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // --- Data Fetching ---
  const fetchAllGames = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const { data, error: fetchError } = await supabase
      .from('games')
      .select(`
        id, stage, game_date, winning_team_id, is_draw,
        competitions ( name ),
        team_a: team_a_id ( id, name ),
        team_b: team_b_id ( id, name )
      `)
      .order('game_date', { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
      console.error('Error fetching games:', fetchError);
    } else if (data) {
      // ADDED: Log the raw data from Supabase
      console.log("Raw data from Supabase:", data);

      const now = new Date();
      
      const validGames = data.filter(game => 
        game.team_a && Array.isArray(game.team_a) && game.team_a.length > 0 &&
        game.team_b && Array.isArray(game.team_b) && game.team_b.length > 0 &&
        game.competitions && Array.isArray(game.competitions) && game.competitions.length > 0
      );

      // ADDED: Log the data after filtering for valid games
      console.log("Valid games after filtering:", validGames);

      const pastGames = validGames.filter(game => new Date(game.game_date) < now);
      const futureGames = validGames.filter(game => new Date(game.game_date) >= now);

      const pending = pastGames.filter(game => game.winning_team_id === null && !game.is_draw);
      const completed = pastGames.filter(game => game.winning_team_id !== null || game.is_draw);
      
      // ADDED: Log the categorized lists
      console.log("Pending Games:", pending);
      console.log("Completed Games:", completed);
      console.log("Scheduled Games:", futureGames);

      setPendingGames(pending.reverse() as GameForResult[]);
      setCompletedGames(completed.reverse() as GameForResult[]);
      setScheduledGames(futureGames as GameForResult[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAllGames();
  }, [fetchAllGames]);

  // --- Event Handlers ---
  const handleResultChange = (gameId: number, result: string) => {
    setResults(prev => ({ ...prev, [gameId]: result }));
  };

  const handleEditClick = (game: GameForResult) => {
    setEditingGameId(game.id);
    if (game.is_draw) {
      setResults(prev => ({ ...prev, [game.id]: 'draw' }));
    } else if (game.winning_team_id) {
      setResults(prev => ({ ...prev, [game.id]: game.winning_team_id!.toString() }));
    }
  };

  const handleSubmitResult = async (gameId: number) => {
    const result = results[gameId];
    if (!result) {
      setError('Please select a result for this game.');
      return;
    }
    
    setSuccess(null);
    setError(null);

    const updateData: { winning_team_id: number | null; is_draw: boolean } = {
        winning_team_id: null,
        is_draw: false
    };

    if (result === 'draw') {
      updateData.is_draw = true;
    } else {
      updateData.winning_team_id = parseInt(result);
    }

    const { error: updateError } = await supabase
      .from('games')
      .update(updateData)
      .eq('id', gameId);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(`Result for game ${gameId} has been saved.`);
      setEditingGameId(null);
      await fetchAllGames();
    }
  };
  
  // --- JSX Rendering ---
  const renderGameControls = (game: GameForResult) => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-3">
        <div className="flex-grow grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
            <button 
                onClick={() => handleResultChange(game.id, game.team_a![0]!.id.toString())}
                className={`p-2 rounded-md text-sm font-semibold border-2 transition-all ${results[game.id] === game.team_a![0]!.id.toString() ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-blue-500'}`}
            >
                {game.team_a?.[0]?.name} Wins
            </button>
            <button 
                onClick={() => handleResultChange(game.id, 'draw')}
                className={`p-2 rounded-md text-sm font-semibold border-2 transition-all ${results[game.id] === 'draw' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-blue-500'}`}
            >
                Draw
            </button>
            <button 
                onClick={() => handleResultChange(game.id, game.team_b![0]!.id.toString())}
                className={`p-2 rounded-md text-sm font-semibold border-2 transition-all ${results[game.id] === game.team_b![0]!.id.toString() ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-blue-500'}`}
            >
                {game.team_b?.[0]?.name} Wins
            </button>
        </div>
        <div className="flex w-full sm:w-auto space-x-2">
            <button
                onClick={() => handleSubmitResult(game.id)}
                disabled={!results[game.id]}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold flex items-center justify-center disabled:bg-gray-400"
            >
                <CheckCircle className="w-5 h-5 mr-2" />
                Save
            </button>
            {editingGameId === game.id && (
                 <button onClick={() => setEditingGameId(null)} className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 font-semibold flex items-center justify-center">
                    <XCircle className="w-5 h-5 mr-2" />
                    Cancel
                </button>
            )}
        </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center mb-6">
        <ClipboardList className="w-8 h-8 mr-3 text-blue-600" />
        <h1 className="text-3xl font-bold">Game Results Overview</h1>
      </div>
      
      {success && <p className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 p-3 rounded-md mb-4">{success}</p>}
      {error && <p className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 p-3 rounded-md mb-4">{error}</p>}

      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 mb-8">
        <h2 className="text-xl font-semibold mb-4">Pending Results</h2>
        {loading ? <p>Loading...</p> : pendingGames.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No games are currently awaiting results.</p>
        ) : (
          <div className="space-y-4">
            {pendingGames.map((game) => (
              <div key={game.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-md border border-gray-200 dark:border-gray-700">
                <p className="font-bold text-lg">{game.team_a?.[0]?.name} vs {game.team_b?.[0]?.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(game.game_date).toLocaleString()}</p>
                {renderGameControls(game)}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 mb-8">
        <h2 className="text-xl font-semibold mb-4">Completed Results</h2>
        {loading ? <p>Loading...</p> : completedGames.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No results have been entered yet.</p>
        ) : (
          <div className="space-y-4">
            {completedGames.map((game) => (
              <div key={game.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-md border border-gray-200 dark:border-gray-700">
                 {editingGameId === game.id ? (
                    <>
                        <p className="font-bold text-lg">{game.team_a?.[0]?.name} vs {game.team_b?.[0]?.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(game.game_date).toLocaleString()}</p>
                        {renderGameControls(game)}
                    </>
                 ) : (
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-bold text-lg">{game.team_a?.[0]?.name} vs {game.team_b?.[0]?.name}</p>
                            <p className="font-semibold text-green-600 dark:text-green-400 mt-1">
                                Winner: {game.is_draw ? 'Draw' : (game.winning_team_id === game.team_a?.[0]?.id ? game.team_a[0].name : game.team_b?.[0]?.name)}
                            </p>
                        </div>
                        <button onClick={() => handleEditClick(game)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold flex items-center">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                        </button>
                    </div>
                 )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
            <CalendarClock className="w-6 h-6 mr-2 text-blue-500" />
            Upcoming Scheduled Games
        </h2>
        {loading ? <p>Loading...</p> : scheduledGames.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No games are scheduled for the future.</p>
        ) : (
          <div className="space-y-4">
                {scheduledGames.map((game) => (
                    <div key={game.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-md border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-bold text-lg">{game.team_a?.[0]?.name} vs {game.team_b?.[0]?.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Scheduled for: {new Date(game.game_date).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}