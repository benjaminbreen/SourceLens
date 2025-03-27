// components/ui/FAQModal.tsx
// Modal component that displays a beginner's guide to using SourceLens
'use client';

import React from 'react';
import Image from 'next/image';

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FAQModal({ isOpen, onClose }: FAQModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-indigo-50">
          <h3 className="font-bold text-xl text-indigo-900">Beginner's Guide</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl"
          >
            &times;
          </button>
        </div>
        
        <div className="p-6 space-y-5">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="w-20 h-20 relative flex-shrink-0">
              <div className="w-full h-full bg-amber-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-serif text-indigo-900 mb-2">Getting Started with SourceLens</h2>
              <p className="text-slate-700">
                Welcome to SourceLens! This guide will help you start analyzing historical texts through multiple perspectives.
              </p>
            </div>
          </div>
          
          <div className="space-y-6 mt-4">
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
              <h3 className="text-lg font-medium text-amber-900 mb-2">Step 1: Input Your Source</h3>
              <p className="text-slate-700 mb-3">
                Start by pasting a historical text into the "Text Input" field. If you're not sure where to begin, click "See how it works" to load a sample text (the Gettysburg Address).
              </p>
              <p className="text-slate-700">
                You can also upload text files, PDFs, or images containing text (with OCR capabilities).
              </p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="text-lg font-medium text-blue-900 mb-2">Step 2: Enter Source Information</h3>
              <p className="text-slate-700 mb-3">
                Add details about your source in the "Source Information" panel:
              </p>
              <ul className="list-disc pl-5 text-slate-700 space-y-1">
                <li><span className="font-medium">Date</span> - When was the source created?</li>
                <li><span className="font-medium">Author</span> - Who wrote or created it?</li>
                <li><span className="font-medium">Research Goals</span> - What are you hoping to learn?</li>
                <li><span className="font-medium">Additional Context</span> - Any relevant historical background.</li>
              </ul>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <h3 className="text-lg font-medium text-purple-900 mb-2">Step 3: Analyze Your Source</h3>
              <p className="text-slate-700 mb-3">
                Click "Analyze Source" to begin processing. The analysis page will show you:
              </p>
              <ul className="list-disc pl-5 text-slate-700 space-y-1">
                <li><span className="font-medium">Basic Analysis</span> - Summary and preliminary insights</li>
                <li><span className="font-medium">Detailed Analysis</span> - In-depth exploration of themes and context</li>
                <li><span className="font-medium">Counter-Narrative</span> - Alternative interpretations</li>
                <li><span className="font-medium">Author Roleplay</span> - Simulated conversation with the source's author</li>
              </ul>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <h3 className="text-lg font-medium text-green-900 mb-2">Step 4: Explore Different Perspectives</h3>
              <p className="text-slate-700 mb-3">
                Use the "Analysis Perspective" option to view your source through different theoretical frameworks.
              </p>
              
            </div>
          </div>
          
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-6">
            <h3 className="text-lg font-medium text-slate-900 mb-2">Important Notes</h3>
            <ul className="list-disc pl-5 text-slate-700 space-y-1">
              <li>SourceLens uses AI to augment your research, not replace critical thinking.</li>
              <li>Always verify generated insights against scholarly sources.</li>
              <li>The tool works best with public domain historical texts.</li>
              <li>Use the "LLM Transparency" option to see what prompts were used.</li>
            </ul>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}