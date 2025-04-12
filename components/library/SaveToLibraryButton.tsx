// components/library/SaveToLibraryButton.tsx
'use client';

import React, { useState } from 'react';
import { useLibrary } from '@/lib/libraryContext';

// Props interface
interface SaveToLibraryButtonProps {
  // Type of content being saved
  type: 'reference' | 'analysis' | 'source';
  
  // Data specific to each type
  data: any;
  
  // Optional styling props
  className?: string;
  iconOnly?: boolean;
  variant?: 'primary' | 'secondary' | 'text';
  size?: 'sm' | 'md' | 'lg';
  
  // Optional callback after saving
  onSave?: (id: string) => void;
}

export default function SaveToLibraryButton({
  type,
  data,
  className = '',
  iconOnly = false,
  variant = 'primary',
  size = 'md',
  onSave
}: SaveToLibraryButtonProps) {
  const library = useLibrary();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error' | 'exists'>('idle');
  const [showTooltip, setShowTooltip] = useState(false);

  // Handle saving to library
  const handleSave = async () => {
    if (saveStatus === 'saving') return;
    
    setSaveStatus('saving');
    let exists = false;
    
    try {
      // Check if the item already exists in the library
      if (type === 'reference' && data.citation) {
        exists = library.referenceExists(data.citation);
      } else if (type === 'source' && data.content) {
        exists = library.sourceExists(data.content);
      }
      
      // If it exists, don't save again
      if (exists) {
        setSaveStatus('exists');
        setShowTooltip(true);
        setTimeout(() => {
          setSaveStatus('idle');
          setShowTooltip(false);
        }, 2000);
        return;
      }
      
      // Save the item based on its type
      let newId: string;
      switch (type) {
        case 'reference':
          newId = await library.addReference(data);
          break;
        case 'analysis':
          newId = await library.addAnalysis(data);
          break;
        case 'source':
          newId = await library.addSource(data);
          break;
        default:
          throw new Error(`Unsupported type: ${type}`);
      }
      
      // Show success feedback
      setSaveStatus('success');
      setShowTooltip(true);
      
      // Call the optional callback
      if (onSave && newId) {
        onSave(newId);
      }
      
      // Reset after delay
      setTimeout(() => {
        setSaveStatus('idle');
        setShowTooltip(false);
      }, 2000);
    } catch (error) {
      console.error(`Error saving ${type} to library:`, error);
      setSaveStatus('error');
      setShowTooltip(true);
      
      // Reset after delay
      setTimeout(() => {
        setSaveStatus('idle');
        setShowTooltip(false);
      }, 2000);
    }
  };

  // Get button text based on status and type
  const getButtonText = () => {
    if (iconOnly) return '';
    
    switch (saveStatus) {
      case 'saving':
        return 'Saving...';
      case 'success':
        return 'Saved!';
      case 'error':
        return 'Error!';
      case 'exists':
        return 'Already saved';
      default:
        return `Save to Library`;
    }
  };

  // Get button icon based on status
  const getButtonIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        );
      case 'success':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'exists':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
    }
  };

  // Get button styles - always using green color scheme
  const getButtonStyles = () => {
    // Base styles for all buttons
    let styles = 'relative inline-flex items-center justify-center gap-1 rounded transition-all whitespace-nowrap ';
    
    // Green color scheme regardless of status
    const baseColor = saveStatus === 'success' || saveStatus === 'exists' 
      ? 'bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200'
      : saveStatus === 'error'
      ? 'bg-red-100 text-red-700 border-red-300 hover:bg-emerald-200'
      : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100';
    
    // Size-specific styles
    switch (size) {
      case 'sm':
        styles += 'text-xs ';
        styles += iconOnly ? 'p-1 ' : 'px-2 py-1 ';
        break;
      case 'lg':
        styles += 'text-base ';
        styles += iconOnly ? 'p-2 ' : 'px-4 py-2 ';
        break;
      default: // md
        styles += 'text-sm ';
        styles += iconOnly ? 'p-1.5 ' : 'px-3 py-1.5 ';
    }
    
    // Apply colors based on variant but keeping the green scheme
    switch (variant) {
      case 'secondary':
        styles += `${baseColor} border `;
        break;
      case 'text':
        styles += 'text-red-600 hover:bg-emerald-50 border border-transparent ';
        break;
      default: // primary
        styles += saveStatus === 'success' || saveStatus === 'exists'
          ? 'bg-emerald-500 text-white border border-emerald-600 hover:bg-emerald-600 '
          : saveStatus === 'error'
          ? 'bg-red-500 text-white border border-red-600 hover:bg-emerald-800 '
          : 'bg-emerald-500 text-white border border-emerald-600 hover:bg-emerald-600 ';
    }
    
    // Shadow effect
    styles += 'shadow-sm hover:shadow ';
    
    // Custom class passed as prop
    styles += className;
    
    return styles;
  };

  // Get tooltip text
  const getTooltipText = () => {
    switch (saveStatus) {
      case 'success':
        return `Saved to library!`;
      case 'error':
        return `Failed to save ${type}`;
      case 'exists':
        return `Already in your library`;
      default:
        return `Save to library`;
    }
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleSave}
        className={getButtonStyles()}
        disabled={saveStatus === 'saving'}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => saveStatus === 'idle' && setShowTooltip(false)}
        aria-label={`Save ${type} to library`}
      >
        <span className="flex items-center">
          {getButtonIcon()}
          {!iconOnly && <span className="ml-1">{getButtonText()}</span>}
        </span>
      </button>
      
     {/* Tooltip with improved positioning */}
     {showTooltip && (
       <div 
         className="absolute z-50 px-3 py-1.5 bg-gray-800 text-white text-xs font-medium rounded shadow-lg"
         style={{
           top: '25px',  // Fixed distance above the button
           left: '-30px',
           transform: 'translateX(-20%)',
           whiteSpace: 'nowrap',
           pointerEvents: 'none',
           animation: 'fadeIn 0.2s ease-out forwards',
         }}
       >
         {getTooltipText()}

         <div></div>
       </div>
     )}
    </div>
  );
}