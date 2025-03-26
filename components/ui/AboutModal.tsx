// components/ui/AboutModal.tsx
// Modal component that displays information about SourceLens, its purpose, and creator
'use client';

import React from 'react';
import Image from 'next/image';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-indigo-50">
          <h3 className="font-bold text-xl text-indigo-900">About SourceLens</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl"
          >
            &times;
          </button>
        </div>
        
        <div className="p-6 space-y-5">
          {/* Header with logo and intro */}
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="w-24 h-24 relative flex-shrink-0">
              <Image 
                src="/sourcelenslogo.png" 
                alt="SourceLens Logo" 
                width={96} 
                height={96} 
                className="rounded-full border border-amber-200 ring-1 ring-yellow-300/20"
              />
            </div>
            
            <div>
              <h2 className="text-2xl font-serif text-indigo-900 mb-2">Illuminating historical texts through multiple perspectives</h2>
              <p className="text-slate-700">
                SourceLens is an experimental tool for scholars, educators, and students working with primary historical sources. 
                By leveraging AI capabilities, it offers multiple analytical lenses to examine texts, helping uncover layers of meaning that might otherwise remain hidden.
              </p>
            </div>
          </div>
          
          {/* Philosophy section */}
          <div>
            <h3 className="text-lg font-medium text-indigo-800 mb-2">What this is trying to do</h3>
            <p className="text-slate-700 mb-3">
              In the humanities, understanding a text often involves examining it through different critical and historical frameworks. 
              SourceLens exists to facilitate this process, not to replace the crucial human elements of curiosity, skepticism, and interpretive creativity.
            </p>
            <p className="text-slate-700 mb-3">
              We believe AI tools should <em>augment</em> human scholarship, not replace it. The analysis provided by SourceLens 
              should serve as a starting point for deeper inquiry, a conversation partner for brainstorming, or a way to quickly 
              identify themes and contexts that merit further exploration.
            </p>
          </div>
          
          {/* Features section */}
          <div>
            <h3 className="text-lg font-medium text-indigo-800 mb-2">Key features</h3>
            <ul className="list-disc pl-5 space-y-2 text-slate-700">
              <li>
                <span className="font-medium">Multiple Analytical Perspectives</span>: Apply different theoretical frameworks to the same text
              </li>
              <li>
                <span className="font-medium">Counter-Narratives</span>: Surface alternative interpretations that challenge conventional readings
              </li>
              <li>
                <span className="font-medium">Author Roleplay</span>: Simulate a conversation with the source's author for deeper engagement
              </li>
              <li>
                <span className="font-medium">LLM Transparency</span>: View the prompts and complete responses from the AI for accountability
              </li>
            </ul>
          </div>
          
          {/* Creator information */}
          <div className="bg-slate-50 p-5 rounded-lg border border-slate-200">
            <h3 className="text-lg font-medium text-indigo-800 mb-3">About the Creator</h3>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="md:w-1/4 flex justify-center">
                <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 text-2xl font-serif">
                  BB
                </div>
              </div>
              <div className="md:w-3/4">
                <p className="text-slate-700 mb-3">
                  SourceLens was created by Benjamin Breen, Associate Professor of History at UC Santa Cruz. 
                  His research focuses on the history of science, medicine, and global knowledge exchange in the early modern period.
                </p>
                <p className="text-slate-700 mb-3">
                  You can find more about the rationale behind this project at <a href="https://resobscura.substack.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 underline">Res Obscura</a>, 
                  a newsletter.
                </p>
                <p className="text-slate-700">
                  SourceLens emerged from conversaitons with Pranav Anand and Zac Zimmer (both UCSC) on how AI tools can assist historical research while encouraging a mindset of creativity and experimentation rather than falling prey to the wiles of AI-generated dross. 

                </p>
              </div>
            </div>
          </div>
          
          {/* Cautionary note */}
          <div className="border-t border-slate-200 pt-4 mt-2">
            <p className="text-sm text-slate-500 italic">
              Note: SourceLens is an experimental tool. The AI analysis provided should be verified against scholarly sources 
              and your own critical judgment. All AI-generated content should be approached with the same skepticism and verification 
              practices applied to any secondary source.

              SourceLens is designed for use with public domain materials or content for which the user holds appropriate rights. By using this tool, you agree not to upload or analyze any copyrighted material unless you are the rights holder or have obtained permission.

This software is intended for educational and research purposes only. Any output generated by SourceLens, including summaries or metadata, should be independently verified before use in academic or commercial contexts.
            </p>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}