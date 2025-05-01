// components/notes/NotesSidePanel.tsx
// Enhanced note editor panel with improved viewing and editing experience
// - Defaults to preview mode after saving for better readability
// - Improved image handling and rendering with drag-and-drop support
// - Better content block styling and keyboard shortcuts
// - Optimized for compatibility with updated note API structure

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore, Note } from '@/lib/store';
import { useLibraryStorage, ContentBlockType } from '@/lib/libraryStorageProvider';
import { useAuth } from '@/lib/auth/authContext';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Supabase client for image uploads
const supabase = createClientComponentClient();

/**
 * Upload image to Supabase storage and return metadata
 */
async function storeImageToSupabase(
  sb: SupabaseClient,
  userId: string,
  file: File,
  id: string
): Promise<{ id: string; url: string; filename: string }> {
  if (!userId) throw new Error('No user id found');

  // Declare the bucket name
  const bucket = 'note-images';

  // Unique path per user with sanitized filename
  const path = `${userId}/${id}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '')}`;

  // Upload
  const { error } = await sb.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type
  });
  if (error) throw error;

  // Get public URL
  const { data } = sb.storage.from(bucket).getPublicUrl(path);
  const publicUrl = data?.publicUrl || '';

  return { id, url: publicUrl, filename: file.name };
}

interface NoteSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode?: boolean;
}

// Image type for uploaded images
interface NoteImage {
  id: string;
  url: string;
  filename: string;
}

// Define appendToNote function globally for the SelectionTooltip to use
declare global {
  interface Window {
    appendToNote?: (text: string, source: string, blockType?: ContentBlockType) => void;
  }
}

