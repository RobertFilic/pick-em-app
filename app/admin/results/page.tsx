'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ClipboardList, CheckCircle } from 'lucide-react';

// Define a more detailed type for a game that includes team IDs for processing
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

export default function ResultsPage() {
  const [pendingGames, setPendingGames] = useState<GameForResult[]>([]);
  const [results, setResults] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingGames();
  }, []);

  const fetchPendingGames = async () => {
    setLoading(true);
    setError(null);
    // Fetch games that are past their game_date and don't have a result yet
    const { data, error: fetchError } = await supabase
      .from('games')
      .select(`
        id,
        stage,
        game_date,
        winning_team_id,
        is_draw,
        competitions ( name ),
        team_a:teams!games_team_a_id_fkey ( id, name ),
        team_b:teams!games_team_b_id_fkey ( id, name )
      `)
      .is('winning_team_id', null)
      .eq('is_draw', false)
      .lt('game_date', new Date().toISOString()) // Only show games that have already occurred
      .order('game_date', { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
      console.error('Error fetching pending games:', fetchError);
    } else {
      setPendingGames(data as GameForResult[]);
    }
    setLoading(false);
  };

  const handleResultChange = (gameId: number, result: string) => {
    setResults(prev => ({ ...prev, [gameId]: result }));
  };

  const handleSubmitResult = async (gameId: number) => {
    const result = results[gameId];
    if (!result) {
      setError('Please select a result for this game.');
      return;
    }
    
    setSuccess(null);
    setError(null);

    let updateData: { winning_team_id?: number; is_draw?: boolean } = {};
    if (result === 'draw') {
      updateData.is_draw = true;
      updateData.winning_team_id = undefined; // Ensure it's null
    } else {
      updateData.is_draw = false;
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
      // Refetch the list to remove the game that now has a result
      await fetchPendingGames(); 
    }
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <ClipboardList className="w-8 h-8 mr-3 text-blue-600" />
        <h1 className="text-3xl font-bold">Enter Game Results</h1>
      </div>
      
      {success && <p className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 p-3 rounded-md mb-4">{success}</p>}
      {error && <p className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 p-3 rounded-md mb-4">{error}</p>}

      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-semibold mb-4">Pending Results</h2>
        {loading ? (
          <p>Loading games waiting for results...</p>
        ) : pendingGames.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No games are currently awaiting results.</p>
        ) : (
          <div className="space-y-6">
            {pendingGames.map((game) => (
              <div key={game.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-md border border-gray-200 dark:border-gray-700">
                <div className="mb-3">
                  <p className="font-bold text-lg">{game.team_a?.name} vs {game.team_b?.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{game.competitions?.name} {game.stage ? ` - ${game.stage}` : ''}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Played on: {new Date(game.game_date).toLocaleString()}</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex-grow grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
                    {/* Team A Button */}
                    <button 
                      onClick={() => handleResultChange(game.id, game.team_a!.id.toString())}
                      className={`p-2 rounded-md text-sm font-semibold border-2 transition-all ${results[game.id] === game.team_a!.id.toString() ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-blue-500'}`}
                    >
                      {game.team_a?.name} Wins
                    </button>
                    {/* Draw Button */}
                    <button 
                      onClick={() => handleResultChange(game.id, 'draw')}
                      className={`p-2 rounded-md text-sm font-semibold border-2 transition-all ${results[game.id] === 'draw' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-blue-500'}`}
                    >
                      Draw
                    </button>
                    {/* Team B Button */}
                    <button 
                      onClick={() => handleResultChange(game.id, game.team_b!.id.toString())}
                      className={`p-2 rounded-md text-sm font-semibold border-2 transition-all ${results[game.id] === game.team_b!.id.toString() ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-blue-500'}`}
                    >
                      {game.team_b?.name} Wins
                    </button>
                  </div>
                  <button
                    onClick={() => handleSubmitResult(game.id)}
                    disabled={!results[game.id]}
                    className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Save Result
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}