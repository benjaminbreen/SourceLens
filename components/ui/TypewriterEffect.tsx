// components/ui/TypewriterEffect.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TypewriterEffectProps {
  text: string;
  isVisible: boolean;
  speed?: number;
  className?: string;
  isDarkMode?: boolean;
}

const TypewriterEffect = ({ 
  text, 
  isVisible, 
  speed = 40,
  className = "",
  isDarkMode = false
}: TypewriterEffectProps) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  
  // Use a fallback text if none is provided
  const actualText = text || "No specific insights available yet.";
  
  // Reset when text changes
  useEffect(() => {
    setDisplayText('');
    setCurrentIndex(0);
    setIsFadingOut(false);
  }, [text]);
  
  // Handle typing effect
  useEffect(() => {
    if (!isVisible) return;
    
    // Typing effect
    if (currentIndex < actualText.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + actualText[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      
      return () => clearTimeout(timer);
    } 
    // Pause at the end before fading
    else if (!isFadingOut) {
      const timer = setTimeout(() => {
        setIsFadingOut(true);
      }, 8000);
      
      return () => clearTimeout(timer);
    }
  }, [currentIndex, isVisible, actualText, isFadingOut, speed]);
  
  if (!isVisible) return null;
  
  return (
    <motion.div 
      className={`font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} text-sm italic leading-relaxed min-h-[3rem] ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: isFadingOut ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ 
        opacity: { duration: isFadingOut ? 1.5 : 0.5 }
      }}
    >
      {displayText}
      <span className="inline-block w-0.5 h-4 bg-slate-100 ml-0.5 animate-blink"></span>
    </motion.div>
  );
};

export default TypewriterEffect;