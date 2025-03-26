// app/page.tsx
// Splash page. the starting point for the app 

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import HamburgerMenu from '@/components/ui/HamburgerMenu';
import AboutModal from '@/components/ui/AboutModal';
import FAQModal from '@/components/ui/FAQModal';
import { useAppStore, Metadata, ExtractInfoConfig } from '@/lib/store';
import UploadProgress from '@/components/upload/UploadProgress';


export default function Home() {
  const router = useRouter();
  const { 
   setSourceContent, 
  setMetadata,
  setLoading,
  isLoading,
  setActivePanel,  
  setRoleplayMode
  } = useAppStore();
  
  const [textInput, setTextInput] = useState('');
const [metadata, setLocalMetadata] = useState<Metadata>({
  date: '',
  author: '',
  researchGoals: '',
  additionalInfo: '',
  title: '',
  summary: '',
  documentEmoji: '',
  documentType: '',
  genre: '',
  placeOfPublication: '',
  academicSubfield: '',
  tags: [],
  fullCitation: ''
});
  const [activeTab, setActiveTab] = useState('text');
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);
  const [formValid, setFormValid] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
const [uploadingFile, setUploadingFile] = useState(false);
const [fileError, setFileError] = useState<string | null>(null);
const [detectedMetadata, setDetectedMetadata] = useState<any>(null);
const [showMetadataPrompt, setShowMetadataPrompt] = useState(false);
const [isExtractingMetadata, setIsExtractingMetadata] = useState(false);
const [showDemoOptions, setShowDemoOptions] = useState(false);
const [selectedDemo, setSelectedDemo] = useState<number | null>(null);
const [disableMetadataDetection, setDisableMetadataDetection] = useState(false);
const [useAIVision, setUseAIVision] = useState(false);
const [uploadProgress, setUploadProgress] = useState(0);
const [progressMessages, setProgressMessages] = useState<string[]>([]);
const [currentProgressMessage, setCurrentProgressMessage] = useState('');
const [showProgressIndicator, setShowProgressIndicator] = useState(false);
const [fields, setFields] = useState({
  visionModel: 'gemini-2.0-pro-exp-02-05' // Default to Gemini
});

const handleTextAreaDragOver = (e: React.DragEvent<HTMLTextAreaElement>) => {
  e.preventDefault();
  e.stopPropagation();

   // Check if the dragged item is a file
  if (e.dataTransfer.types.includes('Files')) {
    // Switch to file upload tab
    setActiveTab('file');
    
    // Add visual cue that we're switching tabs
    e.currentTarget.classList.add('border-amber-500', 'bg-amber-50/50');
    
    // Show a temporary message
    const oldPlaceholder = e.currentTarget.placeholder;
    e.currentTarget.placeholder = "Switching to file upload...";
    
    // Reset the placeholder after a short delay
    setTimeout(() => {
      if (e.currentTarget) {
        e.currentTarget.placeholder = oldPlaceholder;
        e.currentTarget.classList.remove('border-amber-500', 'bg-amber-50/50');
      }
    }, 800);
  }
};



// Add this to prevent default behavior when dragging leaves
const handleTextAreaDragLeave = (e: React.DragEvent<HTMLTextAreaElement>) => {
  e.preventDefault();
  e.currentTarget.classList.remove('border-amber-500', 'bg-amber-50/50');
};

const handleTextPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
  const pastedText = e.clipboardData.getData('text');
  
  // If user is pasting a substantial amount of text, schedule metadata detection
  if (pastedText.length > 200) {
    // Wait a bit to let the paste complete
    setTimeout(() => {
      extractMetadata(textInput + pastedText);
    }, 500);
  }
};
  
  // Add this useEffect to your component
useEffect(() => {
  // Debounced metadata detection for text input
  if (activeTab === 'text' && textInput.trim().length > 200) {
    const timer = setTimeout(() => {
      extractMetadata(textInput);
    }, 2000); // Wait 2 seconds after typing stops
    
    return () => clearTimeout(timer);
  }
}, [textInput]);

  // Validate form completeness
useEffect(() => {
  setFormValid(
    textInput.trim().length > 0 && 
    metadata.date.trim().length > 0 && 
    metadata.author.trim().length > 0
    
  );
}, [textInput, metadata]);
  
  // Animation on mount
  useEffect(() => {
    setAnimateIn(true);
  }, []);
  
  // handler functions

const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
  e.preventDefault();
  e.stopPropagation();
  
  // Reset UI state
  e.currentTarget.classList.remove('border-amber-500', 'bg-amber-50/50');
  
  const files = e.dataTransfer.files;
  if (files && files.length > 0) {
    processFile(files[0]);
  }
};

const extractMetadata = async (text: string) => {
    if (disableMetadataDetection) {
    return null; // Skip metadata detection entirely if disabled
  }
  if (!text || text.trim().length < 50) {
    return null; // Skip if text is too short
  }
  
  // Avoid multiple simultaneous extraction attempts
  if (isExtractingMetadata) return null;
  
  setIsExtractingMetadata(true);
  
  try {
    const response = await fetch('/api/extract-metadata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }
    
    const metadata = await response.json();
    console.log("Extracted metadata:", metadata);
    
    // Only show prompt if we have meaningful metadata
    if (metadata.date || metadata.author || metadata.title) {
      setDetectedMetadata(metadata);
      setShowMetadataPrompt(true);
    }
    
    return metadata;
  } catch (error) {
    console.error("Error extracting metadata:", error);
    return null;
  } finally {
    setIsExtractingMetadata(false);
  }
};

// In the applyDetectedMetadata function in app/page.tsx
const applyDetectedMetadata = () => {
  if (!detectedMetadata) return;
  
  // Apply each detected metadata field if it exists and the user's field is empty
  setLocalMetadata(prevMetadata => {
    const newMetadata = { ...prevMetadata };
    
    // Only overwrite empty fields unless the value is significantly better
    if (detectedMetadata.date && (!prevMetadata.date.trim() || detectedMetadata.date.length > prevMetadata.date.length + 2)) {
      newMetadata.date = detectedMetadata.date;
    }
    
    if (detectedMetadata.author && (!prevMetadata.author.trim() || detectedMetadata.author.length > prevMetadata.author.length + 3)) {
      newMetadata.author = detectedMetadata.author;
    }
    
    // Always use detected research value if provided
    if (detectedMetadata.researchValue) {
      newMetadata.researchGoals = detectedMetadata.researchValue;
    }
    
    // Add optional fields with null checks
    if (detectedMetadata.title) {
      newMetadata.title = detectedMetadata.title;
    }
    
    if (detectedMetadata.summary) {
      newMetadata.summary = detectedMetadata.summary;
    }
    
    if (detectedMetadata.documentEmoji) {
      newMetadata.documentEmoji = detectedMetadata.documentEmoji;
    }
    
    // Add other potential metadata fields
    if (detectedMetadata.placeOfPublication) {
      newMetadata.placeOfPublication = detectedMetadata.placeOfPublication;
    }
    
    if (detectedMetadata.genre) {
      newMetadata.genre = detectedMetadata.genre;
    }
    
    if (detectedMetadata.documentType) {
      newMetadata.documentType = detectedMetadata.documentType;
    }
    
    if (detectedMetadata.academicSubfield) {
      newMetadata.academicSubfield = detectedMetadata.academicSubfield;
    }
    
   if (detectedMetadata.tags) {
     newMetadata.tags = Array.isArray(detectedMetadata.tags) 
       ? detectedMetadata.tags 
       : typeof detectedMetadata.tags === 'string'
         ? detectedMetadata.tags.split(',').map((tag: string) => tag.trim())
         : [];
   }
    
    if (detectedMetadata.fullCitation) {
      newMetadata.fullCitation = detectedMetadata.fullCitation;
    }
    
    return newMetadata;
  });
  
  // Hide the prompt after applying
  setShowMetadataPrompt(false);
};

// file processing function
const processFile = async (file: File) => {
  setFileError(null);

   // Initialize progress UI
  setShowProgressIndicator(true);
  setUploadProgress(5);
  setCurrentProgressMessage('Preparing upload...');
  setProgressMessages(['Preparing upload...']);
  
  
  // Check file extension as a fallback for MIME type
  const fileName = file.name.toLowerCase();
  const isPdf = file.type.includes('pdf') || fileName.endsWith('.pdf');
  const isImage = file.type.includes('image') || 
                fileName.endsWith('.jpg') || 
                fileName.endsWith('.jpeg') || 
                fileName.endsWith('.png');
  const isText = file.type.includes('text') || fileName.endsWith('.txt');
  
  if (!isPdf && !isImage && !isText) {
    setFileError(`Unsupported file type. Please use PDF, JPG, PNG, or TXT files.`);
    return;
  }
  
  if (file.size > 10 * 1024 * 1024) { // 10MB limit
    setFileError('File too large. Maximum size is 10MB.');
    return;
  }
  
setUploadingFile(true);
  setUploadProgress(10);
  setCurrentProgressMessage('Reading file...');
  setProgressMessages(prev => [...prev, 'Reading file...']);
  
  try {
    let extractedText = '';
    
    // For text files, read directly in the browser
    if (isText) {
      setUploadProgress(30);
      setCurrentProgressMessage('Processing text file...');
      setProgressMessages(prev => [...prev, 'Processing text file...']);
      
      extractedText = await file.text();
      setTextInput(extractedText);
      
      setUploadProgress(60);
      setCurrentProgressMessage('Analyzing text content...');
      setProgressMessages(prev => [...prev, 'Analyzing text content...']);
      
      // Try to extract metadata from the text
      await extractMetadata(extractedText);
      
      setUploadProgress(100);
      setCurrentProgressMessage('Text processing complete!');
      setProgressMessages(prev => [...prev, 'Text processing complete!']);
      
      setUploadingFile(false);
      setShowProgressIndicator(false);
      return;
    }
    
    // For PDFs and images, send to the API for processing
    const formData = new FormData();
    formData.append('file', file);
    
    // Add the AI Vision preference
    formData.append('useAIVision', useAIVision.toString());

    formData.append('visionModel', fields.visionModel);
    
    console.log("Sending file to API:", file.name, "type:", file.type);
    console.log("Using AI Vision:", useAIVision ? "PRIMARY" : "FALLBACK");
     console.log("Vision model:", fields.visionModel);
    
    setUploadProgress(20);
    setCurrentProgressMessage('Uploading file to server...');
    setProgressMessages(prev => [...prev, 'Uploading file to server...']);
    
    // Progress tracking interval for large files
    let progressInterval: NodeJS.Timeout | undefined;
    if (file.size > 2 * 1024 * 1024) { // For files larger than 2MB
      let simulatedProgress = 20;
      
      progressInterval = setInterval(() => {
        simulatedProgress += 1;
        if (simulatedProgress > 90) {
          simulatedProgress = 90; // Cap at 90% until we get actual response
        }
        
        setUploadProgress(simulatedProgress);
        
        // Generate appropriate progress messages
        if (simulatedProgress < 40) {
          setCurrentProgressMessage('Uploading file...');
        } else if (simulatedProgress < 60) {
          if (isPdf) {
            setCurrentProgressMessage('Extracting text from PDF...');
            setProgressMessages(prev => {
              if (prev.includes('Extracting text from PDF...')) return prev;
              return [...prev, 'Extracting text from PDF...'];
            });
          } else if (isImage) {
            setCurrentProgressMessage('Analyzing image content...');
            setProgressMessages(prev => {
              if (prev.includes('Analyzing image content...')) return prev;
              return [...prev, 'Analyzing image content...'];
            });
          }
        } else if (simulatedProgress < 80) {
          if (useAIVision) {
            setCurrentProgressMessage('Processing with AI Vision...');
            setProgressMessages(prev => {
              if (prev.includes('Processing with AI Vision...')) return prev;
              return [...prev, 'Processing with AI Vision...'];
            });
          } else {
            setCurrentProgressMessage('Performing OCR extraction...');
            setProgressMessages(prev => {
              if (prev.includes('Performing OCR extraction...')) return prev;
              return [...prev, 'Performing OCR extraction...'];
            });
          }
        } else {
          setCurrentProgressMessage('Almost done...');
          setProgressMessages(prev => {
            if (prev.includes('Almost done...')) return prev;
            return [...prev, 'Almost done...'];
          });
        }
      }, 800);
    }
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    // Clear the interval
    if (progressInterval) {
      clearInterval(progressInterval);
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API error response:", response.status, errorData);
      
      setUploadProgress(0);
      setCurrentProgressMessage(`Error: ${response.status} - ${errorData.message || ''}`);
      setProgressMessages(prev => [...prev, `Error: ${response.status} - ${errorData.message || ''}`]);
      
      throw new Error(`Server responded with ${response.status}: ${errorData.message || ''}`);
    }
    
    const data = await response.json();
    console.log("API processing successful with method:", data.processingMethod);
    
    // Update progress to 100%
    setUploadProgress(100);
    setCurrentProgressMessage('Processing complete!');
    setProgressMessages(prev => [...prev, 'Processing complete!']);
    
    // Set the extracted text in the textarea
    extractedText = data.content;
    setTextInput(extractedText);
    
    // Try to extract metadata from the processed text
    if (extractedText && extractedText.length > 0) {
      await extractMetadata(extractedText);
    }
    
    // Switch to text tab to show the extracted content
    setActiveTab('text');
    
  } catch (error) {
    console.error('Error processing file:', error);
    // Fix the type error by properly checking the error type
    setFileError(
      error instanceof Error 
        ? error.message 
        : 'Failed to process file. Please try again or use text input instead.'
    );
    
    setUploadProgress(0);
    setCurrentProgressMessage('Failed to process file');
    setProgressMessages(prev => [...prev, 'Failed to process file']);
  } finally {
    setUploadingFile(false);
    
    // Hide progress indicator after a delay
    setTimeout(() => {
      setShowProgressIndicator(false);
    }, 3000);
  }
};

const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (files && files.length > 0) {
    processFile(files[0]);
  }
};

