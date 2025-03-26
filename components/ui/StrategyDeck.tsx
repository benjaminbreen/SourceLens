// components/ui/StrategyDeck.tsx
// A minimalist card deck component that reveals creative research prompts
// Provides a deck of strategy cards that can be drawn, displayed with beautiful animations,
// and dragged to input fields with elegant transitions and cleanup effects

'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface StrategyDeckProps {
  className?: string;
}

export default function StrategyDeck({ className = '' }: StrategyDeckProps) {
  const [isCardDrawn, setIsCardDrawn] = useState(false);
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [currentCard, setCurrentCard] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentSymbol, setCurrentSymbol] = useState('🜇');
  const [isClosing, setIsClosing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showInDeck, setShowInDeck] = useState(false);
  const [isInvalidDrop, setIsInvalidDrop] = useState(false);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Array of strategy cards
  const strategies = [
    "Make a minor character essential",
    "Look to the footnotes",
    "Collapse a year into a sentence",
    "Consider what's deliberately omitted",
    "Imagine if your reader disagreed with you",
    "Locate your hidden assumptions",
    "Rewrite the beginning as an ending",
    "Every concept has a biography—what if you wrote it?",
    "Focus on the second-most important thing",
    "Translate all jargon into ordinary language",
    "Reveal your scaffolding",
    "What is the inverse of this source? Does it exist?",
    "Break chronology on purpose, then put it back together again",
    "Briefly embrace oversimplification",
    "Start over. Read from the bottom up.",
    "Argue against your favorite author",
    "Pause on a minor detail. What do you hear?",
    "Uncover a hidden chronology",
    "Write the footnote first",
    "Consider the perspective least likely to appear here",
    "Turn your conclusion into a question, then try to answer it",
    "Briefly imagine you distrust ALL your sources",
    "What if your hero was a villain?",
    "What would your source most want to tell you?",
    "Identify what's too neat",
    "What would be different if cause and effect were inverted here?",
    "Dwell on what resists summary",
    "Temporarily ignore context",
    "Make the familiar strange again",
    "How would a Martian perceive this?",
    "Imagine your source is lying. Why?",
    "Ask a question you've been avoiding",
    "What happens if you silence your central figure?",
    "Take something certain and make it uncertain",
    "Consider that your evidence may be overheard gossip",
    "What might your source be embarrassed about?",
    "Briefly ignore your goals—what else appears?",
    "What might your harshest critic be right about?",
    "Take away your best piece of evidence—now what?"
  ];
  
  // Array of alchemical symbols
  const alchemicalSymbols = [
    '🜁', '🜂', '🜃', '🜄', '🜅', '🜆', '🜇', '🜈', '🜉', '🜊', 
    '🜋', '🜌', '🜍', '🜎', '🜏', '🜐', '🜑', '🜒', '🜓', '🜔', 
    '🜕', '🜖', '🜗', '🜘', '🜙', '🜚', '🜛', '🜜', '🜝', '🜞', 
    '🜟', '🜠', '🜡', '🜢', '🜣', '🜤', '🜥', '🜦', '🜧', '🜨', 
    '🜩', '🜪', '🜫', '🜬', '🜭', '🜮', '🜯', '🜰', '🜱', '🜲', 
    '🜳', '🜴', '🜵', '🜶', '🜷', '🜸', '🜹', '🜺', '🜻', '🜼', 
    '🜽', '🜾', '🜿'
  ];

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      document.body.classList.remove('modal-open');
      
      // Remove global event listeners
      document.removeEventListener('dragend', handleGlobalDragEnd);
      document.removeEventListener('drop', handleGlobalDrop);
      document.removeEventListener('dragover', handleGlobalDragOver);
    };
  }, []);

  // When modal opens, prevent scrolling
  useEffect(() => {
    if (isCardOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }, [isCardOpen]);

  // Set up global event listeners for drag and drop
  useEffect(() => {
    document.addEventListener('dragend', handleGlobalDragEnd);
    document.addEventListener('drop', handleGlobalDrop);
    document.addEventListener('dragover', handleGlobalDragOver);
    
    return () => {
      document.removeEventListener('dragend', handleGlobalDragEnd);
      document.removeEventListener('drop', handleGlobalDrop);
      document.removeEventListener('dragover', handleGlobalDragOver);
    };
  }, [isDragging]);

  // Check if element is a valid drop target
  const isValidDropTarget = (element: Element | null): boolean => {
    if (!element) return false;
    
    const tagName = element.tagName.toLowerCase();
    return tagName === 'input' || 
           tagName === 'textarea' || 
           element.hasAttribute('contenteditable') ||
           element.classList.contains('droppable');
  };

  // Handle global drag end
  const handleGlobalDragEnd = () => {
    setIsDragging(false);
  };
  
  // Handle global drop
  const handleGlobalDrop = (e: Event) => {
    if (isDragging) {
      const dropEvent = e as DragEvent;
      const target = dropEvent.target as Element;
      
      // Check if drop target is valid
      let isValid = isValidDropTarget(target);
      
      // Also check parent elements
      if (!isValid && target) {
        let parent = target.parentElement;
        let depth = 0; // Prevent infinite loops
        while (parent && !isValid && depth < 5) {
          isValid = isValidDropTarget(parent);
          parent = parent.parentElement;
          depth++;
        }
      }
      
      // If not dropped on a valid target, trigger disappearing animation
      if (!isValid) {
        setIsInvalidDrop(true);
        
        // After animation completes, remove the card
        setTimeout(() => {
          setIsCardDrawn(false);
          setIsInvalidDrop(false);
        }, 600); // Match the animation duration
      }
      
      setIsDragging(false);
    }
  };
  
  // Handle global drag over
  const handleGlobalDragOver = (e: Event) => {
    e.preventDefault(); // Allow dropping
  };

  // Draw card flow - now shows modal first
  const drawCard = () => {
    if (isAnimating) return;
    
    // Draw a random card
    const randomIndex = Math.floor(Math.random() * strategies.length);
    setCurrentCard(strategies[randomIndex]);
    
    // Choose a random alchemical symbol
    const randomSymbolIndex = Math.floor(Math.random() * alchemicalSymbols.length);
    setCurrentSymbol(alchemicalSymbols[randomSymbolIndex]);
    
    setIsAnimating(true);
    
    // Open modal directly instead of showing card
    setIsCardOpen(true);
    
    // After animation completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  // Close card modal
  const closeCard = () => {
    // Add closing animation
    setIsClosing(true);
    
    // Wait for animation to finish before closing modal
    setTimeout(() => {
      setIsCardOpen(false);
      setIsClosing(false);
      
      // Show the card in the deck AFTER modal closes
      setIsCardDrawn(true);
      
      // Slight delay before showing card in deck for better sequential animation
      setTimeout(() => {
        setShowInDeck(true);
      }, 100);
    }, 300);
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent) => {
    // Set dragged content
    e.dataTransfer.setData('text/plain', currentCard);
    e.dataTransfer.effectAllowed = 'copy';
    setIsDragging(true);
    
    // Create and use a drag image
    if (cardRef.current) {
      try {
        // For browsers that support setDragImage
        const rect = cardRef.current.getBoundingClientRect();
        e.dataTransfer.setDragImage(cardRef.current, rect.width / 2, rect.height / 2);
      } catch (err) {
        // Fallback for browsers that don't support setDragImage
        console.log("Could not set drag image, using default");
      }
    }
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      {/* Card deck */}
      <button 
        onClick={drawCard}
        className="relative transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none"
        aria-label="Draw a strategy card"
        disabled={isAnimating}
      >
        <div className="relative group">
          <span className="text-sm font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
            Need inspiration?
          </span>
          
          {/* Card deck hover effect */}
          <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
          
          {/* Draw card sparkle animation */}
          {isAnimating && !isCardDrawn && (
            <div className="absolute top-0 right-0 -mr-1 -mt-1 w-3 h-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </div>
          )}
        </div>
      </button>

      {/* Drawn card - now draggable */}
      {isCardDrawn && (
        <div 
          ref={cardRef}
          className={`ml-5 h-12 w-20 transition-all duration-500 transform ${
            showInDeck 
              ? 'opacity-100 scale-100 -translate-y-2 rotate-0 hover:-translate-y-3' 
              : 'opacity-0 scale-95 -translate-y-6 rotate-6'
          } ${
            isDragging 
              ? 'opacity-80 rotate-6 scale-110' 
              : ''
          } ${
            isInvalidDrop
              ? 'opacity-0 scale-0 rotate-180 translate-y-10'
              : ''
          } animate-in fade-in slide-in-from-top-4 duration-700 cursor-move`}
          onClick={() => setIsCardOpen(true)}
          draggable
          onDragStart={handleDragStart}
          style={{
            transformOrigin: 'left center',
            filter: 'drop-shadow(0 10px 8px rgba(0, 0, 0, 0.15)) drop-shadow(0 4px 3px rgba(0, 0, 0, 0.25))',
          }}
        >
          <div className="relative h-full w-full">
            {/* Card image */}
            <Image 
              src="/card.png" 
              alt="Strategy card" 
              width={144} 
              height={80}
              className="object-cover select-none pointer-events-none"
              draggable={false}
            />
            <span className="text-[10px] text-slate-200/80 italic select-none pointer-events-none text-center">
              {isDragging ? 'Drop in a field...' : '...Drag or click'}
            </span>
            {/* Card text overlay */}
            <div className="absolute inset-0 flex items-center justify-center px-3 py-2 select-none pointer-events-none">
              <span className="text-[4px] text-slate-700 font-sans leading-tight line-clamp-2">
                {currentCard}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Modal view */}
      {isCardOpen && (
        <div 
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
            isClosing ? 'animate-out fade-out duration-300' : 'animate-in fade-in duration-300'
          }`}
          onClick={closeCard}
        >
          {/* Backdrop with blur */}
          <div className={`absolute inset-0 bg-black/80 backdrop-blur-sm z-10 ${
            isClosing ? 'animate-out fade-out duration-300' : 'animate-in fade-in duration-300'
          }`}></div>
          
          {/* Card Modal */}
          <div 
            ref={modalRef}
            className={`bg-amber-50 rounded-xl max-w-xl w-full p-16 py-10 shadow-2xl z-10 relative ${
              isClosing 
                ? 'animate-out zoom-out-95 slide-out-to-bottom-4 duration-300' 
                : 'animate-in zoom-in-95 slide-in-from-bottom-4 duration-500'
            }`}
            onClick={(e) => e.stopPropagation()}
            style={{ 
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            <div className="text-6xl mt-0 px-2 font-serif text-amber-950/60 mb-1 flex justify-center animate-in fade-in-50 slide-in-from-top-8 duration-500 delay-150">
              {currentSymbol}
            </div>
            <div className="text-4xl px-8 font-sans font-medium py-8 text-slate-800/90 leading-tight tracking-tight text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              {currentCard}
            </div>
            <div className="mt-6 text-xs px-5 py-1 text-slate-500/50 italic text-center animate-in fade-in duration-1000 delay-500">
              - Click anywhere to close - 
            </div>
          </div>
        </div>
      )}
      
      {/* Global CSS for custom animations */}
      <style jsx global>{`
        .modal-open {
          overflow: hidden;
        }
        
        @keyframes disappear {
          0% { transform: translateY(0) rotate(0) scale(1); opacity: 1; }
          100% { transform: translateY(20px) rotate(90deg) scale(0); opacity: 0; }
        }
        
        .card-disappear {
          animation: disappear 0.6s ease-in forwards;
        }
      `}</style>
    </div>
  );
}