// app/leagues/[id]/manage/page.tsx
import LeagueManageClientPage from './LeagueManageClientPage';

// This interface defines the shape of the props for the page
interface Props {
  params: Promise<{ id: string }>;
}

// This is an async Server Component that correctly awaits the params
export default async function LeagueManagePage({ params }: Props) {
  const { id } = await params;
  // Keep as string since we're using UUIDs, not integers
  const leagueId = id;

  // Render the Client Component and pass the ID as a prop
  return <LeagueManageClientPage leagueId={leagueId} />;
}