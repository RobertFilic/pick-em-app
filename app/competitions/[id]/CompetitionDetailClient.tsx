'use client';

import { supabase } from '@/lib/supabaseClient';

interface Game {
  id: number;
  is_locked: boolean;
  pick: string;
}

interface Prop {
  id: number;
  is_locked: boolean;
  pick: string;
}

interface Props {
  competitionId: number;
  userId: string;
  leagueId?: string | null;
  games: Game[];
  props: Prop[];
}

export default function CompetitionDetailClient({
  competitionId,
  userId,
  leagueId = null,
  games,
  props,
}: Props) {
  const handleSave = async () => {
    const gamePicks = games
      .filter((g) => !g.is_locked && g.pick)
      .map((g) => ({
        user_id: userId,
        competition_id: competitionId,
        game_id: g.id,
        league_id: leagueId,
        prop_prediction_id: null,
        pick: g.pick,
      }));

    const propPicks = props
      .filter((p) => !p.is_locked && p.pick)
      .map((p) => ({
        user_id: userId,
        competition_id: competitionId,
        game_id: null,
        league_id: leagueId,
        prop_prediction_id: p.id,
        pick: p.pick,
      }));

    try {
      if (gamePicks.length > 0) {
        const { error: gameUpsertError } = await supabase.from('user_picks').upsert(gamePicks, {
          onConflict: leagueId ? 'user_id,game_id,league_id' : 'user_id,game_id',
        });
        if (gameUpsertError) throw gameUpsertError;
      }

      if (propPicks.length > 0) {
        const { error: propUpsertError } = await supabase.from('user_picks').upsert(propPicks, {
          onConflict: leagueId ? 'user_id,prop_prediction_id,league_id' : 'user_id,prop_prediction_id',
        });
        if (propUpsertError) throw propUpsertError;
      }

      alert('Your picks have been saved successfully!');
    } catch (upsertError) {
      console.error(upsertError);
      alert('An error occurred while saving your picks.');
    }
  };

  return (
    <div>
      <button
        onClick={handleSave}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Save Picks
      </button>
    </div>
  );
}