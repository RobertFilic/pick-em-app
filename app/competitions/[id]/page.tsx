import CompetitionDetailClient from './CompetitionDetailClient';
import { supabase } from '@/lib/supabaseClient';

interface PageProps {
  params: { id: string };
}

export default async function CompetitionDetailPage({ params }: PageProps) {
  const competitionId = parseInt(params.id);

  const { data: gamesData = [] } = await supabase
    .from('games')
    .select('id, is_locked')
    .eq('competition_id', competitionId);

  const { data: propsData = [] } = await supabase
    .from('prop_predictions')
    .select('id, is_locked')
    .eq('competition_id', competitionId);

  const userId = 'mock-user-id'; // Replace with real auth.user.id
  const leagueId = null; // Or dynamic if you're joining a private league

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
