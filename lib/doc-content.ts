// lib/doc-content.ts
// Client-side storage for documentation content
// This provides all documentation pages for the SourceLens app without requiring server file access
// Allows for simple deployment on Vercel or other static hosting platforms

// Getting Started
export const INTRODUCTION_MDX = `---
title: Introduction to SourceLens
lastUpdated: '2025-04-28'
---
<Screenshot src="sourcelenssmall.jpg" alt="Welcome!" />

SourceLens is a powerful AI-driven research tool (very much in beta right now - it is experimental and many features are not working) that is designed to help researchers, students, and historians analyze primary sources with deeper insights and context. By leveraging advanced Large Language Models, SourceLens provides multifaceted analysis, contextual information, reference suggestions, and interactive features to enhance document understanding.

## What is SourceLens?

SourceLens enables you to:

- Analyze, translate, and summarize text, PDF, image, and (eventually) audio sources with AI assistance
- Extract key themes, context, and significance from historical documents and other primary sources
- Generate reference suggestions for further research
- Highlight specific segments of text based on custom criteria
- Engage in simulated conversations with the author of a given document (this is an experimental feature intended to encourage empathy and perspective-taking - all conversations should be taken with a very large grain of salt and viewed critically and skeptically, not naively )
- Create and maintain a research library with saved sources and analyses

<Info>
  SourceLens is designed to assist researchers, not replace critical thinking. All AI-generated analyses should be critically evaluated and verified against established scholarly sources.
</Info>

## Key Features

### Comprehensive Analysis

SourceLens breaks down documents and provides analyses at multiple levels:

1. **Basic Analysis** - Quick overview of the source with key themes and suggested follow-up questions
2. **Detailed Analysis** - In-depth examination including historical context, author perspective, themes, evidence, and significance
3. **Information Extraction** - Pull out specific information like dates, people, locations, and events

### Interactive Tools

Beyond analysis, SourceLens offers interactive features:

- **Text Highlighting** - Highlight sections of text based on specific criteria
- **Reference Suggestions** - Get scholarly reference recommendations related to your source
- **Simulation Mode** - Engage in a simulated conversation with the author 
- **Counter-Narrative** - Explore alternative perspectives or interpretations

### Research Management

SourceLens helps you organize your research:

- **Saved Sources** - Store your primary sources for future reference
- **Analysis History** - Keep track of previous analyses
- **Research Notes** - Create and manage notes related to your sources
- **Research Drafts** - Develop drafts based on your research

## Getting Started

To begin using SourceLens, see the [Quick Start Guide](/docs?slug=getting-started/quick-start) for step-by-step instructions on setting up and using the basic features of the application.

<Warning>
  SourceLens is currently in a free beta version, since this is an experimental, personal project I've developed for my own use, and have decided to share with colleagues and students. However, hosting and the generative AI API calls do cost money. If there's interest, I will make the project sustainable by offering free and paid tiers.
</Warning>

## System Requirements

SourceLens works in any modern web browser and does not require any special hardware. 

- A modern browser (Chrome, Firefox, Safari, or Edge)
- Stable internet connection
- that's it! 
`;

export const QUICK_START_MDX = `---
title: Quick Start Guide
lastUpdated: '2025-04-28'
---



This guide will walk you through the basic steps to start using SourceLens for your research.

## Step 1: Upload or Enter Your Source

You can add a source document to SourceLens in several ways:

1. **Text Entry**: Paste text directly into the text input area
2. **File Upload**: Upload PDF, image (JPG, PNG, etc.), or text files
3. **Audio Upload**: Upload audio files for transcription and analysis (not yet implemented)

To upload a file:
- Click the "File Upload" tab in the source input section
- Drag and drop your file or click to browse your files
- Wait for the file to be processed (larger files may take longer)

<Info>
  For image and PDF files, SourceLens uses OCR (Optical Character Recognition) to extract text. The quality of the extraction depends on the clarity of the original document.
</Info>

## Step 2: Enter Metadata

After uploading your source, metadata will be automatically offered, but you can correct and augment it to improve analysis quality. Key things to ensure you get right: 

- **Date**: When the document was created (year, specific date, or approximate period)
- **Author**: Who created the document
- **Research Goals** (optional): What you're trying to learn from this source

The more accurate metadata you provide, the more contextually relevant your analysis will be.

## Step 3: Generate Basic Analysis

With your source and metadata ready, you can click the "Analyze Source" button which produces a Basic Analysis performed by the AI.

1. Basic analysis is designed to orient you and give you a top level summary. 
2. It shouldn't take very long - between 2 and 5 seconds is about average. 
3. Note the suggested follow-up questions. If you click one, it is automatically entered into the chat window and receives a response from the chosen language model. 

This initial analysis gives you a quick overview of your document and identifies key themes.

<Screenshot src="basic-analysis.png" alt="The Basic Analysis lens is the default for when a source is uploaded." />

## Step 4: Explore Advanced Features

From the basic analysis, you can explore more features:

- **Detailed Analysis**: Get an in-depth breakdown of context, themes, and significance
- **Extract Information**: Pull out specific data points like names, dates, and events
- **Suggest References**: Get scholarly reference recommendations
- **Text Highlighting**: Highlight specific passages based on your criteria
- **Simulation Mode**: Have a conversation with a simulation of the document's author

## Step 5: Save Your Work

Don't lose your research:

- **Save to Library**: Click the "Save to Library" button to store your source and analysis
- **Add Notes**: Create research notes associated with your document
- **Export**: Export your analysis as a PDF or text file for use in other applications

## Next Steps

Now that you're familiar with the basics, explore these resources to deepen your SourceLens skills:

- [Source Analysis](/docs?slug=core-concepts/source-analysis) - Learn about the analysis process
- [Document Types](/docs?slug=core-concepts/document-types) - Understand how different file types are processed
- [Detailed Analysis](/docs?slug=features/analysis-tools/detailed-analysis) - Discover the power of in-depth analysis

<Warning>
  Remember that AI analysis should complement, not replace, your critical thinking. Always verify important insights and use SourceLens as a tool to enhance your research process.
</Warning>
`;

