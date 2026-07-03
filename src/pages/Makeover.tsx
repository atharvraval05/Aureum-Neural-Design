import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Wand2, Palette, Image as ImageIcon, Check, ArrowRight, RefreshCw, Download, Share2, History, Trash2, X, Upload, Lightbulb, ShoppingBag, Undo2, Redo2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from '../lib/utils';
import { GoogleGenAI } from "@google/genai";

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';
import { LogIn } from 'lucide-react';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

import { useNavigate } from 'react-router-dom';

const Makeover = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedStyle, setSelectedStyle] = useState('Japandi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [transformationHistory, setTransformationHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [aiTips, setAiTips] = useState<string[]>([]);
  const [furnitureSuggestions, setFurnitureSuggestions] = useState<any[]>([]);

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const container = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const position = ((x - container.left) / container.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, position)));
  };

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      }
    };
    checkKey();
  }, []);

  const styles = [
    { name: 'Modern', desc: 'Clean lines & functional', color: 'bg-[#E5D3B3]' },
    { name: 'Classic', desc: 'Timeless & elegant', color: 'bg-[#4A4A4A]' },
    { name: 'Minimalist', desc: 'Pure & essential', color: 'bg-[#F0F0F0]' },
    { name: 'Urban', desc: 'Raw & industrial', color: 'bg-[#8B4513]' },
    { name: 'Bohemian', desc: 'Eclectic & free', color: 'bg-[#D2B48C]' },
    { name: 'Coastal', desc: 'Breezy & light', color: 'bg-[#E0FFFF]' },
    { name: 'Luxury', desc: 'Rich & sophisticated', color: 'bg-[#FFD700]' },
    { name: 'Rustic', desc: 'Warm & natural', color: 'bg-[#F5F5DC]' },
  ];

  useEffect(() => {
    if (!user) {
      setHistory([]);
      return;
    }

    const q = query(
      collection(db, 'makeovers'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const historyData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHistory(historyData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'makeovers');
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const scanned = localStorage.getItem('aureum_captured_room');
    if (scanned) {
      setUploadedImage(scanned);
      localStorage.removeItem('aureum_captured_room');
    }
  }, []);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = event.target?.result as string;
        setUploadedImage(img);
        setResultImage(null);
        setTransformationHistory([img]);
        setHistoryIndex(0);
      };
      reader.readAsDataURL(file);
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setResultImage(newIndex === 0 ? null : transformationHistory[newIndex]);
    }
  };

  const redo = () => {
    if (historyIndex < transformationHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setResultImage(transformationHistory[newIndex]);
    }
  };

  const handleShare = async () => {
    if (!resultImage) return;
    
    try {
      const response = await fetch(resultImage);
      const blob = await response.blob();
      const file = new File([blob], `aureum-design-${selectedStyle.toLowerCase()}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'My Aureum Design Makeover',
          text: `Check out my ${selectedStyle} room makeover created with Aureum Neural Design!`,
        });
      } else if (navigator.share) {
        await navigator.share({
          title: 'My Aureum Design Makeover',
          text: `Check out my ${selectedStyle} room makeover created with Aureum Neural Design!`,
          url: window.location.href,
        });
      } else {
        throw new Error('Web Share not supported');
      }
    } catch (err) {
      console.log('Error sharing:', err);
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Design link copied to clipboard!');
      } catch (clipErr) {
        alert('Unable to share. Please download the image instead.');
      }
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    
    try {
      const link = document.createElement('a');
      link.href = resultImage;
      link.download = `aureum-makeover-${selectedStyle.toLowerCase()}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Download failed. Please try right-clicking the image to save.');
    }
  };

  const saveHistorySafely = (newHistory: any[]) => {
    try {
      localStorage.setItem('aureum_makeover_history', JSON.stringify(newHistory));
    } catch (err) {
      console.warn('LocalStorage quota exceeded, clearing oldest entries');
      if (newHistory.length > 1) {
        // Try saving with fewer items
        saveHistorySafely(newHistory.slice(0, -1));
      }
    }
  };

  const handleTransform = async () => {
    if (!uploadedImage) {
      alert('Please upload a room photo first.');
      return;
    }

    // Check for API key before proceeding
    if (window.aistudio) {
      const selected = await window.aistudio.hasSelectedApiKey();
      if (!selected) {
        // We can proceed with the default key for free models if available, 
        // but it's better to let the user know we're using the free tier.
        console.log("Using default free-tier API key.");
      }
    }

    setIsProcessing(true);
    setProgress(0);
    
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return 95;
        return prev + (100 - prev) * 0.1;
      });
    }, 500);

    try {
      const spatialDataStr = localStorage.getItem('aureum_spatial_data');
      const spatialData = spatialDataStr ? JSON.parse(spatialDataStr) : null;

      // Create a new instance right before the call to get the latest API key
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY });
      const base64Data = uploadedImage.split(',')[1] || uploadedImage;
      
      // Parallel calls for Image Generation and Analysis
      const [imageResponse, analysisResponse] = await Promise.all([
        ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: 'image/jpeg',
                },
              },
              {
                text: `ULTRA-PHOTOREALISTIC INTERIOR DESIGN MAKEOVER (PREMIUM INDIAN LUXURY): 
                Transform this room into a high-end ${selectedStyle} space.
                
                CORE DIRECTIVES FOR ARCHITECTURAL FIDELITY:
                - NO HALLUCINATIONS: Do not add floating objects, extra limbs, or nonsensical furniture.
                - STRUCTURAL PERSISTENCE: Maintain the exact floor-to-ceiling height, window placements, and door positions.
                - MATERIAL AUTHENTICITY: Use premium Indian materials: Polished Teak wood, Statuario marble, brushed brass, and hand-woven silk upholstery.
                - LIGHTING MASTERCLASS: Implement realistic "Ray-Traced" lighting. Warm ambient glows (2700K-3000K) combined with natural daylight from windows.
                - INDIAN CONTEXT: Subtle luxury touches like indoor Areca palms, contemporary Indian art, and high-end lighting fixtures (e.g., White Teak Company style).
                - PEOPLE PRESERVATION: If humans are present, keep them exactly as they are.
                - FINAL OUTPUT: A crisp, 4K-quality photograph that looks like it was shot for Architectural Digest India.`,
              },
            ],
          },
          config: {
            imageConfig: {
              aspectRatio: "16:9"
            }
          }
        }),
        ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: {
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: 'image/jpeg',
                },
              },
              {
                text: `Analyze this room and provide interior design insights for a ${selectedStyle} makeover in a high-end Indian context.
                Return the response in STRICT JSON format with the following structure (NO trailing commas):
                {
                  "tips": ["tip 1", "tip 2", "tip 3", "tip 4"],
                  "furniture": [
                    {
                      "name": "Furniture Name",
                      "price": "₹Price",
                      "image": "https://images.unsplash.com/photo-...",
                      "link": "https://www.amazon.in/s?k=...",
                      "store": "Amazon India"
                    }
                  ]
                }
                Provide 4 professional tips focused on Indian homes (climate, space, materials) and 3 specific furniture suggestions. 
                Use realistic Unsplash image URLs for furniture. 
                The links should be search results on Amazon.in, Pepperfry, or IKEA India for the specific item.`,
              },
            ],
          },
          config: {
            responseMimeType: 'application/json'
          }
        })
      ]);

      let newResult = null;
      for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          newResult = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (!newResult) throw new Error("No image generated");

      const analysisDataText = analysisResponse.text || '{}';
      const cleanedJson = analysisDataText.replace(/```json/g, '').replace(/```/g, '').trim();
      const analysisData = JSON.parse(cleanedJson);
      setAiTips(analysisData.tips || [
        "Consider adding more natural light by using sheer curtains.",
        "A large area rug would help define the seating area.",
        "Try incorporating some indoor plants to enhance the biophilic feel.",
        "The current lighting is a bit harsh; warm-toned bulbs would create a cozier atmosphere."
      ]);

      setFurnitureSuggestions(analysisData.furniture || [
        { name: "Minimalist Oak Sofa", price: "$1,299", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=200&auto=format&fit=crop", link: "https://www.amazon.com/s?k=minimalist+oak+sofa", store: "Amazon" },
        { name: "Brushed Brass Floor Lamp", price: "$249", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=200&auto=format&fit=crop", link: "https://www.ikea.com/us/en/search/?q=brass+floor+lamp", store: "IKEA" },
        { name: "Jute Area Rug", price: "$399", image: "https://images.unsplash.com/photo-1575414003591-ece8d0416c7a?q=80&w=200&auto=format&fit=crop", link: "https://www.amazon.com/s?k=jute+area+rug", store: "Amazon" }
      ]);

      setProgress(100);
      setResultImage(newResult);
      
      // Save to Firestore
      if (user) {
        try {
          await addDoc(collection(db, 'makeovers'), {
            uid: user.uid,
            style: selectedStyle,
            originalImage: uploadedImage,
            resultImage: newResult,
            tips: analysisData.tips || [],
            furniture: analysisData.furniture || [],
            createdAt: serverTimestamp()
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, 'makeovers');
        }
      }
      
      // Update transformation history for undo/redo

      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#997A3D', '#FFFFFF', '#262320']
      });
    } catch (err: any) {
      console.error('Transformation error:', err);
      const errorMsg = typeof err === 'string' ? err : JSON.stringify(err);
      
      if (errorMsg.includes("403") || errorMsg.includes("PERMISSION_DENIED") || errorMsg.includes("Requested entity was not found")) {
        alert("There was a permission issue. This might be due to API limits or region restrictions. Please try again in a moment or ensure your API key is correctly configured.");
        if (window.aistudio) {
          await window.aistudio.openSelectKey();
          setHasKey(true);
        }
      } else {
        alert('AI Transformation failed: ' + (err.message || errorMsg));
      }
    } finally {
      clearInterval(progressInterval);
      setIsProcessing(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('aureum_makeover_history');
  };

  return (
    <div className="pt-24 lg:pt-32 pb-20 px-4 lg:px-6 min-h-screen bg-luxury-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 lg:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold mb-4 block">Generative Transformation</span>
            <h1 className="text-4xl md:text-7xl font-serif font-bold mb-6 text-ink">AI Style <span className="text-gold italic">Makeover</span></h1>
            <p className="text-ink-light max-w-2xl mx-auto font-medium text-sm lg:text-base">
              Upload a photo of your room and let our AI reimagine it in any style you desire. 
              Instant transformations, professional results.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Controls */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-luxury-gray border border-black/5 rounded-[32px] lg:rounded-[40px] p-6 lg:p-8 shadow-sm">
              <h3 className="font-serif font-bold text-lg lg:text-xl mb-6 flex items-center gap-3 text-ink">
                <Palette className="w-5 h-5 text-gold" />
                Select Style
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                {styles.map((style) => (
                  <button
                    key={style.name}
                    onClick={() => setSelectedStyle(style.name)}
                    className={cn(
                      "p-4 lg:p-5 rounded-2xl border transition-all flex flex-col lg:flex-row lg:items-center justify-between group text-left",
                      selectedStyle === style.name 
                        ? "bg-ink border-ink text-white shadow-xl shadow-black/10" 
                        : "bg-white border-black/5 hover:border-gold/30 text-ink"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("w-2 h-2 rounded-full", style.color)} />
                      <div>
                        <p className="font-bold text-xs lg:text-sm">{style.name}</p>
                        <p className={cn("text-[8px] lg:text-[10px] uppercase tracking-wider mt-0.5", selectedStyle === style.name ? "text-white/60" : "text-ink/40")}>
                          {style.desc}
                        </p>
                      </div>
                    </div>
                    {selectedStyle === style.name && <Check className="w-3 h-3 lg:w-4 lg:h-4" />}
                  </button>
                ))}
              </div>
            </div>

                <div className="p-6 rounded-3xl bg-gold/5 border border-gold/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-3 h-3 text-gold" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gold">Design Insight</span>
                  </div>
                  <p className="text-[10px] text-ink/60 leading-relaxed italic font-medium">
                    "The ${selectedStyle} style emphasizes spatial harmony. Our AI will focus on balancing your existing layout with modern aesthetic principles."
                  </p>
                </div>

            <button 
              onClick={handleTransform}
              disabled={isProcessing || !uploadedImage}
              className="w-full py-5 lg:py-6 bg-gold text-white font-bold rounded-[24px] lg:rounded-[32px] hover:bg-ink transition-all flex items-center justify-center gap-3 shadow-xl shadow-gold/20 disabled:opacity-50 uppercase tracking-widest text-[10px] lg:text-xs"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Generating Magic...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Transform Room
                </>
              )}
            </button>

              {/* History Section */}
            {user ? (
              history.length > 0 && (
                <div className="bg-white border border-black/5 rounded-[32px] p-8 shadow-xl">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                        <History className="w-5 h-5 text-gold" />
                      </div>
                      <h3 className="font-serif font-bold text-xl text-ink">
                        Recent Designs
                      </h3>
                    </div>
                    <button 
                      onClick={clearHistory} 
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear All
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {history.map((item) => (
                      <button 
                        key={item.id}
                        onClick={() => {
                          setResultImage(item.resultImage);
                          setTransformationHistory([item.originalImage || uploadedImage || '', item.resultImage]);
                          setHistoryIndex(1);
                        }}
                        className="group relative aspect-square rounded-2xl overflow-hidden border border-black/5 hover:border-gold transition-all shadow-sm"
                      >
                        <img src={item.resultImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="History" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 text-center">
                          <span className="text-[9px] font-bold text-white uppercase tracking-widest mb-1">{item.style}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )
            ) : (
              <div className="bg-white border border-black/5 rounded-[32px] p-8 shadow-xl text-center">
                <p className="text-[10px] text-ink/30 font-medium uppercase tracking-widest mb-4">Sign in to sync history</p>
                <button 
                  onClick={() => navigate('/profile')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gold text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-ink transition-all"
                >
                  <LogIn className="w-3 h-3" />
                  Sign In
                </button>
              </div>
            )}
          </div>

          {/* Preview Area */}
          <div className="lg:col-span-8">
            <div 
              className="relative aspect-[16/10] bg-luxury-gray border border-black/5 rounded-[32px] lg:rounded-[60px] overflow-hidden group shadow-inner cursor-default"
              onMouseMove={handleMouseMove}
              onTouchMove={handleMouseMove}
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
              onTouchStart={() => setIsDragging(true)}
              onTouchEnd={() => setIsDragging(false)}
            >
              <AnimatePresence mode="wait">
                {!uploadedImage ? (
                  <motion.div 
                    key="upload"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center p-8 lg:p-12 text-center"
                  >
                    <div className="w-24 h-24 lg:w-32 lg:h-32 bg-white rounded-full shadow-xl flex items-center justify-center mb-6 lg:mb-8 group-hover:scale-110 transition-transform duration-700">
                      <ImageIcon className="w-8 h-8 lg:w-10 lg:h-10 text-gold" />
                    </div>
                    <h3 className="text-2xl lg:text-3xl font-serif font-bold mb-4 text-ink">Upload your room photo</h3>
                    <p className="text-ink-light max-w-sm mb-8 font-medium text-xs lg:text-sm">
                      Drag and drop or click to upload. High resolution photos work best for AI transformations.
                    </p>
                    <label className="px-8 lg:px-10 py-3 lg:py-4 bg-white border border-black/5 rounded-full font-bold hover:bg-gold hover:text-white transition-all shadow-sm uppercase tracking-widest text-[9px] lg:text-[10px] cursor-pointer">
                      Choose File
                      <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
                    </label>
                  </motion.div>
                ) : isProcessing ? (
                  <motion.div 
                    key="processing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-md z-20 p-6 text-center"
                  >
                    <div className="relative w-20 h-20 lg:w-24 lg:h-24 mb-8">
                      <div className="absolute inset-0 border-4 border-gold/10 rounded-full" />
                      <div className="absolute inset-0 border-4 border-gold rounded-full border-t-transparent animate-spin" />
                      <Sparkles className="absolute inset-0 m-auto w-6 h-6 lg:w-8 lg:h-8 text-gold animate-pulse" />
                    </div>
                    <h3 className="text-2xl lg:text-3xl font-serif font-bold mb-2 text-ink">Reimagining Space</h3>
                    <p className="text-ink-light font-bold text-[8px] lg:text-[10px] tracking-[0.2em] uppercase mb-6">Analyzing geometry & applying {selectedStyle} style...</p>
                    
                    <div className="w-full max-w-xs h-1.5 bg-black/5 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gold"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="result"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 select-none"
                  >
                    {/* Original Image (Bottom Layer) */}
                    <img 
                      src={uploadedImage} 
                      className="w-full h-full object-cover" 
                      alt="Original Room"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Result Image (Top Layer with Clip) */}
                    {resultImage && (
                      <div 
                        className="absolute inset-0 overflow-hidden pointer-events-none"
                        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                      >
                        <img 
                          src={resultImage} 
                          className="w-full h-full object-cover" 
                          alt="Redesigned Room"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                    
                    {resultImage && (
                      <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-black/5 flex items-center gap-3 shadow-xl z-30">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-ink">{selectedStyle} Applied</span>
                      </div>
                    )}

                    <button 
                      onClick={() => { setUploadedImage(null); setResultImage(null); setTransformationHistory([]); setHistoryIndex(-1); }}
                      className="absolute top-6 right-6 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center border border-black/5 shadow-lg hover:bg-red-500 hover:text-white transition-all z-30"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    {/* Undo/Redo Controls */}
                    {resultImage && (
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30">
                        <button 
                          onClick={(e) => { e.stopPropagation(); undo(); }}
                          disabled={historyIndex <= 0}
                          className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center border border-black/5 shadow-lg hover:bg-gold hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-white/90 disabled:hover:text-ink"
                          title="Undo"
                        >
                          <Undo2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); redo(); }}
                          disabled={historyIndex >= transformationHistory.length - 1}
                          className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center border border-black/5 shadow-lg hover:bg-gold hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-white/90 disabled:hover:text-ink"
                          title="Redo"
                        >
                          <Redo2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    
                    {resultImage && (
                      <div 
                        className="absolute inset-y-0 z-20 pointer-events-none"
                        style={{ left: `${sliderPosition}%` }}
                      >
                        <div className="absolute inset-y-0 -left-[1px] w-[2px] bg-white shadow-[0_0_10px_rgba(0,0,0,0.3)]" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-2xl border border-black/5 pointer-events-auto cursor-ew-resize">
                          <RefreshCw className="w-4 h-4 text-ink" />
                        </div>
                        
                        {/* Labels */}
                        <div className="absolute top-1/2 -translate-y-1/2 -left-16 bg-black/60 backdrop-blur-sm text-white text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded">Before</div>
                        <div className="absolute top-1/2 -translate-y-1/2 -right-16 bg-gold/80 backdrop-blur-sm text-white text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded">After</div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
                <div className="flex gap-3 w-full sm:w-auto">
                <button 
                  disabled={!resultImage}
                  onClick={handleDownload}
                  className="flex-1 sm:flex-none px-6 lg:px-8 py-4 bg-ink text-white rounded-2xl text-[9px] lg:text-[10px] font-bold uppercase tracking-widest hover:bg-gold transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-30"
                >
                  <Download className="w-4 h-4" />
                  Save Vision
                </button>
                <button 
                  disabled={!resultImage}
                  onClick={handleShare}
                  className="flex-1 sm:flex-none px-6 lg:px-8 py-4 bg-white border border-black/5 rounded-2xl text-[9px] lg:text-[10px] font-bold uppercase tracking-widest hover:border-gold hover:text-gold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-30"
                >
                  <Share2 className="w-4 h-4" />
                  Share Design
                </button>
              </div>
              <p className="text-[9px] lg:text-[10px] text-ink/30 italic font-medium text-center sm:text-right">AI-generated images may vary from actual physical constraints.</p>
            
            {/* AI Insights Section */}
            <AnimatePresence>
              {resultImage && (
                <motion.div 
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8"
                >
                  {/* Design Tips */}
                  <div className="bg-white border border-black/5 rounded-[40px] p-8 lg:p-10 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-gold/10 transition-colors" />
                    <h3 className="font-serif font-bold text-2xl lg:text-3xl mb-8 flex items-center gap-3 text-ink">
                      <div className="w-10 h-10 rounded-2xl bg-gold/10 flex items-center justify-center">
                        <Lightbulb className="w-5 h-5 text-gold" />
                      </div>
                      AI Design Tips
                    </h3>
                    <ul className="space-y-6">
                      {aiTips.map((tip, i) => (
                        <motion.li 
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex gap-4 text-sm lg:text-base text-ink-light font-medium leading-relaxed group/tip"
                        >
                          <div className="mt-2 w-1.5 h-1.5 rounded-full bg-gold shrink-0 group-hover/tip:scale-150 transition-transform" />
                          {tip}
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* Furniture Suggestions */}
                  <div className="bg-white border border-black/5 rounded-[40px] p-8 lg:p-10 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-ink/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-ink/10 transition-colors" />
                    <h3 className="font-serif font-bold text-2xl lg:text-3xl mb-8 flex items-center gap-3 text-ink">
                      <div className="w-10 h-10 rounded-2xl bg-ink/5 flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-ink" />
                      </div>
                      Curated Furniture
                    </h3>
                    <div className="space-y-5">
                      {furnitureSuggestions.map((item, i) => (
                        <motion.div 
                          key={i} 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          onClick={() => window.open(item.link, '_blank')}
                          className="flex items-center gap-5 p-5 rounded-[24px] bg-luxury-gray border border-black/5 hover:border-gold/30 hover:bg-white hover:shadow-xl transition-all group cursor-pointer"
                        >
                          <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-sm">
                            <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.name} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[9px] font-bold uppercase tracking-widest text-gold">{item.store}</span>
                            </div>
                            <p className="font-bold text-base text-ink mb-1">{item.name}</p>
                            <p className="text-gold font-mono font-bold text-xs">{item.price}</p>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-white border border-black/5 flex items-center justify-center group-hover:bg-gold group-hover:text-white transition-all">
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Makeover;
