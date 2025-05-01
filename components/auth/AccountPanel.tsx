// components/auth/AccountPanel.tsx
// Account management panel focused on user profile, settings, and personalized features
// Includes profile image upload, dark mode integration, and account-specific navigation

'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth/authContext';
import { useAppStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import SettingsModal from './SettingsModal';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Icon components
const IconDashboard = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
  </svg>
);

const IconProfile = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const IconSettings = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const IconLibrary = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
  </svg>
);

const IconSignOut = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const IconHelp = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconCamera = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const IconAnalytics = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Get dark mode state from app store
  const isDarkMode = useAppStore(state => state.isDarkMode);
  const toggleDarkMode = useAppStore(state => state.toggleDarkMode);
  
  // Supabase client for image uploads
  const supabase = createClientComponentClient();
  
  // Preloaded avatar options
  const avatarOptions = [
    '/portraits/avatar1.jpg',
    '/portraits/avatar2.jpg',
    '/portraits/avatar3.jpg',
    '/portraits/avatar4.jpg',
    '/portraits/avatar5.jpg',
  ];
  
  // Close the panel when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        ;
      }
    };
    
    // Close the panel when pressing Escape
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
     
      document.addEventListener('keydown', handleEscKey);
    }
    
    return () => {
     
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
  
  // Handle profile image upload
  // Handle profile image upload
const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;
  
  const file = files[0];
  setIsUploading(true);
  setUploadError(null);
  
  try {
    // Upload to Supabase storage
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    const userId = user?.id ?? '';
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    // Create a unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `profiles/${fileName}`;
    
    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) throw uploadError;
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filePath);
    
    // Update user metadata
    await supabase.auth.updateUser({
      data: { 
        avatar_url: urlData.publicUrl,
        updated_at: new Date().toISOString()
      }
    });
    
    // Force reload to see changes
    window.location.reload();
    
  } catch (error) {
    console.error('Error uploading profile image:', error);
    setUploadError('Failed to upload image. Please try again.');
  } finally {
    setIsUploading(false);
    setShowImageSelector(false);
  }
};
  
  // Handle selecting a preloaded avatar
  const handleSelectAvatar = async (avatarUrl: string) => {
    setIsUploading(true);
    setUploadError(null);
    
    try {
      // Update user metadata with selected avatar
      await supabase.auth.updateUser({
        data: { 
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        }
      });
      
      // Force reload to see changes
      window.location.reload();
      
    } catch (error) {
      console.error('Error setting profile image:', error);
      setUploadError('Failed to set profile image. Please try again.');
    } finally {
      setIsUploading(false);
      setShowImageSelector(false);
    }
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
            className="fixed inset-0 bg-black/30 z-[9999]"
       
          />
          
          {/* Account panel */}
          <motion.div
            ref={panelRef}
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: '0%', opacity: 1 }}
            exit={{ x: '100%', opacity: 0.5 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 h-[100vh] w-[320px] max-w-[80vw] z-[200000] shadow-2xl"
          >
            <div className={`h-full overflow-y-auto ${isDarkMode ? 'bg-slate-900/98' : 'bg-white/98'} backdrop-blur-md flex flex-col transition-colors duration-300`}>
              {/* Gradient line at top */}
              <div className="h-1 w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-400"></div>
              
              {/* Header with user info and profile pic */}
              <div className={`p-6 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'} transition-colors duration-300`}>
                <div className="flex items-end">
                  {/* Profile picture with upload overlay */}
                  <div className="relative group cursor-pointer" onClick={() => setShowImageSelector(true)}>
                    {user.user_metadata?.avatar_url ? (
                      <div className="relative w-16 h-16 rounded-full border-2 overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-indigo-500/30">
                        <Image
                          src={user.user_metadata.avatar_url}
                          alt="Profile"
                          fill
                          className="object-cover"
                        />
                        <div className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-90 transition-opacity duration-200 ${isDarkMode ? 'bg-slate-900/70' : 'bg-white/70'}`}>
                          <IconCamera />
                        </div>
                      </div>
                    ) : (
                      <div className={`relative w-16 h-16 rounded-full flex items-center justify-center text-xl font-semibold shadow-lg ${isDarkMode ? 'bg-indigo-900 text-indigo-200' : 'bg-indigo-100 text-indigo-800'} transition-colors duration-300 group-hover:shadow-indigo-500/30`}>
                        {(user.email || user.user_metadata?.name || 'U').charAt(0).toUpperCase()}
                        <div className={`absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-90 transition-opacity duration-200 ${isDarkMode ? 'bg-slate-900/70' : 'bg-white/70'}`}>
                          <IconCamera />
                        </div>
                      </div>
                    )}
                    
                    {/* Small camera badge */}
                    <div className={`absolute -bottom-1 -right-1 p-1 rounded-full ${isDarkMode ? 'bg-slate-800 text-indigo-400' : 'bg-white text-indigo-600'} shadow-md`}>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="ml-4 flex-1">
                    <div className={`font-medium text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'} transition-colors duration-300`}>
                      {user.user_metadata?.name || user.email?.split('@')[0] || 'User'}
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} truncate max-w-[200px] transition-colors duration-300`}>
                      {user.email}
                    </div>
                  </div>
                  
                  <button
                    onClick={onClose}
                    className={`p-2 rounded-md ${isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'} transition-colors duration-300`}
                    aria-label="Close"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Hidden file input for profile picture upload */}
                <input 
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                
                {/* Image selection modal */}
                {showImageSelector && (
                  <div className={`fixed inset-0 z-[10001] flex items-center justify-center p-4 ${isDarkMode ? 'bg-slate-900/80' : 'bg-slate-700/50'} `}>
                    <div className={`relative w-full max-w-md rounded-xl shadow-2xl overflow-hidden ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}>
                      <div className={`p-4 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}>
                        <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Change Profile Picture</h3>
                        <button 
                          onClick={() => setShowImageSelector(false)}
                          className={`p-1 rounded ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'}`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="p-6">
                        {/* Upload your own option */}
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className={`w-full flex items-center justify-center gap-2 p-3 mb-6 rounded-lg border-2 border-dashed ${
                            isUploading 
                              ? isDarkMode ? 'border-slate-700 text-slate-500' : 'border-slate-300 text-slate-400'
                              : isDarkMode ? 'border-slate-600 text-slate-300 hover:border-indigo-500 hover:text-indigo-400' : 'border-slate-300 text-slate-600 hover:border-indigo-500 hover:text-indigo-600'
                          } transition-colors duration-300`}
                        >
                          {isUploading ? (
                            <>
                              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              <span>Upload your own photo</span>
                            </>
                          )}
                        </button>
                        
                        {/* Error message */}
                        {uploadError && (
                          <div className="mb-4 p-2 bg-red-100 border border-red-300 text-red-800 text-sm rounded">
                            {uploadError}
                          </div>
                        )}
                        
                        {/* OR divider */}
                        <div className="flex items-center mb-6">
                          <div className={`flex-grow h-0.5 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
                          <span className={`px-4 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Or choose from gallery</span>
                          <div className={`flex-grow h-0.5 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
                        </div>
                        
                        {/* Preloaded avatar options */}
                        <div className="grid grid-cols-3 gap-4 max-h-[150px] overflow-y-auto p-1">
                          {avatarOptions.map((avatar, index) => (
                            <button
                              key={index}
                              onClick={() => handleSelectAvatar(avatar)}
                              disabled={isUploading}
                              className="relative aspect-square rounded-lg overflow-hidden border-2 hover:border-indigo-500 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                              <Image
                                src={avatar}
                                alt={`Avatar option ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Account quick actions */}
              <div className={`grid grid-cols-2 gap-2 p-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'} transition-colors duration-300`}>
                <Link
                  href="/dashboard"
               
                  className={`flex flex-col items-center justify-center p-3 rounded-lg ${
                    isDarkMode
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  } transition-colors duration-300`}
                >
                  <IconDashboard />
                  <span className="text-xs mt-1">Dashboard</span>
                </Link>
                
                <Link
                  href="/profile"
                  onClick={onClose}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg ${
                    isDarkMode
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  } transition-colors duration-300`}
                >
                  <IconProfile />
                  <span className="text-xs mt-1">Profile</span>
                </Link>
                
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg ${
                    isDarkMode
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  } transition-colors duration-300`}
                >
                  <IconSettings />
                  <span className="text-xs mt-1">Settings</span>
                </button>
                
                <Link
                  href="/library"
                  onClick={onClose}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg ${
                    isDarkMode
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  } transition-colors duration-300`}
                >
                  <IconLibrary />
                  <span className="text-xs mt-1">Library</span>
                </Link>
              </div>
              
              {/* Dark mode toggle */}
              <div className={`p-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'} transition-colors duration-300`}>
                <button
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg ${
                    isDarkMode
                      ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                      : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                  } transition-colors duration-300`}
                  onClick={toggleDarkMode}
                >
                  <span className="flex items-center gap-2 font-medium">
                    {isDarkMode ? (
                      <>
                        <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        Light Mode
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                        Dark Mode
                      </>
                    )}
                  </span>
                  <div className={`relative w-12 h-6 rounded-full transition-colors ${
                    isDarkMode ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transform transition-transform ${
                      isDarkMode ? 'translate-x-7' : 'translate-x-1'
                    }`}></div>
                  </div>
                </button>
              </div>
              
              {/* Activity Overview */}
              <div className={`p-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                <h3 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Activity Overview
                </h3>
                <Link
                  href="/library/stats"
                  onClick={onClose}
                  className={`flex items-center justify-between p-3 rounded-lg mb-2 ${
                    isDarkMode
                      ? 'bg-slate-800 hover:bg-slate-700'
                      : 'bg-slate-50 hover:bg-slate-100'
                  } transition-colors duration-300`}
                >
                <div className="flex items-center">
                    <span className={`text-${isDarkMode ? 'indigo-400' : 'indigo-600'} mr-3`}>
                      <IconAnalytics />
                    </span>
                    <div>
                      <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        Activity Stats
                      </span>
                      <span className={`block text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                        View your usage metrics
                      </span>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              
              {/* Menu Section - Your Account Pages */}
              <div className={`py-2 ${isDarkMode ? 'border-b border-slate-800' : 'border-b border-slate-100'} transition-colors duration-300`}>
                <div className="px-4 py-1">
                  <h3 className={`text-xs font-semibold ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  } uppercase tracking-wider transition-colors duration-300`}>
                    Your Account
                  </h3>
                </div>
                
                <Link
                  href="/dashboard"
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-2 text-sm font-medium ${
                    isDarkMode
                      ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-indigo-700'
                  } transition-colors duration-300`}
                >
                  <span className={isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}>
                    <IconDashboard />
                  </span>
                  <span>My Dashboard</span>
                </Link>
                
                <Link
                  href="/profile"
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-2 text-sm font-medium ${
                    isDarkMode
                      ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-indigo-700'
                  } transition-colors duration-300`}
                >
                  <span className={isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}>
                    <IconProfile />
                  </span>
                  <span>My Profile</span>
                </Link>
                
                <Link
                  href="/library?tab=sources"
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-2 text-sm font-medium ${
                    isDarkMode
                      ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-indigo-700'
                  } transition-colors duration-300`}
                >
                  <span className={isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}>
                    <IconLibrary />
                  </span>
                  <span>Library Dashboard</span>
                </Link>
                
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-left ${
                    isDarkMode
                      ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-indigo-700'
                  } transition-colors duration-300`}
                >
                  <span className={isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}>
                    <IconSettings />
                  </span>
                  <span>Account Settings</span>
                </button>
                
                <Link
                  href="/help"
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-2 text-sm font-medium ${
                    isDarkMode
                      ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-indigo-700'
                  } transition-colors duration-300`}
                >
                  <span className={isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}>
                    <IconHelp />
                  </span>
                  <span>Help & Support</span>
                </Link>
              </div>
              
              {/* Push sign out to the bottom with flex spacer */}
              <div className="flex-grow"></div>
              
              {/* Sign out section */}
              <div className={`p-4 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'} border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                <button 
                  onClick={handleSignOut}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg ${
                    isDarkMode
                      ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  } transition-colors duration-300`}
                >
                  <IconSignOut />
                  <span>Sign Out</span>
                </button>
                
                <div className={`mt-4 text-xs text-center ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span>SourceLens</span>
                    <span className={`px-2 py-0.5 rounded ${isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-600'}`}>
                      v1.0.0
                    </span>
                  </div>
                  <p>© 2025 Benjamin Breen. All rights reserved.</p>
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

