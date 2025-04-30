'use client';

import type { DocData } from '@/lib/docs';
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getDocBySlug } from '@/lib/docs';
import DocsBreadcrumb from '@/components/docs/DocsBreadcrumb';
import DocsSidebar from '@/components/docs/DocsSidebar';
import DocsContent from '@/components/docs/DocsContent';
import Link from 'next/link';

interface BreadcrumbItem {
  title: string;
  path: string;
}

export default function DocsClientPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeDoc, setActiveDoc] = useState<DocData | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDoc = async () => {
      const slug = searchParams!.get('slug') || 'getting-started/introduction';
      setIsLoading(true);

      try {
        const docData = await getDocBySlug(slug);
        if (docData) {
          setActiveDoc(docData);

          const pathSegments = slug.split('/');
          const breadcrumbItems = pathSegments.map((segment, index) => ({
            title: segment.replace(/-/g, ' '),
            path: `/docs?slug=${pathSegments.slice(0, index + 1).join('/')}`
          }));

          setBreadcrumbs([{ title: 'Docs', path: '/docs' }, ...breadcrumbItems]);
        } else {
          setActiveDoc(null);
        }
      } catch (err) {
        console.error('Failed to load doc:', err);
        setActiveDoc(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoc();
  }, [searchParams]);

const currentSlug = searchParams!.get('slug') || 'getting-started/introduction';

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-bold text-slate-900 flex items-center">
              SourceLens
              <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded ml-2 font-normal">Docs</span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search docs..."
                  className="w-64 pl-10 pr-4 py-2 text-sm bg-slate-100 border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
                <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <Link href="/docs?slug=api-reference" className="text-sm font-medium text-slate-600 hover:text-indigo-600">Placeholder</Link>
              <Link href="/" className="text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">Back to App</Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/4 lg:w-1/5">
            <DocsSidebar activeSlug={currentSlug} />
          </div>

          <div className="md:w-3/4 lg:w-4/5">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
              </div>
            ) : activeDoc ? (
              <>
                <DocsBreadcrumb items={breadcrumbs} />
                <DocsContent doc={activeDoc} />
              </>
            ) : (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-slate-700 mb-2">Documentation not found</h2>
                <p className="text-slate-600">The requested document couldn't be found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
