// components/roleplay/RoleplayChat.tsx
// Modern, elegant simulation interface for historical figure dialogue
// Features persistent settings sidebar, location-based header background,
// and proper status extraction for enhanced immersion

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppStore, ConversationMessage } from '@/lib/store';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import SourceDetailsPanel from '../analysis/SourceDetailsPanel';
import { getPrioritizedImagePaths } from '../ui/LocationBackgroundUtils';
import remarkGfm from 'remark-gfm';

// Avatar component with proper fallbacks
const Avatar = ({ 
  src, 
  emoji, 
  alt, 
  size = 40
}: { 
  src?: string; 
  emoji?: string; 
  alt: string; 
  size?: number;
}) => {
  const [imgError, setImgError] = useState(false);
  
  if (src && !imgError) {
    return (
      <div 
        className="relative overflow-hidden rounded-full border border-slate-200 shadow-sm bg-white"
        style={{ width: size, height: size }}
      >
        <Image 
          src={src} 
          alt={alt} 
          fill 
          className="object-cover" 
          onError={() => setImgError(true)}
        />
      </div>
    );
  }
  
  return (
    <div 
      className="flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 rounded-full border border-slate-200"
      style={{ width: size, height: size }}
    >
      <span style={{ fontSize: size * 0.6 }}>{emoji || '👤'}</span>
    </div>
  );
};

