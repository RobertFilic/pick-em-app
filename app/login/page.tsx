// File: app/login/page.tsx
// This is the complete, production-ready code for your authentication page.
// It uses hooks from Next.js and connects to your actual Supabase client.

'use client'; // This directive is essential for components with hooks and event listeners.

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Use the Next.js router for navigation
import { supabase } from '@/lib/supabaseClient'; // Import your actual Supabase client using the path alias
import { Mail, Lock, User, LogIn } from 'lucide-react';

// --- Reusable UI Components (Minimalist & Clean) ---

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => <div className={`p-6 ${className}`}>{children}</div>;
const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => <div className={`p-6 pt-0 ${className}`}>{children}</div>;
const CardFooter = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => <div className={`flex items-center p-6 pt-0 ${className}`}>{children}</div>;

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: React.ElementType;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ id, type, placeholder, icon: Icon, ...props }, ref) => (
  <div className="relative">
    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
      <Icon className="h-5 w-5 text-gray-400" />
    </span>
    <input
      id={id}
      type={type}
      ref={ref}
      placeholder={placeholder}
      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
      required
      {...props}
    />
  </div>
));
Input.displayName = 'Input';


interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
}

const Button = ({ children, isLoading = false, className = '', ...props }: ButtonProps) => (
  <button
    disabled={isLoading}
    className={`w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
      bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2 ${className}`}
    {...props}
  >
    {isLoading ? (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    ) : null}
    {isLoading ? 'Processing...' : children}
  </button>
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

  const handleAuthAction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      if (isLoginView) {
        // --- Handle Login ---
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        setSuccessMessage('Login successful! Redirecting...');
        // Redirect to the homepage/dashboard after a short delay
        setTimeout(() => router.push('/'), 1000);

      } else {
        // --- Handle Sign Up ---
        if (!username.trim()) {
            throw new Error('Username is required.');
        }
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            // This 'data' object is passed to the 'handle_new_user' function
            // you created in the Supabase SQL script.
            data: { username: username.trim() },
          },
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
            <LogIn className="mx-auto h-12 w-12 text-blue-600"/>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">Pick 'em App</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
                {isLoginView ? 'Welcome back! Sign in to continue.' : 'Create an account to start playing.'}
            </p>
        </div>

        <Card>
          <form onSubmit={handleAuthAction}>
            <CardContent className="space-y-4">
              {!isLoginView && (
                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                  <Input 
                    id="username" 
                    type="text" 
                    placeholder="Your cool username" 
                    icon={User} 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              )}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  icon={Mail} 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  icon={Lock} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex-col space-y-4">
              {error && <p className="text-sm text-red-500 text-center">{error}</p>}
              {successMessage && <p className="text-sm text-green-500 text-center">{successMessage}</p>}
              
              <Button type="submit" isLoading={loading} className="w-full">
                {isLoginView ? 'Sign In' : 'Create Account'}
              </Button>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isLoginView ? "Don't have an account?" : "Already have an account?"}
                <button 
                  type="button"
                  onClick={() => {
                    setIsLoginView(!isLoginView);
                    setError('');
                    setSuccessMessage('');
                  }}
                  className="font-semibold text-blue-600 hover:underline ml-1"
                >
                  {isLoginView ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
