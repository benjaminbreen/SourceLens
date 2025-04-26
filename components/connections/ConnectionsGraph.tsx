// components/connections/ConnectionsGraph.tsx
// Interactive force-directed graph visualization for source connections
// Renders nodes and links with physics-based layout for exploring relationships

'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';



interface Node {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
  size: number;
  type: string;
  emoji: string;
  // Other properties
  [key: string]: any;
}

interface Link {
  source: string | Node;
  target: string | Node;
  relationship: 'direct' | 'indirect';
  distance: number;
  type: string;
}

interface ConnectionsGraphProps {
  source: any;
  graphData?: any; // Will contain sourceNode, connections, and links
  connections?: any[]; // Support for the old API format
  onNodeClick: (node: any) => void;
  loading?: boolean;
  cosmicTheme?: boolean; // New prop for cosmic theme styling
   darkMode?: boolean;
}

export default function ConnectionsGraph({ 
  source, 
  graphData, 
  connections = [], // Default to empty array
  onNodeClick,
  loading = false,
  cosmicTheme = false
}: ConnectionsGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const nodesRef = useRef<Node[]>([]);
  const linksRef = useRef<Link[]>([]);
  const [, setTick] = useState(0); // dummy state for re-render on tick
  const [simulation, setSimulation] = useState<any>(null);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [transform, setTransform] = useState<{ x: number; y: number; k: number }>({ x: 0, y: 0, k: 1 });
  const [hasMounted, setHasMounted] = useState(false);
const [graphVersion, setGraphVersion] = useState(0);

useEffect(() => {
  setHasMounted(true);
}, []);
  // Set up dimensions based on container size
  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });
    
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);


  
  useEffect(() => {
  let shouldUpdate = false;

  if (graphData && graphData.connections && graphData.links) {
    console.log("Processing graphData format");

    const sourceNode = graphData.sourceNode || {
      id: 'source',
      name: source.metadata?.title || source.metadata?.author || 'Primary Source',
      x: dimensions.width / 2,
      y: dimensions.height / 2,
      color: '#6366F1',
      size: 25,
      type: 'source',
      emoji: source.metadata?.documentEmoji || '📄',
      metadata: source.metadata,
    };

    nodesRef.current = [sourceNode, ...graphData.connections];
    linksRef.current = graphData.links.map((link: any) => ({
      ...link,
      source: link.source,
      target: link.target,
    }));

    shouldUpdate = true;

  } else if (connections && connections.length > 0) {
    console.log("Processing connections array format");

    const sourceNode = {
      id: 'source',
      name: source.metadata?.title || source.metadata?.author || 'Primary Source',
      x: dimensions.width / 2,
      y: dimensions.height / 2,
      color: '#6366F1',
      size: 25,
      type: 'source',
      emoji: source.metadata?.documentEmoji || '📄',
      metadata: source.metadata,
    };

    nodesRef.current = [sourceNode, ...connections];
    linksRef.current = connections.map(conn => ({
      source: sourceNode.id,
      target: conn.id,
      relationship: conn.relationship || 'indirect',
      distance: conn.distance || 3,
      type: conn.type || 'concept',
    }));

    shouldUpdate = true;

  } else {
    console.log("No valid connection data provided");
    nodesRef.current = [];
    linksRef.current = [];
    shouldUpdate = true;
  }

  // Only update simulation if data changed
  if (shouldUpdate) {
    setGraphVersion(v => v + 1);
  }
}, [graphData?.connections?.length, graphData?.links?.length, connections?.length, source?.metadata, dimensions.width, dimensions.height]);

