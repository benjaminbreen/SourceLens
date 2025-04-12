// components/auth/AccountButton.tsx for sourcelens

'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/authContext';
import Image from 'next/image';
import Link from 'next/link';
import AccountPanel from './AccountPanel';

export default function AccountButton() {
  const { user, isLoading } = useAuth();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  
  const openPanel = () => setIsPanelOpen(true);
  const closePanel = () => setIsPanelOpen(false);
  
  if (isLoading) {
    return (
      <div className="h-8 w-8 rounded-full animate-pulse bg-slate-200 dark:bg-slate-700"></div>
    );
  }
  
  if (!user) {
    return (
      <div className="flex items-center space-x-4">
        <Link 
          href="/login" 
          className="text-sm font-medium text-slate-50 dark:text-slate-300 hover:scale-101 hover:font-semibold dark:hover:text-indigo-400"
        >
          Log in
        </Link>
        <Link 
          href="/register" 
          className="text-sm font-medium px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-colors"
        >
          Sign up
        </Link>
      </div>
    );
  }
  
  return (
    <>
      <button
        onClick={openPanel}
        className="flex items-center group relative"
        aria-label="Open account menu"
      >
        {/* Avatar */}
        {user.user_metadata?.avatar_url ? (
          <div className="relative h-8 w-8 rounded-full overflow-hidden border-2 border-transparent transition duration-150">
            <Image
              src={user.user_metadata.avatar_url}
              alt="Profile"
              fill
              sizes="32px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-amber-500/80 border-1 group-hover:scale-105   border-transparent hover:border-amber-500 flex items-center justify-center text-white font-medium text-sm transition duration-150">
            {(user.email || user.user_metadata?.name || 'U').charAt(0).toUpperCase()}
          </div>
        )}
        
        {/* Indicator dot for new activity/notifications (optional) */}
        <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-indigo-500 rounded-full border border-white dark:border-slate-900"></span>
        
        {/* Subtle dropdown arrow */}
      
      </button>
      
      {/* Account Panel */}
      <AccountPanel isOpen={isPanelOpen} onClose={closePanel} />
    </>
  );
}