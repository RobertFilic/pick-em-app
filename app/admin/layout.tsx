import Link from 'next/link';
import { Shield, Trophy, Users, Gamepad2, ClipboardList, HelpCircle } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: Shield },
    { name: 'Competitions', href: '/admin/competitions', icon: Trophy },
    { name: 'Teams', href: '/admin/teams', icon: Users },
    { name: 'Games', href: '/admin/games', icon: Gamepad2 },
    { name: 'Special Events', href: '/admin/special-events', icon: HelpCircle },
    { name: 'Results', href: '/admin/results', icon: ClipboardList },
  ];

  return (
    <div>
      {/* --- Mobile Navigation --- */}
      {/* This nav bar will only be visible on screens smaller than 'md' */}
      <nav className="md:hidden mb-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex overflow-x-auto space-x-4 p-2 -mx-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex-shrink-0 flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition-colors"
            >
              <item.icon className="w-5 h-5 mr-2" />
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* --- Desktop Layout --- */}
      <div className="hidden md:grid md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] gap-8">
        <aside className="hidden md:flex flex-col space-y-2 bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800 self-start sticky top-24">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition-colors"
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          ))}
        </aside>
        <main>
          {children}
        </main>
      </div>

      {/* --- Mobile Main Content --- */}
      {/* This ensures the main content is still displayed on mobile, but outside the desktop grid */}
      <div className="md:hidden">
        {children}
      </div>
    </div>
  );
}