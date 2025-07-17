/*
================================================================================
File: app/competitions/[id]/leaderboard/page.tsx (Updated)
================================================================================
*/

import LeaderboardClientPage from './LeaderboardClientPage';

// This is a simple Server Component that extracts the ID from the params
// and passes it as a simple prop to the Client Component. This avoids
// any type conflicts during the build process.
//
// FIXED: Removed the explicit type annotation for the 'params' prop to
// resolve the conflict with Next.js's build-time type generation, as
// suggested by the community solution.
export default function LeaderboardPage({ params }) {
  const competitionId = parseInt(params.id, 10);

  // Render the Client Component and pass the ID as a prop
  return <LeaderboardClientPage competitionId={competitionId} />;
}
