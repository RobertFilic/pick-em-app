import CompetitionDetailClient from './CompetitionDetailClient';

export default async function CompetitionDetailPage({ params }: { params: { id: string } }) {
  return <CompetitionDetailClient id={params.id} />;
}
