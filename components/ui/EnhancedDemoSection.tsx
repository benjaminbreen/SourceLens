// components/ui/ImprovedDemoSection.tsx
// An enhanced demo section with animated feature carousel, hover effects,
// and interactive demo button with thumbnail animations

'use client';

import React, { useState, useEffect, useRef } from 'react';
import DemoButtons from './DemoButtons';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Space_Grotesk } from 'next/font/google';
import type { AppState } from '@/lib/store';


const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700',],
  variable: '--font-space-grotesk',
});

// --- Demo Items Interface ---
interface DemoTextItem {
  emoji: string;
  title: string;
  description: string;
  text: string;
  metadata: any;
  thumbnailUrl?: string;
}

interface ImprovedDemoSectionProps {
  demoTexts: DemoTextItem[];
  selectedDemo: number | null;
  loadDemoContent: (index: number) => void;
 handleQuickDemo: (index: number, panel: AppState['activePanel']) => void;
  handleManhattanNarrative: () => void;
  handleHighlightDemo: (index: number, query: string) => void;
  isDarkMode?: boolean;
}

// For the typewriter animations
const TypewriterEffect = ({ text, isVisible }: { text: string; isVisible: boolean }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [startTyping, setStartTyping] = useState(false);

  // Reset state when text changes
  useEffect(() => {
    setDisplayText('');
    setCurrentIndex(0);
    setIsFadingOut(false);
    setStartTyping(false);

    // Delay typing start by 2 seconds after component mount/text change
    const delayTimer = setTimeout(() => {
      setStartTyping(true);
    }, 2000);

    return () => clearTimeout(delayTimer);
  }, [text]);

  // Handle typing effect
  useEffect(() => {
    if (!isVisible || !startTyping) return;

    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 35); // Typing speed

      return () => clearTimeout(timer);
    } else if (!isFadingOut) {
      const timer = setTimeout(() => {
        setIsFadingOut(true);
      }, 9000); // Hold for 10s before fade
      return () => clearTimeout(timer);
    }
  }, [currentIndex, isVisible, text, isFadingOut, startTyping]);

  if (!isVisible) return null;

  return (
    <motion.div 
      className="font-mono text-slate-400 text-sm md:text-base italic leading-relaxed"
      initial={{ opacity: 0 }}
      animate={{ opacity: isFadingOut ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ 
        opacity: { duration: isFadingOut ? 2.1 : 0.9 }
      }}
    >
      {displayText}
      <span className="inline-block w-0.5 h-4 bg-slate-200 ml-0.5 animate-blink"></span>
    </motion.div>
  );
};


