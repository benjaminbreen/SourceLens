// components/upload/MetadataModal.tsx
'use client';

import React, { useState } from 'react';
import { useAppStore, Metadata } from '@/lib/store';

export default function MetadataModal() {
  const { setMetadata, setShowMetadataModal, showMetadataModal } = useAppStore();
  
  const [formData, setFormData] = useState<Metadata>({
    date: '',
    author: '',
    researchGoals: '',
    additionalInfo: '',
    // Initialize new fields
    title: '',
    placeOfPublication: '',
    genre: '',
    documentType: '',
    academicSubfield: '',
    tags: '',
    fullCitation: '',
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof Metadata, string>>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  const validateForm = () => {
    const newErrors: Partial<Record<keyof Metadata, string>> = {};
    
    if (!formData.date.trim()) {
      newErrors.date = 'Date is required';
    }
    
    if (!formData.author.trim()) {
      newErrors.author = 'Author is required (use "Unknown" if not known)';
    }
    
    if (!formData.researchGoals.trim()) {
      newErrors.researchGoals = 'Research goals are required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Convert tags string to array if it's a string
      const processedData = { ...formData };
      if (typeof processedData.tags === 'string' && processedData.tags.trim() !== '') {
        processedData.tags = processedData.tags.split(',').map(tag => tag.trim());
      }
      
      setMetadata(processedData);
      setShowMetadataModal(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user types
    if (errors[name as keyof Metadata]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  if (!showMetadataModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Source Information</h2>
          <p className="text-sm text-gray-500">
            Please provide details about this primary source
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4">
            {/* Required Basic fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="date"
                  name="date"
                  className={`w-full p-2 border rounded-md ${errors.date ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="When was this created? (e.g., 1865)"
                  value={formData.date}
                  onChange={handleChange}
                />
                {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
              </div>
              
              <div>
                <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
                  Author <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  className={`w-full p-2 border rounded-md ${errors.author ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Who created this? (use 'Unknown' if not known)"
                  value={formData.author}
                  onChange={handleChange}
                />
                {errors.author && <p className="mt-1 text-sm text-red-500">{errors.author}</p>}
              </div>
            </div>
            
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Title of the source (if known)"
                value={formData.title || ''}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="researchGoals" className="block text-sm font-medium text-gray-700 mb-1">
                Research Goals <span className="text-red-500">*</span>
              </label>
              <textarea
                id="researchGoals"
                name="researchGoals"
                rows={3}
                className={`w-full p-2 border rounded-md ${errors.researchGoals ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="What are you hoping to learn from this source?"
                value={formData.researchGoals}
                onChange={handleChange}
              />
              {errors.researchGoals && <p className="mt-1 text-sm text-red-500">{errors.researchGoals}</p>}
            </div>
            
            <div>
              <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-1">
                Additional Context (Optional)
              </label>
              <textarea
                id="additionalInfo"
                name="additionalInfo"
                rows={2}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Any other context that might help with analysis"
                value={formData.additionalInfo || ''}
                onChange={handleChange}
              />
            </div>
            
            {/* Toggle for advanced metadata */}
            <div className="border-t pt-3">
              <button 
                type="button"
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <svg 
                  className={`w-4 h-4 mr-1 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
              </button>
            </div>
            
            {/* Advanced metadata fields */}
            {showAdvanced && (
              <div className="space-y-4 border-t pt-4 mt-2 border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-1">
                      Document Type
                    </label>
                    <select
                      id="documentType"
                      name="documentType"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={formData.documentType || ''}
                      onChange={handleChange}
                    >
                      <option value="">Select a type</option>
                      <option value="Letter">Letter</option>
                      <option value="Diary">Diary</option>
                      <option value="Memoir">Memoir</option>
                      <option value="Government Document">Government Document</option>
                      <option value="Speech">Speech</option>
                      <option value="Newspaper Article">Newspaper Article</option>
                      <option value="Book">Book</option>
                      <option value="Essay">Essay</option>
                      <option value="Poem">Poem</option>
                      <option value="Legal Document">Legal Document</option>
                      <option value="Manuscript">Manuscript</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-1">
                      Genre
                    </label>
                    <input
                      type="text"
                      id="genre"
                      name="genre"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Literary or historical genre"
                      value={formData.genre || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="placeOfPublication" className="block text-sm font-medium text-gray-700 mb-1">
                      Place of Publication/Origin
                    </label>
                    <input
                      type="text"
                      id="placeOfPublication"
                      name="placeOfPublication"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Where was this created?"
                      value={formData.placeOfPublication || ''}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="academicSubfield" className="block text-sm font-medium text-gray-700 mb-1">
                      Academic Subfield
                    </label>
                    <input
                      type="text"
                      id="academicSubfield"
                      name="academicSubfield"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="E.g., History, Literature, Anthropology"
                      value={formData.academicSubfield || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="E.g., colonial, primary source, indigenous"
                    value={typeof formData.tags === 'string' ? formData.tags : (formData.tags || []).join(', ')}
                    onChange={handleChange}
                  />
                  <p className="mt-1 text-xs text-gray-500">Add keywords to help categorize this source</p>
                </div>
                
                <div>
                  <label htmlFor="fullCitation" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Citation
                  </label>
                  <textarea
                    id="fullCitation"
                    name="fullCitation"
                    rows={2}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Complete bibliographic citation"
                    value={formData.fullCitation || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 bg-gray-50 border-t flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowMetadataModal(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Continue to Analysis
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}