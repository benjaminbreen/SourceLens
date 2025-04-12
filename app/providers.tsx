// app/providers.tsx
// Providers wrapper component for the app
// Combines all context providers in the correct order

'use client'; // Providers using context generally need to be client components

import React, { ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth/authContext'; // <-- Import AuthProvider
import { LibraryProvider } from '@/lib/libraryContext';
import { LibraryStorageProvider } from '@/lib/libraryStorageProvider'; // <-- Import LibraryStorageProvider

export default function Providers({ children }: { children: ReactNode }) {
  return (
    // 1. AuthProvider is outermost as others depend on it
    <AuthProvider>
      {/* 2. LibraryProvider is inside AuthProvider */}
      <LibraryProvider>
        {/* 3. LibraryStorageProvider is inside both */}
        <LibraryStorageProvider>
          {children}
        </LibraryStorageProvider>
      </LibraryProvider>
    </AuthProvider>
  );
}