'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Trophy, Clock, Calendar } from 'lucide-react';
import Image from 'next/image';

// Define the types for our data
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

// This component receives the competition ID as a simple prop
export default function CompetitionDetailClient({ id }: { id: string }) {
  const [competitionName, setCompetitionName] = useState('');
  const [groupedGames, setGroupedGames] = useState<{ [key: string]: Game[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const competitionId = parseInt(id, 10);

  // Use useCallback to memoize the fetch function
  const fetchCompetitionData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch competition name and games in parallel
      const [competitionRes, gamesRes, groupingsRes] = await Promise.all([
        supabase.from('competitions').select('name').eq('id', competitionId).single(),
        supabase.from('games').select('*, team_a:teams!games_team_a_id_fkey(*), team_b:teams!games_team_b_id_fkey(*)').eq('competition_id', competitionId).order('game_date', { ascending: true }),
        supabase.from('competition_teams').select('team_id, group').eq('competition_id', competitionId)
      ]);

      if (competitionRes.error) throw competitionRes.error;
      setCompetitionName(competitionRes.data.name);

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
      })) as Game[];

      // Group games by date
      const gamesByDate = gamesWithGroups.reduce((acc, game) => {
        const date = new Date(game.game_date).toLocaleDateString(undefined, {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(game);
        return acc;
      }, {} as { [key: string]: Game[] });
      setGroupedGames(gamesByDate);

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [competitionId]);

  useEffect(() => {
    fetchCompetitionData();
  }, [fetchCompetitionData]);

  if (loading) {
    return <div className="text-center p-10">Loading competition...</div>;
  }
  
  if (error) {
    return <div className="text-center p-10 text-red-500">Error: {error}</div>;
  }

  return (
    <div>
      <div className="flex items-center mb-8">
        <Trophy className="w-8 h-8 mr-4 text-blue-500" />
        <h1 className="text-4xl font-bold">{competitionName}</h1>
      </div>

      {Object.keys(groupedGames).length === 0 ? (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
          <p className="text-center text-gray-500">No games have been scheduled for this competition yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedGames).map(([date, gamesOnDate]) => (
            <div key={date}>
              <h2 className="text-xl font-bold mb-4 flex items-center text-gray-700 dark:text-gray-300">
                  <Calendar className="w-6 h-6 mr-3" />
                  {date}
              </h2>
              <div className="space-y-4">
                {gamesOnDate.map(game => (
                  <div key={game.id} className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                    <div className="flex justify-between items-center mb-2 text-sm text-gray-500">
                      <span>{game.stage} {game.group ? `- ${game.group}` : ''}</span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1.5"/>
                        {new Date(game.game_date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center justify-center space-x-4">
                        <div className="flex items-center space-x-3 w-1/3 justify-end">
                            <span className="font-semibold text-lg text-right">{game.team_a?.name}</span>
                            <Image
                                src={game.team_a?.logo_url || `https://placehold.co/40x40/E2E8F0/4A5568?text=${game.team_a?.name.charAt(0)}`}
                                alt={`${game.team_a?.name} logo`}
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        </div>
                        <span className="text-gray-400 font-bold">VS</span>
                        <div className="flex items-center space-x-3 w-1/3">
                            <Image
                                src={game.team_b?.logo_url || `https://placehold.co/40x40/E2E8F0/4A5568?text=${game.team_b?.name.charAt(0)}`}
                                alt={`${game.team_b?.name} logo`}
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <span className="font-semibold text-lg">{game.team_b?.name}</span>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}