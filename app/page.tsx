/*
================================================================================
File: app/page.tsx (Updated for Both User Types)
================================================================================
This version shows competitions to everyone, and leagues only to authenticated users.
Non-authenticated users get prompts to sign up for league functionality.
*/

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trophy, ArrowRight, Plus, Users, Trash2, Copy, X, LogOut, BarChart2, UserPlus, LogIn } from 'lucide-react';

// --- Type Definitions ---

type Competition = {
    id: number;
    name: string;
    description?: string;
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
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const getInitialSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            setLoading(false);
        }
    };
    getInitialSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  }

  return <UnifiedDashboard user={user} />;
}

// --- The Unified Dashboard for All Users ---

function UnifiedDashboard({ user }: { user: User | null }) {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [leagues, setLeagues] = useState<League[]>([]);
    const [publicCompetitions, setPublicCompetitions] = useState<Competition[]>([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const router = useRouter();

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);

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

    const fetchDashboardData = useCallback(async () => {
        try {
            // Always fetch public competitions (available to everyone)
            const { data: competitionsData } = await supabase.from('competitions').select('id, name, description');
            if (competitionsData) {
                setPublicCompetitions(competitionsData);
                if (competitionsData.length > 0 && !selectedCompId && user) {
                    setSelectedCompId(competitionsData[0].id);
                }
            }

            // Only fetch user-specific data if authenticated
            if (user) {
                const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                setProfile(profileData);

                const { data: leaguesData, error: leaguesError } = await supabase
                    .from('leagues')
                    .select(`*, competitions(name), league_members(profiles(username))`)
                    .order('created_at', { ascending: false });

                if (leaguesError) console.error("Error fetching leagues:", leaguesError);
                else setLeagues(leaguesData as League[]);
            }
            
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    }, [user, selectedCompId]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    const handleCreateLeague = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newLeagueName || !selectedCompId || !profile) {
            setFormError("Please fill out all fields.");
            return;
        }
        setIsSubmitting(true);
        setFormError('');

        const inviteCode = `LEAGUE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

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
            setFormError(leagueError.message);
            setIsSubmitting(false);
            return;
        }

        const { error: memberError } = await supabase
            .from('league_members')
            .insert({ league_id: leagueData.id, user_id: profile.id });

        if (memberError) {
            setFormError(memberError.message);
        } else {
            setShowCreateModal(false);
            setNewLeagueName('');
            await fetchDashboardData();
            showNotification("League created successfully!", 'success');
        }
        setIsSubmitting(false);
    };

    const handleJoinLeague = async (e: React.FormEvent) => {
        e.preventDefault();
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
                console.error('RPC Error:', error);
                setFormError("An error occurred while joining the league. Please try again.");
                setIsSubmitting(false);
                return;
            }

            const result = data as { success: boolean; message: string; league_id?: string; league_name?: string };

            if (!result.success) {
                setFormError(result.message);
            } else {
                setShowJoinModal(false);
                setJoinInviteCode('');
                await fetchDashboardData();
                showNotification(result.message, 'success');
            }
        } catch (err) {
            console.error('Unexpected error:', err);
            setFormError("An unexpected error occurred. Please try again.");
        }
        
        setIsSubmitting(false);
    };
    
    const handleDeleteLeague = async (e: React.MouseEvent, leagueId: string) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to permanently delete this league? This cannot be undone.")) {
            const { error } = await supabase.from('leagues').delete().eq('id', leagueId);
            if(error) {
                showNotification("Error deleting league: " + error.message, 'error');
            } else {
                await fetchDashboardData();
                showNotification("League deleted.", 'success');
            }
        }
    };
    
    const copyToClipboard = (e: React.MouseEvent, text: string) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text).then(() => {
            showNotification("Invite code copied to clipboard!", 'success');
        }, () => {
            showNotification("Failed to copy text.", 'error');
        });
    };

    const handleAuthRequired = () => {
        setShowAuthModal(true);
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
    }

    return (
        <>
            {notification && (
                <div className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg z-[1001] text-white ${notification.type === 'success' ? 'bg-green-500/80' : 'bg-red-500/80'}`}>
                    {notification.message}
                </div>
            )}

            {/* Auth Modal for Non-authenticated Users */}
            {showAuthModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[1000]">
                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-8 rounded-2xl w-full max-w-md relative">
                        <button 
                            onClick={() => setShowAuthModal(false)} 
                            className="absolute top-4 right-4 text-gray-500 dark:text-slate-400 hover:text-black dark:hover:text-white"
                        >
                            <X size={24} />
                        </button>
                        <h2 className="text-2xl font-bold mb-4">Create Private Leagues</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Sign up or log in to create and join private leagues with your friends!
                        </p>
                        <div className="flex gap-3">
                            <Link
                                href="/login"
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <UserPlus className="w-4 h-4" />
                                Sign Up
                            </Link>
                            <Link
                                href="/login"
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <LogIn className="w-4 h-4" />
                                Log In
                            </Link>
                        </div>
                    </div>
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
                        <>
                            <h1 className="text-4xl font-bold">Pick&apos;Em Competitions</h1>
                            <div className="flex gap-3">
                                <Link
                                    href="/login"
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                                >
                                    <LogIn size={18} />
                                    Log In
                                </Link>
                                <Link
                                    href="/login"
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
                                >
                                    <UserPlus size={18} />
                                    Sign Up
                                </Link>
                            </div>
                        </>
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
                                <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-transform">
                                    <Plus size={18} /> Create League
                                </button>
                                <button onClick={() => setShowJoinModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-800 dark:text-slate-300 rounded-full hover:bg-gray-300 dark:hover:bg-slate-700 transition-colors">
                                    Join League
                                </button>
                            </div>
                        </div>
                        {leagues.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {leagues.map(league => (
                                    <Link key={league.id} href={`/competitions/${league.competition_id}?leagueId=${league.id}`} className="group block bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 flex flex-col justify-between hover:border-blue-500 dark:hover:border-violet-500 transition-all">
                                        <div className="flex flex-col h-full">
                                            <div className="flex-grow">
                                                <h3 className="text-xl font-bold text-blue-600 dark:text-violet-400 mb-1">{league.name}</h3>
                                                <p className="text-gray-600 dark:text-slate-400 mb-4 text-sm">Competition: {league.competitions?.name || 'N/A'}</p>
                                                <div className="flex items-center gap-2 text-sm bg-gray-100 dark:bg-slate-800 p-2 rounded-lg">
                                                    <span className="text-gray-500 dark:text-slate-400">Invite Code:</span>
                                                    <strong className="text-gray-800 dark:text-white">{league.invite_code}</strong>
                                                    <button onClick={(e) => copyToClipboard(e, league.invite_code)} className="ml-auto p-1 text-gray-500 dark:text-slate-400 hover:text-black dark:hover:text-white"><Copy size={16} /></button>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-slate-800">
                                                <span className="text-gray-500 dark:text-slate-400 text-sm flex items-center gap-2"><Users size={16} /> {league.league_members.length} Members</span>
                                                <div className="flex items-center gap-2">
                                                    <Link href={`/leagues/${league.id}/leaderboard`} onClick={(e) => e.stopPropagation()} className="p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full" title="View League Leaderboard"><BarChart2 size={16} /></Link>
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
                            <button 
                                onClick={handleAuthRequired}
                                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors"
                            >
                                Sign Up to Create Leagues
                            </button>
                        </div>
                    </section>
                )}

                {/* Public Competitions Section - Available to Everyone */}
                <section>
                    <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                        <Trophy /> {user ? 'Public Competitions' : 'Browse Competitions'}
                    </h2>
                    {publicCompetitions.length > 0 ? (
                        <div className="space-y-4">
                            {publicCompetitions.map((comp) => (
                                <Link key={comp.id} href={`/competitions/${comp.id}`} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 flex items-center justify-between hover:border-blue-500 dark:hover:border-violet-500 transition-all group">
                                    <div>
                                        <h3 className="text-xl font-semibold mb-1">{comp.name}</h3>
                                        {comp.description && (
                                            <p className="text-gray-600 dark:text-gray-400 text-sm">{comp.description}</p>
                                        )}
                                        {!user && (
                                            <p className="text-blue-600 dark:text-blue-400 text-sm mt-1">
                                                👆 Click to start making predictions
                                            </p>
                                        )}
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-400 dark:text-slate-400 group-hover:translate-x-1 transition-transform" />
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
                            <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 text-gray-500 dark:text-slate-400 hover:text-black dark:hover:text-white"><X size={24} /></button>
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
                            <button onClick={() => setShowJoinModal(false)} className="absolute top-4 right-4 text-gray-500 dark:text-slate-400 hover:text-black dark:hover:text-white"><X size={24} /></button>
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