// Core Concepts
export const SOURCE_ANALYSIS_MDX = `---
title: Source Analysis
lastUpdated: '2025-04-28'
---


Source analysis is the core functionality of SourceLens, using AI to examine primary source documents and extract meaningful insights.

## How Source Analysis Works

When you submit a document to SourceLens, the system processes it through these steps:

1. **Text Extraction**: Converting your document (text, PDF, image, or audio) into plain text
2. **Metadata Integration**: Combining your document with provided metadata
3. **AI Processing**: Analyzing the text using selected LLM models
4. **Result Formatting**: Organizing the insights into structured, readable sections

The analysis is contextual, meaning it considers the time period, authorship, and your research goals to provide relevant insights.

## Analysis Modes

SourceLens offers several analysis modes that serve different research needs:

### Basic Analysis

Provides a quick overview including:
- **Summary**: A concise overview of the document
- **Analysis**: Initial observations about themes and content
- **Follow-up Questions**: Suggested questions to deepen your understanding

This is the fastest analysis mode and serves as an entry point to more detailed examinations.

### Detailed Analysis

Offers comprehensive insights organized into sections:
- **Context**: Historical background and setting
- **Author Perspective**: Information about the author's viewpoint
- **Key Themes**: Major topics and ideas in the document
- **Evidence & Rhetoric**: Analysis of argumentative structure and evidence
- **Significance**: Historical importance and relevance
- **References**: Suggested scholarly sources

### Information Extraction

Focuses on pulling specific data points from the text:
- Named entities (people, places, organizations)
- Dates and time references
- Events and actions
- Relationships between entities
- Statistical or numerical data

## Model Selection

SourceLens allows you to choose different AI models for your analysis:

- **Claude Models**: Excellent for nuanced historical and literary analysis
- **GPT Models**: Strong general-purpose analysis with good contextual understanding
- **Gemini Models**: Particularly effective for processing very large documents

Each model has different strengths, and you may want to experiment with different models for different types of sources.

<Info>
  More specialized models often produce better results for certain document types. For example, Claude models often excel at analyzing historical texts with complex language.
</Info>

## Analysis Perspectives

You can guide the analysis by specifying a perspective or approach:

- **Default**: Balanced, comprehensive analysis
- **Historical**: Focus on historical context and development
- **Literary**: Emphasis on literary devices and textual analysis
- **Custom**: Define your own analytical framework

Custom perspectives can significantly influence the analysis direction and are useful for specialized research questions.

## Limitations and Best Practices

For optimal results, keep these guidelines in mind:

- **Document Quality**: Clearer text produces better analysis; OCR errors can affect quality
- **Accurate Metadata**: Provide precise information about author and date when possible
- **Reasonable Length**: Very long documents may need to be broken into sections
- **Critical Evaluation**: Always critically assess AI-generated analysis
- **Multiple Models**: Try different models for alternative perspectives

Remember that AI analysis is a starting point for your research, not a replacement for scholarly judgment.

## Next Steps

To learn more about specific analysis features, explore these guides:

- [Basic Analysis](/docs?slug=features/analysis-tools/basic-analysis)
- [Detailed Analysis](/docs?slug=features/analysis-tools/detailed-analysis)
- [Information Extraction](/docs?slug=features/analysis-tools/information-extraction)
`;

export const DOCUMENT_TYPES_MDX = `---
title: Document Types
lastUpdated: '2025-04-28'
---


SourceLens supports multiple document types to accommodate various research materials. Each type is processed differently to optimize text extraction and analysis.

## Supported File Types

### Text Documents

**Formats**: Plain text (.txt), pasted text

**Processing**: Text documents are used directly without additional processing. This provides the most accurate basis for analysis since no conversion is needed.

**Best for**: Essays, articles, transcribed speeches, typed manuscripts

**Tips**: 
- Use UTF-8 encoding when possible
- Preserve paragraph breaks for better structural analysis
- Remove extraneous headers, page numbers, or footnotes for cleaner analysis

### PDF Documents

**Formats**: PDF files (.pdf)

**Processing**: PDFs undergo text extraction, with fallback to OCR (Optical Character Recognition) for scanned documents.

**Best for**: Academic papers, books, reports, official documents

**Tips**: 
- Text-based PDFs (rather than scanned images) provide better extraction quality
- Multi-column layouts may affect text extraction order
- Very large PDFs may be automatically chunked for processing

### Image Files

**Formats**: JPG/JPEG, PNG, WebP, BMP, HEIC/HEIF

**Processing**: Images are processed using OCR technology to extract visible text.

**Best for**: Photographs of documents, scanned pages, handwritten materials

**Tips**: 
- Higher resolution images produce better OCR results
- Good lighting and contrast improve extraction quality
- AI Vision can be enabled for advanced image text recognition
- Handwritten text extraction may have limited accuracy

### Audio Files

**Not yet supported**, this will be added in a future update.

## Handling Multiple Files

SourceLens allows uploading up to 5 files at once, which will be combined into a single source for analysis. This is useful for:

- Multi-page documents split across several files
- Related documents that should be analyzed together
- Comparing different versions of a text

When multiple files are uploaded, they are processed in order and combined with page break markers.

## Optimizing Different Document Types

### For Text Documents
- Use plain text when possible
- Preserve structural elements like paragraphs and sections
- Remove extraneous elements like page numbers

### For PDFs
- Use searchable PDFs rather than scanned images when available
- For scanned PDFs, enable AI Vision for better text recognition
- Break very large PDFs (100+ pages) into logical sections

### For Images
- Ensure good lighting and contrast
- Capture images straight-on to avoid perspective distortion
- Use the highest resolution possible
- Enable AI Vision for challenging documents

### For Audio
- Record in quiet environments when possible
- Use a quality microphone positioned close to speakers
- Consider using speaker labels for multi-person recordings

## Handling Special Cases

### Handwritten Documents
- Enable AI Vision for better recognition
- Results may vary based on handwriting clarity
- Consider focusing on shorter, critical passages

### Tables and Structured Data
- Use Extract Information feature after upload
- Specify fields to extract for better results
- Tables in PDFs may be converted to text with approximate formatting

### Multi-language Documents
- SourceLens supports multiple languages
- Specify the language in metadata when possible
- Consider using the translation feature for non-English documents

<Warning>
  Very large files (>25MB) may exceed upload limits. Consider breaking them into smaller sections or using more compressed formats.
</Warning>
`;

