// components/auth/AccountPanel.tsx
// Slide-in account panel with user information and navigation options
// Uses framer-motion for smooth animations while matching the app's aesthetic

'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth/authContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import SettingsModal from './SettingsModal';

// Icon components
const IconStatus = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconProfile = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const IconDrafts = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const IconSources = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const IconCitations = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
  </svg>
);

const IconAnalyses = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const IconStarred = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const IconSettings = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const IconSignOut = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

interface AccountPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AccountPanel({ isOpen, onClose }: AccountPanelProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  // Close the panel when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    // Close the panel when pressing Escape
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleEscKey);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);
  
  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      onClose();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  // Open settings modal
  const handleOpenSettings = () => {
    setShowSettingsModal(true);
  };
  
  if (!user) return null;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with subtle blur effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40"
            onClick={onClose}
          />
          
          {/* Account panel */}
          <motion.div
            ref={panelRef}
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: '0%', opacity: 1 }}
            exit={{ x: '100%', opacity: 0.5 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed  right-0 top-2 bottom-0 h-full w-[320px] max-w-[80vw] z-50 shadow-2xl"
          >
            <div className="h-full rounded-2xl overflow-y-auto bg-white/98  backdrop-blur-md flex flex-col">
              {/* Gradient line at top */}
              <div className="h-1 w-full bg-gradient-to-r from-purple-700/40 via-slate-400 to-indigo-400/40"></div>
              
              {/* Header with user info */}
              <div className="p-4 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center text-base space-x-3">
                  {user.user_metadata?.avatar_url ? (
                    <Image
                      src={user.user_metadata.avatar_url}
                      alt="Profile"
                      width={40}
                      height={40}
                      className="rounded-full border border-slate-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full text-base bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                      {(user.email || user.user_metadata?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-slate-800">
                      {user.user_metadata?.name || user.email?.split('@')[0] || 'User'}
                    </div>
                    <div className="text-base text-slate-500 truncate max-w-[180px]">
                      {user.email}
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Menu items */}
              <div className="py-2">
                {/* Status setting */}
                <button className="w-full px-4 py-2.5 flex items-center text-base font-medium text-slate-700 hover:bg-slate-100 transition-colors gap-3">
                  <span className="text-indigo-500 "><IconStatus /></span>
                  <span>Set status</span>
                </button>
                
                {/* Divider */}
                <div className="my-2 border-t border-slate-100"></div>
                
                {/* Library Section */}
                <div className="px-4 py-1">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Your Library
                  </h3>
                </div>
                
                <Link 
                  href="/profile"
                  onClick={onClose}
                  className="w-full px-4  text-base py-2.5 flex items-center gap-3 text-md font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <span className="text-indigo-500"><IconProfile /></span>
                  <span>Your profile</span>
                </Link>
                
                <Link 
                  href="/library?tab=drafts"
                  onClick={onClose}
                  className="w-full px-4 py-2.5 flex text-base items-center gap-3 text-md font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <span className="text-indigo-500"><IconDrafts /></span>
                  <span>Your drafts</span>
                </Link>
                
                <Link 
                  href="/library?tab=sources"
                  onClick={onClose}
                  className="w-full px-4 py-2.5 flex  text-base items-center gap-3 text-md font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <span className="text-indigo-500"><IconSources /></span>
                  <span>Your sources</span>
                </Link>
                
                <Link 
                  href="/library?tab=citations"
                  onClick={onClose}
                  className="w-full px-4 py-2.5 flex text-base items-center gap-3 text-md font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <span className="text-indigo-500"><IconCitations /></span>
                  <span>Your citations</span>
                </Link>
                
                <Link 
                  href="/library?tab=analyses"
                  onClick={onClose}
                  className="w-full px-4 py-2.5 flex text-base items-center gap-3 text-md font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <span className="text-indigo-500"><IconAnalyses /></span>
                  <span>Your analyses</span>
                </Link>
                
                <Link 
                  href="/library?tab=starred"
                  onClick={onClose}
                  className="w-full px-4 py-2.5 flex  text-base items-center justify-between text-md font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-indigo-500"><IconStarred /></span>
                    <span>Starred items</span>
                  </div>
                  <span className="text-md px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                    Soon
                  </span>
                </Link>
                
                {/* Divider */}
                <div className="my-2 border-t border-slate-100"></div>
                
                {/* Settings Section */}
                <div className="px-4 py-1">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Settings
                  </h3>
                </div>
                
                {/* Settings button */}
                <button 
                  onClick={handleOpenSettings}
                  className="w-full px-4 py-2.5 flex text-base items-center gap-3 text-md font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <span className="text-indigo-500"><IconSettings /></span>
                  <span>Settings</span>
                </button>
                
                {/* Push account to the bottom with flex spacer */}
                <div className="flex-grow"></div>
              </div>
              
              {/* Account section with sign out */}
              <div className="mt-auto border-t-2 border-slate-200">
                <div className="bg-slate-50 py-2">
                  <div className="px-4 py-1">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Account
                    </h3>
                  </div>
                  
                  <button 
                    onClick={handleSignOut}
                    className="w-full px-4 py-2.5 flex text-sm items-center gap-3 text-md font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <span className="text-slate-500"><IconSignOut /></span>
                    <span>Sign out</span>
                  </button>
                </div>
                
                {/* Footer with app info */}
                <div className="p-4 text-xs text-slate-500 bg-slate-50 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span>SourceLens</span>
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                      v1.0.0
                    </span>
                  </div>
                  <p>© 2025 SourceLens. All rights reserved.</p>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Settings Modal */}
          <SettingsModal 
            isOpen={showSettingsModal} 
            onClose={() => setShowSettingsModal(false)} 
            user={user}
          />
        </>
      )}
    </AnimatePresence>
  );
}