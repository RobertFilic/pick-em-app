'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { Trophy, ArrowRight } from 'lucide-react';
import LandingPage from './LandingPage'; // Import the new landing page

type Competition = {
  id: number;
  name: string;
};

// This component shows the list of competitions to a logged-in user.
function CompetitionsDashboard() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompetitions = async () => {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('competitions')
        .select('id, name')
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
      } else if (data) {
        setCompetitions(data);
      }
      setLoading(false);
    };
    fetchCompetitions();
  }, []);

  if (loading) {
    return <div className="text-center p-10">Loading competitions...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Available Competitions</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
          Choose a competition to get started.
        </p>
      </div>

      {error && <p className="text-red-500">Error: {error}</p>}

      <div className="space-y-4">
        {competitions.length > 0 ? (
          competitions.map((comp) => (
            <Link 
              key={comp.id} 
              href={`/competitions/${comp.id}`}
              className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800 flex items-center justify-between hover:border-blue-500 transition-all"
            >
              <div className="flex items-center">
                <Trophy className="w-6 h-6 mr-4 text-blue-500" />
                <h2 className="text-xl font-semibold">{comp.name}</h2>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </Link>
          ))
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No competitions have been added yet.
          </p>
        )}
      </div>
    </div>
  );
}

// This is the main page component that decides what to show.
export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // If there is a user, show the dashboard. Otherwise, show the landing page.
  return user ? <CompetitionsDashboard /> : <LandingPage />;
}
