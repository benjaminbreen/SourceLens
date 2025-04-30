// components/docs/DocsBreadcrumb.tsx
// Breadcrumb navigation for documentation
// Shows the current location in the documentation hierarchy

import React from 'react';
import Link from 'next/link';

interface BreadcrumbItem {
  title: string;
  path: string;
}

interface DocsBreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function DocsBreadcrumb({ items }: DocsBreadcrumbProps) {
  return (
    <nav className="mb-6">
      <ol className="flex flex-wrap items-center text-sm">
        {items.map((item, index) => (
          <React.Fragment key={item.path}>
            <li>
              <Link
                href={item.path}
                className={`capitalize ${
                  index === items.length - 1
                    ? 'text-slate-600 cursor-default'
                    : 'text-indigo-600 hover:text-indigo-800'
                }`}
              >
                {item.title}
              </Link>
            </li>
            {index < items.length - 1 && (
              <li className="mx-2 text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </li>
            )}
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
}