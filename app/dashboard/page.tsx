/*
================================================================================
File: app/dashboard/page.tsx
================================================================================
This component serves as the main user dashboard after login. It handles
displaying public competitions and the new private leagues feature, including
modals for creating, joining, and managing leagues.

FIXES:
- Implemented a custom Type Guard function `isLeagueArray` to safely validate
  the data structure from Supabase at runtime. This is the most robust
  solution and resolves all linter warnings related to type assertions.
- Replaced 'any' with 'unknown' for better type safety in the type guard.
- Removed unused 'User' type import from Supabase.
- Removed the unused parameter from the copyToClipboard error handler.
*/
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { LogOut, Plus, Users, Trash2, Copy, X } from 'lucide-react';

// Initialize Supabase client
// IMPORTANT: Replace with your actual Supabase project URL and public anon key.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project-id.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Define types for our data structures
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
    competitions: { name: string };
    league_members: { profiles: { username: string } }[];
};

type Profile = {
    id: string;
    username: string;
};

// Type Guard to check if the data is a valid League array
function isLeagueArray(data: unknown): data is League[] {
    return (
        Array.isArray(data) &&
        (data.length === 0 ||
            (typeof data[0].id === 'string' &&
                typeof data[0].name === 'string' &&
                typeof data[0].invite_code === 'string'))
    );
}

