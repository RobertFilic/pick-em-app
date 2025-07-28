/*
================================================================================
File: app/page.tsx (New Unified Dashboard)
================================================================================
This component combines the public competitions list and the private leagues
manager into a single, unified dashboard for logged-in users. It also
conditionally renders the LandingPage if the user is not logged in.
*/

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trophy, ArrowRight, Plus, Users, Trash2, Copy, X, LogOut } from 'lucide-react';
import LandingPage from './LandingPage';

// --- Type Definitions ---

type Competition = {
    id: number;
    name: string;
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

// --- Main Page Component (Acts as a router) ---

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Check initial session
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

  // If there is a user, show the dashboard. Otherwise, show the landing page.
  return user ? <UnifiedDashboard user={user} /> : <LandingPage />;
}


// --- The Unified Dashboard for Logged-in Users ---

function UnifiedDashboard({ user }: { user: User }) {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [leagues, setLeagues] = useState<League[]>([]);
    const [publicCompetitions, setPublicCompetitions] = useState<Competition[]>([]);
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

    const fetchDashboardData = useCallback(async () => {
        if (!user) return;
        
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(profileData);

        const { data: leaguesData, error: leaguesError } = await supabase
            .from('leagues')
            .select(`*, competitions(name), league_members(profiles(username))`)
            .order('created_at', { ascending: false });

        if (leaguesError) console.error("Error fetching leagues:", leaguesError);
        else setLeagues(leaguesData as League[]);

        const { data: competitionsData } = await supabase.from('competitions').select('id, name');
        if (competitionsData) {
            setPublicCompetitions(competitionsData);
            if (competitionsData.length > 0 && !selectedCompId) {
                setSelectedCompId(competitionsData[0].id);
            }
        }
        setLoading(false);
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
                competition_id: selectedCompId,
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

        const { data: leagueData, error: findError } = await supabase
            .from('leagues')
            .select('id')
            .eq('invite_code', joinInviteCode.trim())
            .single();

        if (findError || !leagueData) {
            setFormError("Invalid invite code. Please check and try again.");
            setIsSubmitting(false);
            return;
        }

        const { error: memberError } = await supabase
            .from('league_members')
            .insert({ league_id: leagueData.id, user_id: profile.id });

        if (memberError) {
            if (memberError.code === '23505') {
                 setFormError("You are already a member of this league.");
            } else {
                 setFormError(memberError.message);
            }
        } else {
            setShowJoinModal(false);
            setJoinInviteCode('');
            await fetchDashboardData();
            showNotification("Successfully joined league!", 'success');
        }
        setIsSubmitting(false);
    };
    
    const handleDeleteLeague = async (leagueId: string) => {
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
    
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            showNotification("Invite code copied to clipboard!", 'success');
        }, () => {
            showNotification("Failed to copy text.", 'error');
        });
    };

    if (loading || !profile) {
        return <div className="min-h-screen flex items-center justify-center text-white">Loading Dashboard...</div>;
    }

    return (
        <>
            {/* Notification Popup */}
            {notification && (
                <div className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg z-[1001] text-white ${notification.type === 'success' ? 'bg-green-500/80' : 'bg-red-500/80'}`}>
                    {notification.message}
                </div>
            )}

            {/* Main Dashboard Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <header className="flex justify-between items-center mb-10 flex-wrap gap-4">
                    <h1 className="text-4xl font-bold">Welcome, {profile.username}</h1>
                    <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 text-slate-300 rounded-full hover:bg-slate-800 transition-colors">
                        <LogOut size={18} /> Logout
                    </button>
                </header>

                {/* Private Leagues Section */}
                <section className="mb-12">
                    <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                        <h2 className="text-3xl font-bold flex items-center gap-3"><Users /> My Private Leagues</h2>
                        <div className="flex gap-2">
                            <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-full hover:scale-105 transition-transform">
                                <Plus size={18} /> Create League
                            </button>
                            <button onClick={() => setShowJoinModal(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 text-slate-300 rounded-full hover:bg-slate-800 transition-colors">
                                Join League
                            </button>
                        </div>
                    </div>
                    {leagues.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {leagues.map(league => (
                                <div key={league.id} className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-violet-400 mb-1">{league.name}</h3>
                                        <p className="text-slate-400 mb-4 text-sm">Competition: {league.competitions?.name || 'N/A'}</p>
                                        <div className="flex items-center gap-2 text-sm bg-slate-800/50 p-2 rounded-lg">
                                            <span className="text-slate-400">Invite Code:</span>
                                            <strong className="text-white">{league.invite_code}</strong>
                                            <Copy size={16} onClick={() => copyToClipboard(league.invite_code)} className="cursor-pointer text-slate-400 hover:text-white" />
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-800">
                                        <span className="text-slate-400 text-sm flex items-center gap-2"><Users size={16} /> {league.league_members.length} Members</span>
                                        {profile?.id === league.admin_id && (
                                            <button onClick={() => handleDeleteLeague(league.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-full">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-slate-900/50 rounded-2xl border border-slate-800">
                            <p className="text-slate-400">You haven&apos;t joined any private leagues yet. Create one or join with an invite code!</p>
                        </div>
                    )}
                </section>

                {/* Public Competitions Section */}
                <section>
                    <h2 className="text-3xl font-bold mb-6 flex items-center gap-3"><Trophy /> Public Competitions</h2>
                    <div className="space-y-4">
                        {publicCompetitions.map((comp) => (
                            <Link key={comp.id} href={`/competitions/${comp.id}`} className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 flex items-center justify-between hover:border-violet-500 transition-all group">
                                <h3 className="text-xl font-semibold">{comp.name}</h3>
                                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Create League Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[1000]">
                        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md relative">
                            <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={24} /></button>
                            <h2 className="text-2xl font-bold mb-6">Create a New League</h2>
                            <form onSubmit={handleCreateLeague} className="space-y-4">
                                <div>
                                    <label htmlFor="leagueName" className="block mb-1 text-slate-400">League Name</label>
                                    <input id="leagueName" type="text" value={newLeagueName} onChange={e => setNewLeagueName(e.target.value)} className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg" placeholder="e.g., The Office Champions" />
                                </div>
                                <div>
                                    <label htmlFor="competition" className="block mb-1 text-slate-400">Link to Competition</label>
                                    <select id="competition" value={selectedCompId || ''} onChange={e => setSelectedCompId(Number(e.target.value))} className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg">
                                        {publicCompetitions.map(comp => <option key={comp.id} value={comp.id}>{comp.name}</option>)}
                                    </select>
                                </div>
                                {formError && <p className="text-red-400">{formError}</p>}
                                <button type="submit" className="w-full py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-lg disabled:opacity-70" disabled={isSubmitting}>
                                    {isSubmitting ? 'Creating...' : 'Create League'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Join League Modal */}
                {showJoinModal && (
                     <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[1000]">
                        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md relative">
                            <button onClick={() => setShowJoinModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={24} /></button>
                            <h2 className="text-2xl font-bold mb-6">Join a League</h2>
                            <form onSubmit={handleJoinLeague} className="space-y-4">
                                <div>
                                    <label htmlFor="inviteCode" className="block mb-1 text-slate-400">Invite Code</label>
                                    <input id="inviteCode" type="text" value={joinInviteCode} onChange={e => setJoinInviteCode(e.target.value)} className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg" placeholder="Enter code from a friend" />
                                </div>
                                {formError && <p className="text-red-400">{formError}</p>}
                                <button type="submit" className="w-full py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-lg disabled:opacity-70" disabled={isSubmitting}>
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
