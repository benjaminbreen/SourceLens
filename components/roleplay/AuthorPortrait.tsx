// components/roleplay/AuthorPortrait.tsx
// Component to display author portrait or placeholder avatar
// Supports displaying predefined portraits for known authors or generates placeholder

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAppStore } from '@/lib/store';

// Map of known authors to their portrait images
// Add more authors as needed with their corresponding image paths
const AUTHOR_PORTRAITS: Record<string, string> = {
  'Abraham Lincoln': '/portraits/lincoln.jpg',
  'William Shakespeare': '/portraits/shakespeare.jpg',
  'Jane Austen': '/portraits/austen.jpg',
  'Martin Luther King Jr.': '/portraits/mlk.jpg',
  // Add more authors as needed
};

export default function AuthorPortrait() {
  const { metadata } = useAppStore();
  const [portraitError, setPortraitError] = useState(false);
  
  // Reset error state when metadata changes
  useEffect(() => {
    setPortraitError(false);
  }, [metadata?.author]);
  
  if (!metadata?.author) {
    return (
      <div className="w-full aspect-square bg-slate-100 rounded-lg flex flex-col items-center justify-center">
        <div className="text-4xl mb-2">👤</div>
        <p className="text-sm text-slate-500">No author data</p>
      </div>
    );
  }
  
  // Get author initials for fallback
  const getInitials = () => {
    return metadata.author
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  // Check if we have a portrait for this author
  const hasPortrait = !portraitError && AUTHOR_PORTRAITS[metadata.author];
  
  // Generate a deterministic color based on author name
  const generateBackgroundColor = () => {
    let hash = 0;
    for (let i = 0; i < metadata.author.length; i++) {
      hash = metadata.author.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Use a palette of muted historical colors
    const palette = [
      'bg-amber-100 text-amber-800',
      'bg-emerald-100 text-emerald-800',
      'bg-blue-100 text-blue-800',
      'bg-rose-100 text-rose-800',
      'bg-slate-100 text-slate-800',
      'bg-purple-100 text-purple-800',
      'bg-teal-100 text-teal-800',
      'bg-orange-100 text-orange-800',
    ];
    
    return palette[Math.abs(hash) % palette.length];
  };
  
  const colorClasses = generateBackgroundColor();
  
  return (
    <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-sm border border-slate-200">
      {hasPortrait ? (
        <Image
          src={AUTHOR_PORTRAITS[metadata.author]}
          alt={`Portrait of ${metadata.author}`}
          fill
          className="object-cover"
          onError={() => setPortraitError(true)}
        />
      ) : (
        <div className={`w-full h-full ${colorClasses} flex flex-col items-center justify-center`}>
          <div className="text-5xl font-serif mb-2">{getInitials()}</div>
          <p className="text-sm font-medium">{metadata.author}</p>
          <p className="text-xs opacity-75">{metadata.date}</p>
        </div>
      )}
    </div>
  );
}