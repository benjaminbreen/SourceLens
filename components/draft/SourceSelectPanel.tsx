// components/draft/SourceSelectPanel.tsx
import React, { useState, useEffect } from 'react';
import { useLibraryStorage } from '@/lib/libraryStorageProvider';
import { SavedSource } from '@/lib/libraryContext';
import { formatDistanceToNow } from 'date-fns';

interface SourceSelectPanelProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedSourceId: string | null;
  setSelectedSourceId: (id: string | null) => void;
  analyticFramework: string;
  setAnalyticFramework: (framework: string) => void;
  darkMode: boolean;
}

export default function SourceSelectPanel({
  isOpen,
  setIsOpen,
  selectedSourceId,
  setSelectedSourceId,
  analyticFramework,
  setAnalyticFramework,
  darkMode
}: SourceSelectPanelProps) {
  const [sources, setSources] = useState<Partial<SavedSource>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { getItems } = useLibraryStorage();
  
  // Fetch sources
  useEffect(() => {
    const fetchSources = async () => {
      try {
        setIsLoading(true);
        const sourceList = await getItems<SavedSource>('sources');
        
        // Sort by last accessed (most recent first), then date added
        const sortedSources = [...sourceList].sort((a, b) => {
          if (a.lastAccessed && b.lastAccessed) {
            return b.lastAccessed - a.lastAccessed;
          }
          if (a.lastAccessed) return -1;
          if (b.lastAccessed) return 1;
          return (b.dateAdded || 0) - (a.dateAdded || 0);
        });
        
        setSources(sortedSources);
      } catch (error) {
        console.error('Error fetching sources:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSources();
  }, [getItems]);
  
  // Filter sources by search term
  const filteredSources = sources.filter(source => {
    const searchLower = searchTerm.toLowerCase();
    return (
      !searchTerm ||
      (source.metadata?.title || '').toLowerCase().includes(searchLower) ||
      (source.metadata?.author || '').toLowerCase().includes(searchLower) ||
      (source.metadata?.date || '').toLowerCase().includes(searchLower) ||
      (Array.isArray(source.tags) && source.tags.some(tag => 
        tag.toLowerCase().includes(searchLower)
      ))
    );
  });
  
  // Get source type icon
  const getSourceTypeIcon = (type?: string) => {
    switch (type) {
      case 'pdf':
        return (
          <svg className={`w-4 h-4 ${darkMode ? 'text-red-400' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'image':
        return (
          <svg className={`w-4 h-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg className={`w-4 h-4 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };
  
  // Handle drag start
  const handleDragStart = (e: React.DragEvent, source: Partial<SavedSource>) => {
    // Set data transfer with source ID and minimal metadata
    e.dataTransfer.setData('application/sourceLens', JSON.stringify({
      id: source.id,
      type: source.type,
      title: source.metadata?.title
    }));
    e.dataTransfer.effectAllowed = 'copy';
  };
  
  // Format last accessed time
  const formatLastAccessed = (timestamp?: number) => {
    if (!timestamp) return 'Never accessed';
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };
  
  // Panel width style
  const panelStyle = {
    width: isOpen ? '320px' : '0',
    minWidth: isOpen ? '320px' : '0',
    opacity: isOpen ? 1 : 0,
  };
  
  return (
    <>
      {/* Panel stub (always visible) */}
      <div
        className={`fixed left-0 top-1/2 -translate-y-1/2 z-20 ${
          isOpen ? 'hidden' : 'block'
        }`}
      >
        <button
          onClick={() => setIsOpen(true)}
          className={`flex items-center justify-center p-2 ${
            darkMode
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              : 'bg-white text-slate-600 hover:bg-slate-50'
          } border ${
            darkMode ? 'border-slate-700' : 'border-slate-200'
          } rounded-r-md shadow-sm`}
          title="Show sources panel"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span className="sr-only">Show sources panel</span>
        </button>
      </div>
      
      {/* Main panel */}
      <div
        className={`h-screen border-r ${
          darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
        } transition-all duration-300 ease-in-out overflow-hidden`}
        style={panelStyle}
      >
        {/* Panel header */}
        <div
          className={`p-4 border-b flex justify-between items-center ${
            darkMode ? 'border-slate-700' : 'border-slate-200'
          }`}
        >
          <h2
            className={`text-lg font-medium ${
              darkMode ? 'text-slate-200' : 'text-slate-800'
            }`}
          >
            Sources
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className={`p-1 rounded-full ${
              darkMode
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title="Close panel"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        
        {/* Search and info */}
        <div className="p-4">
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search sources..."
                className={`w-full pl-9 pr-3 py-2 rounded-md ${
                  darkMode
                    ? 'bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500'
                    : 'bg-white border-slate-300 text-slate-800 placeholder:text-slate-400'
                } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className={`h-4 w-4 ${
                    darkMode ? 'text-slate-500' : 'text-slate-400'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Analytic framework input */}
          <div className="mb-4">
            <label
              htmlFor="analytic-framework"
              className={`block text-sm font-medium mb-1 ${
                darkMode ? 'text-slate-300' : 'text-slate-700'
              }`}
            >
              Analytic Framework (Optional)
            </label>
            <textarea
              id="analytic-framework"
              value={analyticFramework}
              onChange={(e) => setAnalyticFramework(e.target.value)}
              placeholder="Specify how you want to analyze connections (e.g., 'Find thematic parallels' or 'Compare biases')..."
              className={`w-full text-sm px-3 py-2 rounded-md ${
                darkMode
                  ? 'bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500'
                  : 'bg-white border-slate-300 text-slate-800 placeholder:text-slate-400'
              } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              rows={3}
            />
          </div>
          
          <div
            className={`text-xs mb-2 ${
              darkMode ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            <p>
              Select a source to use with the "Relate to Source" feature, or
              drag a source card onto your draft.
            </p>
          </div>
        </div>
        
        {/* Sources list */}
        <div className="overflow-y-auto flex-grow" style={{ height: 'calc(100vh - 242px)' }}>
          {isLoading ? (
            <div
              className={`flex justify-center items-center h-32 ${
                darkMode ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              <svg
                className={`animate-spin h-6 w-6 mr-2 ${
                  darkMode ? 'text-slate-500' : 'text-slate-400'
                }`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Loading sources...</span>
            </div>
          ) : filteredSources.length === 0 ? (
            <div
              className={`p-4 text-center ${
                darkMode ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              {searchTerm
                ? 'No sources match your search.'
                : 'No sources found. Add sources in the Library.'}
            </div>
          ) : (
            <div className="px-4 pb-4 space-y-3">
              {filteredSources.map((source) => (
                <div
                  key={source.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, source)}
                  onClick={() => setSelectedSourceId(source.id || null)}
                  className={`p-3 rounded-md cursor-pointer border ${
                    selectedSourceId === source.id
                      ? darkMode
                        ? 'bg-indigo-900/20 border-indigo-800/60'
                        : 'bg-indigo-50 border-indigo-200'
                      : darkMode
                      ? 'bg-slate-800 border-slate-700 hover:bg-slate-750'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  } transition-colors group`}
                >
                  <div className="flex justify-between items-start mb-1">
                    {/* Title and source type */}
                    <div className="flex items-start space-x-2">
                      <div className="mt-0.5">
                        {getSourceTypeIcon(source.type)}
                      </div>
                      <div>
                    <h3
                      className={`font-medium text-sm mr-4 break-words ${
                        darkMode ? 'text-slate-200' : 'text-slate-800'
                      }`}
                    >
                      {source.metadata?.title || 'Untitled Source'}
                    </h3>
                       <p
  className={`text-xs ${
    darkMode ? 'text-slate-400' : 'text-slate-500'
  }`}
  title={
    source.metadata?.author
      ? `${source.metadata.author}${source.metadata.date ? `, ${source.metadata.date}` : ''}`
      : 'Unknown author'
  }
>
  {(source.metadata?.author
    ? `${source.metadata.author}${source.metadata.date ? `, ${source.metadata.date}` : ''}`
    : 'Unknown author'
  )
    .split(' ')
    .slice(0, 4)
    .join(' ') +
    ((source.metadata?.author &&
      source.metadata?.author.split(' ').length > 4) ||
    (source.metadata?.date &&
      source.metadata?.date.split(' ').length > 0)
      ? '…'
      : '')}
</p>

                      </div>
                    </div>
                    
                    {/* Drag handle */}
                    <div
                      className={`drag-handle p-1 ${
                        darkMode
                          ? 'text-slate-500 group-hover:text-slate-400'
                          : 'text-slate-400 group-hover:text-slate-600'
                      } cursor-grab`}
                      title="Drag to draft"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                        />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Tags */}
                  {Array.isArray(source.tags) && source.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {source.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className={`px-1.5 py-0.5 text-xs rounded ${
                            darkMode
                              ? 'bg-slate-700 text-slate-300'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                      {source.tags.length > 3 && (
                        <span
                          className={`text-xs ${
                            darkMode ? 'text-slate-500' : 'text-slate-400'
                          }`}
                        >
                          +{source.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Last accessed */}
                  <div
                    className={`mt-2 text-xs ${
                      darkMode ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    {formatLastAccessed(source.lastAccessed)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}