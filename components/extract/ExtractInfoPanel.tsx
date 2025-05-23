// components/extract/ExtractInfoPanel.tsx
// Updated to support new Topic Distribution visualization with barcode-style display
// Maintains existing table format while adding new topic frequency visualization

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SaveToLibraryButton from '../library/SaveToLibraryButton';
import TopicDistributionDisplay from './TopicDistributionDisplay';

type ResultFormatType = 'table' | 'list' | 'topics';

// Field input interface
interface Field {
  id: string;
  value: string;
}

interface ExtractInfoPanelProps {
  darkMode: boolean;
}

export default function ExtractInfoPanel({ darkMode }: ExtractInfoPanelProps) {

  const { 
    sourceContent, 
    metadata,
    isLoading,
    setLoading,
    llmModel,
    setRawPrompt,
    setRawResponse,
    extractInfoConfig,
    setExtractInfoConfig,
  } = useAppStore();

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showExpandModal, setShowExpandModal] = useState(false);
  const [showInputPanel, setShowInputPanel] = useState(true);

  // State for the query input
  const [listType, setListType] = useState('');
  const [fields, setFields] = useState<Field[]>([
    { id: '1', value: '' },
    { id: '2', value: '' },
    { id: '3', value: '' },
  ]);
  
  // State for extracted results
  const [extractedInfo, setExtractedInfo] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Format options - adding "topics" for the new distribution visualization
