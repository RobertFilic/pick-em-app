'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This function will be called once on mount to get the initial user state
    const setInitialUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    setInitialUser();

    // This listener will react to auth events like SIGNED_IN after the OAuth redirect
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Cleanup the listener when the component unmounts
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div className="text-center p-10">Loading...</div>;
  }

  if (!user) {
    return (
        <div className="text-center p-10">
            <h1 className="text-4xl font-bold">Welcome to Pick&apos;em!</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">Please log in to continue.</p>
            <Link href="/login" className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold">
                Go to Login
            </Link>
        </div>
    );
  }

  return (
    <div className="text-center p-10">
      <h1 className="text-4xl font-bold">Welcome back!</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
        You are logged in as {user.email}.
      </p>
      <p className="mt-4">More features coming soon!</p>
    </div>
  );
}