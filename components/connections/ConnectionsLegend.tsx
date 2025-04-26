// components/connections/ConnectionsLegend.tsx
// Legend explaining the connection types and visual encoding
// Shows relationship types, node categories, and interaction hints

import React, { useState } from 'react';

export default function ConnectionsLegend() {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Node types
  const nodeTypes = [
    { type: 'person', emoji: '👤', color: '#EC4899', description: 'Historical figures related to the source' },
    { type: 'event', emoji: '🗓️', color: '#F97316', description: 'Historical events connected to the source' },
    { type: 'concept', emoji: '💡', color: '#8B5CF6', description: 'Ideas and intellectual frameworks' },
    { type: 'place', emoji: '📍', color: '#10B981', description: 'Geographical locations' },
    { type: 'work', emoji: '📚', color: '#3B82F6', description: 'Books, articles, and creative works' },
    { type: 'organization', emoji: '🏛️', color: '#F59E0B', description: 'Institutions and groups' },
    { type: 'fact', emoji: '📋', color: '#6366F1', description: 'Related factual information' },
  ];
  
  // Relationship types
  const relationshipTypes = [
    { name: 'Direct', description: 'Explicitly mentioned in the source', style: 'solid', color: '#e2e8f0' },
    { name: 'Indirect', description: 'Implicitly related but not mentioned', style: 'dashed', color: '#64748b' },
  ];
  
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex justify-between items-center text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
      >
      
        <span className="font-medium text-sm">Legend</span>
        <svg
          className={`w-5 h-5 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isExpanded && (
        <div className="p-4 text-sm text-slate-300 animate-in fade-in duration-150">
          {/* Node Types */}
          <div className="mb-4">
            <h4 className="font-medium text-white mb-2">Node Types</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {nodeTypes.map((type) => (
                <div 
                  key={type.type}
                  className="flex items-center bg-slate-800/70 p-2 rounded"
                >
                  <div 
                    className="w-7 h-7 rounded-full flex items-center justify-center mr-2 shadow-sm"
                    style={{ backgroundColor: `${type.color}30`, border: `1.5px solid ${type.color}` }}
                  >
                    <span>{type.emoji}</span>
                  </div>
                  <span className="capitalize">{type.type}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Relationship Types */}
          <div className="mb-4">
            <h4 className="font-medium text-white mb-2">Connection Types</h4>
            <div className="flex flex-col space-y-2">
              {relationshipTypes.map((rel) => (
                <div 
                  key={rel.name}
                  className="flex items-center bg-slate-800/70 p-2 rounded"
                >
                  <div className="w-10 flex items-center mr-3">
                    <div 
                      className="w-full h-0.5"
                      style={{ 
                        backgroundColor: rel.color,
                        borderStyle: rel.style === 'dashed' ? 'dashed' : 'solid',
                        borderWidth: '1px',
                        borderColor: rel.color
                      }}
                    ></div>
                  </div>
                  <div>
                    <span className="font-medium">{rel.name}</span>
                    <p className="text-xs text-slate-400">{rel.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Interaction Tips */}
          <div>
            <h4 className="font-medium text-white mb-2">Interaction Tips</h4>
            <ul className="space-y-1.5 text-xs text-slate-400 ml-4 list-disc">
              <li>Hover over nodes to see details</li>
              <li>Click on nodes to open detailed view</li>
              <li>Drag the canvas to pan around</li>
              <li>Use the mouse wheel to zoom in/out</li>
              <li>Click "Expand Connections" to explore related nodes</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}