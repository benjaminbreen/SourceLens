// components/extract/ExtractInfoPanel.tsx
// Component for extracting structured data from documents in list form
// Allows users to specify list types and customize fields for extraction

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Field input interface
interface Field {
  id: string;
  value: string;
}

export default function ExtractInfoPanel() {
  const { 
    sourceContent, 
    metadata,
    isLoading,
    setLoading,
    llmModel,
    setRawPrompt,
    setRawResponse,
     extractInfoConfig
  } = useAppStore();

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showExpandModal, setShowExpandModal] = useState(false);

  const handleGoogleDriveSave = () => {
  // For now, just show a message that this feature is coming soon
  alert('Google Drive integration coming soon!');
  
  // Close the modal
  setShowSaveModal(false);
};

  // Add this save function
const handleSave = (format: 'json' | 'txt' | 'csv' | 'xlsx') => {
  if (!extractedInfo) return;
  
  let content = extractedInfo;
  let mimeType = 'text/plain';
  let extension = 'txt';
  
  if (format === 'json') {
    try {
      // Try to parse as JSON to format it nicely
      const jsonObj = JSON.parse(extractedInfo);
      content = JSON.stringify(jsonObj, null, 2);
      mimeType = 'application/json';
      extension = 'json';
    } catch (e) {
      // If not valid JSON, just save as text
      content = extractedInfo;
    }
  } else if (format === 'csv') {
    // Better markdown table to CSV conversion
    mimeType = 'text/csv';
    extension = 'csv';
    
    try {
      // Properly convert markdown table to CSV
      const lines = extractedInfo.split('\n');
      let csvContent = '';
      
      for (const line of lines) {
        // Skip separator lines and empty lines
        if (line.trim() === '' || line.match(/^\s*\|[-:]+\|\s*$/)) {
          continue;
        }
        
        // Remove leading/trailing pipes and spaces
        let processed = line.trim();
        if (processed.startsWith('|')) {
          processed = processed.substring(1);
        }
        if (processed.endsWith('|')) {
          processed = processed.substring(0, processed.length - 1);
        }
        
        // Split by pipe character and trim each cell
        const cells = processed.split('|').map(cell => cell.trim());
        
        // Escape quotes and commas in cell content
        const escapedCells = cells.map(cell => {
          // Remove markdown formatting if present
          cell = cell.replace(/\*\*(.*?)\*\*/g, '$1'); // Bold
          cell = cell.replace(/\*(.*?)\*/g, '$1');     // Italic
          
          // If cell contains comma or quotes, wrap in quotes and escape existing quotes
          if (cell.includes(',') || cell.includes('"')) {
            return `"${cell.replace(/"/g, '""')}"`;
          }
          return cell;
        });
        
        // Join with commas to create a CSV row
        csvContent += escapedCells.join(',') + '\n';
      }
      
      content = csvContent;
    } catch (e) {
      console.error('Error converting to CSV:', e);
      // Fallback to basic approach if conversion fails
      content = extractedInfo
        .replace(/\|/g, ',')
        .replace(/^\s*,|,\s*$/gm, '')
        .replace(/\s*,\s*/g, ',');
    }
  } else if (format === 'xlsx') {
    // For Excel, we'll create a CSV that Excel can open
    // But use the xlsx extension which Excel will recognize
    try {
      // Same CSV conversion as above
      const lines = extractedInfo.split('\n');
      let csvContent = '';
      
      for (const line of lines) {
        // Skip separator lines and empty lines
        if (line.trim() === '' || line.match(/^\s*\|[-:]+\|\s*$/)) {
          continue;
        }
        
        // Remove leading/trailing pipes and spaces
        let processed = line.trim();
        if (processed.startsWith('|')) {
          processed = processed.substring(1);
        }
        if (processed.endsWith('|')) {
          processed = processed.substring(0, processed.length - 1);
        }
        
        // Split by pipe character and trim each cell
        const cells = processed.split('|').map(cell => cell.trim());
        
        // Escape quotes and commas in cell content
        const escapedCells = cells.map(cell => {
          // Remove markdown formatting if present
          cell = cell.replace(/\*\*(.*?)\*\*/g, '$1'); // Bold
          cell = cell.replace(/\*(.*?)\*/g, '$1');     // Italic
          
          // If cell contains comma or quotes, wrap in quotes and escape existing quotes
          if (cell.includes(',') || cell.includes('"')) {
            return `"${cell.replace(/"/g, '""')}"`;
          }
          return cell;
        });
        
        // Join with commas to create a CSV row
        csvContent += escapedCells.join(',') + '\n';
      }
      
      content = csvContent;
      mimeType = 'application/vnd.ms-excel';
      extension = 'xlsx';
    } catch (e) {
      console.error('Error converting to Excel format:', e);
      extension = 'csv'; // Fallback to CSV
    }
  }
  
  // Create download link
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `extracted_info_${new Date().toISOString().slice(0, 10)}.${extension}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  // Close modal
  setShowSaveModal(false);
};
  
  // State for the query input
  const [listType, setListType] = useState('');
  const [fields, setFields] = useState<Field[]>([
    { id: '1', value: '' },
    { id: '2', value: '' },
    { id: '3', value: '' },
  ]);
  
  // State for extracted results
  const [extractedInfo, setExtractedInfo] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Format options
  const [resultFormat, setResultFormat] = useState<'list' | 'table'>('list');
  
  // Add a field when the last field has content
  useEffect(() => {
    const lastField = fields[fields.length - 1];
    if (lastField && lastField.value && fields.length < 10) {
      setFields([...fields, { id: (fields.length + 1).toString(), value: '' }]);
    }
  }, [fields]);
  
  // Handle field changes
  const handleFieldChange = (id: string, value: string) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, value } : field
    ));
  };
  
  // Handle extraction
  const handleExtractInfo = async () => {
    // Validate inputs
    if (!listType.trim()) {
      setError('Please specify what kind of list you want to extract');
      return;
    }
    
    // Get non-empty fields
    const validFields = fields.filter(field => field.value.trim());
    if (validFields.length === 0) {
      setError('Please specify at least one field for the list items');
      return;
    }
    
    setError(null);
    setIsProcessing(true);
    setProcessingStatus('Preparing extraction...');
    setLoading(true);
    
    try {
      // Build the query combining the list type and fields
      const fieldsList = validFields.map(f => f.value).join(', ');
      const query = `Extract a list of ${listType}. For each item, include the following fields: ${fieldsList}.`;
      
      setProcessingStatus('Analyzing document...');
      
      // Call the API to extract info
      const response = await fetch('/api/extract-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: sourceContent,
          query,
          modelId: llmModel,
          format: resultFormat,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const data = await response.json();
      
      // Set the extracted information
      setExtractedInfo(data.extractedInfo);
      
      // Store raw data for transparency
      setRawPrompt(data.rawPrompt || query);
      setRawResponse(data.rawResponse);
      
      setProcessingStatus('Extraction complete!');
    } catch (error) {
      console.error('Information extraction error:', error);
      setError(`Failed to extract information: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
  if (extractInfoConfig) {
    setListType(extractInfoConfig.listType);
    
    // Convert fields array to Field objects
    const configFields = extractInfoConfig.fields.map((field, index) => ({
      id: (index + 1).toString(),
      value: field
    }));
    
    // Add an empty field at the end
    configFields.push({
      id: (extractInfoConfig.fields.length + 1).toString(),
      value: ''
    });
    
    setFields(configFields);
  }
}, [extractInfoConfig]);

  useEffect(() => {
  const handleEscKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowExpandModal(false);
      setShowSaveModal(false);
    }
  };
  
  window.addEventListener('keydown', handleEscKey);
  return () => {
    window.removeEventListener('keydown', handleEscKey);
  };
}, []);
  
  return (
    <div className="flex flex-col h-full">
      {/* Input Form */}
      <div className="bg-white rounded-lg p-2 mb-4">
       
        
        {error && (
          <div className="mb-3 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
            {error}
          </div>
        )}
        
        <div className="space-y-3">
          {/* List Type Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              What kind of list do you want?
            </label>
            <div className="relative">
              <input
                type="text"
                value={listType}
                onChange={(e) => setListType(e.target.value)}
                placeholder="For example: all people, places, events, technical terms, or diseases mentioned..."
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                disabled={isProcessing}
              />
              <p className="mt-1 text-xs text-slate-500 italic">
                Be specific about what you're looking for and any criteria for inclusion
              </p>
            </div>
          </div>
          
          {/* Fields Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              What fields do you want the list to contain? (up to 10)
            </label>
            <div className="space-y-2">
              {fields.map((field, index) => (
                <input
                  key={field.id}
                  type="text"
                  value={field.value}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  placeholder={`Field ${index + 1} (e.g., Name, Date, Location...)`}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  disabled={isProcessing}
                />
              ))}
            </div>
            <p className="mt-1 text-xs text-slate-500 italic">
              Each field will be extracted for every item in the list if available
            </p>
          </div>
          
          {/* Format Options */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Result Format
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-indigo-600"
                  checked={resultFormat === 'list'}
                  onChange={() => setResultFormat('list')}
                  disabled={isProcessing}
                />
                <span className="ml-2 text-sm text-slate-700">Numbered List</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-indigo-600"
                  checked={resultFormat === 'table'}
                  onChange={() => setResultFormat('table')}
                  disabled={isProcessing}
                />
                <span className="ml-2 text-sm text-slate-700">Table Format</span>
              </label>
            </div>
          </div>
          
          {/* Extract Button */}
          <div>
            <button
              onClick={handleExtractInfo}
              disabled={isProcessing || !listType.trim()}
              className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
                isProcessing || !listType.trim()
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isProcessing ? 'Processing...' : 'Extract Information'}
            </button>
          </div>
        </div>
      </div>
      
 {/* Results Display */}
<div className="flex-1 overflow-y-auto">
  {isProcessing ? (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
      <div className="w-12 h-12 border-t-2 border-b-2 border-indigo-500 rounded-full animate-spin mb-4"></div>
      <p className="text-slate-700 font-medium">{processingStatus}</p>
      <p className="text-sm text-slate-500 mt-2">
        Processing large documents may take some time...
      </p>
    </div>
  ) : extractedInfo ? (
    <div className="bg-white rounded-lg   p-4">
   <div className="flex justify-between items-center mb-4">
     <h3 className="text-lg font-medium text-indigo-900">Extracted Information</h3>
     
     <div className="flex items-center space-x-2">
       <button
         onClick={() => setShowExpandModal(true)}
         className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md transition-colors"
         title="Expand view"
       >
         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
         </svg>
       </button>
       
       <button
         onClick={() => setShowSaveModal(true)}
         className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-md border border-blue-200 hover:bg-blue-100 transition-colors flex items-center"
       >
         <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
         </svg>
         Save Locally
       </button>
     </div>
   </div>
      
   <div className="bg-slate-50 p-2 rounded-md border border-slate-200 overflow-x-auto max-h-[700px] overflow-y-auto">
     <div className="prose prose-sm max-w-none prose-indigo">
       <ReactMarkdown 
         remarkPlugins={[remarkGfm]}
         components={{
           table: ({node, ...props}) => (
             <table className="min-w-full divide-y divide-slate-300 border border-slate-200" {...props} />
           ),
           thead: ({node, ...props}) => <thead className="bg-slate-100" {...props} />,
           tbody: ({node, ...props}) => <tbody className="divide-y divide-slate-200" {...props} />,
           tr: ({node, ...props}) => <tr className="hover:bg-slate-50" {...props} />,
           th: ({node, ...props}) => <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider" {...props} />,
           td: ({node, ...props}) => <td className="px-4 py-3 text-sm text-slate-700" {...props} />
         }}
       >
         {extractedInfo}
       </ReactMarkdown>
     </div>
   </div>
    </div>
  ) : (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
      <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
      <p className="text-slate-500">
        Specify what information you'd like to extract from your document
      </p>
      <p className="text-sm text-slate-400 mt-2 max-w-md">
        You can extract lists of people, places, events, terms, or any other structured information from your text
      </p>
    </div>
  )}
</div>

{/* Expanded View Modal */}
{showExpandModal && (
  <div 
    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6"
    onClick={() => setShowExpandModal(false)}
    onKeyDown={(e) => e.key === 'Escape' && setShowExpandModal(false)}
  >
    <div 
      className="bg-white rounded-xl shadow-2xl w-[90vw] h-[85vh] overflow-hidden flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-indigo-600 p-4 border-b border-indigo-700 flex justify-between items-center">
        <h3 className="font-bold text-xl text-white">Extracted Information</h3>
        <button 
          onClick={() => setShowExpandModal(false)}
          className="text-white/80 hover:text-white hover:bg-indigo-700/50 p-2 rounded-full transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="flex-1 overflow-auto p-6 bg-slate-50">
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm h-full overflow-auto">
          <div className="prose prose-lg max-w-none prose-indigo">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                table: ({node, ...props}) => (
                  <table className="min-w-full divide-y divide-slate-300 border border-slate-200" {...props} />
                ),
                thead: ({node, ...props}) => <thead className="bg-slate-100" {...props} />,
                tbody: ({node, ...props}) => <tbody className="divide-y divide-slate-200" {...props} />,
                tr: ({node, ...props}) => <tr className="hover:bg-slate-50" {...props} />,
                th: ({node, ...props}) => <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider" {...props} />,
                td: ({node, ...props}) => <td className="px-4 py-3 text-sm text-slate-700" {...props} />
              }}
            >
              {extractedInfo}
            </ReactMarkdown>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-slate-200 bg-white flex justify-between">
        <button
          onClick={() => setShowSaveModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Save Locally
        </button>
        
        <button
          onClick={() => setShowExpandModal(false)}
          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

{/* Save Modal */}
{showSaveModal && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
      <div className="bg-indigo-600 p-5 border-b border-indigo-700">
        <h3 className="font-bold text-xl text-white">Save Extracted Information</h3>
      </div>
      
      <div className="p-8 bg-slate-50">
        <p className="text-slate-700 mb-6 text-lg">
          Choose a format to save the extracted information to your computer:
        </p>
        
        <div className="grid grid-cols-4 gap-6">
          <button
            onClick={() => handleSave('txt')}
            className="group bg-white rounded-xl p-6 border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all flex flex-col items-center justify-center"
          >
            <div className="w-14 h-14 rounded-full bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center mb-3 transition-colors">
              <svg className="w-8 h-8 text-slate-500 group-hover:text-slate-700 transition-colors" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-medium text-slate-700 group-hover:text-slate-900">Plain Text</span>
            <span className="text-xs text-slate-500 group-hover:text-slate-600">.txt</span>
          </button>
          
          <button
            onClick={() => handleSave('json')}
            className="group bg-white rounded-xl p-6 border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all flex flex-col items-center justify-center"
          >
            <div className="w-14 h-14 rounded-full bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center mb-3 transition-colors">
              <svg className="w-8 h-8 text-blue-500 group-hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth={1.5} />
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 7v10M7 12h10" />
              </svg>
            </div>
            <span className="font-medium text-slate-700 group-hover:text-slate-900">JSON</span>
            <span className="text-xs text-slate-500 group-hover:text-slate-600">.json</span>
          </button>
          
          <button
            onClick={() => handleSave('csv')}
            className="group bg-white rounded-xl p-6 border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all flex flex-col items-center justify-center"
          >
            <div className="w-14 h-14 rounded-full bg-purple-50 group-hover:bg-purple-100 flex items-center justify-center mb-3 transition-colors">
              <svg className="w-8 h-8 text-purple-500 group-hover:text-purple-600 transition-colors" fill="none" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth={1.5} />
                <path stroke="currentColor" strokeLinecap="round" strokeWidth={1.5} d="M7 12h10M10 7v10M14 7v10" />
              </svg>
            </div>
            <span className="font-medium text-slate-700 group-hover:text-slate-900">CSV</span>
            <span className="text-xs text-slate-500 group-hover:text-slate-600">.csv</span>
          </button>
          
          <button
            onClick={() => handleSave('xlsx')}
            className="group bg-white rounded-xl p-6 border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all flex flex-col items-center justify-center"
          >
            <div className="w-14 h-14 rounded-full bg-green-50 group-hover:bg-green-100 flex items-center justify-center mb-3 transition-colors">
              <svg className="w-8 h-8 text-green-600 group-hover:text-green-700 transition-colors" fill="none" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth={1.5} />
                <path stroke="currentColor" strokeLinecap="round" strokeWidth={1.5} d="M7 12h10M10 7v10M14 7v10" />
                <path stroke="currentColor" strokeLinecap="round" strokeWidth={1.5} d="M7 7h10" />
              </svg>
            </div>
            <span className="font-medium text-slate-700 group-hover:text-slate-900">Excel</span>
            <span className="text-xs text-slate-500 group-hover:text-slate-600">.xlsx</span>
          </button>
        </div>
      </div>
      
      <div className="p-5 border-t border-slate-200 bg-white flex justify-between">
        <button
          onClick={() => handleGoogleDriveSave()}
          className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center"
        >
          <svg className="w-5 h-5 mr-2 text-blue-600" viewBox="0 0 87.3 78" fill="none">
            <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5l5.4 9.35z" fill="#0066da"/>
            <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5l16.15-28z" fill="#00ac47"/>
            <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
            <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
            <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
            <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
          </svg>
          Save to Google Drive
        </button>
        
        <button
          onClick={() => setShowSaveModal(false)}
          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
    
    </div>
  );
}