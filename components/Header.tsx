'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { analytics } from '@/lib/analytics';
import type { User } from '@supabase/supabase-js';
import { LogOut, Shield, Menu, X } from 'lucide-react';

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const setInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    
    setInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Track auth events
      if (event === 'SIGNED_IN') {
        analytics.trackUserLogin();
      } else if (event === 'SIGNED_OUT') {
        analytics.trackUserLogout();
      }
      // Note: SIGNED_UP event doesn't exist in Supabase Auth
      // New user signup is typically tracked when they complete registration
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();
          
          setIsAdmin(profile?.is_admin || false);
          setLoading(false);
        } catch (error) {
          analytics.trackError('profile_fetch', error instanceof Error ? error.message : 'Unknown error', 'header');
          setIsAdmin(false);
          setLoading(false);
        }
      };
      fetchProfile();
    } else {
      setIsAdmin(false);
      setLoading(false);
    }
  }, [user]);

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
        analytics.trackUserLogout();
        await supabase.auth.signOut();
        router.push('/login');
    }
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleNavClick = (destination: string, context: string) => {
    analytics.trackNavigation(context, destination, 'click');
  };

  const handleAdminClick = () => {
    analytics.trackFeatureUsage('admin_panel', 'access', 'header');
    analytics.trackNavigation('header', '/admin', 'click');
  };

  const handleMobileMenuToggle = () => {
    const newState = !mobileMenuOpen;
    setMobileMenuOpen(newState);
    analytics.trackFeatureUsage('mobile_menu', newState ? 'open' : 'close', 'header');
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link 
            href="/" 
            onClick={() => handleNavClick('/', 'header_logo')}
            className="text-2xl font-bold text-blue-600 hover:opacity-80 transition-opacity"
          >
            PlayPredix
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Navigation Links */}
            <div className="flex items-center space-x-4">
              <Link 
                href="/about" 
                onClick={() => handleNavClick('/about', 'header_nav')}
                className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors"
              >
                About
              </Link>
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {loading ? (
                <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
              ) : user ? (
                <>
                  {isAdmin && (
                    <Link 
                      href="/admin" 
                      onClick={handleAdminClick}
                      className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-500 flex items-center transition-colors"
                    >
                      <Shield className="w-4 h-4 mr-1.5" />
                      Admin
                    </Link>
                  )}
                  <span className="text-sm text-gray-500 dark:text-gray-400 hidden lg:inline">
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
                <div className="flex items-center space-x-3">
                  <Link 
                    href="/login" 
                    onClick={() => handleNavClick('/login', 'header_login')}
                    className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors"
                  >
                    Login
                  </Link>
                  <Link 
                    href="/login" 
                    onClick={() => handleNavClick('/login', 'header_signup')}
                    className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={handleMobileMenuToggle}
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200 dark:border-gray-700">
            <div className="pt-4 space-y-3">
              {/* Navigation Links */}
              <Link
                href="/about"
                onClick={() => {
                  handleNavClick('/about', 'mobile_menu');
                  closeMobileMenu();
                }}
                className="block text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors py-2"
              >
                About
              </Link>

              {/* User Actions */}
              {loading ? (
                <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse mt-4"></div>
              ) : user ? (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700 mt-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {user.email}
                  </div>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => {
                        handleAdminClick();
                        closeMobileMenu();
                      }}
                      className="block text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-500 transition-colors py-2"
                    >
                      <Shield className="w-4 h-4 mr-1.5 inline" />
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      closeMobileMenu();
                      handleLogout();
                    }}
                    className="block text-sm font-medium text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-500 transition-colors py-2"
                  >
                    <LogOut className="w-4 h-4 mr-1.5 inline" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700 mt-4 space-y-3">
                  <Link
                    href="/login"
                    onClick={() => {
                      handleNavClick('/login', 'mobile_menu_login');
                      closeMobileMenu();
                    }}
                    className="block text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors py-2"
                  >
                    Login
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => {
                      handleNavClick('/login', 'mobile_menu_signup');
                      closeMobileMenu();
                    }}
                    className="block text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-center"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Footer Links in Mobile Menu */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                <div className="text-xs text-gray-500 dark:text-gray-400 space-x-4">
                  <Link 
                    href="/contact" 
                    onClick={() => {
                      handleNavClick('/contact', 'mobile_menu_footer');
                      closeMobileMenu();
                    }} 
                    className="hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    Contact
                  </Link>
                  <Link 
                    href="/privacy" 
                    onClick={() => {
                      handleNavClick('/privacy', 'mobile_menu_footer');
                      closeMobileMenu();
                    }} 
                    className="hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    Privacy
                  </Link>
                  <Link 
                    href="/terms" 
                    onClick={() => {
                      handleNavClick('/terms', 'mobile_menu_footer');
                      closeMobileMenu();
                    }} 
                    className="hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    Terms
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}