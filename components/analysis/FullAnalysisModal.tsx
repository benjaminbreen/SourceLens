// components/analysis/FullAnalysisModal.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Metadata } from '@/lib/store'; // Adjust path if needed
import SaveToLibraryButton from '../library/SaveToLibraryButton'; // Adjust path if needed

// Define a basic structure for section styles if not imported
// Replace with your actual import or definition if available elsewhere
const defaultSectionStyles = {
    context: { color: 'text-purple-1000', bg: 'bg-purple-50', iconColor: 'text-purple-600', borderColor: 'border-purple-200', hoverColor: 'hover:text-purple-600' },
    author: { color: 'text-pink-1000', bg: 'bg-pink-50', iconColor: 'text-pink-600', borderColor: 'border-pink-200', hoverColor: 'hover:text-pink-600' },
    themes: { color: 'text-sky-1000', bg: 'bg-sky-50', iconColor: 'text-sky-600', borderColor: 'border-sky-200', hoverColor: 'hover:text-sky-600' },
    evidence: { color: 'text-teal-1000', bg: 'bg-teal-50', iconColor: 'text-teal-600', borderColor: 'border-teal-200', hoverColor: 'hover:text-teal-600' },
    significance: { color: 'text-indigo-1000', bg: 'bg-indigo-50', iconColor: 'text-indigo-600', borderColor: 'border-indigo-200', hoverColor: 'hover:text-indigo-600' },
    references: { color: 'text-blue-1000', bg: 'bg-blue-100', iconColor: 'text-blue-700', borderColor: 'border-blue-300', hoverColor: 'hover:text-blue-700' }
};
type SectionStyle = typeof defaultSectionStyles.context; // Type for a single style object

// Define structure for parsed sections
interface ParsedSection {
  key: string;
  title: string;
  content: string;
  id: string; // ID for scrolling
  icon: JSX.Element;
  style: SectionStyle;
}

// --- Helper Function to Parse Analysis ---
const parseAnalysisContent = (analysisText: string): ParsedSection[] => {
  if (!analysisText) return [];

  const sections: ParsedSection[] = [];
  // Regex updated to handle potential variations in spacing and numbering (e.g., "1. ###CONTEXT:")
  const sectionRegex = /(?:\d+\.\s*)?###(CONTEXT|PERSPECTIVE|THEMES|EVIDENCE|SIGNIFICANCE|REFERENCES):\s*([\s\S]*?)(?=(?:\d+\.\s*)?###|$)/gi;
  let match;

  const iconMap: Record<string, JSX.Element> = {
    CONTEXT: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    PERSPECTIVE: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    THEMES: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
    EVIDENCE: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    SIGNIFICANCE: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
    REFERENCES: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  };

  // Add potential variations of titles
  const titleMap: Record<string, string> = {
      CONTEXT: 'Context',
      PERSPECTIVE: 'Author Perspective',
      THEMES: 'Key Themes',
      EVIDENCE: 'Evidence & Rhetoric',
      SIGNIFICANCE: 'Significance',
      REFERENCES: 'References',
  };

  const styleMap: Record<string, keyof typeof defaultSectionStyles> = {
    CONTEXT: 'context',
    PERSPECTIVE: 'author',
    THEMES: 'themes',
    EVIDENCE: 'evidence',
    SIGNIFICANCE: 'significance',
    REFERENCES: 'references',
  }

  while ((match = sectionRegex.exec(analysisText)) !== null) {
    const key = match[1].toUpperCase();
    // Clean up content: remove leading/trailing whitespace and potentially repeated headers within content
    const content = match[2]
        .replace(new RegExp(`^${key}:\\s*`, 'i'), '') // Remove repeated header at the beginning
        .trim();
    const styleKey = styleMap[key] || 'context'; // Fallback style

    if (content) {
      sections.push({
        key: key.toLowerCase(),
        title: titleMap[key] || key.charAt(0) + key.slice(1).toLowerCase(),
        content: content,
        id: `analysis-modal-${key.toLowerCase()}`, // Unique ID for modal scrolling
        icon: iconMap[key] || iconMap['CONTEXT'], // Fallback icon
        style: defaultSectionStyles[styleKey]
      });
    }
  }
  return sections;
};

// --- Main Modal Component ---
interface FullAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisContent: string;
  metadata: Metadata | null;
  perspective: string | null;
  llmModel: string | null;
}

