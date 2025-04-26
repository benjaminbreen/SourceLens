// components/auth/AccountButton.tsx
'use client';
import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/authContext';

import Image from 'next/image';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import AccountPanel from './AccountPanel';

export default function AccountButton() {
  const { user, isLoading } = useAuth();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // Handle client-side portal mounting
  React.useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  
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
          className="text-sm -ml-2 font-medium text-indigo-950 rounded-full px-2 py-1.5 bg-slate-50/20 dark:text-slate-300 hover:scale-101 hover:font-semibold hover:text-indigo-800 dark:hover:text-indigo-400"
        >
          Log in
        </Link>
        <Link 
          href="/register" 
          className="text-sm font-medium inner-shadow px-3 py-1.5 bg-indigo-600 border-1 border-indigo-500 hover:bg-indigo-500 hover:border-indigo-400 hover:scale-102 text-white rounded-full shadow-sm transition-colors"
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
          <div className="relative h-9 w-9 rounded-full overflow-hidden border-2 border-white border-slate-500/80 hover:border-slate-800/50 hover:scale-110 transition duration-150">
            <Image
              src={user.user_metadata.avatar_url}
              alt="Profile"
              fill
              sizes="32px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-amber-500/80 border-1 group-hover:scale-105 border-transparent hover:border-amber-500 flex items-center justify-center text-white font-medium text-sm transition duration-150">
            {(user.email || user.user_metadata?.name || 'U').charAt(0).toUpperCase()}
          </div>
        )}
        
        
      </button>
      
      {/* Render the AccountPanel using a portal to escape layout constraints */}
      {isMounted && isPanelOpen && createPortal(
        <AccountPanel isOpen={isPanelOpen} onClose={closePanel} />,
        document.body
      )}
    </>
  );
}