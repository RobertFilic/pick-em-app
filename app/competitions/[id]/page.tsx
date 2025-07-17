import CompetitionClientPage from './CompetitionClientPage';

export default function CompetitionPage({ params }: { params: { id: string } }) {
  const competitionId = parseInt(params.id, 10);

  return <CompetitionClientPage competitionId={competitionId} />;
}