import LeagueLeaderboardClient from './LeagueLeaderboardClient';

// This interface correctly defines the shape of the props for an async page
interface Props {
  params: Promise<{ leagueId: string }>;
}

// This is now an async Server Component that correctly awaits the params
export default async function LeagueLeaderboardPage({ params }: Props) {
  const { leagueId } = await params;

  return <LeagueLeaderboardClient leagueId={leagueId} />;
}