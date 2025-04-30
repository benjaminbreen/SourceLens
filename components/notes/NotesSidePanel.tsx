// components/notes/NotesSidePanel.tsx
// Enhanced note editor panel with styled content blocks for different content types
// Includes visual distinction between source quotes and AI content, responsive design,
// improved tag management, and keyboard shortcuts

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { useLibraryStorage } from '@/lib/libraryStorageProvider';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { SupabaseClient } from '@supabase/supabase-js';
import { Note } from '@/lib/libraryContext'; // Import Note type

const supabase = createClientComponentClient();

/**
 * Upload a File to the "note-images" bucket, creating the bucket on
 * first use, and return the record your panel stores in the images array.
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

  // Unique path per user
  const path = `${userId}/${id}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '')}`;

  // Upload
  const { error } = await sb.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type
  });
  if (error) throw error;

  // Public URL
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
  filename?: string;
}

// Content block types for visual styling
type ContentBlockType = 'source' | 'ai' | 'user' | 'default';

// Define appendToNote function globally for the SelectionTooltip to use
declare global {
  interface Window {
    appendToNote?: (text: string, source: string, blockType?: ContentBlockType) => void;
  }
}

export default function NotesSidePanel({ isOpen, onClose, darkMode = false }: NoteSidePanelProps) {
  const { sourceContent, metadata, sourceType, setSourceContent, setMetadata, setSourceType, setSourceThumbnailUrl } = useAppStore();
  const { getItems, saveItem, updateItem } = useLibraryStorage();
  
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
  
  // Toggle between edit and preview mode
  const [previewMode, setPreviewMode] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  
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

    return `${title}-${author}-${date}`.replace(/[^a-zA-Z0-9-]/g, '');
  }, [metadata]);
  
  // Format a content block for insertion into the note
  const formatContentBlock = useCallback((text: string, source: string, blockType: ContentBlockType = 'source') => {
    // Format current time
    const now = new Date();
    const timeString = now.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    // Format based on block type
    let blockStart = '';
    
    switch (blockType) {
      case 'source':
        blockStart = `<source-content>\nTITLE: ${source}\nDATE: ${timeString}\nQUOTE:`;
        return `\n\n${blockStart}\n${text}\n</source-content>\n`;
      
      case 'ai':
        blockStart = `<ai-content>\nMODEL: ${source}\nDATE: ${timeString}\nCONTENT:`;
        return `\n\n${blockStart}\n${text}\n</ai-content>\n`;
      
      case 'user':
        blockStart = `<user-note>\nDATE: ${timeString}\nNOTE:`;
        return `\n\n${blockStart}\n${text}\n</user-note>\n`;
      
      default:
        return `\n\n${source.toUpperCase()}\n${timeString}\n\n${text}\n`;
    }
  }, []);
  
  // Handle saving note - use useCallback to define it early so we can use in useEffect
  const handleSaveNote = useCallback(async () => {
    if (!sourceId || !metadata) return;
    
    setIsSaving(true);
    setSaveStatus('saving');
    
    try {
      if (noteId) {
        // Update existing note
        await updateItem('notes', noteId, {
          content: noteContent,
          lastModified: Date.now(),
          tags,
          images: uploadedImages
        });
      } else {
        // Create new note
        const newNoteId = await saveItem('notes', {
          content: noteContent,
          sourceId,
          sourceMetadata: metadata,
          dateCreated: Date.now(),
          lastModified: Date.now(),
          tags,
          images: uploadedImages
        });
        
        setNoteId(newNoteId);
      }
      
      setSaveStatus('saved');
    } catch (error) {
      console.error('Error saving note:', error);
      setSaveStatus('unsaved');
    } finally {
      setIsSaving(false);
    }
  }, [sourceId, metadata, noteId, noteContent, tags, updateItem, saveItem, uploadedImages]);
  
  // Load existing note for this source when panel opens or source changes
  useEffect(() => {
  if (!isOpen || !sourceId) return;
  
  const loadNote = async () => {
    try {
      // Get all notes
      const notesData = await getItems('notes');
      
      // Make sure we have an array and properly type it
    const notes: Note[] = Array.isArray(notesData) ? notesData as Note[] : [];
      
      // Find a note that matches this source
      const existingNote = notes.find((note) => 'sourceId' in note && note.sourceId === sourceId);
      
      if (existingNote) {
        // Safely access properties with type checking
        if ('content' in existingNote && typeof existingNote.content === 'string') {
          setNoteContent(existingNote.content);
        }
        
        if ('id' in existingNote && existingNote.id) {
          setNoteId(existingNote.id);
        }
        
        setSaveStatus('saved');
        
        // Load tags if available
        if ('tags' in existingNote && Array.isArray(existingNote.tags)) {
          setTags(existingNote.tags);
        } else {
          setTags([]);
        }
        
        // Load images if available
        if ('images' in existingNote && Array.isArray(existingNote.images)) {
          setUploadedImages(existingNote.images as NoteImage[]);
        } else {
          setUploadedImages([]);
        }
      } else {
        // No existing note, start with empty content
        setNoteContent('');
        setNoteId(null);
        setSaveStatus('saved');
        setTags([]);
        setUploadedImages([]);
      }
    } catch (error) {
      console.error('Error loading note:', error);
    }
  };
  
  loadNote();
}, [isOpen, sourceId, getItems]);
  
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
      
      // If panel is closed and left arrow is pressed, open it
      if (!isOpen && e.key === 'ArrowLeft') {
        const event = new CustomEvent('toggleNotePanel', { detail: { open: true } });
        document.dispatchEvent(event);
      }
      
      // If panel is open and right arrow is pressed, close it
      if (isOpen && e.key === 'ArrowRight') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, handleSaveNote]);
  
  // Add a tag
  const addTag = (tag: string) => {
    const normalizedTag = tag.trim().toLowerCase();
    if (normalizedTag && !tags.includes(normalizedTag)) {
      setTags(prev => [...prev, normalizedTag]);
      setTagInput('');
    }
  };
  
  // Remove a tag
  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };
  
  // Handle tag input key down
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === 'Escape') {
      setIsTagInputActive(false);
    }
  };
  
  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      const userId = user?.id ?? '';
      
      if (!userId) {
        console.error('No authenticated user');
        setIsUploading(false);
        return; // bail early; RLS would block the upload anyway
      }
      
      const newImages = await Promise.all(
        Array.from(files).map(async (file, index) => {
          const id = `img-${Date.now()}-${index}`;
          const stored = await storeImageToSupabase(supabase, userId, file, id);

          // insert reference tag at cursor
          const tag = `\n<img-ref id="${id}" filename="${file.name}">\n`;
          if (textareaRef.current) {
            const pos = textareaRef.current.selectionStart;
            setNoteContent(prev => prev.slice(0, pos) + tag + prev.slice(pos));
          } else {
            setNoteContent(prev => prev + tag);
          }
          return stored;
        })
      );

      setUploadedImages(prev => [...prev, ...newImages]);
      setSaveStatus('unsaved');
    } catch (err) {
      console.error('Error uploading images:', err);
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

    const files = Array.from(raw).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      const userId = user?.id ?? '';
      
      if (!userId) {
        console.error('No authenticated user');
        setIsUploading(false);
        return; // bail early; RLS would block the upload anyway
      }
      
      const newImages = await Promise.all(
        files.map(async (file, index) => {
          const id = `img-${Date.now()}-${index}`;
          const stored = await storeImageToSupabase(supabase, userId, file, id);

          const pos = textareaRef.current?.selectionStart ?? noteContent.length;
          const tag = `\n<img-ref id="${id}" filename="${file.name}">\n`;
          setNoteContent(prev => prev.slice(0, pos) + tag + prev.slice(pos));

          return stored;
        })
      );

      setUploadedImages(prev => [...prev, ...newImages]);
      setSaveStatus('unsaved');
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
        template = formatContentBlock('Enter quoted source text here...', 'Source Title', 'source');
        break;
      case 'ai':
        template = formatContentBlock('Enter AI-generated content here...', 'AI Model', 'ai');
        break;
      case 'user':
        template = formatContentBlock('Enter your notes here...', '', 'user');
        break;
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
  };
  
  // Parse and render the note content with special styling for tagged sections
  const renderDisplayContent = () => {
    if (!noteContent) return null;
    
    // Create a styled version of the content
    const lines = noteContent.split('\n');
    let currentBlock: { type: string; content: string[] } | null = null;
    const blocks: { type: string; content: string[] }[] = [];
    
    // Process lines to identify and group content blocks
    lines.forEach((line) => {
      if (line.startsWith('<source-content>')) {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = { type: 'source', content: [] };
      } else if (line.startsWith('<ai-content>')) {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = { type: 'ai', content: [] };
      } else if (line.startsWith('<user-note>')) {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = { type: 'user', content: [] };
      } else if (line.startsWith('</source-content>') || 
                line.startsWith('</ai-content>') || 
                line.startsWith('</user-note>')) {
        if (currentBlock) {
          blocks.push(currentBlock);
          currentBlock = null;
        }
      } else if (line.match(/^<img-ref\s+id=/)) {
        // Handle image references
        if (currentBlock) {
          blocks.push(currentBlock);
          currentBlock = null;
        }
        
        const idMatch = line.match(/id="([^"]+)"/);
        const id = idMatch ? idMatch[1] : '';
        
        blocks.push({ type: 'image', content: [id] });
      } else {
        // Add line to current block or create a default block
        if (currentBlock) {
          currentBlock.content.push(line);
        } else {
          if (blocks.length === 0 || blocks[blocks.length - 1].type !== 'default') {
            blocks.push({ type: 'default', content: [line] });
          } else {
            blocks[blocks.length - 1].content.push(line);
          }
        }
      }
    });
    
    // Add the last block if it exists
    if (currentBlock) {
      blocks.push(currentBlock);
    }
    
    // Render blocks with appropriate styling
    return (
      <div className="space-y-4 p-4">
        {blocks.map((block, index) => {
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
                  } p-2 text-center`}
                >
                  <p className={`text-sm ${
                    darkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    [Image reference not found: {imageId}]
                  </p>
                </div>
              );
              
            default:
              return (
                <div key={index} className={`${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  {block.content.join('\n')}
                </div>
              );
          }
        })}
      </div>
    );
  };
  
  // Return null if not open (for animation purposes we'll handle the display in CSS)
  if (!isOpen) return null;
  
  return (
    <div 
      ref={panelRef}
      className={`fixed right-0 top-24 bottom-0 z-500 w-full max-w-md flex flex-col ${
        darkMode ? 'bg-slate-900 border-l border-slate-700' : 'bg-white border-l border-slate-200'
      } shadow-xl transition-all duration-250 ease-in-out note-animate-slide-in-right`}
    >
      {/* Panel header */}
      <div className={`p-4 flex justify-between items-center border-b ${
        darkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-100/80'
      }`}>
        <h3 className={`font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
          Source Notes
        </h3>
        
        <div className="flex items-center space-x-3">
          {/* Save status */}
          <div className="flex items-center">
            {saveStatus === 'saved' ? (
              <span className={`text-xs ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                Saved
              </span>
            ) : saveStatus === 'saving' ? (
              <span className={`text-xs ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                Saving...
              </span>
            ) : (
              <span className={`text-xs ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                Unsaved
              </span>
            )}
          </div>
          
          {/* Save button */}
          <button
            onClick={handleSaveNote}
            disabled={isSaving || saveStatus === 'saved'}
            className={`px-3 py-1 text-sm rounded ${
              isSaving || saveStatus === 'saved'
                ? darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500'
                : darkMode ? 'bg-indigo-700 text-white hover:bg-indigo-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'
            } transition-colors`}
            title="Save note (Ctrl+S)"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className={`text-2xl ${darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
            title="Close panel (Esc or →)"
          >
            &times;
          </button>
        </div>
      </div>
      
      {/* Source info & Tags */}
      <div className={`px-5 py-3 ${darkMode ? 'bg-slate-800/50' : 'bg-slate-50/80'} border-b ${
        darkMode ? 'border-slate-700' : 'border-slate-200'
      }`}>
        <div className="flex justify-between items-center mb-2">
          <div>
            <h4 className={`font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'} text-sm`}>
              {metadata?.title || 'Untitled Source'}
            </h4>
            <div className={`flex text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {metadata?.author && (
                <span className="mr-2">{metadata.author}</span>
              )}
              {metadata?.date && (
                <span>({metadata.date})</span>
              )}
            </div>
          </div>
          
          {/* Keyboard shortcut hint */}
          <div className="text-xs text-slate-400 flex items-center">
            <kbd className={`px-1.5 py-0.5 rounded text-xs ${
              darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'
            } font-mono`}>Ctrl+S</kbd>
            <span className="mx-1">to save</span>
          </div>
        </div>
        
        {/* Tags section */}
        <div className="mt-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Tags:
            </span>
            
            {/* Display existing tags */}
            {tags.map(tag => (
              <div 
                key={tag}
                className={`flex items-center px-2 py-0.5 rounded-full text-xs note-animate-in ${
                  darkMode 
                    ? 'bg-indigo-900/50 text-indigo-300 border border-indigo-700/70' 
                    : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                }`}
              >
                <span>{tag}</span>
                <button 
                  onClick={() => removeTag(tag)}
                  className={`ml-1.5 ${darkMode ? 'text-indigo-400 hover:text-indigo-200' : 'text-indigo-500 hover:text-indigo-700'}`}
                >
                  &times;
                </button>
              </div>
            ))}
            
            {/* Tag input or add button */}
            {isTagInputActive ? (
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                onBlur={() => {
                  if (tagInput.trim()) {
                    addTag(tagInput);
                  }
                  setIsTagInputActive(false);
                }}
                autoFocus
                placeholder="Add tag..."
                className={`outline-none text-xs min-w-24 px-2 py-0.5 rounded ${
                  darkMode 
                    ? 'bg-slate-700 border border-slate-600 text-slate-200 placeholder:text-slate-400'
                    : 'bg-white border border-slate-200 text-slate-700 placeholder:text-slate-400'
                }`}
              />
            ) : (
              <button 
                onClick={() => setIsTagInputActive(true)}
                className={`flex items-center text-xs gap-1 px-2 py-0.5 rounded-full ${
                  darkMode 
                    ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add tag</span>
              </button>
            )}

            {/* Toggle preview mode */}
            <button
              onClick={() => setPreviewMode(!previewMode)}
              title={previewMode ? "Switch to edit mode" : "Switch to preview mode"}
              className={`flex items-center px-2 py-1 rounded-md text-xs ${
                previewMode
                  ? darkMode
                    ? 'bg-emerald-700/50 text-emerald-300'
                    : 'bg-emerald-100 text-emerald-700'
                  : darkMode
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d={previewMode 
                    ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
                    : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  }
                />
              </svg>
              {previewMode ? "Edit" : "Preview"}
            </button>
          </div>
        </div>
      </div>
      
      {/* Toolbar with formatting options */}
      <div className={`px-3 ${darkMode ? 'bg-slate-800' : 'bg-slate-100'} border-b ${
        darkMode ? 'border-slate-700' : 'border-slate-200'
      } flex items-center justify-between`}>
        {/* File input for image upload - hidden but referenced */}
        <input 
          type="file" 
          accept="image/*" 
          multiple 
          onChange={handleImageUpload}
          ref={fileInputRef}
          className="hidden"
        />
        
        {/* Add visible toolbar buttons if needed */}
      </div>
      
      {/* Note content area - adjusts height dynamically */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {previewMode ? (
          <div className={`flex-1 overflow-y-auto note-custom-scrollbar ${
            darkMode ? 'bg-slate-900' : 'bg-white'
          }`}>
            {renderDisplayContent()}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            placeholder="Add your notes about this source here..."
            className={`flex-1 p-4 resize-none outline-none note-custom-scrollbar ${
              darkMode 
                ? 'bg-slate-900 text-slate-200 placeholder:text-slate-500' 
                : 'bg-white text-slate-800 placeholder:text-slate-400'
            } w-full font-mono text-sm ${
              isDraggingOver ? 'note-drag-over' : ''
            }`}
          />
        )}
      </div>
      
      {/* Drag & drop overlay hint - only shown when dragging files */}
      {isDraggingOver && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center pointer-events-none z-10">
          <div className={`p-6 rounded-lg ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-xl flex flex-col items-center`}>
            <svg className={`w-12 h-12 mb-2 ${darkMode ? 'text-indigo-400' : 'text-indigo-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className={`text-lg font-medium ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
              Drop images to add them to your note
            </p>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <div className={`p-4 border-t ${
        darkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'
      }`}>
        <div className="flex justify-between items-center">
          <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {noteId 
              ? `Last modified: ${new Date().toLocaleString()}`
              : 'New note'}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className={`px-3 py-1.5 rounded text-sm ${
                darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              } transition-colors`}
            >
              Close
            </button>
            
            <button
              onClick={handleSaveNote}
              disabled={isSaving || saveStatus === 'saved'}
              className={`px-4 py-1.5 rounded text-sm font-medium ${
                isSaving || saveStatus === 'saved'
                  ? darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500'
                  : darkMode ? 'bg-indigo-700 text-white hover:bg-indigo-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'
              } transition-colors`}
            >
              {isSaving ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'Save Note'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