export const METADATA_MDX = `---
title: Metadata
lastUpdated: '2025-04-28'
---

Metadata provides crucial context for document analysis in SourceLens. Accurate metadata significantly improves the quality and relevance of AI-generated insights.

## Core Metadata Fields

### Date

The creation date of the document is essential for historical context:

- **Format**: Year (e.g., "1945"), specific date (e.g., "July 4, 1776"), or period (e.g., "Late 19th century")
- **Importance**: Helps the AI place the document in its historical context
- **Auto-detection**: SourceLens attempts to detect dates from the document content

### Author

Information about who created the document:

- **Format**: Full name (e.g., "Jane Austen"), organizational name (e.g., "U.S. Department of State"), or anonymous/unknown
- **Importance**: Enables the AI to incorporate author background and perspective
- **Auto-detection**: The system will try to identify authors mentioned in the document

### Research Goals

Your specific research objectives:

- **Format**: Brief description of what you hope to learn from this document
- **Importance**: Guides the analysis toward your research interests
- **Examples**: "Understand economic arguments for abolition" or "Analyze rhetorical techniques in wartime speeches"

## Extended Metadata

### Title

The document's original title:

- **Format**: Full title as it appears on the document
- **Auto-detection**: Extracted from document headers when possible

### Document Type

The category or genre of the document:

- **Options**: Letter, speech, article, book excerpt, legal document, etc.
- **Importance**: Helps contextualize the format and purpose

### Place of Publication

Where the document was created or published:

- **Format**: City, country, or institution
- **Importance**: Provides geographical and institutional context

### Genre

The literary or scholarly genre:

- **Options**: Academic, journalistic, literary, legal, personal, etc.
- **Importance**: Informs stylistic and structural analysis

### Academic Subfield

The relevant academic discipline:

- **Options**: History, literature, political science, economics, etc.
- **Importance**: Helps target academic context and terminology

### Tags

Custom keywords for organizing your sources:

- **Format**: Comma-separated terms
- **Usage**: Helps with organizing your library and finding related sources

## Metadata Detection

SourceLens can automatically detect certain metadata from your documents:

1. **On Upload**: When you upload a document, the system attempts to identify basic metadata
2. **Manual Override**: You can always modify or add to the detected metadata
3. **Extraction Tool**: For complex documents, use the Extract Information tool to pull out specific metadata

<Info>
  Automatic metadata detection works best with well-structured documents that contain clear indicators of date, author, and title.
</Info>

## Impact on Analysis

Metadata significantly influences analysis quality:

### Historical Context

- **With good date metadata**: The analysis incorporates specific historical events and context from the period
- **Without date metadata**: Analysis relies on internal textual clues, which may be less precise

### Author Perspective

- **With detailed author metadata**: Analysis includes biographical context and known perspectives
- **Without author metadata**: Analysis focuses solely on textual evidence of authorial stance

### Research Focus

- **With clear research goals**: Analysis targets your specific research questions
- **Without research goals**: Analysis provides a more general overview of the document

## Best Practices

To get the most from metadata:

1. **Be as specific as possible**, especially with dates and author information
2. **Update metadata** if you discover more accurate information
3. **Use research goals** to guide analysis toward your specific interests
4. **Add tags** to organize related documents in your library
5. **Consider document type** to help the system understand format conventions

<Warning>
  While SourceLens attempts to detect metadata automatically, always verify and correct this information for the most accurate analysis.
</Warning>
`;

