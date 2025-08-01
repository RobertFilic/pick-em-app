/*
================================================================================
File: app/competitions/[id]/page.tsx (Server Component)
================================================================================
*/

import CompetitionDetailClient from './CompetitionDetailClient';

// This interface defines the shape of the props for the page
interface Props {
  params: Promise<{ id: string }>;
}

// This is an async Server Component that correctly awaits the params
export default async function CompetitionDetailPage({ params }: Props) {
  const { id } = await params;

  // Render the Client Component and pass the ID as a prop
  return <CompetitionDetailClient id={id} />;
}
