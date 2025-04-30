// components/home/HomePageClient.tsx
'use client';

import { Suspense, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the heavy HomeContent component with no loading component
const HomeContent = dynamic(
  () => import('@/components/home/HomeContent'),
  { ssr: false }
);

export default function HomePageClient() {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    // Set a short timeout to allow for a smooth fade-in
    const timer = setTimeout(() => {
      setVisible(true);
    }, 180);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div 
      className={`transition-opacity duration-700 ease-in-out ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <HomeContent />
    </div>
  );
}