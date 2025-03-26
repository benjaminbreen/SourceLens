// components/upload/SourceUpload.tsx
// Enhanced file upload component with improved error handling, progress tracking,
// and support for very large documents

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';

// Constants for file size limits
const LARGE_FILE_SIZE = 5 * 1024 * 1024;  // 5MB
const VERY_LARGE_FILE_SIZE = 8 * 1024 * 1024; // 8MB

export default function SourceUpload() {
  const router = useRouter();
  const { 
    setSourceContent, 
    setSourceFile, 
    setSourceType, 
    setShowMetadataModal,
    setMetadata 
  } = useAppStore();
  
  const [textInput, setTextInput] = useState('');
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState('');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  
  // Enhanced upload state feedback
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState('');
  const [fileError, setFileError] = useState<string | null>(null);
  
  // Additional state for handling referenced vars in the original code
  const [useAIVision, setUseAIVision] = useState(false);
  const [isExtractingMetadata, setIsExtractingMetadata] = useState(false);
  const [detectedMetadata, setDetectedMetadata] = useState<any>(null);
  const [showMetadataPrompt, setShowMetadataPrompt] = useState(false);
  const [disableMetadataDetection, setDisableMetadataDetection] = useState(false);
  
  // New progress tracking state
  const [progressMessages, setProgressMessages] = useState<string[]>([]);
  const [showDetailedProgress, setShowDetailedProgress] = useState(false);
  const [processingPhase, setProcessingPhase] = useState<string>('');
  const [currentPageInfo, setCurrentPageInfo] = useState<string>('');
  const [totalPages, setTotalPages] = useState<number>(0);
  
  // Reference to file input element
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Function to update progress with detailed info
  const updateProgress = (progress: number, message: string, isDetailUpdate = false) => {
    setUploadProgress(progress);
    setUploadStage(message);
    
    // Don't add duplicate messages
    if (!progressMessages.includes(message)) {
      setProgressMessages(prev => [...prev, message]);
    }
    
    // If this is a detailed update about page processing, extract page info
    if (isDetailUpdate) {
      const pageMatch = message.match(/page (\d+) of (\d+)/i);
      if (pageMatch) {
        const currentPage = parseInt(pageMatch[1]);
        const totalPageCount = parseInt(pageMatch[2]);
        setCurrentPageInfo(`Page ${currentPage} of ${totalPageCount}`);
        setTotalPages(totalPageCount);
        
        // Calculate more accurate progress
        if (totalPageCount > 0) {
          // Map page progress to overall progress from 40% to 90%
          const pageProgressPortion = 50 * (currentPage / totalPageCount);
          setUploadProgress(Math.min(40 + pageProgressPortion, 90));
        }
      }
    }
  };
  
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
  // Process uploaded file through the API to extract text
const processFile = async (file: File) => {
  // Reset state for new file upload
  setFileError(null);
  setProgressMessages([]);
  setUploadProgress(0);
  setProcessingPhase('');
  setCurrentPageInfo('');
  setTotalPages(0);
  
  // Check file extension as a fallback for MIME type
  const fileName = file.name.toLowerCase();
  const isPdf = file.type.includes('pdf') || fileName.endsWith('.pdf');
  const isImage = file.type.includes('image') || 
              fileName.endsWith('.jpg') || 
              fileName.endsWith('.jpeg') || 
              fileName.endsWith('.png');
  const isText = file.type.includes('text') || fileName.endsWith('.txt');
  const isAudio = file.type.includes('audio') || 
                file.type.includes('video') ||
                fileName.endsWith('.mp3') || 
                fileName.endsWith('.wav') || 
                fileName.endsWith('.m4a') || 
                fileName.endsWith('.aac') ||
                fileName.endsWith('.mp4') ||
                fileName.endsWith('.mov') ||
                fileName.endsWith('.webm');
  
  if (!isPdf && !isImage && !isText && !isAudio) {
    setFileError(`Unsupported file type. Please use PDF, JPG, PNG, TXT, MP3, MP4, WAV, AAC, or other common media files.`);
    return;
  }
  
  // Different size limits based on file type - 25MB for PDFs and audio, 10MB for others
  const sizeLimit = (isPdf || isAudio) ? 25 * 1024 * 1024 : 10 * 1024 * 1024;
  
  if (file.size > sizeLimit) {
    setFileError(`File too large. Maximum size is ${isPdf || isAudio ? '25MB' : '10MB'}.`);
    return;
  }

  // Provide better warnings for large files
  if (file.size > LARGE_FILE_SIZE) { // 5MB+
    // Don't return an error, but set a warning
    setFileError(`Large file detected (${Math.round(file.size / (1024 * 1024))}MB). Processing may take a while and results might be partial.`);
  }

  // For very large PDFs, add an extra warning
  if (isPdf && file.size > VERY_LARGE_FILE_SIZE) {
    setFileError(`Very large PDF detected (${Math.round(file.size / (1024 * 1024))}MB). Only a sample of pages will be processed. For best results, consider using a smaller, more focused document.`);
  }
  
  setUploadingFile(true);
  setShowDetailedProgress(true);
  updateProgress(5, 'Preparing file...');
  
  try {
    let extractedText = '';
    
    // For text files, read directly in the browser
    if (isText) {
      updateProgress(30, 'Reading text file...');
      
      extractedText = await file.text();
      setTextInput(extractedText);
      
      updateProgress(70, 'Processing text content...');
      
      // Try to extract metadata from the text
      await extractMetadata(extractedText);
      
      updateProgress(100, 'Processing complete');
      
      setUploadingFile(false);
      return;
    }
    
 
    // For PDFs and images, send to the API for processing
    const formData = new FormData();
    
    updateProgress(20, 'Uploading file...');
    
    formData.append('file', file);
    
    // Add the AI Vision preference
    formData.append('useAIVision', useAIVision.toString());
    
    console.log("Sending file to API:", file.name, "type:", file.type);
    console.log("Using AI Vision:", useAIVision ? "PRIMARY" : "FALLBACK");
    
    // Track upload progress with poll/timeout logic for large files
    let progressInterval: NodeJS.Timeout | null = null;
    
    if (file.size > 2 * 1024 * 1024) { // For larger files
      // Set processing phase based on file type
      setProcessingPhase(isPdf ? 'pdf-processing' : isImage ? 'image-processing' : 'file-processing');
      
      let currentProgress = 20;
      progressInterval = setInterval(() => {
        // Don't go past 90% until we get actual completion
        if (currentProgress < 90) {
          currentProgress += 1;
          setUploadProgress(currentProgress);
          
          // Update appropriate messages based on file type and progress
          if (currentProgress === 35) {
            if (isPdf) {
              updateProgress(35, 'Extracting text from PDF...');
            } else if (isImage) {
              updateProgress(35, 'Performing OCR on image...');
            }
          } else if (currentProgress === 50 && useAIVision) {
            updateProgress(50, 'Processing with AI Vision...');
          } else if (currentProgress === 70) {
            updateProgress(70, 'Analyzing content...');
          } else if (currentProgress === 85) {
            updateProgress(85, 'Almost done...');
          }
        }
      }, 800);
    }
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    // Clear the interval
    if (progressInterval) {
      clearInterval(progressInterval);
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API error response:", response.status, errorData);
      updateProgress(0, `Error: ${response.status} - ${errorData.message || ''}`);
      throw new Error(`Server responded with ${response.status}: ${errorData.message || ''}`);
    }
    
    const data = await response.json();
    console.log("API processing successful with method:", data.processingMethod);
    console.log("Content length:", data.content.length);
    
    // Check for processing method to give better feedback
    if (data.processingMethod) {
      const method = data.processingMethod.toLowerCase();
      if (method.includes('claude-vision') || method.includes('ai vision')) {
        updateProgress(80, 'AI Vision text extraction complete');
        setProcessingPhase('vision-completed');
      } else if (method.includes('ocr')) {
        updateProgress(80, 'OCR text extraction complete');
        setProcessingPhase('ocr-completed');
      } else if (method.includes('pdf')) {
        updateProgress(80, 'PDF text extraction complete');
        setProcessingPhase('pdf-completed');
      }
    }
    
    updateProgress(90, 'Finalizing text extraction...');
    
    // Set the extracted text in the textarea
    extractedText = data.content;
    setTextInput(extractedText);
    
    // Check if we received page count info
    if (data.pageCount) {
      setTotalPages(data.pageCount);
      updateProgress(95, `Processed ${data.pageCount} pages`);
    }
    
    // Try to extract metadata from the processed text
    await extractMetadata(extractedText);
    
    updateProgress(100, 'Processing complete');
    
    // Switch to text tab to show the extracted content
    setActiveTab('text');
    
  } catch (error) {
    console.error('Error processing file:', error);
    // Fix the type error by properly checking the error type
    setFileError(
      error instanceof Error 
        ? error.message 
        : 'Failed to process file. Please try again or use text input instead.'
    );
    updateProgress(0, 'Processing failed');
  } finally {
    // Simulate completion with a slight delay for smoother UX
    setTimeout(() => {
      setUploadingFile(false);
      
      // Don't immediately hide progress indicator so users can see completion
      setTimeout(() => {
        setShowDetailedProgress(false);
        setUploadProgress(0);
        setUploadStage('');
        setProgressMessages([]);
      }, 3000);
    }, 500);
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

  // Handle text area drag over
  const handleTextAreaDragOver = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if the dragged item is a file
    if (e.dataTransfer.types.includes('Files')) {
      // Switch to file upload tab
      setActiveTab('file');
      
      // Add visual cue that we're switching tabs
      e.currentTarget.classList.add('border-amber-500', 'bg-amber-50/50');
      
      // Show a temporary message
      const oldPlaceholder = e.currentTarget.placeholder;
      e.currentTarget.placeholder = "Switching to file upload...";
      
      // Reset the placeholder after a short delay
      setTimeout(() => {
        if (e.currentTarget) {
          e.currentTarget.placeholder = oldPlaceholder;
          e.currentTarget.classList.remove('border-amber-500', 'bg-amber-50/50');
        }
      }, 800);
    }
  };

  // Prevent default behavior when dragging leaves
  const handleTextAreaDragLeave = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-amber-500', 'bg-amber-50/50');
  };

  // Handle paste in textarea
  const handleTextPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text');
    
    // If user is pasting a substantial amount of text, schedule metadata detection
    if (pastedText.length > 200) {
      // Wait a bit to let the paste complete
      setTimeout(() => {
        extractMetadata(textInput + pastedText);
      }, 500);
    }
  };

  // Extract metadata from text
  const extractMetadata = async (text: string) => {
    if (disableMetadataDetection) {
      return null; // Skip metadata detection entirely if disabled
    }
    
    if (!text || text.trim().length < 50) {
      return null; // Skip if text is too short
    }
    
    // Avoid multiple simultaneous extraction attempts
    if (isExtractingMetadata) return null;
    
    setIsExtractingMetadata(true);
    
    try {
      const response = await fetch('/api/extract-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const metadata = await response.json();
      console.log("Extracted metadata:", metadata);
      
      // Only show prompt if we have meaningful metadata
      if (metadata.date || metadata.author || metadata.title) {
        setDetectedMetadata(metadata);
        setShowMetadataPrompt(true);
      }
      
      return metadata;
    } catch (error) {
      console.error("Error extracting metadata:", error);
      return null;
    } finally {
      setIsExtractingMetadata(false);
    }
  };

  // Listen for WebSocket or SSE updates from the server (simulation for now)
  useEffect(() => {
    // This would be where we'd connect to a real WebSocket for progress updates
    // For now, we'll just focus on the UI components
    return () => {
      // Cleanup any event listeners or connections
    };
  }, []);

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
      
      {/* Detailed Progress UI */}
      {showDetailedProgress && (
        <div className="mb-6 overflow-hidden animate-in fade-in slide-in-from-bottom duration-300">
          <div className="mb-2 flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-sm font-medium text-slate-700 mr-2">{uploadStage}</span>
              {currentPageInfo && (
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  {currentPageInfo}
                </span>
              )}
            </div>
            <span className="text-sm font-medium text-slate-700">{uploadProgress}%</span>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div 
              className={`h-2.5 rounded-full transition-all duration-500 ${
                uploadProgress === 0 ? 'bg-red-500' : 
                uploadProgress === 100 ? 'bg-emerald-500' : 
                'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600'
              }`}
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          
          {/* Status message log */}
          <div className="mt-2 max-h-24 overflow-y-auto text-xs space-y-1">
            {progressMessages.slice(-5).map((message, idx) => (
              <div 
                key={idx} 
                className={`py-1 px-2 rounded ${
                  idx === progressMessages.length - 1 
                    ? 'bg-slate-100 text-slate-700' 
                    : 'text-slate-500'
                }`}
              >
                {message}
              </div>
            ))}
          </div>
          
          {/* Special progress indicators for different phases */}
          {processingPhase === 'pdf-processing' && (
            <div className="mt-3 text-xs text-slate-600 bg-blue-50 p-2 rounded border border-blue-100">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-blue-500 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                PDF processing may take longer for multi-page documents. Each page requires separate processing.
              </div>
            </div>
          )}
          
          {processingPhase === 'vision-completed' && (
            <div className="mt-3 text-xs text-slate-600 bg-emerald-50 p-2 rounded border border-emerald-100">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-emerald-500 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                AI Vision successfully extracted text from your document.
              </div>
            </div>
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
            onPaste={handleTextPaste}
            onDragOver={handleTextAreaDragOver}
            onDragLeave={handleTextAreaDragLeave}
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
          className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center transition-colors hover:bg-slate-50 hover:border-amber-700/50 cursor-pointer min-h-[200px] flex flex-col items-center justify-center relative"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleFileDrop}
          onClick={() => !uploadingFile && fileInputRef.current?.click()}
        >
          {!uploadingFile ? (
            // Regular upload UI
            <>
              <svg className="w-8 h-8 mx-auto text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-slate-700 font-medium">Drag & drop your file here</p>
              <p className="text-xs text-slate-500 mt-1">or click to browse (PDF, JPG, PNG, TXT)</p>
              <p className="text-xs text-slate-400 mt-2">Files up to 10MB supported</p>
              
              {fileError && (
                <div className="mt-4 py-2 px-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-700 max-w-md mx-auto">
                  <div className="flex items-start">
                    <svg className="w-4 h-4 text-amber-500 mt-0.5 mr-1.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{fileError}</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            // Upload in progress UI - Enhanced with beautiful animation
            <div className="w-full flex flex-col items-center justify-center transition-all duration-300 ease-in-out">
              {/* Beautiful progress bar with gradient and soft animation */}
              <div className="w-full max-w-md h-1.5 bg-slate-100 rounded-full mb-6 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 rounded-full transition-all duration-700 ease-out"
                  style={{ 
                    width: `${uploadProgress}%`,
                    boxShadow: '0 0 8px rgba(245, 158, 11, 0.5)'
                  }}
                ></div>
              </div>
              
              {/* Animated dots */}
              <div className="flex space-x-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-[pulse_1.5s_ease-in-out_0s_infinite]"></div>
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-[pulse_1.5s_ease-in-out_0.3s_infinite]"></div>
                <div className="w-2 h-2 rounded-full bg-amber-600 animate-[pulse_1.5s_ease-in-out_0.6s_infinite]"></div>
              </div>
              
              {/* Status text with subtle animation */}
              <div className="text-center">
                <h3 className="text-slate-700 font-medium text-lg mb-1 animate-pulse">
                  {uploadStage}
                </h3>
                <p className="text-slate-500 text-sm">
                  {uploadProgress < 100 ? 'Please wait while we process your file' : 'Almost done...'}
                </p>
                
                {/* Show current page info if available */}
                {currentPageInfo && (
                  <div className="mt-2 text-xs font-medium bg-blue-50 text-blue-700 py-1 px-2 rounded inline-block">
                    {currentPageInfo}
                  </div>
                )}
                
                {fileError && (
                  <div className="mt-4 py-2 px-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-700 max-w-md mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-start">
                      <svg className="w-4 h-4 text-amber-500 mt-0.5 mr-1.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>{fileError}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Hidden file input that will be triggered on click */}
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileSelect} 
            accept=".pdf,.jpg,.jpeg,.png,.txt" 
            disabled={uploadingFile}
          />
        </div>
      )}
      
      {/* AI Vision toggle */}
      {activeTab === 'file' && (
        <div className="flex items-center bg-indigo-50 p-4 rounded-md border border-indigo-100 mt-3">
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={useAIVision}
                onChange={() => setUseAIVision(!useAIVision)}
                disabled={uploadingFile}
              />
              <div className={`block w-14 h-8 rounded-full ${useAIVision ? 'bg-indigo-600' : 'bg-gray-300'} transition-colors duration-300`}></div>
              <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ${useAIVision ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
            <div className="ml-3">
              <span className="text-sm font-medium text-gray-900">Use AI Vision to extract text or analyze an image</span>
              <p className="text-xs text-slate-600 mt-1">
                {useAIVision 
                  ? "Claude's AI Vision technology will be used to extract text from your file"
                  : "Traditional OCR will be tried first, with AI Vision used only as a fallback if needed"}
              </p>
            </div>
          </label>
        </div>
      )}
    </div>
  );
}