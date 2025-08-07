// ================================================================================
// File: hooks/useAuth.ts
// ================================================================================

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/lib/types';

interface UseAuthReturn {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile data
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        setError('Failed to load user profile');
        return null;
      }

      return profileData;
    } catch (err) {
      console.error('Unexpected profile fetch error:', err);
      setError('Failed to load user profile');
      return null;
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    
    setError(null);
    const profileData = await fetchProfile(user.id);
    setProfile(profileData);
  };

  const logout = async () => {
    try {
      setError(null);
      await supabase.auth.signOut();
      // Auth state change will handle clearing user/profile
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to log out');
    }
  };

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          if (mounted) {
            setError('Failed to get session');
            setLoading(false);
          }
          return;
        }

        if (mounted) {
          const currentUser = session?.user ?? null;
          setUser(currentUser);

          // Fetch profile if user exists
          if (currentUser) {
            const profileData = await fetchProfile(currentUser.id);
            if (mounted) {
              setProfile(profileData);
            }
          }

          setLoading(false);
        }
      } catch (err) {
        console.error('Initial session error:', err);
        if (mounted) {
          setError('Failed to initialize authentication');
          setLoading(false);
        }
      }
    };

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setError(null);

        if (currentUser) {
          // User signed in - fetch their profile
          const profileData = await fetchProfile(currentUser.id);
          if (mounted) {
            setProfile(profileData);
          }
        } else {
          // User signed out - clear profile
          setProfile(null);
        }

        if (mounted) {
          setLoading(false);
        }
      }
    );

    getInitialSession();

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    profile,
    loading,
    error,
    logout,
    refreshProfile,
  };
}