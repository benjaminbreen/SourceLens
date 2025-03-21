// app/providers.tsx
// Providers wrapper component for the app
// Combines all context providers in one place

'use client';

import React, { ReactNode } from 'react';
import { LibraryProvider } from '@/lib/libraryContext';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <LibraryProvider>
      {children}
    </LibraryProvider>
  );
}