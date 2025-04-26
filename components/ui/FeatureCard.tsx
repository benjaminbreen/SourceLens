// components/ui/FeatureCard.tsx
// Modular and linkable feature card component with animation,
// designed to display in a 2x2 grid with expandable content and demo buttons

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface FeatureCardProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: {
    light: string;
    dark: string;
  };
  borderColor: {
    light: string;
    dark: string;
  };
  bgColor: {
    light: string;
    dark: string;
  };
  demoButtons: {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
  }[];
  imageUrl?: string;
  isExpanded: boolean;
  onToggle: () => void;
  isDarkMode: boolean;
}

export default function FeatureCard({
  id,
  title,
  description,
  icon,
  color,
  borderColor,
  bgColor,
  demoButtons,
  imageUrl,
  isExpanded,
  onToggle,
  isDarkMode
}: FeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      id={`feature-${id}`}
      className={`${
        isDarkMode 
          ? 'bg-slate-900 border-slate-800' 
          : 'bg-white border-slate-200'
      } border rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden ${
        isExpanded 
          ? isDarkMode 
            ? 'ring-1 ring-slate-700' 
            : 'ring-1 ring-slate-300' 
          : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card Header with Icon and Expand/Collapse Icon */}
      <div 
        className="p-4 cursor-pointer flex items-center justify-between"
        onClick={onToggle}
      >
        <div className="flex items-center">
          <div className={`w-10 h-10 mr-3 ${
            isDarkMode 
              ? bgColor.dark + ' ' + color.dark
              : bgColor.light + ' ' + color.light
          } rounded-lg flex items-center justify-center transition-all duration-300`}>
            {icon}
          </div>
          <h3 className={`font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} text-base`}>
            {title}
          </h3>
        </div>
        
        <div className={`p-1 rounded-full transition-colors duration-300 ${
          isExpanded 
            ? isDarkMode 
              ? bgColor.dark 
              : bgColor.light 
            : ''
        }`}>
          <svg 
            className={`w-4 h-4 ${
              isDarkMode ? color.dark : color.light
            } transition-transform duration-300 ${
              isExpanded ? 'rotate-180' : ''
            }`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {/* Expandable Content Area */}
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[800px]' : 'max-h-0'
        }`}
      >
        <div className="px-4 pb-4 pt-0 space-y-4">
          <div className={`h-px ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'} w-full mb-2`}></div>
          
          {/* Feature Description */}
          <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'} leading-relaxed`}>
            {description}
          </p>

          {/* Feature Image or Animation if available */}
          {imageUrl && (
            <div className={`relative h-80 w-full overflow-hidden rounded-lg ${
              isDarkMode ? 'border border-slate-700' : 'border border-slate-200'
            } shadow-sm`}>
              <Image
                src={imageUrl}
                alt={`${title} visualization`}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Demo Buttons */}
          <div className="mt-4 flex flex-wrap gap-2 justify-start">
            {demoButtons.map((button, idx) => (
              <button
                key={idx}
                className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full 
                  ${isDarkMode
                    ? 'bg-slate-700 text-slate-300 hover:' + bgColor.dark + ' hover:' + color.dark 
                    : 'bg-slate-100 text-slate-700 hover:' + bgColor.light + ' hover:' + color.light
                  } transition-colors`}
                onClick={button.onClick}
              >
                {button.icon}
                {button.label}
              </button>
            ))}
          </div>
          
          {/* Direct Link to Feature Page */}
          <Link 
            href={`/analysis?feature=${id}`}
            className={`mt-2 inline-flex items-center px-3 py-2 text-xs font-medium rounded-md
              ${isDarkMode
                ? color.dark + ' ' + bgColor.dark + ' hover:bg-opacity-70' 
                : color.light + ' ' + bgColor.light + ' hover:bg-opacity-70'
              } transition-colors`}
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            Open {title} Lens
          </Link>
        </div>
      </div>
      
      {/* Bottom Gradient Border */}
      <div className={`h-0.5 ${
        isDarkMode 
          ? 'bg-gradient-to-r from-slate-800 via-' + id + '-600 to-slate-800' 
          : 'bg-gradient-to-r from-slate-100 via-' + id + '-400 to-slate-100'
      } transition-all duration-500 ${
        isExpanded || isHovered ? 'opacity-100' : 'opacity-0'
      }`}></div>
    </div>
  );
}