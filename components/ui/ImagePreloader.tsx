// components/ui/ImagePreloader.tsx
'use client';

import { useEffect, useState } from 'react';

interface ImagePreloaderProps {
  imagePaths: string[];
  onComplete?: () => void;
}

export default function ImagePreloader({ imagePaths, onComplete }: ImagePreloaderProps) {
  const [loadedCount, setLoadedCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Skip if no images to preload
    if (!imagePaths.length) {
      setIsComplete(true);
      onComplete?.();
      return;
    }

    // Create image objects to trigger loading
    const images = imagePaths.map(path => {
      const img = new Image();
      
      img.onload = () => {
        setLoadedCount(prev => {
          const newCount = prev + 1;
          if (newCount === imagePaths.length) {
            setIsComplete(true);
            onComplete?.();
          }
          return newCount;
        });
      };
      
      img.onerror = () => {
        // Count errors as loaded to avoid getting stuck
        setLoadedCount(prev => {
          const newCount = prev + 1;
          if (newCount === imagePaths.length) {
            setIsComplete(true);
            onComplete?.();
          }
          return newCount;
        });
        console.warn(`Failed to preload image: ${path}`);
      };
      
      img.src = path;
      return img;
    });

    // Cleanup
    return () => {
      images.forEach(img => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, [imagePaths, onComplete]);

  // This component doesn't render anything visible
  return null;
}