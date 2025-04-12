// components/upload/SourceUpload.tsx
// Enhanced upload component with tabbed interface supporting text, file, and audio inputs
// Provides seamless experience for all source types with optimized thumbnail generation
// and improved progress feedback

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore, Metadata } from '@/lib/store';
import UploadProgress from './UploadProgress';
import { useLibrary } from '@/lib/libraryContext';


// Constants for file size limits
const MAX_IMAGE_TEXT_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_PDF_AUDIO_SIZE = 25 * 1024 * 1024; // 25MB
const LARGE_FILE_WARN_THRESHOLD = 5 * 1024 * 1024; // 5MB



// Thumbnail dimensions
const THUMBNAIL_MAX_WIDTH = 300;
const THUMBNAIL_MAX_HEIGHT = 300;

interface SourceUploadProps {
  onTextChange?: (text: string) => void;
  onMetadataDetected?: (metadata: any) => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  useAIVision?: boolean;
  onAIVisionChange?: (useAIVision: boolean) => void;
  visionModel?: string;
  onVisionModelChange?: (model: string) => void;
  disableMetadataDetection?: boolean;
  initialText?: string;
}

export default function SourceUpload({
  onTextChange,
  onMetadataDetected,
  activeTab = 'text',
  onTabChange = () => {},
  useAIVision = false,
  onAIVisionChange = () => {},
  visionModel = 'gemini-2.0-flash-lite',
  onVisionModelChange = () => {},
  disableMetadataDetection = false
}: SourceUploadProps) {
  const router = useRouter();
  const {
    sourceContent,
    setSourceContent,
    setSourceFile,
    setSourceType,
    setSourceThumbnailUrl
  } = useAppStore();

   const { addSource, sourceExists } = useLibrary();
   const [extractedMetadata, setExtractedMetadata] = useState<any>(null);

  // --- Component State ---
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false); // General processing lock
  const [error, setError] = useState<string | null>(null); // General error message
  const [showResearchDraftModal, setShowResearchDraftModal] = useState(false);

  // Upload specific state
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState('');
  const [progressMessages, setProgressMessages] = useState<string[]>([]);
  const [showProgressUI, setShowProgressUI] = useState(false);
  const [isExtractingMetadata, setIsExtractingMetadata] = useState(false);
  const [localActiveTab, setLocalActiveTab] = useState(activeTab);
  
  // Audio state
  const [includeTimestamps, setIncludeTimestamps] = useState(true);
  const [detectSpeakers, setDetectSpeakers] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const progressTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref for hiding progress UI timer

  // --- Sync local active tab with parent ---
  useEffect(() => {
    setLocalActiveTab(activeTab);
  }, [activeTab]);

  // --- Sync text input with source content ---
 useEffect(() => {
  if (sourceContent && sourceContent !== textInput) {
    setTextInput(sourceContent);
    if (onTextChange) onTextChange(sourceContent);
  }
}, [sourceContent, textInput, onTextChange]);

// Add a new useEffect to handle tab switching after successful upload
useEffect(() => {
  // If we have uploaded content and we're not in text tab and not currently processing
  if (sourceContent && textInput && localActiveTab !== 'text' && !isProcessing && !uploadingFile) {
    // Switch back to text tab after a short delay to allow processing to complete
    const timer = setTimeout(() => {
      handleTabChange('text');
    }, 500);
    
    return () => clearTimeout(timer);
  }
}, [sourceContent, textInput, localActiveTab, isProcessing, uploadingFile]);

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

  // --- Metadata Extraction ---
