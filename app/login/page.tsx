'use client';

import React, { useState } from 'react';
// import { useRouter } from 'next/navigation'; // FIX: Removed Next.js router
import { createClient } from '@supabase/supabase-js'; // FIX: Added direct import for Supabase client
import { Mail, Lock, User, LogIn } from 'lucide-react';

// FIX: Initialize Supabase client directly.
// IMPORTANT: Replace with your actual Supabase project URL and public anon key.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project-id.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);


export default function AuthPage() {
    const [isLoginView, setIsLoginView] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    // const router = useRouter(); // FIX: Removed Next.js router instance

    const handleEmailAuth = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        // Basic validation
        if (!isLoginView && !username.trim()) {
            setError('Username is required.');
            setLoading(false);
            return;
        }
        if (!email) {
            setError('Email is required.');
            setLoading(false);
            return;
        }
        if (!password) {
            setError('Password is required.');
            setLoading(false);
            return;
        }


        try {
            if (isLoginView) {
                const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
                if (signInError) throw signInError;
                setSuccessMessage('Login successful! Redirecting...');
                // FIX: Replaced Next.js router with standard window.location for redirection.
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1500);
            } else {
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
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback` // Important for OAuth flow
            }
        });
        if (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    return (
        <>
            {/* This style block contains all the CSS needed for this component,
                mirroring the aesthetic of the LandingPage. */}
            <style jsx global>{`
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #ffffff;
                    background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
                    overflow-x: hidden;
                }
                .auth-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    position: relative;
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
                .auth-card {
                    width: 100%;
                    max-width: 420px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 20px;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 40px;
                    text-align: center;
                    animation: slideUp 0.6s ease-out;
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .auth-header h1 {
                    font-size: 2.5rem;
                    font-weight: 800;
                    margin-bottom: 1rem;
                    background: linear-gradient(135deg, #ff6b6b, #4ecdc4, #45b7d1);
                    background-size: 300% 300%;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: gradientShift 4s ease-in-out infinite;
                }
                @keyframes gradientShift {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                .auth-header p {
                    color: #b8b8d1;
                    margin-bottom: 2rem;
                }
                .input-group {
                    margin-bottom: 1.5rem;
                    text-align: left;
                }
                .input-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-size: 0.9rem;
                    color: #b8b8d1;
                }
                .input-field {
                    width: 100%;
                    padding: 12px 15px;
                    background: rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    color: #ffffff;
                    font-size: 1rem;
                    transition: border-color 0.3s ease, box-shadow 0.3s ease;
                }
                .input-field:focus {
                    outline: none;
                    border-color: #4ecdc4;
                    box-shadow: 0 0 15px rgba(78, 205, 196, 0.3);
                }
                .btn-primary, .btn-secondary {
                    width: 100%;
                    padding: 16px 40px;
                    border-radius: 50px;
                    font-size: 1.1rem;
                    font-weight: 600;
                    cursor: pointer;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                    margin-bottom: 1rem;
                }
                .btn-primary {
                    background: linear-gradient(135deg, #ff6b6b, #ee5a24);
                    color: white;
                    border: none;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
                }
                .btn-primary:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 35px rgba(255, 107, 107, 0.4);
                }
                .btn-primary:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                .btn-secondary {
                    background: transparent;
                    color: #4ecdc4;
                    border: 2px solid #4ecdc4;
                }
                .btn-secondary:hover:not(:disabled) {
                    background: #4ecdc4;
                    color: #0f0f23;
                    transform: translateY(-2px);
                }
                .auth-switch {
                    color: #b8b8d1;
                    font-size: 0.95rem;
                }
                .auth-switch button {
                    background: none;
                    border: none;
                    color: #4ecdc4;
                    font-weight: 600;
                    cursor: pointer;
                    margin-left: 5px;
                }
                .auth-switch button:hover {
                    text-decoration: underline;
                }
                .divider {
                    display: flex;
                    align-items: center;
                    text-align: center;
                    color: #b8b8d1;
                    margin: 1.5rem 0;
                }
                .divider::before, .divider::after {
                    content: '';
                    flex: 1;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                .divider:not(:empty)::before { margin-right: .5em; }
                .divider:not(:empty)::after { margin-left: .5em; }
                .message {
                    padding: 10px;
                    border-radius: 8px;
                    margin-bottom: 1rem;
                    font-weight: 500;
                }
                .message.error {
                    background-color: rgba(255, 107, 107, 0.2);
                    color: #ff6b6b;
                }
                .message.success {
                    background-color: rgba(78, 205, 196, 0.2);
                    color: #4ecdc4;
                }
                .loading-spinner {
                    animation: spin 1s linear infinite;
                    margin-right: 10px;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
            <div className="auth-container">
                <div className="bg-elements">
                    <div className="floating-shape"></div>
                    <div className="floating-shape"></div>
                    <div className="floating-shape"></div>
                </div>
                <div className="auth-card">
                    <div className="auth-header">
                        <h1>{isLoginView ? 'Welcome Back' : 'Create Account'}</h1>
                        <p>{isLoginView ? 'Sign in to continue the challenge.' : 'Join the game in seconds.'}</p>
                    </div>

                    <form onSubmit={handleEmailAuth}>
                        {!isLoginView && (
                            <div className="input-group">
                                <label htmlFor="username">Username</label>
                                <input
                                    id="username"
                                    type="text"
                                    placeholder="Your cool username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="input-field"
                                />
                            </div>
                        )}
                        <div className="input-group">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field"
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field"
                                required
                            />
                        </div>

                        {error && <div className="message error">{error}</div>}
                        {successMessage && <div className="message success">{successMessage}</div>}

                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading && !successMessage && (
                                <svg className="loading-spinner h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            {loading ? 'Processing...' : (isLoginView ? 'Sign In' : 'Create Account')}
                        </button>
                    </form>

                    <div className="divider">or</div>

                    <button onClick={handleGoogleLogin} className="btn-secondary" disabled={loading}>
                        <svg className="mr-2 h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                            <path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 110.3 512 0 401.7 0 265.4 0 129.2 109.3 20.4 244 20.4c65.4 0 123.4 26.2 165.7 68.5l-63.4 61.9C314.6 118.2 282.4 102 244 102c-83.2 0-151.2 67.3-151.2 150.4s68 150.4 151.2 150.4c97.1 0 134.3-70.2 138.6-106.4H244v-75.2h243.8c1.3 7.8 2.2 15.6 2.2 23.4z"></path>
                        </svg>
                        Sign in with Google
                    </button>

                    <div className="auth-switch">
                        {isLoginView ? "Don't have an account?" : 'Already have an account?'}
                        <button type="button" onClick={() => { setIsLoginView(!isLoginView); setError(''); setSuccessMessage(''); }}>
                            {isLoginView ? 'Sign Up' : 'Sign In'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}