// app/private-leagues/[id]/leaderboard/page.tsx
import PrivateLeagueLeaderboardClientPage from './PrivateLeagueLeaderboardClientPage';

// This interface defines the shape of the props for the page
interface Props {
  params: Promise<{ id: string }>;
}

// This is an async Server Component that correctly awaits the params
export default async function PrivateLeagueLeaderboardPage({ params }: Props) {
  const { id } = await params;
  const leagueId = parseInt(id, 10);

  // Render the Client Component and pass the ID as a prop
  return <PrivateLeagueLeaderboardClientPage leagueId={leagueId} />;
}