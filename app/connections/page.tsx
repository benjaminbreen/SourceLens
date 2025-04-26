// app/connections/page.tsx
// Dynamic connections visualization page that shows sources and their related concepts
// Creates a cosmic-themed network graph with nodes representing entities related to a source

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { useLibrary } from '@/lib/libraryContext';
import TopNavigation from '@/components/ui/TopNavigation';
import ConnectionsGraph from '@/components/connections/ConnectionsGraph';
import SourceSelector from '@/components/connections/SourceSelector';
import CosmicBackground from '@/components/connections/CosmicBackground';
import NodeDetailPanel from '@/components/connections/NodeDetailPanel';
import ConnectionsLegend from '@/components/connections/ConnectionsLegend';
import { Suspense } from 'react';

export default function ConnectionsPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConnectionsPage />
    </Suspense>
  );
}

function ConnectionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
 const sourceId = searchParams?.get('source');
  
  const { sourceContent, metadata } = useAppStore();
  const { sources } = useLibrary();
  
  const [selectedSource, setSelectedSource] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [connections, setConnections] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  // Load source from URL param or app state
  useEffect(() => {
    if (sourceId) {
      const source = sources.find(s => s.id === sourceId);
      if (source) {
        setSelectedSource(source);
      }
    } else if (sourceContent && metadata) {
      // Use current source from app state
      setSelectedSource({
        content: sourceContent,
        metadata: metadata
      });
    }
  }, [sourceId, sources, sourceContent, metadata]);

  // Fetch connections when source is selected
  useEffect(() => {
    if (!selectedSource) return;
    
    const fetchConnections = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/connections', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            source: selectedSource.content,
            metadata: selectedSource.metadata,
            existingConnections: [], // TODO: Load existing connections from library
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate connections');
        }

        const data = await response.json();
        setConnections(data.connections);
      } catch (err) {
        console.error('Error fetching connections:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, [selectedSource]);

  // Handle node selection
  const handleNodeClick = (node: any) => {
    setSelectedNode(node);
  };

  // Close node detail panel
  const handleCloseNodeDetail = () => {
    setSelectedNode(null);
  };

  // Handle expanding a node to create sub-connections
  const handleExpandNode = async (node: any) => {
  if (!selectedSource) return;
  
  setLoading(true);
  try {
    const response = await fetch('/api/connections/expand', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceNode: node,
        originalSource: selectedSource,
        // Include both formats to support the API
        existingConnections: connections,
        // Create a graphData structure if needed
        graphData: connections && connections.length ? {
          sourceNode: {
            id: 'source',
            name: selectedSource.metadata?.title || selectedSource.metadata?.author || 'Primary Source'
          },
          connections: connections
        } : null
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to expand connections');
    }

    const data = await response.json();
    
    // Add new connections to existing ones
    const updatedConnections = [...connections, ...data.connections];
    setConnections(updatedConnections);
  } catch (err) {
    console.error('Error expanding connections:', err);
    setError(err instanceof Error ? err.message : 'Unknown error occurred');
  } finally {
    setLoading(false);
  }
};

 const handleSaveNote = ({ nodeId, note }: { nodeId: string; note: string }) => {
  // TODO: Implement saving notes to library
  console.log('Saving note for node:', nodeId, note);
};

  return (
    <div className="min-h-screen flex flex-col bg-black text-white overflow-hidden">
      <TopNavigation isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      
      <div className="flex-1 flex flex-col relative mt-16">
        {/* Cosmic Background */}
        <CosmicBackground />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col z-10 p-6">
          {/* Header */}
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-slate-100">Connections</h1>
            <p className="text-md text-slate-400">
              Explore related concepts
            </p>
          </header>
          
          {/* Source Selector */}
          <div className="mb-8">
            <SourceSelector 
              sources={sources}
              selected={selectedSource}
              onSelect={setSelectedSource}
            />
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="p-4 mb-6 bg-red-900/30 border border-red-700 rounded-lg text-red-200">
              <p>{error}</p>
            </div>
          )}
          
          {/* Graph Area */}
          <div className="flex-1 relative">
            {loading && !connections.length ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-slate-900/80 p-6 rounded-lg flex flex-col items-center backdrop-blur-md">
                  <div className="w-12 h-12 border-2 border-t-indigo-500 border-r-indigo-500 border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-slate-300">Generating connections...</p>
                </div>
              </div>
            ) : selectedSource ? (
              <ConnectionsGraph 
                source={selectedSource}
                connections={connections}
                onNodeClick={handleNodeClick}
                loading={loading}
              />
            ) : (
              <div className="h-80 flex items-center justify-center">
                <p className="text-slate-400">Select a source to explore connections</p>
              </div>
            )}
          </div>
          
          {/* Legend */}
          <div className="mt-4">
            <ConnectionsLegend />
          </div>
        </div>
        
        {/* Node Detail Panel - Slide in from right when a node is selected */}
        {selectedNode && (
          <NodeDetailPanel
            node={selectedNode}
            onClose={handleCloseNodeDetail}
            onExpand={handleExpandNode}
            onSaveNote={handleSaveNote}
            isLoading={loading}
             isDarkMode={isDarkMode}
          />
        )}
      </div>
    </div>
  );
}