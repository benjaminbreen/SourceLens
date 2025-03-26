// components/text/CleanupText.tsx
// Modal component that uses Gemini Flash Lite to clean up OCR artifacts in text
// Processes up to 100k tokens and preserves actual line breaks and page numbers

'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';

interface CleanupTextProps {
  onClose: () => void;
}

export default function CleanupText({ onClose }: CleanupTextProps) {
  const { sourceContent, setSourceContent } = useAppStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [cleaned, setCleaned] = useState('');

  useEffect(() => {
    if (sourceContent) {
      cleanupText();
    }
  }, [sourceContent]);

  const cleanupText = async () => {
    if (!sourceContent) return;
    
    setIsProcessing(true);
    setProgress(10);
    setStatus('Analyzing text...');
    
    try {
      // Start progress animation
      let progressInterval = setInterval(() => {
        setProgress(prev => {
          // Slow down progress as we get closer to 90%
          const increment = prev < 30 ? 5 : prev < 60 ? 2 : prev < 85 ? 1 : 0.5;
          const newProgress = Math.min(prev + increment, 90);
          
          // Update status based on progress
          if (newProgress > 80 && status !== 'Almost done...') {
            setStatus('Almost done...');
          } else if (newProgress > 60 && status !== 'Improving readability...') {
            setStatus('Improving readability...');
          } else if (newProgress > 30 && status !== 'Fixing OCR artifacts...') {
            setStatus('Fixing OCR artifacts...');
          }
          
          return newProgress;
        });
      }, 300);
      
      // API call to clean text
      const response = await fetch('/api/cleanup-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: sourceContent,
          modelId: 'gemini-flash-lite', // Use the specified model
        }),
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const data = await response.json();
      setCleaned(data.cleanedText);
      setProgress(100);
      setStatus('Text cleanup complete!');
      
      // Replace the source content with cleaned text
      setSourceContent(data.cleanedText);
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error('Text cleanup error:', error);
      setStatus('Error cleaning text. Please try again.');
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 mx-4 animate-in slide-in-from-bottom-10 duration-300">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-slate-800">Cleaning Up Text</h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            disabled={isProcessing}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-slate-600 mb-4">
            Using AI to clean up OCR artifacts, fix line breaks, and improve readability while preserving content structure.
          </p>
          
          {/* Progress bar */}
          <div className="relative pt-1">
            <div className="flex items-center justify-between mb-1">
              <div>
                <span className="text-sm font-medium text-indigo-600">{status}</span>
              </div>
              <div className="text-sm text-indigo-600 font-semibold">
                {Math.round(progress)}%
              </div>
            </div>
            <div className="overflow-hidden h-2 text-xs flex rounded bg-indigo-100">
              <div 
                style={{ width: `${progress}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600 transition-all duration-300 ease-out"
              ></div>
            </div>
          </div>
        </div>
        
        {progress === 100 && (
          <div className="bg-green-50 rounded-md p-3 text-green-800 text-sm flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Text has been successfully cleaned!
          </div>
        )}
      </div>
    </div>
  );
}