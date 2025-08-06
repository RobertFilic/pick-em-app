/*
================================================================================
File: app/page.tsx (Enhanced with Competition Sorting and Start Dates)
================================================================================
*/

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { analytics } from '@/lib/analytics';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trophy, ArrowRight, Plus, Users, Trash2, Copy, X, LogOut, BarChart2, ChevronDown, Calendar } from 'lucide-react';

// --- Type Definitions ---

type Competition = {
    id: number;
    name: string;
    description?: string;
    lock_date?: string;
    created_at?: string;
    startDate?: string; // Calculated field for display
};

type League = {
    id: string;
    name: string;
    admin_id: string;
    competition_id: number;
    invite_code: string;
    competitions: { name: string } | null;
    league_members: { profiles: { username: string } | null }[];
};

type Profile = {
    id: string;
    username: string;
};

// --- Main Page Component ---

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🏠 HOMEPAGE: Setting up auth listener');
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🏠 HOMEPAGE: Auth state change:', event, session ? `User: ${session.user.id}` : 'No session');
      console.log('🏠 HOMEPAGE: Document visibility:', document.visibilityState);
      console.log('🏠 HOMEPAGE: Window focus:', document.hasFocus());
      
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const getInitialSession = async () => {
      console.log('🏠 HOMEPAGE: Getting initial session...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('🏠 HOMEPAGE: Session error:', error);
      }
      
      console.log('🏠 HOMEPAGE: Initial session:', session ? `User: ${session.user.id}` : 'No session');
      
      if (!session) {
        console.log('🏠 HOMEPAGE: No session, setting loading to false');
        setLoading(false);
      }
    };
    
    getInitialSession();

    return () => {
      console.log('🏠 HOMEPAGE: Cleaning up auth listener');
      authListener.subscription.unsubscribe();
    };
  }, [user]);

  if (loading) {
    console.log('🏠 HOMEPAGE: Rendering loading state');
    return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  }

  console.log('🏠 HOMEPAGE: Rendering dashboard with user:', user ? user.id : 'No user');
  return <UnifiedDashboard user={user} />;
}

// --- The Unified Dashboard for All Users ---

