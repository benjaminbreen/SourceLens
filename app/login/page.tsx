// app/login/page.tsx
// Login page with clean UI and features for user authentication

import React from 'react';
import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-white flex flex-col">
      <header className="py-6 px-4 border-b border-slate-200 bg-white shadow-sm">
        <div className="container mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-indigo-900">SourceLens</span>
          </Link>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </main>
      
      <footer className="py-6 px-4 border-t border-slate-200 bg-white text-center text-slate-500 text-sm">
        <div className="container mx-auto">
          <p>© {new Date().getFullYear()} SourceLens. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}