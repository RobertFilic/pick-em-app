'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Mail, Lock, User } from 'lucide-react';
import Link from 'next/link';

// --- Reusable UI Components (Styled for the new dark theme) ---

const Input = ({ id, type, placeholder, icon: Icon, value, onChange }: {
  id: string;
  type: string;
  placeholder: string;
  icon: React.ElementType;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="relative">
    <span className="absolute inset-y-0 left-0 flex items-center pl-4">
      <Icon className="h-5 w-5 text-gray-400" />
    </span>
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full pl-12 pr-4 py-3 border border-slate-700 bg-slate-800/50 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all placeholder:text-slate-500"
      required
    />
  </div>
);

// --- Main Authentication Page Component ---

export default function AuthPage() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  const handleEmailAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      if (isLoginView) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        setSuccessMessage('Login successful! Redirecting...');
        setTimeout(() => router.push('/'), 1000);
      } else {
        if (!username.trim()) throw new Error('Username is required.');
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username: username.trim() } },
        });
        if (signUpError) throw signUpError;
        setSuccessMessage('Sign up successful! Please check your email to verify your account.');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-purple-500">
              Pick&apos;em
            </h1>
          </Link>
          <p className="text-slate-400 mt-2">
            {isLoginView ? 'Welcome back! Sign in to continue.' : 'Create an account to start playing.'}
          </p>
        </div>

        <div className="bg-slate-900/50 p-8 rounded-2xl backdrop-blur-lg border border-slate-800 shadow-2xl">
          <form onSubmit={handleEmailAuth} className="space-y-6">
            {!isLoginView && (
              <Input 
                id="username" 
                type="text" 
                placeholder="Username" 
                icon={User} 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            )}
            <Input 
              id="email" 
              type="email" 
              placeholder="Email" 
              icon={Mail} 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input 
              id="password" 
              type="password" 
              placeholder="Password" 
              icon={Lock} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            {error && <p className="text-sm text-red-400 text-center">{error}</p>}
            {successMessage && <p className="text-sm text-green-400 text-center">{successMessage}</p>}
            
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold py-3 px-4 rounded-full hover:scale-105 transition-transform disabled:opacity-75" 
              disabled={loading}
            >
              {loading ? 'Processing...' : (isLoginView ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-slate-900/50 px-2 text-slate-400">
                Or
              </span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center py-3 px-4 bg-slate-800/50 border border-slate-700 text-slate-300 rounded-full hover:bg-slate-800 transition-colors"
          >
            <svg className="mr-2 h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
              <path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 110.3 512 0 401.7 0 265.4 0 129.2 109.3 20.4 244 20.4c65.4 0 123.4 26.2 165.7 68.5l-63.4 61.9C314.6 118.2 282.4 102 244 102c-83.2 0-151.2 67.3-151.2 150.4s68 150.4 151.2 150.4c97.1 0 134.3-70.2 138.6-106.4H244v-75.2h243.8c1.3 7.8 2.2 15.6 2.2 23.4z"></path>
            </svg>
            Sign in with Google
          </button>
          
          <p className="text-sm text-center text-slate-400 mt-6">
            {isLoginView ? "Don't have an account?" : "Already have an account?"}
            <button 
              type="button"
              onClick={() => setIsLoginView(!isLoginView)}
              className="font-semibold text-violet-400 hover:underline ml-1"
            >
              {isLoginView ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
