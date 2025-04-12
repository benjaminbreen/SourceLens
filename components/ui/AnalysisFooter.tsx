// components/ui/AnalysisFooter.tsx
// Footer section to initiate analysis, offering default and specific Lens options.

'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore, Metadata } from '@/lib/store'; // Assuming Metadata type is exported from store

interface AnalysisFooterProps {
  formValid: boolean;
  textInput: string; // Needed to set source content
  metadata: Metadata; // Pass the full metadata object
}

// Define the possible panel types
type AnalysisPanel = 'analysis' | 'detailed-analysis' | 'extract-info' | 'references' | 'roleplay' | 'counter' | 'highlight';

export default function AnalysisFooter({ formValid, textInput, metadata }: AnalysisFooterProps) {
  const router = useRouter();
  const {
    setSourceContent,
    setMetadata: setGlobalMetadata, // Rename to avoid conflict
    setLoading,
    setActivePanel,
    setRoleplayMode,
    // Add setters for other modes if needed (e.g., setHighlightMode, setExtractConfig)
  } = useAppStore();

  // Navigation function
  const navigateToAnalysis = (panel: AnalysisPanel = 'analysis') => { // Default to 'analysis' panel
    if (!formValid) return;

    console.log(`Navigating to analysis with panel: ${panel}`);
    setSourceContent(textInput);
    setGlobalMetadata(metadata); // Update global metadata state
    setLoading(true);
    setActivePanel(panel);

    // Reset/Set specific modes based on the chosen panel
    setRoleplayMode(panel === 'roleplay');
    // Reset other modes if necessary:
    // if (panel !== 'highlight') setHighlightMode(false);
    // if (panel !== 'extract-info') setExtractConfig(null);

    router.push('/analysis');
  };

  // Handle Enter key press for the main analyze button
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if Enter key is pressed, form is valid, and focus isn't on an input/textarea
       if (event.key === 'Enter' && formValid &&
           !(document.activeElement instanceof HTMLInputElement) &&
           !(document.activeElement instanceof HTMLTextAreaElement) &&
           !(document.activeElement instanceof HTMLButtonElement && document.activeElement.type !== 'submit') // Allow Enter on submit buttons if any
          )
       {
        event.preventDefault(); // Prevent default form submission behavior
        console.log("Enter key pressed, initiating analysis...");
        navigateToAnalysis('analysis'); // Trigger default analysis
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
    // Ensure dependencies cover everything used inside, especially formValid and navigateToAnalysis
  }, [formValid, navigateToAnalysis]);


  // Define Lens options for cleaner mapping
  const lensOptions: { id: AnalysisPanel; label: string; description: string; icon: React.ReactNode; color: string }[] = [
    { id: 'detailed-analysis', label: 'Detailed Analysis', description: 'Close read the text', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>, color: 'blue' },
    { id: 'extract-info', label: 'Extract Info', description: 'Pull structured data', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M19 13l-4 4m0 0l-4-4m4 4V7" /></svg>, color: 'green' },
    { id: 'references', label: 'Find References', description: 'Discover sources', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>, color: 'amber' },
    { id: 'roleplay', label: 'Simulation Mode', description: 'Talk to the author', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>, color: 'sky' }, // Changed blue to sky
    { id: 'counter', label: 'Counter-Narrative', description: 'Read against the grain', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m-4 6H4m0 0l4 4m-4-4l4-4" /></svg>, color: 'purple' },
    { id: 'highlight', label: 'Highlight Text', description: 'Find key passages', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>, color: 'yellow' },
  ];

   // Color mapping for icons and hover states
   const colorClasses: Record<string, { bg: string, text: string, hoverBg: string }> = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-600', hoverBg: 'hover:bg-blue-200/60' },
      green: { bg: 'bg-green-100', text: 'text-green-600', hoverBg: 'hover:bg-green-200/60' },
      amber: { bg: 'bg-amber-100', text: 'text-amber-600', hoverBg: 'hover:bg-amber-200/60' },
      sky: { bg: 'bg-sky-100', text: 'text-sky-600', hoverBg: 'hover:bg-sky-200/60' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600', hoverBg: 'hover:bg-purple-200/60' },
      yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600', hoverBg: 'hover:bg-yellow-200/60' },
  };


  return (
    // Single container card for the footer actions
    <div className="bg-white z-1 rounded-xl shadow-lg border border-slate-200/80 p-4 md:p-6 ">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

            {/* Left Side: Primary Action */}
            <div className="flex flex-col h-full">
                 <h3 className="text-xl font-bold text-slate-800 flex items-center mb-2">
                 <span className={`mr-2 flex items-center justify-center w-8 h-8 
  ${formValid 
    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white' 
    : 'bg-white text-amber-600 border-emerald-400'} 
  rounded-full text-2xl font-bold transition-all duration-300`}>
  3
</span>

                   Start Exploring
                 </h3>
                 <p className="text-sm text-slate-600 mb-4 flex-grow">
                    Once you've added your source text and required metadata (Date & Author), click below to begin the default analysis, or choose a specific Lens on the right.
                 </p>
                 {/* Main "Analyze Source" Button */}
                <button
                    onClick={() => navigateToAnalysis('analysis')} // Default analysis panel
                    disabled={!formValid}
                    className={`
                      w-full py-3 px-5 rounded-lg text-white font-semibold
                      transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500
                      ${formValid
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:bg-amber-900 shadow-md hover:shadow-sm transform hover:-translate-y-0.5 hover:scale-101 active:translate-y-0 active:shadow-inner animate-glow-warm will-change-[box-shadow]'
                        : 'bg-slate-400 cursor-not-allowed shadow-inner'
                      }
                    `}
                    aria-label={formValid ? "Analyze Source with default settings" : "Complete required fields to analyze source"}
                 >
                    <span className="flex items-center justify-center text-base">
                        <svg className={`w-5 h-5 mr-2 flex-shrink-0 ${formValid ? '' : 'opacity-70'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        {formValid ? 'Analyze Source' : 'Add Source & Metadata'}
                    </span>
                 </button>
            </div>

             {/* Right Side: Specific Lens Options */}
            <div>
                <h4 className="text-base font-semibold z-1 text-slate-700 mb-3">
                   Or, start with a specific Lens:
                </h4>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                     {lensOptions.map((lens) => {
                         const colors = colorClasses[lens.color] || colorClasses.blue; // Fallback color
                         return (
                             <button
                                 key={lens.id}
                                 onClick={() => navigateToAnalysis(lens.id)}
                                 disabled={!formValid}
                                 className={`p-2 rounded-lg border transition-all duration-200 flex items-start text-left group ${
                                     formValid
                                        ? `${colors.hoverBg} border-slate-200 hover:border-slate-300 hover:shadow-sm`
                                        : 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                                 }`}
                                 aria-label={`Analyze using ${lens.label}`}
                              >
                                 <div className={`flex-shrink-0 w-8 h-8 rounded-full ${colors.bg} flex items-center justify-center mr-2.5 transition-colors duration-200 ${formValid ? `group-hover:${colors.text}` : colors.text}`}>
                                      <span className={colors.text}>{lens.icon}</span>
                                 </div>
                                 <div className="flex-grow">
                                      <div className="text-sm font-medium text-slate-800">{lens.label}</div>
                                      <div className="text-xs text-slate-500 mt-px">{lens.description}</div>
                                 </div>
                             </button>
                         );
                     })}
                 </div>
            </div>
        </div>
    </div>
  );
}