// Features - Analysis Tools
export const BASIC_ANALYSIS_MDX = `---
title: Basic Analysis
lastUpdated: '2025-04-28'
---

<Screenshot src="basic-analysis.png" alt="The Basic Analysis lens is the default for when a source is uploaded." />

Basic Analysis is the foundation of SourceLens's document analysis capabilities. It provides a quick but insightful overview of any primary source document.

## Overview

Basic Analysis examines your document and generates three key components:

1. **Summary**: A concise overview of the document's content
2. **Analysis**: Initial observations about themes, arguments, and context
3. **Follow-up Questions**: Suggested questions to deepen your exploration

This analysis is designed to be generated quickly, usually within seconds, making it ideal for initial document assessment.

## How to Generate Basic Analysis

1. Upload or enter your source text
2. Provide basic metadata (author, date, etc.)
3. Basic Analysis is automatically generated when you first upload a document
4. You can also click "Basic Analysis" in the Analysis Tools panel at any time

<Info>
  Basic Analysis is the default starting point and runs automatically when you first upload a document, unless you select a different tool.
</Info>

## Understanding the Results

### Summary Section

The Summary provides a brief overview of:
- Document type and purpose
- Main topic or subject
- Key figures or entities mentioned
- Historical context (when date metadata is provided)
- Document structure and organization

This section helps you quickly understand what the document is about and its general purpose.

### Analysis Section

The Analysis section offers initial insights into:
- Major themes and concepts
- Rhetorical strategies and tone
- Historical significance (based on available metadata)
- Potential biases or perspectives
- Connections to broader historical or scholarly contexts

This section goes beyond summarizing to provide analytical insights about the document's meaning and importance.

### Follow-up Questions

This section suggests 3-5 questions that:
- Probe deeper into the document's themes
- Explore contextual factors
- Investigate the author's perspective
- Connect to broader historical narratives
- Recommend specific areas for further research

These questions serve as starting points for deeper analysis and can be clicked directly to ask the AI for more information.

## Use Cases

Basic Analysis is particularly useful for:

- **Initial document screening**: Quickly assess if a document is relevant to your research
- **Building a research library**: Generate basic insights for multiple documents
- **Starting larger research projects**: Get an overview before diving into details
- **Student assignments**: Help students begin analyzing primary sources

## Tips for Better Results

1. **Provide accurate metadata**: Even basic information about author and date significantly improves analysis quality
2. **Add research goals**: Including your research interests helps focus the analysis
3. **Use the follow-up questions**: Click on these to explore specific aspects in more depth
4. **Compare multiple models**: Try different AI models for alternative perspectives
5. **Save analyses to your library**: Store results for future reference

## Next Steps

After reviewing the Basic Analysis, you might want to:

- Click on a follow-up question to learn more about a specific aspect
- Generate a [Detailed Analysis](/docs?slug=features/analysis-tools/detailed-analysis) for deeper insights
- Use [Information Extraction](/docs?slug=features/analysis-tools/information-extraction) to pull out specific data points
- Try [Text Highlighting](/docs?slug=features/text-highlighting) to visualize key passages
- [Save the analysis](/docs?slug=library-management/analysis-history) to your library

<Warning>
  Basic Analysis is AI-generated and should be treated as a starting point. Always critically evaluate the observations and cross-reference with other sources.
</Warning>
`;

export const DETAILED_ANALYSIS_MDX = `---
title: Detailed Analysis
lastUpdated: '2025-04-28'
---

<Screenshot src="detailed-analysis.png" alt="The Detailed Analysis lens." />

Detailed Analysis offers a comprehensive examination of a primary source document. It provides extensive insights that go beyond the basic analysis, organized into several key categories to help researchers gain deeper understanding.

## What is Detailed Analysis?

When you request a Detailed Analysis, SourceLens performs an in-depth examination of your document and provides structured analysis in these key areas:

1. **Historical Context** - Understanding the time period and circumstances
2. **Author Perspective** - Insights into the author's background and viewpoint
3. **Key Themes** - Major themes and concepts explored in the document
4. **Evidence & Rhetoric** - Analysis of evidence types and rhetorical strategies
5. **Significance** - The historical and scholarly importance of the document
6. **References** - Suggested scholarly references related to the document

<Info>
  Detailed Analysis is particularly useful for complex historical documents, academic papers, or any source that requires nuanced understanding beyond surface-level reading.
</Info>

## How to Access Detailed Analysis

To generate a Detailed Analysis:

1. Upload or input your source document
2. Complete the basic metadata fields (author, date, etc.)
3. Click on "Detailed Analysis" in the Analysis Tools panel
4. Wait while the AI analyzes your document (this may take a minute for longer texts)

## Understanding the Analysis Sections

### Context Section

The Context section places your document in its historical, social, and political environment. It provides:

- Relevant historical events contemporaneous with the document
- Social and political conditions of the period
- Cultural movements and intellectual traditions influencing the text
- Connections to broader historical narratives

### Author Perspective

This section examines the author's viewpoint and background:

- Author's biographical information relevant to the text
- Their position in society and professional background
- Known ideological or philosophical stances
- Relationships with other contemporary figures or movements

### Key Themes

The Themes section identifies and analyzes the main ideas and topics in the document:

- Primary argumentative threads or narrative elements
- Recurring motifs and concepts
- Intellectual frameworks employed
- Relationship between identified themes

### Evidence & Rhetoric

This section breaks down the author's argumentative approach:

- Types of evidence used (empirical, anecdotal, testimonial, etc.)
- Rhetorical strategies and techniques
- Logical structures and reasoning patterns
- Stylistic elements and their effectiveness

### Significance

The Significance section evaluates the document's importance:

- Historical impact at the time of creation
- Long-term influence on subsequent discourse
- Contemporary relevance and applications
- Position within scholarly conversations

### References

The References section provides scholarly sources related to the document:

- Primary sources that provide additional context
- Secondary scholarship analyzing the document or similar texts
- Contemporary works that cite or discuss the document
- Resources for further research on identified themes

## Using Citations in Your Research

The References section of the Detailed Analysis includes citations formatted in a scholarly style. You can:

1. Click the "Copy" button next to any reference to copy it to your clipboard
2. Use the "Save" button to add important references to your Library
3. Follow the provided links when available to access the source directly

These citations can serve as a foundation for your bibliography or works cited page, but should be verified for accuracy before inclusion in formal academic work.

## Tips for Getting the Best Results

To get the most useful detailed analysis:

- **Provide accurate metadata** - The more information you provide about the document's author, date, and type, the more targeted the analysis will be
- **Use high-quality source text** - Clean OCR text or properly formatted documents yield better results than text with many errors
- **Select appropriate models** - Different AI models excel at different types of analysis; experiment with model selection for optimal results
- **Save analyses to your library** - Store analyses for reference and comparison over time

<Warning>
  Detailed Analysis is AI-generated and should be used as a starting point for your research, not as a definitive interpretation. Always verify important insights with traditional scholarly methods.
</Warning>

## Performance Considerations

Detailed Analysis requires more processing power than Basic Analysis, especially for longer documents. For optimal performance:

- Break extremely long documents (>100,000 words) into logical sections
- Allow more time for processing complex historical texts
- Consider using models optimized for scholarly content analysis (e.g., Claude-3.7 Sonnet)

## Related Features

- **[Extract Information](/docs?slug=features/analysis-tools/information-extraction)** - To pull structured data from your document
- **[Reference Suggestions](/docs?slug=features/references-suggestions)** - For more targeted source recommendations
- **[Text Highlighting](/docs?slug=features/text-highlighting)** - To visualize key passages mentioned in the analysis
`;

