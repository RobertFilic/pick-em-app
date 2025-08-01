import { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/router';

interface Game {
  id: number;
  name: string;
  locked: boolean;
}

interface PropPrediction {
  id: number;
  name: string;
  locked: boolean;
}

interface UserPick {
  user_id: string;
  competition_id: number;
  league_id: string | null;
  game_id: number | null;
  prop_prediction_id: number | null;
  pick: string;
}

const CompetitionDetailClient = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [props, setProps] = useState<PropPrediction[]>([]);
  const [userPicks, setUserPicks] = useState<UserPick[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { id: competitionId } = router.query;

  const leagueId = null; // or fetch from context/props if you're in a private league
  const userId = 'user-123'; // Replace with real user context

  useEffect(() => {
    fetchCompetitionData();
  }, [competitionId]);

  const fetchCompetitionData = async () => {
    if (!competitionId) return;

    const { data: gameData } = await supabase
      .from('games')
      .select('*')
      .eq('competition_id', competitionId);

    const { data: propData } = await supabase
      .from('prop_predictions')
      .select('*')
      .eq('competition_id', competitionId);

    const { data: pickData } = await supabase
      .from('user_picks')
      .select('*')
      .eq('user_id', userId)
      .eq('competition_id', competitionId);

    setGames(gameData || []);
    setProps(propData || []);
    setUserPicks(pickData || []);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const gamePicks = userPicks.filter((p) => p.game_id !== null);
      const propPicks = userPicks.filter((p) => p.prop_prediction_id !== null);

      if (gamePicks.length > 0) {
        const { error: gameUpsertError } = await supabase.from('user_picks').upsert(gamePicks, {
          onConflict: leagueId
            ? 'user_picks_league_game_unique_idx'
            : 'user_picks_public_game_unique_idx',
        });
        if (gameUpsertError) throw gameUpsertError;
      }

      if (propPicks.length > 0) {
        const { error: propUpsertError } = await supabase.from('user_picks').upsert(propPicks, {
          onConflict: leagueId
            ? 'user_picks_league_prop_unique_idx'
            : 'user_picks_public_prop_unique_idx',
        });
        if (propUpsertError) throw propUpsertError;
      }

      setSuccess('Your picks have been saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (upsertError: any) {
      setError(upsertError.message || 'An unknown error occurred while saving picks.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Competition Details</h1>

      <div className="space-y-2">
        {games.map((game) => (
          <div key={game.id} className="border rounded p-2 flex items-center justify-between">
            <span>{game.name}</span>
            <CheckCircle className="text-green-500" />
          </div>
        ))}
      </div>

      <div className="space-y-2 mt-6">
        {props.map((prop) => (
          <div key={prop.id} className="border rounded p-2 flex items-center justify-between">
            <span>{prop.name}</span>
            <CheckCircle className="text-green-500" />
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-2">
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Saving...' : 'Submit Picks'}
        </Button>
        {success && <span className="text-green-500">{success}</span>}
        {error && <span className="text-red-500">{error}</span>}
      </div>
    </div>
  );
};

export default CompetitionDetailClient;
