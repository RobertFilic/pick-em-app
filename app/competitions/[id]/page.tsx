// app/competitions/[id]/page.tsx (NEW - Public Overview)
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { Trophy, Users, Calendar, LogIn, UserPlus, Clock, BarChart2 } from 'lucide-react';
import Image from 'next/image';

interface Props {
  params: Promise<{ id: string }>;
}

type Competition = {
  id: number;
  name: string;
  description: string;
  lock_date: string;
  allow_draws: boolean;
  created_at: string;
};

type Team = { 
  id: number; 
  name: string; 
  logo_url: string | null; 
};

type Game = {
  id: number;
  game_date: string;
  stage: string | null;
  team_a: Team | null;
  team_b: Team | null;
  winning_team_id: number | null;
  is_draw: boolean;
};

type PropPrediction = {
  id: number;
  question: string;
  lock_date: string;
  correct_answer: string | null;
};

export default function CompetitionPage({ params }: Props) {
  const [competitionId, setCompetitionId] = useState<string>('');
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [propPredictions, setPropPredictions] = useState<PropPrediction[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract competition ID from params
  useEffect(() => {
    const extractId = async () => {
      const resolvedParams = await params;
      setCompetitionId(resolvedParams.id);
    };
    extractId();
  }, [params]);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Fetch public competition data (no auth required)
  useEffect(() => {
    if (!competitionId) return;

    const fetchCompetitionData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch competition info (public)
        const { data: compData, error: compError } = await supabase
          .from('competitions')
          .select('*')
          .eq('id', competitionId)
          .single();

        if (compError) throw compError;
        setCompetition(compData);

        // Fetch games for this competition (public)
        const { data: gamesData, error: gamesError } = await supabase
          .from('games')
          .select(`
            *,
            team_a:teams!games_team_a_id_fkey(*),
            team_b:teams!games_team_b_id_fkey(*)
          `)
          .eq('competition_id', competitionId)
          .order('game_date', { ascending: true });

        if (gamesError) throw gamesError;
        setGames(gamesData || []);

        // Fetch prop predictions (public)
        const { data: propsData, error: propsError } = await supabase
          .from('prop_predictions')
          .select('*')
          .eq('competition_id', competitionId)
          .order('lock_date', { ascending: true });

        if (propsError) throw propsError;
        setPropPredictions(propsData || []);

      } catch (err) {
        console.error('Error fetching competition data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchCompetitionData();
  }, [competitionId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading competition...</div>
        </div>
      </div>
    );
  }

  if (error || !competition) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Competition Not Found</h2>
          <p className="text-red-600">{error || 'This competition does not exist.'}</p>
        </div>
      </div>
    );
  }

  const isLocked = new Date() > new Date(competition.lock_date);
  const upcomingGames = games.filter(game => !game.winning_team_id && !game.is_draw);
  const completedGames = games.filter(game => game.winning_team_id || game.is_draw);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Competition Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold flex items-center mb-4">
          <Trophy className="w-10 h-10 mr-4 text-yellow-500" />
          {competition.name}
        </h1>
        
        {competition.description && (
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
            {competition.description}
          </p>
        )}

        <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Lock Date: {new Date(competition.lock_date).toLocaleDateString()}
          </div>
          {isLocked && (
            <div className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
              Locked
            </div>
          )}
        </div>
      </div>

      {/* Auth Required Section */}
      {!user && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-3 text-blue-900 dark:text-blue-100">
            Join the Competition
          </h3>
          <p className="text-blue-800 dark:text-blue-200 mb-4">
            Sign up or log in to make your predictions and compete with others!
          </p>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Log In
            </Link>
            <Link
              href="/signup"
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Sign Up
            </Link>
          </div>
        </div>
      )}

      {/* Authenticated User Actions */}
      {user && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-3 text-green-900 dark:text-green-100">
            Ready to Compete!
          </h3>
          <div className="flex gap-3 flex-wrap">
            {!isLocked ? (
              <Link
                href={`/competitions/${competitionId}/picks`}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Trophy className="w-4 h-4" />
                Make Your Picks
              </Link>
            ) : (
              <div className="px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed">
                Picks Locked
              </div>
            )}
            <Link
              href={`/competitions/${competitionId}/leaderboard`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <BarChart2 className="w-4 h-4" />
              View Leaderboard
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Users className="w-4 h-4" />
              View My Leagues
            </Link>
          </div>
        </div>
      )}

      {/* Prop Predictions Section */}
      {propPredictions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Prediction Questions</h2>
          <div className="space-y-4">
            {propPredictions.map((prop) => (
              <div key={prop.id} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-medium">{prop.question}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    {new Date(prop.lock_date).toLocaleDateString()}
                  </div>
                </div>
                {prop.correct_answer && (
                  <div className="text-sm text-green-600 font-medium">
                    Answer: {prop.correct_answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Games */}
      {upcomingGames.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Upcoming Games</h2>
          <div className="space-y-4">
            {upcomingGames.map((game) => (
              <div key={game.id} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {game.team_a?.logo_url && (
                        <Image 
                          src={game.team_a.logo_url} 
                          alt={game.team_a.name} 
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded"
                        />
                      )}
                      <span className="font-medium">{game.team_a?.name || 'TBD'}</span>
                    </div>
                    <span className="text-gray-500">vs</span>
                    <div className="flex items-center space-x-2">
                      {game.team_b?.logo_url && (
                        <Image 
                          src={game.team_b.logo_url} 
                          alt={game.team_b.name} 
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded"
                        />
                      )}
                      <span className="font-medium">{game.team_b?.name || 'TBD'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {new Date(game.game_date).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(game.game_date).toLocaleTimeString()}
                    </div>
                    {game.stage && (
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        {game.stage}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Games */}
      {completedGames.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Completed Games</h2>
          <div className="space-y-4">
            {completedGames.map((game) => (
              <div key={game.id} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`flex items-center space-x-2 ${game.winning_team_id === game.team_a?.id ? 'font-bold text-green-600' : 'text-gray-500'}`}>
                      {game.team_a?.logo_url && (
                        <Image 
                          src={game.team_a.logo_url} 
                          alt={game.team_a.name} 
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded"
                        />
                      )}
                      <span>{game.team_a?.name || 'TBD'}</span>
                    </div>
                    <span className="text-gray-500">vs</span>
                    <div className={`flex items-center space-x-2 ${game.winning_team_id === game.team_b?.id ? 'font-bold text-green-600' : 'text-gray-500'}`}>
                      {game.team_b?.logo_url && (
                        <Image 
                          src={game.team_b.logo_url} 
                          alt={game.team_b.name} 
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded"
                        />
                      )}
                      <span>{game.team_b?.name || 'TBD'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {game.is_draw ? (
                        <span className="text-yellow-600">Draw</span>
                      ) : (
                        <span className="text-green-600">
                          {game.winning_team_id === game.team_a?.id ? game.team_a?.name : game.team_b?.name} Won
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(game.game_date).toLocaleDateString()}
                    </div>
                    {game.stage && (
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        {game.stage}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {games.length === 0 && propPredictions.length === 0 && (
        <div className="text-center py-10 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <p className="text-gray-500 dark:text-gray-400">No games or predictions available yet.</p>
        </div>
      )}
    </div>
  );
}