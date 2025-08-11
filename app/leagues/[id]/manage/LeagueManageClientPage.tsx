'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Crown, Users, Copy, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type LeagueInfo = {
  id: string;
  name: string;
  admin_id: string;
  competition_id: number;
  invite_code: string;
  competition_name?: string;
};

type LeagueMember = {
  user_id: string;
  username: string;
  is_admin: boolean;
};

export default function LeagueManageClientPage({ leagueId }: { leagueId: string }) {
  const [leagueInfo, setLeagueInfo] = useState<LeagueInfo | null>(null);
  const [members, setMembers] = useState<LeagueMember[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeagueData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);

      // Get league information
      const { data: leagueData, error: leagueError } = await supabase
        .from('leagues')
        .select(`
          id,
          name,
          admin_id,
          competition_id,
          invite_code,
          competitions(name)
        `)
        .eq('id', leagueId)
        .single();

      if (leagueError) throw leagueError;

      const leagueWithCompetition: LeagueInfo = {
        ...leagueData,
        competition_name: leagueData.competitions?.name || 'Competition'
      };
      setLeagueInfo(leagueWithCompetition);

      // Check if current user is admin
      if (user?.id !== leagueData.admin_id) {
        setError('You do not have permission to manage this league.');
        return;
      }

      // Get league members
      const { data: membersData, error: membersError } = await supabase
        .from('league_members')
        .select(`
          user_id,
          profiles(username)
        `)
        .eq('league_id', leagueId);

      if (membersError) throw membersError;

      const formattedMembers: LeagueMember[] = membersData.map((member) => ({
        user_id: member.user_id,
        username: member.profiles?.username || 'Unknown User',
        is_admin: member.user_id === leagueData.admin_id
      }));

      setMembers(formattedMembers);

    } catch (err) {
      console.error('Error fetching league data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load league data');
    } finally {
      setLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    fetchLeagueData();
  }, [fetchLeagueData]);

  const copyInviteCode = async () => {
    if (leagueInfo?.invite_code) {
      await navigator.clipboard.writeText(leagueInfo.invite_code);
      // You could add a toast notification here
    }
  };

  const removeMember = async (userId: string) => {
    if (userId === currentUserId) {
      setError('You cannot remove yourself from the league');
      return;
    }

    try {
      const { error } = await supabase
        .from('league_members')
        .delete()
        .eq('league_id', leagueId)
        .eq('user_id', userId);

      if (error) throw error;

      // Refresh members list
      await fetchLeagueData();
    } catch (err) {
      setError('Failed to remove member');
      console.error('Error removing member:', err);
    }
  };

  if (loading) {
    return <div className="text-center p-10">Loading league management...</div>;
  }

  if (error) {
    return (
      <div className="text-center p-10">
        <div className="text-red-500 mb-4">{error}</div>
        <Link 
          href={`/leagues/${leagueId}`}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to League
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold flex items-center">
            <Crown className="w-10 h-10 mr-4 text-yellow-500" />
            Manage League
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
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2 inline" />
            Back to League
          </Link>
          <Link 
            href={`/leagues/${leagueId}/leaderboard`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold transition-colors"
          >
            View Leaderboard
          </Link>
        </div>
      </div>

      {/* Invite Code Section */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Invite Code</h2>
        <div className="flex items-center gap-4">
          <code className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded text-lg font-mono">
            {leagueInfo?.invite_code}
          </code>
          <button
            onClick={copyInviteCode}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Share this code with friends to invite them to your league.
        </p>
      </div>

      {/* Members Section */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold flex items-center">
            <Users className="w-6 h-6 mr-3" />
            League Members ({members.length})
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {members.map((member) => (
            <div key={member.user_id} className="p-4 flex items-center justify-between">
              <div className="flex items-center">
                <span className="font-semibold">{member.username}</span>
                {member.is_admin && (
                  <span className="ml-2 flex items-center text-yellow-600">
                    <Crown className="w-4 h-4 mr-1" />
                    Admin
                  </span>
                )}
                {member.user_id === currentUserId && (
                  <span className="ml-2 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full">
                    You
                  </span>
                )}
              </div>
              
              {!member.is_admin && (
                <button
                  onClick={() => removeMember(member.user_id)}
                  className="px-3 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded flex items-center text-sm"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        
        {members.length === 0 && (
          <p className="p-6 text-center text-gray-500">
            No members found in this league.
          </p>
        )}
      </div>
    </div>
  );
}