const FullAnalysisModal: React.FC<FullAnalysisModalProps> = ({
  isOpen,
  onClose,
  analysisContent,
  metadata,
  perspective,
  llmModel,
}) => {
  const [parsedSections, setParsedSections] = useState<ParsedSection[]>([]);
  const modalContentRef = useRef<HTMLDivElement>(null); // Ref for scrollable content

  // State for Expansion Feature
  const [expandingSectionKey, setExpandingSectionKey] = useState<string | null>(null);
  const [expansionInput, setExpansionInput] = useState('');
  const [expandedContent, setExpandedContent] = useState<Record<string, string>>({});
  const [isExpanding, setIsExpanding] = useState<Record<string, boolean>>({});
  const [expansionError, setExpansionError] = useState<Record<string, string | null>>({});

  useEffect(() => {
    if (isOpen && analysisContent) {
      setParsedSections(parseAnalysisContent(analysisContent));
      // Reset expansion state when modal opens/content changes
      setExpandingSectionKey(null);
      setExpansionInput('');
      setExpandedContent({});
      setIsExpanding({});
      setExpansionError({});
    }
  }, [isOpen, analysisContent]);

  // --- Fast Travel Logic ---
  const handleFastTravelClick = useCallback((targetId: string) => {
    const element = document.getElementById(targetId);
    if (element && modalContentRef.current) {
        const containerTop = modalContentRef.current.getBoundingClientRect().top;
        const elementTop = element.getBoundingClientRect().top;
        // Calculate offset relative to the scroll container, adding a small margin from the top
        const scrollTop = modalContentRef.current.scrollTop;
        const offset = elementTop - containerTop + scrollTop - 16; // 16px offset from top

        modalContentRef.current.scrollTo({
            top: offset,
            behavior: 'smooth'
        });
    } else {
      console.warn(`Fast travel target element not found: ${targetId}`);
    }
  }, []);

  // --- Expansion Logic ---
  const handleToggleExpandInput = (key: string) => {
    setExpandingSectionKey(prevKey => (prevKey === key ? null : key));
    setExpansionInput(''); // Clear input when toggling
    setExpansionError(prev => ({ ...prev, [key]: null })); // Clear error
  };

  const handleExpandSection = async (section: ParsedSection) => {
     if (!expansionInput.trim()) return;

     const key = section.key;
     setIsExpanding(prev => ({ ...prev, [key]: true }));
     setExpansionError(prev => ({ ...prev, [key]: null }));

     try {
         const response = await fetch('/api/expand-analysis', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
                 sectionKey: key,
                 sectionTitle: section.title,
                 originalContent: section.content,
                 userInput: expansionInput,
                 fullAnalysis: analysisContent, // Send full context
                 metadata: metadata // Send metadata context
             }),
         });

         if (!response.ok) {
             const errorData = await response.json();
             throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
         }

         const data = await response.json();
         setExpandedContent(prev => ({ ...prev, [key]: data.expandedText }));
         setExpandingSectionKey(null); // Close input after success
         setExpansionInput('');

     } catch (error) {
         console.error("Expansion failed:", error);
         const message = error instanceof Error ? error.message : "An unknown error occurred.";
         setExpansionError(prev => ({ ...prev, [key]: message }));
     } finally {
         setIsExpanding(prev => ({ ...prev, [key]: false }));
     }
  };

  // --- Other Handlers (Save, Share) ---
  const title = `Full Analysis: ${metadata?.title || 'Source'}`;
  const filename = `analysis-${metadata?.title?.replace(/[\s\W]+/g, '_') || 'source'}.txt`; // Sanitize filename
  const sourceUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleSaveLocally = () => {
    const blob = new Blob([analysisContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
     navigator.clipboard.writeText(sourceUrl)
      .then(() => {
        alert('Link copied to clipboard!'); // Consider a less intrusive notification
      })
      .catch(err => {
        console.error('Failed to copy link: ', err);
        alert('Failed to copy link.');
      });
  };

  // --- Render Logic ---
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-out animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-3 pl-5 border-b border-gray-200 bg-slate-50 flex-shrink-0">
           {/* Title */}
           <h3 className="text-lg font-semibold text-slate-800 truncate mr-4 flex-shrink min-w-0">{title}</h3>

           {/* Fast Travel Icons (only if sections exist) */}
           {parsedSections.length > 0 && (
                <div className="flex items-center space-x-1 border border-slate-200 rounded-full px-2 py-0.5 bg-white shadow-sm mr-auto ml-4 flex-shrink-0">
                    {parsedSections.map((item) => (
                    <button
                        key={item.key}
                        onClick={() => handleFastTravelClick(item.id)}
                        title={`Scroll to ${item.title}`}
                        className={`p-1 text-slate-400 ${item.style.hoverColor || 'hover:text-slate-600'} rounded-full transition-colors`}
                        aria-label={`Scroll to ${item.title}`}
                    >
                        {item.icon}
                    </button>
                    ))}
                </div>
           )}

           {/* Close Button */}
           <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-2xl leading-none ml-4 p-1 rounded-full hover:bg-slate-200 transition-colors flex-shrink-0"
            aria-label="Close modal"
           >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
             </svg>
           </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div ref={modalContentRef} className="p-6 flex-grow overflow-y-auto space-y-6 bg-gray-50"> {/* Light gray bg for content area */}
          {parsedSections.length === 0 && (
            <p className="text-center text-slate-500 py-10">Could not parse analysis content.</p>
          )}
          {parsedSections.map((section) => (
            <section key={section.key} id={section.id} aria-labelledby={`${section.id}-heading`} className="scroll-mt-5"> {/* Increased scroll margin */}
               <div className={`border ${section.style.borderColor} rounded-lg overflow-hidden shadow-md bg-white`}> {/* Added shadow and white bg */}
                 {/* Section Header */}
                 <h4 id={`${section.id}-heading`} className={`flex items-center p-3 ${section.style.bg} border-b ${section.style.borderColor}`}>
                   <span className={`mr-3 ${section.style.iconColor}`}>
                     {section.icon}
                   </span>
                   <span className={`text-base font-semibold ${section.style.color}`}>{section.title}</span>
                 </h4>
                 {/* Section Content */}
                 <div className="prose prose-sm max-w-none p-4 text-slate-800 leading-relaxed">
                    {/* Render simple text or handle markdown/HTML */}
                    <div dangerouslySetInnerHTML={{ __html: section.content.replace(/\n/g, '<br />') }} />
                 </div>

                 {/* --- Expansion Feature UI --- */}
                 <div className="px-4 pb-2 pt-1 mb-2 border-t border-slate-100"> {/* Lighter border */}
                    {/* "More..." Button */}
                    <button
                        onClick={() => handleToggleExpandInput(section.key)}
                        className={`text-xs font-medium flex items-center ${section.style.iconColor.replace('text-', 'text-')} opacity-80 hover:opacity-100 transition-opacity`} // Use icon color for button
                    >
                        {expandingSectionKey === section.key ? (
                            <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor"> <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /> </svg>
                            Cancel Expansion
                            </>
                        ) : (
                            <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor"> <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /> </svg>
                            Expand on this...
                            </>
                        )}
                    </button>

                    {/* Expansion Input Area (Conditional) */}
                    {expandingSectionKey === section.key && (
                        <div className="mt-2 space-y-2 animate-fade-in-fast">
                            <textarea
                                value={expansionInput}
                                onChange={(e) => setExpansionInput(e.target.value)}
                                placeholder={`Ask a question or specify what to expand on regarding "${section.title}"...`}
                                className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                rows={2}
                            />
                            <div className="flex justify-end items-center space-x-2">
                                {isExpanding[section.key] && (
                                     <span className="text-xs text-slate-500 flex items-center">
                                         <svg className="animate-spin h-3 w-3 mr-1 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg>
                                         Generating...
                                     </span>
                                )}
                                {expansionError[section.key] && (
                                    <span className="text-xs text-red-600" title={expansionError[section.key]!}>Error generating expansion.</span>
                                )}
                                <button
                                    onClick={() => handleExpandSection(section)}
                                    disabled={!expansionInput.trim() || isExpanding[section.key]}
                                    className={`px-3 py-1 text-xs rounded-md font-medium transition-all duration-150 ${
                                        !expansionInput.trim() || isExpanding[section.key]
                                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow'
                                    }`}
                                >
                                    Expand
                                </button>
                            </div>
                        </div>
                    )}

                     {/* Expanded Content Area (Conditional & Animated) */}
                     {expandedContent[section.key] && (
                        <div className="mt-3 pt-3 border-t border-dashed border-slate-200 animate-slide-down">
                             <p className="text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">Expansion:</p>
                             <div className="prose prose-sm max-w-none text-slate-700 text-sm leading-relaxed"> {/* Slightly larger text for readability */}
                                 <div dangerouslySetInnerHTML={{ __html: expandedContent[section.key].replace(/\n/g, '<br />') }} />
                             </div>
                        </div>
                     )}
                 </div>
               </div>
            </section>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end items-center p-4 border-t border-gray-200 bg-slate-100 space-x-3 flex-shrink-0"> {/* Slightly darker footer bg */}
          <SaveToLibraryButton
            type="analysis"
            data={{ // Ensure data is correctly populated
                type: 'detailed',
                title: `Detailed Analysis of ${metadata?.title || 'Source'}`,
                content: analysisContent || '',
                sourceName: metadata?.title || 'Untitled Source',
                sourceAuthor: metadata?.author || 'Unknown',
                sourceDate: metadata?.date || 'Unknown date',
                perspective: perspective || 'Default',
                model: llmModel
             }}
            variant="primary" // Make this stand out
            size="sm"
          />
          <button
            onClick={handleSaveLocally}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors shadow-sm hover:shadow"
            title={`Download as ${filename}`}
          >
            Save .txt
          </button>
          <button
            onClick={handleShare}
            className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-md transition-colors"
          >
            Copy Link
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm bg-slate-500 hover:bg-slate-600 text-white rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
      {/* Global CSS for animations */}
      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }

        @keyframes fadeInFast { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-fast { animation: fadeInFast 0.2s ease-out forwards; }

        @keyframes slideDown {
            from { opacity: 0; max-height: 0; transform: translateY(-10px); margin-top: 0; padding-top: 0; }
            to { opacity: 1; max-height: 500px; transform: translateY(0); margin-top: 0.75rem; padding-top: 0.75rem; } /* Adjust max-height, match mt/pt */
        }
        .animate-slide-down { animation: slideDown 0.4s ease-out forwards; overflow: hidden;}
      `}</style>
    </div>
  );
};

export default FullAnalysisModal;