import CompetitionDetailClient from './CompetitionDetailClient';

type CompetitionDetailPageProps = {
  params: { id: string };
};

export default function CompetitionDetailPage({ params }: CompetitionDetailPageProps) {
  return <CompetitionDetailClient id={params.id} />;
}
