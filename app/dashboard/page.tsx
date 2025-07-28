/*
================================================================================
File: app/dashboard/page.tsx
================================================================================
This component serves as the main user dashboard after login. It will handle
displaying public competitions and the new private leagues feature.
*/
'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User, LogOut, Plus, Users, Trash2, Copy } from 'lucide-react';

// Initialize Supabase client
// IMPORTANT: Replace with your actual Supabase project URL and public anon key.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project-id.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Mock data for demonstration purposes - replace with actual data from Supabase
const MOCK_COMPETITIONS = [
    { id: 'comp_1', name: 'Euro Basketball Championship 2025' },
    { id: 'comp_2', name: 'World Hockey Cup 2025' },
];

// Define types for our data structures
type Competition = {
    id: string;
    name: string;
};

type League = {
    id: string;
    name: string;
    admin_id: string;
    competition_id: string;
    invite_code: string;
    competitions: { name: string }; // Joined data
    league_members: { profiles: { username: string } }[]; // Joined data
};

type Profile = {
    id: string;
    username: string;
};

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [leagues, setLeagues] = useState<League[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser(session.user);
                // Fetch user profile and leagues
                const { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
                setProfile(profileData);
                await fetchLeagues(session.user.id);
            } else {
                window.location.href = '/login'; // Redirect if not logged in
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    const fetchLeagues = async (userId: string) => {
        // Fetch leagues where the current user is a member
        const { data, error } = await supabase
            .from('leagues')
            .select(`
                *,
                competitions (name),
                league_members ( profiles ( username ) )
            `)
            .filter('league_members.user_id', 'eq', userId);

        if (error) {
            console.error('Error fetching leagues:', error);
        } else if (data) {
            setLeagues(data as League[]);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    if (loading) {
        return <div className="loading-screen">Loading...</div>;
    }

    return (
        <>
            <style jsx global>{`
                /* Using similar styles from the landing/auth pages for consistency */
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #ffffff;
                    background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
                    overflow-x: hidden;
                }
                .dashboard-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 40px 20px;
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 40px;
                }
                .header h1 {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: #fff;
                }
                .user-info { display: flex; align-items: center; gap: 15px; }
                .btn-secondary {
                    background: transparent;
                    color: #4ecdc4;
                    border: 2px solid #4ecdc4;
                    padding: 10px 20px;
                    border-radius: 50px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .btn-secondary:hover { background: #4ecdc4; color: #0f0f23; }
                .section {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 20px;
                    padding: 30px;
                    margin-bottom: 30px;
                }
                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                .section-header h2 { font-size: 1.8rem; font-weight: 600; }
                .btn-primary {
                    background: linear-gradient(135deg, #ff6b6b, #ee5a24);
                    color: white;
                    border: none;
                    padding: 12px 25px;
                    border-radius: 50px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .btn-primary:hover { transform: translateY(-2px); }
                .league-card {
                    background: rgba(0,0,0,0.2);
                    border-radius: 15px;
                    padding: 20px;
                    margin-bottom: 15px;
                    border: 1px solid rgba(255,255,255,0.1);
                }
                .league-card h3 { font-size: 1.4rem; margin-bottom: 5px; }
                .league-card p { color: #b8b8d1; }
                /* Add more styles as needed for modals, forms, etc. */
            `}</style>
            <div className="dashboard-container">
                <header className="header">
                    <h1>Dashboard</h1>
                    <div className="user-info">
                        <span>Welcome, {profile?.username || user?.email}</span>
                        <button onClick={handleLogout} className="btn-secondary">
                            <LogOut size={18} style={{ marginRight: '8px' }} />
                            Logout
                        </button>
                    </div>
                </header>

                <div className="section">
                    <div className="section-header">
                        <h2>My Private Leagues</h2>
                        <div>
                            <button onClick={() => setShowCreateModal(true)} className="btn-primary" style={{ marginRight: '10px' }}>Create League</button>
                            <button onClick={() => setShowJoinModal(true)} className="btn-secondary">Join League</button>
                        </div>
                    </div>
                    {leagues.length > 0 ? (
                        leagues.map(league => (
                            <div key={league.id} className="league-card">
                                <h3>{league.name}</h3>
                                <p>Competition: {league.competitions.name}</p>
                                <p>Members: {league.league_members.length}</p>
                                {/* Add view leaderboard button here */}
                            </div>
                        ))
                    ) : (
                        <p>You haven't joined any private leagues yet. Create one or join with an invite code!</p>
                    )}
                </div>

                <div className="section">
                    <div className="section-header">
                        <h2>Public Competitions</h2>
                    </div>
                    {/* Map through and display public competitions here */}
                </div>

                {/* Modals for Create and Join League would be here */}
            </div>
        </>
    );
}
