'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Award, CheckCircle, XCircle, Medal, Users } from 'lucide-react';
import Link from 'next/link';

type LeaderboardEntry = {
  user_id: string;
  username: string;
  score: number;
  correct_picks: number;
  incorrect_picks: number;
  total_picks: number;
};

type LeagueInfo = {
    name: string;
    competition_id: number;
    competitions: { name: string } | null;
}

type RawLeagueData = {
    name: string;
    competition_id: number;
    competitions: { name: string } | { name: string }[] | null;
}


export default function LeagueLeaderboardClient({ leagueId }: { leagueId: string }) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leagueInfo, setLeagueInfo] = useState<LeagueInfo | null>(null);
  const [currentUserStats, setCurrentUserStats] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // FIXED: Removed the unused 'competitionId' constant.
  
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

      const [leagueRes, leaderboardRes] = await Promise.all([
        supabase.from('leagues').select('name, competition_id, competitions(name)').eq('id', leagueId).single(),
        supabase.rpc('get_league_leaderboard', { league_id_param: leagueId })
      ]);

      if (leagueRes.error) throw leagueRes.error;
      
      const rawLeagueData = leagueRes.data as RawLeagueData;
      const transformedLeagueInfo: LeagueInfo = {
          name: rawLeagueData.name,
          competition_id: rawLeagueData.competition_id,
          competitions: Array.isArray(rawLeagueData.competitions) ? rawLeagueData.competitions[0] : rawLeagueData.competitions
      };
      setLeagueInfo(transformedLeagueInfo);

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
    } finally {
      setLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    fetchLeaderboardData();
  }, [fetchLeaderboardData]);

  if (loading) {
    return <div className="text-center p-10">Loading League Leaderboard...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">Error: {error}</div>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold flex items-center">
            <Users className="w-10 h-10 mr-4 text-violet-400" />
            {leagueInfo?.name}
          </h1>
          <p className="text-lg text-slate-400 mt-1">Leaderboard for {leagueInfo?.competitions?.name}</p>
        </div>
        <Link 
          href={`/competitions/${leagueInfo?.competition_id}`}
          className="mt-4 sm:mt-0 px-4 py-2 bg-slate-800/50 border border-slate-700 text-slate-300 rounded-full hover:bg-slate-800 transition-colors"
        >
          Back to Picks
        </Link>
      </div>

      {currentUserStats && (
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-violet-500 mb-8 shadow-lg">
          <h2 className="text-xl font-bold flex items-center mb-4">
            <Award className="w-6 h-6 mr-3 text-violet-400" />
            Your Score
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div><p className="text-3xl font-bold">{currentUserStats.score}</p><p className="text-sm text-slate-400">Total Score</p></div>
            <div><p className="text-3xl font-bold flex items-center justify-center text-green-500"><CheckCircle className="w-6 h-6 mr-2"/>{currentUserStats.correct_picks}</p><p className="text-sm text-slate-400">Correct</p></div>
            <div><p className="text-3xl font-bold flex items-center justify-center text-red-500"><XCircle className="w-6 h-6 mr-2"/>{currentUserStats.incorrect_picks}</p><p className="text-sm text-slate-400">Incorrect</p></div>
            <div><p className="text-3xl font-bold">{currentUserStats.total_picks}</p><p className="text-sm text-slate-400">Picks Graded</p></div>
          </div>
        </div>
      )}

      <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-800/50">
            <tr>
              <th className="p-4 font-semibold w-16">Rank</th>
              <th className="p-4 font-semibold">Player</th>
              <th className="p-4 font-semibold text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, index) => (
              <tr key={entry.user_id} className="border-t border-slate-800">
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
          <p className="p-6 text-center text-slate-500">No scores have been calculated yet.</p>
        )}
      </div>
    </div>
  );
}