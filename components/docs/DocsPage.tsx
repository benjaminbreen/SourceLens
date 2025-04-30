// components/docs/DocsPage.tsx
// Client component for displaying documentation with improved UI and styling

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import DocsSidebar from '@/components/docs/DocsSidebar';
import DocsBreadcrumb from '@/components/docs/DocsBreadcrumb';
import DocsContent from '@/components/docs/DocsContent';

interface DocsPageProps {
  initialDoc: any;
  initialSlug: string;
}

export default function DocsPage({ initialDoc, initialSlug }: DocsPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeDoc, setActiveDoc] = useState(initialDoc);
  const [activeSlug, setActiveSlug] = useState(initialSlug);
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ title: string; path: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Update active slug when URL changes
  useEffect(() => {
    const slug = searchParams?.get('slug') ?? initialSlug;
    setActiveSlug(slug);
    setActiveDoc(initialDoc);
    
    // Generate breadcrumbs from the path
    const pathSegments = slug.split('/');
    const breadcrumbItems = pathSegments.map((segment, index) => {
      const path = `/docs?slug=${pathSegments.slice(0, index + 1).join('/')}`;
      return {
        title: segment.replace(/-/g, ' '),
        path
      };
    });
    
    setBreadcrumbs([{ title: 'Docs', path: '/docs' }, ...breadcrumbItems]);
  }, [searchParams, initialDoc, initialSlug]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-slate-900 flex items-center group">
                SourceLens
                <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full ml-2 font-normal group-hover:bg-indigo-200 transition-colors">
                  Docs
                </span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <input
                  type="text"
                  placeholder="Search docs..."
                  className="w-64 pl-10 pr-4 py-2 text-sm bg-slate-100 border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all focus:bg-white"
                />
                <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              <Link 
                href="/docs?slug=api-reference" 
                className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
              >
                API Reference
              </Link>
              
              <Link 
                href="/" 
                className="text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors shadow-sm hover:shadow"
              >
                Back to App
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-1/4 lg:w-1/5 md:block">
            <DocsSidebar activeSlug={activeSlug} />
          </div>
          
          {/* Main content area */}
          <div className="md:w-3/4 lg:w-4/5">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
              </div>
            ) : activeDoc ? (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <DocsBreadcrumb items={breadcrumbs} />
                <DocsContent doc={activeDoc} />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
                <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <h2 className="text-2xl font-bold text-slate-700 mb-2">Documentation not found</h2>
                <p className="text-slate-600 mb-6">The requested document couldn't be found.</p>
                <Link 
                  href="/docs?slug=getting-started/introduction" 
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors inline-block"
                >
                  Go to Introduction
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}