// handle submit function, including metadata

const handleSubmit = () => {
  if (!formValid) return;
  
  // Create a final metadata object that includes all fields
  const finalMetadata = {
    ...metadata,
    // Include all optional fields from detected metadata if not present in user input
    title: metadata.title || detectedMetadata?.title,
    summary: metadata.summary || detectedMetadata?.summary,
    documentEmoji: metadata.documentEmoji || detectedMetadata?.documentEmoji,
    placeOfPublication: metadata.placeOfPublication || detectedMetadata?.placeOfPublication,
    genre: metadata.genre || detectedMetadata?.genre,
    documentType: metadata.documentType || detectedMetadata?.documentType,
    academicSubfield: metadata.academicSubfield || detectedMetadata?.academicSubfield,
    tags: metadata.tags || detectedMetadata?.tags,
    fullCitation: metadata.fullCitation || detectedMetadata?.fullCitation,
    additionalInfo: metadata.additionalInfo || detectedMetadata?.additionalInfo || ''
  };
  
  setSourceContent(textInput);
  setMetadata(finalMetadata);  // Use the enhanced metadata object
  setLoading(true); // Set loading state before navigation
  router.push('/analysis');
};

  // Load demo content
const loadDemoContent = (index: number) => {
  setDisableMetadataDetection(true);
  setSelectedDemo(index);
  setTextInput(demoTexts[index].text);
  setLocalMetadata(demoTexts[index].metadata);
  
  // Set the extract info configuration based on demo selection
  useAppStore.getState().setExtractInfoConfig(demoExtractConfigs[index]);
  
  // Hide the demo options after selection
  setTimeout(() => {
    setShowDemoOptions(false);
    
    // Re-enable metadata detection after a delay
    setTimeout(() => {
      setDisableMetadataDetection(false);
    }, 1000);
  }, 500);
};

// Add this function to toggle the demo options
const toggleDemoOptions = (e: React.MouseEvent<HTMLElement>) => {
  e.preventDefault(); // Prevent any default behavior
  e.stopPropagation(); // Stop event from propagating up
  setShowDemoOptions(!showDemoOptions);
};

useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (showDemoOptions) {
      setShowDemoOptions(false);
    }
  };
  
  // Add listener with a slight delay to avoid immediate closure
  const timeoutId = setTimeout(() => {
    if (showDemoOptions) {
      document.addEventListener('click', handleClickOutside);
    }
  }, 100);
  
  return () => {
    clearTimeout(timeoutId);
    document.removeEventListener('click', handleClickOutside);
  };
}, [showDemoOptions]);
  

  const demoTexts = [
  // Lincoln's Gettysburg Address (existing)

  // Sumerian tablet
  {
    emoji: "😡",
    title: "Complaint to Ea-nasir",
    description: "Ancient Mesopotamian complaint about poor quality copper, history's first customer service dispute",
    text: `Tell Ea-nasir: Nanni sends the following message:

When you came, you said to me as follows: "I will give Gimil-Sin (when he comes) fine quality copper ingots." You left then but you did not do what you promised me. You put ingots which were not good before my messenger (Sit-Sin) and said: "If you want to take them, take them; if you do not want to take them, go away!"

What do you take me for, that you treat somebody like me with such contempt? I have sent as messengers gentlemen like ourselves to collect the bag with my money (deposited with you) but you have treated me with contempt by sending them back to me empty-handed several times, and that through enemy territory. Is there anyone among the merchants who trade with Telmun who has treated me in this way? You alone treat my messenger with contempt! On account of that one (trifling) mina of silver which I owe you, you feel free to speak in such a way,
 while I have given to the palace on your behalf 1,080 pounds of copper, and Umi-abum has likewise given 1,080 pounds of copper, apart from what we both have had written on a sealed tablet to be kept in the temple of Samas.
How have you treated me for that copper? You have withheld my money bag from me in enemy territory; it is now up to you to restore (my money) to me in full.
Take cognizance that (from now on) I will not accept here any copper from you that is not of fine quality. I shall (from now on) select and take the ingots individually in my own yard, and I shall exercise against you my right of rejection because you have treated me with contempt.`,
    metadata: {
  date: '1750 BCE',
      author: 'Nanni',
      researchGoals: 'Understand why Nanni hated Ea-Nasir.',
      additionalInfo: 'Clay tablet from Ur, sent from one merchant to another.',
      title: 'Complaint to Ea-nasir',
      documentEmoji: '𒀁',
      documentType: 'Letter',
      genre: 'Commercial Correspondence',
      placeOfPublication: 'Ur, Mesopotamia',
      academicSubfield: 'Ancient Near Eastern Studies',
      tags: ['Mesopotamia', 'Business History', 'Commercial Disputes'],
      summary: 'Ancient customer complaint about inferior copper',
      fullCitation: 'Nanni. "Complaint to Ea-nasir." Clay tablet letter, Ur, Mesopotamia, circa 1750 BCE. Translated by A. Leo Oppenheim.'
    }
  },

   // Spanish colonial document
  {
    emoji: "🌵",
    title: "Inquisition Peyote Ban",
    description: "1620 Spanish colonial edict banning the use of the psychedelic peyote cactus",
    text: `NOS LOS INQVISIDORES CONTRA LA HERETICA PRAVEDAD, Y APOSTASSIA
EN LA Ciudad de Mexico estados, y Prouincias de la Nueua Espafia, nueua Galicia, Guate-
mala, Nicaragua, Yucatan, Verapaz, Honduras, Yslas philipinas, y su distrito, y iurisdicion
por authoridad Appostolica. &c. Por quanto el vso de la Yerba o Raiz llamada Peyote, para
el effecto que en estas Prouincias se ha introducido de descubrir hurtos, y adebinar otros
succesos, y futuros c6tingentes occultos, es accion supersticiosa y reprouada oppuesta A la
purega, y sinceridad de nuestra Santa Fee Catholica, siendo ansi, que la dicha yerba, ni otra
alguna no pueden tener la virtud, y eficacia natural que se dize para los dichos effectos ni
para causar las ymagines, fantasmas y representaciones en que se fundan las dichas adeui-
naciones, y que en ellas se vee notoriamente la sugestion, y asistencia del demonio, autor
deste abuso, valiendose primero para introduzirle de la facilidad natural de los Indios, y de
su inclinacion a la idolatria, y deribondose (sic) despues A otras muchas personas poco temerosas
de Dios, y de fee muy informe, con cuyos excesos ha tomado mas fuerga el dicho vicio, y se
comete con la frequencia que se hecha deuer (sic). Y deui6do Nos por la obligacion de nuestro
cargo atajarle, y occurrir a los dafios, y graues offensas de Dios nuestro Sefior, que del resultan.
Auiendolo tratado, y conferido con personas doctas, y de rectas conciencias, acordamos dar la
presente para vos, y A cada vno de vos, por la qual exortamos, requirimos, y en virtud de santa
obediencia. y sopena de excomunion mayor latae sententiae trina Canonica monitione prae-
missa, y de otras penas pecuniarias, y corporeles (sic) a nuestro arbitrio reseruodas (sic).
Mandamos, que deaque adelante ninguna persona de qualquier grado, y condicion que sea
pueda vsar ni vse de la dicha yerba, del Peyote ni de otras para los dichos effectos, ni para otros
semejantes, debajo de ningun titulo, o color, ni hagan que los indios ni otras personas las
tomen con apercibimiento que lo contrario haciendo, demas deque abreys incurrido en las
dichas Censuras y penas, procederemos contra los q rebeldes e inobediftes fueredes, como c6tra
personas sospechosas en la santa fee Catholica.
Y por quito el dicho delicto ha estado hasta aqui ta introducido, y vsado como se sabe, y
nuestra intencion es prohibirle, y remediarle para adelante, y aquietar las concienias de las
personas que le an cometido queriendo vsar de venignidad, y de la comissi6 que para ello
tenemos del Illustrissimo sefior confesor de su Magestad, Inquisidor General en todos sus
Reynos, y Sefiorios, concedemos gracia, y remission de todo lo passado en el dicho excesso
hasta el dia de la publicacion deste nuestro Edicto, y prohibicion, y cometemos a qualasquiera
(sic) confesores seculares o regulares approbados por sus Ordinarios, licencia, y facultad para
absoluer del dicho delicto A los que como dicho es le vuieren cometido hasta aqui. Con tal que
la dicha absolucion no se estienda ' lo venidero ni A otros delictos, excesos hechicerias, y super-
sticiones de las contenidas en el Edicto general de la fee, y en los demas que en esta ragon hemos
mandado publicar los quales han de quedar en su fuerga, y obseruancia, y porque lo contenido
en esta carta venga A noticia de todos, y nadie lo pueda ygnorar, mandamos que se publeque
(sic) en todas la Ciudades Villas, y lugares de nuestro distrito. Dada en la Sala de nuestra
Audiencia A diez y nueue dias del mes de Iunio de mill y seiscientos y veinte afi`,
    metadata: {
       date: 'June 29, 1620',
      author: 'Don Pedro Nabarre de Isla',
      researchGoals: 'Investigate Spanish colonial attitudes toward indigenous spiritual practices.',
      additionalInfo: 'Document from the Spanish Inquisition in colonial Mexico banning the use of peyote.',
      title: 'Edict Prohibiting the Use of Peyote',
      documentEmoji: '🌵',
      documentType: 'Legal Edict',
      genre: 'Inquisition Document',
      placeOfPublication: 'Mexico City, New Spain',
      academicSubfield: 'Colonial Latin American History',
      tags: ['Spanish Inquisition', 'Indigenous Practices', 'Colonial Control'],
      summary: 'Official ban on psychoactive plant use in colonies',
      fullCitation: 'Nabarre de Isla, Don Pedro. "Edict Prohibiting the Use of Peyote." Mexico City: Holy Office of the Inquisition, June 29, 1620.'
    }
  },

// 17th century economic theory
  {
    emoji: "⚜️",
    title: "17th Century Economics",
    description: "Thomas Mun's influential economic treatise on trade, wealth, and national prosperity",
    text: `**The Means to enrich this Kingdom, and to encrease our Treasure.**

Although a Kingdom may be enriched by gifts received, or by purchase taken from some other Nations, yet these are things uncertain and of small consideration when they happen. Forraign Trade is the Rule of our Treasure.The ordinary means therefore to encrease our wealth and treasure is by Forraign Trade, wherein wee must ever observe this rule; to sell more to strangers yearly than wee consume of theirs in value. For suppose that when this Kingdom is pletifully served with the Cloth, Lead, Tinn, Iron, Fish and other native commodities, we doe yearly export the overplus to forraign Countries to the value of twenty two hundred thousand pounds; by which means we are enabled beyond the Seas to buy and bring in forraign wares for our use and Consumption, to the value of twenty hundred thousand pounds; By this order duly kept in our trading, we may rest assured that this order duly kept in our trading, we may rest assured that the Kingdom shall be enriched yearly two hundred thousand pounds, which must be brought to us in so much Treasure; because that part of our stock which is not returned to us in wares must necessarily be brought home in treasure.

For in this case it cometh to pass in the stock of a Kingdom, as in the estate of a private man; who is supposed to have one thousand pounds yearly revenue and two thousand pounds of ready money in his Chest: If such a man through excess shall spend one thousand five hundred pounds per annum, all his ready mony will be gone in four years; and in the like time his said money will be doubled if he take a Frugal course to spend but five hundred pounds per annum; which rule never faileth likewise in the Common-wealth, but in some cases (of no great moment) which I will hereafter declare, when I shall shew by whom and in what manner this ballance of the Kingdoms account ought to be drawn up yearly, or so often as it shall please the State to discover how much we gain or lose by trade with forraign Nations. But first I will say something concerning those ways and means which will encrease our exportations and diminish our importations of wares; which being done, I will then set down some other arguments both affirmative and negative to strengthen that which is here declared, and thereby to shew that all the other means which are commonly supposed to enrich the Kingdom with Treasure are altogether insufficient and meer fallacies.


Chap. III.

The particular ways and means to encrease the exportation of our commodities, and to decrease our Consumption of forraign wares.



The revenue or stock of a Kingdom by which it is provided of forraign wares is either Natural or Artificial. The Natural wealth is so much only as can be spared from our own use and necessities to be exported unto strangers. The Artificial consists in our manufactures and industrious trading with forraign commodities, concerning which I will set down such particulars as may serve for the cause we have in hand.

1. First, although this Realm be already exceeding rich by nature, yet might it be much encreased by laying the waste grounds (which are infinite) into such employments as should no way hinder the present revenues of other manufactured lands, but hereby to supply our selves and prevent the importations of Hemp, Flax, Cordage, Tobacco, and divers other things which now we fetch from strangers to our great impoverishing.

2. We may likewise diminish our importations, if we would soberly refrain from excessive consumption of forraign wares in our diet and rayment, with such often change of fashions as is used, so much the more to encrease the waste and charge; which vices at this present are more notorious amongst us than in former ages. Yet might they easily be amended by enforcing the observation of such good laws as are strictly practised in other Countries against the said excesses; where likewise by commanding their own manufactures to be used, they prevent the coming in of others, without prohibition, or offence to strangers in their mutual commerce.

3. In our exportations we must not only regard our own superfluities, but also we must consider our neighbours necessities, that so upon the wares which they cannot want, nor yet be furnished thereof elsewhere, we may (besides the vent of the Materials) gain so much of the manufacture as we can, and also endeavour to sell them dear, so far forth as the high price cause not a less vent in the quantity. But the superfluity of our commodities which strangers use, and may also have the same from other Nations, or may abate their vent by the use of some such like wares from other places, and with little inconvenience; we must in this case strive to sell as cheap as possible we can, rather than to lose the utterance of such wares. For we have found of late years by good experience, that being able to sell our Cloth cheap in Turkey, we have greatly encreased the vent thereof, and the Venetians have lost as much in the utterance of theirs in those Countreys, because it is dearer. And on the other side a few years past, when by excessive price of Wools our Cloth was exceeding dear, we lost at the least half our clothing for forraign parts, which since is no otherwise (well neer) recovered again than by the great fall of price for Wools and Cloth.The State in some occasions may gain most, when private men by their revenues get least. We find that twenty five in the hundred less in the price of these and some other Wares, to the loss of private mens revenues, may raise above fifty upon the hundred in the quantity vented to the benefit of the publique. For when Cloth is dear, other Nations doe presently practise clothing, and we know they want neither art nor materials to this performance. But when by cheapness we drive them from this employment, and so in time obtain our dear price again, then do they also use their former remedy. So that by these alterations we learn, that it is in vain to expect a greater revenue of our wares than their condition will afford, but rather it concerns us to apply our endeavours to the times with care and diligence to help our selves the best we may, by making our cloth and other manufactures without deceit, which will encrease their estimation and use.

4. The value of our exportations likewise may be much advanced when we perform it our selves in our own Ships, for then we get only not the price of our wares as they are worth here, but also the Merchants gains, the changes of ensurance, and fraight to carry them beyond the seas. As for example, if the Italian Merchants should come hither in their own shipping to fetch our Corn, our red Herrings or the like, in the case the Kingdom should have ordinarily but 25. s. for a quarter of Wheat, and 20. s. for a barrel of red herrings, whereas if we carry these wares our selves into Italy upon the said rates, it is likely that wee shall obtain fifty shillings for the first, and forty shillings for the last, which is a great difference in the utterance or vent of the Kingdoms stock. And although it is true that the commerce ought to be free to strangers to bring in and carry out at their pleasure, yet nevertheless in many places the exportation of victuals and munition are either prohibited, or at least limited to be done onely by the people and Shipping of those places where they abound.

5. The frugal expending likewise of our own natural wealth might advance much yearly to be exported unto strangers; and if in our rayment we will be prodigal, yet let this be done with our own materials and manufactures, as Cloth, Lace, Imbroderies, Cutworks and the like, where the excess of the rich may be the employment of the poor, whose labours notwithstanding of this kind, would be more profitable for the Commonwealth, if they were done to the use of strangers.

6. The Fishing in his Majesties seas of England, Scotland and Ireland is our natural wealth, and would cost nothing but labour, which the Dutch bestow willingly, and thereby draw yearly a very great profit to themselves by serving many places of Christendom with our Fish, for which they return and supply their wants both of forraign Wares and Mony, besides the multitude of Mariners and Shipping, which hereby are maintain'd, whereof a long discourse might be made to shew the particular manage of this important business. Our Fishing plantation likewise in New-England, Virginia, Groenland, the Summer Islands and the New-found-land, are of the like nature, affording much wealth and employments to maintain a great number of poor, and to encrease our decaying trade.

**How some States have been made Rich.**

7. A Staple or Magazin for forraign Corn, Indico, Spices, Raw-silks, Cotton wool or any other commodity whatsoever, to be imported will encrease Shipping, Trade, Treasure, and the Kings customes, by exporting them again where need shall require, which course of Trading, hath been the chief means to raise Venice, Genoa, the low-Countreys, with some others; and for such a purpose England stands most commodiously, wanting nothing to this performance but our own diligence and endeavour.

8. Also wee ought to esteem and cherish those trades which we have in remote or far Countreys, for besides the encrease of Shipping and Mariners thereby,The traffick in the East Indies is our most profitable trade in its proportion both for King and Kingdom. the wares also sent thither and receiv'd from thence are far more profitable unto the kingdom than by our trades neer at hand; As for example; suppose Pepper to be worth here two Shillings the pound constantly, if then it be brought from the Dutch at Amsterdam, the Merchant may give there twenty pence the pound, and gain well by the bargain, but if he fetch this Pepper from the East-indies, he must not give above three pence the pound at the most, which is a mighty advantage, not only in that part which serveth for our own use, but also for that great quantity which (from hence) we transport yearly unto divers other Nations to be sold at a higher price: whereby it is plain,We get more by the Indian wares than the Indians themselves. that we make a far greater stock by gain upon these Indian Commodities, than those Nations doe where they grow, and to whom they properly appertain, being the natural wealth of their Countries. But for the better understanding of this particular, we must ever distinguish between the gain of the Kingdom, and the profit of the Merchant; for although the Kingdom payeth no more for this Pepper than is before supposed, nor for any other commodity bought in forraign parts more than the stranger receiveth from us for the same,yet the Merchant payeth not only that price,A distinction between the Kingdoms gain and the Merchants profit. but also the fraight, ensurance, customes and other charges which are exceeding great in these long voyages; but yet all these in the Kingdoms accompt are but commutations among our selves, and no Privation of the Kingdoms stock, which being duly considered, together with the support also of our other trades in our best Shipping to Italy, France, Turkey, and East Countreys and other places, by transporting and venting the wares which we bring yearly from the East Indies; It may well stir up our utmost endeavours to maintain and enlarge this great and noble business, so much importing the Publique wealth, Strength, and Happiness. Neither is there less honour and judgment by growing rich (in this manner) upon the stock of other Nations, than by an industrious encrease of our own means, especially when this later is advanced by the benefit of the former, as we have found in the East Indies by sale of much of our Tin, Cloth, Lead and other Commodities, the vent whereof doth daily encrease in those Countreys which formerly had no use of our wares.

9. It would be very beneficial to export money as well as wares, being done in trade only, it would encrease our Treasure; but of this I write more largely in the next Chapter to prove it plainly.

10. It were policie and profit for the State to suffer manufactures made of forraign Materials to be exported custome-free, as Velvets and all other wrought Silks, Fustians, thrown Silks and the like, it would employ very many poor people, and much encrease the value of our stock yearly issued into other Countreys, and it would (for this purpose) cause themore foraign Materials to be brought in, to the improvement of His Majesties Customes. I will here remember a notable increase in our manufacture of winding and twisting only of forraign raw Silk, which within 35. years to my knowledge did not employ more than 300. people in the City and suburbs of London, where at this present time it doth set on work above fourteen thousand souls, as upon diligent enquiry hath been credibly reported unto His Majesties Commissioners for Trade. and it is certain, that if the raid forraign Commodities might be exported from hence, free of custome, this manufacture would yet encrease very much, and decrease as fast in Italy and in the Netherlands. But if any man allege the Dutch proverb, Live and let others live; I answer, that the Dutchmen notwithstanding their own Proverb, doe not onely in these Kingdoms, encroach upon our livings, but also in other forraign parts of our trade (where they have power) they do hinder and destroy us in our lawful course of living, hereby taking the bread out of our mouth, which we shall never prevent by plucking the pot from their nose, as of late years too many of us do practise to the great hurt and dishonour of this famous Nation; We ought rather to imitate former times in taking sober and worthy courses more pleasing to God and suitable to our ancient reputation.

11. It is needful also not to charge the native commodities with too great customes, lest by indearing them to the strangers use, it hinder their vent. And especially forraign wares brought in to be transported again should be favoured, for otherwise that manner of trading (so much importing the good of the Commonwealth) cannot prosper nor subsist. But the Consumption of such forraign wares in the Realm may be the more charged, which will turn to the profit of the kingdom in the Ballance of the Trade, and thereby also enable the King to lay up the more Treasure out of his yearly incomes, as of this particular I intend to write more fully in his proper place, where I shall shew how much money a Prince may conveniently lay up without the hurt of his subjects.

12. Lastly, in all things we must endeavour to make the most we can of our own, whether it be Natural or Artificial; And forasmuch as the people which live by the Arts are far more in number than they who are masters of the fruits, we ought the more carefully to maintain those endeavours of the multitude, in whom doth consist the greatest strength and riches both of the King and Kingdom: for where the people are many, and the arts good, there the traffique must be great, and the Countrey rich. The Italians employ a greater number of people, and get more money by their industry and manufactures of the raw Silks of the Kingdom of Cicilia, than the King of Spain and his Subjects have by the revenue of this rich commodity. But what need we fetch the example so far, when we know that our own natural wares doe not yield us so much profit as our industry? For Iron oar in the Mines is of no great worth, when it is compared with the employment and advantage it yields being digged, tried, transported, brought, sold, cast into Ordnance, Muskets, and many other instruments of war for offence and defence, wrought into Anchors, bolts, spikes, nayles and the like, for the use of Ships, Houses, Carts, Coaches, Ploughs, and other instruments for Tillage. Compare our Fleece-wools with our Cloth, which requires shearing, washing, carding, spinning, Weaving, fulling, dying, dressing and other trimmings, and we shall find these Arts more profitable than the natural wealth, whereof I might instance other examples, but I will not be more tedious, for if I would amplify upon this and the other particulars before written, I might find matter sufficient to make a large volume, but my desire in all is only to prove what I propound with brevity and plainness.
`,
    metadata: {
        date: '1664',
      author: 'Thomas Mun',
      researchGoals: 'Understand how the 17th century economic policies of Thomas Mun have resonance for the present day and for understanding early modern history.',
      additionalInfo: 'This is an excerpt from the book Englands treasure by forraign trade by Thomas Mun, a leading economic writer of 17th century England.',
      title: 'England\'s Treasure by Forraign Trade',
      documentEmoji: '👑',
      documentType: 'Book excerpt',
      genre: 'Economic Treatise',
      placeOfPublication: 'London, England',
      academicSubfield: 'Economic History',
      tags: ['Mercantilism', 'Early Modern Economics', 'Trade Policy'],
      summary: 'Early mercantilist tract on foreign trade balance',
      fullCitation: 'Mun, Thomas. England\'s Treasure by Forraign Trade. London: Thomas Clark, 1664.'
    }
  },
 
 // Native oral tradition source
{
  emoji: "🪶",
  title: "Delaware Oral Tradition",
  description: "Indigenous account of first European contact at Manhattan Island",
  text: `The following account of the first arrival of Europeans at York Island (now Manhattan) was related to me 
by aged and respected Delawares, Monseys, and Mahicanni (also called Mohicans or Mahicanders), around forty years ago. 
It is copied from notes and manuscripts taken on the spot.

A long time ago, when there were no people with a white skin, some Indians fishing where the sea widens 
saw something remarkably large floating on the water—something they had never seen before. 
They hurried to inform others, and soon many gathered to view it. Some thought it was a huge fish, others a house.

As it moved closer, they concluded it must contain the Great Mannitto (Supreme Being) 
and resolved to prepare a sacrifice and a grand dance to receive him. 
Women cooked the best food, idols were examined and cleaned, and conjurors worked to determine its meaning. 
All were in confusion—dancing, hoping, and fearing.

New runners came: it was a large house of many colors, full of creatures, unlike any they’d seen. 
One wore red and shone with strange lace—this must be the Mannitto. 
The ship hailed them in an unknown tongue. Many wanted to flee, but others urged them to stay to avoid offending the visitors.

A small canoe landed, carrying the red-clothed man and two others. 
He approached the chiefs, greeted them with a friendly face, and they returned the greeting. 
They were astonished by his skin, his dress, and especially the red garment.

A large hockhack (bottle) was produced, and a glass was poured and handed to the Mannitto, 
who drank, then offered it to the nearest chief. Each smelled it and passed it on. 
Finally, one warrior, fearing offense, stood up and drank it. He fell unconscious—believed dead— 
but awoke joyous, wanting more. Soon all joined him, and a general intoxication followed.

This is why the place is still called Mannahattanink—“the place of general intoxication.”

The next year, the vessel returned with more gifts—beads, axes, hoes, stockings. 
The Indians had worn axes as ornaments and used stockings as tobacco pouches. 
The Dutch demonstrated their use by cutting trees and digging ground. The Indians laughed at their past ignorance.

The Dutch asked for as much land as a bullock’s hide would cover. 
The Indians agreed, and the hide was cut into a thin strip and stretched to enclose a large area. 
Amazed by the cunning but not wishing to quarrel, they allowed it. 
But the whites returned, asking for more and more land—until, as they say, they wanted it all.

[End of relation.]`,
  metadata: {
    date: 'January 26, 1801',
    author: 'John Heckewelder (as told by Delaware, Monsey, and Mahican elders)',
    researchGoals: 'Understand Indigenous oral traditions about first contact with Europeans in the Northeast',
    additionalInfo: 'Original manuscript sent by Heckewelder to Rev. Samuel Miller; included in the 1819 publication by the American Philosophical Society, though altered from the original.',
    title: 'Indian Tradition of the First Arrival of the Dutch at Manhattan Island',
    documentEmoji: '🪶',
    documentType: 'Oral History',
    genre: 'Early Ethnography',
    placeOfPublication: 'Bethlehem, Pennsylvania',
    academicSubfield: 'Early American History / Indigenous Studies',
    tags: ['First Contact', 'Dutch Colonization', 'Lenape History', 'Oral Tradition', 'Manhattan'],
    summary: 'Native account of the Dutch arrival, interpreted as a divine visitation followed by intoxication and land transfer',
    fullCitation: 'Heckewelder, John. “Indian Tradition of the First Arrival of the Dutch at Manhattan Island.” Communicated to Rev. Samuel Miller, 1801. Later printed in American Philosophical Society Transactions, 1819.'
  }
},
 

    {
    emoji: "🎩",
    title: "Gettysburg Address",
     description: "Lincoln's famous Civil War speech dedicating a cemetery for fallen soldiers",
    text: `“Four score and seven years ago our fathers brought forth on this continent a new nation, conceived in liberty, and dedicated to the proposition that all men are created equal. Now we are engaged in a great civil war, testing whether that nation, or any nation so conceived and so dedicated, can long endure. 
    We are met on a great battlefield of that war. We have come to dedicate a portion of that field as a final resting place for those who here gave their lives that that nation might live. It is altogether fitting and proper that we should do this. 
    But in a larger sense we cannot dedicate, we cannot consecrate, we cannot hallow this ground. The brave men, living and dead, who struggled here have consecrated it, far above our poor power to add or detract. The world will little note, nor long remember, what we say here, but it can never forget what they did here. It is for us the living, rather, to be dedicated here to the unfinished work which they who fought here have thus far so nobly advanced. It is rather for us to be here dedicated to the great task remaining before us,that from these honored dead we take increased devotion to that cause for which they gave the last full measure of devotion, that we here highly resolve that these dead shall not have died in vain, that this nation, under God, shall have a new birth of freedom, and that government of the people, by the people, for the people, shall not perish from the earth.`,
    metadata: {
      date: '1863',
      author: 'Abraham Lincoln',
      researchGoals: 'Understand the historical context and in particular, who Lincoln was drawing on, referencing, and addressing himself to.',
      additionalInfo: 'Delivered during the American Civil War at the dedication of the Soldiers\' National Cemetery in Gettysburg, Pennsylvania.',
      title: 'Gettysburg Address',
      documentEmoji: '🪦',
      documentType: 'Speech',
      genre: 'Political Oratory',
      placeOfPublication: 'Gettysburg, Pennsylvania',
      academicSubfield: 'Political History',
      tags: ['Civil War', 'American History', 'Presidential Speech'],
      summary: 'A concise dedication honoring Union soldiers'
    }
  },

  // Medical text - 19th century pharmacology
{
  emoji: "🧪",
  title: "Über Coca",
  description: "1885 treatise by Sigmund Freud on the coca plant and its alkaloid, cocaine",
  text: `Über Coca  
Von Dr. Sigmund Freud, Sekundararzt im k. k. Allgemeinen Krankenhause in Wien.  
Neu durchgesehener und vermehrter Separatabdruck aus dem „Centralblatt für die gesamte Therapie“.  
WIEN, 1885. Verlag von Moritz Perles, Wien, Stadt, Bauernmarkt Nr. 11.

I. Die Cocapflanze.  
Die Cocapflanze, *Erythroxylon coca*, ist ein 4–6 Fuß hoher, unserem Schwarzdorn ähnlicher Strauch,  
der in Südamerika, insbesondere in Peru und Bolivia, in großem Umfange angebaut wird.  
Er gedeiht am besten in den warmen Tälern am Ostabhang der Anden, 5000–6000 Fuß über dem Meeresspiegel,  
in einem regenreichen, von Temperaturextremen freien Klima.

Die Blätter, welche etwa 10 Millionen Menschen als unentbehrliches Genussmittel dienen,  
sind eirund, 5–6 cm lang, gestielt, ganzrandig, bereift,  
durch zwei besonders an der unteren Fläche hervortretende, linienförmige Falten ausgezeichnet.  
Der Strauch trägt kleine weiße Blüten zu zweit oder dritt in seitlichen Büscheln und eiförmige rote Früchte.

Ein Cocastrauch gibt unter günstigen Verhältnissen 4–5 Blätterernten jährlich  
und bleibt 30–40 Jahre ertragsfähig.  
Bei der großen Produktion (angeblich 30 Millionen Pfund jährlich)  
sind die Cocablätter für diese Länder ein wichtiges Handels- und Steuerobjekt.

II. Geschichte und Verwendung im Lande.  
Die spanischen Eroberer fanden die Cocapflanze im Lande kultiviert und in hohem Ansehen,  
ja selbst in innige Beziehungen zu religiösen Gebräuchen gebracht.  
Die Sage erzählte, dass Manco Capac, der göttliche Sohn der Sonne,  
vom Titicacasee herabstieg, das Licht brachte und Coca schenkte –  
die Pflanze, „welche den Hungrigen sättigt, den Schwachen stärkt und sie ihr Missgeschick vergessen lässt“.

Cocablätter wurden Göttern geopfert, Toten in den Mund gesteckt,  
während der gottesdienstlichen Handlungen gekaut.  
Die Spanier sahen Coca zuerst als Teufelswerk und ein Konzil zu Lima verbot ihren Genuss.  
Aber als sie merkten, dass Indianer ohne Coca keine Arbeit in den Minen leisten konnten,  
begannen sie, Blätter auszuteilen – bis heute ein zentraler Bestandteil des Lebens.

Der Indianer trägt stets einen Beutel mit Cocablättern (chuspa) und eine Flasche mit Asche (llieta).  
Er formt aus den Blättern einen Bissen (acullico), durchbohrt ihn mit einem Stachel,  
taucht diesen in die Asche und kaut langsam mit reichlicher Speichelabsonderung.

III. Die Cocablätter in Europa – Das Cocain.  
Die älteste Empfehlung stammt von Monardes (Sevilla, 1569),  
später gefolgt von Berichten aus Lima, die die Wirkung gegen Hunger und Ermüdung lobten.  
1749 kam die Pflanze nach Europa, wurde von de Jussieu beschrieben  
und schließlich als *Erythroxylon coca* klassifiziert.

1859 isolierte Niemann aus Cocablättern ein Alkaloid – Cocain.  
Es kristallisiert in farblosen Prismen, schmeckt bitterlich,  
ruft Anästhesie hervor, schmilzt bei 98 °C, ist schwer wasserlöslich,  
bildet Doppelsalze mit Platin- und Goldchlorid.

Beim Erhitzen mit Salzsäure zerfällt es in Benzoesäure, Methylalkohol und Ecgonin.  
Lossen stellte die Formel C₁₇H₂₁NO₄ auf.  
Cocainsalze eignen sich wegen ihrer Löslichkeit besonders gut zur therapeutischen Anwendung.

Weitere Bestandteile der Cocablätter: Cocagerbsäure, ein eigentümliches Wachs,  
und das Hygrin – eine flüchtige Base mit trimethylaminähnlichem Geruch.

IV. Die Cocawirkung beim gesunden Menschen.  
Ich habe die Wirkung des Cocains an mir und anderen untersucht.  
0,05 g Cocain muriaticum in 1%iger Lösung führte bei mir zu  
„plötzlicher Aufheiterung und einem Gefühl von Leichtigkeit“,  
Pelzigkeit an Lippen und Gaumen, Wärmegefühl,  
manchmal Gähnen, vertiefte Atemzüge und Euphorie.

Die Stimmung ähnelt der normalen Gesundheitseuphorie –  
ohne alkoholisches Alterationsgefühl, kein Drang zur Betätigung,  
aber gesteigerte Selbstbeherrschung, geistige Ausdauer,  
und Aufhebung von Müdigkeit, Hunger und Schlafbedürfnis.

Ich habe diese Wirkung etwa ein Dutzend Mal beobachtet.  
Ein Kollege, nach einem langen Arbeitstag nüchtern,  
nahm 0,05 g Cocain und erklärte kurz darauf,  
er fühle sich „wie nach einem üppigen Mahl“ –  
wollte nicht essen, fühlte sich gestärkt für einen weiten Weg.

Diese Cocainwirkung zeigt sich regelmäßig bei geeigneter Dosis.  
Sie erklärt die Hochachtung, welche Coca bei südamerikanischen Völkern genießt,  
und rechtfertigt ihre weitere medizinische Untersuchung.`,
  metadata: {
    date: '1885',
    author: 'Sigmund Freud',
    researchGoals: 'Document and analyze Freud’s early scientific writings on psychoactive substances',
    additionalInfo: 'This is a large excerpt from Freud’s original 1885 pamphlet *Über Coca*, including botanical, historical, and experimental sections.',
    title: 'Über Coca',
    documentEmoji: '🧪',
    documentType: 'Scientific Pamphlet',
    genre: 'Medical Treatise',
    placeOfPublication: 'Vienna, Austria',
    academicSubfield: 'History of Medicine / Psychoanalysis',
    tags: ['Freud', 'Coca', 'Cocaine', '19th Century Medicine', 'Experimental Pharmacology'],
    summary: 'Freud’s detailed account of coca leaf use, its chemistry, indigenous history, and his personal trials with cocaine',
    fullCitation: 'Freud, Sigmund. *Über Coca*. Vienna: Verlag von Moritz Perles, 1885.'
  }
},
  // 20th century letter
  {
    emoji: "💌",
    title: "Virginia Woolf letter",
    description: "Intimate 1927 letter from Virginia Woolf to Vita Sackville-West discussing her novel Orlando",
    text: `Friday, October 13, 1927

…I’m so engulfed in Orlando I can think of nothing else …. Tomorrow I begin the chapter which describes Violet and you meeting on the ice ….  I am swarming with ideas. Do give me some inkling what sort of quarrels you had. Also, for what particular quality did she first choose you? Look here: I must come down and see you ….(I think of nothing but you all day long, in different guises, and Violet and the ice and Elizabeth and George the 3rd) ….

Orlando will be a little book, with pictures and a map or two. I make it up in bed at night, as I walk the streets, everywhere. I want to see you in lamplight, in your emeralds. In fact, I have never more wanted to see you than I do now—just to sit and look at you, and get you to talk, and then rapidly and secretly, correct certain doubtful points. About your teeth now and your temper. Is it true you grind your teeth at night? Is it, true that you love giving me pain? What and when was your moment of greatest disillusionment? …

 If you’ve given yourself to Campbell, I’ll have no more to do with you, and so it shall be written, plainly, for all the world to red in in Orlando. Tell me if you will come and when…

Dearest Mrs. Nicholson, Goodnight`,
    metadata: {
     date: 'October 13, 1927',
      author: 'Virginia Woolf',
      researchGoals: 'Understand sexuality, gender, and art in the early 20th century.',
      additionalInfo: 'Sent from Woolf to Vita Sackville-West, who was the inspiration for Woolf\'s novel Orlando.',
      title: 'Letter to Vita Sackville-West',
      documentEmoji: '💌',
      documentType: 'Personal Letter',
      genre: 'Literary Correspondence',
      placeOfPublication: 'London, England',
      academicSubfield: 'Modernist Literary Studies',
      tags: ['Bloomsbury Group', 'LGBTQ+ History', 'Literary Modernism'],
      summary: 'Intimate correspondence about writing Orlando',
    }
  },
  // Anthropological field notes - Balinese puppet making
{
  emoji: "🌏",
  title: "Margaret Mead's Bali Notes",
  description: "Margaret Mead and her Balinese secretary Madé Kalér’s field notes on Balinese shadow puppet craft and artisanship",
  text: `Kesoesrat: Nov. 5, 1937  
NEGARI.  
Batoe, Nov. 4, 1937  

DI IWARNE, TOEKANG WAJANG DI NEGARI:—  

10.46 "Pengoetik alih," keta I Wara ngomong teken adinne noemni.  
Abangaa patjek teken anak loeh.  
I Wara: "Boetin besik koenengan."  
Anak loeh: "Pakoe ada,"  
I Wara: "Pakoe kene ada noe."  

11.07 I Wara teken adinne ngomong: "tingting ko Batoeh."  
11.22 I Wara lakar nganglasin wajang.  
"Amplasan djemoes kang amplas mo."  

I Wara ngorahang wajang ane koena toesing ngangon perada,  
noemlenang lantas injemak wajang ane toesingemperedada:  
"Endang djamak kajoe-kajoeane."

**Perabot-perabot wajang ane keanggoen baan I Wara:**  
1. pengoetik  
2. antjoek  
3. patjek  
4. kothak wajang  
5. keoe misi ranggi  
6. sanjtji  
7. patj penggoep blomoe  
8. pengoët (semèt, sloosen)  
9. gegelik (dadoenan toek di semèt, tempékan)  
10. penoelian pengoetengan baan tiling  
11. kikir poetik  
12. patj pengrantjang  
13. patj poesoeboek  
14. keoe misi kentjoes  
15. poesoet  
16. kikir - 4  
17. penoelian pemolasan  
18. don amplas

**Definitions:**  
Pengoetik – anggon ngangsoed (ngodot beloelang di ngantiang ngoréhne)  
Poesoet – anggon masang tali  
Kikir – anggon menang pante di oesak-oesakne  

———  

**Field Note II – Mead, Negara, Nov. 4, 1937**  
Visit One, August 12.  
We found I Wara through Colin, who said he was particularly good and bought  
a very elegant Ardjoene for us as a present, to show how wajangs really should be made.  

Actually this Ardjoene, which I Wara calls "number setoe," is so thin it could never be used—  
a fragile style developed for sale.  

I Wara took us to a deserted *pekarangan* where the *gedong* of wajangs were kept.  
He didn’t know where the key was—sent a child to ask his father in the fields.  

His grandfather was a *dalang*. His father sold the *dalang box* to pay for a *seboen*.  
I Wara is not a real *dalang* but is rebuilding a box, collecting *mals* from Klengklengker.  

He is a professional wajang maker for shops in Badsoe.  
He works fast under deadline and distinguishes between:  
— no.1 (fragile display)  
— no.2 biasa (standard)  
— no.3 for *wajan-like novelmen*.  

His box is plain—he is not yet focused on elaborate *noekir*.  
Comparable to Fernando Mode's masks: beautiful, but topeng actors didn’t use them.  

Colin later said I Wara’s wajangs were “cold and lifeless” despite once calling them the best in Bali.  

Wara is slight, eager, fey, intelligent, and adaptive.  
He asks his wife’s advice on practicalities—timeline, advance payment, etc.  

We ordered 55 guilders worth of wajangs, paid 10 as deposit, and left.  
Returned later to arrange a series of partly completed *Damas*—he understood the request perfectly.

**Visit II for Photography**  
[handwritten note] Nov. 4, 1937  
[LEICA CINE MKE TIKIT noted in margin]`,
  metadata: {
    date: '1937-11-4',
    author: 'Margaret Mead & Madé Kalér',
    researchGoals: 'Document the tools, techniques, and craft hierarchy involved in Balinese wajang (shadow puppet) making',
    additionalInfo: 'Field notes from Mead and Kalér during the 1937–38 Bali expedition. Includes ethnographic transcription and personal observations. Original manuscripts housed at the Library of Congress.',
    title: 'Notes on Wajang-Making in Negara',
    documentEmoji: '🎭',
    documentType: 'Field Notes',
    genre: 'Ethnographic Observation',
    placeOfPublication: 'Negara & Batoe, Bali',
    academicSubfield: 'Cultural Anthropology / Performance Studies',
    tags: ['Margaret Mead', 'Wajang', 'Bali', 'Shadow Puppets', 'Craft Labor', 'Ethnography'],
    summary: 'Detailed notes and dialogue from Margaret Mead and Madé Kalér’s study of Balinese wajang production and its social structure',
    fullCitation: 'Mead, Margaret & Madé Kalér. “Notes on Wajang-Making in Negara.” Field Notes, November 1937. Margaret Mead Papers, Library of Congress.'
  }
}

];

