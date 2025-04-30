// components/auth/LoginForm.tsx
// Enhanced login form with improved aesthetics and usability
// Follows SourceLens design language with subtle gradients, improved visuals
// Maintains full mobile responsiveness with optimized layout and animations

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/authContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Space_Grotesk } from 'next/font/google';

// Font integration
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
});

export default function LoginForm() {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Animation states
  const [showForm, setShowForm] = useState(false);
  
  // Auth and routing hooks
  const { signIn } = useAuth();
  const router = useRouter();

  // Dark mode state with system preference detection
  const [darkMode, setDarkMode] = useState(false);
  
  // Check for system dark mode preference
  useEffect(() => {
    // Check for remembered email
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
    
    // Check for dark mode preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
    
    // Animate form entrance
    setTimeout(() => setShowForm(true), 100);
  }, []);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }
      
      // Save email if remember me is checked
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      // Successfully logged in, redirect to dashboard or analysis page
      router.push('/dashboard');
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
      setIsLoading(false);
    }
  };

  // Apply theme classes based on dark mode
  const themeClasses = {
    background: darkMode ? 'bg-slate-900' : 'bg-slate-50',
    card: darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200',
    input: darkMode 
      ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500' 
      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500',
    label: darkMode ? 'text-slate-300' : 'text-slate-700',
    button: {
      primary: darkMode
        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 hover:scale-105 text-white'
        : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 hover:scale-105 text-white'
    },
    text: {
      primary: darkMode ? 'text-white' : 'text-slate-900',
      muted: darkMode ? 'text-slate-400' : 'text-slate-600',
      link: darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'
    }
  };
  
  return (
    <div className={`min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 py-12 transition-colors duration-300 ${themeClasses.background}`}>
      {/* Background gradient effect */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000" viewBox="0 0 1000 1000" className="w-full h-full">
          <path 
            fill={darkMode ? "#4f46e5" : "#4338ca"} 
            fillOpacity="0.2"
            d="M0,500L48,500C96,500,192,500,288,478.3C384,457,480,413,576,413.3C672,413,768,457,864,456.7C960,457,1056,413,1152,391.7C1248,370,1344,370,1392,370L1440,370L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
          ></path>
        </svg>
      </div>

      {/* Logo and title */}
      <div className="flex flex-col items-center mb-8 relative">
        <div className="relative w-30 h-30 mb-10 -mt-20">
          <Image 
            src="/sourcelenslogo.png" 
            alt="SourceLens" 
            fill
            className={`invert object-contain transition-transform ${!darkMode ? 'opacity-95' : ''}`}
            priority
          />
        </div>
        <h1 className={`${spaceGrotesk.className} text-4xl font-bold tracking-tight ${themeClasses.text.primary}`}>
          SourceLens
        </h1>
      </div>

      {/* Login card */}
      <div 
        className={`w-full max-w-md rounded-xl border shadow-lg overflow-hidden transition-all duration-500 transform ${themeClasses.card} ${
          showForm ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}
      >
        {/* Card header with gradient */}
        <div className="h-2 bg-gradient-to-r from-indigo-600 via-purple-500 to-amber-500"></div>
        
        <div className="p-6 sm:p-8">
          <h2 className={`${spaceGrotesk.className} text-2xl font-semibold text-center mb-6 ${themeClasses.text.primary}`}>
            Welcome back
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email field */}
            <div>
              <label htmlFor="email" className={`block text-sm font-medium ${themeClasses.label} mb-1.5`}>
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className={`h-5 w-5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </div>
            
            {/* Password field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className={`block text-sm font-medium ${themeClasses.label}`}>
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className={`text-xs ${themeClasses.text.link}`}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className={`h-5 w-5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`block w-full pl-10 pr-10 py-2.5 border rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <svg className={`h-5 w-5 ${darkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'} transition-colors`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Remember me option */}
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className={`h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded ${darkMode ? 'bg-slate-700 border-slate-500' : ''}`}
              />
              <label htmlFor="remember-me" className={`ml-2 block text-sm ${themeClasses.text.muted}`}>
                Remember me
              </label>
            </div>
            
            {/* Error message */}
            {error && (
              <div className={`p-3 ${darkMode ? 'bg-red-900/30 text-red-300 border border-red-800' : 'bg-red-50 text-red-700 border border-red-100'} text-sm rounded-lg flex items-start`}>
                <svg className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </div>
            )}
            
            {/* Login button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center items-center py-2.5 px-4 border rounded-lg shadow-md text-sm font-medium transition-all duration-300 ${themeClasses.button.primary} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <>
                  <svg className=" h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
          
          {/* Create account link */}
          <div className="mt-6 text-center">
            <p className={`text-sm ${themeClasses.text.muted}`}>
              Don't have an account?{' '}
              <Link href="/register" className={`font-medium ${themeClasses.text.link}`}>
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      {/* Footer with version and links */}
      <div className="mt-8 text-center">
        <p className={`text-xs ${themeClasses.text.muted}`}>
          SourceLens • BETA • <Link href="/terms" className={themeClasses.text.link}>Terms</Link> • <Link href="/privacy" className={themeClasses.text.link}>Privacy</Link>
        </p>
      </div>

      {/* Dark mode toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className={`absolute top-4 right-4 p-2 rounded-full ${
          darkMode ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-700 shadow-sm border border-slate-200'
        } transition-colors`}
        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {darkMode ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>
    </div>
  );
}