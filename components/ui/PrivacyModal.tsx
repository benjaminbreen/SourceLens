// components/ui/PrivacyModal.tsx
// Privacy Policy modal component
// Outlines how user data is collected, used, and protected on the SourceLens platform

'use client';

import React from 'react';
import DocModal from './DocModal';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export default function PrivacyModal({ isOpen, onClose, isDarkMode }: PrivacyModalProps) {
  return (
    <DocModal
      isOpen={isOpen}
      onClose={onClose}
      title="Privacy Policy"
      slug="privacy"
      isDarkMode={isDarkMode}
    >
      <h3 className={`${isDarkMode ? 'text-indigo-300' : 'text-indigo-900'} text-2xl font-semibold mb-4`}>
        Privacy Policy
      </h3>
      
      <div className="space-y-6">
        <section>
          <h4 className={`text-lg font-medium ${isDarkMode ? 'text-amber-400' : 'text-indigo-800'} mb-2`}>
            1. Information We Collect
          </h4>
          <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            SourceLens collects information you provide directly to us when you create an account, upload content, or communicate with us. This may include your name, email address, and the content you upload for analysis.
          </p>
          <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mt-2`}>
            We also automatically collect certain information about your device and how you interact with our services, including IP address, browser type, and usage statistics.
          </p>
        </section>
        
        <section>
          <h4 className={`text-lg font-medium ${isDarkMode ? 'text-amber-400' : 'text-indigo-800'} mb-2`}>
            2. How We Use Your Information
          </h4>
          <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            We use the information we collect to:
          </p>
          <ul className={`list-disc pl-6 space-y-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            <li>Provide, maintain, and improve our services</li>
            <li>Personalize your experience and deliver content relevant to your interests</li>
            <li>Process and analyze documents you upload</li>
            <li>Communicate with you about our services, updates, and other information</li>
            <li>Monitor and analyze trends, usage, and activities in connection with our services</li>
            <li>Detect, investigate, and prevent security incidents and other malicious activities</li>
          </ul>
        </section>
        
        <section>
          <h4 className={`text-lg font-medium ${isDarkMode ? 'text-amber-400' : 'text-indigo-800'} mb-2`}>
            3. Sharing Your Information
          </h4>
          <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            We may share your information with:
          </p>
          <ul className={`list-disc pl-6 space-y-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            <li>Service providers who perform services on our behalf, such as cloud hosting providers</li>
            <li>Third-party AI and language model providers to process and analyze your content</li>
            <li>As required by law or to comply with legal process</li>
            <li>To protect the rights, property, or safety of SourceLens, our users, or the public</li>
          </ul>
          <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mt-2`}>
            We do not sell your personal information to third parties.
          </p>
        </section>
        
        <section>
          <h4 className={`text-lg font-medium ${isDarkMode ? 'text-amber-400' : 'text-indigo-800'} mb-2`}>
            4. Data Security
          </h4>
          <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            We implement appropriate technical and organizational measures to protect the security of your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
          </p>
        </section>
        
        <section>
          <h4 className={`text-lg font-medium ${isDarkMode ? 'text-amber-400' : 'text-indigo-800'} mb-2`}>
            5. Data Retention
          </h4>
          <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            We retain your personal information for as long as necessary to provide you with our services and for legitimate business purposes, such as maintaining the performance of our services, preventing fraud, meeting our legal obligations, resolving disputes, and enforcing our agreements.
          </p>
        </section>
        
        <section>
          <h4 className={`text-lg font-medium ${isDarkMode ? 'text-amber-400' : 'text-indigo-800'} mb-2`}>
            6. Your Rights
          </h4>
          <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            Depending on your location, you may have certain rights regarding your personal information, such as the right to access, correct, delete, or restrict processing of your data. To exercise these rights, please contact us at the email address provided below.
          </p>
        </section>
        
        <section>
          <h4 className={`text-lg font-medium ${isDarkMode ? 'text-amber-400' : 'text-indigo-800'} mb-2`}>
            7. Changes to This Privacy Policy
          </h4>
          <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the bottom. You are advised to review this Privacy Policy periodically for any changes.
          </p>
        </section>
        
        <section>
          <h4 className={`text-lg font-medium ${isDarkMode ? 'text-amber-400' : 'text-indigo-800'} mb-2`}>
            8. Contact Us
          </h4>
          <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            If you have any questions about this Privacy Policy, please contact us at bebreen@ucsc.edu.
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