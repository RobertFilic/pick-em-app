'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Trophy, Users, Crown, Copy, CheckCircle, Settings } from 'lucide-react';
import Link from 'next/link';

type PrivateLeagueInfo = {
  id: number;
  name: string;
  admin_id: string;
  competition_id: number;
  invite_code: string;
  competition_name?: string;
  member_count?: number;
};

export default function PrivateLeagueDashboard({ params }: { params: Promise<{ id: string }> }) {
  const [leagueInfo, setLeagueInfo] = useState<PrivateLeagueInfo | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isUserInLeague, setIsUserInLeague] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [leagueId, setLeagueId] = useState<number | null>(null);

  useEffect(() => {
    const extractLeagueId = async () => {
      const resolvedParams = await params;
      setLeagueId(parseInt(resolvedParams.id, 10));
    };
    extractLeagueId();
  }, [params]);

  const copyInviteCode = async () => {
    if (leagueInfo?.invite_code) {
      await navigator.clipboard.writeText(leagueInfo.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const fetchLeagueData = useCallback(async () => {
    if (!leagueId) return;

    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);

      const { data: leagueData, error: leagueError } = await supabase
        .from('private_leagues')
        .select(`
          id,
          name,
          admin_id,
          competition_id,
          invite_code,
          private_league_members(count)
        `)
        .eq('id', leagueId)
        .single();

      if (leagueError) throw leagueError;

      let competitionName = undefined;
      try {
        const { data: compData } = await supabase
          .from('competitions')
          .select('name')
          .eq('id', leagueData.competition_id)
          .single();
        if (compData?.name) {
          competitionName = compData.name;
        }
      } catch {}

      const leagueInfoWithDetails: PrivateLeagueInfo = {
        ...leagueData,
        competition_name: competitionName,
        member_count: leagueData.private_league_members?.[0]?.count || 0
      };
      setLeagueInfo(leagueInfoWithDetails);

      if (user) {
        const { data: membershipData, error: membershipError } = await supabase
          .from('private_league_members')
          .select('user_id')
          .eq('league_id', leagueId)
          .eq('user_id', user.id)
          .single();

        setIsUserInLeague(!membershipError && membershipData !== null);
      }

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
      console.error("Error fetching league data:", err);
    } finally {
      setLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    if (leagueId) {
      fetchLeagueData();
    }
  }, [fetchLeagueData, leagueId]);

  if (loading) {
    return <div className="text-center p-10">Loading private league...</div>;
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
            You need to be a member of this private league to access it.
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
        <p className="text-gray-600 dark:text-gray-400">Please log in to view this league.</p>
      </div>
    );
  }

  const isAdmin = currentUserId === leagueInfo?.admin_id;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold flex items-center">
            <Users className="w-10 h-10 mr-4 text-blue-600" />
            {leagueInfo?.name}
            {isAdmin && (
              <>
                <span className="sr-only">You are the admin</span>
                <Crown className="w-8 h-8 ml-3 text-yellow-500" aria-hidden="true" />
              </>
            )}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
            Private League
          </p>
          {leagueInfo?.competition_name && (
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Competition: {leagueInfo.competition_name}
            </p>
          )}
        </div>
        {isAdmin && (
          <Link 
            href={`/private-leagues/${leagueId}/manage`}
            className="mt-4 sm:mt-0 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold transition-colors flex items-center"
          >
            <Settings className="w-4 h-4 mr-2" />
            Manage League
          </Link>
        )}
      </div>

      {/* League Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Invite Code Card */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-600" />
            League Members
          </h3>
          <div className="text-3xl font-bold mb-2">{leagueInfo?.member_count || 0}</div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Invite Code:</span>
            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono">
              {leagueInfo?.invite_code}
            </code>
            <button
              onClick={copyInviteCode}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              title="Copy invite code"
            >
              {copied ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-gray-500" />
              )}
            </button>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Link
              href={`/private-leagues/${leagueId}/leaderboard`}
              className="block w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-center transition-colors"
            >
              View Leaderboard
            </Link>
            {leagueInfo?.competition_id && (
              <Link
                href={`/competitions/${leagueInfo.competition_id}`}
                className="block w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-center transition-colors"
              >
                Make Picks
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Admin Notice */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <Crown className="w-5 h-5 mr-2 text-yellow-600" />
            <span className="font-semibold text-yellow-800 dark:text-yellow-200">
              You are the admin of this league
            </span>
          </div>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
            You can manage members, update league settings, and view admin tools.
          </p>
        </div>
      )}

      {/* Information Card */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3 text-blue-900 dark:text-blue-100">
          About Private Leagues
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
          <li>• Only league members can see the leaderboard and compete with each other</li>
          <li>• Share the invite code with friends to let them join your league</li>
          <li>• Your picks in the main competition count towards your league score</li>
          <li>• League rankings are updated in real-time as games are completed</li>
        </ul>
      </div>
    </div>
  );
}
