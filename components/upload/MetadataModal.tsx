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
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof Metadata, string>>>({});

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
      setMetadata(formData);
      setShowMetadataModal(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Source Information</h2>
          <p className="text-sm text-gray-500">
            Please provide details about this primary source
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="date"
                name="date"
                className={`w-full p-2 border rounded-md ${errors.date ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="When was this source created? (e.g., 1865, circa 1700s)"
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
                placeholder="Who created this source? (use 'Unknown' if not known)"
                value={formData.author}
                onChange={handleChange}
              />
              {errors.author && <p className="mt-1 text-sm text-red-500">{errors.author}</p>}
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
                placeholder="What are you hoping to learn from this source? (e.g., 'Understanding colonial perspectives on indigenous cultures')"
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
                value={formData.additionalInfo}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 border-t flex justify-end space-x-3">
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              Continue to Analysis
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}