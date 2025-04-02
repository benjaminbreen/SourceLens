// components/ui/EasterEggTerminal.tsx
// A playful terminal-like chat interface that always responds with "GOOD DAY, SIR."
import React, { useState, useRef, useEffect } from 'react';

interface EasterEggTerminalProps {
  onClose: () => void;
}

export default function EasterEggTerminal({ onClose }: EasterEggTerminalProps) {
  const [messages, setMessages] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    // Add user message
    const newMessages = [
      ...messages, 
      `> ${inputValue}`,
      'GOOD DAY, SIR.'
    ];

    setMessages(newMessages);
    setInputValue('');
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-md shadow-lg w-80 flex flex-col">
      {/* Header */}
      <div className="bg-slate-800 px-4 py-2 flex justify-between items-center border-b border-slate-700">
        <div className="flex items-center">
          <span className="text-cyan-400 font-mono text-xs mr-2">[SRC]</span>
          <h3 className="text-slate-200 font-mono text-sm">EASTER EGG TERMINAL</h3>
        </div>
        <button 
          onClick={onClose} 
          className="text-slate-400 hover:text-cyan-300 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages Container */}
      <div className="flex-grow overflow-y-auto p-4 space-y-2 bg-slate-900 font-mono text-green-400 text-xs">
        {messages.map((msg, index) => (
          <div key={index} className="break-words">
            {msg}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-700 bg-slate-800">
        <div className="flex">
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type something..."
            className="flex-grow bg-slate-900 text-green-400 font-mono text-xs p-2 rounded border border-slate-700 focus:outline-none focus:border-cyan-500"
          />
          <button 
            onClick={handleSendMessage}
            className="ml-2 bg-cyan-700 text-white font-mono text-xs px-3 py-2 rounded hover:bg-cyan-600 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}