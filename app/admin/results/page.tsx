'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ClipboardList, CheckCircle, Edit, XCircle, CalendarClock, HelpCircle } from 'lucide-react';

// --- Type Definitions ---
// FIXED: The types for joined tables are now correctly defined as single objects.
type GameForResult = {
  id: number;
  stage: string | null;
  game_date: string;
  competitions: { name: string } | null;
  team_a: { id: number; name: string } | null;
  team_b: { id: number; name: string } | null;
  winning_team_id: number | null;
  is_draw: boolean;
};

type PropPredictionResult = {
  id: number;
  question: string;
  correct_answer: string | null;
};

// --- Main Page Component ---
export default function ResultsPage() {
  // --- State Management ---
  const [pendingGames, setPendingGames] = useState<GameForResult[]>([]);
  const [completedGames, setCompletedGames] = useState<GameForResult[]>([]);
  const [scheduledGames, setScheduledGames] = useState<GameForResult[]>([]);
  const [pendingProps, setPendingProps] = useState<PropPredictionResult[]>([]);
  const [completedProps, setCompletedProps] = useState<PropPredictionResult[]>([]);
  
  const [results, setResults] = useState<{ [key: number]: string }>({});
  const [editingGameId, setEditingGameId] = useState<number | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // --- Data Fetching ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const [gamesRes, propsRes] = await Promise.all([
      supabase
        .from('games')
        .select(`id, stage, game_date, winning_team_id, is_draw, competitions ( name ), team_a: team_a_id ( id, name ), team_b: team_b_id ( id, name )`)
        .order('game_date', { ascending: true }),
      supabase
        .from('prop_predictions')
        .select('id, question, correct_answer')
        .order('lock_date', { ascending: true })
    ]);

    if (gamesRes.error) {
      setError(gamesRes.error.message);
      console.error('Error fetching games:', gamesRes.error);
    } else if (gamesRes.data) {
      const now = new Date();
      
      // FIXED: Simplified the filter to correctly check for the existence of team data.
      const validGames = gamesRes.data.filter(game => game.team_a && game.team_b);

      const pastGames = validGames.filter(game => new Date(game.game_date) < now);
      const futureGames = validGames.filter(game => new Date(game.game_date) >= now);

      const pending = pastGames.filter(game => game.winning_team_id === null && !game.is_draw);
      const completed = pastGames.filter(game => game.winning_team_id !== null || game.is_draw);
      
      setPendingGames(pending.reverse() as GameForResult[]);
      setCompletedGames(completed.reverse() as GameForResult[]);
      setScheduledGames(futureGames as GameForResult[]);
    }

    if (propsRes.error) {
        setError(propsRes.error.message);
        console.error('Error fetching prop predictions:', propsRes.error);
    } else if (propsRes.data) {
        const pending = propsRes.data.filter(p => p.correct_answer === null);
        const completed = propsRes.data.filter(p => p.correct_answer !== null);
        setPendingProps(pending);
        setCompletedProps(completed);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      await fetchData();
    }
  };

  const handleSubmitPropResult = async (propId: number, answer: 'Yes' | 'No') => {
    setSuccess(null);
    setError(null);

    const { error: updateError } = await supabase
        .from('prop_predictions')
        .update({ correct_answer: answer })
        .eq('id', propId);

    if (updateError) {
        setError(updateError.message);
    } else {
        setSuccess(`Result for special event ${propId} has been saved.`);
        await fetchData();
    }
  };
  
  // --- JSX Rendering ---
  const renderGameControls = (game: GameForResult) => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-3">
        <div className="flex-grow grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
            <button 
                onClick={() => handleResultChange(game.id, game.team_a!.id.toString())}
                className={`p-2 rounded-md text-sm font-semibold border-2 transition-all ${results[game.id] === game.team_a!.id.toString() ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-blue-500'}`}
            >
                {game.team_a?.name} Wins
            </button>
            <button 
                onClick={() => handleResultChange(game.id, 'draw')}
                className={`p-2 rounded-md text-sm font-semibold border-2 transition-all ${results[game.id] === 'draw' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-blue-500'}`}
            >
                Draw
            </button>
            <button 
                onClick={() => handleResultChange(game.id, game.team_b!.id.toString())}
                className={`p-2 rounded-md text-sm font-semibold border-2 transition-all ${results[game.id] === game.team_b!.id.toString() ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-blue-500'}`}
            >
                {game.team_b?.name} Wins
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
        <h1 className="text-3xl font-bold">Results Overview</h1>
      </div>
      
      {success && <p className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 p-3 rounded-md mb-4">{success}</p>}
      {error && <p className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 p-3 rounded-md mb-4">{error}</p>}

      {/* Special Events Sections */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center"><HelpCircle className="w-6 h-6 mr-2 text-blue-500"/>Pending Special Event Results</h2>
        {loading ? <p>Loading...</p> : pendingProps.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No special events are currently awaiting results.</p>
        ) : (
          <div className="space-y-4">
            {pendingProps.map((prop) => (
              <div key={prop.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-md border border-gray-200 dark:border-gray-700">
                <p className="font-semibold">{prop.question}</p>
                <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => handleSubmitPropResult(prop.id, 'Yes')} className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold">
                        Mark as YES
                    </button>
                    <button onClick={() => handleSubmitPropResult(prop.id, 'No')} className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-semibold">
                        Mark as NO
                    </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 mb-8">
        <h2 className="text-xl font-semibold mb-4">Completed Special Event Results</h2>
        {loading ? <p>Loading...</p> : completedProps.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No special event results have been entered yet.</p>
        ) : (
          <div className="space-y-4">
            {completedProps.map((prop) => (
              <div key={prop.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-md border border-gray-200 dark:border-gray-700">
                <p className="font-semibold">{prop.question}</p>
                <p className="font-bold text-green-600 dark:text-green-400 mt-1">Answer: {prop.correct_answer}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Game Sections */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 mb-8">
        <h2 className="text-xl font-semibold mb-4">Pending Game Results</h2>
        {loading ? <p>Loading...</p> : pendingGames.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No games are currently awaiting results.</p>
        ) : (
          <div className="space-y-4">
            {pendingGames.map((game) => (
              <div key={game.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-md border border-gray-200 dark:border-gray-700">
                <p className="font-bold text-lg">{game.team_a?.name} vs {game.team_b?.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(game.game_date).toLocaleString()}</p>
                {renderGameControls(game)}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 mb-8">
        <h2 className="text-xl font-semibold mb-4">Completed Game Results</h2>
        {loading ? <p>Loading...</p> : completedGames.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No game results have been entered yet.</p>
        ) : (
          <div className="space-y-4">
            {completedGames.map((game) => (
              <div key={game.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-md border border-gray-200 dark:border-gray-700">
                 {editingGameId === game.id ? (
                    <>
                        <p className="font-bold text-lg">{game.team_a?.name} vs {game.team_b?.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(game.game_date).toLocaleString()}</p>
                        {renderGameControls(game)}
                    </>
                 ) : (
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-bold text-lg">{game.team_a?.name} vs {game.team_b?.name}</p>
                            <p className="font-semibold text-green-600 dark:text-green-400 mt-1">
                                Winner: {game.is_draw ? 'Draw' : (game.winning_team_id === game.team_a?.id ? game.team_a.name : game.team_b?.name)}
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
                                <p className="font-bold text-lg">{game.team_a?.name} vs {game.team_b?.name}</p>
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