export const INFORMATION_EXTRACTION_MDX = `---
title: Information Extraction
lastUpdated: '2025-04-28'
---

<Screenshot src="extract-info.png" alt="The Extract Information lens." />

Information Extraction enables you to pull specific structured data from documents. This feature is ideal for identifying and cataloging key elements within primary sources.

## Overview

Unlike general analysis, Information Extraction focuses on identifying specific types of information such as:

- People, places, and organizations
- Dates and time periods
- Events and actions
- Relationships between entities
- Statistical or numerical data
- Citations and references
- Arguments or claims
- Specialized terminology

## How to Extract Information

1. Upload or input your source document
2. Click on "Extract Information" in the Analysis Tools panel
3. Select the type of information you want to extract
4. Specify any additional parameters or criteria
5. Wait for the extraction process to complete

<Info>
  Information Extraction works best with Gemini Flash model for very large documents due to its extended context window.
</Info>

## Extraction Types

### Named Entities

Extracts people, places, organizations, and other named entities:

- **People**: Historical figures, mentioned individuals
- **Places**: Locations, geographical references
- **Organizations**: Companies, institutions, governments
- **Other Entities**: Products, events, artifacts

Example query: "Extract all people and organizations mentioned in this document"

### Dates and Chronology

Identifies and organizes temporal information:

- **Specific Dates**: Calendar dates mentioned in the text
- **Time Periods**: Eras, decades, centuries referenced
- **Chronology**: Sequence of events as described
- **Temporal Relationships**: Before/after references

Example query: "Create a chronological timeline of events mentioned in this document"

### Arguments and Claims

Extracts logical structures and positions:

- **Main Claims**: Central arguments made by the author
- **Supporting Points**: Evidence offered for claims
- **Counterarguments**: Opposing views addressed
- **Conclusions**: Final positions and summaries

Example query: "List all claims made about economic policy in this document"

### Statistical Information

Pulls numerical data and statistics:

- **Quantities**: Numbers, measurements, statistics
- **Comparisons**: Relative measures and ratios
- **Trends**: Changes described numerically
- **Data Points**: Specific measurements or values

Example query: "Extract all statistical information related to population or demographics"

### Custom Extraction

Define your own extraction criteria:

- **Custom Categories**: Your specified information types
- **Relational Data**: Connections between different elements
- **Conditional Extraction**: Information that meets specific criteria

Example query: "Find all passages where the author discusses education reform, and extract their proposed solutions"

## Output Formats

SourceLens can format extracted information in several ways:

### List Format

Organized as numbered or bulleted lists with:
- Category headers
- Individual entries
- Optional context or quotes
- Page or paragraph references when available

### Table Format

Structured in columns and rows for:
- Comparing similar items
- Tracking information across categories
- Organizing complex relationships
- Visualizing patterns in the data

### Custom Format

Specify your own output structure:
- Hierarchical organization
- Grouped by criteria you define
- Including specific contextual elements
- Formatted for integration with other research tools

## Tips for Effective Extraction

1. **Be specific in your query**: Clearly define what you're looking for
2. **Start with standard categories**: Begin with built-in extraction types before creating custom ones
3. **Use context**: Include relevant contextual parameters to improve accuracy
4. **Check results**: Always verify extracted information against the original text
5. **Iterate**: Refine your extraction queries based on initial results

## Use Cases

Information Extraction is particularly valuable for:

- **Research Projects**: Cataloging specific types of information across multiple sources
- **Data Analysis**: Gathering quantitative information for further analysis
- **Comparative Studies**: Extracting similar data points from different documents
- **Database Creation**: Building structured datasets from unstructured text
- **Citation Management**: Pulling bibliographic information from academic papers

<Warning>
  While Information Extraction is highly accurate, it may occasionally miss information or include irrelevant data. Always verify important extractions against the original text.
</Warning>

## Related Features

- **[References Suggestions](/docs?slug=features/references-suggestions)** - For identifying scholarly sources related to extracted information
- **[Text Highlighting](/docs?slug=features/text-highlighting)** - To visualize extracted information in context
- **[Library Management](/docs?slug=library-management/saved-sources)** - To save and organize extracted information
`;

