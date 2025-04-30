// app/docs/page.tsx
// A documentation page component with dynamic content loading based on URL parameters
// Features a responsive layout with sidebar navigation, breadcrumbs, and content area

import { Suspense } from 'react';
import DocsClientPage from './DocsClientPage';

export default function DocsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    }>
      <DocsClientPage />
    </Suspense>
  );
}
