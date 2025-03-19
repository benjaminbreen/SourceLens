// components/upload/SourceUpload.tsx
// Enhanced file upload component with OCR capabilities for PDFs and images

'use client';

import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
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
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      setProcessStatus('Extracting text...');
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Set the extracted content
      setSourceContent(data.content);
      
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
      setError('Failed to process file. Please try again or use plain text input.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle file upload
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    setError(null);
    setSourceFile(file);
    
    // For text files, read content directly in browser
    if (file.type === 'text/plain') {
      try {
        const text = await file.text();
        setSourceContent(text);
        setSourceType('text');
        setShowMetadataModal(true);
        router.push('/analysis');
      } catch (err) {
        console.error('Error reading text file:', err);
        setError('Could not read text file. Please try again.');
      }
    } else {
      // For PDFs and images, process through API
      await processFile(file);
    }
    
  }, [setSourceContent, setSourceFile, setSourceType, setShowMetadataModal, router]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'text/plain': ['.txt']
    },
    disabled: isProcessing,
    maxSize: 10 * 1024 * 1024, // 10MB limit
    onDropRejected: (fileRejections) => {
      if (fileRejections.length > 0) {
        const reason = fileRejections[0].errors[0].code;
        if (reason === 'file-too-large') {
          setError('File is too large. Maximum size is 10MB.');
        } else if (reason === 'file-invalid-type') {
          setError('Unsupported file type. Please use PDF, JPG, PNG, or TXT files.');
        } else {
          setError('File upload failed. Please try again with a different file.');
        }
      }
    }
  });

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
        <div
          {...getRootProps()}
          className={`border-2 border-dashed ${
            isDragActive ? 'border-amber-500 bg-amber-50/50' : 'border-gray-300'
          } rounded-lg p-12 text-center cursor-pointer transition-colors ${
            isProcessing ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          <input {...getInputProps()} />
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
                {isDragActive ? "Drop your file here" : "Drag & drop your file here"}
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
      )}
    </div>
  );
}