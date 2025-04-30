// components/auth/AccountButton.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/authContext';
import Image from 'next/image';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import AccountPanel from './AccountPanel';

interface AccountButtonProps {
  compact?: boolean;
  className?: string;
}

export default function AccountButton({ compact = false, className = '' }: AccountButtonProps) {
  const { user, isLoading } = useAuth();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // Handle client-side portal mounting
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  
  const openPanel = () => setIsPanelOpen(true);
  const closePanel = () => setIsPanelOpen(false);
  
  // Determine user initial for avatar fallback
  const getUserInitial = (): string => {
    if (!user) return 'G';
    
    if (user.user_metadata?.firstName) {
      return user.user_metadata.firstName.charAt(0).toUpperCase();
    }
    
    if (user.user_metadata?.name) {
      return user.user_metadata.name.charAt(0).toUpperCase();
    }
    
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    
    return 'U';
  };
  
  if (isLoading) {
    return (
      <div className={`${compact ? 'h-7 w-7' : 'h-8 w-8'} rounded-full animate-pulse bg-slate-200 dark:bg-slate-700 ${className}`}></div>
    );
  }
  
  if (!user) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Link 
          href="/login" 
          className={`text-xs sm:text-sm font-medium text-indigo-50 rounded-full px-2 py-1 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors`}
        >
          Log in
        </Link>
        <Link 
          href="/register" 
          className={`text-xs sm:text-sm font-medium px-2.5 py-1 bg-indigo-600 border border-indigo-500 hover:bg-indigo-500 hover:border-indigo-400 hover:scale-105 text-white rounded-full shadow-sm transition-all duration-200`}
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
        className={`flex items-center group relative ${className}`}
        aria-label="Open account menu"
      >
        {user.user_metadata?.avatar_url ? (
          // User has an avatar
          <div className={`relative ${compact ? 'h-7 w-7' : 'h-9 w-9'} rounded-full overflow-hidden 
                           ${compact 
                              ? 'ring-1 ring-white/30' 
                              : 'ring-2 ring-white/40'} 
                           group-hover:ring-white/60 group-hover:scale-105 
                           transition-all duration-200 shadow-sm`}
          >
            <Image
              src={user.user_metadata.avatar_url}
              alt={user.user_metadata?.name || 'User profile'}
              fill
              sizes={compact ? "28px" : "36px"}
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
          </div>
        ) : (
          // Fallback avatar
          <div className={`${compact ? 'h-7 w-7' : 'h-9 w-9'} rounded-full 
                          bg-gradient-to-br from-indigo-500 to-purple-600 
                          shadow-sm group-hover:shadow-indigo-500/20 
                          group-hover:scale-105 
                          flex items-center justify-center
                          ring-1 ring-white/30 group-hover:ring-indigo-400/70
                          text-white font-medium ${compact ? 'text-xs' : 'text-sm'}
                          transition-all duration-200`}
          >
            {getUserInitial()}
            <div className="absolute inset-0 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
          </div>
        )}
        
        {/* Optional status indicator - uncomment if you want to show online status */}
        {/*
        <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></div>
        */}
      </button>
      
      {/* Render the AccountPanel using a portal to escape layout constraints */}
      {isMounted && isPanelOpen && createPortal(
        <AccountPanel isOpen={isPanelOpen} onClose={closePanel} />,
        document.body
      )}
    </>
  );
}