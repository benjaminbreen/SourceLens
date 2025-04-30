// components/ui/FeatureCardsBottom.tsx
// Elegant Feature Cards section for the bottom of the landing page
// With scroll-triggered animations and improved responsive design
// Updated with specific documentation section links for each feature

'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface FeatureCardProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
  bgColor: string;
  hoverBgColor: string;
  glowColor: string;
  docUrl: string; // Main doc link
  learnMoreText?: string; // Optional custom text for the learn more link
}

const features: FeatureCardProps[] = [
  {
    id: 'basic-analysis',
    title: 'Basic Analysis',
    description: 'Quick summary and analysis of your source document.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    color: 'text-indigo-300',
    borderColor: 'border-indigo-800/30',
    bgColor: 'bg-indigo-950/30',
    hoverBgColor: 'hover:bg-indigo-900/40',
    glowColor: 'indigo-500',
    docUrl: '/docs?slug=features/analysis-tools/basic-analysis',
  },
  {
    id: 'detailed-analysis',
    title: 'Detailed Analysis',
    description: 'Essay-length summary with customizable sections.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    color: 'text-sky-300',
    borderColor: 'border-sky-800/30',
    bgColor: 'bg-sky-950/30',
    hoverBgColor: 'hover:bg-sky-900/40',
    glowColor: 'sky-500',
    docUrl: '/docs?slug=features/analysis-tools/detailed-analysis#what-is-detailed-analysis',
  },
  {
    id: 'extract-info',
    title: 'Extract Information',
    description: 'Create structured tables or lists from your source.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M19 13l-4 4m0 0l-4-4m4 4V7" />
      </svg>
    ),
    color: 'text-emerald-300',
    borderColor: 'border-emerald-800/30',
    bgColor: 'bg-emerald-950/30',
    hoverBgColor: 'hover:bg-emerald-900/40',
    glowColor: 'emerald',
    docUrl: '/docs?slug=features/analysis-tools/information-extraction#extraction-types',
  },
  {
    id: 'references',
    title: 'Suggest References',
    description: 'Get ranked suggestions for relevant citations.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    color: 'text-rose-300',
    borderColor: 'border-rose-800/30',
    bgColor: 'bg-rose-950/30',
    hoverBgColor: 'hover:bg-rose-900/40',
    glowColor: 'rose',
    docUrl: '/docs?slug=features/references-suggestions#reference-categories',
  },
  {
    id: 'counter',
    title: 'Counter-Narrative',
    description: 'Explore alternative perspectives on your source.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7h12m0 0l-4-4m4 4l-4 4m-4 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
    color: 'text-purple-300',
    borderColor: 'border-purple-800/30',
    bgColor: 'bg-purple-950/30',
    hoverBgColor: 'hover:bg-purple-900/40',
    glowColor: 'purple',
    docUrl: '/docs?slug=features/counter-narrative#types-of-counter-narratives',
  },
  {
    id: 'translate',
    title: 'Translate',
    description: 'Translate your source with custom annotations.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10m-11.048-2.5A18.022 18.022 0 0110 8.6" />
      </svg>
    ),
    color: 'text-cyan-300',
    borderColor: 'border-cyan-800/30',
    bgColor: 'bg-cyan-950/30',
    hoverBgColor: 'hover:bg-cyan-900/40',
    glowColor: 'cyan',
    docUrl: '/docs?slug=features/translation-tools', // This will need to be created
    learnMoreText: 'Coming Soon',
  },
  {
    id: 'connections',
    title: 'Connections',
    description: 'Visualize networks and relationships in your research.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'text-orange-300',
    borderColor: 'border-orange-800/30',
    bgColor: 'bg-orange-950/30',
    hoverBgColor: 'hover:bg-orange-900/40',
    glowColor: 'orange',
    docUrl: '/docs?slug=advanced-usage/connection-visualization', // This will need to be created
    learnMoreText: 'Coming Soon',
  },
  {
    id: 'highlight',
    title: 'Highlight',
    description: 'Identify passages relevant to specific topics.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
    color: 'text-yellow-300',
    borderColor: 'border-yellow-800/30',
    bgColor: 'bg-yellow-950/30',
    hoverBgColor: 'hover:bg-yellow-900/40',
    glowColor: 'yellow',
    docUrl: '/docs?slug=features/text-highlighting#highlight-criteria-examples',
  },
  {
    id: 'roleplay',
    title: 'Simulation Mode',
    description: 'Engage in simulated conversations with the source author.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.4994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
      </svg>
    ),
    color: 'text-blue-300',
    borderColor: 'border-blue-800/30',
    bgColor: 'bg-blue-950/30',
    hoverBgColor: 'hover:bg-blue-900/40',
    glowColor: 'blue',
    docUrl: '/docs?slug=features/simulation-mode#best-practices',
  },
];

// Define custom animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
      duration: 0.5
    }
  }
};

export default function FeatureCardsBottom() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  // Ref for the title
  const [titleRef, titleInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <div className="max-w-7xl mx-auto px-4 pt-14 pb-24">
      {/* Animated Title */}
      <motion.h2 
        ref={titleRef}
        initial={{ opacity: 0, y: 20 }}
        animate={titleInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-2xl font-semibold text-indigo-50 text-center mb-12"
      >
        Complete set of features
      </motion.h2>
      
      {/* Animated Grid Container */}
      <motion.div 
        ref={ref}
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10"
      >
        {features.map((feature) => (
          <motion.div key={feature.id} variants={cardVariants}>
            <Link
              href={feature.docUrl}
              className={`
                group p-6 rounded-xl bg-slate-950/30 hover:bg-slate-950/80 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/50 hover:shadow-xl border ${feature.borderColor} 
                backdrop-blur-sm transition-all duration-500
                flex flex-col h-full hover:scale-[1.03] hover:-translate-y-1
                relative overflow-hidden
              `}
            >
              {/* Subtle Glow Effect on Hover */}
              <div className={`absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-600/5 transition-all duration-1000 rounded-xl opacity-0 group-hover:opacity-100`}></div>
              
              {/* Top Gradient Bar */}
              <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500/40 via-${feature.glowColor}-400/50 to-indigo-500/40 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out`}></div>
              
              {/* Card Header */}
              <div className="flex items-start mb-4 relative z-10">
                <div className={`p-2.5 rounded-lg ${feature.bgColor} mr-3 border ${feature.borderColor} shadow-md backdrop-blur-xl group-hover:shadow-${feature.glowColor}-500/10 transition-all duration-500`}>
                  <span className={`${feature.color} group-hover:text-${feature.glowColor}-200 transition-colors duration-500`}>{feature.icon}</span>
                </div>
                <h3 className={`font-medium text-lg ${feature.color} group-hover:brightness-120 transition-colors duration-500`}>
                  {feature.title}
                </h3>
              </div>
              
              {/* Card Description */}
              <p className="text-slate-300 flex-grow text-[15px] leading-relaxed">{feature.description}</p>
              
              {/* Learn More Button */}
              <div className="mt-5 text-sm flex items-center font-medium text-slate-400 group-hover:text-white transition-colors duration-500">
                <span className="uppercase tracking-wide">{feature.learnMoreText || 'Learn more'}</span>
                <svg className="w-4 h-4 ml-1.5 transform group-hover:translate-x-1.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}