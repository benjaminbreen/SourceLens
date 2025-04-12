// components/ui/SplashIndicator.tsx
// An elegant, minimalist progress indicator inspired by Swiss design principles
// Provides subtle visual cues and reveals more information on interaction

import React from 'react';

interface SplashIndicatorProps {
  steps: {
    label: string;
    completed: boolean;
    active?: boolean;
    color?: string;
  }[];
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

export default function SplashIndicator({ 
  steps, 
  orientation = 'horizontal',
  className = '' 
}: SplashIndicatorProps) {
  const isVertical = orientation === 'vertical';
  
  // Get color classes for a step
  const getColorClasses = (step: SplashIndicatorProps['steps'][0]) => {
    if (!step.color) return { dot: 'bg-slate-400', text: 'text-slate-700' };
    
    switch (step.color) {
      case 'amber':
        return { dot: 'bg-amber-500', text: 'text-amber-700' };
      case 'blue':
        return { dot: 'bg-blue-500', text: 'text-blue-700' };
      case 'emerald':
        return { dot: 'bg-emerald-500', text: 'text-emerald-700' };
      default:
        return { dot: 'bg-slate-400', text: 'text-slate-700' };
    }
  };
  
  return (
    <div className={`transition-all duration-500 ease-in-out ${className}`}>
      {/* Main container */}
      <div className={`relative ${
        isVertical 
          ? 'h-full flex flex-col' 
          : 'w-full flex'
      } items-center`}>
        {/* Line connecting the dots */}
        <div className={`${
          isVertical
            ? 'absolute inset-y-0 w-px left-1/2 -translate-x-1/2' 
            : 'absolute inset-x-0 h-px top-1/2 -translate-y-1/2'
        } bg-slate-200`}></div>
        
        {/* Step markers with positioning */}
        <div className={`relative w-full h-full flex ${
          isVertical ? 'flex-col justify-between' : 'justify-between'
        }`}>
          {steps.map((step, index) => {
            // Get color classes for this step
            const colorClasses = getColorClasses(step);
            
            // Calculate connections
            const showProgressLine = step.completed && index < steps.length - 1;
            const nextStep = steps[index + 1];
            const nextStepColor = nextStep?.color || 'slate';
            
            return (
              <div 
                key={index}
                className={`relative group ${isVertical ? `${index === 0 ? 'pb-6' : index === steps.length - 1 ? 'pt-6' : 'py-6'}` : ''}`}
              >
                {/* The step dot */}
                <div className={`
                  ${isVertical 
                    ? 'mx-auto' 
                    : 'my-auto'
                  }
                  relative w-2 h-2 rounded-full 
                  ${step.completed 
                    ? colorClasses.dot
                    : 'bg-slate-200'
                  }
                  transition-all duration-300
                  ${step.active ? 'ring-1 ring-offset-1 ring-offset-white' : ''}
                  ${step.active && step.color === 'amber' ? 'ring-amber-300' : ''}
                  ${step.active && step.color === 'blue' ? 'ring-blue-300' : ''}
                  ${step.active && step.color === 'emerald' ? 'ring-emerald-300' : ''}
                `}/>
                
                {/* Progress line when completed */}
                {showProgressLine && (
                  <div 
                    className={`absolute ${
                      isVertical 
                        ? 'w-px h-6 left-1/2 -translate-x-1/2 top-10' 
                        : 'h-px top-1/2 -translate-y-1/2 left-2'
                    } transition-all duration-500 
                    ${step.completed ? (
                      step.color === 'amber' ? 'bg-amber-300' :
                      step.color === 'blue' ? 'bg-blue-300' : 
                      step.color === 'emerald' ? 'bg-emerald-300' : 'bg-slate-300'
                    ) : 'bg-slate-200'}
                    `}
                    style={{
                      [isVertical ? 'height' : 'width']: `${step.completed ? '100%' : '0%'}`
                    }}
                  ></div>
                )}
                
                {/* Label tooltip - more elegant on hover */}
                <div className={`
                  absolute 
                  ${isVertical ? 'left-6 top-0 -translate-y-1/3' : 'top-2 left-1/2 -translate-x-1/2'} 
                  px-2 py-1 text-xs font-sans 
                  bg-white/90 pointer-events-none
                  transition-all duration-200 
                  opacity-0 group-hover:opacity-100
                  ${colorClasses.text}
                  border-b border-slate-100
                  whitespace-nowrap
                `}>
                  {step.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}