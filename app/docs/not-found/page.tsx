// app/docs/not-found/page.tsx
// Documentation "Not Found" page
// Displayed when a requested documentation page doesn't exist

'use client';

import React from 'react';
import Link from 'next/link';

export default function DocsNotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-slate-900 flex items-center">
                SourceLens
                <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded ml-2 font-normal">
                  Docs
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-lg w-full text-center px-4">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">404</h1>
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Documentation page not found</h2>
          <p className="text-slate-600 mb-8">
            The documentation page you are looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/docs/getting-started/introduction" 
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Go to Introduction
            </Link>
            <Link 
              href="/docs" 
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors"
            >
              Browse Documentation
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}