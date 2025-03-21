// components/upload/SourceUpload.tsx
// Enhanced file upload component with AI vision toggle and improved error handling

'use client';

import React, { useCallback, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';

export default function SourceUpload() {
  const router = useRouter();
  const { 
    setSourceContent, 
    setSourceFile, 
    setSourceType, 
    setShowMetadataModal 
  } = useAppStore();
  
  const [textInput, setTextInput] = useState('');
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState('');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [useAIVision, setUseAIVision] = useState(false);
  
  // Reference to file input element
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle text input
  const handleTextSubmit = () => {
    if (textInput.trim()) {
      setError(null);
      setSourceContent(textInput.trim());
      setSourceType('text');
      setShowMetadataModal(true);
      router.push('/analysis');
    } else {
      setError('Please enter some text to analyze');
    }
  };

  // Process uploaded file through the API to extract text
  const processFile = async (file: File) => {
    setIsProcessing(true);
    setProcessStatus('Uploading file...');
    setError(null);
    
    try {
      const formData = new FormData();
      // Append file to form data
      formData.append('file', file);
      // Add the AI vision preference
      formData.append('useAIVision', useAIVision.toString());
      
      console.log("Sending file to API:", {
        name: file.name,
        type: file.type,
        size: file.size,
        useAIVision: useAIVision
      });
      
      setProcessStatus(useAIVision ? 'Processing with AI Vision...' : 'Extracting text...');
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch (e) {
          console.warn("Could not parse error response", e);
        }
        
        console.error("API error response:", response.status, errorData);
        setDebugInfo({
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        
        throw new Error(`Server responded with ${response.status}: ${errorData.message || response.statusText}`);
      }
      
      const data = await response.json();
      console.log("API processing successful with method:", data.processingMethod);
      
      // Set the extracted content
      setSourceContent(data.content);
      
      // Update file info
      setSourceFile(file);
      
      // Update file type based on mime type
      if (data.type.includes('pdf')) {
        setSourceType('pdf');
      } else if (data.type.includes('image')) {
        setSourceType('image');
      } else {
        setSourceType('text');
      }
      
      // Continue to metadata screen
      setShowMetadataModal(true);
      router.push('/analysis');
      
    } catch (error) {
      console.error('File processing error:', error);
      setError(`Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or use plain text input.`);
    } finally {
      setIsProcessing(false);
      setProcessStatus('');
    }
  };

  // Handle file selection (from input)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };
  
  // Handle file drop
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    // Reset styles
    e.currentTarget.classList.remove('border-amber-500', 'bg-amber-50/50');
    
    // Get the files
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };
  
  // Update styles on drag
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-amber-500', 'bg-amber-50/50');
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-amber-500', 'bg-amber-50/50');
  };

  return (
    <div className="max-w-2xl mx-auto my-8 p-6 bg-white rounded-lg shadow-md">
      {/* Tab selector */}
      <div className="flex border-b mb-6">
        <button
          className={`py-2 px-4 ${activeTab === 'text' ? 'border-b-2 border-amber-700 text-amber-900' : 'text-gray-500'}`}
          onClick={() => setActiveTab('text')}
        >
          Enter Text
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'file' ? 'border-b-2 border-amber-700 text-amber-900' : 'text-gray-500'}`}
          onClick={() => setActiveTab('file')}
        >
          Upload File
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          {error}
          {debugInfo && (
            <details className="mt-2 text-xs">
              <summary className="cursor-pointer">Debug information</summary>
              <pre className="mt-1 bg-red-100 p-2 rounded overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}

      {activeTab === 'text' ? (
        <div>
          <textarea
            className="w-full h-64 p-4 border rounded-md focus:ring-2 focus:ring-amber-700/50 focus:border-amber-700"
            placeholder="Paste or type your primary source text here..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
          <button
            className="mt-4 w-full bg-amber-700 text-white py-3 px-4 rounded-md hover:bg-amber-800 transition"
            onClick={handleTextSubmit}
          >
            Analyze Text
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isProcessing ? 'opacity-75 cursor-not-allowed' : ''
            }`}
            onClick={() => !isProcessing && fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleFileDrop}
          >
            <input 
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileSelect}
              accept=".pdf,.txt,.jpg,.jpeg,.png"
              disabled={isProcessing}
            />
            
            {isProcessing ? (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-lg text-gray-700 font-medium">{processStatus}</p>
                <p className="text-sm text-gray-500 mt-1">This may take a moment for larger files...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <svg 
                  className="w-16 h-16 text-gray-400 mb-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
                  />
                </svg>
                <p className="text-lg text-gray-700 font-medium">
                  Drag & drop your file here
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  or click to browse your files (PDF, JPG, PNG, TXT)
                </p>
                <p className="mt-4 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-md">
                  Max file size: 10MB • Text will be extracted automatically
                </p>
              </div>
            )}
          </div>
          
          {/* AI Vision toggle */}
          <div className="flex items-center bg-indigo-50 p-4 rounded-md border border-indigo-100">
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={useAIVision}
                  onChange={() => setUseAIVision(!useAIVision)}
                  disabled={isProcessing}
                />
                <div className={`block w-14 h-8 rounded-full ${useAIVision ? 'bg-indigo-600' : 'bg-gray-300'} transition-colors`}></div>
                <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${useAIVision ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </div>
              <div className="ml-3">
                <span className="text-sm font-medium text-gray-900">Use AI Vision to extract text or analyze an image</span>
                <p className="text-xs text-slate-600 mt-1">
                  {useAIVision 
                    ? "Claude's AI Vision technology will be used as the primary method to extract text from your file"
                    : "Traditional OCR will be tried first, with AI Vision used only as a fallback if needed"}
                </p>
              </div>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}