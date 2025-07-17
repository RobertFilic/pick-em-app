/*
================================================================================
File: app/competitions/[id]/leaderboard/page.tsx (Updated)
================================================================================
*/

import LeaderboardClientPage from './LeaderboardClientPage';

// This is a simple Server Component that extracts the ID from the params
// and passes it as a simple prop to the Client Component. This avoids
// any type conflicts during the build process.
export default function LeaderboardPage({ params }: { params: { id: string } }) {
  const competitionId = parseInt(params.id, 10);

  // Render the Client Component and pass the ID as a prop
  return <LeaderboardClientPage competitionId={competitionId} />;
}