export const TEXT_HIGHLIGHTING_MDX = `---
title: Text Highlighting
lastUpdated: '2025-04-28'
---

<Screenshot src="highlight.png" alt="The Highlight lens." />

Text Highlighting allows you to identify and visualize specific passages in your document based on custom criteria. This feature helps focus your attention on the most relevant sections of text for your research.

## How Text Highlighting Works

Text Highlighting uses AI to:

1. Analyze your document based on your specified criteria
2. Identify passages that match those criteria
3. Apply color-coded highlighting to the matching segments
4. Provide explanations for why each segment was highlighted

The highlighting appears directly on your document, making it easy to see relevant passages in context.

## Using Text Highlighting

To highlight text in your document:

1. Upload or input your source text
2. Click on "Text Highlighting" in the Analysis Tools panel
3. Enter your highlighting criteria in the search field
4. Specify the number of segments to highlight (optional)
5. Click "Highlight Text" to process your request

<Info>
  You can create multiple highlight sets with different criteria to compare different aspects of your document.
</Info>

## Highlight Criteria Examples

Text Highlighting can search for a wide range of content:

### Thematic Elements

- "Passages discussing economic inequality"
- "References to religious imagery"
- "Sections about technological progress"

### Rhetorical Features

- "The most emotionally charged passages"
- "Examples of metaphorical language"
- "Instances of irony or humor"
- "Appeal to authority arguments"

### Literary Devices

- "Use of symbolism"
- "Instances of foreshadowing"
- "Examples of personification"
- "Narrative perspective shifts"

### Historical Elements

- "References to specific historical events"
- "Mentions of contemporary political figures"
- "Passages describing social customs of the period"

### Custom Research Focus

- "Evidence supporting the author's main argument"
- "Parts that relate to my research on gender roles"
- "Sections that could be considered controversial in the time period"

## Understanding Highlight Colors

Highlights are color-coded based on relevance to your query:

- **Red**: Highest relevance (90-100%)
- **Orange**: High relevance (75-89%)
- **Yellow**: Medium relevance (50-74%)
- **Green**: Moderate relevance (25-49%)
- **Blue**: Lower relevance (0-24%)

Hovering over a highlighted passage displays:
- Relevance percentage
- Brief explanation of why it matches your criteria
- Model used for the highlighting

## Advanced Features

### Highlight Settings

Customize your highlighting experience:

- **Number of segments**: Control how many passages are highlighted
- **Minimum length**: Set minimum character length for highlights
- **Maximum length**: Set maximum character length for highlights
- **Highlight transparency**: Adjust the visual intensity of highlights

### Multiple Highlighting Sets

Create different sets of highlights for different research questions:
- Each set appears in a different color scheme
- Toggle between different highlight sets
- Compare different aspects of the same document

### Export and Share

Preserve your highlights:
- Save highlighted document to your library
- Export as PDF with highlights preserved
- Include highlight explanations in exports
- Share with collaborators

## Tips for Effective Highlighting

1. **Be specific in your criteria**: More precise queries produce more relevant highlights
2. **Start broad, then narrow**: Begin with general criteria, then refine based on results
3. **Use natural language queries**: Write your criteria as you would explain it to a person
4. **Combine with other tools**: Use highlighting alongside Detailed Analysis for deeper insights
5. **Save multiple highlight sets**: Create different highlights for different research angles

## Use Cases

Text Highlighting is particularly useful for:

- **Literary analysis**: Identifying literary devices and themes
- **Rhetorical studies**: Examining argumentative strategies
- **Comparative research**: Highlighting similar elements across different documents
- **Educational settings**: Helping students focus on key passages
- **Collaborative research**: Sharing important sections with colleagues

<Warning>
  While highlighting is AI-powered, it's still important to read the full document to understand context and avoid missing important information not captured by your highlighting criteria.
</Warning>
`;

export const REFERENCES_SUGGESTIONS_MDX = `---
title: References Suggestions
lastUpdated: '2025-04-28'
---
<Screenshot src="reference.png" alt="The References lens." />

The References Suggestions feature helps you discover scholarly sources related to your primary document, enhancing your research with relevant academic material.

## Overview

When you request reference suggestions, SourceLens:
- Analyzes your primary source's content and context
- Identifies relevant scholarly works (books, articles, and other sources)
- Presents them with explanations of their relevance
- Provides formatted citations for your research

## Using Reference Suggestions

1. Upload or input your primary source
2. Click "Suggest References" in the Analysis Tools panel
3. Review the generated references list
4. Save relevant references to your library

## Reference Categories

References are organized into several categories:

- **Primary Sources**: Contemporary documents related to your source
- **Secondary Sources**: Scholarly works analyzing your source or its context
- **Theoretical Works**: Relevant theoretical frameworks
- **Recent Scholarship**: Current academic perspectives
- **Interdisciplinary Resources**: Related works from other fields

## Reference Details

Each suggested reference includes:
- Complete citation in academic format
- Brief explanation of relevance
- Link to the source when available
- Related passage from your source
- Relevance rating

<Warning>
  Always verify AI-suggested references exist and check their content before citing them in academic work.
</Warning>
`;

export const SIMULATION_MODE_MDX = `---
title: Simulation Mode
lastUpdated: '2025-04-28'
---
<Screenshot src="simulation.jpg" alt="The Simulation lens." />

Simulation Mode allows you to engage in a simulated conversation with the author of your primary source, offering a unique way to explore their perspective and ideas.

## Overview

Simulation Mode creates an AI representation based on:
- The author's known biographical information
- The content and style of the primary source
- Historical context of the time period
- The author's documented views and writings

This feature helps researchers explore how an author might respond to questions about their work, clarify concepts, or discuss related topics.

## Starting a Simulation

1. Upload your primary source
2. Provide accurate author metadata
3. Click "Simulation Mode" in the Analysis Tools panel
4. Begin the conversation by asking a question

## Best Practices

- **Start with specific questions** about the document's content
- **Progress to broader topics** related to the author's known work
- **Compare simulated responses** with historical records
- **Use as an exploratory tool**, not definitive historical evidence
- **Ask about clarifications** of difficult passages in the text

<Warning>
  Simulation Mode is a creative research tool, not a historically accurate reproduction of the author. All responses should be critically evaluated against historical sources.
</Warning>
`;

export const COUNTER_NARRATIVE_MDX = `---
title: Counter-Narrative
lastUpdated: '2025-04-28'
---

<Screenshot src="counter-narrative.png" alt="The Counter-Narrative lens." />

The Counter-Narrative feature generates alternative perspectives or interpretations that challenge or complement the primary source's viewpoint, helping researchers consider multiple angles.

## Overview

Counter-Narrative creates an alternative interpretation that:
- Presents a different perspective on the same topic
- Challenges key assumptions in the original text
- Offers alternative explanations for events or phenomena
- Considers how different groups might view the same material
- Explores contextual factors not emphasized in the original

## Generating a Counter-Narrative

1. Upload your primary source
2. Complete metadata fields (especially important for context)
3. Click "Counter-Narrative" in the Analysis Tools panel
4. Review the generated alternative perspective

## Types of Counter-Narratives

- **Historical Alternative**: How contemporaries with different views might have responded
- **Modern Perspective**: How current scholarship might reinterpret the source
- **Marginalized Viewpoint**: Perspectives from groups not represented in the original
- **Methodological Contrast**: Interpretation using different analytical approaches
- **Ideological Counterpoint**: Alternative political or philosophical framework

<Info>
  Counter-narratives are particularly valuable for teaching critical thinking and evaluating bias in primary sources.
</Info>
`;

