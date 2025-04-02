// components/ui/DocumentThumbnail.tsx
// Small circular thumbnail badge that displays when a document image is available
// Shows next to metadata heading to provide visual feedback of successful image detection

'use client';

import React from 'react';
import Image from 'next/image';
import { useAppStore } from '@/lib/store';

interface DocumentThumbnailProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function DocumentThumbnail({ 
  size = 'md',
  className = ''
}: DocumentThumbnailProps) {
  const { sourceThumbnailUrl } = useAppStore();
  
  if (!sourceThumbnailUrl) return null;
  
  // Size mapping
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };
  
  return (
    <div 
      className={`relative overflow-hidden rounded-full border-2 border-amber-200 shadow-sm ${sizeMap[size]} ${className}`}
      title="Document thumbnail"
    >
      <Image 
        src={sourceThumbnailUrl}
        alt="Document preview"
        fill
        className="object-cover"
      />
      <div className="absolute inset-0 shadow-inner ring-1 ring-inset ring-white/10"></div>
    </div>
  );
}