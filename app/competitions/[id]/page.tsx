import CompetitionDetailClient from './CompetitionDetailClient';

interface PageProps {
  params: { id: string };
}

export default function CompetitionDetailPage({ params }: PageProps) {
  return <CompetitionDetailClient id={params.id} />;
}