export default function NotesSidePanel({ isOpen, onClose, darkMode = false }: NoteSidePanelProps) {
  const { activeNote, sourceContent, metadata, sourceType } = useAppStore();
  const { user } = useAuth();
  const { saveItem, updateItem, parseNoteContent, formatContentBlock } = useLibraryStorage();
  
  const [noteContent, setNoteContent] = useState<string>('');
  const [noteId, setNoteId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'unsaved' | 'saving'>('saved');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>('');
  const [isTagInputActive, setIsTagInputActive] = useState<boolean>(false);
  const [lastInsertPosition, setLastInsertPosition] = useState<number | null>(null);
  
  // New state for handling file uploads
  const [uploadedImages, setUploadedImages] = useState<NoteImage[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  
  // Default to edit mode initially, switch to preview after saving
  const [previewMode, setPreviewMode] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Generate a consistent sourceId to ensure one note per source
  const sourceId = React.useMemo(() => {
    if (!metadata) return '';
    
    // Create a unique ID from source metadata that will be consistent
    const title = metadata.title || '';
    const author = metadata.author || '';
    const date = metadata.date || '';

    return `${title.replace(/[^a-zA-Z0-9]/g, '')}-${author.replace(/[^a-zA-Z0-9]/g, '')}-${date.replace(/[^a-zA-Z0-9]/g, '')}`;
  }, [metadata]);
  
  // Load note content from activeNote when it changes
  useEffect(() => {
    if (activeNote) {
      setNoteContent(activeNote.content || '');
      setNoteId(activeNote.id);
      setTags(activeNote.tags || []);
      setUploadedImages(activeNote.images as NoteImage[] || []);
      setSaveStatus('saved');
      // Default to preview mode when loading an existing note
      setPreviewMode(true);
    } else if (isOpen && sourceId) {
      // No active note but panel is open - start with an empty note
      setNoteContent('');
      setNoteId(null);
      setTags([]);
      setUploadedImages([]);
      setSaveStatus('saved');
      // Default to edit mode for new notes
      setPreviewMode(false);
    }
  }, [activeNote, isOpen, sourceId]);
  
  // Handle saving note with improved error handling and feedback
  const handleSaveNote = useCallback(async () => {
    if (!metadata || !sourceId) {
      console.error("Cannot save note: missing metadata or sourceId");
      return;
    }
    
    setIsSaving(true);
    setSaveStatus('saving');
    
    try {
      const currentTime = Date.now();
      
      if (noteId) {
        // Update existing note
        await updateItem('notes', noteId, {
          content: noteContent,
          lastModified: currentTime,
          tags,
          images: uploadedImages
        });
        console.log(`Note updated successfully: ${noteId}`);
      } else {
        // Create new note with all required fields
        const noteToSave: Note = {
          id: uuidv4(), // Explicitly provide a UUID to satisfy required field
          content: noteContent,
          sourceId,
          sourceMetadata: metadata,
          dateCreated: currentTime,
          lastModified: currentTime,
          tags,
          images: uploadedImages || [],
          userId: user?.id || ''
        };
        
        const newNoteId = await saveItem<Note>('notes', noteToSave);
        setNoteId(newNoteId);
        console.log(`New note created: ${newNoteId}`);
      }
      
      setSaveStatus('saved');
      setLastSaveTime(new Date());
      
      // Switch to preview mode after saving for better readability
      setPreviewMode(true);
    } catch (error) {
      console.error('Error saving note:', error);
      setSaveStatus('unsaved');
    } finally {
      setIsSaving(false);
    }
  }, [sourceId, metadata, noteId, noteContent, tags, uploadedImages, updateItem, saveItem, user?.id]);
  
  // Register the global appendToNote function for the SelectionTooltip to use
  useEffect(() => {
    window.appendToNote = (text: string, source: string, blockType: ContentBlockType = 'source') => {
      // Format the text to insert with proper tagging
      const formattedSelection = formatContentBlock(text, source, blockType);
      
      // Update the note content with the formatted selection
      setNoteContent(prev => {
        const newContent = prev + formattedSelection;
        
        // Set the insert position for highlighting
        setLastInsertPosition(prev.length);
        
        return newContent;
      });
      
      // Set status to unsaved
      setSaveStatus('unsaved');
      
      // Switch to edit mode when adding content
      setPreviewMode(false);
      
      // If the note panel isn't open, open it
      if (!isOpen) {
        const openPanelEvent = new CustomEvent('openNotePanel');
        document.dispatchEvent(openPanelEvent);
      }
      
      // Set focus to the textarea when content is appended
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          
          // Scroll to the inserted content
          if (lastInsertPosition !== null) {
            textareaRef.current.setSelectionRange(lastInsertPosition, lastInsertPosition);
            
            // This will scroll to the cursor position
            const event = new Event('focus');
            textareaRef.current.dispatchEvent(event);
          }
        }
      }, 100);
    };
    
    return () => {
      // Cleanup function to remove the global when component unmounts
      if (window.appendToNote) {
        window.appendToNote = undefined;
      }
    };
  }, [isOpen, lastInsertPosition, formatContentBlock]);
  
  // Listen for custom openNotePanel event
  useEffect(() => {
    const handleOpenNotePanel = () => {
      const event = new CustomEvent('toggleNotePanel', { detail: { open: true } });
      document.dispatchEvent(event);
    };
    
    document.addEventListener('openNotePanel', handleOpenNotePanel);
    
    return () => {
      document.removeEventListener('openNotePanel', handleOpenNotePanel);
    };
  }, []);
  
  // Highlight the newly inserted text if there is a lastInsertPosition
  useEffect(() => {
    if (lastInsertPosition !== null && textareaRef.current) {
      // Wait for the component to render
      setTimeout(() => {
        if (textareaRef.current) {
          // Find the end of the inserted text
          const endPosition = noteContent.length;
          
          // Set selection to the inserted text
          textareaRef.current.setSelectionRange(lastInsertPosition, endPosition);
          textareaRef.current.focus();
          
          // Scroll to make the selection visible
          const lineHeight = parseInt(window.getComputedStyle(textareaRef.current).lineHeight) || 20;
          const lines = noteContent.substring(0, lastInsertPosition).split('\n').length;
          textareaRef.current.scrollTop = lines * lineHeight;
          
          // Clear the last insert position after highlighting
          setTimeout(() => {
            if (textareaRef.current) {
              // Move cursor to the end
              textareaRef.current.setSelectionRange(endPosition, endPosition);
              setLastInsertPosition(null);
            }
          }, 1500);
        }
      }, 100);
    }
  }, [lastInsertPosition, noteContent]);
  
  // Set unsaved status when content changes
  useEffect(() => {
    if (saveStatus !== 'saving') {
      setSaveStatus('unsaved');
    }
  }, [noteContent, tags, uploadedImages, saveStatus]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If panel is open and Ctrl+S or Cmd+S (for Mac) is pressed, save the note
      if (isOpen && (e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveNote();
      }
      
      // If panel is open and Escape is pressed, close the panel
      if (isOpen && e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      
      // If panel is closed and Alt+N is pressed, open it
      if (!isOpen && e.altKey && e.key === 'n') {
        e.preventDefault();
        const event = new CustomEvent('toggleNotePanel', { detail: { open: true } });
        document.dispatchEvent(event);
      }
      
      // Toggle preview mode with Alt+P
      if (isOpen && e.altKey && e.key === 'p') {
        e.preventDefault();
        setPreviewMode(!previewMode);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, handleSaveNote, previewMode]);
  
  // Add a tag
  const addTag = (tag: string) => {
    const normalizedTag = tag.trim().toLowerCase();
    if (normalizedTag && !tags.includes(normalizedTag)) {
      setTags(prev => [...prev, normalizedTag]);
      setTagInput('');
      setSaveStatus('unsaved');
    }
  };
  
  // Remove a tag
  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
    setSaveStatus('unsaved');
  };
  
  // Handle tag input key down
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === 'Escape') {
      setIsTagInputActive(false);
    } else if (e.key === 'Tab' && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput);
    }
  };
  
  // Handle image upload with improved error handling
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    if (!user?.id) {
      console.error("Cannot upload: User not authenticated");
      return;
    }

    setIsUploading(true);
    setSaveStatus('unsaved');

    try {
      const newImages = await Promise.all(
        Array.from(files).map(async (file, index) => {
          const id = `img-${Date.now()}-${index}`;
          
          try {
            const stored = await storeImageToSupabase(supabase, user.id, file, id);

            // Insert reference tag at cursor
            const tag = `\n<img-ref id="${id}" filename="${file.name}">\n`;
            if (textareaRef.current) {
              const pos = textareaRef.current.selectionStart;
              setNoteContent(prev => prev.slice(0, pos) + tag + prev.slice(pos));
            } else {
              setNoteContent(prev => prev + tag);
            }
            
            return stored;
          } catch (error) {
            console.error(`Error uploading image ${file.name}:`, error);
            // Insert error placeholder if upload fails
            const tag = `\n[Image upload failed: ${file.name}]\n`;
            if (textareaRef.current) {
              const pos = textareaRef.current.selectionStart;
              setNoteContent(prev => prev.slice(0, pos) + tag + prev.slice(pos));
            }
            throw error;
          }
        })
      );

   setUploadedImages(prev => [
     ...prev,
     ...newImages.filter((img): img is NoteImage => img !== null)
   ]);

    } catch (err) {
      console.error('Error handling image uploads:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
  
  // Handle image drag and drop
  const handleDrop = async (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);

    const raw = e.dataTransfer.files;
    if (!raw || raw.length === 0) return;
    
    if (!user?.id) {
      console.error("Cannot upload: User not authenticated");
      return;
    }

    const files = Array.from(raw).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) return;

    setIsUploading(true);
    setSaveStatus('unsaved');

    try {
      const newImages = await Promise.all(
        files.map(async (file, index) => {
          const id = `img-${Date.now()}-${index}`;
          
          try {
            const stored = await storeImageToSupabase(supabase, user.id, file, id);

            const pos = textareaRef.current?.selectionStart ?? noteContent.length;
            const tag = `\n<img-ref id="${id}" filename="${file.name}">\n`;
            setNoteContent(prev => prev.slice(0, pos) + tag + prev.slice(pos));

            return stored;
          } catch (error) {
            console.error(`Error processing dropped image ${file.name}:`, error);
            return null;
          }
        })
      );

      setUploadedImages(prev => [...prev, ...newImages.filter((img): img is NoteImage => img !== null)]);

    } catch (err) {
      console.error('Error handling dropped images:', err);
    } finally {
      setIsUploading(false);
    }
  };
  
  // Handle drag over for styling
  const handleDragOver = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };
  
  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };
  
  // Function to insert a template for different content types
  const insertTemplate = (blockType: ContentBlockType) => {
    let template = '';
    
    switch (blockType) {
      case 'source':
        template = formatContentBlock('Enter quoted source text here...', metadata?.title || 'Source', 'source');
        break;
      case 'ai':
        template = formatContentBlock('Enter AI-generated content here...', 'AI Analysis', 'ai');
        break;
      case 'user':
        template = formatContentBlock('Enter your notes here...', '', 'user');
        break;
      default:
        template = formatContentBlock('Enter text here...', '', 'default');
    }
    
    if (textareaRef.current) {
      const cursorPos = textareaRef.current.selectionStart;
      const textBefore = noteContent.substring(0, cursorPos);
      const textAfter = noteContent.substring(cursorPos);
      
      setNoteContent(textBefore + template + textAfter);
      
      // Set cursor position inside the template
      const newCursorPos = cursorPos + template.indexOf('Enter') + 5;
      
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos + 20);
        }
      }, 100);
    } else {
      setNoteContent(noteContent + template);
    }
    
    setSaveStatus('unsaved');
    
    // Switch to edit mode when inserting template
    setPreviewMode(false);
  };
  
  // Parse and render the note content with special styling for tagged sections
  // Modified renderDisplayContent function that fixes the invisible text in preview mode
  const renderDisplayContent = () => {
    if (!noteContent) {
      return (
        <div className={`p-6 text-center ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          <p className="italic">No content yet. Click "Edit" to start taking notes.</p>
        </div>
      );
    }
    
    // Check if there are any blocks to parse
    const blocks = parseNoteContent(noteContent);
    
    // Fallback to displaying raw content if parsing fails or produces no blocks
    if (!blocks || blocks.length === 0) {
      return (
        <div className="p-4 whitespace-pre-wrap">
          <div className={`${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            {noteContent}
          </div>
        </div>
      );
    }
    
    // Render blocks with appropriate styling
    return (
      <div className="space-y-4 p-4">
        {blocks.map((block, index) => {
          // Check for empty blocks and render them as plain text
          if (!block.content || block.content.length === 0) {
            return (
              <div key={index} className={`whitespace-pre-wrap ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {/* Fallback to a space to ensure the block is visible */}
                &nbsp;
              </div>
            );
          }
          
          switch (block.type) {
            case 'source':
              return (
                <div 
                  key={index}
                  className={`rounded-md ${
                    darkMode ? 'bg-amber-900/20 border border-amber-800/40' : 'bg-amber-50 border border-amber-200'
                  } p-3`}
                >
                  {/* Extract metadata from content */}
                  {block.content[0]?.startsWith('TITLE:') && (
                    <h4 className={`text-xs uppercase font-medium tracking-wide ${
                      darkMode ? 'text-amber-400' : 'text-amber-700'
                    } mb-1`}>
                      {block.content[0].substring(6).trim()}
                    </h4>
                  )}
                  
                  {block.content[1]?.startsWith('DATE:') && (
                    <p className={`text-xs ${
                      darkMode ? 'text-amber-500/70' : 'text-amber-700/70'
                    } mb-2`}>
                      {block.content[1].substring(5).trim()}
                    </p>
                  )}
                  
                  {/* Display quote content in serif font */}
                  <div className={`font-serif ${
                    darkMode ? 'text-amber-100' : 'text-amber-900'
                  }`}>
                    {block.content.slice(block.content[0]?.startsWith('TITLE:') ? 
                      (block.content[1]?.startsWith('DATE:') ? 
                        (block.content[2]?.startsWith('QUOTE:') ? 3 : 2) : 1) : 0)
                      .join('\n')}
                  </div>
                </div>
              );
              
            case 'ai':
              return (
                <div 
                  key={index}
                  className={`rounded-md ${
                    darkMode ? 'bg-indigo-900/20 border border-indigo-800/40' : 'bg-indigo-50 border border-indigo-200'
                  } p-3`}
                >
                  {/* Extract metadata from content */}
                  {block.content[0]?.startsWith('MODEL:') && (
                    <h4 className={`text-xs uppercase font-medium tracking-wide ${
                      darkMode ? 'text-indigo-400' : 'text-indigo-700'
                    } mb-1`}>
                      {block.content[0].substring(6).trim()}
                    </h4>
                  )}
                  
                  {block.content[1]?.startsWith('DATE:') && (
                    <p className={`text-xs ${
                      darkMode ? 'text-indigo-500/70' : 'text-indigo-700/70'
                    } mb-2`}>
                      {block.content[1].substring(5).trim()}
                    </p>
                  )}
                  
                  {/* Display AI content in monospace font */}
                  <div className={`font-mono text-sm ${
                    darkMode ? 'text-indigo-100' : 'text-indigo-900'
                  }`}>
                    {block.content.slice(block.content[0]?.startsWith('MODEL:') ? 
                      (block.content[1]?.startsWith('DATE:') ? 
                        (block.content[2]?.startsWith('CONTENT:') ? 3 : 2) : 1) : 0)
                      .join('\n')}
                  </div>
                </div>
              );
              
            case 'user':
              return (
                <div 
                  key={index}
                  className={`rounded-md ${
                    darkMode ? 'bg-emerald-900/20 border border-emerald-800/40' : 'bg-emerald-50 border border-emerald-200'
                  } p-3`}
                >
                  {/* Extract metadata from content */}
                  {block.content[0]?.startsWith('DATE:') && (
                    <p className={`text-xs ${
                      darkMode ? 'text-emerald-500/70' : 'text-emerald-700/70'
                    } mb-2`}>
                      {block.content[0].substring(5).trim()}
                    </p>
                  )}
                  
                  {/* Display user note in regular font */}
                  <div className={`${
                    darkMode ? 'text-emerald-100' : 'text-emerald-900'
                  }`}>
                    {block.content.slice(block.content[0]?.startsWith('DATE:') ? 
                      (block.content[1]?.startsWith('NOTE:') ? 2 : 1) : 0)
                      .join('\n')}
                  </div>
                </div>
              );
              
            case 'image':
              const imageId = block.content[0];
              const image = uploadedImages.find(img => img.id === imageId);
              
              return image ? (
                <div 
                  key={index}
                  className={`rounded-md ${
                    darkMode ? 'bg-slate-800/70 border border-slate-700' : 'bg-slate-100 border border-slate-200'
                  } p-2`}
                >
                  <div className="relative w-full max-w-md mx-auto h-[200px]">
                    <Image 
                      src={image.url}
                      alt={image.filename || 'Uploaded image'}
                      fill
                      className="rounded object-contain"
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                  <p className={`text-xs text-center mt-1 ${
                    darkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    {image.filename || 'Uploaded image'}
                  </p>
                </div>
              ) : (
                <div 
                  key={index}
                  className={`rounded-md ${
                    darkMode ? 'bg-slate-800/70 border border-slate-700' : 'bg-slate-100 border border-slate-200'
                  } p-3 text-center`}
                >
                  <p className={`text-sm ${
                    darkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    [Image reference not found: {imageId}]
                  </p>
                </div>
              );
              
           default:
                       // Improved default case to ensure content is visible
                       return (
                         <div key={index} className={`whitespace-pre-wrap ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                           {block.content && block.content.length > 0 
                             ? block.content.join('\n') 
                             : noteContent // Fallback to full content if block content is empty
                           }
                         </div>
                       );
                   }
                 })}
               </div>
             );
           };
  
  // Add CSS for slide-in animation
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .note-animate-slide-in-right {
        animation: slideInRight 0.3s forwards;
      }
      
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
        }
        to {
          transform: translateX(0);
        }
      }
      
      .note-animate-in {
        animation: fadeIn 0.3s forwards;
      }
      
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      
      .note-custom-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
      }
      
      .note-custom-scrollbar::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      
      .note-custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      
      .note-custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: rgba(156, 163, 175, 0.5);
        border-radius: 3px;
      }
      
      .note-drag-over {
        background-color: rgba(219, 234, 254, 0.1) !important;
        border: 2px dashed #4f46e5 !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // Return null if not open (for animation purposes we'll handle the display in CSS)
  if (!isOpen) return null;
  
  return (
    <div 
      ref={panelRef}
      className={`fixed right-0 top-24 bottom-0 z-[500] w-full max-w-md flex flex-col ${
        darkMode ? 'bg-slate-900 border-l border-slate-700' : 'bg-white border-l border-slate-200'
      } shadow-xl transition-all duration-250 ease-in-out note-animate-slide-in-right`}
    >
      {/* Panel header */}
      <div className={`px-4 py-3 flex justify-between items-center border-b ${
        darkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-100/80'
      }`}>
        <h3 className={`font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'} flex items-center`}>
          <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Source Notes
        </h3>
        
        <div className="flex items-center space-x-3">
          {/* Save status */}
          <div className="flex items-center">
            {saveStatus === 'saved' ? (
              <span className={`text-xs ${darkMode ? 'text-green-400' : 'text-green-600'} flex items-center`}>
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Saved
              </span>
            ) : saveStatus === 'saving' ? (
              <span className={`text-xs ${darkMode ? 'text-amber-400' : 'text-amber-600'} flex items-center`}>
                <svg className="w-3 h-3 mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Saving...
              </span>
            ) : (
              <span className={`text-xs ${darkMode ? 'text-amber-400' : 'text-amber-600'} flex items-center`}>
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M19 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Unsaved
              </span>
            )}
          </div>
          
          {/* Preview/Edit toggle */}
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`p-1.5 rounded-full transition-colors ${
              darkMode 
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
            }`}
            title={previewMode ? 'Switch to edit mode' : 'Switch to preview mode'}
          >
            {previewMode ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className={`p-1.5 rounded-full transition-colors ${
              darkMode 
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
            }`}
            title="Close notes panel"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Panel content */}
      <div className="flex-1 overflow-y-auto note-custom-scrollbar">
        {previewMode ? (
          /* Preview Mode */
          renderDisplayContent()
        ) : (
          /* Edit Mode */
          <div className="p-4 space-y-4">
            {/* Source metadata badge */}
            {metadata && (
              <div className={`rounded-md ${
                darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-slate-100 border border-slate-200'
              } p-3 text-sm flex flex-col space-y-1 mb-4`}>
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    {metadata.title || 'Untitled Source'}
                  </span>
                  {metadata.date && (
                    <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {metadata.date}
                    </span>
                  )}
                </div>
                {metadata.author && (
                  <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    By {metadata.author}
                  </span>
                )}
              </div>
            )}
            
            {/* Text editor */}
            <div>
              <textarea
                ref={textareaRef}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`w-full h-[50vh] p-3 rounded-md ${
                  isDraggingOver 
                    ? 'note-drag-over' 
                    : darkMode 
                      ? 'bg-slate-800 text-slate-200 border-slate-700 focus:border-indigo-500'
                      : 'bg-white text-slate-800 border-slate-300 focus:border-indigo-500'
                } border resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors note-custom-scrollbar ${
                  isDraggingOver ? 'bg-opacity-50' : ''
                }`}
                placeholder="Enter your notes here. You can also drag and drop images."
              />
              {isUploading && (
                <div className={`mt-2 ${darkMode ? 'text-amber-400' : 'text-amber-600'} text-sm flex items-center`}>
                  <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading image...
                </div>
              )}
            </div>
            
            {/* Content blocks quick insert */}
            <div className={`flex flex-wrap gap-2 ${
              darkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>
              <span className="text-xs font-medium mt-1">Insert:</span>
              <button
                onClick={() => insertTemplate('source')}
                className={`px-2 py-1 text-xs rounded ${
                  darkMode 
                    ? 'bg-amber-900/40 text-amber-400 hover:bg-amber-900/60' 
                    : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                } transition-colors`}
              >
                Source Quote
              </button>
              <button
                onClick={() => insertTemplate('ai')}
                className={`px-2 py-1 text-xs rounded ${
                  darkMode 
                    ? 'bg-indigo-900/40 text-indigo-400 hover:bg-indigo-900/60' 
                    : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                } transition-colors`}
              >
                AI Analysis
              </button>
              <button
                onClick={() => insertTemplate('user')}
                className={`px-2 py-1 text-xs rounded ${
                  darkMode 
                    ? 'bg-emerald-900/40 text-emerald-400 hover:bg-emerald-900/60' 
                    : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                } transition-colors`}
              >
                Personal Note
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`px-2 py-1 text-xs rounded ${
                  darkMode 
                    ? 'bg-blue-900/40 text-blue-400 hover:bg-blue-900/60' 
                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                } transition-colors flex items-center`}
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Image
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageUpload}
                multiple 
              />
            </div>
            
            {/* Tags editor */}
            <div className="pt-3">
              <div className="flex items-center mb-2">
                <svg className={`w-4 h-4 mr-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span className={`text-xs font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Tags
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag, idx) => (
                  <div 
                    key={idx}
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs ${
                      darkMode 
                        ? 'bg-slate-700 text-slate-300' 
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {tag}
                    <button
                      type="button"
                      className={`ml-1 -mr-1 h-4 w-4 rounded-full inline-flex items-center justify-center ${
                        darkMode 
                          ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-600' 
                          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
                      } focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-indigo-500`}
                      onClick={() => removeTag(tag)}
                    >
                      <span className="sr-only">Remove tag</span>
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                
                {isTagInputActive ? (
                  <input
                    type="text"
                    className={`w-32 text-xs ${
                      darkMode 
                        ? 'bg-slate-700 text-slate-200 border-slate-600 focus:border-indigo-500' 
                        : 'bg-white text-slate-700 border-slate-300 focus:border-indigo-500'
                    } rounded-md border focus:outline-none focus:ring-1 focus:ring-indigo-500 px-2 py-0.5`}
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                    onBlur={() => {
                      if (tagInput.trim()) {
                        addTag(tagInput);
                      }
                      setIsTagInputActive(false);
                    }}
                    placeholder="Enter tag..."
                    autoFocus
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsTagInputActive(true)}
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                      darkMode 
                        ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add tag
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Panel footer */}
      <div className={`p-3 border-t ${
        darkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'
      }`}>
        <div className="flex justify-between items-center">
          <div>
            {lastSaveTime && (
              <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Last saved: {lastSaveTime.toLocaleTimeString()}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {previewMode ? (
              <button
                onClick={() => setPreviewMode(false)}
                className={`px-3 py-1.5 text-sm rounded-md ${
                  darkMode 
                    ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' 
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                } transition-colors`}
              >
                Edit
              </button>
            ) : (
              <button
                onClick={() => setPreviewMode(true)}
                className={`px-3 py-1.5 text-sm rounded-md ${
                  darkMode 
                    ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' 
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                } transition-colors`}
              >
                Preview
              </button>
            )}
            
            <button
              onClick={handleSaveNote}
              disabled={isSaving || saveStatus === 'saved'}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                isSaving
                  ? darkMode 
                    ? 'bg-indigo-700 text-indigo-100 opacity-70 cursor-wait' 
                    : 'bg-indigo-500 text-white opacity-70 cursor-wait'
                  : saveStatus === 'saved'
                    ? darkMode 
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : darkMode 
                      ? 'bg-indigo-600 text-white hover:bg-indigo-500' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
              } transition-colors flex items-center`}
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : saveStatus === 'saved' ? (
                <>
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Saved
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Save Note
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Keyboard shortcuts help */}
        <div className={`mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs ${
          darkMode ? 'text-slate-500' : 'text-slate-400'
        }`}>
          <span>Ctrl+S: Save</span>
          <span>Alt+P: Toggle Preview</span>
          <span>ESC: Close</span>
        </div>
      </div>
    </div>
  );
}

                