// Library Management
export const SAVED_SOURCES_MDX = `---
title: Saved Sources
lastUpdated: '2025-04-28'
---

# Saved Sources

The Saved Sources feature allows you to build a personal library of primary sources for ongoing research and reference.

## Managing Your Sources

- **Save**: Sources are automatically saved after analysis
- **Organize**: Categorize with tags and metadata
- **Search**: Find sources by content, author, date, or tags
- **Export**: Download sources in various formats

## Source Details

Each saved source includes:
- Full text content
- Metadata (author, date, etc.)
- Source type and format
- Custom tags
- Date added
- Thumbnail (when available)

## Using Your Source Library

- **Continue Research**: Resume analysis of previously saved sources
- **Compare Sources**: View multiple sources side by side
- **Track Progress**: See which sources you've analyzed
- **Share**: Export sources for collaboration

<Warning>
  Sources are stored in your browser by default. Sign in to ensure your library persists across devices.
</Warning>
`;

export const REFERENCES_MDX = `---
title: References
lastUpdated: '2025-04-28'
---

# References

The References feature helps you manage scholarly sources discovered during your research, creating a comprehensive bibliography for your project.

## Managing References

- **Save**: Add references from Suggestions or manually
- **Organize**: Categorize with tags and relevance ratings
- **Format**: View citations in multiple academic styles
- **Export**: Download formatted bibliographies

## Reference Details

Each reference includes:
- Complete citation information
- Source type (book, article, website, etc.)
- Relevance to your research
- Related primary source
- URL (when available)
- Personal notes

## Using Your Reference Library

- **Build Bibliographies**: Create formatted reference lists
- **Track Sources**: Maintain a record of scholarly materials
- **Evaluate Relevance**: Rate sources by importance
- **Search**: Find references by keyword, author, or topic

<Info>
  Your reference library integrates with your saved sources, showing connections between primary sources and scholarly literature.
</Info>
`;

export const ANALYSIS_HISTORY_MDX = `---
title: Analysis History
lastUpdated: '2025-04-28'
---

# Analysis History

Analysis History keeps a record of all analyses you've generated, allowing you to track your research progress and revisit previous insights.

## Tracking Analyses

- **Automatic Saving**: All analyses are saved by default
- **Multiple Analysis Types**: Basic, detailed, extraction results
- **Version Comparison**: Compare analyses of the same source
- **Model Tracking**: See which AI model generated each analysis

## Analysis Details

Each saved analysis includes:
- Analysis type and content
- Generation date and time
- Model used
- Source document reference
- Custom perspective (if used)

## Using Analysis History

- **Review Progress**: Track the evolution of your research
- **Compare Approaches**: See how different models interpret the same source
- **Continue Work**: Resume from previous analysis points
- **Export**: Download analyses for offline use

<Warning>
  Analysis history is tied to your account. Sign in to ensure your history persists across devices.
</Warning>
`;

export const RESEARCH_NOTES_MDX = `---
title: Research Notes
lastUpdated: '2025-04-28'
---

# Research Notes

Research Notes allows you to create, organize, and manage notes about your sources and analyses, building a comprehensive research notebook.

## Creating Notes

- **Source-Linked**: Attach notes directly to sources or passages
- **Standalone**: Create independent research notes
- **Rich Text**: Format notes with headings, lists, and emphasis
- **Media Support**: Attach images and links

## Note Organization

- **Categories**: Organize by research themes
- **Tags**: Add custom tags for easy retrieval
- **Search**: Find notes by content or metadata
- **Sort**: Arrange by date, source, or custom order

## Using Your Research Notes

- **Capture Insights**: Record your thoughts about sources
- **Track Questions**: Note areas for further research
- **Build Arguments**: Develop your thesis through connected notes
- **Plan Writing**: Organize notes into outline structures

<Info>
  Notes can be highlighted directly from the source text by selecting passages and choosing "Add Note" from the popup menu.
</Info>
`;

export const RESEARCH_DRAFTS_MDX = `---
title: Research Drafts
lastUpdated: '2025-04-28'
---

# Research Drafts

Research Drafts helps you develop complete research documents, papers, or essays based on your sources, analyses, and notes.

## Creating Drafts

- **From Scratch**: Start with a blank document
- **From Template**: Use academic paper templates
- **From Sources**: Build drafts incorporating saved sources
- **From Notes**: Convert research notes into draft sections

## Draft Features

- **Rich Text Editor**: Full formatting capabilities
- **Section Management**: Organize with headers and sections
- **Source Integration**: Insert quotes with automatic citations
- **Version History**: Track changes over time

## Using Research Drafts

- **Develop Arguments**: Build complete research papers
- **Collaborate**: Share drafts with colleagues
- **Export**: Download in various formats (DOCX, PDF)
- **Submit**: Prepare final versions for academic submission

<Warning>
  While SourceLens helps organize your research, always follow academic integrity guidelines and citation practices for your institution.
</Warning>
`;

