'use client';

import { useState, useEffect, FormEvent } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { HelpCircle, PlusCircle, Trash2 } from 'lucide-react';

// Define the types for our data structures
type Competition = {
  id: number;
  name: string;
};

type PropPrediction = {
  id: number;
  question: string;
  lock_date: string;
  competitions: { name: string } | null;
};

export default function SpecialEventsPage() {
  const [propPredictions, setPropPredictions] = useState<PropPrediction[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  
  // Form state
  const [competitionId, setCompetitionId] = useState('');
  const [question, setQuestion] = useState('');
  const [lockDate, setLockDate] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      await Promise.all([
        fetchPropPredictions(),
        fetchCompetitions()
      ]);
      setLoading(false);
    };
    fetchInitialData();
  }, []);

  const fetchPropPredictions = async () => {
    const { data, error } = await supabase
      .from('prop_predictions')
      .select(`
        id,
        question,
        lock_date,
        competitions ( name )
      `)
      .order('lock_date', { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setPropPredictions(data as PropPrediction[]);
    }
  };

  const fetchCompetitions = async () => {
    const { data, error } = await supabase.from('competitions').select('id, name');
    if (error) console.error('Error fetching competitions:', error.message);
    else setCompetitions(data);
  };

  const handleAddPrediction = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!competitionId || !question || !lockDate) {
      setError('All fields are required.');
      return;
    }

    const { error: insertError } = await supabase
      .from('prop_predictions')
      .insert([{
        competition_id: parseInt(competitionId),
        question,
        lock_date: lockDate
      }]);

    if (insertError) {
      setError(insertError.message);
    } else {
      setCompetitionId('');
      setQuestion('');
      setLockDate('');
      await fetchPropPredictions();
    }
  };
  
  const handleDeletePrediction = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this special event?')) {
        const { error } = await supabase.from('prop_predictions').delete().eq('id', id);
        if (error) {
            setError(error.message);
        } else {
            await fetchPropPredictions();
        }
    }
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <HelpCircle className="w-8 h-8 mr-3 text-blue-600" />
        <h1 className="text-3xl font-bold">Manage Special Events</h1>
      </div>

      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <PlusCircle className="w-6 h-6 mr-2" />
          Add New Special Event
        </h2>
        <form onSubmit={handleAddPrediction} className="space-y-4">
          <div>
            <label htmlFor="competition" className="block text-sm font-medium mb-1">Competition</label>
            <select id="competition" value={competitionId} onChange={e => setCompetitionId(e.target.value)} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700">
              <option value="">Select Competition</option>
              {competitions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="question" className="block text-sm font-medium mb-1">Question</label>
            <input id="question" type="text" value={question} onChange={e => setQuestion(e.target.value)} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700" placeholder="e.g., Will Luka Dončić score more than 25 points?" />
          </div>
          <div>
            <label htmlFor="lockDate" className="block text-sm font-medium mb-1">Lock Date</label>
            <input id="lockDate" type="datetime-local" value={lockDate} onChange={e => setLockDate(e.target.value)} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700" />
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold">
            Add Event
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-semibold mb-4">Existing Special Events</h2>
        {loading ? <p>Loading...</p> : (
          <div className="space-y-3">
            {propPredictions.map((event) => (
              <div key={event.id} className="grid grid-cols-[1fr_auto] items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md border border-gray-200 dark:border-gray-700">
                <div>
                  <p className="font-semibold">{event.question}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{event.competitions?.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Locks on: {new Date(event.lock_date).toLocaleString()}</p>
                </div>
                <button 
                  onClick={() => handleDeletePrediction(event.id)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors"
                  aria-label="Delete event"
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