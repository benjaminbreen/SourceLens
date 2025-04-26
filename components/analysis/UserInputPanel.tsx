// components/analysis/UserInputPanel.tsx
// Manages user controls for analysis tools and perspective input with dark mode support
// Provides consistent tool organization with theme-aware styling and smooth animations

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import ModelSelector from '@/components/ui/ModelSelector';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  ArrowRight, 
  Sparkles, 
  MessageSquare, 
  FileText, 
  BookOpen, 
  RefreshCw, 
  Zap, 
  Languages, 
  PenLine, 
  Lightbulb,
  NetworkIcon
} from 'lucide-react';

interface UserInputPanelProps {
  darkMode: boolean;
}

export default function UserInputPanel({ darkMode }: UserInputPanelProps) {
  const {
    activePanel,
    setActivePanel,
    perspective,
    setPerspective,
    initialAnalysis,
    isLoading,
    llmModel,
    sourceContent,
    metadata,
    setLoading,
    setDetailedAnalysis,
    setRawPrompt,
    setRawResponse,
    setCounterNarrative,
    setRoleplayMode,
    detailedAnalysisLoaded,
    setDetailedAnalysisLoaded,
  } = useAppStore();

  const [showPerspectiveInput, setShowPerspectiveInput] = useState(false);
  const [perspectiveInput, setPerspectiveInput] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isCardDropped, setIsCardDropped] = useState(false);
  const [cardText, setCardText] = useState('');
  const [activeCategory, setActiveCategory] = useState('standard');
  const inputRef = useRef<HTMLInputElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Focus input when perspective input is shown
  useEffect(() => {
    if (showPerspectiveInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showPerspectiveInput]);

  // Handler for perspective input
  const handlePerspectiveSubmit = () => {
    setPerspective(perspectiveInput);
    setShowPerspectiveInput(false);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const handlePerspectiveWithCardSubmit = () => {
    if (cardText) {
      const llmPerspective = `Here is a koan-like suggestion for creativity and grounded analysis: ${cardText}`;
      setPerspective(llmPerspective);
      setShowPerspectiveInput(false);
      setIsCardDropped(false);
      setPerspectiveInput('');
      setCardText('');
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
    }
  };

  // Detailed Analysis
  const handleDetailedAnalysis = async () => {
    if (isLoading || !initialAnalysis) return;

    if (detailedAnalysisLoaded) {
      setActivePanel('detailed-analysis');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/detailed-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: sourceContent,
          metadata: metadata,
          perspective: perspective,
          modelId: llmModel
        }),
      });

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const data = await response.json();
      setDetailedAnalysis(data.analysis);
      setRawPrompt(data.rawPrompt);
      setRawResponse(data.rawResponse);
      setDetailedAnalysisLoaded(true);
      setActivePanel('detailed-analysis');
    } catch (error) {
      console.error("Detailed analysis error:", error);
      alert(`Error generating detailed analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Counter Narrative
  const handleCounterNarrative = async () => {
    if (isLoading || !initialAnalysis) return;

    setLoading(true);
    try {
      const response = await fetch('/api/counter-narrative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: sourceContent,
          metadata: metadata,
          perspective: perspective,
          modelId: llmModel
        }),
      });

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const data = await response.json();
      if (data.narrative) {
        setCounterNarrative(data.narrative);
      }
      setRawPrompt(data.rawPrompt);
      setRawResponse(data.rawResponse);
      setActivePanel('counter');
    } catch (error) {
      console.error("Counter-narrative error:", error);
      alert(`Error generating counter-narrative: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Roleplay
  const handleBeginRoleplay = () => {
    if (isLoading || !initialAnalysis) return;
    useAppStore.getState().clearConversation();
    setRoleplayMode(true);
    setActivePanel('roleplay');
  };

  // Suggest References
  const handleSuggestReferences = () => {
    if (isLoading || !initialAnalysis) return;
    setActivePanel('references');
  };

  // Get color classes based on color, active state, disabled state, and dark mode
  const getToolColorClasses = (color: string, { isActive, isDisabled }: { isActive: boolean; isDisabled: boolean }) => {
    // Color mappings for both light and dark modes
    const colorMappings = {
      blue: {
        light: {
          bgActive: 'bg-blue-50 shadow-inner',
          bgHover: 'hover:bg-blue-600/4',
          borderActive: 'border-l-2 border-blue-500/40',
          borderHover: 'hover:border-blue-400/40',
          textActive: 'text-blue-800',
          iconActive: 'text-blue-600',
          hoverIcon: 'group-hover:text-blue-500',
          dot: 'bg-blue-400',
        },
        dark: {
          bgActive: 'bg-blue-900/30 shadow-inner',
          bgHover: 'hover:bg-blue-800/20',
          borderActive: 'border-l-2 border-blue-400/40',
          borderHover: 'hover:border-blue-400/40',
          textActive: 'text-blue-300',
          iconActive: 'text-blue-400',
          hoverIcon: 'group-hover:text-blue-400',
          dot: 'bg-blue-500',
        }
      },
      indigo: {
        light: {
          bgActive: 'bg-indigo-50 shadow-inner',
          bgHover: 'hover:bg-indigo-600/4',
          borderActive: 'border-l-2 border-indigo-500/40',
          borderHover: 'hover:border-indigo-400/40',
          textActive: 'text-indigo-800',
          iconActive: 'text-indigo-600',
          hoverIcon: 'group-hover:text-indigo-500',
          dot: 'bg-indigo-400',
        },
        dark: {
          bgActive: 'bg-indigo-900/30 shadow-inner',
          bgHover: 'hover:bg-indigo-800/20',
          borderActive: 'border-l-2 border-indigo-400/40',
          borderHover: 'hover:border-indigo-400/40',
          textActive: 'text-indigo-300',
          iconActive: 'text-indigo-400',
          hoverIcon: 'group-hover:text-indigo-400',
          dot: 'bg-indigo-500',
        }
      },
      emerald: {
        light: {
          bgActive: 'bg-emerald-50 shadow-inner',
          bgHover: 'hover:bg-emerald-700/3',
          borderActive: 'border-l-2 border-emerald-500/40',
          borderHover: 'hover:border-emerald-400/40',
          textActive: 'text-emerald-800',
          iconActive: 'text-emerald-600',
          hoverIcon: 'group-hover:text-emerald-500',
          dot: 'bg-emerald-400',
        },
        dark: {
          bgActive: 'bg-emerald-900/20 shadow-inner',
          bgHover: 'hover:bg-emerald-800/20',
          borderActive: 'border-l-2 border-emerald-400/40',
          borderHover: 'hover:border-emerald-400/40',
          textActive: 'text-emerald-300',
          iconActive: 'text-emerald-400',
          hoverIcon: 'group-hover:text-emerald-400',
          dot: 'bg-emerald-500',
        }
      },
      amber: {
        light: {
          bgActive: 'bg-amber-50 shadow-inner',
          bgHover: 'hover:bg-amber-600/4',
          borderActive: 'border-l-2 border-amber-500/40',
          borderHover: 'hover:border-amber-400/40',
          textActive: 'text-amber-800',
          iconActive: 'text-amber-600',
          hoverIcon: 'group-hover:text-amber-500',
          dot: 'bg-amber-400',
        },
        dark: {
          bgActive: 'bg-amber-900/20 shadow-inner',
          bgHover: 'hover:bg-amber-900/30',
          borderActive: 'border-l-2 border-amber-500/40',
          borderHover: 'hover:border-amber-500/40',
          textActive: 'text-amber-300',
          iconActive: 'text-amber-400',
          hoverIcon: 'group-hover:text-amber-300',
          dot: 'bg-amber-500',
        }
      },
      cyan: {
        light: {
          bgActive: 'bg-cyan-50 shadow-inner',
          bgHover: 'hover:bg-cyan-400/6',
          borderActive: 'border-l-2 border-cyan-500/40',
          borderHover: 'hover:border-cyan-400/40',
          textActive: 'text-cyan-800',
          iconActive: 'text-cyan-600',
          hoverIcon: 'group-hover:text-cyan-500',
          dot: 'bg-cyan-400',
        },
        dark: {
          bgActive: 'bg-cyan-900/20 shadow-inner',
          bgHover: 'hover:bg-cyan-900/30',
          borderActive: 'border-l-2 border-cyan-500/40',
          borderHover: 'hover:border-cyan-500/40',
          textActive: 'text-cyan-300',
          iconActive: 'text-cyan-400',
          hoverIcon: 'group-hover:text-cyan-300',
          dot: 'bg-cyan-500',
        }
      },
      purple: {
        light: {
          bgActive: 'bg-purple-50 shadow-inner',
          bgHover: 'hover:bg-purple-700/4',
          borderActive: 'border-l-2 border-purple-500/40',
          borderHover: 'hover:border-purple-400/40',
          textActive: 'text-purple-800',
          iconActive: 'text-purple-600',
          hoverIcon: 'group-hover:text-purple-500',
          dot: 'bg-purple-400',
        },
        dark: {
          bgActive: 'bg-purple-900/20 shadow-inner',
          bgHover: 'hover:bg-purple-900/30',
          borderActive: 'border-l-2 border-purple-500/40',
          borderHover: 'hover:border-purple-500/40',
          textActive: 'text-purple-300',
          iconActive: 'text-purple-400',
          hoverIcon: 'group-hover:text-purple-300',
          dot: 'bg-purple-500',
        }
      },
      violet: {
        light: {
          bgActive: 'bg-violet-50 shadow-inner',
          bgHover: 'hover:bg-violet-700/4',
          borderActive: 'border-l-2 border-violet-500/40',
          borderHover: 'hover:border-violet-400/40',
          textActive: 'text-violet-800',
          iconActive: 'text-violet-600',
          hoverIcon: 'group-hover:text-violet-500',
          dot: 'bg-violet-400',
        },
        dark: {
          bgActive: 'bg-violet-900/20 shadow-inner',
          bgHover: 'hover:bg-violet-900/30',
          borderActive: 'border-l-2 border-violet-500/40',
          borderHover: 'hover:border-violet-500/40',
          textActive: 'text-violet-300',
          iconActive: 'text-violet-400',
          hoverIcon: 'group-hover:text-violet-300',
          dot: 'bg-violet-500',
        }
      },
      sky: {
        light: {
          bgActive: 'bg-sky-50 shadow-inner',
          bgHover: 'hover:bg-sky-600/4',
          borderActive: 'border-l-2 border-sky-500/40',
          borderHover: 'hover:border-sky-400/40',
          textActive: 'text-sky-800',
          iconActive: 'text-sky-600',
          hoverIcon: 'group-hover:text-sky-500',
          dot: 'bg-sky-400',
        },
        dark: {
          bgActive: 'bg-sky-900/20 shadow-inner',
          bgHover: 'hover:bg-sky-900/30',
          borderActive: 'border-l-2 border-sky-500/40',
          borderHover: 'hover:border-sky-500/40',
          textActive: 'text-sky-300',
          iconActive: 'text-sky-400',
          hoverIcon: 'group-hover:text-sky-300',
          dot: 'bg-sky-500',
        }
      },
    };

    // Default fallback styles for both modes
    const fallback = {
      light: {
        bgActive: 'bg-slate-50',
        bgHover: 'hover:bg-slate-50/20',
        borderActive: 'border-l-2 border-slate-400',
        borderHover: 'hover:border-slate-200',
        textActive: 'text-slate-800',
        iconActive: 'text-slate-600',
        hoverIcon: 'group-hover:text-slate-500',
        dot: 'bg-slate-400',
      },
      dark: {
        bgActive: 'bg-slate-800/40',
        bgHover: 'hover:bg-slate-700/30',
        borderActive: 'border-l-2 border-slate-600',
        borderHover: 'hover:border-slate-600',
        textActive: 'text-slate-300',
        iconActive: 'text-slate-400',
        hoverIcon: 'group-hover:text-slate-300',
        dot: 'bg-slate-500',
      }
    };

    // Select color mapping based on provided color or use fallback
    const selectedColorMap = colorMappings[color as keyof typeof colorMappings] || fallback;
    
    // Choose between light or dark mode styles
    const selectedMode = darkMode ? selectedColorMap.dark : selectedColorMap.light;

    return {
      bg: isActive ? selectedMode.bgActive : darkMode ? 'bg-slate-800/20' : 'bg-white',
      hoverBg: isDisabled ? '' : selectedMode.bgHover,
      border: isActive ? selectedMode.borderActive : darkMode 
        ? 'border border-slate-700/50' 
        : 'border border-slate-200',
      hoverBorder: isDisabled ? '' : selectedMode.borderHover,
      text: isActive 
        ? selectedMode.textActive 
        : isDisabled 
          ? darkMode ? 'text-slate-600' : 'text-slate-400' 
          : darkMode ? 'text-slate-300' : 'text-slate-700',
      icon: isActive 
        ? selectedMode.iconActive 
        : isDisabled 
          ? darkMode ? 'text-slate-600' : 'text-slate-400' 
          : darkMode ? 'text-slate-400' : 'text-slate-500',
      hoverIcon: isDisabled ? '' : selectedMode.hoverIcon,
      dot: selectedMode.dot,
    };
  };

  // Define tool categories for organized display
  const toolCategories = {
    standard: [
      { 
        id: 'analysis', 
        label: 'Basic Analysis', 
        icon: <FileText size={18} />, 
        color: 'indigo', 
        onClick: () => setActivePanel('analysis') 
      },
      { 
        id: 'detailed-analysis', 
        label: detailedAnalysisLoaded && activePanel !== 'detailed-analysis' 
          ? 'Show Detailed Analysis' 
          : 'Detailed Analysis', 
        icon: <Sparkles size={18} />, 
        color: 'blue', 
        onClick: handleDetailedAnalysis 
      },
      { 
        id: 'extract-info', 
        label: 'Extract Information', 
        icon: <Zap size={18} />, 
        color: 'emerald', 
        onClick: () => setActivePanel('extract-info') 
      },
      { 
        id: 'references', 
        label: 'Suggest References', 
        icon: <BookOpen size={18} />, 
        color: 'amber', 
        onClick: handleSuggestReferences 
      },
      { 
        id: 'counter', 
        label: 'Counter-Narrative', 
        icon: <RefreshCw size={18} />, 
        color: 'purple', 
        onClick: handleCounterNarrative 
      },
      { 
        id: 'roleplay', 
        label: 'Simulation Mode', 
        icon: <MessageSquare size={18} />, 
        color: 'sky', 
        onClick: handleBeginRoleplay 
      },
      { 
        id: 'translate', 
        label: 'Translate', 
        icon: <Languages size={18} />, 
        color: 'cyan', 
        onClick: () => setActivePanel('translate') 
      }
    ],
    experimental: [
      { 
        id: 'connections', 
        label: 'Connection Graph', 
        icon: <NetworkIcon size={18} />, 
        color: 'violet', 
        onClick: () => setActivePanel('connections') 
      }
    ]
  };

  // Animation variants for smoother transitions
  const containerAnimation = {
    hidden: { opacity: 0, y: 5 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.3,
        staggerChildren: 0.05 
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* Analysis Perspective Section */}
      <motion.div 
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-1.5">
          <h3 className={`font-medium text-base ml-1 ${darkMode ? 'text-indigo-300' : 'text-indigo-900'} flex items-center gap-2 transition-colors duration-200`}>
            <Lightbulb size={16} className={`${darkMode ? 'text-indigo-400' : 'text-indigo-600'} transition-colors duration-200`} strokeWidth={2.5} />
            <span>Analysis Perspective</span>
          </h3>
          {perspective && !showPerspectiveInput && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => setPerspective('')}
              className={`text-xs ${darkMode ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'} flex items-center gap-1 transition-colors duration-200`}
            >
              <span>Reset</span>
            </motion.button>
          )}
        </div>
        
        {showPerspectiveInput ? (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            {isCardDropped ? (
              <div className={`px-4 py-3 ${darkMode ? 'bg-amber-900/20 border-amber-700/50' : 'bg-amber-50 border-amber-200'} border rounded-md flex items-start justify-between transition-colors duration-200`}>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${darkMode ? 'text-amber-300' : 'text-amber-800'} mb-1 transition-colors duration-200`}>
                    Creative strategy card enabled
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-amber-400/90' : 'text-amber-700'} transition-colors duration-200`}>{cardText}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsCardDropped(false);
                    setCardText('');
                  }}
                  className={`${darkMode ? 'text-amber-400 hover:text-amber-300' : 'text-amber-600 hover:text-amber-800'} transition-colors duration-200`}
                  aria-label="Remove card"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  className={`w-full p-3 rounded-lg transition-all duration-200 
                    ${isDragOver 
                      ? darkMode 
                        ? 'border-amber-600 bg-amber-900/20' 
                        : 'border-amber-400 bg-amber-50/30'
                      : darkMode 
                        ? 'border-slate-600 bg-slate-800/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white' 
                        : 'border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20'
                    } border`}
                  placeholder={darkMode ? "Enter perspective..." : "Enter an analysis perspective..."}
                  value={perspectiveInput}
                  onChange={(e) => setPerspectiveInput(e.target.value)}
                  onDrop={(e) => {
                    e.preventDefault();
                    const droppedText = e.dataTransfer.getData('text/plain');
                    if (droppedText) {
                      setIsCardDropped(true);
                      setCardText(droppedText);
                      setPerspectiveInput('');
                    }
                    setIsDragOver(false);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                  }}
                />
                {isDragOver && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className={`text-sm px-2 py-1 rounded shadow-sm ${darkMode ? 'bg-amber-900/60 text-amber-300' : 'bg-amber-50 text-amber-600'}`}>
                      Drop card here
                    </span>
                  </div>
                )}
              </div>
            )}
            <div className="flex space-x-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={isCardDropped ? handlePerspectiveWithCardSubmit : handlePerspectiveSubmit}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-1
                  ${!isCardDropped && !perspectiveInput.trim() 
                    ? 'opacity-50 cursor-not-allowed ' + (darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-300 text-slate-500')
                    : darkMode 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                disabled={!isCardDropped && !perspectiveInput.trim()}
              >
                <span>Apply</span>
                <ArrowRight size={16} />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setShowPerspectiveInput(false);
                  setIsDragOver(false);
                  setIsCardDropped(false);
                  setCardText('');
                }}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all
                  ${darkMode 
                    ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
            onClick={() => setShowPerspectiveInput(true)}
            className={`p-2 border rounded-lg flex justify-between items-center cursor-pointer transition-all duration-200 
              ${isDragOver 
                ? darkMode ? 'border-amber-600 bg-amber-900/30' : 'border-amber-400 bg-amber-50/30'
                : perspective 
                  ? darkMode ? 'border-indigo-700 bg-indigo-900/30 hover:border-indigo-600' : 'border-indigo-200 bg-indigo-50/40 hover:border-indigo-300'
                  : darkMode ? 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              } ${isAnimating ? 'animate-bounce-once' : ''}`}
            onDrop={(e) => {
              e.preventDefault();
              const droppedText = e.dataTransfer.getData('text/plain');
              if (droppedText) {
                setIsCardDropped(true);
                setCardText(droppedText);
                setShowPerspectiveInput(true);
              }
              setIsDragOver(false);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragOver(false);
            }}
          >
            <span className={`text-sm ${perspective 
              ? darkMode ? 'text-indigo-300 font-medium' : 'text-indigo-800 font-medium'
              : darkMode ? 'text-slate-400' : 'text-slate-500'
            } transition-colors duration-200`}>
              {perspective && !perspective.includes('koan-like suggestion')
                ? perspective
                : perspective && perspective.includes('koan-like suggestion')
                ? 'Creative strategy card enabled'
                : 'Default (no specific perspective)'}
            </span>
            <PenLine size={16} className={`${perspective 
              ? darkMode ? 'text-indigo-400' : 'text-indigo-600'
              : darkMode ? 'text-slate-500' : 'text-slate-400'
            } transition-colors duration-200`} />
          </motion.div>
        )}
      </motion.div>

      {/* Analysis Tools Navigation */}
      <div className="space-y-2 -mt-1">
        <div className="flex justify-between items-center">
          <h3 className={`font-medium text-base ml-1 ${darkMode ? 'text-indigo-300' : 'text-indigo-900'} transition-colors duration-200`}>
            Lenses
          </h3>
          
          {/* Category Tabs */}
          <div className={`flex rounded-lg p-0.5 ${darkMode ? 'bg-slate-700/70' : 'bg-slate-200/70'} transition-colors duration-200`}>
            {['standard', 'experimental'].map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-3 py-1 text-[11px] font-medium rounded-lg transition-all ${
                  activeCategory === category
                    ? darkMode 
                      ? 'bg-slate-800 text-indigo-300' 
                      : 'bg-white text-indigo-800'
                    : darkMode
                    ? 'bg-slate-800/60 text-slate-400 hover:text-slate-300 hover:bg-slate-700' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {/* Tools Grid */}
        <div className="grid grid-cols-1 gap-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              variants={containerAnimation}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.1 }}
              className="grid grid-cols-1 gap-1.5"
            >
              {toolCategories[activeCategory as keyof typeof toolCategories].map((tool) => {
                const isActive = activePanel === tool.id;
                const isDisabled = (isLoading || !initialAnalysis) && tool.id !== 'analysis';
                const classes = getToolColorClasses(tool.color, { isActive, isDisabled });
                
                return (
                  <motion.button
                    key={tool.id}
                    onClick={tool.onClick}
                    disabled={isDisabled}
                    whileHover={!isDisabled ? { scale: 1, y: 0 } : {}}
                    whileTap={!isDisabled ? { scale: 0.96 } : {}}
                    className={`
                      flex items-center p-3 rounded-lg transition-all duration-100 group
                      ${classes.bg} ${classes.hoverBg} ${classes.border} ${classes.hoverBorder} pl-3
                    `}
                  >
                    <span className={`mr-3 flex-shrink-0 ${classes.icon} ${classes.hoverIcon} transition-colors duration-200`}>
                      {tool.icon}
                    </span>
                    <span className={`text-sm font-medium ${classes.text} transition-colors duration-200`}>
                      {tool.label}
                    </span>
                    {isActive && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`ml-auto h-2 w-2 rounded-full ${classes.dot}`}
                      />
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Model Selector Component - Pass dark mode prop */}
      <div className={`pt-2 ${darkMode ? 'border-t border-slate-700/50' : 'border-t border-slate-200/70'}`}>
        <ModelSelector darkMode={darkMode} />
      </div>

      {/* Custom bounce animation */}
      <style jsx global>{`
        @keyframes bounce-once {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-bounce-once {
          animation: bounce-once 0.5s ease-in-out;
        }
        .shadow-inner {
          box-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
        }
        .inset-shadow-sm {
          box-shadow: inset 0 1px 2px 0 rgb(0 0 0 / 0.1);
        }
      `}</style>
    </div>
  );
}