export default function RoleplayChat() {
  // App state from store
  const { 
    metadata,
    setMetadata,
    sourceContent,
    conversation,
    addMessage,
    llmModel,
    setRawPrompt,
    setRawResponse,
    isLoading,
    setLoading,
    setActivePanel
  } = useAppStore();
  
  // Local state
  const [message, setMessage] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [characterSketch, setCharacterSketch] = useState('');
  const [showSketch, setShowSketch] = useState(false);
  const [hasPortrait, setHasPortrait] = useState(false);
  const [showSettings, setShowSettings] = useState(true); // Start with settings open
  const [loadingDots, setLoadingDots] = useState('');
  const [simulationStyle, setSimulationStyle] = useState(0.3);
  const [responseLength, setResponseLength] = useState(1); // 0: Concise, 1: Balanced, 2: Detailed
  const [emotionalRange, setEmotionalRange] = useState(0.5);
  const [periodAccurateLanguage, setPeriodAccurateLanguage] = useState(true);
  const [includeContextual, setIncludeContextual] = useState(false);
  const [headerBackgroundImage, setHeaderBackgroundImage] = useState<string | null>(null);
  const [characterStatus, setCharacterStatus] = useState<string | null>(null);
  const [settingsChanged, setSettingsChanged] = useState(false);


  // Fixed height and no need for resizing anymore
  const [containerHeight] = useState(800); 
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const characterNotesRef = useRef<HTMLDivElement>(null);
  
  // Initialize roleplay
  useEffect(() => {
    if (!isInitialized && sourceContent && metadata) {
      initializeRoleplay();
    }
  }, [isInitialized, sourceContent, metadata]);

  // Load location background image
  useEffect(() => {
    if (metadata?.placeOfPublication) {
      const loadBackgroundImage = async () => {
        try {
          // Use the same functionality as DocumentPortraitModal
          const imagePaths = getPrioritizedImagePaths(metadata.date || '', metadata.placeOfPublication || '');
          
          for (const path of imagePaths) {
            try {
              const response = await fetch(path, { method: 'HEAD' });
              if (response.ok) {
                setHeaderBackgroundImage(path);
                return;
              }
            } catch (error) {
              console.error(`Error checking image path ${path}:`, error);
            }
          }
        } catch (error) {
          console.error('Error loading background image:', error);
        }
      };
      
      loadBackgroundImage();
    }
  }, [metadata]);

  // Animated loading dots
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingDots(prev => {
          if (prev.length >= 3) return '.';
          return prev + '.';
        });
      }, 400);
      
      return () => clearInterval(interval);
    }
  }, [isLoading]);
  
  // Focus input on initialization
  useEffect(() => {
    if (isInitialized && !isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isInitialized, isLoading]);
  
  // Handle click outside character notes to close
  useEffect(() => {
    if (!showSketch) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (characterNotesRef.current && !characterNotesRef.current.contains(event.target as Node)) {
        setShowSketch(false);
      }
    };


    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSketch]);
  
  useEffect(() => {
  if (settingsChanged) {
    const timer = setTimeout(() => {
      setSettingsChanged(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }
}, [settingsChanged]);

  
  // Initialize roleplay conversation
  const initializeRoleplay = async () => {
    if (!sourceContent || !metadata) return;
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/roleplay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: sourceContent,
          metadata: metadata,
          model: llmModel,
          initialize: true
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      
      const data = await response.json();
      
      setCharacterSketch(data.characterSketch || '');
      setHasPortrait(data.hasPortrait || false);
      
      // Update metadata with author info
      if (metadata) {
        setMetadata({
          ...metadata,
          authorEmoji: data.authorEmoji,
          birthYear: data.birthYear,
          deathYear: data.deathYear,
          birthplace: data.birthplace
        });
      }
      
    setIsInitialized(true);
setLoading(false); 
    } catch (error) {
      console.error("Roleplay initialization error:", error);
      addMessage({
        role: 'system',
        content: 'Error initializing simulation. Please try again.'
      });
      setLoading(false);
    }
  };

  
  // Send message to author


const handleSendMessage = async (e?: React.FormEvent) => {
  if (e) e.preventDefault();
  
  if (!message.trim() || isLoading) return;
  
  const userMessage = message.trim();
  setMessage('');
  
  // Add user message to conversation
  addMessage({
    role: 'user',
    content: userMessage,
  });
  
  // Set loading state
  setLoading(true);
  
  try {
    // Log the settings being sent for debugging
    console.log("Sending roleplay settings:", {
      simulationStyle,
      responseLength: ['concise', 'balanced', 'detailed'][responseLength],
      emotionalRange,
      periodAccurateLanguage,
      includeContextual
    });
    
    const response = await fetch('/api/roleplay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: sourceContent,
        metadata: metadata,
        message: userMessage,
        model: llmModel,
        conversation: conversation.slice(-6), // Last 6 messages for context
        simulationStyle,
        responseLength: ['concise', 'balanced', 'detailed'][responseLength],
        emotionalRange,
        periodAccurateLanguage,
        includeContextual
      }),
    });
    
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Process the response to extract status
    const processedResponse = processResponseText(data.response);
    
    // Add author's response to conversation
    addMessage({
      role: 'assistant',
      content: processedResponse.cleanText,

    });
    
    // Update character status if found
    if (processedResponse.status) {
      setCharacterStatus(processedResponse.status);
      
      if (metadata) {
        setMetadata({
          ...metadata,
          characterStatus: processedResponse.status
        });
      }
    }
    
    // Store raw data
    setRawPrompt(data.rawPrompt || null);
    setRawResponse(data.rawResponse || null);
    
  } catch (error) {
    console.error("Roleplay chat error:", error);
    addMessage({
      role: 'system',
      content: `Error: ${error instanceof Error ? error.message : 'Failed to get response'}`
    });
  } finally {
    setLoading(false);
  }
};
  
  // Helper function to extract status and clean response text
  const processResponseText = (text: string): { cleanText: string; status?: string } => {
    // Check for status tag format: <status>text</status>
    const statusTagMatch = text.match(/<status>(.*?)<\/status>/);
    let status: string | undefined = undefined;
    let cleanText = text;
    
    if (statusTagMatch && statusTagMatch[1]) {
      status = statusTagMatch[1].trim();
      // Remove the status tag from the text
      cleanText = text.replace(/<status>.*?<\/status>/, '').trim();
    } else {
      // Fall back to old [STATUS: text] format
      const statusMatch = text.match(/\[STATUS:\s*([^\]]+)\]$/);
      if (statusMatch && statusMatch[1]) {
        status = statusMatch[1].trim();
        cleanText = text.replace(/\s*\[STATUS:\s*[^\]]+\]\s*$/, '').trim();
      }
    }
    
    return { cleanText, status };
  };
  
  // Reset settings to defaults
