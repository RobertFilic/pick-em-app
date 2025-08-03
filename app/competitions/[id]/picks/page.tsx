/*
================================================================================
File: app/competitions/[id]/picks/page.tsx (Server Component)
================================================================================
*/

import PicksClient from './PicksClient';

// This interface defines the shape of the props for the page
interface Props {
  params: Promise<{ id: string }>;
}

// This is an async Server Component that correctly awaits the params
export default async function CompetitionPicksPage({ params }: Props) {
  const { id } = await params;

  // Render the Client Component and pass the ID as a prop
  return <PicksClient id={id} />;
}