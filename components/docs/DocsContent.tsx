// components/docs/DocsContent.tsx
// Component for rendering documentation content
// Supports markdown content with syntax highlighting and other enhancements

import React from 'react';
import { MDXRemote } from 'next-mdx-remote';
import Image from 'next/image';
import Link from 'next/link';

// Custom components for MDX
const components = {
  h1: ({ children }: any) => (
    <h1 className="text-3xl font-bold text-slate-900 mb-4">{children}</h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4" id={children?.toString().toLowerCase().replace(/\s+/g, '-')}>
      {children}
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-xl font-bold text-slate-900 mt-8 mb-3" id={children?.toString().toLowerCase().replace(/\s+/g, '-')}>
      {children}
    </h3>
  ),
  h4: ({ children }: any) => (
    <h4 className="text-lg font-bold text-slate-900 mt-6 mb-2">{children}</h4>
  ),
  p: ({ children }: any) => (
    <p className="mb-4 text-slate-700 leading-relaxed">{children}</p>
  ),
  a: ({ href, children }: any) => (
    <Link href={href} className="text-indigo-600 hover:text-indigo-800 underline">
      {children}
    </Link>
  ),
  ul: ({ children }: any) => (
    <ul className="list-disc pl-6 mb-6 text-slate-700 space-y-2">{children}</ul>
  ),
  ol: ({ children }: any) => (
    <ol className="list-decimal pl-6 mb-6 text-slate-700 space-y-2">{children}</ol>
  ),
  li: ({ children }: any) => (
    <li className="leading-relaxed">{children}</li>
  ),
  Screenshot: ({ src, alt, className }: any) => (
  <div className="my-6">
    <div className="relative w-full h-64 md:h-96">
      <Image
        src={`/screenshots/${src}`}
        alt={alt || 'Documentation screenshot'}
        className={`mx-auto shadow-md rounded-md border border-gray-300 ${className || ''}`}
        fill
        style={{ objectFit: 'contain' }}
      />
    </div>
    {alt && (
      <p className="mt-2 text-center text-sm text-gray-600 italic">
        {alt}
      </p>
    )}
  </div>
),
  blockquote: ({ children }: any) => (
    <blockquote className="pl-4 border-l-4 border-indigo-300 text-slate-600 italic my-6">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-8 border-slate-200" />,
  img: ({ src, alt, className }: any) => (
  <div className="my-6">
    <div className="relative w-full h-64 md:h-96">
      <Image
        src={src}
        alt={alt || 'Documentation image'}
        className={`mx-auto grayscale shadow-md rounded-md border border-gray-300 ${className || ''}`}
        fill
        style={{ objectFit: 'contain' }}
      />
    </div>
    {alt && (
      <p className="mt-2 text-center text-sm text-gray-600 italic">
        {alt}
      </p>
    )}
  </div>
),
 code: ({ className, children }: any) => {
  return (
    <code className="bg-slate-100 text-indigo-800 px-1.5 py-0.5 rounded font-mono text-sm">
      {children}
    </code>
  );
},
  table: ({ children }: any) => (
    <div className="my-6 overflow-x-auto">
      <table className="min-w-full border border-slate-200 rounded-md">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }: any) => (
    <thead className="bg-slate-100 border-b border-slate-200">{children}</thead>
  ),
  tbody: ({ children }: any) => <tbody>{children}</tbody>,
  tr: ({ children }: any) => (
    <tr className="border-b border-slate-200 last:border-0">{children}</tr>
  ),
  th: ({ children }: any) => (
    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
      {children}
    </th>
  ),
  td: ({ children }: any) => (
    <td className="px-4 py-3 text-sm text-slate-700">{children}</td>
  ),
  // Custom components for specialized documentation elements
  Info: ({ children }: any) => (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6 rounded-r-md">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 text-blue-700">{children}</div>
      </div>
    </div>
  ),
  Warning: ({ children }: any) => (
    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 my-6 rounded-r-md">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 text-amber-700">{children}</div>
      </div>
    </div>
  ),
  CodeBlock: ({ title, children }: any) => (
  <div className="my-6 overflow-hidden rounded-md shadow-sm border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-800 whitespace-pre-wrap">
    {title && (
      <div className="mb-2 font-semibold text-slate-600">{title}</div>
    )}
    <pre>{children}</pre>
  </div>
),
};

interface Doc {
  title: string;
  content: any; // MDX content
  lastUpdated: string;
}

interface DocsContentProps {
  doc: Doc;
}

export default function DocsContent({ doc }: DocsContentProps) {
  if (!doc) return null;

  return (
    <article className="max-w-3xl mx-auto">
      <header className="mb-8 pb-4 border-b border-slate-200">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{doc.title}</h1>
        <p className="text-sm text-slate-500">
          Last updated: {doc.lastUpdated}
        </p>
      </header>
      
      <div className="prose max-w-none">
        <MDXRemote {...doc.content} components={components} />
      </div>
      
      <div className="mt-12 pt-6 border-t border-slate-200">
        <div className="flex justify-between items-center">
          <a href="#" className="text-indigo-600 hover:text-indigo-800 inline-flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
            Previous
          </a>
          <a href="#" className="text-indigo-600 hover:text-indigo-800 inline-flex items-center">
            Next
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
}