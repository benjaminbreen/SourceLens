// components/auth/RegisterForm.tsx
// Enhanced registration form to match login form aesthetics
// Full dark mode support, entrance animations, improved error handling

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/authContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Space_Grotesk } from 'next/font/google';

// Font import
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
});

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const { signUp } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
    setTimeout(() => setShowForm(true), 100);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signUp(email, password);

      if (error) {
        setError(error.message);
        return;
      }

      setSuccessMessage('Account created! Please check your email to confirm.');
      setTimeout(() => router.push('/login'), 3000);
    } catch (err) {
      console.error('Registration error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const themeClasses = {
    background: darkMode ? 'bg-slate-900' : 'bg-slate-50',
    card: darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200',
    input: darkMode
      ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500',
    label: darkMode ? 'text-slate-300' : 'text-slate-700',
    text: {
      primary: darkMode ? 'text-white' : 'text-slate-900',
      muted: darkMode ? 'text-slate-400' : 'text-slate-600',
      link: darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'
    },
    button: 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 hover:scale-105 text-white'
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 py-12 ${themeClasses.background} transition-colors duration-300`}>
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000" viewBox="0 0 1000 1000" className="w-full h-full">
          <path 
            fill={darkMode ? "#4f46e5" : "#4338ca"}
            fillOpacity="0.2"
            d="M0,500L48,500C96,500,192,500,288,478.3C384,457,480,413,576,413.3C672,413,768,457,864,456.7C960,457,1056,413,1152,391.7C1248,370,1344,370,1392,370L1440,370L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
          />
        </svg>
      </div>

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

      <div className={`w-full max-w-md rounded-xl border shadow-lg overflow-hidden transition-all duration-500 transform ${themeClasses.card} ${showForm ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        <div className="h-2 bg-gradient-to-r from-indigo-600 via-purple-500 to-amber-500"></div>

        <div className="p-6 sm:p-8">
          <h2 className={`${spaceGrotesk.className} text-2xl font-semibold text-center mb-6 ${themeClasses.text.primary}`}>
            Create your account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className={`block text-sm font-medium ${themeClasses.label} mb-1.5`}>
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`block w-full px-3 py-2.5 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className={`block text-sm font-medium ${themeClasses.label} mb-1.5`}>
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`block w-full pr-10 px-3 py-2.5 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3l18 18M9.88 9.88a3 3 0 014.24 4.24m-4.24-4.24L4.22 4.22m0 0a9.956 9.956 0 017.78-3.22c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411" />
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className={`block text-sm font-medium ${themeClasses.label} mb-1.5`}>
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={`block w-full px-3 py-2.5 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Success message */}
            {successMessage && (
              <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm">
                {successMessage}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2.5 px-4 border rounded-lg shadow-md text-sm font-medium transition-all duration-300 ${themeClasses.button} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Already have account */}
          <div className="mt-6 text-center">
            <p className={`text-sm ${themeClasses.text.muted}`}>
              Already have an account?{' '}
              <Link href="/login" className={`font-medium ${themeClasses.text.link}`}>
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
