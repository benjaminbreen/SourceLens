// components/extract/ExtractInfoExplanation.tsx
// Explanation component for the Information Extraction feature

'use client';

import React from 'react';

export default function ExtractInfoExplanation() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-slate-800 mb-3 pb-2 border-b border-slate-100">
          About Information Extraction
        </h3>
        <p className="text-slate-700 mb-3">
          This tool helps you extract structured information from longer documents in the form of lists or tables. It's particularly useful for processing large texts like books, articles, or reports to find patterns and organize data.
        </p>
        <p className="text-slate-700">
          Simply specify what kind of information you want to extract and what fields each item should have. The AI will analyze your document and compile the results.
        </p>
      </div>
      
      <div className="bg-indigo-50 p-4 rounded-md border border-indigo-100">
        <h4 className="font-medium text-indigo-800 mb-2 flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          How To Use
        </h4>
        <ol className="text-sm space-y-1 text-indigo-700 list-decimal list-inside">
          <li>Upload a document or paste text</li>
          <li>Specify what kind of list you want to extract</li>
          <li>Define the fields each item should have</li>
          <li>Choose your preferred format (list or table)</li>
          <li>Click "Extract Information"</li>
        </ol>
      </div>
      
      <div className="mt-6">
        <h4 className="text-md font-medium text-slate-700 mb-2">Example Use Cases</h4>
        <ul className="list-disc ml-5 space-y-1 text-sm text-slate-600">
          <li>Extract all people mentioned in a historical document with their roles, ages, and locations</li>
          <li>Compile all species names from a naturalist text with their descriptions and modern classifications</li>
          <li>List all places visited in a travelogue with dates and author's impressions</li>
          <li>Extract all technical terms in a scientific paper with definitions and contexts</li>
          <li>Identify all diseases mentioned in a medical text with symptoms and treatments</li>
        </ul>
      </div>
      
      <div className="mt-6 text-xs text-slate-500 italic">
        Note: The quality of extraction depends on how clearly the information is presented in the source text. Some information may be inferred from context if not explicitly stated.
      </div>
    </div>
  );
}