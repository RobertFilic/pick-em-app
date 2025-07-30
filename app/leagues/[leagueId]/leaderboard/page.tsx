import LeagueLeaderboardClient from './LeagueLeaderboardClient';

interface Props {
  params: { leagueId: string };
}

export default function LeagueLeaderboardPage({ params }: Props) {
  return <LeagueLeaderboardClient leagueId={params.leagueId} />;
}