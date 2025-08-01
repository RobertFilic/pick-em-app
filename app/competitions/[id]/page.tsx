import CompetitionDetailClient from './CompetitionDetailClient';
import { supabase } from '@/lib/supabaseClient';

interface Props {
  params: { id: string };
}

export default async function CompetitionDetailPage({ params }: Props) {
  const competitionId = parseInt(params.id); // from dynamic route `[id]`

  // Fetch games
  const { data: gamesData = [] } = await supabase
    .from('games')
    .select('id, is_locked')
    .eq('competition_id', competitionId);

  // Fetch props
  const { data: propsData = [] } = await supabase
    .from('prop_predictions')
    .select('id, is_locked')
    .eq('competition_id', competitionId);

  // TODO: Replace with real userId from session
  const userId = 'dummy-user-id'; // You’ll hook this up to auth
  const leagueId = null; // or set dynamically if needed

  // Add pick placeholder to each game and prop
  const games = gamesData.map((g) => ({ ...g, pick: '' }));
  const props = propsData.map((p) => ({ ...p, pick: '' }));

  return (
    <CompetitionDetailClient
      competitionId={competitionId}
      userId={userId}
      leagueId={leagueId}
      games={games}
      props={props}
    />
  );
}
