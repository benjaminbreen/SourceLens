'use client';

import React, { useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { cleanOcrText, isLikelyOcrText } from '@/lib/text-processing/cleanOcrText';
import Image from 'next/image';

export default function SourceDisplay() {
  const { sourceContent, sourceType, sourceFile } = useAppStore();

  // Clean OCR text if needed
  const processedContent = useMemo(() => {
    if (!sourceContent) return '';
    
    // Check if the text is likely OCR output and clean it if needed
    if (isLikelyOcrText(sourceContent)) {
      return cleanOcrText(sourceContent);
    }
    
    return sourceContent;
  }, [sourceContent]);

  // Display different content based on source type
  const renderContent = () => {
    if (!sourceContent && !sourceFile) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-slate-500">No source content to display</p>
        </div>
      );
    }

    if (sourceType === 'pdf' && sourceFile) {
      return (
        <div className="p-4 bg-slate-50 rounded-md">
          <p className="text-slate-700 mb-2">PDF Document:</p>
          <p className="font-medium">{sourceFile.name}</p>
          <p className="text-sm text-slate-500 mt-2">
            PDF content has been extracted and cleaned for analysis.
          </p>
        </div>
      );
    }

    if (sourceType === 'image' && sourceFile) {
      return (
        <div className="flex flex-col items-center">
          <p className="text-slate-700 mb-2">Image Source:</p>
        <div className="relative w-full h-[70vh]">
  <Image 
    src={URL.createObjectURL(sourceFile)} 
    alt="Source document" 
    className="rounded-md shadow-md object-contain" 
    fill
  />
</div>
          <p className="text-sm text-slate-500 mt-2">
            Image text has been extracted and cleaned for analysis.
          </p>
        </div>
      );
    }

    // For text content
    return (
      <div className="font-serif leading-relaxed text-slate-700">
        {processedContent.split('\n\n').map((paragraph, index) => (
          <p key={index} className="mb-4">{paragraph}</p>
        ))}
      </div>
    );
  };

  return (
    <div>
      {renderContent()}
    </div>
  );
}