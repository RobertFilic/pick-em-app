'use client';

import { useState, useEffect, FormEvent, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Gamepad2, PlusCircle, Trash2 } from 'lucide-react';

// --- Type Definitions ---

type Competition = {
  id: number;
  name: string;
};

type Team = {
  id: number;
  name: string;
};

// This type represents the clean, final shape of our game data.
type GameWithDetails = {
  id: number;
  stage: string | null;
  game_date: string;
  competitions: { name: string } | null;
  team_a: { name: string } | null;
  team_b: { name: string } | null;
};

// This type represents the raw, potentially inconsistent data from Supabase.
type RawGameData = {
  id: number;
  stage: string | null;
  game_date: string;
  competitions: { name: string } | { name: string }[] | null;
  team_a: { name: string } | { name: string }[] | null;
  team_b: { name: string } | { name: string }[] | null;
};

// --- Main Page Component ---

export default function GamesPage() {
  // --- State Management ---
  const [games, setGames] = useState<GameWithDetails[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  
  const [competitionId, setCompetitionId] = useState('');
  const [teamAId, setTeamAId] = useState('');
  const [teamBId, setTeamBId] = useState('');
  const [stage, setStage] = useState('');
  const [gameDate, setGameDate] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Data Fetching ---

  const fetchGames = useCallback(async () => {
    const { data, error } = await supabase
      .from('games')
      .select(`
        id,
        stage,
        game_date,
        competitions ( name ),
        team_a: team_a_id ( name ),
        team_b: team_b_id ( name )
      `)
      .order('game_date', { ascending: false });

    if (error) {
      setError(error.message);
      console.error('Error fetching games:', error);
    } else if (data) {
      // This function safely transforms the raw data into our desired shape.
      const transformData = (gameData: RawGameData): GameWithDetails => ({
        id: gameData.id,
        stage: gameData.stage,
        game_date: gameData.game_date,
        competitions: Array.isArray(gameData.competitions) ? gameData.competitions[0] : gameData.competitions,
        team_a: Array.isArray(gameData.team_a) ? gameData.team_a[0] : gameData.team_a,
        team_b: Array.isArray(gameData.team_b) ? gameData.team_b[0] : gameData.team_b,
      });

      const validGames = data
        .map(transformData)
        .filter(game => game.team_a && game.team_b && game.competitions);
      
      setGames(validGames);
    }
  }, []);

  const fetchCompetitions = useCallback(async () => {
    const { data, error } = await supabase.from('competitions').select('id, name');
    if (error) console.error('Error fetching competitions:', error.message);
    else setCompetitions(data || []);
  }, []);

  const fetchTeams = useCallback(async () => {
    const { data, error } = await supabase.from('teams').select('id, name').order('name');
    if (error) console.error('Error fetching teams:', error.message);
    else setTeams(data || []);
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      await Promise.all([
        fetchGames(),
        fetchCompetitions(),
        fetchTeams()
      ]);
      setLoading(false);
    };
    fetchInitialData();
  }, [fetchGames, fetchCompetitions, fetchTeams]);

  // --- Event Handlers ---

  const handleAddGame = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!competitionId || !teamAId || !teamBId || !gameDate) {
      setError('All fields except Stage are required.');
      return;
    }
    if (teamAId === teamBId) {
        setError('A team cannot play against itself.');
        return;
    }

    const { error: insertError } = await supabase
      .from('games')
      .insert([{
        competition_id: parseInt(competitionId),
        team_a_id: parseInt(teamAId),
        team_b_id: parseInt(teamBId),
        stage: stage || null,
        game_date: gameDate
      }]);

    if (insertError) {
      setError(insertError.message);
    } else {
      setCompetitionId('');
      setTeamAId('');
      setTeamBId('');
      setStage('');
      setGameDate('');
      await fetchGames();
    }
  };
  
  const handleDeleteGame = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this game?')) {
        const { error } = await supabase.from('games').delete().eq('id', id);
        if (error) {
            setError(error.message);
        } else {
            await fetchGames();
        }
    }
  }

  // --- JSX Rendering ---

  return (
    <div>
      <div className="flex items-center mb-6">
        <Gamepad2 className="w-8 h-8 mr-3 text-blue-600" />
        <h1 className="text-3xl font-bold">Manage Games</h1>
      </div>

      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <PlusCircle className="w-6 h-6 mr-2" />
          Add New Game
        </h2>
        <form onSubmit={handleAddGame} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="competition" className="block text-sm font-medium mb-1">Competition</label>
              <select id="competition" value={competitionId} onChange={e => setCompetitionId(e.target.value)} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                <option value="">Select Competition</option>
                {competitions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="stage" className="block text-sm font-medium mb-1">Stage (Optional)</label>
              <input id="stage" type="text" value={stage} onChange={e => setStage(e.target.value)} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700" placeholder="e.g., Group Stage, Final" />
            </div>
            <div>
              <label htmlFor="teamA" className="block text-sm font-medium mb-1">Team A</label>
              <select id="teamA" value={teamAId} onChange={e => setTeamAId(e.target.value)} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                <option value="">Select Team A</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="teamB" className="block text-sm font-medium mb-1">Team B</label>
              <select id="teamB" value={teamBId} onChange={e => setTeamBId(e.target.value)} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                <option value="">Select Team B</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="gameDate" className="block text-sm font-medium mb-1">Game Date</label>
              <input id="gameDate" type="datetime-local" value={gameDate} onChange={e => setGameDate(e.target.value)} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700" />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold">
            Add Game
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-semibold mb-4">Scheduled Games</h2>
        {loading ? <p>Loading...</p> : (
          <div className="space-y-3">
            {games.length === 0 && <p className="text-gray-500">No games scheduled.</p>}
            {games.map((game) => (
              <div key={game.id} className="grid grid-cols-[1fr_auto] items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md border border-gray-200 dark:border-gray-700">
                <div>
                  <p className="font-bold text-lg">{game.team_a?.name || 'N/A'} vs {game.team_b?.name || 'N/A'}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{game.competitions?.name} {game.stage ? ` - ${game.stage}` : ''}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">{new Date(game.game_date).toLocaleString()}</p>
                </div>
                <button 
                  onClick={() => handleDeleteGame(game.id)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors"
                  aria-label="Delete game"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}