useEffect(() => {
  if (!nodesRef.current.length || !svgRef.current) return;

  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;

  const sim = d3.forceSimulation(nodesRef.current)
    .force('charge', d3.forceManyBody().strength(-120))
    .force('center', d3.forceCenter(centerX, centerY))
    .force('link', d3.forceLink(linksRef.current)
      .id((d: any) => d.id)
      .distance((d: any) => (d.distance || 1) * 40 + 60)
    )
    .force('collide', d3.forceCollide().radius((d: any) => d.size * 1.2))
    .on('tick', () => {
      setTick(t => t + 1);
    });

  setSimulation(sim);

  return () => {
    sim.stop();
  };
}, [graphVersion, dimensions]);


  // Handle zoom behavior
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    
    const zoom = d3.zoom()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        setTransform({
          x: event.transform.x,
          y: event.transform.y,
          k: event.transform.k
        });
      });
    
    svg.call(zoom as any);
    
    // Initial zoom to fit all nodes
    const initialTransform = d3.zoomIdentity
      .translate(dimensions.width / 2, dimensions.height / 2)
      .scale(0.8);
    
    svg.call((zoom as any).transform, initialTransform);
    
    return () => {
      svg.on('.zoom', null);
    };
  }, [dimensions]);
  
  // Handle node hover
  const handleNodeMouseEnter = useCallback((node: Node) => {
    setHoveredNode(node);
  }, []);
  
  const handleNodeMouseLeave = useCallback(() => {
    setHoveredNode(null);
  }, []);
  
  // Handle node click
  const handleNodeClick = useCallback((node: Node) => {
    onNodeClick(node);
  }, [onNodeClick]);


  // Render function
  return (
    <div 
      ref={containerRef} 
      className="w-full h-full min-h-[600px] relative rounded-lg overflow-hidden"
    >
      <svg 
        ref={svgRef} 
        width={dimensions.width} 
        height={dimensions.height}
        className={`${cosmicTheme ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950' : 'bg-black/85'} rounded-lg`}
        style={{ cursor: 'move' }}
      >
        <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
          {/* Links */}
          {linksRef.current.map((link: any, i) => {
           const sourceNode = typeof link.source === 'string' 
             ? nodesRef.current.find(n => n.id === link.source) 
             : link.source;

           const targetNode = typeof link.target === 'string' 
             ? nodesRef.current.find(n => n.id === link.target) 
             : link.target;

            
            if (!sourceNode || !targetNode) return null;
            
            const isDirectLink = link.relationship === 'direct';
            
            return (
              <line
                key={`link-${i}`}
                x1={sourceNode.x}
                y1={sourceNode.y}
                x2={targetNode.x}
                y2={targetNode.y}
                stroke={isDirectLink ? '#e2e8f0' : '#64748b'}
                strokeWidth={isDirectLink ? 1.5 : 1}
                strokeDasharray={isDirectLink ? '0' : '4 4'}
                strokeOpacity={isDirectLink ? 0.8 : 0.5}
                className="transition-opacity duration-300"
                style={{
                  opacity: hoveredNode 
                    ? (hoveredNode.id === sourceNode.id || hoveredNode.id === targetNode.id ? 1 : 0.2) 
                    : 0.7
                }}
              />
            );
          })}
          
          {/* Nodes */}
          {nodesRef.current.map((node) => (
            <g
              key={node.id}
              transform={`translate(${node.x},${node.y})`}
              onClick={() => handleNodeClick(node)}
              onMouseEnter={() => handleNodeMouseEnter(node)}
              onMouseLeave={handleNodeMouseLeave}
              style={{ cursor: 'pointer' }}
              className="transition-opacity duration-300"
              opacity={hoveredNode ? (hoveredNode.id === node.id ? 1 : 0.5) : 1}
            >
              {/* Node Glow Effect */}
              <circle
                r={node.size + 4}
                fill={node.color}
                opacity={0.2}
                className="animate-pulse"
              />
              
              {/* Node Background */}
              <circle
                r={node.size}
                fill={`url(#gradient-${node.id})`}
                stroke={node.color}
                strokeWidth={1.5}
              />
              
              {/* Define gradient for each node */}
              <defs>
                <radialGradient
                  id={`gradient-${node.id}`}
                  cx="50%"
                  cy="50%"
                  r="50%"
                  fx="50%"
                  fy="50%"
                >
                  <stop
                    offset="0%"
                    stopColor={node.color}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="100%"
                    stopColor={node.color}
                    stopOpacity={0.3}
                  />
                </radialGradient>
              </defs>
              
              {/* Node Emoji */}
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={node.size * 0.75}
                className="select-none"
              >
                {node.emoji}
              </text>
              
              {/* Node Label */}
              <text
                textAnchor="middle"
                dominantBaseline="hanging"
                y={node.size + 6}
                fill="white"
                fontSize={10}
                fontWeight="medium"
                className="select-none text-shadow"
                strokeWidth={0.3}
                stroke="rgba(0,0,0,0.5)"
              >
                {node.name.length > 20 ? node.name.substring(0, 18) + '...' : node.name}
              </text>
            </g>
          ))}
        </g>
      </svg>
      
      {/* Tooltip for hovered node */}
      {hoveredNode && (
        <div
          className="absolute bg-slate-900/90 border border-slate-700 p-3 rounded-lg shadow-xl max-w-xs z-10 backdrop-blur-sm text-white pointer-events-none"
          style={{
            left: `${(hoveredNode.x * transform.k + transform.x + 30)}px`,
            top: `${(hoveredNode.y * transform.k + transform.y - 10)}px`,
          }}
        >
          <div className="flex items-center mb-2">
            <span className="text-xl mr-2">{hoveredNode.emoji}</span>
            <span className="font-medium">{hoveredNode.name}</span>
          </div>
          
          <div className="text-xs text-slate-300 flex items-center mb-1">
            <span className="uppercase tracking-wider">{hoveredNode.type}</span>
            {hoveredNode.year && hoveredNode.year !== 'N/A' && (
              <>
                <span className="mx-1">•</span>
                <span>{hoveredNode.year}</span>
              </>
            )}
          </div>
          
          {hoveredNode.relationship && (
            <div className="mt-1 mb-1">
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                hoveredNode.relationship === 'direct' 
                  ? 'bg-indigo-900/50 text-indigo-200 border border-indigo-700/50' 
                  : 'bg-slate-800/70 text-slate-300 border border-slate-700'
              }`}>
                {hoveredNode.relationship === 'direct' ? 'Directly mentioned' : 'Indirectly related'}
              </span>
            </div>
          )}
          
          <p className="text-xs mt-2 line-clamp-2 text-slate-300">
            {hoveredNode.description}
          </p>
          
          <div className="mt-2 text-xs text-slate-400">
            Click to view details
          </div>
        </div>
      )}
      
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-lg z-20">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-2 border-t-indigo-500 border-r-indigo-500 border-b-transparent border-l-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-slate-300 text-sm">Updating connections...</p>
          </div>
        </div>
      )}
      
      {/* Empty state */}
      {!loading && nodesRef.current.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-slate-400">Generate connections to see the graph</p>
        </div>
      )}
      
    </div>
  );
}