'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Trophy, Clock } from 'lucide-react';

export default function CompetitionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [competitionName, setCompetitionName] = useState('');
  const [loading, setLoading] = useState(true);

  const competitionId = parseInt(params.id, 10);

  useEffect(() => {
    const fetchCompetitionName = async () => {
      // FIXED: Removed the unused 'error' variable from the destructuring
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

      <h2 className="text-2xl font-bold mb-4">Fake Games (for testing)</h2>
      <div className="space-y-4">
        {/* Fake Game 1 */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-center mb-2 text-sm text-gray-500">
            <span>Group Stage</span>
            <span className="flex items-center"><Clock className="w-4 h-4 mr-1.5"/> Today at 8:00 PM</span>
          </div>
          <p className="text-lg font-semibold">Team Alpha vs. Team Beta</p>
        </div>
        {/* Fake Game 2 */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-center mb-2 text-sm text-gray-500">
            <span>Group Stage</span>
            <span className="flex items-center"><Clock className="w-4 h-4 mr-1.5"/> Tomorrow at 6:00 PM</span>
          </div>
          <p className="text-lg font-semibold">Team Charlie vs. Team Delta</p>
        </div>
      </div>
    </div>
  );
}