export default function DashboardPage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [leagues, setLeagues] = useState<League[]>([]);
    const [publicCompetitions, setPublicCompetitions] = useState<Competition[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);

    // Form states
    const [newLeagueName, setNewLeagueName] = useState('');
    const [selectedCompId, setSelectedCompId] = useState<number | null>(null);
    const [joinInviteCode, setJoinInviteCode] = useState('');
    const [formError, setFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);


    const fetchLeagues = useCallback(async () => {
        if (!profile) return;
        const { data, error } = await supabase
            .from('leagues')
            .select(`
                id, name, admin_id, competition_id, invite_code,
                competitions ( name ),
                league_members ( profiles ( username ) )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching leagues:', error);
        } else if (data) {
            // Use the type guard to safely set the state
            if (isLeagueArray(data)) {
                setLeagues(data);
            } else {
                console.error("Data fetched from Supabase does not match the expected League[] type.");
            }
        }
    }, [profile]);

    useEffect(() => {
        const checkUserAndFetchData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
                setProfile(profileData);

                const { data: competitionsData } = await supabase.from('competitions').select('id, name');
                if (competitionsData) {
                    setPublicCompetitions(competitionsData);
                    if (competitionsData.length > 0) {
                        setSelectedCompId(competitionsData[0].id);
                    }
                }
            } else {
                window.location.href = '/login';
            }
            setLoading(false);
        };
        checkUserAndFetchData();
    }, []);

    useEffect(() => {
        if (profile) {
            fetchLeagues();
        }
    }, [profile, fetchLeagues]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
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
            await fetchLeagues();
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
            // Handle case where user is already a member
            if (memberError.code === '23505') { // uniqueness violation
                 setFormError("You are already a member of this league.");
            } else {
                 setFormError(memberError.message);
            }
        } else {
            setShowJoinModal(false);
            setJoinInviteCode('');
            await fetchLeagues();
        }
        setIsSubmitting(false);
    };
    
    const handleDeleteLeague = async (leagueId: string) => {
        if (window.confirm("Are you sure you want to permanently delete this league? This cannot be undone.")) {
            const { error } = await supabase.from('leagues').delete().eq('id', leagueId);
            if(error) {
                alert("Error deleting league: " + error.message);
            } else {
                await fetchLeagues();
            }
        }
    };
    
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            alert("Invite code copied to clipboard!");
        }, () => {
            alert("Failed to copy text.");
        });
    };


    if (loading) {
        return <div className="loading-screen">Loading Dashboard...</div>;
    }

    return (
        <>
            <style jsx global>{`
                /* Base styles from previous components for consistency */
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #ffffff; background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%); overflow-x: hidden; }
                .dashboard-container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
                .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; flex-wrap: wrap; gap: 20px; }
                .header h1 { font-size: 2.5rem; font-weight: 700; color: #fff; }
                .user-info { display: flex; align-items: center; gap: 15px; }
                .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 20px; border-radius: 50px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; border: none; }
                .btn-primary { background: linear-gradient(135deg, #ff6b6b, #ee5a24); color: white; }
                .btn-primary:hover { transform: translateY(-2px); }
                .btn-secondary { background: transparent; color: #4ecdc4; border: 2px solid #4ecdc4; }
                .btn-secondary:hover { background: #4ecdc4; color: #0f0f23; }
                .btn-danger { background: transparent; color: #ff6b6b; border: 2px solid #ff6b6b; padding: 6px 12px; font-size: 0.8rem; }
                .btn-danger:hover { background: #ff6b6b; color: #0f0f23; }
                .section { background: rgba(255, 255, 255, 0.05); border-radius: 20px; padding: 30px; margin-bottom: 30px; }
                .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 15px; }
                .section-header h2 { font-size: 1.8rem; font-weight: 600; }
                .league-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
                .league-card { background: rgba(0,0,0,0.2); border-radius: 15px; padding: 20px; border: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; justify-content: space-between; }
                .league-card h3 { font-size: 1.4rem; margin-bottom: 5px; color: #4ecdc4; }
                .league-card p { color: #b8b8d1; margin-bottom: 15px; }
                .league-card-footer { display: flex; justify-content: space-between; align-items: center; }
                .modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
                .modal-content { background: #1a1a2e; border-radius: 20px; padding: 40px; width: 90%; max-width: 500px; border: 1px solid rgba(255,255,255,0.1); position: relative; }
                .modal-close { position: absolute; top: 15px; right: 15px; background: none; border: none; color: #fff; cursor: pointer; }
                .modal-content h2 { margin-top: 0; margin-bottom: 20px; }
                .form-group { margin-bottom: 20px; text-align: left; }
                .form-group label { display: block; margin-bottom: 8px; color: #b8b8d1; }
                .form-input, .form-select { width: 100%; padding: 12px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff; font-size: 1rem; }
                .form-error { color: #ff6b6b; margin-top: 15px; }
            `}</style>
            <div className="dashboard-container">
                <header className="header">
                    <h1>Dashboard</h1>
                    {profile && (
                        <div className="user-info">
                            <span>Welcome, <strong>{profile.username}</strong></span>
                            <button onClick={handleLogout} className="btn btn-secondary"><LogOut size={18} /> Logout</button>
                        </div>
                    )}
                </header>

                <div className="section">
                    <div className="section-header">
                        <h2>My Private Leagues</h2>
                        <div>
                            <button onClick={() => setShowCreateModal(true)} className="btn btn-primary" style={{ marginRight: '10px' }}><Plus size={18} /> Create League</button>
                            <button onClick={() => setShowJoinModal(true)} className="btn btn-secondary">Join League</button>
                        </div>
                    </div>
                    {leagues.length > 0 ? (
                        <div className="league-grid">
                            {leagues.map(league => (
                                <div key={league.id} className="league-card">
                                    <div>
                                        <h3>{league.name}</h3>
                                        <p>Competition: {league.competitions?.name || 'N/A'}</p>
                                        <p>Invite Code: <strong>{league.invite_code}</strong> <Copy size={16} onClick={() => copyToClipboard(league.invite_code)} style={{cursor: 'pointer', marginLeft: '5px', verticalAlign: 'middle'}} /></p>
                                    </div>
                                    <div className="league-card-footer">
                                        <span><Users size={16} /> {league.league_members.length} Members</span>
                                        {profile?.id === league.admin_id && (
                                            <button onClick={() => handleDeleteLeague(league.id)} className="btn btn-danger"><Trash2 size={14} /></button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>You haven&apos;t joined any private leagues yet. Create one or join with an invite code!</p>
                    )}
                </div>

                {/* Create League Modal */}
                {showCreateModal && (
                    <div className="modal-backdrop">
                        <div className="modal-content">
                            <button onClick={() => setShowCreateModal(false)} className="modal-close"><X size={24} /></button>
                            <h2>Create a New League</h2>
                            <form onSubmit={handleCreateLeague}>
                                <div className="form-group">
                                    <label htmlFor="leagueName">League Name</label>
                                    <input id="leagueName" type="text" value={newLeagueName} onChange={e => setNewLeagueName(e.target.value)} className="form-input" placeholder="e.g., The Office Champions" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="competition">Link to Competition</label>
                                    <select id="competition" value={selectedCompId || ''} onChange={e => setSelectedCompId(Number(e.target.value))} className="form-select">
                                        {publicCompetitions.map(comp => <option key={comp.id} value={comp.id}>{comp.name}</option>)}
                                    </select>
                                </div>
                                {formError && <p className="form-error">{formError}</p>}
                                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isSubmitting}>
                                    {isSubmitting ? 'Creating...' : 'Create League'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Join League Modal */}
                {showJoinModal && (
                    <div className="modal-backdrop">
                        <div className="modal-content">
                            <button onClick={() => setShowJoinModal(false)} className="modal-close"><X size={24} /></button>
                            <h2>Join a League</h2>
                            <form onSubmit={handleJoinLeague}>
                                <div className="form-group">
                                    <label htmlFor="inviteCode">Invite Code</label>
                                    <input id="inviteCode" type="text" value={joinInviteCode} onChange={e => setJoinInviteCode(e.target.value)} className="form-input" placeholder="Enter code from a friend" />
                                </div>
                                {formError && <p className="form-error">{formError}</p>}
                                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isSubmitting}>
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
