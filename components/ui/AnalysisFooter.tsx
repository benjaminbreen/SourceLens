// components/AnalysisFooter.tsx
// Responsive footer section with a 3-column grid of analysis option buttons
// Matches the clean aesthetic from the reference design

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { useEffect } from 'react';

interface AnalysisFooterProps {
  formValid: boolean;
  textInput: string;
  metadata: any;
}

export default function AnalysisFooter({ formValid, textInput, metadata }: AnalysisFooterProps) {
  const router = useRouter();
  const { 
    setSourceContent, 
    setMetadata, 
    setLoading, 
    setActivePanel,
    setRoleplayMode
  } = useAppStore();

  // NEW: Add this useEffect hook
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && formValid) {
        event.preventDefault(); // Prevent default Enter key behavior
        navigateToMethod('analysis');
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [formValid]); // Depend on formValid to ensure the listener updates


  // Method navigation handlers
  const navigateToMethod = (panel: 'analysis' | 'detailed-analysis' | 'extract-info' | 'references' | 'roleplay' | 'counter' | 'highlight') => {
    if (!formValid) return;
    
    setSourceContent(textInput);
    setMetadata(metadata);
    setLoading(true);
    
    // Set the appropriate panel active
    setActivePanel(panel);
    
    // Handle roleplay mode specifically
    if (panel === 'roleplay') {
      setRoleplayMode(true);
    }
    
    router.push('/analysis');
  };



  return (
    <div className="mt-0 z-1 mb-3">
      {/* Responsive grid layout - side by side on md+ screens, stacked on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2  gap-4">
        {/* Left side - analyze button */}
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-slate-200 p-5">
          <div className="space-y-2"> 
            <h3 className="text-slate-800 text-xl font-semibold flex items-center text-base">
              <svg className="w-5 h-5 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              3. Start exploring 
            </h3>
            <p className="text-slate-700 font-medium text-sm mb-4">
              Drag and drop a PDF or insert text, enter metadata, then click below. 
            </p>
            
            {/* Main Analyze Button */}
        <button 
  onClick={() => navigateToMethod('analysis')} 
  disabled={!formValid} 
  className={`
    w-full 
    py-4 
    px-5 
    rounded-lg 
    text-white 
    font-semibold 
    text-base 
    transition-all 
    duration-300 

    z-1
    ease-in-out
    ${formValid 
      ? 'bg-amber-600  hover:brightness-130 hover:shadow-xl  hover:scale-[1.015] active:brightness-99 shadow-lg ' 
      : 'bg-slate-400 cursor-not-allowed'
    }
  `}
>
  <span className="flex items-center justify-center ">
    <svg 
      className={`w-5 h-5 mr-2 flex-shrink-0 transition-opacity duration-600 ${
        formValid ? 'opacity-100' : 'opacity-90'
      }`}
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
      />
    </svg>
    <span>
      {formValid ? 'Analyze Source' : 'Complete Required Fields to Start'}
    </span>
  </span>
</button>



            
          </div>
        </div>
        
       {/* Right side - what happens next info panel */}
       <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-slate-200 p-4">
         <p className="text-slate-600 font-semibold text-sm mb-5">
           Or if you already know what Lens you want, select it here:
         </p>

         {/* Container panel for button grid */}

           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
             {/* Detailed Analysis */}
             <button 
               onClick={() => navigateToMethod('detailed-analysis')}
               disabled={!formValid}
               className="p-1 b hover:bg-slate-200/50 rounded-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-start text-left"
             >
               <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                 <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                 </svg>
               </div>
               <div>
                 <div className="text-sm font-medium ">Detailed Analysis</div>
                 <div className="text-xs text-slate-700">Close read the text</div>
               </div>
             </button>

             {/* Extract Info */}
             <button 
               onClick={() => navigateToMethod('extract-info')}
               disabled={!formValid}
               className="p-1 rounded-lg   hover:bg-slate-200/50 transition-all  transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-start text-left"
             >
               <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
                 <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M19 13l-4 4m0 0l-4-4m4 4V7" />
                 </svg>
               </div>
               <div>
                 <div className="text-sm font-medium ">Extract Info</div>
                 <div className="text-xs text-slate-700">Pull structured data</div>
               </div>
             </button>

             {/* Find References */}
             <button 
               onClick={() => navigateToMethod('references')}
               disabled={!formValid}
               className="p-1 rounded-lg   hover:bg-slate-200/50 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-start text-left"
             >
               <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mr-2">
                 <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                 </svg>
               </div>
               <div>
                 <div className="text-sm font-medium">Find References</div>
                 <div className="text-xs text-slate-700">Discover sources</div>
               </div>
             </button>

             {/* Talk to Author */}
             <button 
               onClick={() => navigateToMethod('roleplay')}
               disabled={!formValid}
               className="p-1 rounded-lg   hover:bg-slate-200/50 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-start text-left"
             >
               <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                 <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                 </svg>
               </div>
               <div>
                 <div className="text-sm font-medium ">Simulation mode</div>
                 <div className="text-xs text-slate-700">Talk to the author</div>
               </div>
             </button>

             {/* Counter-Narrative */}
             <button 
               onClick={() => navigateToMethod('counter')}
               disabled={!formValid}
               className="p-1 rounded-lg   hover:bg-slate-200/50 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-start text-left"
             >
               <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                 <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m-4 6H4m0 0l4 4m-4-4l4-4" />
                 </svg>
               </div>
               <div>
                 <div className="text-sm font-medium">Counter-Narrative</div>
                 <div className="text-xs text-slate-700">Read against the grain</div>
               </div>
             </button>

             {/* Highlight Text */}
             <button 
               onClick={() => navigateToMethod('highlight')}
               disabled={!formValid}
               className="p-1 rounded-lg   hover:bg-slate-200/50 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-start text-left"
             >
               <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center mr-2">
                 <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                 </svg>
               </div>
               <div>
                 <div className="text-sm font-medium">Highlight Text</div>
                 <div className="text-xs text-slate-700">Find important passages</div>
               </div>
             </button>
           </div>
      
     

         
        </div>
      </div>
    </div>
  );
}