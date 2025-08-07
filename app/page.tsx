/*
================================================================================
File: app/page.tsx (Phase 3: Clean with UI Components)
================================================================================
*/

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trophy, Plus, Users, LogOut, UserPlus, LogIn } from 'lucide-react';

// Import custom hooks
import { useAuth } from '@/hooks/useAuth';
import { useNotification } from '@/hooks/useNotification';
import { useLeagues } from '@/hooks/useLeagues';
import { useCompetitions } from '@/hooks/useCompetitions';

// Import UI components
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Notification } from '@/components/ui/Notification';
import { Button } from '@/components/ui/Button';

// Import feature components
import { AuthModal } from '@/components/auth/AuthModal';
import { LeagueCard } from '@/components/league/LeagueCard';
import { LeagueCreateModal } from '@/components/league/LeagueCreateModal';
import { LeagueJoinModal } from '@/components/league/LeagueJoinModal';
import { CompetitionCard } from '@/components/competition/CompetitionCard';

// Import utilities
import { copyToClipboard } from '@/lib/utils';

// --- Main Page Component ---

export default function HomePage() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return <UnifiedDashboard />;
}

// --- The Unified Dashboard for All Users ---

function UnifiedDashboard() {
    const { user, profile, logout } = useAuth();
    const { notification, showNotification } = useNotification();
    const { leagues, fetchLeagues, createLeague, joinLeague, deleteLeague } = useLeagues();
    const { competitions, fetchCompetitions } = useCompetitions();
    
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);

    // Form states
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalError, setModalError] = useState('');

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            await fetchCompetitions();
            if (user) {
                await fetchLeagues();
            }
            setLoading(false);
        };

        loadData();
    }, [user, fetchCompetitions, fetchLeagues]);

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    const handleCreateLeague = async (name: string, competitionId: number) => {
        if (!profile) return;

        setIsSubmitting(true);
        setModalError('');

        const result = await createLeague(name, competitionId, profile);

        if (result.success) {
            setShowCreateModal(false);
            showNotification("League created successfully!", 'success');
        } else {
            setModalError(result.error || 'Failed to create league');
        }

        setIsSubmitting(false);
    };

    const handleJoinLeague = async (inviteCode: string) => {
        if (!profile) return;

        setIsSubmitting(true);
        setModalError('');

        const result = await joinLeague(inviteCode);

        if (result.success) {
            setShowJoinModal(false);
            showNotification(result.message, 'success');
        } else {
            setModalError(result.message);
        }

        setIsSubmitting(false);
    };
    
    const handleDeleteLeague = async (leagueId: string) => {
        if (!window.confirm("Are you sure you want to permanently delete this league? This cannot be undone.")) {
            return;
        }

        const result = await deleteLeague(leagueId);

        if (result.success) {
            showNotification("League deleted successfully.", 'success');
        } else {
            showNotification(result.error || "Error deleting league.", 'error');
        }
    };
    
    const handleCopyInviteCode = async (code: string) => {
        const success = await copyToClipboard(code);
        
        if (success) {
            showNotification("Invite code copied to clipboard!", 'success');
        } else {
            showNotification("Failed to copy text.", 'error');
        }
    };

    const handleModalClose = (modalType: 'create' | 'join' | 'auth') => {
        if (modalType === 'create') {
            setShowCreateModal(false);
        } else if (modalType === 'join') {
            setShowJoinModal(false);
        } else {
            setShowAuthModal(false);
        }
        setModalError('');
        setIsSubmitting(false);
    };

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <>
            {/* Notification */}
            <Notification notification={notification} />

            {/* Modals */}
            <AuthModal 
                isOpen={showAuthModal} 
                onClose={() => handleModalClose('auth')} 
            />
            
            <LeagueCreateModal
                isOpen={showCreateModal}
                onClose={() => handleModalClose('create')}
                onSubmit={handleCreateLeague}
                competitions={competitions}
                isSubmitting={isSubmitting}
                error={modalError}
            />
            
            <LeagueJoinModal
                isOpen={showJoinModal}
                onClose={() => handleModalClose('join')}
                onSubmit={handleJoinLeague}
                isSubmitting={isSubmitting}
                error={modalError}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-black dark:text-white">
                {/* Header */}
                <header className="flex justify-between items-center mb-10 flex-wrap gap-4">
                    {user ? (
                        <>
                            <h1 className="text-4xl font-bold">Welcome, {profile?.username || 'User'}</h1>
                            <Button 
                                variant="secondary"
                                onClick={handleLogout}
                                className="rounded-full"
                            >
                                <LogOut size={18} /> Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <h1 className="text-4xl font-bold">Pick&apos;Em Competitions</h1>
                            <div className="flex gap-3">
                                <Link 
                                    href="/login"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors"
                                >
                                    <LogIn size={18} /> Log In
                                </Link>
                                <Link 
                                    href="/login"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition-colors"
                                >
                                    <UserPlus size={18} /> Sign Up
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
                        <p className="text-blue-800 dark:text-blue-200">
                            Browse competitions below and start making your predictions! You can make picks as a guest, 
                            then sign up to save them and compete with friends in private leagues.
                        </p>
                    </div>
                )}

                {/* Private Leagues Section - Only for Authenticated Users */}
                {user && (
                    <section className="mb-12">
                        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                            <h2 className="text-3xl font-bold flex items-center gap-3">
                                <Users /> My Private Leagues
                            </h2>
                            <div className="flex gap-2">
                                <Button 
                                    onClick={() => setShowCreateModal(true)}
                                    className="rounded-full"
                                >
                                    <Plus size={18} /> Create League
                                </Button>
                                <Button 
                                    variant="secondary"
                                    onClick={() => setShowJoinModal(true)}
                                    className="rounded-full"
                                >
                                    Join League
                                </Button>
                            </div>
                        </div>
                        
                        {leagues.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {leagues.map(league => (
                                    <LeagueCard
                                        key={league.id}
                                        league={league}
                                        profile={profile}
                                        onCopyInviteCode={handleCopyInviteCode}
                                        onDeleteLeague={handleDeleteLeague}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800">
                                <p className="text-gray-500 dark:text-slate-400">
                                    You haven&apos;t joined any private leagues yet.
                                </p>
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
                            <Button
                                onClick={() => setShowAuthModal(true)}
                                size="lg"
                                className="rounded-full"
                            >
                                Sign Up to Create Leagues
                            </Button>
                        </div>
                    </section>
                )}

                {/* Public Competitions Section - Available to Everyone */}
                <section>
                    <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                        <Trophy /> {user ? 'Public Competitions' : 'Browse Competitions'}
                    </h2>
                    
                    {competitions.length > 0 ? (
                        <div className="space-y-4">
                            {competitions.map((competition) => (
                                <CompetitionCard
                                    key={competition.id}
                                    competition={competition}
                                    showGuestMessage={!user}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800">
                            <p className="text-gray-500 dark:text-slate-400">
                                No competitions available right now.
                            </p>
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}