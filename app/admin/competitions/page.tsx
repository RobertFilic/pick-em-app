'use client';

import { useState, useEffect, FormEvent } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Trophy, PlusCircle, Trash2, CheckSquare, XSquare } from 'lucide-react';

// Define the type for a competition object
type Competition = {
  id: number;
  name: string;
  description: string | null;
  lock_date: string;
  created_at: string;
  allow_draws: boolean; // Added new field
};

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [lockDate, setLockDate] = useState('');
  const [allowDraws, setAllowDraws] = useState(true); // Default to true for new competitions
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const fetchCompetitions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('competitions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
      console.error('Error fetching competitions:', error);
    } else {
      setCompetitions(data);
    }
    setLoading(false);
  };

  const handleAddCompetition = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !lockDate) {
      setError('Name and Lock Date are required.');
      return;
    }

    const { error } = await supabase
      .from('competitions')
      .insert([{ name, description, lock_date: lockDate, allow_draws: allowDraws }]); // Include allow_draws in insert

    if (error) {
      setError(error.message);
    } else {
      // Reset form fields
      setName('');
      setDescription('');
      setLockDate('');
      setAllowDraws(true);
      setError(null);
      await fetchCompetitions(); // Refresh the list
    }
  };
  
  const handleDeleteCompetition = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this competition? This will delete all associated games and picks.')) {
        const { error } = await supabase.from('competitions').delete().eq('id', id);
        if (error) {
            setError(error.message);
        } else {
            await fetchCompetitions();
        }
    }
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Trophy className="w-8 h-8 mr-3 text-blue-600" />
        <h1 className="text-3xl font-bold">Manage Competitions</h1>
      </div>

      {/* Form to add a new competition */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <PlusCircle className="w-6 h-6 mr-2" />
          Add New Competition
        </h2>
        <form onSubmit={handleAddCompetition} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
              placeholder="e.g., World Cup 2026"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
              rows={3}
              placeholder="Optional: A brief summary of the competition."
            />
          </div>
          <div>
            <label htmlFor="lockDate" className="block text-sm font-medium mb-1">Lock Date</label>
            <input
              id="lockDate"
              type="datetime-local"
              value={lockDate}
              onChange={(e) => setLockDate(e.target.value)}
              className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
            />
          </div>
          {/* Allow Draws Checkbox */}
          <div className="flex items-center">
            <input
              id="allowDraws"
              type="checkbox"
              checked={allowDraws}
              onChange={(e) => setAllowDraws(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="allowDraws" className="ml-2 block text-sm">
              Allow "Draw" as a prediction option
            </label>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold">
            Add Competition
          </button>
        </form>
      </div>

      {/* List of existing competitions */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-semibold mb-4">Existing Competitions</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-3">
            {competitions.map((comp) => (
              <div key={comp.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md border border-gray-200 dark:border-gray-700">
                <div>
                  <p className="font-semibold">{comp.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Locks on: {new Date(comp.lock_date).toLocaleString()}
                  </p>
                  <div className={`flex items-center text-xs font-medium mt-1 ${comp.allow_draws ? 'text-green-600' : 'text-red-600'}`}>
                    {comp.allow_draws ? <CheckSquare className="w-4 h-4 mr-1.5" /> : <XSquare className="w-4 h-4 mr-1.5" />}
                    Draws are {comp.allow_draws ? 'Allowed' : 'Not Allowed'}
                  </div>
                </div>
                <button 
                  onClick={() => handleDeleteCompetition(comp.id)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors"
                  aria-label="Delete competition"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}