// Advanced Usage
export const CUSTOM_PERSPECTIVES_MDX = `---
title: Custom Perspectives
lastUpdated: '2025-04-28'
---

# Custom Perspectives

Custom Perspectives allow you to guide the AI analysis with specific analytical frameworks, methodological approaches, or theoretical lenses.

## Creating a Perspective

In the Analysis Perspective field, you can enter:
- Theoretical frameworks (e.g., "feminist critique")
- Methodological approaches (e.g., "quantitative analysis")
- Disciplinary perspectives (e.g., "economic history")
- Time period contexts (e.g., "view through contemporary lens")
- Specialized focus (e.g., "emphasis on rhetorical techniques")

## Using Perspectives

1. Enter your custom perspective before analysis
2. The AI will incorporate this approach in its analysis
3. Try multiple perspectives on the same source
4. Compare results across different analytical lenses

## Strategy Cards

- **What They Are**: Pre-configured perspective prompts
- **How to Use**: Drag cards from the deck to the perspective field
- **Benefits**: Explore creative analytical approaches
- **Examples**: "Contrast with contemporary view" or "Focus on power dynamics"

<Info>
  Custom perspectives can dramatically change analysis results. Experiment with different approaches to gain multifaceted insights.
</Info>
`;

export const MODEL_SELECTION_MDX = `---
title: Model Selection
lastUpdated: '2025-04-28'
---

# Model Selection

SourceLens offers multiple AI models for document analysis, each with different strengths and optimal use cases.

## Available Models

### Claude Models
- **Claude 3.7 Sonnet**: Advanced reasoning and nuanced academic analysis
- **Claude 3.5 Haiku**: Fast, efficient analysis for quick insights

### GPT Models
- **GPT-4.1**: Strong contextual understanding and academic capabilities
- **GPT-4.1 Nano**: Faster performance for routine analysis

### Gemini Models
- **Gemini 2.0 Flash**: Specialized for very large documents with extended context
- **Gemini 2.0 Flash Lite**: Balanced performance for moderate-sized documents

## Choosing the Right Model

- **Document Type**: Historical texts (Claude), academic papers (GPT), large documents (Gemini)
- **Analysis Depth**: Quick overview (Haiku/Nano) vs. Deep analysis (Sonnet/GPT-4.1)
- **Document Size**: Standard (<50k words) vs. Large (>50k words)
- **Special Features**: Information extraction (Gemini), historical context (Claude)

## Model-Specific Tips

- **Claude Models**: Excellent for historical nuance and literary analysis
- **GPT Models**: Strong for modern academic content and structured analysis
- **Gemini Models**: Best for processing very large documents and technical content

<Warning>
  Model performance may vary by document type. Experiment with different models on important sources to find optimal results.
</Warning>
`;

export const PROCESSING_LARGE_DOCUMENTS_MDX = `---
title: Processing Large Documents
lastUpdated: '2025-04-28'
---

# Processing Large Documents

SourceLens can handle large documents with specialized techniques to ensure comprehensive analysis despite size constraints.

## Size Limitations

- **Standard Processing**: Documents up to 100,000 words
- **Large Document Mode**: Documents up to 300,000 words
- **Multi-File Upload**: Up to 5 files combined (25MB total)

## Strategies for Large Documents

### Chunking

- **Automatic**: System splits large documents into manageable sections
- **Manual**: Upload logical sections separately
- **Smart Sampling**: Analysis of representative portions

### Model Selection

- **Gemini 2.0 Flash**: Specialized for large documents with 1M token context
- **Claude Sonnet**: Good balance of context and analysis quality
- **GPT-4.1**: Strong analysis with moderate context window

### Multi-Document Approach

- **Upload Multiple Files**: Process related documents together
- **Sequential Analysis**: Analyze sections in sequence
- **Synthesis View**: Combine insights across sections

## Best Practices

- **Logical Sections**: Break documents at chapter or section boundaries
- **Consistent Metadata**: Use the same metadata across sections
- **Progressive Analysis**: Start with basic analysis before detailed
- **Reference Linking**: Connect references across sections

<Info>
  For very large documents like books, analyzing chapter by chapter often produces better results than processing the entire text at once.
</Info>
`;

// Document mapping by slug
export const DOC_CONTENT_MAP: Record<string, string> = {
  'getting-started/introduction': INTRODUCTION_MDX,
  'getting-started/quick-start': QUICK_START_MDX,
  'core-concepts/source-analysis': SOURCE_ANALYSIS_MDX,
  'core-concepts/document-types': DOCUMENT_TYPES_MDX,
  'core-concepts/metadata': METADATA_MDX,
  'features/analysis-tools/basic-analysis': BASIC_ANALYSIS_MDX,
  'features/analysis-tools/detailed-analysis': DETAILED_ANALYSIS_MDX,
  'features/analysis-tools/information-extraction': INFORMATION_EXTRACTION_MDX,
  'features/text-highlighting': TEXT_HIGHLIGHTING_MDX,
  'features/references-suggestions': REFERENCES_SUGGESTIONS_MDX,
  'features/simulation-mode': SIMULATION_MODE_MDX,
  'features/counter-narrative': COUNTER_NARRATIVE_MDX,
  'library-management/saved-sources': SAVED_SOURCES_MDX,
  'library-management/references': REFERENCES_MDX,
  'library-management/analysis-history': ANALYSIS_HISTORY_MDX,
  'library-management/research-notes': RESEARCH_NOTES_MDX,
  'library-management/research-drafts': RESEARCH_DRAFTS_MDX,
  'advanced-usage/custom-perspectives': CUSTOM_PERSPECTIVES_MDX,
  'advanced-usage/model-selection': MODEL_SELECTION_MDX,
  'advanced-usage/processing-large-documents': PROCESSING_LARGE_DOCUMENTS_MDX,
};

// Function to get doc content by slug
export function getDocContentBySlug(slug: string): string | null {
  return DOC_CONTENT_MAP[slug] || null;
}

// Function to get all available slugs
export function getAllDocSlugs(): string[] {
  return Object.keys(DOC_CONTENT_MAP);
}