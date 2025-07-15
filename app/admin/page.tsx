import { Shield } from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <div className="bg-white dark:bg-gray-900 p-8 rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="flex items-center mb-4">
        <Shield className="w-8 h-8 mr-3 text-blue-600" />
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>
      <p className="text-gray-600 dark:text-gray-400">
        Welcome to the admin area. Use the navigation on the left to manage competitions, teams, games, and results.
      </p>
    </div>
  );
}