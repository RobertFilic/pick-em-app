import CompetitionDetailClient from './CompetitionDetailClient';

type CompetitionDetailPageProps = {
  params: { id: string };
};

export default function CompetitionDetailPage({ params }: CompetitionDetailPageProps) {
  return <CompetitionDetailClient id={params.id} />;
}

// ✅ This resolves the type errors during Vercel build
export async function generateStaticParams() {
  // 🔁 In real app, fetch from DB or API
  // Example: [{ id: '1' }, { id: '2' }]
  return [];
}