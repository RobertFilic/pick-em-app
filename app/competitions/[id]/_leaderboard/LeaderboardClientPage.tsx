'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Trophy, Award, CheckCircle, XCircle, Medal } from 'lucide-react';
import Link from 'next/link';

type LeaderboardEntry = {
  user_id: string;
  username: string;
  score: number;
  correct_picks: number;
  incorrect_picks: number;
  total_picks: number;
};

export default function LeaderboardClientPage({ competitionId }: { competitionId: number }) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [competitionName, setCompetitionName] = useState<string>('');
  const [currentUserStats, setCurrentUserStats] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-yellow-600';
    return 'text-gray-500';
  };

  const fetchLeaderboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const [competitionRes, leaderboardRes] = await Promise.all([
        supabase.from('competitions').select('name').eq('id', competitionId).single(),
        supabase.rpc('get_leaderboard', { competition_id_param: competitionId })
      ]);

      if (competitionRes.error) throw competitionRes.error;
      setCompetitionName(competitionRes.data.name);

      if (leaderboardRes.error) throw leaderboardRes.error;
      const data = leaderboardRes.data as LeaderboardEntry[];
      setLeaderboard(data);

      if (user) {
        const userStats = data.find(entry => entry.user_id === user.id);
        setCurrentUserStats(userStats || null);
      }

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
      console.error("Error fetching leaderboard:", err);
    } finally {
      setLoading(false);
    }
  }, [competitionId]);

  useEffect(() => {
    fetchLeaderboardData();
  }, [fetchLeaderboardData]);

  if (loading) {
    return <div className="text-center p-10">Calculating scores and loading leaderboard...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">Error: {error}</div>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold flex items-center">
            <Trophy className="w-10 h-10 mr-4 text-yellow-400" />
            Leaderboard
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">{competitionName}</p>
        </div>
        <Link 
          href={`/competitions/${competitionId}`}
          className="mt-4 sm:mt-0 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold transition-colors"
        >
          Back to Picks
        </Link>
      </div>

      {currentUserStats && (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-blue-500 mb-8 shadow-lg">
          <h2 className="text-xl font-bold flex items-center mb-4">
            <Award className="w-6 h-6 mr-3 text-blue-500" />
            Your Score
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-2">
              <p className="text-3xl font-bold">{currentUserStats.score}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Score</p>
            </div>
            <div className="p-2">
              <p className="text-3xl font-bold flex items-center justify-center text-green-500">
                <CheckCircle className="w-6 h-6 mr-2"/>
                {currentUserStats.correct_picks}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Correct</p>
            </div>
            <div className="p-2">
              <p className="text-3xl font-bold flex items-center justify-center text-red-500">
                <XCircle className="w-6 h-6 mr-2"/>
                {currentUserStats.incorrect_picks}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Incorrect</p>
            </div>
            <div className="p-2">
              <p className="text-3xl font-bold">{currentUserStats.total_picks}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Picks Graded</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="p-4 font-semibold w-16">Rank</th>
              <th className="p-4 font-semibold">Player</th>
              <th className="p-4 font-semibold text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, index) => (
              <tr key={entry.user_id} className="border-t border-gray-200 dark:border-gray-800">
                <td className="p-4 font-bold text-lg text-center">
                  <span className={getRankColor(index + 1)}>
                    {index < 3 ? <Medal className="w-6 h-6 mx-auto" /> : index + 1}
                  </span>
                </td>
                <td className="p-4 font-semibold">{entry.username}</td>
                <td className="p-4 font-bold text-right">{entry.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {leaderboard.length === 0 && (
          <p className="p-6 text-center text-gray-500">No scores have been calculated yet. Results may be pending.</p>
        )}
      </div>
    </div>
  );
}