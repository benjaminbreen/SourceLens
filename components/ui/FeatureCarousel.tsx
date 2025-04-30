// components/ui/FeatureCarousel.tsx
// Interactive feature carousel that showcases SourceLens features with 
// hover-activated screenshots and feature descriptions.
// Supports both light and dark modes with smooth transitions.

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/components/theme/ThemeProvider';
import { Space_Grotesk } from 'next/font/google';
import { useAppStore } from '@/lib/store'; // Import for dark mode



const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk',
});

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  screenshotPath: string;
  darkScreenshotPath: string; // Dark mode screenshot (now required)
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
  docUrl: string; // URL to documentation page
}

const features: Feature[] = [
  {
    id: 'basic-analysis',
    title: 'Basic Analysis',
    description: 'Quick summary and starting point for future research into your source document.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    screenshotPath: '/screenshots/basic-analysis.png',
    darkScreenshotPath: '/screenshots/basic-analysis-dark.png',
    color: {
      light: 'text-indigo-600',
      dark: 'text-indigo-400',
    },
    borderColor: {
      light: 'border-indigo-200',
      dark: 'border-indigo-800',
    },
    bgColor: {
      light: 'bg-indigo-50',
      dark: 'bg-indigo-900/30',
    },
    docUrl: '/docs/features/basic-analysis',
  },
  {
    id: 'detailed-analysis',
    title: 'Detailed Analysis',
    description: 'Essay-length summary with expandable, customizable analysis sections.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    screenshotPath: '/screenshots/detailed-analysis.png',
    darkScreenshotPath: '/screenshots/detailed-analysis-dark.png',
    color: {
      light: 'text-amber-600',
      dark: 'text-amber-400',
    },
    borderColor: {
      light: 'border-amber-200',
      dark: 'border-amber-800',
    },
    bgColor: {
      light: 'bg-amber-50',
      dark: 'bg-amber-900/30',
    },
    docUrl: '/docs/features/detailed-analysis',
  },
  {
    id: 'extract-info',
    title: 'Extract Info',
    description: 'Create structured tables or lists from your source document.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M19 13l-4 4m0 0l-4-4m4 4V7" />
      </svg>
    ),
    screenshotPath: '/screenshots/extract-info.png',
    darkScreenshotPath: '/screenshots/extract-info-dark.png',
    color: {
      light: 'text-emerald-600',
      dark: 'text-emerald-400',
    },
    borderColor: {
      light: 'border-emerald-200',
      dark: 'border-emerald-800',
    },
    bgColor: {
      light: 'bg-emerald-50',
      dark: 'bg-emerald-900/30',
    },
    docUrl: '/docs/features/extract-info',
  },
  {
    id: 'references',
    title: 'References',
    description: 'Get ranked, annotated suggestions for citations relevant to your source.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    screenshotPath: '/screenshots/reference.png',
    darkScreenshotPath: '/screenshots/reference-dark.png',
    color: {
      light: 'text-rose-600',
      dark: 'text-rose-400',
    },
    borderColor: {
      light: 'border-rose-200',
      dark: 'border-rose-800',
    },
    bgColor: {
      light: 'bg-rose-50',
      dark: 'bg-rose-900/30',
    },
    docUrl: '/docs/features/references',
  },
  {
    id: 'counter',
    title: 'Counter-Narrative',
    description: 'Explore alternative perspectives through customizable perspective-taking.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7h12m0 0l-4-4m4 4l-4 4m-4 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
    screenshotPath: '/screenshots/counter-narrative.png',
    darkScreenshotPath: '/screenshots/counter-narrative-dark.jpg',
    color: {
      light: 'text-purple-600',
      dark: 'text-purple-400',
    },
    borderColor: {
      light: 'border-purple-200',
      dark: 'border-purple-800',
    },
    bgColor: {
      light: 'bg-purple-50',
      dark: 'bg-purple-900/30',
    },
    docUrl: '/docs/features/counter-narrative',
  },
  {
    id: 'translate',
    title: 'Translate',
    description: 'Translate your source with customizable annotations and literality levels.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10m-11.048-2.5A18.022 18.022 0 0110 8.6" />
      </svg>
    ),
    screenshotPath: '/screenshots/translate.png',
    darkScreenshotPath: '/screenshots/translate-dark.jpg',
    color: {
      light: 'text-sky-600',
      dark: 'text-sky-400',
    },
    borderColor: {
      light: 'border-sky-200',
      dark: 'border-sky-800',
    },
    bgColor: {
      light: 'bg-sky-50',
      dark: 'bg-sky-900/30',
    },
    docUrl: '/docs/features/translate',
  },
  {
    id: 'connections',
    title: 'Connections',
    description: 'Visualize networks and relationships with this experimental analysis chart.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    screenshotPath: '/screenshots/connections.jpg',
    darkScreenshotPath: '/screenshots/connections-dark.jpg',
    color: {
      light: 'text-orange-600',
      dark: 'text-orange-400',
    },
    borderColor: {
      light: 'border-orange-200',
      dark: 'border-orange-800',
    },
    bgColor: {
      light: 'bg-orange-50',
      dark: 'bg-orange-900/30',
    },
    docUrl: '/docs/features/connections',
  },
  {
    id: 'highlight',
    title: 'Highlight',
    description: 'Identify and analyze passages in your source relevant to specific topics.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
    screenshotPath: '/screenshots/highlight.png',
    darkScreenshotPath: '/screenshots/highlight-dark.png',
    color: {
      light: 'text-yellow-600',
      dark: 'text-yellow-400',
    },
    borderColor: {
      light: 'border-yellow-200',
      dark: 'border-yellow-800',
    },
    bgColor: {
      light: 'bg-yellow-50',
      dark: 'bg-yellow-900/30',
    },
    docUrl: '/docs/features/highlight',
  },
  {
    id: 'roleplay',
    title: 'Simulation',
    description: 'Engage in simulated conversations with the author of a source.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
      </svg>
    ),
    screenshotPath: '/screenshots/simulation.jpg',
    darkScreenshotPath: '/screenshots/simulation-dark.jpg',
    color: {
      light: 'text-blue-600',
      dark: 'text-blue-400',
    },
    borderColor: {
      light: 'border-blue-200',
      dark: 'border-blue-800',
    },
    bgColor: {
      light: 'bg-blue-50',
      dark: 'bg-blue-900/30',
    },
    docUrl: '/docs/features/simulation',
  },
];