const handleResetSettings = () => {
  setSimulationStyle(0.3);
  setResponseLength(1);
  setEmotionalRange(0.5);
  setPeriodAccurateLanguage(true);
  setIncludeContextual(false);
  setSettingsChanged(true);
};
  
  // Exit roleplay mode
  const handleExitRoleplay = () => {
    setActivePanel('analysis');
  };
  
  // Toggle character sketch
  const toggleCharacterSketch = () => {
    setShowSketch(!showSketch);
  };

  const renderMessage = (msg: ConversationMessage) => {
  const isUser = msg.role === 'user';
  const isSystem = msg.role === 'system';
  
  // Format timestamp
  const formattedTime = msg.timestamp 
    ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 mt-3`}>
      {!isUser && !isSystem && (
        <Avatar
          src={hasPortrait && metadata?.author ? `/portraits/${metadata.author.toLowerCase().replace(/\s+/g, '')}.jpg` : undefined}
          emoji={metadata?.authorEmoji || '👤'}
          alt={metadata?.author || 'Author'}
          size={36}
        />
      )}
      
      <div className={`mx-2 max-w-[75%] ${isUser ? 'order-1' : 'order-2'}`}>
        <div className={`px-4 py-2 rounded-lg ${
          isUser
            ? 'bg-white text-sky-900 border border-sky-600'
            : isSystem
              ? 'bg-amber-50 text-amber-800 text-sm border border-amber-100'
              : 'bg-white border border-slate-900 text-black'
        }`}>
          <div className="prose p-1 prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
          </div>
        </div>
        
        {formattedTime && (
          <div className="text-[10px] text-slate-600 mt-1 flex justify-end">
            {formattedTime}
          </div>
        )}
      </div>
    </div>
  );
};

<div className="max-w-3xl mx-auto">
{conversation.map((msg, index) => (
  <React.Fragment key={`msg-${index}`}>
    {renderMessage(msg)}
  </React.Fragment>
))}
  
  {/* Loading indicator */}
  {isLoading && (
    <div className="flex items-center mt-2 mb-4">
      <Avatar
        src={hasPortrait && metadata?.author ? `/portraits/${metadata.author.toLowerCase().replace(/\s+/g, '')}.jpg` : undefined}
        emoji={metadata?.authorEmoji || '👤'}
        alt={metadata?.author || 'Author'}
        size={36}
      />
      
      <div className="mx-2 px-4 py-2 bg-white rounded-lg border border-slate-200">
        <div className="flex space-x-1.5">
          <div className="w-2 h-2 rounded-full bg-sky-800 opacity-75 animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-sky-800 opacity-75 animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-sky-800 opacity-75 animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  )}
  
  <div ref={messagesEndRef} />
</div>



// Character Notes Component (Slide-down panel version)
const CharacterNotes = () => {
  if (!characterSketch || !showSketch) return null;
  
  // Extract metadata from character sketch
  const extractMetadata = (sketch: string) => {
    const representativePhraseMatch = sketch.match(/REPRESENTATIVE PHRASE:\s*([^\n]+)/);
    const birthYearMatch = sketch.match(/BIRTH_YEAR:\s*(\S+)/);
    const deathYearMatch = sketch.match(/DEATH_YEAR:\s*(\S+)/);
    const birthplaceMatch = sketch.match(/BIRTHPLACE:\s*([^\n]+)/);
    const emojiMatch = sketch.match(/EMOJI:\s*(\S+)/);
    
    return {
      representativePhrase: representativePhraseMatch ? representativePhraseMatch[1].trim() : null,
      birthYear: birthYearMatch ? birthYearMatch[1].trim() : null,
      deathYear: deathYearMatch ? deathYearMatch[1].trim() : null,
      birthplace: birthplaceMatch ? birthplaceMatch[1].trim() : null,
      emoji: emojiMatch ? emojiMatch[1].trim() : null
    };
  };
  
  // Clean the sketch by removing metadata sections
  const cleanSketch = (sketch: string) => {
    return sketch
      .replace(/REPRESENTATIVE PHRASE:\s*[^\n]+/g, '')
      .replace(/BIRTH_YEAR:\s*\S+/g, '')
      .replace(/DEATH_YEAR:\s*\S+/g, '')
      .replace(/BIRTHPLACE:\s*[^\n]+/g, '')
      .replace(/EMOJI:\s*\S+/g, '')
      .trim();
  };
  
  const extractedMetadata = extractMetadata(characterSketch);
  const cleanedSketch = cleanSketch(characterSketch);
  
  return (
    <div 
      ref={characterNotesRef}
      className="absolute top-0 left-0 right-0 bg-white z-20 border-b border-slate-200 shadow-lg transition-all overflow-hidden"
      style={{ maxHeight: showSketch ? '600px' : '0', transition: 'max-height 0.4s ease-in-out' }}
    >
      {/* Background image with darkened overlay */}
      {headerBackgroundImage && (
        <div className="absolute inset-0 z-0 opacity-20">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${headerBackgroundImage}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-900/95" />
        </div>
      )}
      
      <div className="relative z-10 p-6 max-h-[600px] overflow-y-auto">
        <div className="flex justify-between items-center mb-5 border-b border-slate-700/30 pb-3">
          <h3 className="text-xl font-serif font-medium text-slate-800 flex items-center">
            <span className="w-1.5 h-6 bg-amber-400 rounded-full inline-block mr-3"></span>
            {/* Use the global metadata from store, not the local extractedMetadata */}
            {metadata?.author || 'Author'}'s Background
          </h3>
          <button 
            onClick={() => setShowSketch(false)}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Rest of the component uses extractedMetadata appropriately */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left column with portrait and metadata */}
          <div className="md:w-48 flex flex-col items-center">
            <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-slate-200 shadow-md mb-3 bg-white">
              {hasPortrait && metadata?.author ? (
                <div className="w-full h-full relative">
                  <Image 
                    src={`/portraits/${metadata.author.toLowerCase().replace(/\s+/g, '')}.jpg`}
                    alt={metadata.author}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-50 text-5xl">
                  {extractedMetadata.emoji || metadata?.authorEmoji || '👤'}
                </div>
              )}
            </div>
            
            {/* Years lived */}
            <div className="py-2 px-3 bg-slate-800/60 backdrop-blur-sm rounded-md shadow-sm text-center mb-3 w-full">
              <div className="text-sm text-white font-medium mb-1">
                {extractedMetadata.birthYear || metadata?.birthYear} – {extractedMetadata.deathYear || metadata?.deathYear}
              </div>
              
              {/* Birthplace */}
              {(extractedMetadata.birthplace || metadata?.birthplace) && (
                <div className="text-sm text-slate-200 flex items-center justify-center">
                  <svg className="w-3 h-3 mr-1 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {extractedMetadata.birthplace || metadata?.birthplace}
                </div>
              )}
            </div>
            
            {/* Representative phrase */}
            {extractedMetadata.representativePhrase && (
              <div className="w-full bg-slate-100 border border-slate-200 rounded-md p-3 mt-2">
                <p className="text-sm text-slate-700 italic">"{extractedMetadata.representativePhrase}"</p>
              </div>
            )}
          </div>
          
          {/* Right column with text */}
          <div className="md:flex-1">
            <div className="prose prose-slate prose-headings:font-serif prose-sm max-w-none bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-slate-200">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{cleanedSketch}</ReactMarkdown>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-700/20 flex items-center justify-between">
              <div className="text-xs text-slate-500 italic flex items-start">
                <svg className="w-4 h-4 mr-1.5 flex-shrink-0 text-amber-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>This context is based on available historical information and may include speculative elements.</span>
              </div>
              
              <button 
                onClick={() => setShowSketch(false)}
                className="px-3 py-1.5 bg-slate-700/60 hover:bg-slate-700/80 rounded text-sm text-white transition-colors flex-shrink-0 backdrop-blur-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

  // Settings Panel
  const SettingsPanel = () => {
    if (!showSettings) return null;

    {settingsChanged && (
  <div className="fixed bottom-4 right-4 bg-sky-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in-out z-50">
    Settings updated! Next response will reflect changes.
  </div>
)}
    
    return (

      <div className="h-full w-65  p-4 ml-3 z-10 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-medium text-slate-800">Simulation Settings</h3>
          <button 
            onClick={() => setShowSettings(false)}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded hover:bg-slate-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Simulation Style */}
        <div className="mb-6">
       

          <div className="flex justify-between mb-2">
  <label className="text-sm font-medium text-slate-700">
    Simulation Style
    <span className="ml-1 text-slate-400 hover:text-slate-600 cursor-help" title="Determines how historically accurate vs. educational the responses will be. Lower means more accurate to the time period, higher means more accessible and educational.">
      <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </span>
  </label>
</div>
          
         <input
           type="range"
           min="0"
           max="1"
           step="0.01"
           value={simulationStyle}
           onChange={(e) => {
             setSimulationStyle(parseFloat(e.target.value));
             setSettingsChanged(true);
           }}
           className="w-full h-2 bg-gradient-to-r from-indigo-400 to-sky-400 rounded-lg appearance-none cursor-pointer"
         />

          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>Historically Accurate</span>
            <span>More Educational</span>
          </div>
        </div>
        
        {/* Response Length */}
        <div className="mb-6">
         <label className="block text-sm font-medium text-slate-700 mb-2">
  Response Length
  <span className="ml-1 text-slate-400 hover:text-slate-600 cursor-help" title="Controls how brief or detailed the author's responses will be.">
    <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  </span>
</label>
          <div className="flex space-x-2">
            {['Concise', 'Balanced', 'Detailed'].map((option, index) => (
              <button
                key={option}
                onClick={() => setResponseLength(index)}
                className={`flex-1 py-1.5 px-2 rounded text-sm transition-colors ${
                  index === responseLength
                    ? 'bg-sky-50 text-sky-600 font-medium border border-sky-100'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        
        {/* Emotional Range */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
  <label className="text-sm font-medium text-slate-700">
    Emotional Range
    <span className="ml-1 text-slate-400 hover:text-slate-600 cursor-help" title="Controls how emotionally expressive or reserved the author will be. Lower means more emotionally restrained, higher means more passionate and expressive.">
      <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </span>
  </label>
  <span className="text-xs text-sky-600">{
    emotionalRange < 0.3 ? 'Reserved' : 
    emotionalRange > 0.7 ? 'Expressive' : 'Authentic'
  }</span>
</div>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={emotionalRange}
            onChange={(e) => {
                setEmotionalRange(parseFloat(e.target.value));
                setSettingsChanged(true);
              }}
            className="w-full h-2 bg-gradient-to-r from-slate-300 via-sky-300 to-rose-300 rounded-lg appearance-none cursor-pointer"
          />
          
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>Reserved</span>
            <span>Authentic</span>
            <span>Expressive</span>
          </div>
        </div>
        
        {/* Toggle Options */}
        <div className="space-y-3 mb-6">
         <div className="flex items-center justify-between">
           <label className="text-sm text-slate-700">
             Period-accurate language
             <span className="ml-1 text-slate-400 hover:text-slate-600 cursor-help" title="When enabled, the author will use more historically accurate language patterns and vocabulary from their time period.">
               <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
             </span>
           </label>
           <button 
             onClick={() => setPeriodAccurateLanguage(!periodAccurateLanguage)}
             className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${periodAccurateLanguage ? 'bg-sky-500' : 'bg-slate-300'}`}
           >
             <span 
               className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${periodAccurateLanguage ? 'translate-x-5' : 'translate-x-1'}`}
             ></span>
           </button>
         </div>
          
          <div className="flex items-center justify-between">
            <label className="text-sm text-slate-700">
              Include contextual references
              <span className="ml-1 text-slate-400 hover:text-slate-600 cursor-help" title="When enabled, the author will occasionally reference their surroundings, current events of their time, or personal circumstances.">
                <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </label>
            <button 
              onClick={() => setIncludeContextual(!includeContextual)}
              className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${includeContextual ? 'bg-sky-500' : 'bg-slate-300'}`}
            >
              <span 
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${includeContextual ? 'translate-x-5' : 'translate-x-1'}`}
              ></span>
            </button>
          </div>
        </div>
        
        {/* Info Block */}
        <div className="mb-8 text-xs text-slate-500 bg-slate-50 p-3 rounded border border-slate-200">
          <p className="leading-relaxed">
            This simulation attempts to recreate how a historical figure might respond based on available 
            historical information. Results may vary in accuracy.
          </p>
        </div>
        
        <div className="mt-auto pt-4 border-t border-slate-200">
          <button 
            onClick={handleResetSettings}
            className="w-full py-2 text-sm text-sky-600 hover:text-sky-800 transition-colors"
          >
            Reset to Defaults
          </button>
        </div>

      </div>

    );
  };

  // Main rendering
  return (
    <div className="flex bg-gradient-to-b from-slate-100 to-slate-50 p-2  h-full relative">
      {/* Character Notes (slide down from top) */}
      <CharacterNotes />
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with author info and background image */}
        <div className="flex-shrink-0 rounded-t-xl rounded-b-sm border-b-2 border border-slate-500 border-b-sky-800 relative shadow-lg overflow-hidden">
          {/* Background image with overlay */}
          {headerBackgroundImage && (
            <div className="absolute  inset-0 z-0">
              <div 
                className="absolute inset-0 z-0 bg-cover bg-center"
                style={{ backgroundImage: `url('${headerBackgroundImage}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r z-0 from-slate-900/80 via-slate-800/70 to-transparent" />
            </div>
          )}
          
          <div className={`p-3 relative z-1 ${headerBackgroundImage ? 'text-white' : 'bg-gradient-to-r from-slate-50 to-white'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar
                  src={hasPortrait && metadata?.author ? `/portraits/${metadata.author.toLowerCase().replace(/\s+/g, '')}.jpg` : undefined}
                  emoji={metadata?.authorEmoji || '👤'}
                  alt={metadata?.author || 'Author'}
                  size={44}
                />
                
                <div>
                  <h3 className={`font-medium ${headerBackgroundImage ? 'text-white' : 'text-slate-800'} text-lg flex items-center`}>
                    {metadata?.author || 'Unknown Author'}
                    {headerBackgroundImage && <span className="ml-3 text-xs bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">{metadata?.date}</span>}
                  </h3>
                  
                  {/* Status display */}
                  {characterStatus && (
                    <div className={`text-sm ${headerBackgroundImage ? 'text-amber-200' : 'text-slate-600'} italic mt-1`}>
                      {characterStatus}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {characterSketch && (
                  <button
                    onClick={toggleCharacterSketch}
                    className={`p-2 rounded ${
                      showSketch 
                        ? headerBackgroundImage ? 'bg-white/20 text-white' : 'bg-sky-50 text-sky-600' 
                        : headerBackgroundImage ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    title="Character Notes"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                )}
                
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-2 rounded ${
                    showSettings 
                      ? headerBackgroundImage ? 'bg-white/20 text-white' : 'bg-sky-50 text-sky-600' 
                      : headerBackgroundImage ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  title="Settings"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                
                
              </div>

            </div>
          </div>

        </div>
        
        {/* Chat area with fixed height */}
        <div className="flex-1 flex flex-col px-1.5" style={{ height: `${containerHeight}px` }}>


        <div 

            ref={messagesContainerRef}
            className="flex-1 relative overflow-y-auto p-8 shadow-inner bg-gradient-to-t from-slate-300/60 to-stone-300/20 "
          >
          {/* Background image with overlay */}
          {headerBackgroundImage && (
            <div className="absolute inset-0 z-0 opacity-15 ">
              <div 
                className="fixed inset-0 bg-cover blur-lg saturate-120 bg-top"
                style={{ backgroundImage: `url('${headerBackgroundImage}')` }}
              />
              <div className="absolute inset-0 " />
            </div>
          )}
            {conversation.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-full bg-sky-50 flex items-center justify-center shadow-sm mb-4">
                  <svg className="w-8 h-8 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-slate-800 mb-2">Begin Your Conversation</h3>
                <p className="text-slate-600 max-w-md">
                  Ask {metadata?.author || 'the author'} about their work, ideas, or historical context.
                </p>
              </div>
            ) : (
             // Replace the conversation mapping code in RoleplayChat.tsx with this:
<div className="max-w-3xl mx-auto">
  {conversation.map((msg, index) => (
    <div key={`msg-${index}`}>
      {renderMessage(msg)}
    </div>
  ))}
  
  {/* Loading indicator */}
  {isLoading && (
    <div className="flex items-center mt-2 mb-4">
      <Avatar
        src={hasPortrait && metadata?.author ? `/portraits/${metadata.author.toLowerCase().replace(/\s+/g, '')}.jpg` : undefined}
        emoji={metadata?.authorEmoji || '👤'}
        alt={metadata?.author || 'Author'}
        size={36}
      />
      
      <div className="mx-2 px-4 py-2 bg-white rounded-lg border border-slate-200">
        <div className="flex space-x-1.5">
          <div className="w-2 h-2 rounded-full bg-sky-200 opacity-75 animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-sky-300 opacity-75 animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-sky-400 opacity-75 animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  )}
  
  <div ref={messagesEndRef} />
</div>
            )}

          </div>

          
          {/* Input form  */}
<div className="p-4 border-t-2 shadow-lg border-b-3 border-slate-300 bg-white relative rounded-b-xl">
  

            <form onSubmit={handleSendMessage} className="relative">
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Ask ${metadata?.author || 'the author'} something...`}
                className="w-full py-2.5 pl-4 pr-12 bg-slate-50 hover:bg-white border border-slate-200 hover:border-slate-300 shadow-inner focus:border-amber-200 rounded-full outline-none transition-all text-slate-700 placeholder-slate-400"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!message.trim() || isLoading}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full p-2 transition-colors ${
                  !message.trim() || isLoading
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-sky-500 text-white '
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
            
            <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
              <button 
                onClick={handleExitRoleplay} 
                className="text-slate-500 hover:text-slate-700 transition-colors flex items-center"
              >
                <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Return to Analysis</span>
              </button>


              
              <div className="flex items-center">
                <span className="inline-block h-1.5 w-1.5 rounded-full mr-1.5" style={{
                  backgroundColor: simulationStyle < 0.3 ? '#4338ca' : simulationStyle > 0.7 ? '#0ea5e9' : '#6366f1'
                }}></span>
                <span>{
                  simulationStyle < 0.3 ? 'Historical Mode' : 
                  simulationStyle > 0.7 ? 'Educational Mode' : 
                  'Balanced Mode'
                }</span>


              </div>

             
            </div>

          </div>
        </div>

        {/* Source Details */}


        <div className="flex justify-between items-center px-4 py-0 border-t-0 border-slate-200">



          {/* bottom padding */}
          <div className="text-xs text-slate-500 mt-10 rounded-xl flex items-center">


{/* Character Notes Panel (Desktop version) */}
<div className="hidden md:block border-t border-slate-200 bg-white rounded-xl relative">
  {characterSketch && (
    <>
      
      
      <div className="relative z-10 max-h-[400px] overflow-y-auto p-6 rounded-xl mb-1 shadow">
        {(() => {
          // Extract metadata from character sketch
          const extractMetadata = (sketch: string) => {
            const representativePhraseMatch = sketch.match(/REPRESENTATIVE PHRASE:\s*([^\n]+)/);
            const birthYearMatch = sketch.match(/BIRTH_YEAR:\s*(\S+)/);
            const deathYearMatch = sketch.match(/DEATH_YEAR:\s*(\S+)/);
            const birthplaceMatch = sketch.match(/BIRTHPLACE:\s*([^\n]+)/);
            const emojiMatch = sketch.match(/EMOJI:\s*(\S+)/);
            
            return {
              representativePhrase: representativePhraseMatch ? representativePhraseMatch[1].trim() : null,
              birthYear: birthYearMatch ? birthYearMatch[1].trim() : null,
              deathYear: deathYearMatch ? deathYearMatch[1].trim() : null,
              birthplace: birthplaceMatch ? birthplaceMatch[1].trim() : null,
              emoji: emojiMatch ? emojiMatch[1].trim() : null
            };
          };
          
          // Clean the sketch by removing metadata sections
const cleanSketch = (sketch: string) => {
            return sketch
              .replace(/REPRESENTATIVE PHRASE:\s*[^\n]+/g, '')
              .replace(/BIRTH_YEAR:\s*\S+/g, '')
              .replace(/DEATH_YEAR:\s*\S+/g, '')
              .replace(/BIRTHPLACE:\s*[^\n]+/g, '')
              .replace(/EMOJI:\s*\S+/g, '')
              .trim();
          };
          
          const metadataInfo = extractMetadata(characterSketch);
          const cleanedSketch = cleanSketch(characterSketch);
          
          return (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-serif font-medium text-slate-800 flex items-center">
                  <span className="w-1 h-5 bg-amber-400 rounded-full inline-block mr-2"></span>
                  {metadata?.author || 'Author'}'s Context
                </h3>
                <div className="flex items-center text-xs text-slate-500">
                  <span className="px-4 py-1 bg-slate-100/80 backdrop-blur-sm rounded-full">Imagined Setting</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Portrait and metadata */}
                <div className="lg:col-span-1 flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-slate-200 shadow-md mb-3 bg-white">
                    {hasPortrait && metadata?.author ? (
                      <div className="w-full h-full relative">
                        <Image 
                          src={`/portraits/${metadata.author.toLowerCase().replace(/\s+/g, '')}.jpg`}
                          alt={metadata.author}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-50 text-5xl">
                        {metadataInfo?.emoji || metadata?.authorEmoji || '👤'}
                      </div>
                    )}
                  </div>
                  
                  {/* Years lived */}
                  {(metadataInfo?.birthYear || metadata?.birthYear) && (metadataInfo?.deathYear || metadata?.deathYear) && (
                    <div className="text-sm text-slate-600 font-medium mb-1">
                      {metadataInfo?.birthYear || metadata?.birthYear} – {metadataInfo?.deathYear || metadata?.deathYear}
                    </div>
                  )}
                  
                  {/* Birthplace */}
                  {(metadataInfo?.birthplace || metadata?.birthplace) && (
                    <div className="text-sm text-slate-600 flex items-center">
                      <svg className="w-3 h-3 mr-1 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {metadataInfo?.birthplace || metadata?.birthplace}
                    </div>
                  )}
                  
                  {/* Representative phrase */}
                  {metadataInfo?.representativePhrase && (
                    <div className="w-full bg-slate-100/70 backdrop-blur-sm border border-slate-200 rounded-md p-4 mt-3">
                      <p className="text-lg font-serif text-slate-700 italic">{metadataInfo.representativePhrase}</p>
                    </div>
                  )}
                </div>
                
                {/* Character sketch */}
                <div className="lg:col-span-3">
                  <div className="text-sm prose-slate max-w-none">
                    <ReactMarkdown>{cleanedSketch}</ReactMarkdown>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 italic flex items-center">
                    <svg className="w-4 h-4 mr-1.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>This context is based on available historical information and may include speculative elements.</span>
                  </div>
                </div>
              </div>
            </>
          );
        })()}
      </div>
    </>
  )}
</div>
</div>
</div>    
</div>


      {/* Settings Panel */}
      <SettingsPanel />
    </div>
  );
}