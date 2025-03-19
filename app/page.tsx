// app/page.tsx
// Splash page. the starting point for the app 

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import HamburgerMenu from '@/components/ui/HamburgerMenu';
import AboutModal from '@/components/ui/AboutModal';
import FAQModal from '@/components/ui/FAQModal';
import { useAppStore, Metadata } from '@/lib/store';


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
  // Add the new fields with initial empty values
  title: '',
  summary: '',
  documentEmoji: ''
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
      metadata.author.trim().length > 0 && 
      metadata.researchGoals.trim().length > 0
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
    
    // Add the new fields with null checks
    if (detectedMetadata.title) {
      newMetadata.title = detectedMetadata.title;
    }
    
    if (detectedMetadata.summary) {
      newMetadata.summary = detectedMetadata.summary;
    }
    
    if (detectedMetadata.documentEmoji) {
      newMetadata.documentEmoji = detectedMetadata.documentEmoji;
    }
    
    return newMetadata;
  });
  
  // Hide the prompt after applying
  setShowMetadataPrompt(false);
};

const processFile = async (file: File) => {
  setFileError(null);
  
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
  
  try {
    let extractedText = '';
    
    // For text files, read directly in the browser
    if (isText) {
      extractedText = await file.text();
      setTextInput(extractedText);
      
      // Try to extract metadata from the text
      await extractMetadata(extractedText);
      
      setUploadingFile(false);
      return;
    }
    
    // For PDFs and images, send to the API for processing
    const formData = new FormData();
    formData.append('file', file);
    
    console.log("Sending file to API:", file.name, "type:", file.type);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API error response:", response.status, errorData);
      throw new Error(`Server responded with ${response.status}: ${errorData.message || ''}`);
    }
    
    const data = await response.json();
    console.log("API processing successful with method:", data.processingMethod);
    
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
} finally {
  setUploadingFile(false);
}
};

const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (files && files.length > 0) {
    processFile(files[0]);
  }
};
 // Replace the current handleSubmit function in app/page.tsx with this one
