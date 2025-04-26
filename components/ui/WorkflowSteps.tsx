// components/ui/WorkflowSteps.tsx
// A streamlined component that presents the SourceLens workflow steps
// Designed to be shown below the demo button with an additional "See how it works" button

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DemoButtons from './DemoButtons';

interface WorkflowStepsProps {
  demoTexts: any[];
  selectedDemo: number | null;
  loadDemoContent: (index: number) => void;
  handleQuickDemo: (index: number, panel: string) => void;
  handleManhattanNarrative: () => void;
  handleHighlightDemo: (index: number, query: string) => void;
  isDarkMode?: boolean;
}

export default function WorkflowSteps({
  demoTexts,
  selectedDemo,
  loadDemoContent,
  handleQuickDemo,
  handleManhattanNarrative,
  handleHighlightDemo,
  isDarkMode = false
}: WorkflowStepsProps) {
  const [showDemoOptions, setShowDemoOptions] = useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Workflow steps data
  const steps = [
    {
      number: 1,
      title: "Upload Source",
      description: "Add text, upload files, or choose from examples",
      icon: "📄",
      color: "bg-amber-50 ",
      border: "border-amber-200 ",
      iconBg: "bg-amber-100 ",
      numberColor: "text-amber-600 "
    },
    {
      number: 2,
      title: "Add Context",
      description: "Provide metadata to enhance analysis",
      icon: "📝",
      color: "bg-emerald-50 ",
      border: "border-emerald-200 ",
      iconBg: "bg-emerald-100 ",
      numberColor: "text-emerald-600 "
    },
    {
      number: 3,
      title: "Explore Insights",
      description: "Interact with multiple analysis tools",
      icon: "🔍",
      color: "bg-indigo-50 ",
      border: "border-indigo-200 ",
      iconBg: "bg-indigo-100 ",
      numberColor: "text-indigo-600 "
    }
  ];

  return (
    <motion.div
      className="w-full -pb-4 -pt-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Workflow steps grid */}
      <div className="flex flex-wrap md:flex-nowrap gap-4 px-50 items-stretch">
       
        
        {/* Demo Button Integrated */}
        <motion.div 
          className={`flex-1  rounded-full flex items-center justify-center px-4 py-4  ${
            isDarkMode 
              ? 'bg-slate-800/80 border-slate-700' 
              : 'bg-slate-50/0 border-slate-100'
          } border min-w-32`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex flex-col items-center gap-1.5">
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
            <span className={`text-xs font-medium mt-1 ${
              isDarkMode ? 'text-slate-300' : 'text-slate-500' 
            }`}>
              See examples with pre-loaded sources
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}