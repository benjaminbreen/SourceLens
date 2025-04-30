// lib/docs-navigation.ts
// Navigation structure for the documentation
// Defines the sidebar categories and items

export const docsNavigation = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    items: [
      {
        title: 'Introduction',
        slug: 'getting-started/introduction',
      },
      {
        title: 'Quick Start',
        slug: 'getting-started/quick-start',
      },
    ],
  },
  {
    id: 'core-concepts',
    title: 'Core Concepts',
    items: [
      {
        title: 'Source Analysis',
        slug: 'core-concepts/source-analysis',
      },
      {
        title: 'Document Types',
        slug: 'core-concepts/document-types',
      },
  
      {
        title: 'Metadata',
        slug: 'core-concepts/metadata',
      },
    ],
  },
  {
    id: 'features',
    title: 'Features',
    items: [
      {
        title: 'Analysis Tools',
        slug: 'features/analysis-tools',
        children: [
          {
            title: 'Basic Analysis',
            slug: 'features/analysis-tools/basic-analysis',
          },
          {
            title: 'Detailed Analysis',
            slug: 'features/analysis-tools/detailed-analysis',
          },
          {
            title: 'Information Extraction',
            slug: 'features/analysis-tools/information-extraction',
          },
        ],
      },
      {
        title: 'Text Highlighting',
        slug: 'features/text-highlighting',
      },
      {
        title: 'References Suggestions',
        slug: 'features/references-suggestions',
      },
      {
        title: 'Simulation Mode',
        slug: 'features/simulation-mode',
      },
      {
        title: 'Counter-Narrative',
        slug: 'features/counter-narrative',
      },
    ],
  },
  {
    id: 'library-management',
    title: 'Library Management',
    items: [
      {
        title: 'Saved Sources',
        slug: 'library-management/saved-sources',
      },
      {
        title: 'References',
        slug: 'library-management/references',
      },
      {
        title: 'Analysis History',
        slug: 'library-management/analysis-history',
      },
      {
        title: 'Research Notes',
        slug: 'library-management/research-notes',
      },
      {
        title: 'Research Drafts',
        slug: 'library-management/research-drafts',
      },
    ],
  },
  {
    id: 'advanced-usage',
    title: 'Advanced Usage',
    items: [
      {
        title: 'Custom Perspectives',
        slug: 'advanced-usage/custom-perspectives',
      },
      {
        title: 'Model Selection',
        slug: 'advanced-usage/model-selection',
      },
      {
        title: 'Processing Large Documents',
        slug: 'advanced-usage/processing-large-documents',
      },
  
    ],
  },
];