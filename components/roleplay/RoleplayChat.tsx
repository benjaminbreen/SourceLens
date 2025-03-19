// components/roleplay/RoleplayChat.tsx
// Author conversation component that simulates dialogue with the historical source's author
// Uses a generated character sketch to ground the roleplay in historical accuracy

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import Image from 'next/image';
import LLMTransparency from '../ui/LLMTransparency';
import ReactMarkdown from 'react-markdown';

export default function RoleplayChat() {
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
  
  // Scroll to bottom of chat whenever conversation updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);
  
  // Initialize roleplay with character sketch when first activated
  useEffect(() => {
    if (roleplayMode && !isInitialized && sourceContent && metadata) {
      initializeRoleplay();
    }
  }, [roleplayMode, isInitialized, sourceContent, metadata]);
  
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
        model: 'gpt-4o', // Always use GPT-4o for character sketch
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
    
    // commented out because message was repeating
  //  addMessage({
   //   role: 'system',
   //   content: `You are now in conversation with ${metadata.author} (${metadata.date}). Ask them about their work, ideas, or historical context.`
 //   });
    
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
  <div className="flex flex-col h-full">
    {/* Author information header */}
    <div className="bg-gradient-to-r from-purple-100 to-amber-50 p-4 rounded-lg shadow-xl border-b-2 border-shadow-xl border-slate-600/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div>
            <h3 className="font-medium text-slate-800">{metadata.author}</h3> 
            <div className="flex flex-col">
              <p className="text-xs text-slate-500/90">
                <b>Life dates: </b> {metadata.birthYear && metadata.deathYear ? `${metadata.birthYear}–${metadata.deathYear}` : metadata.date}
              </p>
              {metadata.birthplace && (
                <p className="text-xs text-slate-500/90"><b>Birthplace:</b> {metadata.birthplace}</p>
              )}
            </div>
          </div>
        </div>

        {/* Character sketch toggle button */}
        {characterSketch && (
          <button
            onClick={toggleCharacterSketch}
            className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {showSketch ? "Hide Character Notes" : "Show Character Notes"}
          </button>
        )}
      </div>
      
      {/* Character sketch panel (hidden by default) */}
      {showSketch && characterSketch && (
        <div className="mt-3 p-3 bg-white/80 rounded-md text-sm border border-slate-200">
          <h4 className="font-medium text-slate-700 mb-1">Historical Character Notes</h4>
          <div className="text-slate-600">
            {characterSketch.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-2">{paragraph}</p>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-2 italic">
            These notes help inform the roleplay but may contain speculative elements.
          </p>
        </div>
      )}
    </div>
    
    {/* Chat message container with scrolling */}
    <div className="flex-1 overflow-y-auto p-4 bg-white max-h-[600px]">
        {conversation.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-lg text-center text-slate-500">
            <svg className="w-16 h-16 mb-4 text-amber-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>
              {isLoading 
                ? "Initializing conversation with the author..."
                : "You can now converse with the author. Try asking about their work, ideas, or historical context."}
            </p>
          </div>
        ) : (
         <div className="space-y-4">
           {conversation.map((msg, index) => (
             <div 
               key={index} 
               className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} ${msg.role === 'system' ? 'justify-center' : ''}`}
             >
               {msg.role !== 'user' && (
                 <div className="mr-2 mt-1">
                   {renderAvatar(msg.role)}
                 </div>
               )}
               
               <div 
                 className={`max-w-3/4 rounded-lg p-3 ${
                   msg.role === 'user' 
                     ? 'bg-indigo-50 text-indigo-900'
                     : msg.role === 'assistant'
                     ? 'bg-amber-50 text-amber-900'
                     : 'bg-slate-100 text-slate-700 text-sm italic max-w-md'
                 }`}
               >
                 <ReactMarkdown>{msg.content}</ReactMarkdown>
               </div>
               
               {msg.role === 'user' && (
                 <div className="ml-2 mt-1">
                   {renderAvatar(msg.role)}
                 </div>
               )}
             </div>
           ))}
           <div ref={messagesEndRef} />
         </div>
        )}
      </div>
      
      {/* Input area for message typing */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-lg">
        <form onSubmit={handleSendMessage} className="flex">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Ask ${metadata.author} a question...`}
            className="flex-1 py-2 px-4 border border-slate-300 rounded-l-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            className={`px-4 py-2 ml-1 rounded-r-md font-medium ${
              !message.trim() || isLoading
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-amber-600 hover:bg-amber-700 text-white'
            }`}
          >
            Send
          </button>
        </form>
        
        {/* End roleplay button */}
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={handleExitRoleplay}
            className="text-sm text-slate-500 hover:text-slate-700 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Return to Analysis
          </button>
          
          
        </div>
      </div>
    </div>
  );
}