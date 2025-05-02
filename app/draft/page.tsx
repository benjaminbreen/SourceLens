'use client';
import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DraftClientLayout from './DraftClientLayout';
import { useAppStore } from '@/lib/store';

// Create a component that uses the search params
function DraftContent() {
  const searchParams = useSearchParams();
  const setActiveDraftId = useAppStore(state => state.setActiveDraftId);
  
  useEffect(() => {
const draftId = searchParams!.get('id');
    if (draftId) {
      setActiveDraftId(draftId);
    }
  }, [searchParams, setActiveDraftId]);

  return <DraftClientLayout />;
}

// Main component with Suspense boundary
export default function DraftPage() {
  const isDarkMode = useAppStore(state => state.isDarkMode);
  
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-slate-900 to-slate-800' : 'bg-gradient-to-b from-slate-50 to-slate-100'}`}>
      <Suspense fallback={<div>Loading...</div>}>
        <DraftContent />
      </Suspense>
    </div>
  );
}

export const dynamic = 'force-dynamic';