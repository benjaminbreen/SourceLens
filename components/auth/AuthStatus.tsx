// components/auth/AuthStatus.tsx
// Simple component to display current user's name with link to profile

'use client';

import React from 'react';
import { useAuth } from '@/lib/auth/authContext';
import Link from 'next/link';

export default function AuthStatus() {
  const { user, isLoading } = useAuth();
  
  // Loading State - minimal spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-6 w-6">
        <div className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // Logged In State - simple username display
  if (user) {
    return (
      <Link href="/profile" className="text-sm text-slate-100/70 font-sans hover:text-indigo-400 transition-colors">
        <span className="  mr-1"></span>
        {user.email?.split('@')[0] || user.user_metadata?.name || 'User'}
      </Link>
    );
  }
  
  // Logged Out State - minimal login link
  return (
    <Link href="/login" className="text-xs font-sans opacity/50 italic text-indigo-500 hover:text-white transition-colors">
     
    </Link>
  );
}