import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Wand2, ImageIcon, Send, RefreshCw, X, MessageSquare, Zap, ArrowRight, ShoppingBag, Undo2, Redo2, Download, Share2, Users, History } from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from '../lib/utils';
import { GoogleGenAI } from "@google/genai";

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

const AetherVision = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [transformationHistory, setTransformationHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [furnitureSuggestions, setFurnitureSuggestions] = useState<any[]>([]);
  const [aiTips, setAiTips] = useState<string[]>([]);
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: 'Welcome to the Aether. Upload your space, and let us begin the neural synthesis. What is your first vision?' }
  ]);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [visionHistory, setVisionHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      setVisionHistory([]);
      return;
    }

    const q = query(
      collection(db, 'visions'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const history = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setVisionHistory(history);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'visions');
    });

    return () => unsubscribe();
  }, [user]);

  const clearVisionHistory = () => {
    // In a real app, we'd delete from Firestore. For now, we'll just clear local if needed
    // but since it's synced with Firestore, we'd need to delete docs.
    alert("History is synced with your account.");
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const container = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const position = ((x - container.left) / container.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, position)));
  };

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
        setFurnitureSuggestions([]);
        setMessages([{ role: 'ai', text: 'Canvas received. What is your first vision for this space?' }]);
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
      const file = new File([blob], `aureum-vision-${Date.now()}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'My Aureum Aether Vision',
          text: `Check out my neural design synthesis: "${prompt || 'Vision'}" created with Aureum Neural Design!`,
        });
      } else if (navigator.share) {
        await navigator.share({
          title: 'My Aureum Aether Vision',
          text: `Check out my neural design synthesis: "${prompt || 'Vision'}" created with Aureum Neural Design!`,
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
        alert('Vision link copied to clipboard!');
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
      link.download = `aureum-vision-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Download failed. Please try right-clicking the image to save.');
    }
  };

  const handleGenerate = async (overridePrompt?: string) => {
    const activePrompt = overridePrompt || prompt;
    if (!uploadedImage || !activePrompt) {
      alert('Please provide both an image and a design prompt.');
      return;
    }

    // Add user message to chat
    if (!overridePrompt) {
      setMessages(prev => [...prev, { role: 'user', text: activePrompt }]);
      setPrompt('');
    }

    // Check for API key before proceeding
    if (window.aistudio) {
      const selected = await window.aistudio.hasSelectedApiKey();
      if (!selected) {
        // Proceed with default key for free models
        console.log("Using default free-tier API key.");
      }
    }

    setIsProcessing(true);
    setIsTyping(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY });
      
      // Use the current result image if it exists, otherwise use the uploaded one
      const currentImage = resultImage || uploadedImage;
      const base64Data = currentImage.split(',')[1] || currentImage;

      // Build context from history
      const historyContext = messages
        .filter(m => m.role === 'user')
        .map(m => m.text)
        .join(' -> ');

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
                text: `ULTRA-PHOTOREALISTIC NEURAL DESIGN SYNTHESIS: 
                Current State: "${historyContext}"
                New Vision: "${activePrompt}"
                
                STRICT ITERATIVE DIRECTIVES:
                - LOGICAL CONTINUITY: Apply "${activePrompt}" to the CURRENT image provided.
                - ZERO HALLUCINATIONS: Maintain physical laws. No floating elements or distorted geometry.
                - PRESERVE PREVIOUS WINS: Keep all successful design elements from previous prompts unless explicitly told to remove them.
                - LIGHTING COHERENCE: Update the global illumination to reflect new additions while maintaining the established mood.
                - MATERIAL FIDELITY: Render new textures (velvet, marble, wood, metal, teak, brass) with 100% photorealism.
                - INDIAN LUXURY CONTEXT: Emphasize premium Indian materials like Teak wood, Makrana marble, brass inlays, and rich textiles (silk, velvet).
                - ARCHITECTURAL ACCURACY: Maintain the structural integrity of the room.
                - FINAL RESULT: A breathtaking, professional architectural photograph for a high-end design magazine.`,
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
                text: `Analyze this room and the new vision instruction: "${activePrompt}". 
                Provide a short, encouraging AI response (1 sentence) about the manifestation, 4 professional design tips, and 3 furniture items.
                Return the response in STRICT JSON format (NO trailing commas):
                {
                  "response": "AI message here",
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
                }`,
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

      if (!newResult) throw new Error("No vision manifested");

      const analysisDataText = analysisResponse.text || '{}';
      const cleanedJson = analysisDataText.replace(/```json/g, '').replace(/```/g, '').trim();
      const analysisData = JSON.parse(cleanedJson);
      
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: analysisData.response || "The Aether has shifted. Your vision is manifested." 
      }]);

      setAiTips(analysisData.tips || [
        "Incorporate warm, layered lighting to enhance the moody atmosphere.",
        "Use metallic accents like brass or copper for a premium Indian touch.",
        "Consider low-profile furniture to maintain the spatial flow.",
        "Add indoor plants like Areca palms to bring life and freshness."
      ]);
      setFurnitureSuggestions(analysisData.furniture || []);
      setResultImage(newResult);
      setIsTyping(false);
      
      // Save to Firestore
      if (user) {
        try {
          await addDoc(collection(db, 'visions'), {
            uid: user.uid,
            prompt: activePrompt,
            originalImage: uploadedImage,
            resultImage: newResult,
            tips: analysisData.tips || [],
            furniture: analysisData.furniture || [],
            createdAt: serverTimestamp()
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, 'visions');
        }
      }
      
      // Update transformation history for undo/redo
      const newHistory = transformationHistory.slice(0, historyIndex + 1);
      newHistory.push(newResult);
      setTransformationHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.7 },
        colors: ['#8A6D3B', '#F5F4F0', '#262320']
      });
    } catch (err: any) {
      console.error('Aether error:', err);
      const errorMsg = typeof err === 'string' ? err : JSON.stringify(err);
      
      if (errorMsg.includes("403") || errorMsg.includes("PERMISSION_DENIED") || errorMsg.includes("Requested entity was not found")) {
        alert("There was a permission issue. This might be due to API limits or region restrictions. Please try again in a moment or ensure your API key is correctly configured.");
        if (window.aistudio) {
          await window.aistudio.openSelectKey();
        }
      } else {
        alert('Aether manifestation failed: ' + (err.message || errorMsg));
      }
    } finally {
      setIsProcessing(false);
      setIsTyping(false);
    }
  };

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen bg-luxury-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 text-gold text-[10px] font-bold tracking-[0.3em] uppercase mb-6">
              <Zap className="w-3 h-3" />
              Neural Synthesis Engine
            </div>
            <h1 className="text-5xl md:text-8xl font-serif font-bold mb-6 text-ink leading-[0.85]">
              Aether <span className="text-gold italic">Vision</span>
            </h1>
            <p className="text-ink-light max-w-2xl mx-auto font-medium text-lg">
              The ultimate bridge between thought and space. Describe your dream atmosphere, 
              upload your canvas, and watch the Aether manifest your reality.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Input Panel - Chat Interface */}
          <div className="lg:col-span-5 flex flex-col h-[600px]">
            <div className="flex-1 bg-luxury-gray border border-black/5 rounded-[40px] p-8 shadow-sm flex flex-col overflow-hidden">
              <div className="flex items-center gap-3 mb-6 shrink-0">
                <div className="w-10 h-10 rounded-2xl bg-ink flex items-center justify-center shadow-lg shadow-black/20">
                  <Zap className="w-5 h-5 text-gold" />
                </div>
                <h3 className="font-serif font-bold text-2xl text-ink">Neural Oracle</h3>
              </div>

              {/* Neural Activity Filler */}
              <div className="mb-6 p-4 rounded-2xl bg-white border border-black/5 flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest text-ink/40 mb-2">
                    <span>Neural Activity</span>
                    <span className="text-gold">Active</span>
                  </div>
                  <div className="flex items-end gap-0.5 h-4">
                    {[...Array(20)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ height: [4, 16, 8, 12, 4] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.05 }}
                        className="flex-1 bg-gold/20 rounded-full"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 custom-scrollbar"
              >
                {messages.map((msg, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed",
                      msg.role === 'user' 
                        ? "ml-auto bg-ink text-white rounded-tr-none" 
                        : "bg-white border border-black/5 text-ink-light rounded-tl-none shadow-sm"
                    )}
                  >
                    {msg.text}
                  </motion.div>
                ))}
                {isProcessing && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white border border-black/5 text-ink-light p-4 rounded-3xl rounded-tl-none shadow-sm w-16 flex justify-center"
                  >
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Chat Input */}
              <div className="relative shrink-0">
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleGenerate();
                    }
                  }}
                  placeholder={uploadedImage ? "Describe your next vision..." : "Upload a canvas first..."}
                  disabled={!uploadedImage || isProcessing}
                  className="w-full h-24 bg-white border border-black/5 rounded-3xl p-6 pr-16 text-sm outline-none focus:border-gold/30 transition-all resize-none shadow-inner disabled:opacity-50"
                />
                <button 
                  onClick={() => handleGenerate()}
                  disabled={isProcessing || !uploadedImage || !prompt}
                  className="absolute right-4 bottom-4 w-10 h-10 bg-ink text-white rounded-2xl flex items-center justify-center hover:bg-gold transition-all disabled:opacity-50 shadow-lg"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              {/* Neural History */}
              <div className="mt-12">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-serif font-bold text-xl text-ink flex items-center gap-2">
                    <History className="w-5 h-5 text-gold" />
                    Neural History
                  </h3>
                  {visionHistory.length > 0 && (
                    <button 
                      onClick={clearVisionHistory}
                      className="text-[9px] font-bold text-ink/20 hover:text-red-500 uppercase tracking-widest transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
                {user ? (
                  visionHistory.length > 0 ? (
                    <div className="grid grid-cols-3 gap-4">
                      {visionHistory.map((item) => (
                        <button 
                          key={item.id} 
                          onClick={() => {
                            setResultImage(item.resultImage);
                            setTransformationHistory([item.originalImage || uploadedImage || '', item.resultImage]);
                            setHistoryIndex(1);
                          }}
                          className="group relative aspect-square rounded-2xl overflow-hidden border border-black/5 shadow-sm hover:border-gold transition-all"
                        >
                          <img src={item.resultImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="History" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center">
                            <span className="text-[7px] font-bold text-white uppercase tracking-widest line-clamp-2">"{item.prompt}"</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="py-10 text-center border border-dashed border-black/5 rounded-3xl">
                      <p className="text-[10px] text-ink/30 font-medium uppercase tracking-widest">No visions yet</p>
                    </div>
                  )
                ) : (
                  <div className="py-10 text-center border border-dashed border-black/5 rounded-3xl">
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
            </div>
          </div>

          {/* Visual Canvas */}
          <div className="lg:col-span-7">
            <div 
              className="relative aspect-[4/3] bg-luxury-gray border border-black/5 rounded-[60px] overflow-hidden group shadow-2xl cursor-default"
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
                    className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center"
                  >
                    <div className="w-32 h-32 bg-white rounded-full shadow-xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-700">
                      <ImageIcon className="w-10 h-10 text-gold" />
                    </div>
                    <h3 className="text-3xl font-serif font-bold mb-4 text-ink">The Void Awaits</h3>
                    <p className="text-ink-light max-w-sm mb-8 font-medium">
                      Upload your current space to begin the neural synthesis.
                    </p>
                    <label className="px-12 py-5 bg-white border border-black/5 rounded-full font-bold hover:bg-gold hover:text-white transition-all shadow-lg uppercase tracking-widest text-[10px] cursor-pointer">
                      Upload Canvas
                      <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
                    </label>
                  </motion.div>
                ) : isProcessing ? (
                  <motion.div 
                    key="processing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20"
                  >
                    <img src={uploadedImage} className="w-full h-full object-cover blur-sm opacity-50" alt="Processing" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-xl">
                      <div className="relative w-32 h-32 mb-8">
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 border-4 border-gold/20 border-t-gold rounded-full"
                        />
                        <motion.div 
                          animate={{ rotate: -360 }}
                          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-4 border-2 border-ink/10 border-b-ink rounded-full"
                        />
                        <Sparkles className="absolute inset-0 m-auto w-10 h-10 text-gold animate-pulse" />
                      </div>
                      <h3 className="text-3xl font-serif font-bold mb-2 text-ink">Synthesizing Aether</h3>
                      <p className="text-ink-light font-bold text-[10px] tracking-[0.4em] uppercase">Aligning neural pathways...</p>
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
                          alt="Vision Manifested"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                    
                    {resultImage && (
                      <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full border border-black/5 flex items-center gap-3 shadow-2xl z-30">
                        <div className="w-2 h-2 bg-gold rounded-full animate-ping" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-ink">Manifestation Complete</span>
                      </div>
                    )}

                    <button 
                      onClick={() => { 
                        setUploadedImage(null); 
                        setResultImage(null); 
                        setTransformationHistory([]); 
                        setHistoryIndex(-1); 
                        setMessages([{ role: 'ai', text: 'Welcome to the Aether. Upload your space, and let us begin the neural synthesis. What is your first vision?' }]);
                      }}
                      className="absolute top-8 right-8 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center border border-black/5 shadow-xl hover:bg-red-500 hover:text-white transition-all z-30"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    {/* Undo/Redo Controls */}
                    {resultImage && (
                      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30">
                        <button 
                          onClick={(e) => { e.stopPropagation(); undo(); }}
                          disabled={historyIndex <= 0}
                          className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center border border-black/5 shadow-xl hover:bg-gold hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-white/90 disabled:hover:text-ink"
                          title="Undo"
                        >
                          <Undo2 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); redo(); }}
                          disabled={historyIndex >= transformationHistory.length - 1}
                          className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center border border-black/5 shadow-xl hover:bg-gold hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-white/90 disabled:hover:text-ink"
                          title="Redo"
                        >
                          <Redo2 className="w-5 h-5" />
                        </button>
                      </div>
                    )}

                    {resultImage && (
                      <div 
                        className="absolute inset-y-0 z-20 pointer-events-none"
                        style={{ left: `${sliderPosition}%` }}
                      >
                        <div className="absolute inset-y-0 -left-[1px] w-[2px] bg-white shadow-[0_0_10px_rgba(0,0,0,0.3)]" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-2xl border border-black/5 pointer-events-auto cursor-ew-resize">
                          <RefreshCw className="w-5 h-5 text-ink" />
                        </div>
                        
                        {/* Labels */}
                        <div className="absolute top-1/2 -translate-y-1/2 -left-20 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg">Original</div>
                        <div className="absolute top-1/2 -translate-y-1/2 -right-20 bg-gold/80 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg">Vision</div>
                      </div>
                    )}

                    {/* Actions Overlay */}
                    {resultImage && !isProcessing && (
                      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-40">
                        <button 
                          onClick={handleDownload}
                          className="px-6 py-3 bg-white/90 backdrop-blur-md rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-gold hover:text-white transition-all shadow-2xl border border-black/5 flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                        <button 
                          onClick={handleShare}
                          className="px-6 py-3 bg-white/90 backdrop-blur-md rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-gold hover:text-white transition-all shadow-2xl border border-black/5 flex items-center gap-2"
                        >
                          <Share2 className="w-4 h-4" />
                          Share
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

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
                        <Sparkles className="w-5 h-5 text-gold" />
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

export default AetherVision;