const [resultFormat, setResultFormat] = useState<ResultFormatType>('table');
  
  // State for topic distribution data
  const [topicData, setTopicData] = useState<any>(null);

  // Helper function to check if content contains markdown tables
  const containsMarkdownTable = (text: string): boolean => {
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      // Check for table row format
      if (lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        // Check for header separator
        if (i + 1 < lines.length && /^\|[\s-:]+\|/.test(lines[i + 1].trim())) {
          return true;
        }
      }
    }
    return false;
  };

  const handleGoogleDriveSave = () => {
    // For now, just show a message that this feature is coming soon
    alert('Google Drive integration coming soon!');
    
    // Close the modal
    setShowSaveModal(false);
  };

  // Surprise me button code - updated to support topic distributions
  const handleSurpriseMe = async () => {
    if (!sourceContent) return;
    
    setIsProcessing(true);
    setProcessingStatus(resultFormat === 'topics' 
      ? 'Analyzing document to identify key topics...' 
      : 'Analyzing document for smart extraction...');
    setLoading(true);
    
    try {
      // Call the appropriate API based on the format
      const endpoint = resultFormat === 'topics' 
        ? '/api/suggest-topics' 
        : '/api/suggest-extraction';
        
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: sourceContent,
          modelId: llmModel,
          format: resultFormat
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const data = await response.json();
      
      if (resultFormat === 'topics') {
        // Handle topic distribution data
        setFields(data.topics.map((topic: string, index: number) => ({
          id: (index + 1).toString(),
          value: topic
        })));
        
        // Add empty field if needed
        if (data.topics.length < 6) {
          setFields([...data.topics.map((topic: string, index: number) => ({
            id: (index + 1).toString(),
            value: topic
          })), {
            id: (data.topics.length + 1).toString(),
            value: ''
          }]);
        }
        
        setListType(data.description || 'Key topics in the document');
      } else {
        // Handle regular extraction data
        setListType(data.listType);
        
        // Set fields from suggestions
        const newFields = data.fields.map((field: string, index: number) => ({
          id: (index + 1).toString(),
          value: field
        }));
          
        // Ensure we have at least one empty field at the end
        if (newFields.length > 0) {
          newFields.push({
            id: (newFields.length + 1).toString(),
            value: ''
          });
        }
        
        setFields(newFields);
        
        // Set format if suggested
        if (data.format && (data.format === 'list' || data.format === 'table')) {
          setResultFormat(data.format);
        }
      }
      
      // Save to store
     setExtractInfoConfig({
  listType: data.listType || data.description,
  fields: data.fields || data.topics,
  format: resultFormat as 'table' | 'list'  // Type assertion to match expected type
});
      
      // Store the raw data for transparency
      setRawPrompt(data.prompt);
      setRawResponse(data.rawResponse);
      
    } catch (error) {
      console.error('Error getting suggestions:', error);
      setError(`Failed to generate suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
      setLoading(false);
    }
  };

  // Listen for toggle events from the ExtractPanelToggle component
  useEffect(() => {
    const handleToggle = (event: CustomEvent) => {
      setShowInputPanel(event.detail.isExpanded);
    };
    
    // Add event listener
    document.addEventListener('extract-panel-toggle', handleToggle as EventListener);
    
    // Clean up
    return () => {
      document.removeEventListener('extract-panel-toggle', handleToggle as EventListener);
    };
  }, []);

  // Save function - updated to support topic visualization data
  const handleSave = (format: 'json' | 'txt' | 'csv' | 'xlsx' | 'png') => {
    if (!extractedInfo && !topicData) return;
    
    if (format === 'png' && resultFormat === 'topics') {
      // Handle saving topic visualization as image
      const topicElement = document.getElementById('topic-distribution-container');
      if (!topicElement) return;
      
      // Use html-to-image or similar library here
      alert('PNG export coming soon!');
      setShowSaveModal(false);
      return;
    }
    
    let content = extractedInfo || JSON.stringify(topicData);
    let mimeType = 'text/plain';
    let extension = 'txt';
    
    if (format === 'json') {
      try {
        // Try to parse as JSON to format it nicely
        const jsonObj = JSON.parse(content);
        content = JSON.stringify(jsonObj, null, 2);
        mimeType = 'application/json';
        extension = 'json';
      } catch (e) {
        // If not valid JSON, just save as text
        content = content;
      }
    } 
    else if (format === 'csv') {
      // Improved markdown table to CSV conversion
      mimeType = 'text/csv';
      extension = 'csv';
      
      try {
        // Parse markdown tables more reliably
        const lines = content.split('\n');
        let csvContent = '';
        let inTable = false;
        let headerProcessed = false;
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          
          // Skip empty lines and horizontal dividers
          if (trimmedLine === '' || /^\|?\s*:?-+:?\s*\|/.test(trimmedLine)) {
            continue;
          }
          
          // Check if we're entering a table
          if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) {
            inTable = true;
            
            // Process table row
            let processedLine = trimmedLine;
            // Remove first and last pipe
            processedLine = processedLine.substring(1, processedLine.length - 1);
            
            // Split by pipe character and trim each cell
            const cells = processedLine.split('|').map(cell => {
              // Clean up the cell content
              let cleanCell = cell.trim();
              // Remove markdown formatting
              cleanCell = cleanCell.replace(/\*\*(.*?)\*\*/g, '$1'); // Bold
              cleanCell = cleanCell.replace(/\*(.*?)\*/g, '$1');     // Italic
              cleanCell = cleanCell.replace(/`(.*?)`/g, '$1');       // Code
              
              return cleanCell;
            });
            
            // Escape quotes and commas for CSV format
            const escapedCells = cells.map(cell => {
              if (cell.includes(',') || cell.includes('"')) {
                return `"${cell.replace(/"/g, '""')}"`;
              }
              return cell;
            });
            
            // Join with commas to create a CSV row
            csvContent += escapedCells.join(',') + '\n';
            
            headerProcessed = true;
          } else if (inTable && !trimmedLine.includes('|')) {
            // We've exited the table
            inTable = false;
          }
        }
        
        // If no table was detected, fall back to basic processing
        if (csvContent === '') {
          csvContent = content
            .replace(/\|/g, ',')
            .replace(/^\s*,|,\s*$/gm, '')
            .replace(/\s*,\s*/g, ',')
            .replace(/\r?\n\s*[-:]+\s*\r?\n/g, '\n'); // Remove table separators
        }
        
        content = csvContent;
      } catch (e) {
        console.error('Error converting to CSV:', e);
        // Fallback to basic approach if conversion fails
        content = content
          .replace(/\|/g, ',')
          .replace(/^\s*,|,\s*$/gm, '')
          .replace(/\s*,\s*/g, ',');
      }
    } else if (format === 'xlsx') {
      // For Excel, we'll create a CSV that Excel can open
      // But use the xlsx extension which Excel will recognize
      try {
        // Same CSV conversion as above
        const lines = content.split('\n');
        let csvContent = '';
        
        for (const line of lines) {
          // Skip separator lines and empty lines
          if (line.trim() === '' || line.match(/^\s*\|[-:]+\|\s*$/)) {
            continue;
          }
          
          // Remove leading/trailing pipes and spaces
          let processed = line.trim();
          if (processed.startsWith('|')) {
            processed = processed.substring(1);
          }
          if (processed.endsWith('|')) {
            processed = processed.substring(0, processed.length - 1);
          }
          
          // Split by pipe character and trim each cell
          const cells = processed.split('|').map(cell => cell.trim());
          
          // Escape quotes and commas in cell content
          const escapedCells = cells.map(cell => {
            // Remove markdown formatting if present
            cell = cell.replace(/\*\*(.*?)\*\*/g, '$1'); // Bold
            cell = cell.replace(/\*(.*?)\*/g, '$1');     // Italic
            
            // If cell contains comma or quotes, wrap in quotes and escape existing quotes
            if (cell.includes(',') || cell.includes('"')) {
              return `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
          });
          
          // Join with commas to create a CSV row
          csvContent += escapedCells.join(',') + '\n';
        }
        
        content = csvContent;
        mimeType = 'application/vnd.ms-excel';
        extension = 'xlsx';
      } catch (e) {
        console.error('Error converting to Excel format:', e);
        extension = 'csv'; // Fallback to CSV
      }
    }
    
    // Create download link
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted_info_${new Date().toISOString().slice(0, 10)}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Close modal
    setShowSaveModal(false);
  };
  
  // Add a field when the last field has content
  useEffect(() => {
    const lastField = fields[fields.length - 1];
    if (lastField && lastField.value && fields.length < (resultFormat === 'topics' ? 6 : 10)) {
      setFields([...fields, { id: (fields.length + 1).toString(), value: '' }]);
    }
  }, [fields, resultFormat]);
  
  // Handle field changes
  const handleFieldChange = (id: string, value: string) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, value } : field
    ));
  };
  
  // Handle extraction - updated to support topic distribution
  const handleExtractInfo = async () => {
    // Validate inputs
    if (!listType.trim()) {
      setError('Please specify what kind of information you want to extract');
      return;
    }
    
    // Get non-empty fields
    const validFields = fields.filter(field => field.value.trim());
    if (validFields.length === 0) {
      setError(resultFormat === 'topics' 
        ? 'Please specify at least one topic for analysis' 
        : 'Please specify at least one field for the list items');
      return;
    }

    // Check max topics limit
    if (resultFormat === 'topics' && validFields.length > 6) {
      setError('Please limit your topics to a maximum of 6');
      return;
    }

    setExtractInfoConfig({
      listType: listType,
      fields: fields.filter(f => f.value.trim()).map(f => f.value.trim()),
      format: resultFormat as 'table' | 'list'
    });
    
    setError(null);
    setIsProcessing(true);
    setProcessingStatus(resultFormat === 'topics' 
      ? 'Analyzing topic distributions...' 
      : 'Preparing extraction...');
    setLoading(true);
    
    try {
      // Build the query and set endpoint based on format
      const fieldsList = validFields.map(f => f.value).join(', ');
      const query = resultFormat === 'topics'
        ? `Analyze the distribution of these topics: ${fieldsList}. Explanation: ${listType}`
        : `Extract a list of ${listType}. For each item, include the following fields: ${fieldsList}.`;
      
      const endpoint = resultFormat === 'topics' 
        ? '/api/topic-distribution' 
        : '/api/extract-info';
      
      setProcessingStatus(resultFormat === 'topics' 
        ? 'Analyzing topic distributions throughout text...' 
        : 'Analyzing document...');
      
      // Call the API to extract info
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: sourceContent,
          query,
          topics: validFields.map(f => f.value),
          modelId: llmModel,
          format: resultFormat,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const data = await response.json();
      
      if (resultFormat === 'topics') {
        // Set the topic distribution data
        setTopicData(data.topicData);
        setExtractedInfo(null);
      } else {
        // Set the extracted information
        setExtractedInfo(data.extractedInfo);
        setTopicData(null);
      }
      
      // Store raw data for transparency
      setRawPrompt(data.rawPrompt || query);
      setRawResponse(data.rawResponse);
      
      setProcessingStatus('Extraction complete!');
    } catch (error) {
      console.error('Information extraction error:', error);
      setError(`Failed to extract information: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
      setLoading(false);
    }
  };

  // Load config when it changes
  useEffect(() => {
    if (extractInfoConfig) {
      setListType(extractInfoConfig.listType);
      
      // Convert fields array to Field objects
      const configFields = extractInfoConfig.fields.map((field, index) => ({
        id: (index + 1).toString(),
        value: field
      }));
      
      // Add an empty field at the end
      configFields.push({
        id: (extractInfoConfig.fields.length + 1).toString(),
        value: ''
      });
      
      setFields(configFields);
      
      // Set format if provided
      if (extractInfoConfig.format) {
        setResultFormat(extractInfoConfig.format as any);
      }
    }
  }, [extractInfoConfig]);

  // Handle escape key
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowExpandModal(false);
        setShowSaveModal(false);
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  // Toggle the input panel visibility
  const toggleInputPanel = () => {
    setShowInputPanel(!showInputPanel);
  };

  // Add a new effect to automatically collapse the panel during loading and when results are displayed
useEffect(() => {
  // When loading starts, collapse the panel
  if (isProcessing) {
    setShowInputPanel(false);
  }
  
  // When results are displayed (either topicData or extractedInfo exists), keep panel collapsed
  if (topicData || extractedInfo) {
    setShowInputPanel(false);
  }
}, [isProcessing, topicData, extractedInfo]);

  return (
    <div className="flex flex-col h-full">
      {/* Header with Surprise Me Button */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-emerald-900 flex items-center">
          <svg className="w-5 h-5 mr-2 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          Extract Information
        </h3>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleSurpriseMe}
            disabled={isProcessing || !sourceContent}
            className={`py-1.5 px-3 rounded-md text-white text-sm font-medium transition-all flex items-center ${
              isProcessing || !sourceContent
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-emerald-500 hover:bg-emerald-600 hover:shadow-md hover:shadow-emerald-200/50 active:translate-y-0.5'
            }`}
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {isProcessing ? 'Analyzing...' : 'Surprise Me!'}
          </button>
          
          <button 
            onClick={toggleInputPanel} 
            className="p-1.5 rounded-full text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
            title={showInputPanel ? "Hide options" : "Show options"}
          >
            <svg className={`w-5 h-5 transform transition-transform ${showInputPanel ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Input Form - Conditionally render based on showInputPanel state */}
      <div className={`${showInputPanel ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'} bg-white rounded-lg p-4 mb-4 transition-all duration-300 ease-in-out border border-emerald-100`}>
        {error && (
          <div className="mb-3 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
            {error}
          </div>
        )}
        
        <div className="space-y-3">
          {/* Format Options - Added topic distribution option */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Result Format
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-emerald-600"
                  checked={resultFormat === 'table'}
                  onChange={() => setResultFormat('table')}
                  disabled={isProcessing}
                />
                <span className="ml-2 text-sm text-slate-700">Table Format</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-emerald-600"
                  checked={resultFormat === 'list'}
                  onChange={() => setResultFormat('list')}
                  disabled={isProcessing}
                />
                <span className="ml-2 text-sm text-slate-700">Numbered List</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-emerald-600"
                  checked={resultFormat === 'topics'}
                  onChange={() => setResultFormat('topics')}
                  disabled={isProcessing}
                />
                <span className="ml-2 text-sm text-slate-700">Topic Distribution</span>
              </label>
            </div>
          </div>
          
          {/* List Type Input - Updated label based on format */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {resultFormat === 'topics' 
                ? 'Brief description of what you\'re analyzing'
                : 'What kind of list do you want?'}
            </label>
            <div className="relative">
              <input
                type="text"
                value={listType}
                onChange={(e) => setListType(e.target.value)}
                placeholder={resultFormat === 'topics'
                  ? "For example: Key philosophical concepts in the text"
                  : "For example: all people, places, events, technical terms, or diseases mentioned..."}
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                disabled={isProcessing}
              />
              <p className="mt-1 text-xs text-slate-500 italic">
                {resultFormat === 'topics'
                  ? 'Provide context about the topics you want to analyze'
                  : 'Be specific about what you\'re looking for and any criteria for inclusion'}
              </p>
            </div>
          </div>
          
          {/* Fields Input - Updated label and limit based on format */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {resultFormat === 'topics'
                ? `Topics to analyze (maximum 6)`
                : `What fields do you want the list to contain? (up to 10)`}
            </label>
            <div className="space-y-2">
              {fields.map((field, index) => (
                <input
                  key={field.id}
                  type="text"
                  value={field.value}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  placeholder={resultFormat === 'topics'
                    ? `Topic ${index + 1} (e.g., Legalism, Confucianism, Economy...)`
                    : `Field ${index + 1} (e.g., Name, Date, Location...)`}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  disabled={isProcessing}
                />
              ))}
            </div>
            <p className="mt-1 text-xs text-slate-500 italic">
              {resultFormat === 'topics'
                ? 'Each topic will be visualized as a distribution across the text'
                : 'Each field will be extracted for every item in the list if available'}
            </p>
          </div>
          
          {/* Extract Button */}
          <button
            onClick={handleExtractInfo}
            disabled={isProcessing || !listType.trim()}
            className={`px-4 py-2 rounded-md text-white font-medium transition-all transform w-auto float-right ${
              isProcessing || !listType.trim()
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-100/50 active:translate-y-0.5'
            }`}
          >
            {isProcessing 
              ? 'Processing...' 
              : resultFormat === 'topics' 
                ? 'Analyze Topics' 
                : 'Extract Information'}
          </button>
        </div>
      </div>
      
      {/* Results Display */}
      <div className="flex-1 overflow-y-auto">
        {isProcessing ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center">
            <div className="w-12 h-12 border-t-2 border-b-2 border-emerald-500 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-700 font-medium">{processingStatus}</p>
            <p className="text-sm text-slate-500 mt-2">
              Processing large documents may take some time...
            </p>
          </div>
        ) : topicData ? (
          <div className="bg-white rounded-lg p-4 border border-emerald-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-emerald-900">Topic Distribution Visualization</h3>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowExpandModal(true)}
                  className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-md transition-colors"
                  title="Expand view"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </button>

                <SaveToLibraryButton
                  type="analysis"
                  data={{
                    type: 'extract-info',
                    title: `Topic Distribution: ${listType}`,
                    content: JSON.stringify(topicData),
                    sourceName: metadata?.title || 'Untitled Source',
                    sourceAuthor: metadata?.author || 'Unknown',
                    sourceDate: metadata?.date || 'Unknown date',
                    perspective: `Topic Analysis: ${listType}`,
                    model: llmModel
                  }}
                  variant="secondary"
                  size="sm"
                  className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                />
                
                <button
                  onClick={() => setShowSaveModal(true)}
                  className="px-3 py-1.5 text-sm bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Save As
                </button>
              </div>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-md border border-slate-200 overflow-x-auto max-h-[700px] overflow-y-auto">
              <div id="topic-distribution-container">
                <TopicDistributionDisplay 
                  topicData={topicData} 
                  description={listType}
                />
              </div>
            </div>
          </div>
        ) : extractedInfo ? (
          <div className="bg-white rounded-lg p-4 border border-emerald-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-emerald-900">Extracted Information</h3>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowExpandModal(true)}
                  className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-md transition-colors"
                  title="Expand view"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </button>

                {extractedInfo && (
                  <SaveToLibraryButton
                    type="analysis"
                    data={{
                      type: 'extract-info',
                      title: `Extracted ${listType}`,
                      content: extractedInfo,
                      sourceName: metadata?.title || 'Untitled Source',
                      sourceAuthor: metadata?.author || 'Unknown',
                      sourceDate: metadata?.date || 'Unknown date',
                      perspective: `Extract: ${listType}`,
                      model: llmModel
                    }}
                    variant="secondary"
                    size="sm"
                    className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                  />
                )}
                
                <button
                  onClick={() => setShowSaveModal(true)}
                  className="px-3 py-1.5 text-sm bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Save As
                </button>
              </div>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-md border border-slate-200 overflow-x-auto max-h-[700px] overflow-y-auto">
              <div className="prose prose-sm max-w-none prose-emerald">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    table: ({node, ...props}) => (
                      <div className="overflow-x-auto my-4">
                        <table className="min-w-full divide-y divide-slate-300 border border-emerald-200 table-auto" {...props} />
                      </div>
                    ),
                    thead: ({node, ...props}) => <thead className="bg-emerald-50" {...props} />,
                    tr: ({node, ...props}) => <tr className="hover:bg-emerald-50/50 border-b border-slate-200" {...props} />,
                    th: ({node, ...props}) => <th className="hover:bg-emerald-100/50 px-4 py-3 text-left text-xs font-medium text-emerald-900 uppercase tracking-wider" {...props} />,
                    td: ({node, ...props}) => <td className="px-4 py-3 text-sm text-slate-700 border-r border-slate-200 last:border-r-0" {...props} />
                  }}
                >
                  {extractedInfo}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center">
            <svg className="w-16 h-16 text-emerald-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <p className="text-slate-500">
              {resultFormat === 'topics'
                ? 'Specify topics you want to analyze in your document'
                : 'Specify what information you\'d like to extract from your document'}
            </p>
            <p className="text-sm text-slate-400 mt-2 max-w-md">
              {resultFormat === 'topics'
                ? 'You can visualize how different topics are distributed across your text'
                : 'You can extract lists of people, places, events, terms, or any other structured information from your text'}
            </p>
          </div>
        )}
      </div>

      {/* Expanded View Modal */}
      {showExpandModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6 backdrop-blur-sm"
          onClick={() => setShowExpandModal(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl w-[90vw] h-[85vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-emerald-600 p-3 border-b border-emerald-700 flex justify-between items-center">
              <h3 className="font-bold text-xl text-white">
                {resultFormat === 'topics' ? 'Topic Distribution Visualization' : 'Extracted Information'}
              </h3>
              <button 
                onClick={() => setShowExpandModal(false)}
                className="text-white/80 hover:text-white hover:bg-emerald-700/50 p-2 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6 bg-slate-50">
              {resultFormat === 'topics' ? (
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm h-full overflow-auto">
                  <TopicDistributionDisplay 
                    topicData={topicData} 
                    description={listType}
                    isExpanded={true}
                  />
                </div>
              ) : (
                <div className={`bg-white p-6 rounded-lg border border-slate-200 shadow-sm h-full overflow-auto ${
                  containsMarkdownTable(extractedInfo || '') ? 'min-w-[800px]' : ''
                }`}>
                  <div className="prose prose-lg max-w-none prose-emerald">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        table: ({node, ...props}) => (
                          <div className="overflow-x-auto my-4">
                            <table className="min-w-full divide-y divide-slate-300 border border-emerald-200 table-auto" {...props} />
                          </div>
                        ),
                        thead: ({node, ...props}) => <thead className="bg-emerald-50" {...props} />,
                        tr: ({node, ...props}) => <tr className="hover:bg-emerald-50/50 border-b border-slate-200" {...props} />,
                        th: ({node, ...props}) => <th className="px-4 py-3 text-left text-xs font-medium text-emerald-900 uppercase tracking-wider" {...props} />,
                        td: ({node, ...props}) => <td className="px-4 py-3 text-sm text-slate-700 border-r border-slate-200 last:border-r-0" {...props} />
                      }}
                    >
                      {extractedInfo}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-200 bg-white flex justify-between">
              <button
                onClick={() => setShowSaveModal(true)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 hover:shadow-md hover:shadow-emerald-100/50 active:translate-y-0.5 transition-all flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Save Locally
              </button>
              
              <button
                onClick={() => setShowExpandModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-emerald-600 p-5 border-b border-emerald-700">
              <h3 className="font-bold text-xl text-white">Save {resultFormat === 'topics' ? 'Topic Analysis' : 'Extracted Information'}</h3>
            </div>
            
            <div className="p-8 bg-slate-50">
              <p className="text-slate-700 mb-6 text-lg">
                Choose a format to save the {resultFormat === 'topics' ? 'topic analysis' : 'extracted information'} to your computer:
              </p>
              
              <div className="grid grid-cols-4 gap-6">
                <button
                  onClick={() => handleSave('txt')}
                  className="group bg-white rounded-xl p-6 border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col items-center justify-center"
                >
                  <div className="w-14 h-14 rounded-full bg-slate-100 group-hover:bg-emerald-50 flex items-center justify-center mb-3 transition-colors">
                    <svg className="w-8 h-8 text-slate-500 group-hover:text-emerald-700 transition-colors" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="font-medium text-slate-700 group-hover:text-slate-900">Plain Text</span>
                  <span className="text-xs text-slate-500 group-hover:text-slate-600">.txt</span>
                </button>
                
                <button
                  onClick={() => handleSave('json')}
                  className="group bg-white rounded-xl p-6 border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col items-center justify-center"
                >
                  <div className="w-14 h-14 rounded-full bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center mb-3 transition-colors">
                    <svg className="w-8 h-8 text-emerald-500 group-hover:text-emerald-600 transition-colors" fill="none" viewBox="0 0 24 24">
                      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth={1.5} />
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 7v10M7 12h10" />
                    </svg>
                  </div>
                  <span className="font-medium text-slate-700 group-hover:text-slate-900">JSON</span>
                  <span className="text-xs text-slate-500 group-hover:text-slate-600">.json</span>
                </button>
                
                {resultFormat !== 'topics' && (
                  <button
                    onClick={() => handleSave('csv')}
                    className="group bg-white rounded-xl p-6 border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col items-center justify-center"
                  >
                    <div className="w-14 h-14 rounded-full bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center mb-3 transition-colors">
                      <svg className="w-8 h-8 text-emerald-500 group-hover:text-emerald-600 transition-colors" fill="none" viewBox="0 0 24 24">
                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth={1.5} />
                        <path stroke="currentColor" strokeLinecap="round" strokeWidth={1.5} d="M7 12h10M10 7v10M14 7v10" />
                      </svg>
                    </div>
                    <span className="font-medium text-slate-700 group-hover:text-slate-900">CSV</span>
                    <span className="text-xs text-slate-500 group-hover:text-slate-600">.csv</span>
                  </button>
                )}
                
                {resultFormat === 'topics' ? (
                  <button
                    onClick={() => handleSave('png')}
                    className="group bg-white rounded-xl p-6 border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col items-center justify-center"
                  >
                    <div className="w-14 h-14 rounded-full bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center mb-3 transition-colors">
                      <svg className="w-8 h-8 text-emerald-600 group-hover:text-emerald-700 transition-colors" fill="none" viewBox="0 0 24 24">
                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth={1.5} />
                        <path stroke="currentColor" strokeLinecap="round" strokeWidth={1.5} d="M3 16l5-5 4 4 5-5 4 4" />
                        <circle cx="15.5" cy="8.5" r="1.5" fill="currentColor" />
                      </svg>
                    </div>
                    <span className="font-medium text-slate-700 group-hover:text-slate-900">Image</span>
                    <span className="text-xs text-slate-500 group-hover:text-slate-600">.png</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleSave('xlsx')}
                    className="group bg-white rounded-xl p-6 border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col items-center justify-center"
                  >
                    <div className="w-14 h-14 rounded-full bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center mb-3 transition-colors">
                      <svg className="w-8 h-8 text-emerald-600 group-hover:text-emerald-700 transition-colors" fill="none" viewBox="0 0 24 24">
                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth={1.5} />
                        <path stroke="currentColor" strokeLinecap="round" strokeWidth={1.5} d="M7 12h10M10 7v10M14 7v10" />
                        <path stroke="currentColor" strokeLinecap="round" strokeWidth={1.5} d="M7 7h10" />
                      </svg>
                    </div>
                    <span className="font-medium text-slate-700 group-hover:text-slate-900">Excel</span>
                    <span className="text-xs text-slate-500 group-hover:text-slate-600">.xlsx</span>
                  </button>
                )}
              </div>
            </div>
            
            <div className="p-5 border-t border-slate-200 bg-white flex justify-between">
              <button
                onClick={() => handleGoogleDriveSave()}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-2 text-blue-600" viewBox="0 0 87.3 78" fill="none">
                  <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5l5.4 9.35z" fill="#0066da"/>
                  <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5l16.15-28z" fill="#00ac47"/>
                  <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
                  <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
                  <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
                  <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
                </svg>
                Save to Google Drive
              </button>
              
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