// Animated thumbnail circles for demo button hover effect
const HoverThumbnails = ({ isHovering, demoTexts }: { isHovering: boolean; demoTexts: DemoTextItem[] }) => {
  // Select a few demo items for thumbnails
  const thumbnails = [
    demoTexts[0]?.thumbnailUrl || '/demo-thumbnails/nannitablet.jpg',
    demoTexts[4]?.thumbnailUrl || '/demo-thumbnails/coca.jpg',
    demoTexts[7]?.thumbnailUrl || '/demo-thumbnails/gettysburg.jpg',
  ];

  return (
    <div className="absolute -top-2 transform -translate-x-1/2 pointer-events-none z-10">
      <AnimatePresence>
        {isHovering && (
          <>
            {/* Center thumbnail */}
            <motion.div
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 0.9, y: -80 }}
              exit={{ opacity: 0, y: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute -left-10 w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-lg"
            >
              <Image
                src={thumbnails[0]}
                alt="Demo thumbnail"
                fill
                sizes="80px"
                className="object-cover"
              />
            </motion.div>
            
            {/* Left thumbnail */}
            <motion.div
              initial={{ opacity: 0, x: 0, y: 0 }}
              animate={{ opacity: 0.85, x: -130, y: -50 }}
              exit={{ opacity: 0, x: 0, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="absolute -left-10 w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-lg"
            >
              <Image
                src={thumbnails[1]}
                alt="Demo thumbnail"
                fill
                sizes="64px"
                className="object-cover"
              />
            </motion.div>
            
            {/* Right thumbnail */}
            <motion.div
              initial={{ opacity: 0, x: 0, y: 0 }}
              animate={{ opacity: 0.85, x: 140, y: -50 }}
              exit={{ opacity: 0, x: 0, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="absolute -left-10 w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-lg"
            >
              <Image
                src={thumbnails[2]}
                alt="Demo thumbnail"
                fill
                sizes="64px"
                className="object-cover"
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function ImprovedDemoSection({
  demoTexts,
  selectedDemo,
  loadDemoContent,
  handleQuickDemo,
  handleManhattanNarrative,
  handleHighlightDemo,
  isDarkMode = false
}: ImprovedDemoSectionProps) {
  const [showDemoOptions, setShowDemoOptions] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);
  const [activeFeature, setActiveFeature] = useState<string>("contextualize");
  const [currentTypewriterText, setCurrentTypewriterText] = useState<string>("");
  const [visibleButtons, setVisibleButtons] = useState<string[]>([]);
  
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const featuresContainerRef = useRef<HTMLDivElement>(null);
  
  // Handle clicks outside the demo modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showDemoOptions &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowDemoOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDemoOptions]);

  // Track if demo panel has been shown
  useEffect(() => {
    if (showDemoOptions && !hasBeenShown) {
      setHasBeenShown(true);
    }
  }, [showDemoOptions, hasBeenShown]);

  // Custom typewriter texts for each feature
  const getTypewriterTexts = (feature: string): string[] => {
    switch (feature) {
      case 'contextualize':
        return [
          "This letter was written during a period of intense political upheaval, just three weeks after the fall of the Bastille when rumors of aristocratic plots were widespread...",
          "The medical terminology used here reflects pre-germ theory understanding of disease, common in texts from before Pasteur's work in the 1860s...",
          "These economic observations came at the height of the Panic of 1819, America's first major financial crisis following the War of 1812..."
        ];
      case 'analyze':
        return [
          "The document shows clear influences from both Enlightenment rationalism and Romantic idealism, particularly evident in the references to Goethe...",
          "Analysis reveals a consistent pattern of religious symbolism throughout the text, suggesting the author had formal theological training...",
          "By comparing the linguistic patterns with contemporaneous texts, we can identify this as likely written in the early 1820s rather than the published date of 1835...",
          "Contemporary economics acknowledges the importance of shipping efficiency, as described in the source, but also recognizes..."
        ];
      case 'extract':
        return [
          "Found 27 references to indigenous medicinal plants, with 8 documented treatments not previously recorded in European pharmacopeias of the period...",
          "Extracted all place names mentioned in the travel account. The top entries are as follows: London (17), Paris (4), Constantinople (7), Alexandria (2)...",
          "Identified consistent shifts in emotional tone when discussing colonial administration versus native governance, with sentiment scores of -0.8 and +0.3..."
        ];
      case 'simulate':
        return [
          "'Wilkie? My brother Robertson, you mean? What's to tell? He's off in Europe, painting, as usual. A life of bohemian wandering. It can't be good for the nerves...'",
          " 'Bom dia! Ah, California, dizem que é um lugar bonito, cheio de sol e oportunidades. Mas também é longe, não é? Espero que esteja bem, apesar do seu português. Tome cuidado de ossos...'",
          " 'Why, I certainly did not intend to be understood to be saying THAT. I must confess my astonishment at the suggestion. But... if one WERE to argue such a thing...' "
        ];
      case 'discover':
        return [
          "Internal evidence suggests this 'anonymous' pamphlet was actually written by Thomas Paine. A comparative stylistic analysis with his works...",
          "The handwriting in the margin of this note suggests that the author reviewed (and, it would seem, disapproved of) the concepts expressed within...",
          "This map contains deliberate errors commonly used by cartographers to identify unauthorized copies, particularly in the riverways southeast..."
        ];
      default:
        return [""];
    }
  };

  // Update typewriter text when feature changes
useEffect(() => {
  const delay = setTimeout(() => {
    const texts = getTypewriterTexts(activeFeature);
    const randomIndex = Math.floor(Math.random() * texts.length);
    setCurrentTypewriterText(texts[randomIndex]);
  }, 2000); //  2 second delay before setting new text

  return () => clearTimeout(delay); // Cleanup if feature changes quickly
}, [activeFeature]);


  // Core features with enhanced descriptions
  const features = [
    {
      id: "contextualize",
      title: "Contextualize",
      description: "your sources with rich historical background and relevant scholarly connections",
      icon: "🌍",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      hoverColor: "hover:text-emerald-700"
    },
    {
      id: "analyze",
      title: "Analyze",
      description: "your sources with AI-powered close reading to uncover hidden patterns and insights",
      icon: "🔍",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      hoverColor: "hover:text-indigo-700"
    },
    {
      id: "extract",
      title: "Extract",
      description: "key information from your sources to generate structured data and visualizations",
      icon: "✨",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      hoverColor: "hover:text-amber-400"
    },
    {
      id: "simulate",
      title: "Simulate",
      description: "conversations with historical figures to explore their perspective and worldview",
      icon: "💬",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      hoverColor: "hover:text-purple-700"
    },
    {
      id: "discover",
      title: "Discover",
      description: "unexpected connections and scholarly insights that traditional research might miss",
      icon: "🔮",
      color: "text-rose-600",
      bgColor: "bg-rose-50",
      hoverColor: "hover:text-rose-700"
    }
  ];

  // Auto-rotate active feature
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => {
        const currentIndex = features.findIndex(f => f.id === prev);
        const nextIndex = (currentIndex + 1) % features.length;
        return features[nextIndex].id;
      });
    }, 20000); // every 20 seconds

    return () => clearInterval(interval); // clean up on unmount
  }, []);

  // Update visible buttons based on center position
  useEffect(() => {
    const calculateVisibleButtons = () => {
      const activeFeatureIndex = features.findIndex(f => f.id === activeFeature);
      
      // On larger screens, show all buttons
      if (window.innerWidth >= 808) {
        setVisibleButtons(features.map(f => f.id));
        return;
      }
      
      // On smaller screens, show 3 buttons with active one in center
      let visibleIndices = [activeFeatureIndex];
      
      // Add one before and one after (with wrapping)
      const prevIndex = activeFeatureIndex === 0 ? features.length - 1 : activeFeatureIndex - 1;
      const nextIndex = activeFeatureIndex === features.length - 1 ? 0 : activeFeatureIndex + 1;
      
      visibleIndices.push(prevIndex, nextIndex);
      
      // Sort indices and get corresponding feature ids
      const sortedVisibleButtons = visibleIndices
        .sort((a, b) => a - b)
        .map(idx => features[idx].id);
      
      setVisibleButtons(sortedVisibleButtons);
    };
    
    calculateVisibleButtons();
    
    // Recalculate on resize
    window.addEventListener('resize', calculateVisibleButtons);
    return () => window.removeEventListener('resize', calculateVisibleButtons);
  }, [activeFeature]);

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-6 relative">
      <div className="mb-0 mt-0">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-14 items-start">
          {/* Left side - Main description and feature buttons */}
          <div className="flex-1">
            {/* Main headline */}
            <motion.h2 
              className={`${spaceGrotesk.className} text-2xl md:text-3xl  font-bold tracking-tight mb-4 text-slate-600`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Uncover deeper insights in <span className="text-indigo-700">primary sources</span>
            </motion.h2>
            
            {/* Animated feature description */}
            <motion.div 
              className="mb-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <p className="text-slate-600 text-lg mb-1">
                SourceLens uses AI to help you{' '}
                <AnimatePresence mode="wait">
                  <motion.span
                    key={activeFeature}
                    className={`inline-block font-medium ${features.find(f => f.id === activeFeature)?.color}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {features.find(f => f.id === activeFeature)?.title.toLowerCase()}
                  </motion.span>
                </AnimatePresence>{' '}
                <AnimatePresence mode="wait">
                  <motion.span
                    key={activeFeature + "-desc"}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {features.find(f => f.id === activeFeature)?.description}
                  </motion.span>
                </AnimatePresence>
              </p>
            </motion.div>
            
            {/* Feature Button Pills in Horizontal Scrollable Container */}
            <motion.div 
              ref={featuresContainerRef}
              className="flex overflow-x-auto overflow-visible gap-2 mb-6 py-0.5 relative w-full max-w-full md:max-w-4xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex gap-2 md:flex-wrap transition-transform duration-300 mx-auto md:mx-0">
                {features.map((feature) => (
                  <motion.button
                    key={feature.id}
                    className={`flex items-center whitespace-nowrap px-3 py-2 rounded-full border transition-all duration-200 ${
                      activeFeature === feature.id
                        ? `${feature.bgColor} border-${feature.id === 'contextualize' ? 'emerald' : feature.id === 'analyze' ? 'indigo' : feature.id === 'extract' ? 'amber' : feature.id === 'simulate' ? 'purple' : 'rose'}-200 shadow-sm`
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                    onClick={() => setActiveFeature(feature.id)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <span className="mr-2 text-xl">{feature.icon}</span>
                    <span className={`font-medium ${
                      activeFeature === feature.id
                        ? feature.color
                        : 'text-slate-700 ' + feature.hoverColor
                    }`}>
                      {feature.title}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
            
            
          </div>
          
          {/* Right side - Typewriter effect */}
          <motion.div 
            className="flex-shrink-0 lg:w-3/10 bg-slate-50 px-7 py-5 mt-4 rounded-xl border border-slate-200 shadow-sm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="h-38 overflow-hidden">
              <AnimatePresence mode="wait">
                <TypewriterEffect 
                  key={activeFeature + currentTypewriterText}
                  text={currentTypewriterText}
                  isVisible={true}
                />
              </AnimatePresence>
            </div>
          </motion.div>

        </div>
        {/* Centered Demo Button with Hover Effect */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="relative flex justify-center w-full mt-22 mb-2"
            >
              {/* Hover thumbnails */}
              <HoverThumbnails isHovering={isHovering} demoTexts={demoTexts} />
              
              {/* Demo Button */}
             <motion.div
               onMouseEnter={() => setIsHovering(true)}
               onMouseLeave={() => setIsHovering(false)}
               onClick={() => setIsHovering(false)} // <- this line ensures thumbnails close on click
             >
               <DemoButtons
                 demoTexts={demoTexts}
                 selectedDemo={selectedDemo}
                 loadDemoContent={loadDemoContent}
                 handleQuickDemo={handleQuickDemo}
                 handleManhattanNarrative={handleManhattanNarrative}
                 handleHighlightDemo={handleHighlightDemo}
                 showDemoOptions={showDemoOptions}
                 setShowDemoOptions={setShowDemoOptions}
                 buttonRef={buttonRef}
                 dropdownRef={dropdownRef}
                 isDarkMode={isDarkMode}
               />
             </motion.div>

            </motion.div>
      </div>
    </div>
  );
}