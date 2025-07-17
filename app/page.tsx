'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Trophy, ArrowRight } from 'lucide-react';

// Define the type for a competition object
type Competition = {
  id: number;
  name: string;
  description: string | null;
  lock_date: string;
};

export default function HomePage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompetitions = async () => {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('competitions')
        .select('*')
        .order('lock_date', { ascending: true });

      if (fetchError) {
        setError(fetchError.message);
        console.error('Error fetching competitions:', fetchError);
      } else {
        setCompetitions(data);
      }
      setLoading(false);
    };

    fetchCompetitions();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Available Competitions</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
          Choose a competition to view games and make your picks.
        </p>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md mt-6"></div>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-red-500">Error loading competitions: {error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {competitions.length > 0 ? (
            competitions.map((comp) => (
              <div key={comp.id} className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 flex flex-col justify-between hover:border-blue-500 dark:hover:border-blue-500 transition-colors shadow-sm hover:shadow-md">
                <div>
                  <div className="flex items-center mb-2">
                    <Trophy className="w-6 h-6 mr-3 text-blue-500" />
                    <h2 className="text-2xl font-bold">{comp.name}</h2>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 h-20 overflow-hidden">
                    {comp.description || 'No description available.'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Picks lock on: {new Date(comp.lock_date).toLocaleString()}
                  </p>
                </div>
                <Link
                  href={`/competitions/${comp.id}`}
                  className="mt-6 inline-flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold transition-colors"
                >
                  Make Picks
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500 dark:text-gray-400">
              No competitions have been added yet. Check back soon!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
