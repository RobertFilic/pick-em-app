'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { Trophy, ArrowRight } from 'lucide-react';

type Competition = {
  id: number;
  name: string;
};

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getInitialData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data, error: fetchError } = await supabase
          .from('competitions')
          .select('id, name')
          .order('created_at', { ascending: false });

        if (fetchError) {
          setError(fetchError.message);
        } else {
          setCompetitions(data);
        }
      }
      setLoading(false);
    };
    getInitialData();
  }, []);

  if (loading) {
    return <div className="text-center p-10">Loading...</div>;
  }

  if (!user) {
    return (
        <div className="text-center p-10">
            <h1 className="text-4xl font-bold">Welcome to Pick&apos;em!</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">Please log in to continue.</p>
            <Link href="/login" className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold">
                Go to Login
            </Link>
        </div>
    );
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