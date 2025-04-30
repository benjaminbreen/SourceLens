// components/docs/DocsSidebar.tsx
// Navigation sidebar for documentation
// Displays categories and links to documentation pages with improved UI and styling

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { docsNavigation } from '@/lib/docs-navigation';

interface DocsSidebarProps {
  activeSlug: string;
}

export default function DocsSidebar({ activeSlug }: DocsSidebarProps) {
  const router = useRouter();
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  
  // Determine which categories should be expanded based on the active slug
  useEffect(() => {
    // Find which category contains the active slug
    const newExpandedState = { ...expandedCategories };
    
    docsNavigation.forEach(category => {
      // Check if any item in this category or its children is active
      const hasActiveItem = category.items.some(item => 
        item.slug === activeSlug || 
        (item.children?.some(child => child.slug === activeSlug))
      );
      
      // If this category has the active item, expand it
      if (hasActiveItem) {
        newExpandedState[category.id] = true;
      }
    });
    
    setExpandedCategories(newExpandedState);
  }, [activeSlug]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const isActive = (slug: string) => {
    return activeSlug === slug;
  };

  return (
    <aside className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2 pb-12">
      <div className="space-y-2">
        {docsNavigation.map((category) => (
          <div key={category.id} className="mb-4">
            <button
              onClick={() => toggleCategory(category.id)}
              className="flex items-center justify-between w-full text-left mb-2 font-medium text-slate-900 p-2 hover:bg-slate-100/70 rounded-md transition-colors"
            >
              <span className="text-sm font-semibold tracking-wide uppercase">{category.title}</span>
              <svg
                className={`w-4 h-4 text-slate-600 transition-transform duration-200 ${
                  expandedCategories[category.id] ? 'transform rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                expandedCategories[category.id] ? 'max-h-96' : 'max-h-0'
              }`}
            >
              <ul className="ml-2 space-y-1 border-l border-slate-200 pl-4">
                {category.items.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/docs?slug=${item.slug}`}
                      className={`block py-1.5 px-2 text-sm rounded-md transition-colors ${
                        isActive(item.slug)
                          ? 'bg-indigo-50 text-indigo-600 font-medium'
                          : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-50'
                      }`}
                    >
                      {item.title}
                    </Link>
                    
                    {/* Child items */}
                    {item.children && expandedCategories[category.id] && (
                      <ul className="mt-1 ml-4 space-y-1 border-l border-slate-200 pl-2">
                        {item.children.map((child) => (
                          <li key={child.slug}>
                            <Link
                              href={`/docs?slug=${child.slug}`}
                              className={`block py-1 px-2 text-xs rounded-md transition-colors ${
                                isActive(child.slug)
                                  ? 'bg-indigo-50 text-indigo-600 font-medium'
                                  : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                              }`}
                            >
                              {child.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}