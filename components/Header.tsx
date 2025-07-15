'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import { LogOut, Shield } from 'lucide-react';

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // This effect runs once on mount to set up the authentication listener
  useEffect(() => {
    // Immediately get the current session to set the initial state
    const setInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };
    
    setInitialSession();

    // Listen for changes in authentication state (sign in, sign out)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // This second effect runs whenever the `user` state changes.
  // This is the key to the fix: when a user logs in, this will run
  // and check their admin status immediately.
  useEffect(() => {
    if (user) {
      // If there is a user, fetch their profile to check for admin role
      const fetchProfile = async () => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();
        
        setIsAdmin(profile?.is_admin || false);
      };
      fetchProfile();
    } else {
      // If there is no user, ensure admin status is false
      setIsAdmin(false);
    }
  }, [user]); // Dependency array ensures this runs when `user` changes

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // The auth listener will handle setting user to null, and we can redirect
    router.push('/login');
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