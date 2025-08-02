// app/leagues/[id]/page.tsx
import Link from 'next/link';
import { Trophy, Users } from 'lucide-react';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function LeaguePage({ params }: Props) {
  const { id } = await params;
  const leagueId = id; // UUID, no need to parse

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold flex items-center mb-2">
          <Users className="w-10 h-10 mr-4 text-blue-600" />
          Private League
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          League ID: {leagueId}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Leaderboard Card */}
        <Link
          href={`/leagues/${leagueId}/leaderboard`}
          className="block p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-yellow-500 hover:shadow-lg transition-all duration-200"
        >
          <div className="flex items-center mb-3">
            <Trophy className="w-8 h-8 mr-3 text-yellow-500" />
            <h2 className="text-xl font-semibold">View Leaderboard</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            See how you rank against other league members and track your progress.
          </p>
        </Link>

        {/* Make Picks Card */}
        <Link
          href="/competitions"
          className="block p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-green-500 hover:shadow-lg transition-all duration-200"
        >
          <div className="flex items-center mb-3">
            <Users className="w-8 h-8 mr-3 text-green-500" />
            <h2 className="text-xl font-semibold">Make Picks</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Submit your predictions for upcoming games and earn points.
          </p>
        </Link>
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3 text-blue-900 dark:text-blue-100">
          About Your Private League
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
          <li>• Only league members can see your rankings and compete with you</li>
          <li>• Your picks in competitions automatically count towards your league score</li>
          <li>• League rankings update in real-time as games are completed</li>
          <li>• Invite friends using your league&apos;s invite code</li>
        </ul>
      </div>
    </div>
  );
}