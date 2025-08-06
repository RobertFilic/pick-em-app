'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Mail, Lock, User, LogIn } from 'lucide-react';

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm ${className}`}>
    {children}
  </div>
);

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
      required={type !== 'password' && type !== 'email'}
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
            <LogIn className="mx-auto h-12 w-12 text-blue-600"/>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">Pick&apos;em App</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
                {isLoginView ? 'Welcome back! Sign in to continue.' : 'Create an account to start playing.'}
            </p>
        </div>

        <Card>
          <form onSubmit={handleEmailAuth}>
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

              <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                {isLoginView ? "Don't have an account?" : "Already have an account?"}
                <button 
                  type="button"
                  onClick={() => setIsLoginView(!isLoginView)}
                  className="font-semibold text-blue-600 hover:underline ml-1"
                >
                  {isLoginView ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </CardFooter>
          </form>

          <div className="relative px-6 pb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          <div className="p-6 pt-0">
            <div className="text-center mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              You&apos;ll be redirected to Google to sign in securely
            </p>
          </div>
            <button
              onClick={handleGoogleLogin}
              className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 h-10 px-4 py-2"
            >
              <svg className="mr-2 h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 110.3 512 0 401.7 0 265.4 0 129.2 109.3 20.4 244 20.4c65.4 0 123.4 26.2 165.7 68.5l-63.4 61.9C314.6 118.2 282.4 102 244 102c-83.2 0-151.2 67.3-151.2 150.4s68 150.4 151.2 150.4c97.1 0 134.3-70.2 138.6-106.4H244v-75.2h243.8c1.3 7.8 2.2 15.6 2.2 23.4z"></path>
              </svg>
              Sign in with Google
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}