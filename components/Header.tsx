'use client'; // This is a Client Component, as it uses hooks for state and effects.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import { LogOut, Shield } from 'lucide-react';

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true); // Add a loading state
  const router = useRouter();

  useEffect(() => {
    const getSessionAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      if (session?.user) {
        // Check if the user is an admin by fetching their profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          setIsAdmin(profile.is_admin);
        }
      }
      setLoading(false);
    };

    getSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'SIGNED_OUT') {
        setIsAdmin(false);
        router.push('/login');
      } else if (event === 'SIGNED_IN') {
        // When user signs in, refresh the page to reflect the new state everywhere
        router.refresh();
      }
    });

    // Cleanup function to unsubscribe from the listener
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // The onAuthStateChange listener will handle the redirect and state updates
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-600 hover:opacity-80 transition-opacity">
          Pick 'em
        </Link>
        <div className="flex items-center space-x-4">
          {loading ? (
            <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
          ) : user ? (
            <>
              {isAdmin && (
                <Link href="/admin" className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-500 flex items-center transition-colors">
                  <Shield className="w-4 h-4 mr-1.5" />
                  Admin
                </Link>
              )}
              <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center text-sm font-medium text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-500 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-1.5" />
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}