function UnifiedDashboard({ user }: { user: User | null }) {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [leagues, setLeagues] = useState<League[]>([]);
    const [publicCompetitions, setPublicCompetitions] = useState<Competition[]>([]);
    const [filteredCompetitions, setFilteredCompetitions] = useState<Competition[]>([]);
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const router = useRouter();

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);

    // Form states
    const [newLeagueName, setNewLeagueName] = useState('');
    const [selectedCompId, setSelectedCompId] = useState<number | string>('');
    const [joinInviteCode, setJoinInviteCode] = useState('');
    const [formError, setFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(undefined, { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    // Sort competitions based on sort order
    const sortCompetitions = useCallback((competitions: Competition[], order: 'newest' | 'oldest') => {
        return [...competitions].sort((a, b) => {
            const dateA = new Date(a.startDate || a.created_at || '').getTime();
            const dateB = new Date(b.startDate || b.created_at || '').getTime();
            
            if (order === 'newest') {
                return dateB - dateA; // Newest first
            } else {
                return dateA - dateB; // Oldest first
            }
        });
    }, []);

    const fetchDashboardData = useCallback(async () => {
        console.log('🏠 DASHBOARD: fetchDashboardData called with user:', user ? user.id : 'No user');
        
        try {
            console.log('🏠 DASHBOARD: Fetching public competitions...');
            // Always fetch public competitions (available to everyone)
            const { data: competitionsData, error: competitionsError } = await supabase
                .from('competitions')
                .select('id, name, description, lock_date, created_at');
            
            if (competitionsError) {
                console.error('🏠 DASHBOARD: Competitions fetch error:', competitionsError);
            } else {
                console.log('🏠 DASHBOARD: Competitions loaded:', competitionsData?.length);
                if (competitionsData) {
                    // Fetch first game date for each competition to use as start date
                    const competitionsWithStartDate = await Promise.all(
                        competitionsData.map(async (comp) => {
                            try {
                                const { data: firstGame } = await supabase
                                    .from('games')
                                    .select('game_date')
                                    .eq('competition_id', comp.id)
                                    .order('game_date', { ascending: true })
                                    .limit(1)
                                    .single();
                                
                                return {
                                    ...comp,
                                    startDate: firstGame?.game_date || comp.lock_date || comp.created_at
                                };
                            } catch (error) {
                                // If no games found, use lock_date or created_at
                                console.log('No games found for competition:', comp.id, error);
                                return {
                                    ...comp,
                                    startDate: comp.lock_date || comp.created_at
                                };
                            }
                        })
                    );

                    setPublicCompetitions(competitionsWithStartDate);
                    
                    // Set initial sorted competitions
                    const sorted = sortCompetitions(competitionsWithStartDate, sortOrder);
                    setFilteredCompetitions(sorted);
                    
                    if (competitionsWithStartDate.length > 0 && !selectedCompId && user) {
                        setSelectedCompId(competitionsWithStartDate[0].id);
                    }
                }
            }

            // Only fetch user-specific data if authenticated
            if (user) {
                console.log('🏠 DASHBOARD: Fetching user profile...');
                const { data: profileData, error: profileError } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                
                if (profileError) {
                    console.error('🏠 DASHBOARD: Profile fetch error:', profileError);
                } else {
                    console.log('🏠 DASHBOARD: Profile loaded:', profileData?.username);
                    setProfile(profileData);
                }

                console.log('🏠 DASHBOARD: Fetching leagues...');
                const { data: leaguesData, error: leaguesError } = await supabase
                    .from('leagues')
                    .select(`*, competitions(name), league_members(profiles(username))`)
                    .order('created_at', { ascending: false });

                if (leaguesError) {
                    console.error("🏠 DASHBOARD: Error fetching leagues:", leaguesError);
                    analytics.trackError('leagues_fetch', leaguesError.message, 'fetchDashboardData');
                } else {
                    console.log('🏠 DASHBOARD: Leagues loaded:', leaguesData?.length);
                    setLeagues(leaguesData as League[]);
                    
                    // Track milestones
                    if (leaguesData.length === 1) {
                        analytics.trackMilestone('first_league_member', 1, 'dashboard');
                    }
                }
            }
            
            console.log('🏠 DASHBOARD: Data fetch completed');
            setLoading(false);
        } catch (error) {
            console.error('🏠 DASHBOARD: Error fetching dashboard data:', error);
            analytics.trackError('dashboard_fetch', error instanceof Error ? error.message : 'Unknown error', 'fetchDashboardData');
            setLoading(false);
        }
    }, [user, selectedCompId, sortCompetitions, sortOrder]);

    // Update filtered competitions when sort order changes
    useEffect(() => {
        if (publicCompetitions.length > 0) {
            const sorted = sortCompetitions(publicCompetitions, sortOrder);
            setFilteredCompetitions(sorted);
        }
    }, [sortOrder, publicCompetitions, sortCompetitions]);

    useEffect(() => {
        console.log('🏠 DASHBOARD: useEffect triggered with user:', user ? user.id : 'No user');
        fetchDashboardData();
        
        // Track page view
        analytics.trackPageView('/', 'Homepage');
    }, [fetchDashboardData, user]);

    const handleSortChange = (newSortOrder: 'newest' | 'oldest') => {
        setSortOrder(newSortOrder);
        setShowSortDropdown(false);
        
        // Track sort usage
        analytics.trackFeatureUsage('competition_sort', 'change', newSortOrder);
    };

    const handleLogout = async () => {
        console.log('🏠 DASHBOARD: User logging out');
        analytics.trackUserLogout();
        await supabase.auth.signOut();
        router.push('/');
    };

    const handleCreateLeague = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('🏠 DASHBOARD: Creating league:', newLeagueName);
        
        if (!newLeagueName || !selectedCompId || !profile) {
            setFormError("Please fill out all fields.");
            return;
        }
        setIsSubmitting(true);
        setFormError('');

        const inviteCode = `LEAGUE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        try {
            const { data: leagueData, error: leagueError } = await supabase
                .from('leagues')
                .insert({
                    name: newLeagueName,
                    admin_id: profile.id,
                    competition_id: Number(selectedCompId),
                    invite_code: inviteCode
                })
                .select()
                .single();

            if (leagueError) {
                console.error('🏠 DASHBOARD: League creation error:', leagueError);
                setFormError(leagueError.message);
                analytics.trackError('league_creation', leagueError.message, 'handleCreateLeague');
                setIsSubmitting(false);
                return;
            }

            const { error: memberError } = await supabase
                .from('league_members')
                .insert({ league_id: leagueData.id, user_id: profile.id });

            if (memberError) {
                console.error('🏠 DASHBOARD: League member add error:', memberError);
                setFormError(memberError.message);
                analytics.trackError('league_member_add', memberError.message, 'handleCreateLeague');
            } else {
                console.log('🏠 DASHBOARD: League created successfully:', leagueData.id);
                analytics.trackLeagueCreated(
                    leagueData.id, 
                    Number(selectedCompId).toString(),
                    newLeagueName
                );
                
                if (leagues.length === 0) {
                    analytics.trackMilestone('first_league_created', 1, 'dashboard');
                }
                
                analytics.trackModalClose('create_league');
                setShowCreateModal(false);
                setNewLeagueName('');
                await fetchDashboardData();
                showNotification("League created successfully!", 'success');
            }
        } catch (error) {
            console.error('🏠 DASHBOARD: League creation exception:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            analytics.trackError('league_creation_exception', errorMessage, 'handleCreateLeague');
            setFormError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleJoinLeague = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('🏠 DASHBOARD: Joining league with code:', joinInviteCode);
        
        if (!joinInviteCode.trim() || !profile) {
            setFormError("Please enter an invite code.");
            return;
        }
        setIsSubmitting(true);
        setFormError('');

        try {
            const { data, error } = await supabase.rpc('join_league', {
                invite_code_to_join: joinInviteCode.trim()
            });

            if (error) {
                console.error('🏠 DASHBOARD: RPC Error:', error);
                analytics.trackError('league_join_rpc', error.message, 'handleJoinLeague');
                setFormError("An error occurred while joining the league. Please try again.");
                setIsSubmitting(false);
                return;
            }

            const result = data as { success: boolean; message: string; league_id?: string; league_name?: string };

            if (!result.success) {
                console.log('🏠 DASHBOARD: League join failed:', result.message);
                setFormError(result.message);
            } else {
                console.log('🏠 DASHBOARD: League joined successfully:', result.league_id);
                if (result.league_id && result.league_name) {
                    analytics.trackLeagueJoined(result.league_id, result.league_name, 'invite_code');
                }
                
                analytics.trackModalClose('join_league');
                setShowJoinModal(false);
                setJoinInviteCode('');
                await fetchDashboardData();
                showNotification(result.message, 'success');
            }
        } catch (err) {
            console.error('🏠 DASHBOARD: Unexpected error:', err);
            analytics.trackError('league_join_exception', err instanceof Error ? err.message : 'Unknown error', 'handleJoinLeague');
            setFormError("An unexpected error occurred. Please try again.");
        }
        
        setIsSubmitting(false);
    };
    
    const handleDeleteLeague = async (e: React.MouseEvent, leagueId: string) => {
        e.stopPropagation();
        console.log('🏠 DASHBOARD: Deleting league:', leagueId);
        
        if (window.confirm("Are you sure you want to permanently delete this league? This cannot be undone.")) {
            try {
                const { error } = await supabase.from('leagues').delete().eq('id', leagueId);
                if(error) {
                    console.error('🏠 DASHBOARD: League deletion error:', error);
                    analytics.trackError('league_deletion', error.message, 'handleDeleteLeague');
                    showNotification("Error deleting league: " + error.message, 'error');
                } else {
                    console.log('🏠 DASHBOARD: League deleted successfully');
                    analytics.trackLeagueDeleted(leagueId);
                    await fetchDashboardData();
                    showNotification("League deleted.", 'success');
                }
            } catch (error) {
                console.error('🏠 DASHBOARD: League deletion exception:', error);
                analytics.trackError('league_deletion_exception', error instanceof Error ? error.message : 'Unknown error', 'handleDeleteLeague');
                showNotification("Error deleting league.", 'error');
            }
        }
    };
    
    const copyToClipboard = (e: React.MouseEvent, text: string, leagueId?: string, leagueName?: string) => {
        e.stopPropagation();
        console.log('🏠 DASHBOARD: Copying invite code for league:', leagueId);
        
        navigator.clipboard.writeText(text).then(() => {
            if (leagueId && leagueName) {
                analytics.trackInviteCodeCopy(leagueId, leagueName);
            }
            analytics.trackFeatureUsage('invite_code', 'copy', text);
            showNotification("Invite code copied to clipboard!", 'success');
        }, () => {
            analytics.trackError('clipboard', 'Failed to copy text', 'copyToClipboard');
            showNotification("Failed to copy text.", 'error');
        });
    };

    const handleModalOpen = (modalType: 'create_league' | 'join_league') => {
        console.log('🏠 DASHBOARD: Opening modal:', modalType);
        analytics.trackModalOpen(modalType);
        if (modalType === 'create_league') {
            setShowCreateModal(true);
        } else {
            setShowJoinModal(true);
        }
    };

    const handleModalClose = (modalType: 'create_league' | 'join_league') => {
        console.log('🏠 DASHBOARD: Closing modal:', modalType);
        analytics.trackModalClose(modalType);
        if (modalType === 'create_league') {
            setShowCreateModal(false);
        } else {
            setShowJoinModal(false);
        }
    };

    const handleCompetitionClick = (competition: Competition) => {
        console.log('🏠 DASHBOARD: Competition clicked:', competition.id);
        analytics.trackCompetitionView(
            competition.id.toString(),
            competition.name,
            user ? 'authenticated' : 'guest'
        );
        analytics.trackNavigation('homepage', `/competitions/${competition.id}`, 'click');
    };

    const handleLeagueClick = (league: League) => {
        console.log('🏠 DASHBOARD: League clicked:', league.id);
        analytics.trackNavigation('homepage', `/competitions/${league.competition_id}?leagueId=${league.id}`, 'click');
    };

    if (loading) {
        console.log('🏠 DASHBOARD: Rendering loading state');
        return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
    }

    console.log('🏠 DASHBOARD: Rendering dashboard interface');

    return (
        <>
            {notification && (
                <div className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg z-[1001] text-white ${notification.type === 'success' ? 'bg-green-500/80' : 'bg-red-500/80'}`}>
                    {notification.message}
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-black dark:text-white">
                <header className="flex justify-between items-center mb-10 flex-wrap gap-4">
                    {user ? (
                        <>
                            <h1 className="text-4xl font-bold">Welcome, {profile?.username || 'User'}</h1>
                            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-800 dark:text-slate-300 rounded-full hover:bg-gray-300 dark:hover:bg-slate-700 transition-colors">
                                <LogOut size={18} /> Logout
                            </button>
                        </>
                    ) : (
                        <h1 className="text-4xl font-bold">Pick&apos;Em Competitions</h1>
                    )}
                </header>

                {/* Welcome Message for Non-authenticated Users */}
                {!user && (
                    <div className="mb-12 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
                        <h2 className="text-2xl font-bold mb-2 text-blue-900 dark:text-blue-100">
                            🏆 Welcome to Pick&apos;Em!
                        </h2>
                        <p className="text-blue-800 dark:text-blue-200 mb-4">
                            Browse competitions below and start making your predictions! You can make picks as a guest, 
                            then sign up to save them and compete with friends in private leagues.
                        </p>
                    </div>
                )}

                {/* Private Leagues Section - Only for Authenticated Users */}
                {user && (
                    <section className="mb-12">
                        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                            <h2 className="text-3xl font-bold flex items-center gap-3"><Users /> My Private Leagues</h2>
                            <div className="flex gap-2">
                                <button onClick={() => handleModalOpen('create_league')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-transform">
                                    <Plus size={18} /> Create League
                                </button>
                                <button onClick={() => handleModalOpen('join_league')} className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-800 dark:text-slate-300 rounded-full hover:bg-gray-300 dark:hover:bg-slate-700 transition-colors">
                                    Join League
                                </button>
                            </div>
                        </div>
                        {leagues.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {leagues.map(league => (
                                    <Link key={league.id} href={`/competitions/${league.competition_id}?leagueId=${league.id}`} onClick={() => handleLeagueClick(league)} className="group block bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 flex flex-col justify-between hover:border-blue-500 dark:hover:border-violet-500 transition-all">
                                        <div className="flex flex-col h-full">
                                            <div className="flex-grow">
                                                <h3 className="text-xl font-bold text-blue-600 dark:text-violet-400 mb-1">{league.name}</h3>
                                                <p className="text-gray-600 dark:text-slate-400 mb-4 text-sm">Competition: {league.competitions?.name || 'N/A'}</p>
                                                <div className="flex items-center gap-2 text-sm bg-gray-100 dark:bg-slate-800 p-2 rounded-lg">
                                                    <span className="text-gray-500 dark:text-slate-400">Invite Code:</span>
                                                    <strong className="text-gray-800 dark:text-white">{league.invite_code}</strong>
                                                    <button onClick={(e) => copyToClipboard(e, league.invite_code, league.id, league.name)} className="ml-auto p-1 text-gray-500 dark:text-slate-400 hover:text-black dark:hover:text-white"><Copy size={16} /></button>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-slate-800">
                                                <span className="text-gray-500 dark:text-slate-400 text-sm flex items-center gap-2"><Users size={16} /> {league.league_members.length} Members</span>
                                                <div className="flex items-center gap-2">
                                                    <Link href={`/leagues/${league.id}/leaderboard`} onClick={(e) => {
                                                        e.stopPropagation();
                                                        analytics.trackLeaderboardView('league', league.id, league.name);
                                                        analytics.trackNavigation('homepage_league_card', `/leagues/${league.id}/leaderboard`, 'click');
                                                    }} className="p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full" title="View League Leaderboard"><BarChart2 size={16} /></Link>
                                                    {profile?.id === league.admin_id && (
                                                        <button onClick={(e) => handleDeleteLeague(e, league.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full" title="Delete League"><Trash2 size={16} /></button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800">
                                <p className="text-gray-500 dark:text-slate-400">You haven&apos;t joined any private leagues yet.</p>
                            </div>
                        )}
                    </section>
                )}
                
                {/* Private Leagues CTA for Non-authenticated Users */}
                {!user && (
                    <section className="mb-12">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-8 text-center">
                            <Users className="w-16 h-16 mx-auto mb-4 text-blue-500" />
                            <h2 className="text-2xl font-bold mb-2">Want to Compete with Friends?</h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Create private leagues to compete with your friends, family, or coworkers. 
                                Track rankings, share invite codes, and see who knows sports best!
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Create an account using the login button in the top navigation bar
                            </p>
                        </div>
                    </section>
                )}

                {/* Public Competitions Section - Available to Everyone */}
                <section>
                    <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                        <h2 className="text-3xl font-bold flex items-center gap-3">
                            <Trophy /> {user ? 'Public Competitions' : 'Browse Competitions'}
                        </h2>
                        
                        {/* Sort Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowSortDropdown(!showSortDropdown)}
                                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                <Calendar size={18} />
                                Sort by: {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
                                <ChevronDown size={18} className={`transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {showSortDropdown && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg shadow-lg z-10">
                                    <button
                                        onClick={() => handleSortChange('newest')}
                                        className={`w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-slate-800 first:rounded-t-lg ${sortOrder === 'newest' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''}`}
                                    >
                                        Newest First
                                    </button>
                                    <button
                                        onClick={() => handleSortChange('oldest')}
                                        className={`w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-slate-800 last:rounded-b-lg ${sortOrder === 'oldest' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''}`}
                                    >
                                        Oldest First
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Close dropdown when clicking outside */}
                    {showSortDropdown && (
                        <div 
                            className="fixed inset-0 z-5" 
                            onClick={() => setShowSortDropdown(false)}
                        />
                    )}

                    {filteredCompetitions.length > 0 ? (
                        <div className="space-y-4">
                            {filteredCompetitions.map((comp) => (
                                <Link key={comp.id} href={`/competitions/${comp.id}`} onClick={() => handleCompetitionClick(comp)} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 flex items-center justify-between hover:border-blue-500 dark:hover:border-violet-500 transition-all group">
                                    <div className="flex-grow">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="text-xl font-semibold">{comp.name}</h3>
                                            {comp.startDate && (
                                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 ml-4">
                                                    <Calendar className="w-4 h-4 mr-1" />
                                                    Starts: {formatDate(comp.startDate)}
                                                </div>
                                            )}
                                        </div>
                                        {comp.description && (
                                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{comp.description}</p>
                                        )}
                                        {!user && (
                                            <p className="text-blue-600 dark:text-blue-400 text-sm mt-1">
                                                👆 Click to start making predictions
                                            </p>
                                        )}
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-400 dark:text-slate-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800">
                            <p className="text-gray-500 dark:text-slate-400">No competitions available right now.</p>
                        </div>
                    )}
                </section>

                {/* League Creation Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[1000]">
                        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-8 rounded-2xl w-full max-w-md relative">
                            <button onClick={() => handleModalClose('create_league')} className="absolute top-4 right-4 text-gray-500 dark:text-slate-400 hover:text-black dark:hover:text-white"><X size={24} /></button>
                            <h2 className="text-2xl font-bold mb-6">Create a New League</h2>
                            <form onSubmit={handleCreateLeague} className="space-y-4">
                                <div>
                                    <label htmlFor="leagueName" className="block mb-1 text-gray-600 dark:text-slate-400">League Name</label>
                                    <input id="leagueName" type="text" value={newLeagueName} onChange={e => setNewLeagueName(e.target.value)} className="w-full p-2 bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg" placeholder="e.g., The Office Champions" />
                                </div>
                                <div>
                                    <label htmlFor="competition" className="block mb-1 text-gray-600 dark:text-slate-400">Link to Competition</label>
                                    <select id="competition" value={selectedCompId || ''} onChange={e => setSelectedCompId(Number(e.target.value))} className="w-full p-2 bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg">
                                        {publicCompetitions.map(comp => <option key={comp.id} value={comp.id}>{comp.name}</option>)}
                                    </select>
                                </div>
                                {formError && <p className="text-red-500">{formError}</p>}
                                <button type="submit" className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg disabled:opacity-70" disabled={isSubmitting}>
                                    {isSubmitting ? 'Creating...' : 'Create League'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Join League Modal */}
                {showJoinModal && (
                     <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[1000]">
                        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-8 rounded-2xl w-full max-w-md relative">
                            <button onClick={() => handleModalClose('join_league')} className="absolute top-4 right-4 text-gray-500 dark:text-slate-400 hover:text-black dark:hover:text-white"><X size={24} /></button>
                            <h2 className="text-2xl font-bold mb-6">Join a League</h2>
                            <form onSubmit={handleJoinLeague} className="space-y-4">
                                <div>
                                    <label htmlFor="inviteCode" className="block mb-1 text-gray-600 dark:text-slate-400">Invite Code</label>
                                    <input id="inviteCode" type="text" value={joinInviteCode} onChange={e => setJoinInviteCode(e.target.value)} className="w-full p-2 bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg" placeholder="Enter code from a friend" />
                                </div>
                                {formError && <p className="text-red-500">{formError}</p>}
                                <button type="submit" className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg disabled:opacity-70" disabled={isSubmitting}>
                                    {isSubmitting ? 'Joining...' : 'Join League'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}