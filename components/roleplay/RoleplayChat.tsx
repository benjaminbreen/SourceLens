// components/roleplay/RoleplayChat.tsx
// Author conversation component that simulates dialogue with the historical source's author
// Uses a generated character sketch and location backgrounds to ground the roleplay

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import LocationBackground from '../ui/LocationBackground';

interface RoleplayChatProps {
  initialMessage?: string;
}

export default function RoleplayChat({ initialMessage }: RoleplayChatProps) {
  const { 
    metadata,
    setMetadata,
    sourceContent,
    roleplayMode,
    setRoleplayMode,
    conversation,
    addMessage,
    llmModel,
    rawPrompt,
    rawResponse,
    setRawPrompt,
    setRawResponse,
    isLoading,
    setLoading,
    setActivePanel
  } = useAppStore();
  
  const [message, setMessage] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [characterSketch, setCharacterSketch] = useState('');
  const [showSketch, setShowSketch] = useState(false);
  const [hasPortrait, setHasPortrait] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [birthYear, setBirthYear] = useState<string | undefined>(undefined);
  const [deathYear, setDeathYear] = useState<string | undefined>(undefined);
  const [birthplace, setBirthplace] = useState<string | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Initialize roleplay with character sketch when first activated
  useEffect(() => {
    if (roleplayMode && !isInitialized && sourceContent && metadata) {
      initializeRoleplay();
    }
  }, [roleplayMode, isInitialized, sourceContent, metadata]);
  
  // Handle initialMessage prop
  useEffect(() => {
    // If we have an initialMessage and the roleplay is initialized but no messages yet
    if (initialMessage && isInitialized && conversation.length === 0 && !isLoading) {
      // Set the message input value
      setMessage(initialMessage);
      
      // Focus the input with a small delay to ensure UI is ready
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 500);
    }
  }, [initialMessage, isInitialized, conversation.length, isLoading]);
  
  const initializeRoleplay = async () => {
    if (!sourceContent || !metadata) return;
    
    setLoading(true);
    
    try {
      // Silent initialization to generate character sketch
      const response = await fetch('/api/roleplay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: sourceContent,
          metadata: metadata,
          model: 'gemini-flash',
          initialize: true
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Store the character sketch but don't display it to the user
      setCharacterSketch(data.characterSketch || '');
      setHasPortrait(data.hasPortrait || false);
      
      // Store biographical information
      setBirthYear(data.birthYear);
      setDeathYear(data.deathYear);
      setBirthplace(data.birthplace);
      
      // Update metadata with author emoji and biographical info
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
      
    } catch (error) {
      console.error("Roleplay initialization error:", error);
      addMessage({
        role: 'system',
        content: 'Error initializing roleplay. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isLoading) return;
    
    // Store the user's message
    const userMessage = message.trim();
    setMessage('');
    
    // Add message to conversation
    addMessage({
      role: 'user',
      content: userMessage
    });
    
    // Set loading state
    setLoading(true);
    
    try {
      // Call roleplay API
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
          // Include conversation history for better context
          conversation: conversation.slice(-6) // Last 6 messages for context
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
        content: processedResponse.cleanText
      });

      // Update character status if found
      if (processedResponse.status && metadata) {
        // Create a new object that ensures all required properties are present
        const updatedMetadata = {
          ...metadata,
          characterStatus: processedResponse.status
        };
        
        // Only update if metadata exists and has all required fields
        if (updatedMetadata.date && updatedMetadata.author && updatedMetadata.researchGoals) {
          setMetadata(updatedMetadata);
        }
      }
          
      // Store raw data for transparency
      setRawPrompt(data.rawPrompt || null);
      setRawResponse(data.rawResponse || null);
      
      // Update character sketch if returned
      if (data.characterSketch && !characterSketch) {
        setCharacterSketch(data.characterSketch);
      }
      
      // Update hasPortrait if returned
      if (data.hasPortrait !== undefined) {
        setHasPortrait(data.hasPortrait);
      }
      
      // Update metadata with author emoji if provided
      if (data.authorEmoji && metadata && !metadata.authorEmoji) {
        setMetadata({
          ...metadata,
          authorEmoji: data.authorEmoji
        });
      }
    } catch (error) {
      console.error("Roleplay chat error:", error);
      addMessage({
        role: 'system',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to get response from author'}`
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Function to toggle character sketch visibility
  const toggleCharacterSketch = () => {
    setShowSketch(!showSketch);
  };
  
  // Render the appropriate avatar for the message role
  const renderAvatar = (role: string) => {
    if (role === 'user') {
      return (
        <div className="bg-indigo-100 w-9 h-9 rounded-full flex items-center justify-center text-indigo-800 text-xs font-medium">
          You
        </div>
      );
    } else if (role === 'assistant') {
      // For the author, use portrait if available, otherwise use emoji
      if (hasPortrait && metadata?.author) {
        const portraitPath = `/portraits/${metadata.author.toLowerCase().replace(/\s+/g, '')}.jpg`;
        return (
          <div className="w-9 h-9 rounded-full overflow-hidden relative">
            <Image 
              src={portraitPath} 
              alt={metadata.author} 
              fill 
              className="object-cover"
              onError={() => setHasPortrait(false)}
            />
          </div>
        );
      } else {
        const date = metadata?.date || '';
        const year = parseInt(date, 10) || 2000;
        const getBgColor = () => {
          if (year < 500) return "bg-purple-100 text-purple-800"; // Ancient
          if (year < 1000) return "bg-indigo-100 text-indigo-800"; // Early medieval
          if (year < 1400) return "bg-blue-100 text-blue-800"; // Medieval
          if (year < 1600) return "bg-teal-100 text-teal-800"; // Renaissance
          if (year < 1800) return "bg-cyan-100 text-cyan-800"; // Early modern
          if (year < 1900) return "bg-emerald-100 text-emerald-800"; // 19th century
          if (year < 1950) return "bg-green-100 text-green-800"; // Early 20th century
          if (year < 2000) return "bg-amber-100 text-amber-800"; // Late 20th century
          return "bg-orange-100 text-orange-800"; // Contemporary
        };
        
        return (
          <div className={`${getBgColor()} w-8 h-8 rounded-full flex items-center justify-center text-sm`}>
            {metadata?.authorEmoji || '👤'}
          </div>
        );
      }
    } else {
      // System message
      return (
        <div className="bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center text-slate-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
    }
  };

  // Helper function to extract status and clean response text
  const processResponseText = (text: string): { cleanText: string; status?: string } => {
    // Look for [STATUS: ...] pattern at the end of the text
    const statusMatch = text.match(/\[STATUS:\s*([^\]]+)\]$/);
    let status: string | undefined = undefined;
    
    // Extract the status if found
    if (statusMatch && statusMatch[1]) {
      status = statusMatch[1].trim();
      // Limit status length and add ellipsis if needed
      if (status.length > 30) {
        const words = status.split(' ');
        if (words.length > 5) {
          status = words.slice(0, 5).join(' ') + '...';
        } else {
          status = status.substring(0, 30) + '...';
        }
      }
    }
    
    // Remove the [STATUS: ...] text from what the user sees
    const cleanText = text.replace(/\s*\[STATUS:\s*[^\]]+\]\s*$/, '').trim();
    
    return { cleanText, status };
  };
  
  // Exit roleplay mode and return to analysis
  const handleExitRoleplay = () => {
    setRoleplayMode(false);
    setActivePanel('analysis');
  };
  
  // If no metadata, show an error or instruction
  if (!metadata) {
    return (
      <div className="text-center py-8 px-4">
        <p className="text-slate-500">No source metadata available for roleplay.</p>
      </div>
    );
  }
  
  return (
    <LocationBackground 
      date={metadata?.date || ''} 
      location={metadata?.placeOfPublication || ''} 
      opacity={0.95}
      className="flex flex-col h-full min-h-0 rounded-xl overflow-hidden resize-y"
    >
      {/* Main content container */}
      <div className="flex flex-col h-full z-10 relative">
        {/* Author information header */}
        <div className="bg-gradient-to-r from-amber-50/96 via-purple-100/50 to-indigo-100/40 p-3 rounded-t-xl border-b-3 border-amber-800/20 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Author portrait or emoji */}
              {hasPortrait && metadata?.author ? (
                <div className="w-12 h-12 rounded-full overflow-hidden shadow-lg">
                  <Image 
                    src={`/portraits/${metadata.author.toLowerCase().replace(/\s+/g, '')}.jpg`}
                    alt={metadata.author}
                    width={48}
                    height={48}
                    className="object-cover"
                    onError={() => setHasPortrait(false)}
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center text-2xl ring-2 ring-amber-200/50 shadow-sm">
                  {metadata?.authorEmoji || '👤'}
                </div>
              )}
              
              <div>
                <h3 className="font-serif text-xl text-amber-900 font-medium">{metadata.author}</h3>
                <div className="flex flex-wrap text-xs text-amber-800 gap-x-4 gap-y-1 mt-0.5">
                  {metadata.birthYear && metadata.deathYear && (
                    <span className="flex items-center">
                      <svg className="w-3 h-3 mr-1 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{metadata.birthYear}–{metadata.deathYear}</span>
                    </span>
                  )}
                  {metadata.birthplace && (
                    <span className="flex items-center">
                      <svg className="w-3 h-3 mr-1 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span>{metadata.birthplace}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Character notes toggle */}
            {characterSketch && (
              <button
                onClick={toggleCharacterSketch}
                className="bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs px-3 py-1.5 rounded-full transition-colors shadow-sm flex items-center"
              >
                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showSketch ? "M19 9l-7 7-7-7" : "M9 5l7 7-7 7"} />
                </svg>
                {showSketch ? "Hide Notes" : "Character Notes"}
              </button>
            )}
          </div>
          
          {/* Character sketch panel with clean styling */}
          {showSketch && characterSketch && (
            <div className="mt-3 p-3 bg-white rounded-lg text-sm border border-amber-100 shadow-sm animate-in fade-in slide-in-from-top-5 duration-300">
              <h4 className="text-lg text-slate-900 mb-2 pb-1 border-b border-amber-100/50">Historical Character Notes</h4>
              <div className="text-slate-700 prose prose-sm max-w-none">
                <ReactMarkdown>{characterSketch}</ReactMarkdown>
              </div>
              <p className="text-xs text-slate-500 mt-2 italic">
                These notes help inform the roleplay but may contain speculative elements.
              </p>
            </div>
          )}
        </div>
        
        {/* Messages container with improved chat bubbles and proper spacing */}
              <div className="flex-1 overflow-y-auto md:p-6 min-h-[600px] max-h-[900px]">
          {conversation.length === 0 ? (
            <div className="flex flex-col items-center justify-center space-y-4 p-4 text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-amber-100 flex items-center justify-center shadow-sm">
                <svg className="w-8 h-8 md:w-10 md:h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="max-w-sm">
                <h3 className="text-base md:text-lg font-medium text-amber-800 mb-2">Begin Your Conversation</h3>
                <p className="text-sm text-slate-700/80">
                  {isLoading 
                    ? "Establishing connection to the past..."
                    : `Ask ${metadata.author} about their work, ideas, or historical context. They'll respond as if speaking from ${metadata.date}.`}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 max-w-4xl mx-auto">
              {conversation.map((msg, index) => (
                <div 
                  key={index} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} ${msg.role === 'system' ? 'justify-center' : ''}`}
                >
                  {msg.role !== 'user' && (
                    <div className="mr-3 flex-shrink-0 self-end mb-1">
                      {renderAvatar(msg.role)}
                    </div>
                  )}
                  
                  <div 
                    className={`relative max-w-[90%] md:max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-indigo-50/100 text-slate-800 text-lg font-medium'
                        : msg.role === 'assistant'
                        ? 'bg-zinc-50/100 text-slate-800 border border-amber-200/40 text-lg'
                        : 'bg-slate-100 text-slate-600 text-sm italic max-w-md rounded-full px-4 py-2'
                    }`}
                  >
                  
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                    
                    {/* Status for author messages */}
                    {msg.role === 'assistant' && metadata.characterStatus && (
                      <div className="mt-1 pt-1 border-t border-amber-200/30 text-xs text-amber-600/70 italic">
                        {metadata.characterStatus}
                      </div>
                    )}
                  </div>
                  
                  {msg.role === 'user' && (
                    <div className="ml-3 flex-shrink-0 self-end mb-1">
                      {renderAvatar(msg.role)}
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        {/* Input area with improved contrasts and responsive sizing */}
        <div className="p-4  md:p-6 mb-4 border-t-2 mr-1 gap-2 border-1 border-slate-300 text-lg bg-slate-100 rounded-b-lg border-b-6 border-b-slate-200 rounded-b-xl">
          <form onSubmit={handleSendMessage} className="flex text-slate-900 space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Ask ${metadata.author} a question...`}
              className="flex-1 py-2.5 md:py-3 px-3 md:px-4 bg-slate-50/90  border-2 border-amber-600 rounded-l-lg focus:ring-3 focus:ring-amber-500 focus:border-amber-500 transition-colors placeholder-amber-500/70 text-slate-800 font-medium"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!message.trim() || isLoading}
              className={`px-4 md:px-5 py-2.5 md:py-3 rounded-r-lg font-medium transition-all ${
                !message.trim() || isLoading
                  ? 'bg-amber-300/50 text-amber-900 cursor-not-allowed'
                  : 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm hover:shadow'
              }`}
            >
              {isLoading ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <span>Send</span>
              )}
            </button>
          </form>
          
          {/* Important navigation footer with solid border */}
          <div className="flex justify-between items-center px-2 py-1 mt-1 text-sm">
            <button
              type="button"
              onClick={handleExitRoleplay}
              className="text-amber-700 hover:text-amber-900 flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Return to Analysis
            </button>
            
            <div className="flex flex-wrap gap-2">
              {/* Current location pill with improved visibility */}
              {metadata.placeOfPublication && (
                <div className="px-2.5 py-1 bg-white text-amber-700 rounded-full border border-amber-200 shadow-sm">
                  <div className="flex items-center">
                    <svg className="w-3 h-3 mr-1.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {metadata.placeOfPublication}
                  </div>
                </div>
              )}
              
              {/* Character mood status with elegant styling */}
              {metadata.characterStatus && (
                <div className="px-2.5 py-1 bg-white text-amber-700 rounded-full border border-amber-200 shadow-sm">
                  <div className="flex items-center">
                    <svg className="w-3 h-3 mr-1.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span className="italic">{metadata.characterStatus}</span>
                  </div>
                </div>
              )}
              
              {/* Year indicator for historical context */}
              {metadata.date && (
                <div className="px-2.5 py-1 bg-white text-amber-700 rounded-full border border-amber-200 shadow-sm">
                  <div className="flex items-center">
                    <svg className="w-3 h-3 mr-1.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {metadata.date}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </LocationBackground>
  );
}