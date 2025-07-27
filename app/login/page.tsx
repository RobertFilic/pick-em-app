'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Mail, Lock, User } from 'lucide-react';
import Link from 'next/link';

// --- Reusable UI Components (Styled to match the new design) ---

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
      className="w-full pl-12 pr-4 py-3 border border-gray-700 bg-gray-900/50 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
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
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
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
    <>
      {/* This style block contains all the CSS from your HTML file */}
      <style jsx global>{`
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #ffffff;
          background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
          overflow-x: hidden;
        }
        .bg-elements {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          overflow: hidden;
        }
        .floating-shape {
          position: absolute;
          background: linear-gradient(45deg, rgba(255, 107, 107, 0.1), rgba(78, 205, 196, 0.1));
          border-radius: 50%;
          animation: float 20s infinite linear;
        }
        .floating-shape:nth-child(1) { width: 80px; height: 80px; top: 20%; left: 10%; animation-delay: 0s; }
        .floating-shape:nth-child(2) { width: 120px; height: 120px; top: 60%; right: 10%; animation-delay: -7s; }
        .floating-shape:nth-child(3) { width: 60px; height: 60px; top: 80%; left: 30%; animation-delay: -14s; }
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(120deg); }
          66% { transform: translateY(20px) rotate(240deg); }
          100% { transform: translateY(0px) rotate(360deg); }
        }
        .btn-primary {
          background: linear-gradient(135deg, #ff6b6b, #ee5a24);
          color: white;
          padding: 16px 40px;
          border: none;
          border-radius: 50px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
          width: 100%;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(255, 107, 107, 0.4);
        }
        .btn-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }
        .btn-primary:hover::before { left: 100%; }
        .btn-google {
          background: rgba(255, 255, 255, 0.05);
          color: #b8b8d1;
          padding: 16px 40px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 50px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          width: 100%;
        }
        .btn-google:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: #4ecdc4;
          color: #4ecdc4;
        }
      `}</style>

      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-elements">
          <div className="floating-shape"></div>
          <div className="floating-shape"></div>
          <div className="floating-shape"></div>
        </div>
        
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <Link href="/">
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
                Pick&apos;em
              </h1>
            </Link>
            <p className="text-gray-400 mt-2">
              {isLoginView ? 'Welcome back! Sign in to continue.' : 'Create an account to start playing.'}
            </p>
          </div>

          <div className="bg-gray-900/50 p-8 rounded-2xl backdrop-blur-lg border border-gray-800">
            <form onSubmit={handleEmailAuth} className="space-y-6">
              {!isLoginView && (
                <Input 
                  id="username" 
                  type="text" 
                  placeholder="Username" 
                  icon={User} 
                  value={username}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                />
              )}
              <Input 
                id="email" 
                type="email" 
                placeholder="Email" 
                icon={Mail} 
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              />
              <Input 
                id="password" 
                type="password" 
                placeholder="Password" 
                icon={Lock} 
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              />
              
              {error && <p className="text-sm text-red-400 text-center">{error}</p>}
              {successMessage && <p className="text-sm text-green-400 text-center">{successMessage}</p>}
              
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Processing...' : (isLoginView ? 'Sign In' : 'Create Account')}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-gray-900/50 px-2 text-gray-400">
                  Or
                </span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="btn-google"
            >
              <svg className="mr-2 h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 110.3 512 0 401.7 0 265.4 0 129.2 109.3 20.4 244 20.4c65.4 0 123.4 26.2 165.7 68.5l-63.4 61.9C314.6 118.2 282.4 102 244 102c-83.2 0-151.2 67.3-151.2 150.4s68 150.4 151.2 150.4c97.1 0 134.3-70.2 138.6-106.4H244v-75.2h243.8c1.3 7.8 2.2 15.6 2.2 23.4z"></path>
              </svg>
              Sign in with Google
            </button>
            
            <p className="text-sm text-center text-gray-400 mt-6">
              {isLoginView ? "Don't have an account?" : "Already have an account?"}
              <button 
                type="button"
                onClick={() => setIsLoginView(!isLoginView)}
                className="font-semibold text-teal-400 hover:underline ml-1"
              >
                {isLoginView ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
