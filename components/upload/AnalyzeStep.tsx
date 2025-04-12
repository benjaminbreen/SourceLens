// components/upload/AnalyzeStep.tsx
import React from 'react';
import PrimaryActionButton from '../ui/PrimaryActionButton';

interface AnalyzeStepProps {
  formValid: boolean;
  navigateToAnalysis: (panel?: string) => void;
  completedSteps: {
    source: boolean;
    metadata: boolean;
  };
}

const AnalyzeStep: React.FC<AnalyzeStepProps> = ({ 
  formValid, 
  navigateToAnalysis, 
  completedSteps 
}) => {
  return (
    <div 
      className={`lg:col-span-12 bg-white rounded-xl shadow-lg border ${
        completedSteps.metadata ? 'border-slate-200/60' : 'border-slate-200/30 opacity-75'
      } overflow-hidden hover:shadow-xl transition-all duration-300 mt-4`}
    >
      {/* Analyze Step Header */}
      <div className="p-6 pb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2.5">
            <span className={`flex items-center justify-center w-8 h-8 
              ${formValid 
                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white' 
                : 'bg-white text-emerald-600 border border-emerald-400'} 
              rounded-full text-lg font-bold transition-all duration-200`}>
              3
            </span>
            <span className="bg-gradient-to-r from-slate-800 to-slate-700 bg-clip-text text-transparent">
              Analyze Source
            </span>
          </h2>
        </div>

        {/* Primary Action Area */}
        <div className="flex flex-col items-center justify-center gap-4 py-4">
          <PrimaryActionButton
            onClick={() => navigateToAnalysis('analysis')}
            disabled={!formValid}
            
          >
            <span className="flex items-center justify-center text-base">
              <svg className={`w-5 h-5 mr-2 ${formValid ? '' : 'opacity-70'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Analyze Source
            </span>
          </PrimaryActionButton>
          
          {/* Status message below button */}
          <div className={`flex items-center justify-center w-full ${formValid ? 'text-emerald-700' : 'text-slate-500'}`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${formValid ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
            <p className="text-sm">
              {formValid
                ? 'Ready to analyze! Click the button to proceed.'
                : 'Please complete both required fields.'}
            </p>
          </div>
        </div>
      </div>

      {/* Step Completion Indicator */}
      <div className={`px-6 py-3 border-t ${
        formValid ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'
      } transition-colors duration-500`}>
        <div className="flex items-center">
          {formValid ? (
            <div className="flex items-center text-emerald-700">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">Ready to analyze!</span>
            </div>
          ) : (
            <div className="text-slate-500 flex items-center">
              <svg className="w-5 h-5 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Complete required fields first</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyzeStep;