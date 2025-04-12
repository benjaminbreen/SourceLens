// components/analysis/UserInputPanel.tsx
// Manages user controls for analysis tools and perspective input with a 2025-inspired design
// Also shows the "About Selected Model" section with provider logos

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import ModelSelector from '@/components/ui/ModelSelector';
import { AnimatePresence, motion } from 'framer-motion';
import { models } from '@/lib/models';
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
  Lightbulb
} from 'lucide-react';

export default function UserInputPanel() {
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

  const getToolColorClasses = (color: string, { isActive, isDisabled }: { isActive: boolean; isDisabled: boolean }) => {
  // These are our color mappings for each supported color
  const colorMappings = {
    blue: {
      bgActive: 'bg-blue-50',
      bgHover: 'hover:bg-blue-50/20',
      borderActive: 'border-l-3 border-blue-400',
      borderHover: 'hover:border-blue-200',
      textActive: 'text-blue-800',
      iconActive: 'text-blue-600',
      hoverIcon: 'group-hover:text-blue-500',
      dot: 'bg-blue-400',
    },
    indigo: {
      bgActive: 'bg-indigo-50',
      bgHover: 'hover:bg-indigo-50/20',
      borderActive: 'border-l-3 border-indigo-400',
      borderHover: 'hover:border-indigo-200',
      textActive: 'text-indigo-800',
      iconActive: 'text-indigo-600',
      hoverIcon: 'group-hover:text-indigo-500',
      dot: 'bg-indigo-400',
    },
    emerald: {
      bgActive: 'bg-emerald-50',
      bgHover: 'hover:bg-emerald-50/20',
      borderActive: 'border-l-3 border-emerald-400',
      borderHover: 'hover:border-emerald-200',
      textActive: 'text-emerald-800',
      iconActive: 'text-emerald-600',
      hoverIcon: 'group-hover:text-emerald-500',
      dot: 'bg-emerald-400',
    },
    amber: {
      bgActive: 'bg-amber-50',
      bgHover: 'hover:bg-amber-50/20',
      borderActive: 'border-l-3 border-amber-400',
      borderHover: 'hover:border-amber-200',
      textActive: 'text-amber-800',
      iconActive: 'text-amber-600',
      hoverIcon: 'group-hover:text-amber-500',
      dot: 'bg-amber-400',
    },
    cyan: {
      bgActive: 'bg-cyan-50',
      bgHover: 'hover:bg-cyan-50/20',
      borderActive: 'border-l-3 border-cyan-400',
      borderHover: 'hover:border-cyan-200',
      textActive: 'text-cyan-800',
      iconActive: 'text-cyan-600',
      hoverIcon: 'group-hover:text-cyan-500',
      dot: 'bg-cyan-400',
    },
    purple: {
      bgActive: 'bg-purple-50',
      bgHover: 'hover:bg-purple-50/20',
      borderActive: 'border-l-3 border-purple-400',
      borderHover: 'hover:border-purple-200',
      textActive: 'text-purple-800',
      iconActive: 'text-purple-600',
      hoverIcon: 'group-hover:text-purple-500',
      dot: 'bg-purple-400',
    },
    violet: {
      bgActive: 'bg-violet-50',
      bgHover: 'hover:bg-violet-50/20',
      borderActive: 'border-l-3 border-violet-400',
      borderHover: 'hover:border-violet-200',
      textActive: 'text-violet-800',
      iconActive: 'text-violet-600',
      hoverIcon: 'group-hover:text-violet-500',
      dot: 'bg-violet-400',
    },
    rose: {
      bgActive: 'bg-rose-50',
      bgHover: 'hover:bg-rose-50/20',
      borderActive: 'border-l-3 border-rose-400',
      borderHover: 'hover:border-rose-200',
      textActive: 'text-rose-800',
      iconActive: 'text-rose-600',
      hoverIcon: 'group-hover:text-rose-500',
      dot: 'bg-rose-400',
    },
    sky: {
      bgActive: 'bg-sky-50',
      bgHover: 'hover:bg-sky-50/20',
      borderActive: 'border-l-3 border-sky-400',
      borderHover: 'hover:border-sky-200',
      textActive: 'text-sky-800',
      iconActive: 'text-sky-600',
      hoverIcon: 'group-hover:text-sky-500',
      dot: 'bg-sky-400',
    },
  };

  // Get the color mapping or use fallback
  const selectedColor = colorMappings[color as keyof typeof colorMappings] || {
    bgActive: 'bg-slate-50',
    bgHover: 'hover:bg-slate-50/20',
    borderActive: 'border-l-3 border-slate-400',
    borderHover: 'hover:border-slate-200',
    textActive: 'text-slate-800',
    iconActive: 'text-slate-600',
    hoverIcon: 'group-hover:text-slate-500',
    dot: 'bg-slate-400',
  };

  return {
    bg: isActive ? selectedColor.bgActive : 'bg-white',
    hoverBg: isDisabled ? '' : selectedColor.bgHover,
    border: isActive ? selectedColor.borderActive : 'border border-slate-200',
    hoverBorder: isDisabled ? '' : selectedColor.borderHover,
    text: isActive ? selectedColor.textActive : isDisabled ? 'text-slate-400' : 'text-slate-700',
    icon: isActive ? selectedColor.iconActive : isDisabled ? 'text-slate-400' : 'text-slate-500',
    hoverIcon: isDisabled ? '' : selectedColor.hoverIcon,
    dot: selectedColor.dot,
  };
};


  // Define tool categories for better organization
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
     
    ]
  };

  return (
    <div className="space-y-6">
      {/* Analysis Perspective */}
      <motion.div 
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-base ml-1 text-indigo-900 flex items-center gap-2">
            <Lightbulb size={16} className="text-indigo-600" strokeWidth={2.5} />
            <span>Analysis Perspective</span>
          </h3>
          {perspective && !showPerspectiveInput && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => setPerspective('')}
              className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
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
              <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-md flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800 mb-1">
                    Creative strategy card enabled
                  </p>
                  <p className="text-sm text-amber-700">{cardText}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsCardDropped(false);
                    setCardText('');
                  }}
                  className="text-amber-600 hover:text-amber-800 transition-colors"
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
                  className={`w-full p-3 border rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all duration-200 ${
                    isDragOver ? 'border-amber-400 bg-amber-50/30' : 'border-slate-200'
                  }`}
                  placeholder="Enter an analysis perspective..."
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
                  <div className="absolute inset-0 flex items-center justify-center text-amber-600 pointer-events-none">
                    <span className="text-sm bg-amber-50 px-2 py-1 rounded shadow-sm">
                      Drop card here
                    </span>
                  </div>
                )}
              </div>
            )}
            <div className="flex space-x-2">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={isCardDropped ? handlePerspectiveWithCardSubmit : handlePerspectiveSubmit}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-all disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center gap-1"
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
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-all"
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
            className={`p-3 border rounded-lg flex justify-between items-center cursor-pointer transition-all duration-200 ${
              isDragOver 
                ? 'border-amber-400 bg-amber-50/30' 
                : perspective 
                  ? 'border-indigo-200 bg-indigo-50/40 hover:border-indigo-300' 
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
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
            <span className={`text-sm ${perspective ? 'text-indigo-800 font-medium' : 'text-slate-500'}`}>
              {perspective && !perspective.includes('koan-like suggestion')
                ? perspective
                : perspective && perspective.includes('koan-like suggestion')
                ? 'Creative strategy card enabled'
                : 'Default (no specific perspective)'}
            </span>
            <PenLine size={16} className={`${perspective ? 'text-indigo-600' : 'text-slate-400'}`} />
          </motion.div>
        )}
      </motion.div>

      {/* Analysis Tools Navigation */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-base text-indigo-900 ml-1">Lenses</h3>
          
          {/* Category Tabs */}
          <div className="flex rounded-lg bg-slate-100 p-0.5">
            {['standard', 'experimental',].map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                  activeCategory === category
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
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
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.2 }}
      className="grid grid-cols-1 gap-2"
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
            whileHover={!isDisabled ? { scale: 1.01, y: -1 } : {}}
            whileTap={!isDisabled ? { scale: 0.98 } : {}}
            className={`
              flex items-center p-3 rounded-lg transition-all duration-200 group
              ${classes.bg} ${classes.hoverBg} ${classes.border} ${classes.hoverBorder} pl-3
            `}
          >
            <span className={`mr-3 flex-shrink-0 ${classes.icon} ${classes.hoverIcon}`}>
              {tool.icon}
            </span>
            <span className={`text-sm font-medium ${classes.text}`}>
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

      {/* Model Selector Component */}
      <ModelSelector />
    </div>
  );
}