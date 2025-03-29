// components/ui/AnalyzeSourceButton.tsx
// Enhanced analyze source button with improved UX and guidance for new users
// Replaces the individual analysis method buttons with a more prominent primary action

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';

interface AnalyzeSourceButtonProps {
  formValid: boolean;
  textInput: string;
  metadata: any;
}

export default function AnalyzeSourceButton({ formValid, textInput, metadata }: AnalyzeSourceButtonProps) {
  const router = useRouter();
  const { 
    setSourceContent, 
    setMetadata, 
    setLoading, 
    setActivePanel,
  } = useAppStore();

  const handleAnalyze = () => {
    if (!formValid) return;
    
    setSourceContent(textInput);
    setMetadata(metadata);
    setLoading(true);
    
    // Default to detailed analysis panel
    setActivePanel('analysis');
    router.push('/analysis');
  };

  return (
    <div className="space-y-6">
      {/* Main Analyze Button */}
 <button 
  onClick={handleAnalyze} 
  disabled={!formValid} 
  className={`
    w-full 
    py-2.5 
    px-4 
    rounded-md 
    font-medium 
    text-white 
    transition-colors 
    duration-300
    ${formValid 
      ? 'bg-amber-700 hover:bg-amber-800 shadow-md' 
      : 'bg-slate-400 cursor-not-allowed'
    }
  `}
  style={{ height: '48px' }}  // Fixed height prevents layout shifts
> 
  <span className="flex items-center justify-center">
    {formValid ? (
      <>
        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        Analyze Source
      </>
    ) : (
      'Complete Required Fields'
    )}
  </span>
</button>

      {/* User Guidance Section */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 shadow-sm">
        <h3 className="text-slate-700 font-medium mb-2 flex items-center text-sm">
          <svg className="w-4 h-4 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          What happens next?
        </h3>
        <p className="text-slate-600 text-sm mb-3">
          After analysis, you'll be able to explore your source through multiple perspectives:
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-start">
            <div className="rounded-full bg-blue-100 p-1.5 mr-2 text-blue-600">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <span className="block text-xs font-medium text-slate-700">Detailed Analysis</span>
              <span className="block text-xs text-slate-500">Expert breakdown of the text</span>
            </div>
          </div>
          <div className="flex items-start">
            <div className="rounded-full bg-emerald-100 p-1.5 mr-2 text-emerald-600">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M19 13l-4 4m0 0l-4-4m4 4V7" />
              </svg>
            </div>
            <div>
              <span className="block text-xs font-medium text-slate-700">Extract Info</span>
              <span className="block text-xs text-slate-500">Pull structured data points</span>
            </div>
          </div>
          <div className="flex items-start">
            <div className="rounded-full bg-amber-100 p-1.5 mr-2 text-amber-600">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <span className="block text-xs font-medium text-slate-700">Find References</span>
              <span className="block text-xs text-slate-500">Discover related sources</span>
            </div>
          </div>
          <div className="flex items-start">
            <div className="rounded-full bg-blue-100 p-1.5 mr-2 text-blue-600">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <div>
              <span className="block text-xs font-medium text-slate-700">Talk to Author</span>
              <span className="block text-xs text-slate-500">Simulation of conversation</span>
            </div>
          </div>
        </div>
      </div>

      
   
    </div>
  );
}