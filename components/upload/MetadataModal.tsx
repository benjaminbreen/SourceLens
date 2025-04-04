// components/upload/MetadataModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore, Metadata } from '@/lib/store';

interface MetadataModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMetadata: Metadata;
  onSave: (metadata: Metadata) => void;
}

export default function MetadataModal({ 
  isOpen, 
  onClose, 
  initialMetadata, 
  onSave 
}: MetadataModalProps) {
  const [formData, setFormData] = useState<Metadata>(initialMetadata);
  const [tagInput, setTagInput] = useState('');
  
  // Reset form when modal opens with new data
  useEffect(() => {
    if (isOpen) {
      setFormData(initialMetadata);
      setTagInput('');
    }
  }, [isOpen, initialMetadata]);

  // Close modal on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle tag management
  const addTag = () => {
    if (tagInput.trim() === '') return;
    
    const tags = Array.isArray(formData.tags) ? [...formData.tags] : 
                (typeof formData.tags === 'string' && formData.tags.trim() !== '') ? 
                formData.tags.split(',').map(tag => tag.trim()) : [];
    
    // Add tag if it doesn't already exist
    if (!tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...tags, tagInput.trim()]
      }));
    }
    
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    const tags = Array.isArray(formData.tags) ? 
      formData.tags.filter(tag => tag !== tagToRemove) : 
      [];
    
    setFormData(prev => ({
      ...prev,
      tags
    }));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  // If modal is closed, don't render anything
  if (!isOpen) return null;

  // Transform tags array to a format we can render
  const tagsArray = Array.isArray(formData.tags) ? formData.tags : 
                   (typeof formData.tags === 'string' && formData.tags.trim() !== '') ? 
                   formData.tags.split(',').map(tag => tag.trim()) : [];

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[85vh] animate-in zoom-in-95 slide-in-from-bottom-10 duration-300 flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3 -mb-1 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-800">Source Details</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto p-5">
            {/* REQUIRED FIELDS section */}
            <h3 className="text-sm font-medium  tracking-wider text-slate-500 uppercase mb-1">
              REQUIRED FIELDS
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="date"
                  name="date"
                  className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  placeholder="When was this created?"
                  value={formData.date || ''}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="author" className="block text-sm font-medium text-slate-700 mb-1">
                  Author <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  placeholder="Who created this?"
                  value={formData.author || ''}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* DOCUMENT INFORMATION section */}
            <h3 className="text-sm font-medium tracking-wider text-slate-500 uppercase mb-1">
              DOCUMENT INFORMATION
            </h3>
            
            {/* Title */}
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                placeholder="Document title"
                value={formData.title || ''}
                onChange={handleChange}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-3">
              <div>
                <label htmlFor="documentType" className="block text-sm font-medium text-slate-700 mb-1">
                  Document Type
                </label>
                <select
                  id="documentType"
                  name="documentType"
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 bg-white text-slate-900"
                  value={formData.documentType || ''}
                  onChange={handleChange}
                >
                <option value="">Select a type</option>
                <option value="Letter">✉️ Letter</option>
                <option value="Diary">📔 Diary</option>
                <option value="Memoir">🖋️ Memoir</option>
                <option value="Speech">🗣️ Speech</option>
                <option value="Essay">📝 Essay</option>
                <option value="Journal Article">📄 Journal Article</option>
                <option value="Book">📚 Book</option>
                <option value="Book Chapter">📖 Book Chapter</option>
                <option value="Periodical">📰 Periodical</option>
                <option value="Legal Document">⚖️ Legal Document</option>
                <option value="Government Document">🏛️ Government Document</option>
                <option value="Manuscript">📜 Manuscript</option>
                <option value="Tablet">𒀭 Tablet</option>
                <option value="Grimoire">🧙🏼‍♂️ Grimoire</option>
                <option value="Field Notes">🌿 Field Notes</option>
                <option value="Trip Report">💊 Trip Report</option>
                <option value="Recipe">🍳 Recipe</option>
                <option value="Sermon">⛪ Sermon</option>
                <option value="Report">📝 Report</option>
                <option value="Interview Transcript">🎤 Interview Transcript</option>
                <option value="Photograph">📷 Photograph</option>
                <option value="Painting or Drawing">🎨 Painting or Drawing</option>
                <option value="Catalog">📦 Catalog</option>
                <option value="Other">❓ Other</option>

                </select>
              </div>
              
              <div>
                <label htmlFor="genre" className="block text-sm font-medium text-slate-700 mb-1">
                  Genre
                </label>
                <input
                  type="text"
                  id="genre"
                  name="genre"
                  className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  placeholder="Literary or historical genre"
                  value={formData.genre || ''}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="placeOfPublication" className="block text-sm font-medium text-slate-700 mb-1">
                  Place of Publication/Origin
                </label>
                <input
                  type="text"
                  id="placeOfPublication"
                  name="placeOfPublication"
                  className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  placeholder="Origin location"
                  value={formData.placeOfPublication || ''}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="academicSubfield" className="block text-sm font-medium text-slate-700 mb-1">
                  Academic Subfield
                </label>
                <input
                  type="text"
                  id="academicSubfield"
                  name="academicSubfield"
                  className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  placeholder="Academic field"
                  value={formData.academicSubfield || ''}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Tags section */}
          <div className="mb-6">
  <h3 className="text-sm font-medium tracking-wider text-slate-500 uppercase mb-1">
    TAGS
  </h3>

  <div className="flex flex-wrap gap-2 p-2 rounded-md border border-slate-200 bg-white">
    {tagsArray.map((tag, index) => (
      <div
        key={index}
        className="inline-flex items-center bg-indigo-100 text-indigo-900 px-2.5 py-1 rounded-lg font-mono text-sm font-semibold animate-in fade-in zoom-in-95 duration-300"
      >
        {tag}
        <button
          type="button"
          onClick={() => removeTag(tag)}
          className="ml-1.5 text-indigo-500 hover:text-indigo-700 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    ))}
  </div>

  {/* Tag input and Add button row */}
  <div className="mt-2 flex gap-2">
    <input
      type="text"
      className="flex-grow bg-white border border-slate-300 rounded-md px-2 py-1.5 text-sm font-mono text-indigo-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
      placeholder="Add a tag..."
      value={tagInput}
      onChange={(e) => setTagInput(e.target.value)}
    />
    <button
      type="button"
      onClick={addTag}
      className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors"
    >
      Add Tag
    </button>
  </div>

  <p className="text-xs text-slate-500 mt-1">Click “Add Tag” to add keywords for this source</p>
</div>


            {/* Side-by-side Research Goals and Additional Context */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 mb-3">
              <div>
                <label htmlFor="researchGoals" className="block text-sm font-medium text-slate-700 mb-1">
                  Research Goals:
                </label>
                <textarea
                  id="researchGoals"
                  name="researchGoals"
                  rows={3}
                  className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  placeholder="What are you hoping to learn?"
                  value={formData.researchGoals || ''}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="additionalInfo" className="block text-sm font-medium text-slate-700 mb-1">
                  Additional Context:
                </label>
                <textarea
                  id="additionalInfo"
                  name="additionalInfo"
                  rows={3}
                  className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  placeholder="Any other helpful context"
                  value={formData.additionalInfo || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            {/* Citation field at bottom with smaller text */}
            <div>
              <label htmlFor="fullCitation" className="block text-sm font-medium text-slate-700 mb-1">
                Citation:
              </label>
              <textarea
                id="fullCitation"
                name="fullCitation"
                rows={2}
                className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm text-slate-600 italic"
                placeholder="Full bibliographic citation"
                value={formData.fullCitation || ''}
                onChange={handleChange}
              />
            </div>
          </div>
          
          {/* Footer with buttons */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3 mt-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors font-medium"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Add animations for tag interactions */}
      <style jsx global>{`
        @keyframes tagFadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .tag-animate-in {
          animation: tagFadeIn 0.3s ease-out forwards;
        }
        
        @keyframes tagFadeOut {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0; transform: scale(0.9); }
        }
        
        .tag-animate-out {
          animation: tagFadeOut 0.2s ease-in forwards;
        }
      `}</style>
    </div>
  );
}