const extractMetadata = async (text: string) => {
  // If already extracting, just return
  if (isExtractingMetadata) {
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
    
    // Save the extracted metadata
    setExtractedMetadata(metadataResult);
    
    if (metadataResult.date || metadataResult.author || metadataResult.title) {
      if (onMetadataDetected) {
        onMetadataDetected(metadataResult);
      }
    }
    
    return metadataResult;
  } catch (error) {
    console.error("Error extracting metadata:", error);
    return null;
  } finally {
    setIsExtractingMetadata(false);
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
    const isAudio = file.type.startsWith('audio/') || ['.mp3', '.wav', '.m4a', '.ogg'].some(ext => fileName.endsWith(ext));

    // Switch to appropriate tab based on file type
    if (isPdf || isImage || isText) {
      handleTabChange('file');
    } else if (isAudio) {
      handleTabChange('audio');
    } else {
      setError(`Unsupported file type: ${file.type || 'Unknown'}. Please use PDF, common images, text, or audio.`);
      setShowProgressUI(false); setUploadingFile(false); setIsProcessing(false);
      return;
    }
    
    const sizeLimit = isPdf || isAudio ? MAX_PDF_AUDIO_SIZE : MAX_IMAGE_TEXT_SIZE;
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
      
      try {
        // For image files, create direct object URL - most reliable approach
        generatedThumbnailUrl = URL.createObjectURL(file);
        console.log("Created image thumbnail URL:", generatedThumbnailUrl);
        
        // Set it directly in the app state
        setSourceThumbnailUrl(generatedThumbnailUrl);
        
        updateProgress(15, 'Preview generated');
      } catch (err) {
        console.error("Error creating image thumbnail:", err);
        updateProgress(15, 'Preview failed');
      }
    } else if (isPdf) {
      // For PDFs, set a placeholder thumbnail
      generatedThumbnailUrl = '/pdf-placeholder.png'; // Ensure this exists in public folder
      console.log("Using PDF placeholder thumbnail");
      setSourceThumbnailUrl(generatedThumbnailUrl);
    } else if (isAudio) {
      // For audio, set a placeholder thumbnail
      generatedThumbnailUrl = '/audio-placeholder.png'; // Ensure this exists in public folder
      console.log("Using audio placeholder thumbnail");
      setSourceThumbnailUrl(generatedThumbnailUrl);
    }

    // 4. Handle Text Files Directly (Client-Side)
    if (isText) {
      try {
        updateProgress(30, 'Analyzing text...');
        const text = await file.text();
        setSourceContent(text); 
        setSourceFile(file); 
        setSourceType('text');
        
        // Update local state and parent component
        setTextInput(text);
        if (onTextChange) onTextChange(text);
        
        updateProgress(70, 'Extracting metadata...');
        await extractMetadata(text);
        
      updateProgress(100, 'Ready for analysis');

// Get extracted metadata or create default metadata
const metadata = await extractMetadata(text) || {
  author: file.name.split('.')[0],
  date: 'Unknown date',
  researchGoals: '',
  title: file.name || 'Text Document'
};

// Save source to library with metadata
if (!sourceExists(text)) {
  addSource({
    content: text,
    metadata: metadata,
    type: 'text',
    tags: [],
    category: 'Text Documents'
  });
  console.log('Text source automatically saved to library with metadata:', metadata);
}

setIsProcessing(false); 
setUploadingFile(false);
progressTimeoutRef.current = setTimeout(() => setShowProgressUI(false), 2000);
return;
        
        progressTimeoutRef.current = setTimeout(() => setShowProgressUI(false), 2000);
        return;
      } catch (err) {
        console.error("Error reading text file:", err);
        setError("Failed to read text file. Please try another file or paste your text directly.");
        setShowProgressUI(false); 
        setUploadingFile(false); 
        setIsProcessing(false);
        return;
      }
    }

    // 5. Upload PDF/Image/Audio to API for Text Extraction
try {
  updateProgress(20, 'Extracting text...');
  const formData = new FormData();
  formData.append('file', file);
  formData.append('useAIVision', useAIVision.toString());
  formData.append('visionModel', visionModel);
  
  // For audio files, add transcription options
  if (isAudio) {
    formData.append('includeTimestamps', includeTimestamps.toString());
    formData.append('detectSpeakers', detectSpeakers.toString());
  }
  
  const endpoint = isAudio ? '/api/upload-audio' : '/api/upload';
  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Server error: ${errorData.message || response.status}`);
  }
  
  const data = await response.json();
  console.log("API Response:", data);
  updateProgress(90, `Server processed using ${data.processingMethod || 'method'}`);
  
  // 6. Update Store with content and file info
  setSourceContent(data.content || '');
  setSourceFile(file);
  setSourceType(isPdf ? 'pdf' : isImage ? 'image' : isAudio ? 'audio' : 'text');
  
  // Handle thumbnails from the API response
  if (data.thumbnailUrl) {
    console.log("Received thumbnail URL from server:", data.thumbnailUrl.substring(0, 50) + "...");
    useAppStore.getState().setSourceThumbnailUrl(data.thumbnailUrl);
  } else if (isPdf) {
    // Fallback to placeholder for PDFs
    console.log("No thumbnail from API, using PDF placeholder");
    useAppStore.getState().setSourceThumbnailUrl('/pdf-placeholder.png');
  } else if (isImage) {
    // Create local thumbnail for images if no server thumbnail
    try {
      const thumbnailUrl = URL.createObjectURL(file);
      console.log("Created local image thumbnail URL");
      useAppStore.getState().setSourceThumbnailUrl(thumbnailUrl);
    } catch (err) {
      console.error("Error creating local image thumbnail:", err);
    }
  }
  
  // 7. Update local state and parent component
  setTextInput(data.content || '');
  if (onTextChange) onTextChange(data.content || '');
  
  // 8. Extract Metadata
  updateProgress(95, 'Extracting metadata...');
  if (data.content) await extractMetadata(data.content);
  updateProgress(100, 'Ready for analysis');
  // Get or create metadata
let sourceMetadata;
if (data.content) {
  // Try to extract metadata first
  sourceMetadata = await extractMetadata(data.content) || {};
}

// Enhance metadata with file information if missing
const enhancedMetadata = {
  author: sourceMetadata?.author || file.name.split('.')[0],
  date: sourceMetadata?.date || 'Unknown date',
  researchGoals: sourceMetadata?.researchGoals || '',
  title: sourceMetadata?.title || file.name,
  ...sourceMetadata
};

// Save to library
if (!sourceExists(data.content)) {
  addSource({
    content: data.content || '',
    metadata: enhancedMetadata,
    type: isPdf ? 'pdf' : isImage ? 'image' : isAudio ? 'text' : 'text',
    tags: sourceMetadata?.tags || [],
    category: isPdf ? 'PDF Documents' : isImage ? 'Images' : isAudio ? 'Audio Transcripts' : 'Text Documents'
  });
  console.log('Source automatically saved to library with metadata:', enhancedMetadata);
}

progressTimeoutRef.current = setTimeout(() => setShowProgressUI(false), 2000);
} catch (err) {
  console.error('Upload/Processing error:', err);
  setError(`Processing failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
  updateProgress(0, 'Failed');
  progressTimeoutRef.current = setTimeout(() => setShowProgressUI(false), 3000);
} finally {
  setIsProcessing(false); 
  setUploadingFile(false);
}
};

  // --- Handle Tab Change ---
