import CompetitionDetailClient from './CompetitionDetailClient';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

interface PageProps {
  params: { id: string };
}

export default async function CompetitionDetailPage({ params }: PageProps) {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    redirect('/login'); // or show error
  }

  const userId = session.user.id;
  const leagueId = null; // Replace with logic to determine league if needed

  const competitionId = parseInt(params.id, 10);

  const { data: gamesData = [] } = await supabase
    .from('games')
    .select('id, is_locked')
    .eq('competition_id', competitionId);

  const { data: propsData = [] } = await supabase
    .from('prop_predictions')
    .select('id, is_locked')
    .eq('competition_id', competitionId);

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
