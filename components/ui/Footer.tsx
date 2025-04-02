// components/ui/Footer.tsx
// Comprehensive footer with detailed legal modals, navigation sections, and sophisticated design
// Features responsive layout, multiple content sections, interactive modals, and subtle animations

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AboutModal from '@/components/ui/AboutModal';

// Enhanced Modal Component with tabs for complex content
const EnhancedModal = ({ 
  isOpen, 
  onClose, 
  title,
  tabs
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  title: string,
  tabs: {
    label: string;
    content: React.ReactNode;
  }[]
}) => {
  const [activeTab, setActiveTab] = useState(0);
  
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-indigo-600 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-white hover:text-slate-200 transition-colors rounded-full p-1 hover:bg-indigo-500"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Tabs navigation - only show if multiple tabs */}
        {tabs.length > 1 && (
          <div className="flex border-b border-slate-200 bg-slate-100">
            {tabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === index 
                    ? 'text-indigo-600 bg-white' 
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-white/50'
                }`}
              >
                {tab.label}
                {activeTab === index && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600"></div>
                )}
              </button>
            ))}
          </div>
        )}
        
        {/* Content area */}
        <div className="p-6 overflow-y-auto" style={{maxHeight: 'calc(85vh - 8rem)'}}>
          <div className="prose prose-slate max-w-none">
            {tabs[activeTab].content}
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end sticky bottom-0">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Newsletter subscription component
const NewsletterForm = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus('loading');
    
    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setEmail('');
      
      // Reset after 3 seconds
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="relative">
        <input 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email" 
          className="w-full px-3 py-2 bg-white/20 text-white placeholder:text-slate-300/70 rounded-md focus:ring-2 focus:ring-white/30 focus:outline-none text-sm backdrop-blur-sm border border-white/20"
          disabled={status === 'loading' || status === 'success'}
        />
        {status === 'loading' && (
          <div className="absolute right-3 top-2.5">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      
      <button 
        type="submit" 
        className={`w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          status === 'success'
            ? 'bg-green-600 text-white'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
        }`}
        disabled={status === 'loading' || status === 'success'}
      >
        {status === 'success' ? 'Subscribed!' : 'Subscribe'}
      </button>
      
      <p className="text-xs text-slate-300 mt-1">
        You'll receive only occasional updates about new features. Email storage is not currently set up. This is a placeholder.
      </p>
    </form>
  );
};

export default function Footer() {
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isFAQModalOpen, setIsFAQModalOpen] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className="relative py-12 mt-14">
        {/* Background image with overlay */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/splashbackground.jpg" 
            alt="Footer Background" 
            fill 
            className="object-cover" 
            priority={false}
          />
          {/* Enhanced gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/95 via-slate-800/95 to-slate-900/95"></div>
        </div>
        
        {/* Decorative top wave */}
        <div className="absolute top-0 left-0 right-0 transform -translate-y-full h-16 overflow-hidden z-10">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-auto text-slate-900 fill-current opacity-95">
            <path d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,133.3C672,139,768,181,864,181.3C960,181,1056,139,1152,122.7C1248,107,1344,117,1392,122.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
        
        {/* Footer content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Logo & About Section */}
          <div className="md:col-span-5 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-4">
              <Image 
                src="/sourcelenslogo.png" 
                alt="SourceLens Logo" 
                width={50} 
                height={50} 
                className="rounded-full border border-indigo-400/30 shadow-lg shadow-indigo-500/10" 
              />
              <h2 className="ml-3 text-2xl font-bold text-white">SourceLens</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-slate-300 text-md leading-relaxed">
                Built for scholars and professional researchers, SourceLens is an experiment in how AI models can <em>augment</em>, not replace, human curiosity and knowledge.
              </p>
              <p className="text-slate-300 text-sm leading-relaxed">
                SourceLens is an experimental, LLM-based research platform intended to help you see sources from different perspectives. It is based on a simple premise. Rather than treating AI as either an all-powerful oracle or a disastrous mistake, what if we approached it as a naive, odd, but multi-talented research assistant?
              </p>
              
              {/* Social links */}
              <div className="flex items-center justify-center md:justify-start space-x-4 pt-2">
                <a 
                  href="https://github.com/yourusername/sourcelens" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-slate-300 hover:text-white transition-colors"
                  aria-label="GitHub"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
                
              </div>
            </div>
          </div>
          
          {/* Links Section */}
          <div className="md:col-span-3 text-center md:text-left">
            <h3 className="text-white text-lg font-bold mb-4 border-b border-slate-700/50 pb-2">Navigation</h3>
            <div className="space-y-2.5">
              <Link href="/" className="block text-slate-300 hover:text-white text-sm transition-colors">
                Home
              </Link>
              <Link href="/analysis" className="block text-slate-300 hover:text-white text-sm transition-colors">
                Analysis Dashboard
              </Link>
              <Link href="/library" className="block text-slate-300 hover:text-white text-sm transition-colors">
                Library
              </Link>
              <button 
                onClick={() => setIsFAQModalOpen(true)}
                className="text-slate-300 hover:text-white text-sm transition-colors text-left w-full"
              >
                FAQ & Help
              </button>
              <button 
                onClick={() => setShowAboutModal(true)}
                className="text-slate-300 hover:text-white text-sm transition-colors text-left w-full"
              >
                About the Project
              </button>
            </div>
          </div>
          
          {/* More Info Section */}
          <div className="md:col-span-2 text-center md:text-left">
            <h3 className="text-white text-xl font-bold mb-4 border-b border-slate-700/50 pb-2">More info</h3>
            <div className="space-y-2.5">
              <button 
                onClick={() => setIsPrivacyModalOpen(true)}
                className="text-slate-300 hover:text-white text-sm transition-colors text-left w-full"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => setIsTermsModalOpen(true)}
                className="text-slate-300 hover:text-white text-sm transition-colors text-left w-full"
              >
                Terms of Service
              </button>
              
             
            </div>
          </div>
          
          {/* Newsletter & Contact */}
          <div className="md:col-span-2 text-center md:text-left">
            <h3 className="text-white text-lg font-bold mb-4 border-b border-slate-700/50 pb-2">Stay Updated</h3>
            <NewsletterForm />
            
            <div className="mt-6">
              <h4 className="text-white text-sm font-semibold mb-2">Contact</h4>
              <a 
                href="mailto:bebreen@ucsc.edu" 
                className="flex items-center text-slate-300 hover:text-white text-sm transition-colors hover:underline decoration-slate-400"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                bebreen@ucsc.edu
              </a>
            </div>
          </div>
        </div>
        
        {/* Copyright Section */}
        <div className="relative z-10 mt-12 pt-8 border-t border-slate-700/50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-400 text-sm">
            © {currentYear} Benjamin Breen • Made in Santa Cruz, California
          </p>
          <p className="text-slate-500 text-xs mt-2">
            SourceLens is designed exclusively for use with public domain historical sources and for academic research purposes.
          </p>
        </div>
      </footer>

      {/* Enhanced Modals */}
      <EnhancedModal 
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        title="Terms of Service"
        tabs={[
          {
            label: "Summary",
            content: (
              <>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Terms of Service</h3>
                <p className="text-base font-medium mb-4 text-slate-700">
                  SourceLens is an experimental research tool designed for academic and educational use only. By using this service, you acknowledge and agree to the following terms:
                </p>
          
                <ul className="space-y-2 my-4 ml-5 list-disc text-slate-600">
                  <li>The tool is intended for scholarly research, educational purposes, and analysis of public domain materials only</li>
                  <li>AI-generated content should be critically evaluated and not taken as authoritative</li>
                  <li>No warranty is provided for the accuracy or reliability of generated content</li>
                  <li>Users are responsible for validating any insights or conclusions drawn from the tool</li>
                </ul>
              </>
            )
          },
          {
            label: "Usage Rights",
            content: (
              <>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Usage Rights & Limitations</h3>
                <p className="mb-4 text-slate-700">SourceLens grants you a limited, non-exclusive, non-transferable right to access and use the Service for personal, non-commercial research and educational purposes, subject to these Terms.</p>
                
                <h4 className="text-lg font-semibold text-slate-800 mt-6 mb-3">Acceptable Use</h4>
                <p className="mb-2 text-slate-700">You agree to use SourceLens only for:</p>
                <ul className="space-y-1 my-3 ml-5 list-disc text-slate-600">
                  <li>Academic research and scholarly inquiry</li>
                  <li>Educational purposes in academic settings</li>
                  <li>Personal learning and exploration of historical materials</li>
                  <li>Analysis of public domain content or content you have rights to analyze</li>
                </ul>
                
                <h4 className="text-lg font-semibold text-slate-800 mt-6 mb-3">Prohibited Uses</h4>
                <p className="mb-2 text-slate-700">You may not use SourceLens for:</p>
                <ul className="space-y-1 my-3 ml-5 list-disc text-slate-600">
                  <li>Commercial purposes without explicit permission</li>
                  <li>Generating content to be presented as factual without human verification</li>
                  <li>Creating misleading, deceptive, or harmful content</li>
                  <li>Any purpose that violates applicable laws or regulations</li>
                  <li>Uploading copyrighted materials without proper authorization</li>
                </ul>
              </>
            )
          },
          {
            label: "Liability",
            content: (
              <>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Disclaimers & Limitations of Liability</h3>
                <p className="mb-4 text-slate-700">SourceLens is provided "as is" and "as available" without warranties of any kind, either express or implied.</p>
                
                <h4 className="text-lg font-semibold text-slate-800 mt-6 mb-3">No Warranty</h4>
                <p className="mb-2 text-slate-700">We explicitly disclaim all warranties, including but not limited to:</p>
                <ul className="space-y-1 my-3 ml-5 list-disc text-slate-600">
                  <li>Accuracy or completeness of any analysis or generated content</li>
                  <li>Reliability or availability of the service</li>
                  <li>Fitness for any particular purpose</li>
                  <li>Non-infringement of third-party rights</li>
                </ul>
                
                <h4 className="text-lg font-semibold text-slate-800 mt-6 mb-3">Limitation of Liability</h4>
                <p className="mb-2 text-slate-700">To the maximum extent permitted by law, we shall not be liable for:</p>
                <ul className="space-y-1 my-3 ml-5 list-disc text-slate-600">
                  <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                  <li>Loss of profits, data, or goodwill</li>
                  <li>Cost of procurement of substitute goods or services</li>
                  <li>Any damages arising from your use of or inability to use the service</li>
                </ul>
                
                <p className="mt-4 text-slate-700">You acknowledge that AI-generated content may contain inaccuracies or errors, and you are solely responsible for critically evaluating and verifying any information or insights derived from SourceLens.</p>
              </>
            )
          },
          {
            label: "Updates",
            content: (
              <>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Terms Updates & Modifications</h3>
                <p className="mb-4 text-slate-700">
                  We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting to the Service. Your continued use of SourceLens after any changes constitutes your acceptance of the revised Terms.
                </p>
                
                <h4 className="text-lg font-semibold text-slate-800 mt-6 mb-3">Notification of Changes</h4>
                <p className="mb-2 text-slate-700">
                  We will make reasonable efforts to notify users of significant changes to these Terms through:
                </p>
                <ul className="space-y-1 my-3 ml-5 list-disc text-slate-600">
                  <li>Notices within the SourceLens interface</li>
                  <li>Updates to the "Last Updated" date at the top of the Terms</li>
                  <li>Email notifications to registered users (when applicable)</li>
                </ul>
                
                <p className="mt-6 text-slate-600 italic">
                  Last Updated: March 31, 2025
                </p>
              </>
            )
          }
        ]}
      />

      <EnhancedModal 
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        title="Privacy Policy"
        tabs={[
          {
            label: "Overview",
            content: (
              <>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Privacy Policy Overview</h3>
                <p className="text-lg font-medium mb-4 text-slate-700">SourceLens does not currently store user data in any way. I am working on user log-in and authentication, and when developed, this will entail the storing of cookies and other user-specific info. </p>
                
    
                
                <p className="mb-4 text-slate-700">SourceLens will never share or sell any such data with third parties, and will be as minimalist as possible about what it stores.</p>
                
                <div className="bg-slate-100 p-5 rounded-md mt-6 border border-slate-200">
                  <h4 className="text-base font-semibold text-slate-800 mb-2">Key Points:</h4>
                  <ul className="space-y-2 mt-2 ml-2 text-slate-700">
                    <li>• This site will collect minimal user data necessary for providing the service</li>
                    <li>• We do not sell or share your personal information with third parties</li>
                    <li>• You retain ownership of your uploaded content</li>
                  </ul>
                </div>
              </>
            )
          },
          {
            label: "Data Collection",
            content: (
              <>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Information We Collect</h3>
                <p className="mb-4 text-slate-700">SourceLens does not currently collect any information about users. All info is saved locally in your browser and is not sent to any other party.</p>
                
                <h4 className="text-lg font-semibold text-slate-800 mt-6 mb-3">In the future, SourceLens will store the following via AWS or a similar cloud provider:</h4>
                <ul className="space-y-1 my-3 ml-5 list-disc text-slate-600">
                  <li>Documents and text you upload for analysis</li>
                  <li>Metadata you provide about these documents</li>
                  <li>Analysis results and generated content</li>
                </ul>
                
                <h4 className="text-lg font-semibold text-slate-800 mt-6 mb-3">It will also store:</h4>
                <ul className="space-y-1 my-3 ml-5 list-disc text-slate-600">
                  <li>Interactions with the application</li>
                  <li>Error logs and performance data</li>
                  <li>Email address (if you subscribe to our newsletter)</li>
                </ul>
                
              </>
            )
          },
          
         
        ]}
      />

      <EnhancedModal 
        isOpen={isFAQModalOpen}
        onClose={() => setIsFAQModalOpen(false)}
        title="Frequently Asked Questions"
        tabs={[
          {
            label: "General",
            content: (
              <>
                       <h3 className="text-xl font-bold text-slate-800 mb-4">Frequently Asked Questions</h3>
                
                <h4 className="mt-4 text-lg font-semibold ">What is SourceLens?</h4>
                <p>
                  SourceLens is an experimental academic research tool that uses AI to analyze primary source documents 
                  through multiple interpretive lenses. It helps researchers discover new perspectives, connections, and 
                  insights about historical texts.
                </p>
                
                <h4 className="mt-4 text-lg font-semibold ">Who is SourceLens for?</h4>
                <p>
                  SourceLens is designed primarily for historians, researchers, students, and educators working with 
                  primary source documents. It's particularly useful for those studying historical texts, archival materials, 
                  and cultural artifacts.
                </p>
                
                <h4 className="mt-4 text-lg font-semibold ">Is SourceLens free to use?</h4>
                <p>
                  Yes, SourceLens is currently free for academic and research purposes. Someday, I plan to offer it as a "freemium" model with the current version available free, and a more advanced version with persistent storage of analyses and sources (and the better quality/more expensive LLM models) available for a monthly subscription fee. 
                </p>
                
                <h4 className="mt-4 text-lg font-semibold">Who created SourceLens?</h4>
                <p>
                  SourceLens was developed by Benjamin Breen, Associate Professor of History at UC Santa Cruz, 
                  as an outgrowth of writing about AI and history at <a href="https://resobscura.substack.com/t/ai" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 underline">Res Obscura</a>.
                </p>
                
                <h4 className="mt-4 text-lg font-semibold">What file types does SourceLens support?</h4>
                <p>
                  SourceLens currently supports plain text (.txt), PDF documents, and images (.jpg, .png). The tool 
                  can extract text from PDFs and images using OCR technology, though the quality may vary based on 
                  the original document.
                </p>
              </>
            )
          },
          {
            label: "Usage",
            content: (
              <>
                
                <h4 className="mt-4 text-lg font-semibold">How do I upload a document?</h4>
                <p>
                  From the home page, click "Start Analysis" or navigate to the Analysis Dashboard. You can upload a document 
                  by dragging and dropping a file or clicking the upload area to browse your files. Once uploaded, you'll 
                  be prompted to add metadata about your source.
                </p>
                
                <h4 className="mt-4 text-lg font-semibold">What metadata should I provide?</h4>
                <p>
                  Metadata is provided automatically by an LLM. For best results, double check this and try to include as much context as possible about your document:
                </p>
                
                <h4 className="mt-4 text-lg font-semibold">What are the different analysis types?</h4>
                <p>
                  SourceLens offers several types of analysis:
                </p>

                <ul>
                  <li><strong>Initial Analysis:</strong> A quick overview of the source context, author perspective, and key themes</li>
                  <li><strong>Detailed Analysis:</strong> An in-depth examination exploring context, author perspective, themes, evidence, and significance</li>
                  <li><strong>Counter-Narrative:</strong> Alternative interpretations that challenge conventional readings</li>
                  <li><strong>References:</strong> Suggested scholarly sources for further research</li>
                  <li><strong>Author Roleplay:</strong> A simulated conversation with the document's author</li>
                </ul>
                
                <h4 className="mt-4 text-lg font-semibold">Can I save my analyses?</h4>
                <p>
                  Yes, you can save analyses to your Research Library using the "Save to Library" button. Your library 
                  is stored locally in your browser, so you can return to previous work without re-uploading.
                </p>
              </>
            )
          },
          {
            label: "Technical",
            content: (
              <>

                <h4 className="mt-4 text-lg font-semibold">Which AI models does SourceLens use?</h4>
                <p>
                  SourceLens can use several AI models, including:
                </p>
                <ul>
                  <li>Claude 3.7 Sonnet and Claude 3.5 Haiku (Anthropic)</li>
                  <li>GPT-4o, GPT-4.5, and GPT-4o Mini (OpenAI)</li>
                  <li>Gemini 2.0 Flash and Flash Lite (Google)</li>
                </ul>
                <p>
                  Flash Line is the default. You can select your preferred model from the model selector in the interface.
                </p>
                
                <h4 className="mt-4 text-lg font-semibold">Is my data private and secure?</h4>
                <p>
                  Yes. SourceLens is designed with privacy in mind. No cookies or other user data is stored. See the Privacy page for more info.
                </p>
                
                
                <h4 className="mt-4 text-lg font-semibold">Are there document size limits?</h4>
                <p>
                  Yes. Current limits are:
                </p>
                <ul>
                  <li>Text files: Up to 1MB</li>
                  <li>PDFs: Up to 20MB and 400 pages</li>
                  <li>Images: Up to 5MB</li>
                </ul>
        
                
                <h4 className="mt-4 text-lg font-semibold">Does SourceLens work offline?</h4>
                <p>
                  No, SourceLens requires an internet connection to function as it relies on cloud-based AI models for analysis. Someday, however, this sort of thing may be achievable via open source models running locally. That would be pretty cool! 
                </p>
              
              </>
            )
          },
          {
            label: "Research",
            content: (
              <>

                
                <h4 className="mt-4 text-lg font-semibold">How should I use AI in my research?</h4>
                <p>
                  SourceLens was created to help explore this question. I can't answer it for you. What I can say is that I am certain there is a far more interesting middle ground between condemning any use of LLMs as cheating, on the one hand, and embracing a world of AI-created nonsense, on the other. The creative path lies between these two. 
                </p>
                
                <h4 className="mt-4 text-lg font-semibold">How accurate is the information SourceLens provides?</h4>
                <p>
                  It really depends. Always verify key facts, references, and quotations independently. SourceLens 
                  is designed to augment, not replace, traditional research methodologies.
                </p>
                
                <h4 className="mt-4 text-lg font-semibold">How should I cite analyses from SourceLens?</h4>
                <p>
                  Good question! Perhaps a footnote mentioning use of the tool, something like: 
                </p>
                <div className="bg-slate-100 p-4 rounded-md mt-2">
                  <p className="font-mono text-sm">
                    Analysis of [Primary Source] was assisted by SourceLens (AI research tool), [Date of analysis], [URL]. 
                  </p>
                </div>
                <p className="mt-2">
                  Remember that you, as the researcher, are responsible for critically evaluating and building upon the AI-generated insights.
                </p>
                
                <h4 className="mt-4 text-lg font-semibold">What are the limitations of SourceLens for humanistic research?</h4>
              
                <ul>
                  <li>• AI models may reproduce biases present in their training data</li>
                  <li>• Models don't have access to all historical records and specialized archives</li>
                  <li>• They cannot perform original archival research or physical document analysis (that's why we still need historians and archivists!) </li>
                  <li>• AI may occasionally hallucinate or non-existent references</li>
                </ul>
              </>
            )
          }
        ]}
      />

      <AboutModal 
        isOpen={showAboutModal} 
        onClose={() => setShowAboutModal(false)} 
      />
           
    </>
  );
}