const handleSubmit = () => {
  if (!formValid) return;
  
  // Create a final metadata object that includes all fields
  const finalMetadata = {
    ...metadata,
    // Add the optional fields safely
    title: metadata.title || detectedMetadata?.title,
    summary: detectedMetadata?.summary,
    documentEmoji: detectedMetadata?.documentEmoji
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
  
  // Hide the demo options after selection
  setTimeout(() => {
    setShowDemoOptions(false);
    
    // Re-enable metadata detection after a delay to ensure the demo content is fully loaded
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
  
  const features = [
    {
      title: "Multiple Perspectives",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: "Analyze sources through different theoretical and contextual lenses to uncover layers of meaning and interpretation that might otherwise remain hidden.",
    },
    {
      title: "Author Roleplay",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
        </svg>
      ),
      description: "Engage in simulated conversations with historical figures based on their writings, contexts, and known perspectives to gain deeper insights into their worldview.",
    },
    {
      title: "Counter-Narratives",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m-4 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      description: "Discover alternative interpretations that challenge conventional views, highlighting marginalized perspectives and revealing overlooked aspects of historical narratives.",
    }
  ];

  const demoTexts = [
  // Lincoln's Gettysburg Address (existing)
  {
    emoji: "🎩",
    title: "Gettysburg Address",
     description: "Lincoln's famous Civil War speech dedicating a cemetery for fallen soldiers",
    text: `Four score and seven years ago our fathers brought forth on this continent, a new nation, conceived in Liberty, and dedicated to the proposition that all men are created equal.

Now we are engaged in a great civil war, testing whether that nation, or any nation so conceived and so dedicated, can long endure. We are met on a great battle-field of that war. We have come to dedicate a portion of that field, as a final resting place for those who here gave their lives that that nation might live. It is altogether fitting and proper that we should do this.`,
    metadata: {
      date: '1863',
      author: 'Abraham Lincoln',
      researchGoals: 'Understand the historical context and in particular, who Lincoln was drawing on, referencing, and addressing himself to.',
      additionalInfo: 'Delivered during the American Civil War at the dedication of the Soldiers\' National Cemetery in Gettysburg, Pennsylvania.'
    }
  },
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
      additionalInfo: 'Clay tablet from Ur, sent from one merchant to another.'
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

How some States have been made Rich.7. A Staple or Magazin for forraign Corn, Indico, Spices, Raw-silks, Cotton wool or any other commodity whatsoever, to be imported will encrease Shipping, Trade, Treasure, and the Kings customes, by exporting them again where need shall require, which course of Trading, hath been the chief means to raise Venice, Genoa, the low-Countreys, with some others; and for such a purpose England stands most commodiously, wanting nothing to this performance but our own diligence and endeavour.

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
      additionalInfo: 'This is an excerpt from the book Englands treasure by forraign trade by Thomas Mun, a leading economic writer of 17th century England.'
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
      researchGoals: 'Investigate Spanish colonial exploration and early mapping of the California coast.',
      additionalInfo: 'Document from the exploration of the California coastline during the Spanish colonial period.'
    }
  },
  // 19th century letter
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
      additionalInfo: 'Sent from Woolf to Vita Sackville-West.'
    }
  }
];
  
  return (
  <main className="min-h-screen flex flex-col bg-slate-200/90 overflow-x-hidden overflow-y-auto">
    {/* Hero section with background image, gradient overlay and animation */}
    <div className="relative shadow-2xl transition-all duration-1000 ease-out" 
         style={{ height: animateIn ? '280px' : '0px' }}>
      {/* banner image with overlay */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/sourcelens.jpg" 
          alt="SourceLens Background" 
          fill 
          priority
          className="object-cover" 
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/10 via-amber-800/10 to-amber-700/50 backdrop-filter backdrop-brightness-85"></div>
        {/* Dark gradient at bottom */}
        <div className="absolute bottom-0 left-0 w-full h-32 pointer-events-none" 
             style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.15), rgba(0,0,0,0.35))' }}></div>
      </div>
      
      {/* Header controls */}
      <div className="relative z-20 flex justify-end p-4">
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm py-1.5 px-4 rounded-full animate-pulse mr-4">
            <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
            <span className="text-sm font-medium text-white">Processing...</span>
          </div>
        )}
        
        {/* Menu button */}
        <HamburgerMenu />
      </div>

      {/* Hero content */}
      <div className="relative z-10 max-w-2xl mx-auto px-3 flex flex-col justify-center items-center text-center" 
           style={{ height: '50%', paddingTop: '0px' }}>
        <h1 
          className={`font-serif font-bold text-white/90 mb-1 transition-all duration-1000 transform md:text-6xl ${
            animateIn ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
          style={{ 
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.9), 0 4px 8px rgba(0, 0, 0, 0.9), 0 10px 14px rgba(0, 0, 0, 0.9)',
            letterSpacing: '-0.01em'
          }}
        >
          SourceLens
        </h1>
        
        <div 
          className={`h-0.5 w-38 bg-amber-200/60 my-3 transition-all duration-1000 transform ${
            animateIn ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
          }`}
        ></div>
        
        <p 
          className={`text-lg md:text-xl text-white max-w-2xl transition-all duration-1000 delay-200 transform ${
            animateIn ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
          style={{ textShadow: '0 3px 13px rgba(0,0,0,0.99)' }}
        >
          Illuminate historical primary sources through multiple perspectives
        </p>
        
      {/* New buttons for About and Beginner's Guide */}
      <div className={`flex gap-5 mt-6 transition-all duration-1000 delay-300 transform ${
        animateIn ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}>
        <button
          onClick={() => setShowAboutModal(true)}
          className="px-3 py-1 bg-blue-400/30 backdrop-blur cursor-pointer hover:bg-blue-800/40 hover:scale-102 transition-all duration-300 ease-in-out rounded-lg text-white text-sm font-bold border border-white/20 hover:border-white/40 shadow-xl hover:shadow-2xl"
        >
          About
        </button>
        
        <button
          onClick={() => setShowFAQModal(true)}
          className="px-4 py-2 bg-amber-200/30 backdrop-blur-sm cursor-pointer hover:bg-amber-500/40 hover:scale-102 transition-all duration-300 ease-in-out rounded-lg text-white text-sm font-bold border border-amber-500/30 hover:border-amber-500/50 shadow-xl hover:shadow-2xl"
        >
          Beginner's Guide
        </button>
      </div>
      </div>
    </div>


    {/* Main content */}
      <div className="flex-1 max-w-6xl mx-auto px-4 py-8 -mt-6 relative z-10">
        {/* Feature cards section */}
        <div className={`flex flex-col md:flex-row items-start gap-3 transition-all duration-700 transform ${
          animateIn ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>


          {/* Multiple Perspectives - Amber theme */}
          <div 
            className={`bg-white border border-amber-100 rounded-lg shadow-sm hover:shadow transition-all duration-300 overflow-hidden group ${
              expandedFeature === 0 ? 'bg-amber-50/50' : ''
            }`}
          >
            <div 
              className="p-4 cursor-pointer"
              onClick={() => setExpandedFeature(expandedFeature === 0 ? null : 0)}
            >
              <div className="flex items-center mb-2">
                <div className="mr-3 bg-amber-100 text-amber-700 rounded-md p-1.5 transition-colors duration-300 group-hover:bg-amber-200 group-hover:text-amber-800">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-medium text-amber-900">Multiple Perspectives</h3>
                
                <div className="ml-auto">
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
                className={`overflow-hidden transition-all duration-300 ${
                  expandedFeature === 0 ? 'max-h-30 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-sm text-amber-800/80 mt-1">Analyze sources through different theoretical and contextual lenses to uncover layers of meaning and interpretation that might otherwise remain hidden.</p>
              </div>
            </div>
            <div className={`h-0.5 bg-gradient-to-r from-amber-200 to-amber-300 transition-all duration-500 ${expandedFeature === 0 ? 'opacity-100' : 'opacity-0'}`}></div>
          </div>


          
          {/* Author Roleplay - Blue theme */}
          <div 
            className={`bg-white border border-blue-100 rounded-lg shadow-sm hover:shadow transition-all duration-300 overflow-hidden group ${
              expandedFeature === 1 ? 'bg-blue-50/50' : ''
            }`}
          >
            <div 
              className="p-4 cursor-pointer"
              onClick={() => setExpandedFeature(expandedFeature === 1 ? null : 1)}
            >
              <div className="flex items-center mb-2">
                <div className="mr-3 bg-blue-100 text-blue-700 rounded-md p-1.5 transition-colors duration-300 group-hover:bg-blue-200 group-hover:text-blue-800">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                </div>
                <h3 className="font-medium text-blue-900">Author Roleplay</h3>
                
                <div className="ml-auto">
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
                className={`overflow-hidden transition-all duration-300 ${
                  expandedFeature === 1 ? 'max-h-30 opacity-90' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-sm text-blue-800/80 mt-1">Engage in simulated conversations with historical figures based on their writings, contexts, and known perspectives to gain deeper insights into their worldview.</p>
              </div>
            </div>
            <div className={`h-0.5 bg-gradient-to-r from-blue-200 to-blue-300 transition-all duration-500 ${expandedFeature === 1 ? 'opacity-100' : 'opacity-0'}`}></div>
          </div>


          
          {/* Counter-Narratives - Purple theme */}
          <div 
            className={`bg-white border border-purple-100 rounded-lg shadow-sm hover:shadow transition-all duration-300 overflow-hidden group ${
              expandedFeature === 2 ? 'bg-purple-50/50' : ''
            }`}
          >
            <div 
              className="p-4 cursor-pointer"
              onClick={() => setExpandedFeature(expandedFeature === 2 ? null : 2)}
            >
              <div className="flex items-center mb-2">
                <div className="mr-3 bg-purple-100 text-purple-700 rounded-md p-1.5 transition-colors duration-300 group-hover:bg-purple-200 group-hover:text-purple-800">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m-4 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h3 className="font-medium text-purple-900">Counter-Narratives</h3>
                

                <div className="ml-auto">
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
                className={`overflow-hidden transition-all duration-300 ${
                  expandedFeature === 2 ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-sm text-purple-800/80 mt-1">Discover alternative interpretations that challenge conventional views, highlighting marginalized perspectives and revealing overlooked aspects of historical narratives.</p>
              </div>
            </div>
            <div className={`h-0.5 bg-gradient-to-r from-purple-200 to-purple-300 transition-all duration-500 ${expandedFeature === 2 ? 'opacity-100' : 'opacity-0'}`}></div>
          </div>


        </div>


              
        {/* Input and metadata form */}
        <div className="grid grid-cols-1 md:grid-cols-12 py-3 gap-6">
          {/* Source input section */}
          <div 
            className={`md:col-span-7 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200 overflow-hidden transition-all duration-700 delay-100 transform ${
              animateIn ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            <div className="p-6">


              <div className="flex justify-between items-center mb-2 relative">
                <h2 className="text-xl font-medium text-slate-800 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Input Your Primary Source
                </h2>
                
               {/* demobutton and dropdown section */}
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
                   />
                 )}

                 {/* Demo options dropdown */}
{showDemoOptions && (
  <div 
    className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-slate-200 p-6 z-50 w-full md:w-auto"
  >
    <h4 className="text-sm font-medium text-slate-700 mb-2 ">Choose an example:</h4>
    <div className="flex flex-col gap-2">
      {demoTexts.map((demo, index) => (
        <div key={index} className="relative group">
          <button
            onClick={() => loadDemoContent(index)}
            className={`flex items-center rounded-lg border rounded-lg border-slate-200 bg-white hover:bg-slate-100/70 transition-colors duration-300 hover:shadow-md ${
              selectedDemo === index ? 'ring-2 ring-amber-500 rounded-lg shadow-md' : 'shadow-sm'
            } w-full text-left`}
          >
            <div className="flex items-center">
              <div className="flex items-center rounded-lg justify-center w-15 h-15 bg-slate-50  text-3xl transition-colors transition-shadow transition-transform duration-300 group-hover:bg-slate-400/20 group-hover:shadow-[0_0_8px_rgba(253,224,71,0.8),0_0_4px_rgba(253,224,71,0.1)]"> 
                <span className="transition-transform duration-300 group-hover:scale-110 group-hover:text-amber-700">
                  {demo.emoji}
                </span>
              </div>
              <div className="px-4 py-2 text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                {demo.title}
              </div>
            </div>
          </button>
          
          {/* Tooltip that appears on hover */}
          <div className="opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-300 absolute right-full top-0 mr-4 w-64 p-2 bg-white rounded-lg shadow-lg border border-slate-200 z-20">
            <p className="text-[13px] italic text-slate-600">
              {demo.description || "Explore this historical text with SourceLens"}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
               </div>
               </div>
              
              {/* Tabs */}
              <div className="flex border-b border-slate-200 mb-4">
                <button 
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'text' 
                      ? 'border-amber-700 text-amber-700' 
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                  onClick={() => setActiveTab('text')}
                >
                  Text Input
                </button>
                <button 
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'file' 
                      ? 'border-amber-700 text-amber-700' 
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                  onClick={() => setActiveTab('file')}
                >
                  File Upload
                </button>
              </div>
              
            
             {/* Text input */}
{activeTab === 'text' && (
  <div>
    <textarea
      className="w-full h-64 p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
      placeholder="Paste or type your primary source text here..."
      value={textInput}
      onChange={(e) => setTextInput(e.target.value)}
      onPaste={handleTextPaste}
    />
    
    <p className="mt-3 text-slate-500 text-xs font-medium">
      After uploading a source, analyze it or select one of the specialized options below.
    </p>
    
    <div className="mt-3 grid grid-cols-4 gap-3">
      {/* Detailed Analysis Button */}
      <button className=" bg-white border border-amber-200 shadow-sm text-slate-700 py-3 px-2 rounded-lg hover:bg-gradient-to-b hover:from-white hover:to-amber-50 hover:scale-[1.02] hover:shadow-lg transition-colors transition-shadow transition-transform duration-300 ease-in-out flex flex-col items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed group "
        onClick={() => {
          if (formValid) {
            setSourceContent(textInput);
            setMetadata(metadata);
            setLoading(true);
            setActivePanel('analysis');
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
      {/* Date input */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Date <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className="w-full p-2 border border-slate-300 rounded-md focus-visible:ring-2 focus-visible:ring-amber-700/50 focus-visible:border-amber-700/70 transition-colors"
          placeholder="When was this created? (e.g., 1865)"
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
          placeholder="Who created this? (Use 'Unknown' if anonymous)"
          value={metadata.author}
          onChange={(e) => setLocalMetadata({...metadata, author: e.target.value})}
        />
      </div>
      
      {/* Research Goals input */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Research Goals <span className="text-red-500">*</span>
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
          Additional Context (Optional)
        </label>
        <textarea
          className="w-full p-2 border border-slate-300 rounded-md focus-visible:ring-2 focus-visible:ring-amber-700/50 focus-visible:border-amber-700/70 transition-colors resize-none"
          rows={2}
          placeholder="Any other context that might help with analysis"
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
      <footer className="relative py-12 overflow-hidden">
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