const demoExtractConfigs: Record<number, ExtractInfoConfig> = {
  0: { // Gettysburg Address
    listType: "What people or groups are mentioned in Lincoln's speech?",
    fields: [
      "Name or group mentioned",
      "Context in which they appear", 
      "Significance to Lincoln's argument",
      "Line number or paragraph where mentioned"
    ]
  },
  1: { // Ancient Complaint
    listType: "What are Nanni's specific complaints?",
    fields: [
      "Specific complaints",
      "Severity level in context of Sumerian society",
      "Relevent quote in source",
    ]
  },
  2: { // Thomas Mun
    listType: "What countries does Mun mention in this source?",
    fields: [
      "What continent is the country on?",
      "What is Mun's opinion toward the country?",
      "What trade goods does he mention the country having?",
      "Specifically where in Mun's text is country mentioned?"
    ]
  },
  3: { // Spanish Inquisition
    listType: "What religious or spiritual practices and substances are mentioned?",
    fields: [
      "Name of practice or substance",
      "How is it characterized by the author in Spanish?",
      "English translation of the Spanish?",
      "Larger social context"
    ]
  },
  4: { // Virginia Woolf letter
    listType: "What literary references or metaphors does Woolf use?",
    fields: [
      "Reference or metaphor used?",
      "Emotional valence?",
      "Connection to Orlando (the novel)?",
      "Connection to Woolf's life at the time?"
    ]
  }
};

