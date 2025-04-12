// components/auth/SettingsModal.tsx
// Settings modal with app configuration options
// Handles appearance, notifications, and other user preferences

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '@supabase/supabase-js';
import { useAppStore } from '@/lib/store';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export default function SettingsModal({ isOpen, onClose, user }: SettingsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const { isDarkMode, toggleDarkMode } = useAppStore();
  
  // Settings state
  const [fontSize, setFontSize] = useState<number>(16);
  const [notifications, setNotifications] = useState<boolean>(true);
  const [citationStyle, setCitationStyle] = useState<string>("chicago");
  const [defaultModel, setDefaultModel] = useState<string>("gpt-4o-mini");
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  
  // Get font size from store if available
  useEffect(() => {
    // Initialize font size from localStorage if available
    const savedFontSize = localStorage.getItem('sourceLens_fontSize');
    if (savedFontSize) {
      setFontSize(parseInt(savedFontSize, 10));
    }
    
    // Initialize notification preference from localStorage if available
    const savedNotifications = localStorage.getItem('sourceLens_notifications');
    if (savedNotifications !== null) {
      setNotifications(savedNotifications === 'true');
    }
    
    // Initialize citation style from localStorage if available
    const savedCitationStyle = localStorage.getItem('sourceLens_citationStyle');
    if (savedCitationStyle) {
      setCitationStyle(savedCitationStyle);
    }
    
    // Initialize default model from localStorage if available
    const savedDefaultModel = localStorage.getItem('sourceLens_defaultModel');
    if (savedDefaultModel) {
      setDefaultModel(savedDefaultModel);
    }
  }, []);
  
  // Close the modal when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    // Close the modal when pressing Escape
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
  
  // Save settings
  const handleSaveSettings = () => {
    // Save font size to localStorage
    localStorage.setItem('sourceLens_fontSize', fontSize.toString());
    
    // Save notification preference to localStorage
    localStorage.setItem('sourceLens_notifications', notifications.toString());
    
    // Save citation style to localStorage
    localStorage.setItem('sourceLens_citationStyle', citationStyle);
    
    // Save default model to localStorage
    localStorage.setItem('sourceLens_defaultModel', defaultModel);
    
    // Show success message
    setSaveSuccess(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };
  
  // Reset settings to defaults
  const handleResetSettings = () => {
    setFontSize(16);
    setNotifications(true);
    setCitationStyle("chicago");
    setDefaultModel("gpt-4o-mini");
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={onClose}
          />
          
          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="w-full max-w-lg rounded-xl bg-white/98 backdrop-blur-md p-0 shadow-2xl"
            >
              {/* Gradient line at top */}
              <div className="h-2 w-full bg-gradient-to-r from-amber-400 via-purple-400 to-indigo-400 rounded-t-xl"></div>
              
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-slate-800">Settings</h2>
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
                
                {/* Success message */}
                {saveSuccess && (
                  <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Settings saved successfully!
                  </div>
                )}
                
                {/* Settings form */}
                <div className="space-y-6">
                  {/* Appearance section */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                      Appearance
                    </h3>
                    
                    {/* Dark mode toggle */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <label className="font-medium text-slate-800">Dark Mode</label>
                        <p className="text-sm text-slate-500">Switch between light and dark theme</p>
                      </div>
                      <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full bg-slate-200">
                        <label
                          className={`absolute left-0 top-0 w-6 h-6 rounded-full transition-transform duration-200 ease-in-out transform ${
                            isDarkMode ? 'translate-x-6 bg-indigo-600' : 'translate-x-0 bg-white'
                          } shadow-md cursor-pointer`}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={isDarkMode}
                            onChange={toggleDarkMode}
                          />
                        </label>
                      </div>
                    </div>
                    
                    {/* Font size */}
                    <div className="mb-4">
                      <label className="font-medium text-slate-800 block mb-1">
                        Font Size: {fontSize}px
                      </label>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">A</span>
                        <input
                          type="range"
                          min="12"
                          max="24"
                          value={fontSize}
                          onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                          className="flex-1 h-2 appearance-none bg-slate-200 rounded-full"
                        />
                        <span className="text-lg">A</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Analysis Settings */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                      Analysis Settings
                    </h3>
                    
                    {/* Default LLM Model */}
                    <div className="mb-4">
                      <label className="font-medium text-slate-800 block mb-1">
                        Default LLM Model
                      </label>
                      <select
                        value={defaultModel}
                        onChange={(e) => setDefaultModel(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <optgroup label="OpenAI">
                          <option value="gpt-4o-mini">GPT-4o Mini</option>
                          <option value="gpt-4o">GPT-4o</option>
                          <option value="gpt-4.5-preview">GPT-4.5 Preview</option>
                        </optgroup>
                        <optgroup label="Anthropic">
                          <option value="claude-haiku">Claude 3.5 Haiku</option>
                          <option value="claude-sonnet">Claude 3.7 Sonnet</option>
                        </optgroup>
                        <optgroup label="Google">
                          <option value="gemini-flash">Gemini 2.0 Flash</option>
                          <option value="gemini-flash-lite">Gemini 2.0 Flash Lite</option>
                        </optgroup>
                      </select>
                      <p className="text-xs text-slate-500 mt-1">
                        This model will be used by default for new analyses
                      </p>
                    </div>
                    
                    {/* Citation Style */}
                    <div className="mb-4">
                      <label className="font-medium text-slate-800 block mb-1">
                        Citation Style
                      </label>
                      <select
                        value={citationStyle}
                        onChange={(e) => setCitationStyle(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="chicago">Chicago</option>
                        <option value="mla">MLA</option>
                        <option value="apa">APA</option>
                       <option value="harvard">Harvard</option>
                        <option value="turabian">Turabian</option>
                        <option value="ieee">IEEE</option>
                      </select>
                      <p className="text-xs text-slate-500 mt-1">
                        Default format for references and citations
                      </p>
                    </div>
                  </div>
                  
                  {/* Notifications */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                      Notifications
                    </h3>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <label className="font-medium text-slate-800">Enable Notifications</label>
                        <p className="text-sm text-slate-500">Receive updates on library items</p>
                      </div>
                      <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full bg-slate-200">
                        <label
                          className={`absolute left-0 top-0 w-6 h-6 rounded-full transition-transform duration-200 ease-in-out transform ${
                            notifications ? 'translate-x-6 bg-indigo-600' : 'translate-x-0 bg-white'
                          } shadow-md cursor-pointer`}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={notifications}
                            onChange={() => setNotifications(!notifications)}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Account Information (Read-only) */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                      Account Information
                    </h3>
                    
                    <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                      <div>
                        <label className="text-xs text-slate-500">Email</label>
                        <p className="font-medium text-slate-800">{user.email}</p>
                      </div>
                      
                      <div>
                        <label className="text-xs text-slate-500">Account ID</label>
                        <p className="font-mono text-sm text-slate-800 truncate">{user.id}</p>
                      </div>
                      
                      <div>
                        <label className="text-xs text-slate-500">Last Login</label>
                        <p className="text-sm text-slate-800">
                          {user.last_sign_in_at 
                            ? new Date(user.last_sign_in_at).toLocaleString() 
                            : 'Not available'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Buttons */}
                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    onClick={handleResetSettings}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors"
                  >
                    Reset to Defaults
                  </button>
                  <button
                    onClick={handleSaveSettings}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}