const handleTabChange = (tab: string) => {
  setLocalActiveTab(tab);
  onTabChange(tab);
  
  if (localActiveTab === 'text' && tab !== 'text') {
  }
};

  // --- Event Handlers ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => { 
    if (e.target.files?.[0]) processFile(e.target.files[0]); 
    e.target.value = ''; // Reset input
  };
  
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => { 
    e.preventDefault(); 
    e.currentTarget.classList.remove('border-amber-500', 'bg-amber-50/50'); 
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]); 
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { 
    e.preventDefault(); 
    e.currentTarget.classList.add('border-amber-500', 'bg-amber-50/50'); 
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { 
    e.preventDefault(); 
    e.currentTarget.classList.remove('border-amber-500', 'bg-amber-50/50'); 
  };
  
  const handleTextAreaDragOver = (e: React.DragEvent<HTMLTextAreaElement>) => { 
    if (e.dataTransfer.types.includes('Files')) { 
      e.preventDefault(); 
      handleTabChange('file'); 
    } 
  };
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setTextInput(newText);
    setSourceContent(newText);
    if (onTextChange && !disableMetadataDetection) onTextChange(newText);
  };
  
  const handleTextPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => { 
    const pastedText = e.clipboardData.getData('text');
    if (pastedText.length > 200) {
      setTimeout(() => {
        extractMetadata(textInput + pastedText);
      }, 500);
    }
  };
  
  const handleAddResearchDraft = () => {
    setShowResearchDraftModal(true);
  };
  
  // Audio option handlers
  const handleTimestampsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIncludeTimestamps(e.target.checked);
  };
  
  const handleSpeakersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDetectSpeakers(e.target.checked);
  };

  // --- Cleanup timer on unmount ---
  useEffect(() => {
    return () => {
      if (progressTimeoutRef.current) {
        clearTimeout(progressTimeoutRef.current);
      }
      
      // Clean up any object URLs when the component unmounts
      const thumbnailUrl = useAppStore.getState().sourceThumbnailUrl;
      if (thumbnailUrl && thumbnailUrl.startsWith('blob:')) {
        URL.revokeObjectURL(thumbnailUrl);
        console.log("Cleaned up thumbnail URL on unmount");
      }
    };
  }, []);



  // --- Component Render ---
  return (
    <>
     {/* Tab Navigation */}
<div className="flex border-b border-slate-200 mx-1 mb-3 relative">
  {/* Animated tab indicator - position and width will be calculated dynamically */}
  <div 
    className="absolute bottom-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-500 
      transition-all duration-300 ease-in-out transform-gpu shadow-sm shadow-amber-200/30"
    style={{
      left: localActiveTab === 'text' 
        ? '0px' 
        : localActiveTab === 'file' 
          ? '115px' // Approximate width of first tab
          : '245px', // Approximate width of first two tabs combined
      width: localActiveTab === 'text' 
        ? '105px'  // Width of "Text Input" tab
        : localActiveTab === 'file' 
          ? '110px' // Width of "File Upload" tab
          : '120px'  // Width of "Audio Upload" tab
    }}
  />

  <button
    onClick={() => handleTabChange('text')}
    className={`
      flex items-center px-2 py-1.5 text-sm font-medium
      transition-colors relative
      ${localActiveTab === 'text' ? 'text-amber-600' : 'text-slate-600 hover:text-amber-500'}
    `}
  >
    <svg className={`w-4 h-4 mr-1.5 ${localActiveTab === 'text' ? 'text-amber-500' : 'text-slate-500'}`} 
        fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
    Text Input
  </button>
  
  <button
    onClick={() => handleTabChange('file')}
    className={`
      flex items-center px-4 py-1.5 text-sm font-medium
      transition-colors relative
      ${localActiveTab === 'file' ? 'text-amber-600' : 'text-slate-600 hover:text-amber-500'}
    `}
  >
    <svg className={`w-4 h-4 mr-1.5 ${localActiveTab === 'file' ? 'text-amber-500' : 'text-slate-500'}`} 
        fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
    File Upload
  </button>
  
  <button
    onClick={() => handleTabChange('audio')}
    className={`
      flex items-center px-4 py-1.5 text-sm font-medium
      transition-colors relative
      ${localActiveTab === 'audio' ? 'text-amber-600' : 'text-slate-600 hover:text-amber-500'}
    `}
  >
    <svg className={`w-4 h-4 mr-1.5 ${localActiveTab === 'audio' ? 'text-amber-500' : 'text-slate-500'}`} 
        fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
    Audio Upload
  </button>

    

</div>

      {/* General Error Display */}
      {error && !showProgressUI && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-4 text-sm flex items-start gap-2" role="alert">
          <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Progress UI */}
    {/* Progress UI */}
{showProgressUI && (
  <div className="absolute inset-0 z-10 bg-black/10  rounded-xl flex items-center justify-center">
    <UploadProgress 
      show={showProgressUI}
      progress={uploadProgress}
      currentMessage={uploadStage}
      messages={progressMessages}
    />
  </div>
)}

      {/* Tab Content */}
      <div className={`${isProcessing ? 'opacity-60 pointer-events-none' : ''} transition-opacity duration-300 relative`}>
        {localActiveTab === 'text' && (
          
          // --- Text Input Tab ---
          <div className="rounded-xl overflow-hidden border border-slate-200">
            <textarea
              className="w-full min-h-[22rem] p-5 border-none focus:ring-0 focus:outline-none resize-none text-slate-700 placeholder-slate-400 transition-colors"
              placeholder="Paste or type your primary source text here, or drag and drop a PDF..."
              value={textInput}
              onChange={handleTextChange}
              onPaste={handleTextPaste}
              onDragOver={handleTextAreaDragOver}
              disabled={isProcessing}
              aria-label="Source Text Input"
              style={{ fontSize: '16px', lineHeight: '1.6' }}
            />
          </div>
        )}
        
        {localActiveTab === 'file' && (
          // --- File Upload Tab ---
          <div>
          
          {/* Drop Zone */}
<div
  className={`
    border-2 border-dashed rounded-lg p-6 text-center 
    transition-all duration-200 ease-in-out 
    ${isProcessing
      ? 'bg-slate-100 border-slate-300 cursor-wait' 
      : 'border-slate-300 hover:border-amber-500 hover:bg-amber-50/60 cursor-pointer'
    } 
    min-h-[20rem] flex flex-col items-center justify-center relative
  `}
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
    </div>
  ) : (
    // Default Drop Zone UI
    <>
      <svg className="w-10 h-10 mx-auto text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
      <p className="text-slate-700 font-medium mb-1">Drag & drop your file</p>
      <p className="text-xs text-slate-500">or click to browse • PDF, Image, Text (Max 25MB)</p>
    </>
  )}
  {/* Hidden file input */}
  <input
    type="file"
    className="hidden"
    ref={fileInputRef}
    onChange={handleFileSelect}
    accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.bmp,.txt"
    disabled={uploadingFile || isProcessing}
    aria-label="File Upload Input"
  />
</div>

            {/* AI Vision Toggle */}
            <div className={`flex items-center bg-indigo-50 p-1 px-4 rounded-md border border-indigo-100 mt-2 ${isProcessing ? 'opacity-50' : ''}`}>
              <label className={`flex items-center ${isProcessing ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={useAIVision}
                    onChange={() => !isProcessing && onAIVisionChange(!useAIVision)}
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
            
            {/* Vision Model Selection (only shown when AI Vision is enabled) */}
            {useAIVision && (
              <div className="mt-2 flex items-center gap-3 pl-14">
                <input
                  type="radio"
                  id="model-gemini"
                  name="visionModel"
                  value="gemini-2.0-flash-lite"
                  checked={visionModel === 'gemini-2.0-flash-lite'}
                  onChange={() => onVisionModelChange('gemini-2.0-flash-lite')}
                  disabled={isProcessing}
                  className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <label htmlFor="model-gemini" className="text-sm text-slate-700">
                  Gemini 2.0 Lite (Default)
                </label>
                
                <input
                  type="radio"
                  id="model-claude"
                  name="visionModel"
                  value="claude-3-haiku-latest"
                  checked={visionModel === 'claude-3-haiku-latest'}
                  onChange={() => onVisionModelChange('claude-3-haiku-latest')}
                  disabled={isProcessing}
              className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <label htmlFor="model-claude" className="text-sm text-slate-700">
              Claude 3.5 Haiku
            </label>
          </div>
        )}
      </div>
    )}
    
    {localActiveTab === 'audio' && (
      // --- Audio Upload Tab ---
      <div>
        {/* Audio Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ease-in-out ${
            isProcessing
              ? 'bg-slate-100 border-slate-300 cursor-wait' // Indicate waiting state
              : 'border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/60 cursor-pointer'
          } min-h-[20rem] flex flex-col items-center justify-center relative`}
          onDragOver={isProcessing ? undefined : handleDragOver}
          onDragLeave={isProcessing ? undefined : handleDragLeave}
          onDrop={isProcessing ? undefined : handleFileDrop}
          onClick={() => (isProcessing ? undefined : audioInputRef.current?.click())}
          aria-disabled={isProcessing}
        >
          {uploadingFile ? (
            // Uploading State UI
            <div className="text-center">
              <svg className="w-14 h-14 mx-auto text-indigo-500 mb-3 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-slate-600 font-medium text-xl">Processing audio...</p>
              <p className="text-slate-500 mt-2">Transcribing and extracting text</p>
            </div>
          ) : (
            // Default Audio Drop Zone UI
            <>
              <svg className="w-20 h-10 mx-auto text-slate-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <p className="text-slate-700 font-medium text-md mb-2">Drag & drop audio file</p>
              <p className="text-xs text-slate-500">or click to browse</p>
              <p className="text-sm text-slate-400 mt-3">Supports MP3, WAV, M4A, OGG files (Max 25MB)</p>
            </>
          )}
          {/* Hidden audio input */}
          <input
            type="file"
            className="hidden"
            ref={audioInputRef}
            onChange={handleFileSelect}
            accept=".mp3,.wav,.m4a,.ogg,audio/*"
            disabled={uploadingFile || isProcessing}
            aria-label="Audio Upload Input"
          />
        </div>
        
       {/* Audio transcription options */}
<div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-between text-xs">
  <h3 className="font-medium text-slate-700">Transcription Options:</h3>
  <div className="flex items-center gap-4">
    <label className="flex items-center cursor-pointer">
      <input
        id="transcribe-with-timestamps"
        type="checkbox"
        className="h-3.5 w-3.5 text-amber-500 focus:ring-amber-400 border-slate-300 rounded"
        checked={includeTimestamps}
        onChange={handleTimestampsChange}
        disabled={isProcessing}
      />
      <span className="ml-1.5 text-slate-700">Timestamps</span>
    </label>
    <label className="flex items-center cursor-pointer">
      <input
        id="detect-speakers"
        type="checkbox"
        className="h-3.5 w-3.5 text-amber-500 focus:ring-amber-400 border-slate-300 rounded"
        checked={detectSpeakers}
        onChange={handleSpeakersChange}
        disabled={isProcessing}
      />
      <span className="ml-1.5 text-slate-700">Detect speakers</span>
    </label>
  </div>

         
        </div>
      </div>
    )}
  </div>
  
  {/* Research Draft Button */}
  <div className="mt-5">
    <button
      onClick={handleAddResearchDraft}
      className="flex items-center text-slate-500 hover:text-teal-800 text-sm transition-colors"
    >
      <svg className="w-4 h-4 mr-1 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Add Research Draft
    </button>
  </div>

  {/* Add Research Draft Modal (placeholder) */}
  {showResearchDraftModal && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-medium mb-4">Add Research Draft</h3>
        <p className="text-slate-600 mb-4">
          This in-development feature will allow you to add research notes, context, or drafts to your analysis.
        </p>
        {/* Modal content would go here */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowResearchDraftModal(false)}
            className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )}
</>
);
}
