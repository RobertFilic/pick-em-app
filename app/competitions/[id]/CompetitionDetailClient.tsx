'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Trophy } from 'lucide-react';

export default function CompetitionDetailClient({ id }: { id: string }) {
  const [competitionName, setCompetitionName] = useState('');
  const [loading, setLoading] = useState(true);

  const competitionId = parseInt(id, 10);

  useEffect(() => {
    const fetchCompetitionName = async () => {
      const { data } = await supabase
        .from('competitions')
        .select('name')
        .eq('id', competitionId)
        .single();
      
      if (data) {
        setCompetitionName(data.name);
      }
      setLoading(false);
    };

    fetchCompetitionName();
  }, [competitionId]);

  if (loading) {
    return <div className="text-center p-10">Loading competition...</div>;
  }

  return (
    <div>
      <div className="flex items-center mb-8">
        <Trophy className="w-8 h-8 mr-4 text-blue-500" />
        <h1 className="text-4xl font-bold">{competitionName}</h1>
      </div>

      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
        <p className="text-center text-gray-500">Games will be displayed here soon!</p>
      </div>
    </div>
  );
}