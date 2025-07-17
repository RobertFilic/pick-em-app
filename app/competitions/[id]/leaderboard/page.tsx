import LeaderboardClientPage from './LeaderboardClientPage';

// This interface defines the shape of the props for the page
interface Props {
  params: Promise<{ id: string }>;
}

// This is an async Server Component that correctly awaits the params
export default async function LeaderboardPage({ params }: Props) {
  const { id } = await params;
  const competitionId = parseInt(id, 10);

  // Render the Client Component and pass the ID as a prop
  return <LeaderboardClientPage competitionId={competitionId} />;
}
