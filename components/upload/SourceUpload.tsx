// components/upload/SourceUpload.tsx
// Vercel-friendly upload component with client-side image thumbnail generation,
// improved UI, and smoother progress feedback.

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore, Metadata } from '@/lib/store'; // Assuming Metadata type is exported from store

// Constants for file size limits
const MAX_IMAGE_TEXT_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_PDF_AUDIO_SIZE = 25 * 1024 * 1024; // 25MB (Adjust if needed for audio)
const LARGE_FILE_WARN_THRESHOLD = 5 * 1024 * 1024; // 5MB

// Thumbnail dimensions
const THUMBNAIL_MAX_WIDTH = 300;
const THUMBNAIL_MAX_HEIGHT = 300;

export default function SourceUpload() {
  const router = useRouter();
  const {
    setSourceContent,
    setSourceFile,
    setSourceType,
    setMetadata,
    setShowMetadataModal,
    setSourceThumbnailUrl,
    // Add other actions if needed, e.g., setLoading
  } = useAppStore();

  // --- Component State ---
  const [textInput, setTextInput] = useState('');
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');
  const [isProcessing, setIsProcessing] = useState(false); // General processing lock
  const [error, setError] = useState<string | null>(null); // General error message

  // Upload specific state
  const [uploadingFile, setUploadingFile] = useState(false); // Controls dropzone UI during API call
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState('');
  const [progressMessages, setProgressMessages] = useState<string[]>([]);
  const [showProgressUI, setShowProgressUI] = useState(false);

  // Metadata related state
  const [useAIVision, setUseAIVision] = useState(false); // Keep if used by API
  const [isExtractingMetadata, setIsExtractingMetadata] = useState(false);
  const [detectedMetadata, setDetectedMetadata] = useState<Metadata | null>(null);
  // const [showMetadataPrompt, setShowMetadataPrompt] = useState(false); // Handled by global setShowMetadataModal now?
  const [disableMetadataDetection, setDisableMetadataDetection] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref for hiding progress UI timer

  // --- Helper to update progress state ---
  const updateProgress = useCallback((progress: number, message: string) => {
    setUploadProgress(progress);
    setUploadStage(message);
    setProgressMessages(prev => {
        // Keep only the last 5 messages for display, add if new
        const newMessages = (prev.length === 0 || prev[prev.length - 1] !== message)
            ? [...prev, message]
            : prev;
        return newMessages.slice(-5); // Limit log size
    });
  }, []);

  // --- Helper function to generate image thumbnail client-side ---
  const createImageThumbnail = (file: File, maxWidth: number = THUMBNAIL_MAX_WIDTH, maxHeight: number = THUMBNAIL_MAX_HEIGHT): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        return resolve(null);
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (!event.target?.result) return resolve(null);
        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          if (width > height) {
            if (width > maxWidth) { height = Math.round(height * (maxWidth / width)); width = maxWidth; }
          } else {
            if (height > maxHeight) { width = Math.round(width * (maxHeight / height)); height = maxHeight; }
          }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(null);
          ctx.drawImage(img, 0, 0, width, height);
          try {
            resolve(canvas.toDataURL('image/jpeg', 0.8)); // JPEG quality 0.8
          } catch (e) { console.error("Canvas toDataURL error:", e); resolve(null); }
        };
        img.onerror = () => { console.error("Image load error for thumbnail"); resolve(null); };
        img.src = event.target.result as string;
      };
      reader.onerror = () => { console.error("File read error for thumbnail"); resolve(null); };
      reader.readAsDataURL(file);
    });
  };

  // --- Metadata Extraction (Keep your existing function logic) ---
  const extractMetadata = async (text: string) => {
    if (disableMetadataDetection || !text || text.trim().length < 50 || isExtractingMetadata) {
      return null;
    }
    setIsExtractingMetadata(true);
    console.log("Extracting metadata from text snippet:", text.substring(0, 100) + "...");
    try {
      const response = await fetch('/api/extract-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) throw new Error(`Metadata API Error: ${response.status}`);
      const metadataResult = await response.json();
      console.log("Extracted metadata:", metadataResult);
      if (metadataResult.date || metadataResult.author || metadataResult.title) {
        setDetectedMetadata(metadataResult);
        // Instead of local state, directly trigger the global modal state
        setShowMetadataModal(true);
        // It's assumed the MetadataModal component will handle applying/discarding
        // and potentially navigating or updating the main metadata state.
      }
      return metadataResult;
    } catch (error) {
      console.error("Error extracting metadata:", error);
      return null;
    } finally {
      setIsExtractingMetadata(false);
    }
  };


  // --- Handle Text Submission ---
  const handleTextSubmit = async () => {
    const trimmedText = textInput.trim();
    if (!trimmedText) {
      setError('Please enter some text to analyze.');
      return;
    }
    setError(null);
    setIsProcessing(true);
    setShowProgressUI(true); // Show progress for text processing too
    updateProgress(10, 'Preparing text...');

    try {
      // Simulate some processing time
      await new Promise(res => setTimeout(res, 200));
      updateProgress(30, 'Setting up source...');

      setSourceContent(trimmedText);
      setSourceType('text');
      setSourceFile(null);
      setSourceThumbnailUrl(null);

      updateProgress(60, 'Checking for metadata...');
      const metaResult = await extractMetadata(trimmedText);

      updateProgress(100, 'Ready for analysis');

      // If metadata modal isn't shown (because nothing was detected or it was skipped), navigate.
      // Otherwise, let the metadata modal handle navigation.
      if (!useAppStore.getState().showMetadataModal) {
         router.push('/analysis');
      }
      // setLoading(true) should likely happen on the /analysis page useEffect

    } catch (err) {
        setError(`An error occurred: ${err instanceof Error ? err.message : 'Unknown error'}`);
        updateProgress(0, 'Failed');
    } finally {
        setIsProcessing(false);
        // Hide progress after a delay
        progressTimeoutRef.current = setTimeout(() => setShowProgressUI(false), 2000);
    }
  };

  // --- Process Uploaded File ---
  const processFile = async (file: File) => {
    // 1. Reset State
    setError(null);
    setProgressMessages([]);
    setUploadProgress(0);
    setUploadStage('');
    setShowProgressUI(true);
    setUploadingFile(true);
    setIsProcessing(true);
    if (progressTimeoutRef.current) clearTimeout(progressTimeoutRef.current);

    // 2. Validate File
    const fileName = file.name.toLowerCase();
    const isPdf = file.type.includes('pdf') || fileName.endsWith('.pdf');
    const isImage = file.type.startsWith('image/') || ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].some(ext => fileName.endsWith(ext));
    const isText = file.type.startsWith('text/') || fileName.endsWith('.txt');
    // const isAudio = ... // Add audio check if needed

    if (!isPdf && !isImage && !isText /* && !isAudio */) {
      setError(`Unsupported file type: ${file.type || 'Unknown'}. Please use PDF, common images, or TXT.`);
      setShowProgressUI(false); setUploadingFile(false); setIsProcessing(false);
      return;
    }
    const sizeLimit = isPdf /* || isAudio */ ? MAX_PDF_AUDIO_SIZE : MAX_IMAGE_TEXT_SIZE;
    if (file.size > sizeLimit) {
      setError(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max size is ${sizeLimit / 1024 / 1024}MB.`);
      setShowProgressUI(false); setUploadingFile(false); setIsProcessing(false);
      return;
    }
    if (file.size > LARGE_FILE_WARN_THRESHOLD) {
        setError(`Large file (${(file.size / 1024 / 1024).toFixed(1)}MB). Processing may take time.`); // Show as non-blocking info
    }

    updateProgress(5, 'Preparing...');

    // 3. Generate Thumbnail (Client-side for images)
    let generatedThumbnailUrl: string | null = null;
    if (isImage) {
        updateProgress(10, 'Generating preview...');
        generatedThumbnailUrl = await createImageThumbnail(file);
        updateProgress(15, generatedThumbnailUrl ? 'Preview generated' : 'Preview failed');
    } else {
        updateProgress(15, 'Preparing upload...');
    }

    // 4. Handle Text Files Directly (Client-Side)
    if (isText) {
      try {
        updateProgress(30, 'Reading text file...');
        const text = await file.text();
        setSourceContent(text); setSourceFile(file); setSourceType('text'); setSourceThumbnailUrl(null);
        updateProgress(70, 'Extracting metadata...');
        await extractMetadata(text);
        updateProgress(100, 'Ready for analysis');
        setIsProcessing(false); setUploadingFile(false);
        if (!useAppStore.getState().showMetadataModal) router.push('/analysis');
        progressTimeoutRef.current = setTimeout(() => setShowProgressUI(false), 2000);
        return;
      } catch (err) { /* ... handle text read error ... */ return; }
    }

    // 5. Upload PDF/Image to API for Text Extraction
    try {
      updateProgress(20, 'Uploading file...');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('useAIVision', useAIVision.toString());

      // Simulate upload progress
      await new Promise(resolve => setTimeout(resolve, 500 + file.size / 80000));
      updateProgress(60, 'Upload complete. Server processing...');

      const response = await fetch('/api/upload', { method: 'POST', body: formData });

      if (!response.ok) { /* ... handle API error ... */ throw new Error(/* ... */); }

      const data = await response.json();
      console.log("API Response:", data);
      updateProgress(90, `Server processed using ${data.processingMethod || 'method'}`);

      // 6. Update Store
      setSourceContent(data.content || '');
      setSourceFile(file);
      setSourceType(isPdf ? 'pdf' : isImage ? 'image' : 'text');
      setSourceThumbnailUrl(generatedThumbnailUrl); // Use client thumb for images, null otherwise

      // 7. Extract Metadata
      updateProgress(95, 'Extracting metadata...');
      if (data.content) await extractMetadata(data.content);

      updateProgress(100, 'Ready for analysis');
      setIsProcessing(false); setUploadingFile(false);
      if (!useAppStore.getState().showMetadataModal) router.push('/analysis');
      progressTimeoutRef.current = setTimeout(() => setShowProgressUI(false), 2000);

    } catch (err) {
      console.error('Upload/Processing error:', err);
      setError(`Processing failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      updateProgress(0, 'Failed');
      setIsProcessing(false); setUploadingFile(false);
      progressTimeoutRef.current = setTimeout(() => setShowProgressUI(false), 3000);
    }
  };

  // --- Event Handlers ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files?.[0]) processFile(e.target.files[0]); e.target.value = ''; }; // Reset input
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.currentTarget.classList.remove('border-amber-500', 'bg-amber-50/50'); if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]); };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.currentTarget.classList.add('border-amber-500', 'bg-amber-50/50'); };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.currentTarget.classList.remove('border-amber-500', 'bg-amber-50/50'); };
  const handleTextAreaDragOver = (e: React.DragEvent<HTMLTextAreaElement>) => { if (e.dataTransfer.types.includes('Files')) { e.preventDefault(); setActiveTab('file'); /* Add visual cue if desired */ } };
  const handleTextAreaDragLeave = (e: React.DragEvent<HTMLTextAreaElement>) => { /* Remove visual cue if added */ };
  const handleTextPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => { /* Keep metadata trigger logic */ };

  // --- Cleanup timer on unmount ---
  useEffect(() => {
    return () => {
      if (progressTimeoutRef.current) {
        clearTimeout(progressTimeoutRef.current);
      }
    };
  }, []);


  // --- Component Render ---
  return (
    // Assuming this is rendered within a container like in app/page.tsx
    // If not, wrap with: <div className="max-w-3xl mx-auto my-10 p-6 md:p-8 bg-white rounded-xl shadow-lg border border-slate-200">
    <>
      {/* Tab Selector */}
      <div className="flex border-b border-slate-200 mb-6">
        {([['text', 'Enter Text'], ['file', 'Upload File']] as const).map(([tabId, label]) => (
          <button
            key={tabId}
            className={`py-2.5 px-5 text-sm font-medium transition-colors duration-200 ease-in-out relative focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1 ${
              activeTab === tabId
                ? 'text-amber-700'
                : 'text-slate-500 hover:text-slate-800'
            } ${isProcessing ? 'text-slate-400 cursor-not-allowed' : ''}`}
            onClick={() => !isProcessing && setActiveTab(tabId)}
            disabled={isProcessing}
          >
            {label}
            {activeTab === tabId && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600 rounded-t-full"></span>
            )}
          </button>
        ))}
      </div>

      {/* General Error Display */}
      {error && !showProgressUI && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-5 text-sm flex items-start gap-2" role="alert">
           <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
           </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Progress UI */}
      {showProgressUI && (
        <div className="mb-6 p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 shadow-sm animate-in fade-in duration-300">
          <div className="mb-2 flex justify-between items-center">
            <span className="text-sm font-medium text-slate-700">{uploadStage || 'Processing...'}</span>
            <span className="text-sm font-semibold text-amber-700">{Math.round(uploadProgress)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                uploadProgress <= 0 && error // Show red only if error happened at start
                  ? 'bg-red-500'
                  : uploadProgress >= 100
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-amber-400 to-amber-600 animate-pulse' // Add pulse during progress
              }`}
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
           <div className="mt-2 text-xs text-slate-500 text-right min-h-[1.2em]"> {/* Reserve space */}
             {progressMessages.length > 0 && progressMessages[progressMessages.length - 1]}
           </div>
        </div>
      )}

      {/* Tab Content */}
      <div className={`${isProcessing ? 'opacity-60 pointer-events-none' : ''} transition-opacity duration-300`}>
        {activeTab === 'text' ? (
          // --- Text Input Tab ---
          <div>
            <textarea
              className="w-full h-60 p-4 border border-slate-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-150 ease-in-out resize-y text-base" // Allow vertical resize
              placeholder="Paste or type your primary source text here..."
              value={textInput}
              onChange={(e) => { setTextInput(e.target.value); setError(null); }}
              onPaste={handleTextPaste}
              onDragOver={handleTextAreaDragOver}
              onDragLeave={handleTextAreaDragLeave}
              disabled={isProcessing}
              aria-label="Source Text Input"
            />
            <button
              className="mt-4 w-full bg-amber-600 text-white py-2.5 px-4 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition duration-150 ease-in-out font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleTextSubmit}
              disabled={isProcessing || !textInput.trim()}
            >
              {isProcessing && !uploadingFile ? 'Processing...' : 'Analyze Text'}
            </button>
          </div>
        ) : (
          // --- File Upload Tab ---
          <div>
            {/* Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ease-in-out min-h-[200px] flex flex-col items-center justify-center relative ${
                isProcessing
                  ? 'bg-slate-100 border-slate-300 cursor-wait' // Indicate waiting state
                  : 'border-slate-300 hover:border-amber-500 hover:bg-amber-50/60 cursor-pointer'
              }`}
              onDragOver={isProcessing ? undefined : handleDragOver}
              onDragLeave={isProcessing ? undefined : handleDragLeave}
              onDrop={isProcessing ? undefined : handleFileDrop}
              onClick={() => (isProcessing ? undefined : fileInputRef.current?.click())}
              aria-disabled={isProcessing}
            >
              {uploadingFile ? (
                // Uploading State UI
                <div className="text-center">
                   <svg className="w-10 h-10 mx-auto text-amber-500 mb-3 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  <p className="text-slate-600 font-medium">Processing file...</p>
                  {/* Stage message is now shown in the main progress UI */}
                </div>
              ) : (
                // Default Drop Zone UI
                <>
                  <svg className="w-10 h-10 mx-auto text-slate-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-slate-700 font-medium">Drag & drop your file</p>
                  <p className="text-sm text-slate-500 mt-1">or click to browse</p>
                  <p className="text-xs text-slate-400 mt-2">PDF, Image, Text (Max 10-25MB)</p>
                </>
              )}
              {/* Hidden file input */}
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.bmp,.txt" // Adjust accept types as needed
                disabled={uploadingFile || isProcessing}
                aria-label="File Upload Input"
              />
            </div>

            {/* AI Vision Toggle */}
            <div className={`flex items-center bg-indigo-50 p-4 rounded-md border border-indigo-100 mt-4 ${isProcessing ? 'opacity-50' : ''}`}>
              <label className={`flex items-center ${isProcessing ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                 <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only peer" // Use peer for styling
                      checked={useAIVision}
                      onChange={() => !isProcessing && setUseAIVision(!useAIVision)}
                      disabled={isProcessing}
                    />
                    <div className="block w-11 h-6 rounded-full bg-gray-300 peer-checked:bg-indigo-600 transition duration-200 ease-in-out"></div>
                    <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></div>
                  </div>
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-900">Use AI Vision</span>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {useAIVision ? "AI Vision extracts text (PDF/Image)." : "Standard methods first."}
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}
      </div>
    </>
   
  );
}