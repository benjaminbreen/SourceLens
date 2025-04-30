// components/ui/TermsModal.tsx
// Terms of Service modal component
// Displays the legal terms and conditions for using the SourceLens platform

'use client';

import React from 'react';
import DocModal from './DocModal';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export default function TermsModal({ isOpen, onClose, isDarkMode }: TermsModalProps) {
  return (
    <DocModal
      isOpen={isOpen}
      onClose={onClose}
      title="Terms of Service"
      slug="terms"
      isDarkMode={isDarkMode}
    >
      <h3 className={`${isDarkMode ? 'text-indigo-300' : 'text-indigo-900'} text-2xl font-semibold mb-4`}>
        Terms of Service
      </h3>
      
      <div className="space-y-6">
        <section>
          <h4 className={`text-lg font-medium ${isDarkMode ? 'text-amber-400' : 'text-indigo-800'} mb-2`}>
            1. Acceptance of Terms
          </h4>
          <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            By accessing and using SourceLens, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>
        </section>
        
        <section>
          <h4 className={`text-lg font-medium ${isDarkMode ? 'text-amber-400' : 'text-indigo-800'} mb-2`}>
            2. Description of Service
          </h4>
          <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            SourceLens is an experimental tool for researchers who work with textual sources. It offers multiple analytical lenses to examine texts, helping uncover layers of meaning that might otherwise remain hidden. The service includes AI-powered analysis, document management, and research tools.
          </p>
        </section>
        
        <section>
          <h4 className={`text-lg font-medium ${isDarkMode ? 'text-amber-400' : 'text-indigo-800'} mb-2`}>
            3. User Accounts
          </h4>
          <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            Some features of SourceLens may require you to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
          </p>
        </section>
        
        <section>
          <h4 className={`text-lg font-medium ${isDarkMode ? 'text-amber-400' : 'text-indigo-800'} mb-2`}>
            4. User Content
          </h4>
          <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            You retain all rights to the content you upload to SourceLens. By uploading content, you grant us a non-exclusive, worldwide, royalty-free license to use, store, and process your content solely for the purpose of providing services to you. (In other words, anything you upload will remain private and available only to you unless you personally choose to share it - it will never be re-used in any other way).
          </p>
        </section>
        
        <section>
          <h4 className={`text-lg font-medium ${isDarkMode ? 'text-amber-400' : 'text-indigo-800'} mb-2`}>
            5. Prohibited Activities
          </h4>
          <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            You agree not to use SourceLens for any unlawful purpose or in any way that could damage, disable, overburden, or impair our service. Prohibited activities include, but are not limited to, distributing malware, scraping data, or attempting to gain unauthorized access to our systems.
          </p>
        </section>
        
        <section>
          <h4 className={`text-lg font-medium ${isDarkMode ? 'text-amber-400' : 'text-indigo-800'} mb-2`}>
            6. Intellectual Property
          </h4>
          <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            SourceLens and its original content, features, and functionality are owned by Benjamin Breen and are protected by copyright, trademark, and other intellectual property laws. The service includes open source components that are subject to their respective licenses.
          </p>
        </section>
        
        <section>
          <h4 className={`text-lg font-medium ${isDarkMode ? 'text-amber-400' : 'text-indigo-800'} mb-2`}>
            7. Limitation of Liability
          </h4>
          <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            SourceLens is provided "as is" without warranties of any kind. In no event shall we be liable for any damages arising from the use of our service, including but not limited to direct, indirect, incidental, or consequential damages.
          </p>
        </section>
        
        <section>
          <h4 className={`text-lg font-medium ${isDarkMode ? 'text-amber-400' : 'text-indigo-800'} mb-2`}>
            8. Changes to Terms
          </h4>
          <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            We reserve the right to modify these Terms at any time. We will provide notice of significant changes by updating the date at the top of these Terms and by maintaining a changelog. Your continued use of SourceLens after such modifications constitutes your acceptance of the revised Terms.
          </p>
        </section>
        
        <section>
          <h4 className={`text-lg font-medium ${isDarkMode ? 'text-amber-400' : 'text-indigo-800'} mb-2`}>
            9. Governing Law
          </h4>
          <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            These Terms shall be governed by the laws of the State of California, without regard to its conflict of law provisions. Any disputes relating to these Terms shall be subject to the exclusive jurisdiction of the courts in Santa Cruz County, California.
          </p>
        </section>
        
        <section>
          <h4 className={`text-lg font-medium ${isDarkMode ? 'text-amber-400' : 'text-indigo-800'} mb-2`}>
            10. Contact
          </h4>
          <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            If you have any questions about these Terms, please contact us at breen85@gmail.com.
          </p>
        </section>
      </div>
      
      <div className={`mt-8 p-4 rounded-lg ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-slate-50 border border-slate-200'}`}>
        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Last updated: April 2025
        </p>
      </div>
    </DocModal>
  );
}