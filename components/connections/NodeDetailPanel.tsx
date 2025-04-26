// components/connections/NodeDetailPanel.tsx
// Sliding panel that displays detailed information about selected connection nodes
// Provides options to expand connections and add notes

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface NodeDetailPanelProps {
  node: any;
  onClose: () => void;
  onExpand: (node: any) => Promise<void>;
onSaveNote: (note: { nodeId: string; note: string }) => void;
  isLoading: boolean;
  isDarkMode: boolean;
}

export default function NodeDetailPanel({ 
  node, 
  onClose, 
  onExpand,
  onSaveNote,
  isLoading
}: NodeDetailPanelProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [note, setNote] = useState('');
  const [expandLoading, setExpandLoading] = useState(false);
  
  // Show animation on mount
  useEffect(() => {
    // Small delay for animation
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle close with animation
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };
  
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);
  
  // Handle expand button
const handleExpand = async () => {
  if (expandLoading || isLoading) return;
  setExpandLoading(true);
  try {
    await onExpand(node);  // <-- This will trigger graph update from parent
  } catch (err) {
    console.error("Failed to expand connections:", err);
  } finally {
    setExpandLoading(false);
  }
};


  
  // Handle save note
  const handleSaveNote = () => {
    if (!note.trim()) return;
    
onSaveNote({ nodeId: node.id, note });
    setNote('');
  };
  
  // Get Wikipedia URL
  const getWikipediaUrl = () => {
    if (!node.wikipediaTitle) return '';
    
    const title = node.wikipediaTitle.replace(/\s+/g, '_');
    return `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`;
  };
  
  return (
    <div 
      className={`fixed top-0 right-0 bottom-0 w-full sm:w-96 md:w-[400px] bg-slate-900/95 border-l border-slate-700 shadow-xl backdrop-blur-md z-50 transform transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex justify-between items-center sticky top-0 z-10 bg-slate-900/95 backdrop-blur-md">
        <h3 className="text-xl font-medium text-white flex items-center">
          <span className="text-2xl mr-3">{node.emoji}</span>
          <span>{node.name}</span>
        </h3>
        <button 
          onClick={handleClose}
          className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close panel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Content */}
      <div className="p-4 overflow-auto max-h-[calc(100vh-60px)]">
        {/* Type and Relationship Badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-slate-800 text-slate-200 px-2 py-1 rounded-md text-xs font-medium uppercase">
            {node.type}
          </span>
          {node.relationship && (
            <span className={`px-2 py-1 rounded-md text-xs font-medium ${
              node.relationship === 'direct' 
                ? 'bg-indigo-900/70 text-indigo-200' 
                : 'bg-slate-800/70 text-slate-300'
            }`}>
              {node.relationship === 'direct' ? 'Directly mentioned' : 'Indirectly related'}
            </span>
          )}
        </div>
        
        {/* Metadata */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {node.year && (
            <div className="bg-slate-800/50 p-3 rounded-md">
              <div className="text-xs text-slate-400 mb-1">Year/Period</div>
              <div className="text-sm text-white">{node.year}</div>
            </div>
          )}
          
          {node.location && (
            <div className="bg-slate-800/50 p-3 rounded-md">
              <div className="text-xs text-slate-400 mb-1">Location</div>
              <div className="text-sm text-white">{node.location}</div>
            </div>
          )}
          
          {node.field && (
            <div className="bg-slate-800/50 p-3 rounded-md">
              <div className="text-xs text-slate-400 mb-1">Field</div>
              <div className="text-sm text-white">{node.field}</div>
            </div>
          )}
        </div>
        
        {/* Description */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-slate-300 mb-2">Description</h4>
          <div className="bg-slate-800/50 p-4 rounded-md text-sm text-slate-300 leading-relaxed">
            {node.description || 'No description available.'}
          </div>
        </div>
        
        {/* Wikipedia Link */}
        {node.wikipediaTitle && (
          <div className="mb-6">
            {/* Added the opening <a> tag */}
            <a
              href={getWikipediaUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-3 bg-slate-800/70 hover:bg-slate-800 transition-colors rounded-md text-indigo-300 hover:text-indigo-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span className="text-sm">Open Wikipedia Page</span>
            </a>
          </div>
        )}
        
        {/* Expand Connections */}
        <div className="mb-6">
          <button
            onClick={handleExpand}
            disabled={expandLoading || isLoading}
            className={`w-full p-3 rounded-md text-sm font-medium flex items-center justify-center ${
              expandLoading || isLoading
                ? 'bg-indigo-900/30 text-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            } transition-colors`}
          >
            {expandLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Expanding...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Expand Connections
              </>
            )}
          </button>
        </div>
        
        {/* Notes Section */}
        <div>
          <h4 className="text-sm font-medium text-slate-300 mb-2">Add Note</h4>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add your thoughts about this connection..."
            className="w-full h-24 p-3 bg-slate-800/50 border border-slate-700 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          ></textarea>
          <button
            onClick={handleSaveNote}
            disabled={!note.trim()}
            className={`mt-2 p-2 rounded-md text-sm font-medium ${
              !note.trim()
                ? 'bg-slate-800/70 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-700 hover:bg-emerald-600 text-white'
            } transition-colors`}
          >
            Save Note
          </button>
        </div>
      </div>
    </div>
  );
}