'use client';

import { useState, useEffect, FormEvent } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Users, PlusCircle, Trash2 } from 'lucide-react';

// Define the type for a team object
type Team = {
  id: number;
  name: string;
  logo_url: string | null;
  created_at: string;
};

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      setError(error.message);
      console.error('Error fetching teams:', error);
    } else {
      setTeams(data);
    }
    setLoading(false);
  };

  const handleAddTeam = async (e: FormEvent) => {
    e.preventDefault();
    if (!name) {
      setError('Team name is required.');
      return;
    }

    const { error } = await supabase
      .from('teams')
      .insert([{ name, logo_url: logoUrl || null }]);

    if (error) {
      setError(error.message);
    } else {
      setName('');
      setLogoUrl('');
      setError(null);
      await fetchTeams(); // Refresh the list
    }
  };
  
  const handleDeleteTeam = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this team? It might be used in existing games.')) {
        const { error } = await supabase.from('teams').delete().eq('id', id);
        if (error) {
            setError(error.message);
        } else {
            await fetchTeams();
        }
    }
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Users className="w-8 h-8 mr-3 text-blue-600" />
        <h1 className="text-3xl font-bold">Manage Teams</h1>
      </div>

      {/* Form to add a new team */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <PlusCircle className="w-6 h-6 mr-2" />
          Add New Team
        </h2>
        <form onSubmit={handleAddTeam} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">Team Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
              placeholder="e.g., Brazil"
            />
          </div>
          <div>
            <label htmlFor="logoUrl" className="block text-sm font-medium mb-1">Logo URL (Optional)</label>
            <input
              id="logoUrl"
              type="text"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
              placeholder="https://example.com/logo.png"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold">
            Add Team
          </button>
        </form>
      </div>

      {/* List of existing teams */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-semibold mb-4">Existing Teams</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {teams.map((team) => (
              <div key={team.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <img 
                    src={team.logo_url || `https://placehold.co/40x40/E2E8F0/4A5568?text=${team.name.charAt(0)}`} 
                    alt={`${team.name} logo`}
                    className="w-10 h-10 rounded-full object-cover bg-gray-200"
                    onError={(e) => { e.currentTarget.src = `https://placehold.co/40x40/E2E8F0/4A5568?text=${team.name.charAt(0)}`; }}
                  />
                  <p className="font-semibold">{team.name}</p>
                </div>
                <button 
                  onClick={() => handleDeleteTeam(team.id)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors"
                  aria-label="Delete team"
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