export default function FeatureCarousel() {
  const [activeFeature, setActiveFeature] = useState(features[0].id);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

    const isDarkMode = useAppStore(state => state.isDarkMode);

  // Handle hover with a slight delay to prevent flickering
  const handleHover = (id: string) => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    
    const timeout = setTimeout(() => {
      setActiveFeature(id);
    }, 100); // Small delay for smoother experience
    
    setHoverTimeout(timeout);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) clearTimeout(hoverTimeout);
    };
  }, [hoverTimeout]);

  // Find the currently active feature
  const currentFeature = features.find(f => f.id === activeFeature) || features[0];

  // Helper function to get the correct color class based on feature id and dark mode
  const getColorClass = (feature: Feature, type: 'bg' | 'text' | 'border') => {
    const colorMap = {
      'basic-analysis': 'indigo',
      'detailed-analysis': 'amber',
      'extract-info': 'emerald',
      'references': 'rose',
      'counter': 'purple',
      'translate': 'sky',
      'connections': 'orange',
      'highlight': 'yellow',
      'roleplay': 'blue'
    };
    
    const color = colorMap[feature.id as keyof typeof colorMap] || 'indigo';
    
    if (type === 'bg') {
      return isDarkMode ? `bg-${color}-900/70 hover:bg-${color}-800/80` : `bg-${color}-100 hover:bg-${color}-200`;
    } else if (type === 'text') {
      return isDarkMode ? `text-${color}-300` : `text-${color}-700`;
    } else {
      return isDarkMode ? `border-${color}-800` : `border-${color}-200`;
    }
  };

  return (
    <div className="mt-16 mb-24">
      {/* Section Title */}
      <h2 className={`${spaceGrotesk.className} text-4xl font-medium text-center mb-10 ${
        isDarkMode
          ? 'text-white'
          : 'text-indigo-950/90'
      }`}>
        Powerful, customizable tools for humanistic research
      </h2>

      {/* Hover buttons - Optimized for mobile with horizontal scroll */}
      <div className="max-w-7xl mx-auto px-3 mb-8 overflow-hidden">
        <div className="flex overflow-x-auto whitespace-nowrap pb-2 -mx-3 px-3 no-scrollbar">
          {features.map((feature) => (
            <button
              key={feature.id}
              className={`relative group flex-shrink-0 px-4 py-2 rounded-full mx-1 first:ml-3 last:mr-3 transition-all duration-300 ease-in-out ${
                activeFeature === feature.id
                  ? isDarkMode 
                    ? `${feature.bgColor.dark} ${feature.color.dark} border ${feature.borderColor.dark}`
                    : `${feature.bgColor.light} ${feature.color.light} border ${feature.borderColor.light}`
                  : isDarkMode
                    ? 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700/80'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
              onMouseEnter={() => handleHover(feature.id)}
              onClick={() => setActiveFeature(feature.id)}
            >
              <span className="flex items-center">
                <span className="mr-2">{feature.icon}</span>
                <span className="text-sm font-medium">{feature.title}</span>
              </span>
              
              {/* Animated underline for active state */}
              <span 
                className={`absolute bottom-0 left-1/2 h-0.5 rounded-full transform -translate-x-1/2 transition-all duration-300 ${
                  activeFeature === feature.id
                    ? isDarkMode
                      ? `w-2/3 ${feature.color.dark}`
                      : `w-2/3 ${feature.color.light}`
                    : 'w-0'
                }`}
              ></span>
            </button>
          ))}
        </div>
      </div>

      {/* Screenshot carousel and description */}
      <div className="max-w-6xl mx-auto px-2">
        <div className={`overflow-hidden rounded-xl border shadow-sm hover:shadow-lg transition-all duration-300 ${
          isDarkMode 
            ? 'border-slate-700 bg-slate-900/50' 
            : 'border-slate-300 bg-white'
        }`}>
          {/* Screenshot Container with animation */}
          <div className={`relative shadow-inner aspect-[16/10.2] w-full overflow-hidden ${
          isDarkMode 
            ? 'border-slate-400 bg-gradient-to-t from-slate-200/80 to-indigo-700/20' 
            : 'border-slate-300 bg-gradient-to-t from-slate-200/80 to-slate-200'
        }`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0.3 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="absolute inset-0"
              >
                <Image
                  src={isDarkMode 
                    ? currentFeature.darkScreenshotPath 
                    : currentFeature.screenshotPath}
                  alt={`${currentFeature.title} interface screenshot`}
                  fill
                  className="object-cover p-3"
                  priority
                />
              </motion.div>
            </AnimatePresence>

            {/* Caption overlay at the bottom */}
            <div className={`absolute bottom-0 left-0 right-0 ${
              isDarkMode 
                ? 'bg-gradient-to-t from-slate-950 to-slate-900/50 border-t border-slate-700/30' 
                : 'bg-gradient-to-t from-slate-100/95 to-slate-50/80 border-t border-slate-200'
            } p-5 backdrop-blur-sm`}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeFeature}-caption`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`text-lg font-semibold mb-1 ${
                        isDarkMode ? currentFeature.color.dark : currentFeature.color.light
                      }`}>
                        {currentFeature.title}
                      </h3>
                      <p className={`text-sm max-w-3xl ${
                        isDarkMode ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        {currentFeature.description}
                      </p>
                    </div>
                    <Link
                      href={currentFeature.docUrl}
                      className={`rounded-full text-sm hover:scale-103 hover:brightness-110 font-medium px-3 py-1 transition-colors ${
                        getColorClass(currentFeature, 'bg')
                      } ${
                        getColorClass(currentFeature, 'text')
                      }`}
                    >
                      Learn more
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}