'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Trophy, Award, CheckCircle, XCircle, Medal, Users, Crown } from 'lucide-react';
import Link from 'next/link';

// Define the types for our data
type LeagueLeaderboardEntry = {
  user_id: string;
  username: string;
  score: number;
  correct_picks: number;
  incorrect_picks: number;
  total_picks: number;
  is_admin?: boolean;
};

type LeagueInfo = {
  id: string;
  name: string;
  admin_id: string;
  competition_id: number;
  invite_code: string;
  competition_name?: string;
};

type LeagueMemberData = {
  user_id: string;
  profiles: {
    username: string;
  } | null;
};


// This component receives the leagueId as a string (UUID)
export default function PrivateLeagueLeaderboardClientPage({ leagueId }: { leagueId: string }) {
  const [leaderboard, setLeaderboard] = useState<LeagueLeaderboardEntry[]>([]);
  const [leagueInfo, setLeagueInfo] = useState<LeagueInfo | null>(null);
  const [currentUserStats, setCurrentUserStats] = useState<LeagueLeaderboardEntry | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isUserInLeague, setIsUserInLeague] = useState<boolean>(false);
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
      setCurrentUserId(user?.id || null);

      // First, get league information
      const { data: leagueData, error: leagueError } = await supabase
        .from('leagues')
        .select(`
          id,
          name,
          admin_id,
          competition_id,
          invite_code
        `)
        .eq('id', leagueId)
        .single();

      if (leagueError) throw leagueError;

      // Fetch competition name for display
      let competitionName = 'Competition';
      try {
        const { data: compData } = await supabase
          .from('competitions')
          .select('name')
          .eq('id', leagueData.competition_id)
          .single();
        if (compData?.name) {
          competitionName = compData.name;
        }
      } catch {
        // If competition name fetch fails, just use default
      }

      const leagueInfoWithCompetition: LeagueInfo = {
        ...leagueData,
        competition_name: competitionName
      };
      setLeagueInfo(leagueInfoWithCompetition);

      // Check if current user is a member of this league
      if (user) {
        const { data: membershipData, error: membershipError } = await supabase
          .from('league_members')
          .select('user_id')
          .eq('league_id', leagueId)
          .eq('user_id', user.id)
          .single();

        setIsUserInLeague(!membershipError && membershipData !== null);
      }

      // Get leaderboard data - use the working query structure
      // Get all league members with their profile info
      const { data: members, error: membersError } = await supabase
        .from('league_members')
        .select(`
          user_id,
          profiles(username)
        `)
        .eq('league_id', leagueId);

      if (membersError) {
        console.error('Members error:', membersError);
        throw membersError;
      }

      console.log('Members data:', members);

      // Cast the members data to our expected type (via unknown for type safety)
      const typedMembers = members as unknown as LeagueMemberData[] | null;

      if (!typedMembers || typedMembers.length === 0) {
        setLeaderboard([]);
        return;
      }

      // For each member, calculate their stats
      const leaderboardPromises = typedMembers.map(async (member: LeagueMemberData) => {
        // Get username from the profile relation - the structure shows profiles: {username: 'name'}
        const username = member.profiles?.username || 'Unknown User';
        
        console.log(`Processing member ${member.user_id}, username: ${username}`);
        
        // Get user picks for this competition - both game picks and prop picks
        const [gamePicksRes, propPicksRes] = await Promise.all([
          // Game picks
          supabase
            .from('user_picks')
            .select(`
              pick,
              games!inner(winning_team_id, is_draw)
            `)
            .eq('user_id', member.user_id)
            .eq('competition_id', leagueData.competition_id)
            .not('game_id', 'is', null)
            .not('games.winning_team_id', 'is', null),
          
          // Prop prediction picks
          supabase
            .from('user_picks')
            .select(`
              pick,
              prop_predictions!inner(correct_answer)
            `)
            .eq('user_id', member.user_id)
            .eq('competition_id', leagueData.competition_id)
            .not('prop_prediction_id', 'is', null)
            .not('prop_predictions.correct_answer', 'is', null)
        ]);

        if (gamePicksRes.error || propPicksRes.error) {
          console.error('Error fetching picks for user:', member.user_id, gamePicksRes.error, propPicksRes.error);
          return {
            user_id: member.user_id,
            username: username,
            score: 0,
            correct_picks: 0,
            incorrect_picks: 0,
            total_picks: 0,
            is_admin: member.user_id === leagueData.admin_id
          };
        }

        let correct = 0;
        let incorrect = 0;
        
        // Process game picks
        if (gamePicksRes.data) {
          gamePicksRes.data.forEach((pick) => {
            const game = Array.isArray(pick.games) ? pick.games[0] : pick.games;
            if (game) {
              // Handle draw games
              if (game.is_draw && pick.pick === 'draw') {
                correct++;
              } else if (!game.is_draw && pick.pick === game.winning_team_id?.toString()) {
                correct++;
              } else {
                incorrect++;
              }
            }
          });
        }
        
        // Process prop picks
        if (propPicksRes.data) {
          propPicksRes.data.forEach((pick) => {
            const propPrediction = Array.isArray(pick.prop_predictions) ? pick.prop_predictions[0] : pick.prop_predictions;
            const correctAnswer = propPrediction?.correct_answer;
            if (correctAnswer && pick.pick === correctAnswer) {
              correct++;
            } else if (correctAnswer) {
              incorrect++;
            }
          });
        }

        return {
          user_id: member.user_id,
          username: username,
          score: correct, // Simple scoring: 1 point per correct pick
          correct_picks: correct,
          incorrect_picks: incorrect,
          total_picks: correct + incorrect,
          is_admin: member.user_id === leagueData.admin_id
        };
      });

      const leaderboardData = await Promise.all(leaderboardPromises);
      
      // Sort by score (descending), then by total picks (descending) as tiebreaker
      leaderboardData.sort((a, b) => {
        if (a.score !== b.score) return b.score - a.score;
        return b.total_picks - a.total_picks;
      });

      setLeaderboard(leaderboardData);

      if (user) {
        const userStats = leaderboardData.find(entry => entry.user_id === user.id);
        setCurrentUserStats(userStats || null);
      }

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
      console.error("Error fetching league leaderboard:", err);
    } finally {
      setLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    fetchLeaderboardData();
  }, [fetchLeaderboardData]);

  if (loading) {
    return <div className="text-center p-10">Loading league leaderboard...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">Error: {error}</div>;
  }

  if (!isUserInLeague && currentUserId) {
    return (
      <div className="text-center p-10">
        <div className="max-w-md mx-auto bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <Users className="w-12 h-12 mx-auto mb-4 text-yellow-600" />
          <h2 className="text-xl font-bold mb-2">Access Restricted</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You need to be a member of this league to view the leaderboard.
          </p>
          <p className="text-sm text-gray-500">
            Ask the league admin for an invite code to join this league.
          </p>
        </div>
      </div>
    );
  }

  if (!currentUserId) {
    return (
      <div className="text-center p-10">
        <p className="text-gray-600 dark:text-gray-400">Please log in to view this leaderboard.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold flex items-center">
            <Trophy className="w-10 h-10 mr-4 text-yellow-400" />
            League Leaderboard
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
            {leagueInfo?.name}
          </p>
          {leagueInfo?.competition_name && (
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Competition: {leagueInfo.competition_name}
            </p>
          )}
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
          <Link 
            href={`/leagues/${leagueId}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold transition-colors"
          >
            Back to League
          </Link>
          {leagueInfo && currentUserId === leagueInfo.admin_id && (
            <Link 
              href={`/leagues/${leagueId}/manage`}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold transition-colors flex items-center"
            >
              <Crown className="w-4 h-4 mr-2" />
              Manage
            </Link>
          )}
        </div>
      </div>

      {/* League Info Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Users className="w-6 h-6 mr-3 text-blue-600" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                {leaderboard.length} Members
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Invite Code: <span className="font-mono font-bold">{leagueInfo?.invite_code}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {currentUserStats && (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-blue-500 mb-8 shadow-lg">
          <h2 className="text-xl font-bold flex items-center mb-4">
            <Award className="w-6 h-6 mr-3 text-blue-500" />
            Your Score
            {currentUserStats.is_admin && (
              <span title="League Admin">
                <Crown className="w-5 h-5 ml-2 text-yellow-500" />
              </span>
            )}
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
              <tr key={entry.user_id} className={`border-t border-gray-200 dark:border-gray-800 ${
                entry.user_id === currentUserId ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}>
                <td className="p-4 font-bold text-lg text-center">
                  <span className={getRankColor(index + 1)}>
                    {index < 3 ? <Medal className="w-6 h-6 mx-auto" /> : index + 1}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center">
                    <span className="font-semibold">{entry.username}</span>
                    {entry.is_admin && (
                      <span title="League Admin">
                        <Crown className="w-4 h-4 ml-2 text-yellow-500" />
                      </span>
                    )}
                    {entry.user_id === currentUserId && (
                      <span className="ml-2 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full">
                        You
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4 font-bold text-right">{entry.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {leaderboard.length === 0 && (
          <p className="p-6 text-center text-gray-500">
            No scores have been calculated yet for this league.
          </p>
        )}
      </div>
    </div>
  );
}