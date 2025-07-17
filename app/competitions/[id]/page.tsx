import CompetitionDetailClient from './CompetitionDetailClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CompetitionDetailPage({ params }: Props) {
  const { id } = await params;  // ✅ Await to extract id

  return <CompetitionDetailClient id={id} />;
}