// utility function for quick routing of links in feature cards

const handleQuickDemo = (demoIndex: number, targetPanel: 'roleplay' | 'detailed-analysis' | 'counter' | 'references' | 'extract-info') => {
  // Disable metadata detection temporarily
  setDisableMetadataDetection(true);
  
  // Load the demo content
  setSelectedDemo(demoIndex);
  setTextInput(demoTexts[demoIndex].text);
  setLocalMetadata(demoTexts[demoIndex].metadata);
  
  // Set any relevant extract info configuration
  if (demoExtractConfigs[demoIndex]) {
    useAppStore.getState().setExtractInfoConfig(demoExtractConfigs[demoIndex]);
  }
  
  // Set the appropriate panel and any special modes
  useAppStore.getState().setActivePanel(targetPanel);
  
  if (targetPanel === 'roleplay') {
    useAppStore.getState().setRoleplayMode(true);
  }
  
  // Prepare the source content for analysis
  useAppStore.getState().setSourceContent(demoTexts[demoIndex].text);
  useAppStore.getState().setMetadata(demoTexts[demoIndex].metadata);
  useAppStore.getState().setLoading(true);
  
  // Re-enable metadata detection after a delay
  setTimeout(() => {
    setDisableMetadataDetection(false);
  }, 1000);
  
  // Navigate to analysis page
  router.push('/analysis');
  
  // If going to roleplay, set up a pre-populated input after page load
  if (targetPanel === 'roleplay') {
    // Define the message we'll pre-populate
    let suggestedQuestion = "";
    
      
      // Set appropriate initial questions based on demo index
      switch(demoIndex) {
        case 0: // Ea-nasir complaint
          suggestedQuestion = "Tell me more about the inferior quality of the copper ingots.";
          break;
        case 5: // Freud's cocaine treatise
          suggestedQuestion = "Herr Doktor Freud, Guten Tag. Could you tell me more about your personal experiences with coca?";
          break;
        case 7: // Margaret Mead's notes
          suggestedQuestion = "Who are you, what time is it, and what are you seeing in this moment?";
          break;
        case 4: // Delaware oral tradition
          suggestedQuestion = "Imagine you are Manhattan Island, narrating your own history. Begin.";
          break;
        default:
          suggestedQuestion = "Could you tell me more about this document?";
      }
      
    
    // Wait for the page to load, then find and populate the input
    setTimeout(() => {
      const inputElement = document.querySelector('input[placeholder*="Ask"]') as HTMLInputElement;
      if (inputElement) {
        inputElement.value = suggestedQuestion;
        
        // Force React to recognize the change
        const event = new Event('input', { bubbles: true });
        inputElement.dispatchEvent(event);
        
        // Try to focus the input so it's ready for the user to press Enter
        inputElement.focus();
      }
    }, 3000); // Increased to 3 seconds for better reliability
  }
};

  
  return (
  <main className="min-h-screen flex flex-col bg-slate-100/50 overflow-x-hidden overflow-y-auto">

    {/* Hero section with background image, gradient overlay and animation */}

<div className="relative shadow-2xl transition-all duration-1000 ease-out  overflow-hidden" 
     style={{ height: animateIn ? '240px' : '0px' }}>
  {/* banner image with enhanced overlay */}
  <div className="absolute inset-0 z-0">
    <Image 
      src="/sourcelens.jpg" 
      alt="SourceLens Background" 
      fill 
      priority
      className="object-cover" 
    />


    {/* Improved gradient overlay with subtle animation */}
    <div className="absolute inset-0 bg-gradient-to-r from-amber-900/20 via-amber-800/20 to-amber-700/60 backdrop-filter backdrop-brightness-70">
      <div className="absolute inset-0 opacity-10 mix-blend-overlay" 
           style={{ background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.15) 0%, transparent 80%)' }}></div>
    </div>
    {/* Enhanced bottom gradient for better text readability */}
    <div className="absolute bottom-0 left-0 w-full h-0 pointer-events-none" 
         style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.2), rgba(0,0,0,0.5))' }}></div>
  </div>
  
  {/* Enhanced Header controls with glass effect */}
  <div className="relative z-20 flex justify-between p-4">
    <div className="flex items-center">
      <span className="text-white/90 text-sm bg-white/10 backdrop-blur-sm py-1.5 px-3 rounded-full">
        BETA
      </span>
    </div>


    
  


    
    {/* Menu button with hover effect */}
    <div className=" backdrop-blur-sm p-2 rounded-xl hover:bg-white/20 transition-all duration-300">
      <HamburgerMenu />
    </div>

  </div>



  {/* Enhanced Hero content with improved typography and animations */}
  <div className="relative z-10 max-w-3xl mx-auto px-4 flex flex-col justify-center items-center text-center" 
       style={{ height: '28%', paddingTop: '20px' }}>
    <h1 
      className={`font-serif font-bold text-white mb-1 transition-all duration-1000 transform md:text-7xl ${
        animateIn ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}
      style={{ 
        textShadow: '0 2px 12px rgba(0, 0, 0, 0.8), 0 4px 12px rgba(0, 0, 0, 0.7)',
        letterSpacing: '-0.02em'
      }}
    >
      SourceLens
    </h1>
    
    <div 
      className={`h-0.5 w-44 bg-gradient-to-r from-amber-300/10 to-amber-200/80 my-2 transition-all duration-1000 transform ${
        animateIn ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
      }`}
    ></div>


    
    <p 
      className={`text-xl md:text-2xl text-white max-w-2xl transition-all duration-1000 delay-200 transform font-light ${
        animateIn ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}
      style={{ textShadow: '0 3px 16px rgba(0,0,0,0.9)' }}
    >
      Illuminate historical primary sources through multiple perspectives
    </p>


    
    {/* Enhanced buttons for About and Beginner's Guide */}
    <div className={`flex gap-4 mt-5 mb-5 transition-all duration-1000 delay-300 transform ${
      animateIn ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
    }`}>
      <button
        onClick={() => setShowAboutModal(true)}
        className="px-4 py-2 bg-blue-500/15 backdrop-blur-md cursor-pointer hover:bg-blue-600/40 hover:scale-105 transition-all duration-300 ease-in-out rounded-lg text-white text-sm font-medium border border-white/20 hover:border-white/40 shadow-lg hover:shadow-2xl"
      >
        <span className="flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          About
        </span>
      </button>
      
      <button
        onClick={() => setShowFAQModal(true)}
        className="px-4 py-2 bg-amber-500/15 backdrop-blur-md cursor-pointer hover:bg-amber-600/40 hover:scale-105 transition-all duration-300 ease-in-out rounded-lg text-white text-sm font-medium border border-amber-500/30 hover:border-amber-500/50 shadow-lg hover:shadow-2xl"
      >
        <span className="flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Beginner's Guide
        </span>
      </button>
      
      <button
        onClick={() => router.push('/library')}
        className="px-4 py-2 bg-purple-500/15 backdrop-blur-md cursor-pointer hover:bg-purple-600/40 hover:scale-105 transition-all duration-300 ease-in-out rounded-lg text-white text-sm font-medium border border-white/20 hover:border-white/40 shadow-lg hover:shadow-2xl"
      >
        <span className="flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Library
        </span>
      </button>
    </div>
  </div>

</div>

<div className="h-1 bg-gradient-to-r from-indigo-400 via-purple-400 to-amber-400 shadow-xl"></div>




    {/* Main content - Enhanced UI */}
<div className="flex-1 max-w-6xl mx-auto px-4 py-4 -mt-0 relative z-10">



  {/* Feature cards section - Enhanced with professional styling, reduced height */}
<div className={`flex flex-col md:flex-row items-start gap-4 transition-all duration-700 transform ${
  animateIn ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
}`}>
  
  {/* Multiple Perspectives - Refined Amber theme */}
  <div 
    className={`flex-1 bg-white border border-amber-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group ${
      expandedFeature === 0 ? 'ring-1 ring-amber-300' : ''
    }`}
  >
    <div 
      className="p-4 cursor-pointer flex items-center justify-between"
      onClick={() => setExpandedFeature(expandedFeature === 0 ? null : 0)}
    >
      <div className="flex items-center">
        <div className="w-9 h-9 mr-3 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:bg-amber-100 group-hover:text-amber-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="font-medium text-slate-800 text-base">Multiple Perspectives</h3>


      </div>


      
      <div className={`p-1 rounded-full transition-colors duration-300 ${expandedFeature === 0 ? 'bg-amber-50' : ''}`}>
        <svg 
          className={`w-4 h-4 text-amber-500 transition-transform duration-300 ${
            expandedFeature === 0 ? 'rotate-180' : ''
          }`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>


      </div>

    </div>
    
    <div 
      className={`overflow-hidden transition-all duration-300 ease-in-out ${
        expandedFeature === 0 ? 'max-h-48' : 'max-h-0'
      }`}
    >
      <div className="px-4 pb-4 pt-0">

        <div className="h-px bg-slate-100 w-full mb-3"></div>
        <p className="text-sm text-slate-600 leading-relaxed">
         Analyze and organize data in sources to uncover layers of meaning and interpretation that might otherwise remain hidden.
        </p>

{/* multiple perspectives example demos */}

 <div className="mt-4 flex flex-wrap gap-2 justify-start">
        <button
          className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
          onClick={() => {/* Implement auto-summarize */}}
        >
          <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          List all demons in a 17th century grimoire
        </button>
        <button
          className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
          onClick={() => {/* Implement language detection */}}
        >
          <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10m-11.048-2.5A18.022 18.022 0 0110 8.6" />
          </svg>
          Extract drug names from a pharmacopeia
        </button>
       
      </div>

      </div>

    </div>
    
    <div className={`h-0.5 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 transition-all duration-500 ${expandedFeature === 0 ? 'opacity-100' : 'opacity-0'}`}></div>
  </div>

  {/* Author Roleplay - Refined Blue theme */}
  <div 
    className={`flex-1 bg-white border border-blue-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group ${
      expandedFeature === 1 ? 'ring-1 ring-blue-300' : ''
    }`}
  >
    <div 
      className="p-4 cursor-pointer flex items-center justify-between"
      onClick={() => setExpandedFeature(expandedFeature === 1 ? null : 1)}
    >
      <div className="flex items-center">
        <div className="w-9 h-9 mr-3 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:bg-blue-100 group-hover:text-blue-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
          </svg>
        </div>
        <h3 className="font-medium text-slate-800 text-base">Author Roleplay</h3>
      </div>
      
      <div className={`p-1 rounded-full transition-colors duration-300 ${expandedFeature === 1 ? 'bg-blue-50' : ''}`}>
        <svg 
          className={`w-4 h-4 text-blue-500 transition-transform duration-300 ${
            expandedFeature === 1 ? 'rotate-180' : ''
          }`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
    
    <div 
      className={`overflow-hidden transition-all duration-300 ease-in-out ${
        expandedFeature === 1 ? 'max-h-48' : 'max-h-0'
      }`}
    >
      <div className="px-4 pb-4 pt-0">
        <div className="h-px bg-slate-100 w-full mb-3"></div>
        <p className="text-sm text-slate-600 leading-relaxed">
          Engage in simulated conversations with historical figures based on their writings and contexts to gain deeper insights into their worldview.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 justify-start">

        <button
          className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
          onClick={() => handleQuickDemo(0, 'roleplay')} // Index 1 is the Ea-nasir complaint demo
        >
          <svg className="w-3.5 h-3.5 mr-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          Discuss Ea-nāṣir's insultingly bad copper
        </button>

  <button
  className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
  onClick={() => handleQuickDemo(5, 'roleplay')} // Index 5 is the Freud's cocaine treatise
>
  <svg className="w-3.5 h-3.5 mr-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
  </svg>
  Ask a young Freud about his passion for cocaine
</button>
</div>
      </div>
    </div>
    
    <div className={`h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200 transition-all duration-500 ${expandedFeature === 1 ? 'opacity-100' : 'opacity-0'}`}></div>
  </div>
  
  {/* Counter-Narratives - Refined Purple theme */}
  <div 
    className={`flex-1 bg-white border border-purple-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group ${
      expandedFeature === 2 ? 'ring-1 ring-purple-300' : ''
    }`}
  >
    <div 
      className="p-4 cursor-pointer flex items-center justify-between"
      onClick={() => setExpandedFeature(expandedFeature === 2 ? null : 2)}
    >
      <div className="flex items-center">
        <div className="w-9 h-9 mr-3 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:bg-purple-100 group-hover:text-purple-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7h12m0 0l-4-4m4 4l-4 4m-4 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </div>
        <h3 className="font-medium text-slate-800 text-base">Counter-Narratives</h3>
      </div>
      
      <div className={`p-1 rounded-full transition-colors duration-300 ${expandedFeature === 2 ? 'bg-purple-50' : ''}`}>
        <svg 
          className={`w-4 h-4 text-purple-500 transition-transform duration-300 ${
            expandedFeature === 2 ? 'rotate-180' : ''
          }`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
    
    <div 
      className={`overflow-hidden transition-all duration-300 ease-in-out ${
        expandedFeature === 2 ? 'max-h-48' : 'max-h-0'
      }`}
    >
      <div className="px-4 pb-4 pt-0">
        <div className="h-px bg-slate-100 w-full mb-3"></div>
        <p className="text-sm text-slate-600 leading-relaxed">
          Discover alternative interpretations that challenge conventional views and surface overlooked aspects of history.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 justify-start">
  <button
    className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
    onClick={() => {/* Implement function */}}
  >
    <svg className="w-3.5 h-3.5 mr-1 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m-4 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
    Margaret Mead's forgotten Balinese assistant
  </button>
  <button
    className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
    onClick={() => {/* Implement function */}}
  >
    <svg className="w-3.5 h-3.5 mr-1 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  What if Manhattan narrated its own history?
  </button>
</div>
      </div>
    </div>
    

    {/* top gradient divider */}
    <div className={`h-0.5 bg-gradient-to-r from-purple-200 via-purple-400 to-purple-200 transition-all duration-500 ${expandedFeature === 2 ? 'opacity-100' : 'opacity-0'}`}></div>
  </div>
</div>

          
  {/* Input and metadata form */}
<div className="grid grid-cols-1 md:grid-cols-12 py-2 gap-4 mt-2">
  {/* Source input section with enhanced styling */}
  <div 
    className={`md:col-span-7 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-slate-200/80  ${
      animateIn ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
    }`}
  >
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 relative">
        <h2 className="text-xl font-medium text-slate-800 flex items-center">
         
          Input Your Primary Source
        </h2>
        
        {/* Demo button and dropdown section */}
        <div className="relative">
          {/* Demo options button */}
          <button 
            id="demo-options-button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowDemoOptions(!showDemoOptions);
            }}
            className="cursor-pointer text-amber-700 hover:text-amber-800 text-sm font-medium flex items-center gap-1 px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-all duration-300 shadow-md hover:shadow-lg"
            aria-expanded={showDemoOptions}
            aria-controls="demo-dropdown"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            See how it works
          </button>

          {/* Backdrop overlay when dropdown is open */}
          {showDemoOptions && (
            <div 
              className="fixed inset-0 bg-black/10  z-40 transition-opacity duration-300"
              onClick={() => setShowDemoOptions(false)}
              aria-hidden="true"
            />
          )}

          {/*  demo options dropdown */}

{showDemoOptions && (
  <div 
    id="demo-dropdown"
    className="absolute top-full right-0 mt-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-200 p-5 z-50 w-[380px] sm:w-[380px] max-h-[400px] overflow-y-auto" // Added max-height and overflow
    style={{
      animation: 'dropdownAppear 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      transformOrigin: 'top right'
    }}
  >
    {/* Add scroll indicator shadows */}
    <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white to-transparent pointer-events-none z-10"></div>
    <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent pointer-events-none z-10"></div>
    
  
    {/* Custom keyframes for dropdown animations */}
    <style jsx>{`
      @keyframes dropdownAppear {
        0% { opacity: 0; transform: scale(0.95) translateY(-10px); }
        50% { opacity: 1; }
        100% { opacity: 1; transform: scale(1) translateY(0); }
      }
      
      @keyframes itemsAppear {
        0% { opacity: 0; transform: translateY(8px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      
      .demo-item {
        animation: itemsAppear 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        opacity: 0;
      }
      
      .demo-item:nth-child(1) { animation-delay: 0.05s; }
      .demo-item:nth-child(2) { animation-delay: 0.1s; }
      .demo-item:nth-child(3) { animation-delay: 0.15s; }
      .demo-item:nth-child(4) { animation-delay: 0.2s; }
      .demo-item:nth-child(5) { animation-delay: 0.25s; }
      
      @keyframes fadeRotateIn {
        0% { opacity: 0; transform: rotate(-90deg); }
        100% { opacity: 1; transform: rotate(0); }
      }
      
      .close-btn-animate {
        animation: fadeRotateIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        animation-delay: 0.2s;
        opacity: 0;
      }
      
      .footer-animate {
        animation: itemsAppear 0.3s ease forwards;
        animation-delay: 0.3s;
        opacity: 0;
      }
    `}</style>
    
    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
      <h4 className="text-base font-semibold text-slate-800">Choose an example</h4>
      <button 
        onClick={() => setShowDemoOptions(false)}
        className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-full hover:bg-slate-100 close-btn-animate"
        aria-label="Close dropdown"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    
    <div className="flex flex-col gap-2">
      {demoTexts.map((demo, index) => (
        <div key={index} className="relative group demo-item">
          <button
            onClick={() => {
              loadDemoContent(index);
              setShowDemoOptions(false);
            }}
            className={`flex items-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-all duration-300 hover:shadow-md ${
              selectedDemo === index ? 'ring-2 ring-amber-500 shadow-amber-100/50' : 'shadow-sm'
            } w-full text-left group`}
          >
            <div className="flex items-center w-full">
              <div className="flex items-center justify-center min-w-12 h-12 bg-slate-50 text-2xl transition-all duration-300 group-hover:bg-amber-50 group-hover:text-amber-600"> 
                <span className="transition-transform duration-300 group-hover:scale-110">
                  {demo.emoji}
                </span>
              </div>
              <div className="px-3 py-2 text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                {demo.title}
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 group-hover:text-slate-600">
                  {demo.description || "Explore this historical text"}
                </p>
              </div>
              <div className="ml-auto pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            
          {/* Hover effect overlay */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-amber-100/0 to-amber-100/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-100/20 to-transparent translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
              </div>
            </button>
          </div>
        ))}
      </div>
              
              <div className="mt-3 pt-2 border-t border-slate-100 text-xs text-center text-slate-500">
                You can also upload your own document. Try it!
              </div>
            </div>
          )}
        </div>
      </div>

          {/* Tooltips rendered OUTSIDE the scrollable container */}
    {demoTexts.map((demo, index) => (
      <div key={`tooltip-${index}`} className={`opacity-0 fixed right-0 top-0 mr-4 w-64 p-3 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 z-[100] group-hover:opacity-100 transition-all duration-300 pointer-events-none`}
           id={`tooltip-${index}`}
      >
        <div className="relative">
          <div className="absolute right-[-12px] top-3 w-3 h-3 bg-white rotate-45 border-r border-t border-slate-200"></div>
          <p className="text-[13px] italic text-slate-600">
            {demo.description || "Explore this historical text with SourceLens"}
          </p>
        </div>
      </div>
    ))}
 
              
      {/* Enhanced Tabs with Indicator Animation */}
      <div className="relative flex border-b border-slate-200 mb-3">
        <button 
          className={`px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === 'text' 
              ? 'text-amber-700 bg-slate-100/50' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setActiveTab('text')}
        >
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Text Input
          </span>
        </button>
        <button 
          className={`px-4 py-2  text-sm font-medium transition-colors ${
            activeTab === 'file' 
              ? 'text-amber-700 bg-slate-100/50' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setActiveTab('file')}
        >
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            File Upload
          </span>
        </button>
        <button 
          className={`px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === 'audio' 
              ? 'text-amber-700 bg-slate-100/50' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setActiveTab('audio')}
        >
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            Audio Upload
          </span>
        </button>
        
        {/* Animated tab indicator */}
        <div 
          className="absolute bottom-0 h-0.5 bg-amber-500 transition-all duration-300 ease-in-out"
          style={{
            left: activeTab === 'text' ? '0%' : activeTab === 'file' ? '21%' : '42%',
            width: '18%',
            transformOrigin: 'center'
          }}
        />
      </div>

      <UploadProgress 
        show={showProgressIndicator}
        progress={uploadProgress}
        currentMessage={currentProgressMessage}
        messages={progressMessages}
      />


              
          {/* AI Vision toggle with model selection - place this after the file drop zone in page.tsx */}
          {activeTab === 'file' && (
            <div className="bg-indigo-50 p-4 rounded-md border border-indigo-100 mt-3">
              <div className="flex flex-col space-y-3">
                {/* Toggle switch */}
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={useAIVision}
                      onChange={() => setUseAIVision(!useAIVision)}
                      disabled={uploadingFile}
                    />
                    <div className={`block w-14 h-8 rounded-full ${useAIVision ? 'bg-indigo-600' : 'bg-gray-300'} transition-colors duration-300`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ${useAIVision ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </div>
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-900">Use AI Vision for text extraction</span>
                    <p className="text-xs text-slate-600 mt-1">
                      {useAIVision 
                        ? "AI Vision will be used as the primary method to extract text"
                        : "Traditional OCR will be tried first, with AI Vision used only as a fallback"}
                    </p>
                  </div>
                </label>
                
                {/* Only show model selection when AI Vision is enabled */}
                {useAIVision && (
                  <div className="mt-2 flex items-center gap-3 pl-14">
                    <input
                      type="radio"
                      id="model-gemini"
                      name="visionModel"
                      value="gemini-2.0-pro-exp-02-05"
                      checked={fields.visionModel === 'gemini-2.0-pro-exp-02-05'}
                      onChange={() => setFields({...fields, visionModel: 'gemini-2.0-pro-exp-02-05'})}
                      disabled={uploadingFile}
                      className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                    <label htmlFor="model-gemini" className="text-sm text-slate-700">
                      Gemini 2.0 Pro (Default)
                    </label>
                    
                    <input
                      type="radio"
                      id="model-claude"
                      name="visionModel"
                      value="claude-3-haiku-20240307"
                      checked={fields.visionModel === 'claude-3-haiku-20240307'}
                      onChange={() => setFields({...fields, visionModel: 'claude-3-haiku-20240307'})}
                      disabled={uploadingFile}
                      className="text-indigo-600 focus:ring-indigo-500 h-4 w-4 ml-4"
                    />
                    <label htmlFor="model-claude" className="text-sm text-slate-700">
                      Claude 3.5 Haiku
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}



      {/* Text input area */}
      {activeTab === 'text' && (
          <div className="relative rounded-xl  transition-all duration-300 group-focus-within:shadow-[0_0_0_2px_rgba(245,158,11,0.4),0_8px_24px_rgba(0,0,0,0.08)] group-hover:shadow-md">
          <textarea
          className="w-full h-72 p-5 text-slate-700 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl focus:outline-none transition-all duration-300 resize-none placeholder:text-transparent text-base"
          placeholder="Paste or type your primary source text here..."
          id="source-text-input"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          onPaste={handleTextPaste}
          onDragOver={handleTextAreaDragOver}
          onDragLeave={handleTextAreaDragLeave}
        />

<label 
  htmlFor="source-text-input"
  className={`absolute left-5 top-2 transition-all duration-300 ease-in-out pointer-events-none text-slate-500
    ${textInput.length > 0 
      ? 'opacity-0 translate-y-[-10px]' 
      : 'opacity-100 translate-y-0'
    } 
    group-focus-within:text-amber-700 group-focus-within:bg-white group-focus-within:px-1 group-focus-within:z-10`}
>
  Paste or type your primary source text here, or drag and drop a PDF
</label>

      
 {/* "Lens" buttons below main source entry */}
    
    <p className="mt-3 ml-2 text-slate-500 text-sm italic font-medium">
      After uploading a source, you can analyze it with one of the following methods:
    </p>
    
    <div className="mt-3 grid grid-cols-5 gap-3">
      {/* Detailed Analysis Button */}
      <button className=" bg-white border border-amber-200 shadow-sm text-slate-700 py-3 px-2 rounded-lg hover:bg-gradient-to-b hover:from-white hover:to-amber-50 hover:scale-[1.02] hover:shadow-lg transition-colors transition-shadow transition-transform duration-300 ease-in-out flex flex-col items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed group "
        onClick={() => {
          if (formValid) {
            setSourceContent(textInput);
            setMetadata(metadata);
            setLoading(true);
            setActivePanel('detailed-analysis');
            router.push('/analysis');
          }
        }}
        disabled={!formValid}
      >
        <div className="flex items-center justify-center h-8 w-8 bg-amber-100 text-amber-700 group-hover:bg-amber-200 group-hover:text-amber-800 group-hover:shadow-[0_0_10px_rgba(251,191,36,0.3)] rounded-full mb-1.5 transition-all duration-300">
          <svg className="w-4 h-4 transform group-active:scale-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <span className="text-sm font-medium group-hover:text-amber-900 transition-colors duration-300">Detailed Analysis</span>
      </button>

      {/* Extract Info Button */}
<button 
  className="bg-white border border-emerald-200 shadow-sm text-slate-700 py-3 px-2 rounded-lg hover:bg-gradient-to-b hover:from-white hover:to-emerald-50 hover:scale-[1.02] hover:shadow-lg transition-colors transition-shadow transition-transform duration-300 ease-in-out flex flex-col items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed group"
  onClick={() => {
    if (formValid) {
      setSourceContent(textInput);
      setMetadata(metadata);
      setLoading(true);
      setActivePanel('extract-info');
      router.push('/analysis');
    }
  }}
  disabled={!formValid}
>
  <div className="flex items-center justify-center h-8 w-8 bg-emerald-100 text-emerald-700 group-hover:bg-emerald-200 group-hover:text-emerald-800 group-hover:shadow-[0_0_10px_rgba(5,150,105,0.3)] rounded-full mb-1.5 transition-all duration-300">
    <svg className="w-4 h-4 transform group-active:scale-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M19 13l-4 4m0 0l-4-4m4 4V7" />
    </svg>
  </div>
  <span className="text-sm font-medium group-hover:text-emerald-900 transition-colors duration-300">Extract Info</span>
</button>

    
      {/* References Button */}
    <button 
      className="bg-white border border-amber-400/90 shadow-sm text-slate-700 py-3 px-2 rounded-lg hover:bg-gradient-to-b hover:from-white hover:to-amber-50/80 hover:scale-[1.02] hover:shadow-lg transition-colors transition-shadow transition-transform duration-300 ease-in-out flex flex-col items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed group" 
      onClick={() => {
        if (formValid) {
          setSourceContent(textInput);
          setMetadata(metadata);
          setLoading(true);
          setActivePanel('references');
          router.push('/analysis');
        }
      }}
      disabled={!formValid}
    >
        <div className=" flex items-center justify-center h-8 w-8 bg-amber-600 text-white group-hover:bg-amber-700 group-hover:shadow-[0_0_12px_rgba(217,119,6,0.4)] rounded-full mb-1.5 transition-colors transition-shadow transition-transform duration-300 ">
          <svg className="w-4 h-4 transform group-active:scale-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <span className="text-sm font-medium group-hover:text-amber-900 transition-colors duration-300">Find References</span>
      </button>
      
      {/* Talk to the Author Button */}
      <button
        className=" bg-white border border-blue-200 shadow-sm text-slate-700 py-3 px-2 rounded-lg hover:bg-gradient-to-b hover:from-white hover:to-blue-50 hover:scale-[1.02] hover:shadow-lg transition-colors transition-shadow transition-transform duration-300 ease-in-out flex flex-col items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed group"
        onClick={() => {
          if (formValid) {
            setSourceContent(textInput);
            setMetadata(metadata);
            setLoading(true);
            setActivePanel('roleplay');
            setRoleplayMode(true);
            router.push('/analysis');
          }
        }}
        disabled={!formValid}
      >
        <div className="flex items-center justify-center h-8 w-8 bg-blue-100 text-blue-700 group-hover:bg-blue-200 group-hover:text-blue-800 group-hover:shadow-[0_0_10px_rgba(59,130,246,0.3)] rounded-full mb-1.5 transition-colors transition-shadow transition-transform duration-300">
          <svg className="w-4 h-4 transform group-active:scale-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
          </svg>
        </div>
        <span className="text-sm font-medium group-hover:text-blue-900 transition-colors duration-300">Talk to the author</span>
      </button>
      
      {/* Counter-Narrative Button */}
      <button
        className="bg-white border border-purple-200 shadow-sm text-slate-700 py-3 px-2 rounded-lg hover:bg-gradient-to-b hover:from-white hover:to-purple-50 hover:scale-[1.02] hover:shadow-lg transition-all duration-300 ease-in-out flex flex-col items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed group"
        onClick={() => {
          if (formValid) {
            setSourceContent(textInput);
            setMetadata(metadata);
            setLoading(true);
            setActivePanel('counter');
            router.push('/analysis');
          }
        }}
        disabled={!formValid}
      >
        <div className="flex items-center justify-center h-8 w-8 bg-purple-100 text-purple-700 group-hover:bg-purple-200 group-hover:text-purple-800 group-hover:shadow-[0_0_10px_rgba(147,51,234,0.3)] rounded-full mb-1.5 transition-all duration-300">
          <svg className="w-4 h-4 transform group-active:scale-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m-4 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </div>
        <span className="text-sm font-medium group-hover:text-purple-900 transition-colors duration-300">Counter-Narrative</span>
      </button>
    </div>
  </div>
)}
              
           {/* File upload */}
           {activeTab === 'file' && (
             <div 
               className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center transition-colors hover:bg-slate-50 hover:border-amber-700/50 cursor-pointer h-40 flex flex-col items-center justify-center relative"
               onDragOver={(e) => {
                 e.preventDefault();
                 e.stopPropagation();
                 e.currentTarget.classList.add('border-amber-500', 'bg-amber-50/50');
               }}
               onDragLeave={(e) => {
                 e.preventDefault();
                 e.stopPropagation();
                 e.currentTarget.classList.remove('border-amber-500', 'bg-amber-50/50');
               }}
               onDrop={handleFileDrop}
               onClick={() => fileInputRef.current?.click()}
             >
               <svg className="w-8 h-8 mx-auto text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
               </svg>
               <p className="text-slate-700 font-medium">Drag & drop your file here</p>
               <p className="text-xs text-slate-500 mt-1">or click to browse (PDF, JPG, PNG, TXT)</p>
               
               {/* Hidden file input that will be triggered on click */}
               <input 
                 type="file" 
                 className="hidden" 
                 ref={fileInputRef}
                 onChange={handleFileSelect} 
                 accept=".pdf,.jpg,.jpeg,.png,.txt" 
               />
             </div>
           )}
            </div>
          </div>

         
          
       {/* Metadata form section */}
       <div 
         className={`md:col-span-5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200 overflow-hidden transition-all duration-700 delay-200 transform ${
           animateIn ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
         }`}
       >
         <div className="p-6">
           <div className="flex justify-between items-center mb-4">
             <h2 className="text-xl font-medium text-slate-800 flex items-center">
               <svg className="w-5 h-5 mr-2 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
               Source Information
             </h2>
             
             {/* Metadata detection indicator */}
             {isExtractingMetadata && (
               <div className="text-xs text-amber-700 flex items-center">
                 <div className="w-3 h-3 border-2 border-amber-700 border-t-transparent rounded-full animate-spin mr-1"></div>
                 Detecting metadata...
               </div>
             )}
           </div>
           
           {/* Show metadata alert when detected */}
           {showMetadataPrompt && detectedMetadata && (
             <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
               <div className="flex justify-between items-start mb-2">
                 <h3 className="text-sm font-medium text-amber-900">Metadata Detected</h3>
                 <button 
                   onClick={() => setShowMetadataPrompt(false)}
                   className="text-amber-700 hover:text-amber-900 text-xs"
                 >
                   &times;
                 </button>
               </div>
               
               <p className="text-xs text-amber-800 mb-2">
                 We've detected information that might be relevant:
                 {detectedMetadata.title && <span className="block mt-1">• Title: {detectedMetadata.title}</span>}
                 {detectedMetadata.author && <span className="block mt-0.5">• Author: {detectedMetadata.author}</span>}
                 {detectedMetadata.date && <span className="block mt-0.5">• Date: {detectedMetadata.date}</span>}
                 {detectedMetadata.documentType && <span className="block mt-0.5">• Type: {detectedMetadata.documentType}</span>}
               </p>
               
               <button
                 onClick={applyDetectedMetadata}
                 className="w-full py-1.5 bg-amber-600 text-white text-xs rounded hover:bg-amber-700 transition-colors"
               >
                 Apply Detected Metadata
               </button>
             </div>
           )}
           
           <div className="space-y-3">
             {/* Required fields */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
               {/* Date input */}
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">
                   Date <span className="text-red-500">*</span>
                 </label>
                 <input
                   type="text"
                   className="w-full p-2 border border-slate-300 rounded-md focus-visible:ring-2 focus-visible:ring-amber-700/50 focus-visible:border-amber-700/70 transition-colors"
                   placeholder="When was this created?"
                   value={metadata.date}
                   onChange={(e) => setLocalMetadata({...metadata, date: e.target.value})}
                 />
               </div>
               
               {/* Author input */}
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">
                   Author <span className="text-red-500">*</span>
                 </label>
                 <input
                   type="text"
                   className="w-full p-2 border border-slate-300 rounded-md focus-visible:ring-2 focus-visible:ring-amber-700/50 focus-visible:border-amber-700/70 transition-colors"
                   placeholder="Who created it?"
                   value={metadata.author}
                   onChange={(e) => setLocalMetadata({...metadata, author: e.target.value})}
                 />
               </div>
             </div>
             
             {/* Title input */}
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">
                 Title (Optional)
               </label>
               <input
                 type="text"
                 className="w-full p-2 border border-slate-300 rounded-md focus-visible:ring-2 focus-visible:ring-amber-700/50 focus-visible:border-amber-700/70 transition-colors"
                 placeholder="Title or name of document"
                 value={metadata.title || ''}
                 onChange={(e) => setLocalMetadata({...metadata, title: e.target.value})}
               />
             </div>
             
             {/* Document Type & Tags */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
               {/* Document Type */}
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">
                   Document Type (Optional)
                 </label>
                 <input
                   type="text"
                   className="w-full p-2 border border-slate-300 rounded-md focus-visible:ring-2 focus-visible:ring-amber-700/50 focus-visible:border-amber-700/70 transition-colors"
                   placeholder="Letter, Article, etc."
                   value={metadata.documentType || ''}
                   onChange={(e) => setLocalMetadata({...metadata, documentType: e.target.value})}
                 />
               </div>
               
               {/* Tags */}
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">
                   Tags (Optional)
                 </label>
                 <input
                   type="text"
                   className="w-full p-2 border border-slate-300 rounded-md focus-visible:ring-2 focus-visible:ring-amber-700/50 focus-visible:border-amber-700/70 transition-colors"
                   placeholder="Comma-separated tags"
                   value={Array.isArray(metadata.tags) ? metadata.tags.join(', ') : metadata.tags || ''}
                   onChange={(e) => setLocalMetadata({
                     ...metadata, 
                     tags: e.target.value.split(',').map(tag => tag.trim())
                   })}
                 />
               </div>
             </div>
             
         
             
             {/* Research Goals input */}
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Research Goals (Optional)
              </label>
               <textarea
                 className="w-full p-2 border border-slate-300 rounded-md focus-visible:ring-2 focus-visible:ring-amber-700/50 focus-visible:border-amber-700/70 transition-colors resize-none"
                 rows={2}
                 placeholder="What are you hoping to learn from this source?"
                 value={metadata.researchGoals}
                 onChange={(e) => setLocalMetadata({...metadata, researchGoals: e.target.value})}
               ></textarea>
             </div>
             
             {/* Additional Context input */}
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">
                 Additional Info (Optional)
               </label>
               <textarea
                 className="w-full p-2 border border-slate-300 rounded-md focus-visible:ring-2 focus-visible:ring-amber-700/50 focus-visible:border-amber-700/70 transition-colors resize-none"
                 rows={2}
                 placeholder="Any other context that might help?"
                 value={metadata.additionalInfo}
                 onChange={(e) => setLocalMetadata({...metadata, additionalInfo: e.target.value})}
               ></textarea>
             </div>
           </div>
         </div>
         
         <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
           <button
             onClick={handleSubmit}
             disabled={!formValid}
             className={`w-full py-2.5 px-4 rounded-md font-medium text-white transition-all duration-300 transform ${
               formValid 
                 ? 'bg-amber-700 hover:bg-amber-800 active:scale-[0.98] shadow-lg hover:shadow'
                 : 'bg-slate-400 cursor-not-allowed'
             }`}
           >
             {formValid ? 'Analyze Source' : 'Complete Required Fields'}
           </button>
           
           {!formValid && (
             <p className="mt-2 text-xs text-slate-500 text-center">
               Please fill in all required fields and provide source text
             </p>
           )}
         </div>
       </div>
        </div>
      </div>



      
      {/* Divider for footer */}
      <div className="h-1.5 bg-gradient-to-r from-indigo-400 via-purple-400 to-amber-400 shadow-md"></div>
      
      {/* Footer with blue-gray overlay and background image */}
      <footer className="relative py-12 ">
        {/* Background image with overlay */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/splashbackground.jpg" 
            alt="Footer Background" 
            fill 
            className="object-cover" 
          />
          {/* Blue-gray overlay */}
          <div className="absolute inset-0 bg-slate-800/92 "></div>
        </div>
        
        {/* Footer content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-white text-2xl font-bold mb-4">About SourceLens</h3>
          <p className="text-slate-200 mb-6 text-xl max-w-2xl mx-auto">
            Built for scholars and professional researchers, SourceLens is an experiment in how AI models can <em>augment</em>, not replace, human curiosity and knowledge.
          </p>
          <p className="text-slate-300 text-m">
            This is an experimental tool that helps researchers examine sources through various "lenses" provided by Large Language Models. The goal is to generate fresh insights by seeing a source askance. Rather than treating AI as an oracle, what happens if we treat it as a naive and untrustworthy (but nevertheless interesting) research assistant? 
          </p>
          <div className="mt-8 pt-6 border-t border-slate-700/50">
            <p className="text-slate-400 text-sm">
              © 2025 Benjamin Breen • Made in Santa Cruz, CA · <a href="#" className="text-indigo-300 hover:text-indigo-200 transition-colors">Privacy Policy</a> · <a href="#" className="text-indigo-300 hover:text-indigo-200 transition-colors">Terms of Service</a>
</p>

             <p className="text-slate-400 text-xs">
              SourceLens is designed exclusively for use with public domain historical sources.  
            </p>
          </div>
        </div>
      </footer>

    {/* area for Modal components */}
    <AboutModal 
      isOpen={showAboutModal} 
      onClose={() => setShowAboutModal(false)} 
    />
    
    <FAQModal 
      isOpen={showFAQModal} 
      onClose={() => setShowFAQModal(false)} 
    />

    </main>
  );
}


