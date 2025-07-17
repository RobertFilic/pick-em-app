import LeaderboardClientPage from './LeaderboardClientPage';

export default function LeaderboardPage({ params }: { params: { id: string } }) {
  const competitionId = parseInt(params.id, 10);

  return <LeaderboardClientPage competitionId={competitionId} />;
}