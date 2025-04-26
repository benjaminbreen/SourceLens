// components/extract/TopicDistributionDisplay.tsx
// Visualization component for displaying topic distributions across a document
// Displays barcode-like visualization and frequency histograms

'use client';

import React, { useState, useEffect } from 'react';

interface TopicDisplayProps {
  topicData: {
    topics: string[];
    distributions: {
      topic: string;
      positions: number[];
      examples: { [position: number]: string };
      count: number;
    }[];
    documentLength: number;
    totalCounts: { [topic: string]: number };
  };
  description: string;
  isExpanded?: boolean;
}

const COLORS = [
  { bg: 'bg-indigo-500', text: 'text-indigo-900', hover: 'hover:bg-indigo-600' },
  { bg: 'bg-emerald-500', text: 'text-emerald-900', hover: 'hover:bg-emerald-600' },
  { bg: 'bg-amber-500', text: 'text-amber-900', hover: 'hover:bg-amber-600' },
  { bg: 'bg-sky-500', text: 'text-sky-900', hover: 'hover:bg-sky-600' },
  { bg: 'bg-rose-500', text: 'text-rose-900', hover: 'hover:bg-rose-600' },
  { bg: 'bg-violet-500', text: 'text-violet-900', hover: 'hover:bg-violet-600' }
];

export default function TopicDistributionDisplay({ 
  topicData, 
  description,
  isExpanded = false
}: TopicDisplayProps) {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [activePosition, setActivePosition] = useState<number | null>(null);
  const [tooltipContent, setTooltipContent] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  const { topics, distributions, documentLength, totalCounts } = topicData;
  
  // Prepare data for histogram
  const histogramData = topics.map((topic, index) => ({
    name: topic,
    count: totalCounts[topic] || 0,
    color: COLORS[index % COLORS.length].bg
  }));
  
  // Handle line hover
  const handleLineHover = (topic: string, position: number, event: React.MouseEvent) => {
    const topicData = distributions.find(d => d.topic === topic);
    if (topicData && topicData.examples && topicData.examples[position]) {
      setActivePosition(position);
      setSelectedTopic(topic);
      setTooltipContent(topicData.examples[position]);
      
      // Set position for tooltip
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltipPosition({ 
        x: event.clientX, 
        y: rect.top - 10 // Position above the line
      });
    }
  };
  
  // Handle line mouse leave
  const handleLineLeave = () => {
    setActivePosition(null);
    setTooltipContent(null);
  };
  
  // Get color for a topic
  const getTopicColor = (topic: string) => {
    const index = topics.indexOf(topic);
    return index >= 0 ? COLORS[index % COLORS.length] : COLORS[0];
  };

  // Get maximum count for scaling histogram
  const maxCount = Math.max(...Object.values(totalCounts).map(count => count || 0));

  return (
    <div className="space-y-8">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-slate-800">{description}</h3>
        <p className="text-sm text-slate-500 mt-1">
          Visualization of topic distribution across the document
        </p>
      </div>
      
      {/* Topic distribution visualization */}
      <div className="space-y-6">
        {distributions.map((topicDist, idx) => {
          const color = getTopicColor(topicDist.topic);
          
          return (
            <div key={topicDist.topic} className="space-y-1">
              {/* Topic label with count */}
              <div className="flex justify-between items-center">
                <div className={`font-medium flex items-center`}>
                  <div className={`w-4 h-4 rounded-sm mr-2 ${color.bg}`}></div>
                  <span>{topicDist.topic}</span>
                </div>
                <span className="text-sm text-slate-500">{topicDist.count} instances</span>
              </div>
              
              {/* Distribution visualization - barcode style */}
              <div 
                className="h-12 w-full bg-slate-100 rounded-md relative overflow-hidden" 
                style={{ minWidth: isExpanded ? '800px' : '100%' }}
              >
                {topicDist.positions.length > 0 ? topicDist.positions.map((position, posIdx) => {
                  // Calculate relative position as a percentage of document length
                  // This ensures lines are distributed across the full width
                  const positionPercent = Math.min((position / documentLength) * 100, 99.9);
                  
                  return (
                    <div
                      key={`${topicDist.topic}-${posIdx}`}
                      className={`absolute w-0.5 h-full ${color.bg} ${color.hover} cursor-help transition-opacity duration-200`}
                      style={{ 
                        left: `${positionPercent}%`,
                        opacity: (activePosition === position && selectedTopic === topicDist.topic) ? 1 : 0.8
                      }}
                      onMouseEnter={(e) => handleLineHover(topicDist.topic, position, e)}
                      onMouseLeave={handleLineLeave}
                      title="Hover for example"
                    />
                  );
                }) : (
                  <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                    No instances found
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Tooltip that follows cursor */}
      {tooltipContent && (
        <div 
          className="fixed bg-white p-3 rounded-lg shadow-lg border border-slate-200 text-sm max-w-xs z-50"
          style={{ 
            left: `${tooltipPosition.x}px`, 
            top: `${tooltipPosition.y - 10}px`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="font-medium text-emerald-800 mb-1">Example:</div>
          <div className="text-slate-700 italic">"{tooltipContent}"</div>
          
          {/* Arrow */}
          <div 
            className="absolute w-3 h-3 bg-white border-b border-r border-slate-200 transform rotate-45"
            style={{ 
              bottom: '-6px',
              left: '50%',
              marginLeft: '-6px'
            }}
          />
        </div>
      )}
      
      {/* Histogram */}
      <div className={isExpanded ? 'mt-12' : 'mt-6'}>
        <h4 className="text-lg font-medium text-slate-700 mb-3">Topic Frequency Summary</h4>
        <div className="border border-slate-200 rounded-lg p-4 bg-white">
          <div className="h-64">
            <div className="flex h-full items-end justify-around gap-6 px-6">
              {histogramData.map((item, index) => {
                // Calculate height percentage based on max count
                const heightPercent = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                const color = getTopicColor(item.name);
                
                return (
                  <div key={item.name} className="flex flex-col items-center">
                    <div className="h-full flex items-end">
                      <div 
                        className={`w-16 ${color.bg} rounded-t-md transition-all relative group`} 
                        style={{ height: `${heightPercent}%` }}
                      >
                        {/* Value label on top of bar */}
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 font-medium text-slate-700">
                          {item.count}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-center">
                      <div className="text-sm font-medium text-slate-600 mt-1 px-2 whitespace-nowrap">{item.name}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}