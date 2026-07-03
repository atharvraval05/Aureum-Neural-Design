import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Palette, Zap, Layout, ChevronRight, Info, ShoppingBag, ArrowRight } from 'lucide-react';

const STYLES = [
  {
    id: 'original',
    name: 'Original',
    image: 'https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?q=80&w=2000&auto=format&fit=crop',
    description: 'The raw canvas of your living space.',
    color: '#8A6D3B',
    furniture: []
  },
  {
    id: 'modern',
    name: 'Modern',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=2000&auto=format&fit=crop',
    description: 'Clean lines and functional elegance for modern city living.',
    color: '#EBE9E4',
    furniture: [
      { name: "Sleek Grey Sofa", store: "IKEA", link: "https://www.ikea.com/us/en/search/?q=grey+sofa" },
      { name: "Glass Coffee Table", store: "Amazon", link: "https://www.amazon.com/s?k=glass+coffee+table" }
    ]
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=2000&auto=format&fit=crop',
    description: 'The perfect blend of Japanese functionalism and Scandinavian rustic minimalism.',
    color: '#E5D3B3',
    furniture: [
      { name: "Oak Platform Bed", store: "Amazon", link: "https://www.amazon.com/s?k=oak+platform+bed" },
      { name: "Woven Pendant Light", store: "IKEA", link: "https://www.ikea.com/us/en/search/?q=woven+pendant+light" }
    ]
  },
  {
    id: 'bohemian',
    name: 'Bohemian',
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=2000&auto=format&fit=crop',
    description: 'Eclectic, free-spirited, and full of life and color.',
    color: '#D2B48C',
    furniture: [
      { name: "Macrame Wall Hanging", store: "Amazon", link: "https://www.amazon.com/s?k=macrame+wall+hanging" },
      { name: "Rattan Armchair", store: "IKEA", link: "https://www.ikea.com/us/en/search/?q=rattan+armchair" }
    ]
  }
];

const StyleVisionary = ({ sourceImage, isScanComplete }: { sourceImage?: string | null, isScanComplete?: boolean }) => {
  const [activeStyle, setActiveStyle] = useState(STYLES[0]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Trigger processing effect when style changes if scan is complete
  useEffect(() => {
    if (isScanComplete) {
      setIsProcessing(true);
      const timer = setTimeout(() => setIsProcessing(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [activeStyle, isScanComplete]);

  return (
    <div className="relative w-full h-full min-h-[500px] flex flex-col rounded-[40px] overflow-hidden bg-white shadow-2xl border border-black/5">
      {/* Main Image Display */}
      <div className="relative flex-1 overflow-hidden bg-luxury-gray">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStyle.id + (sourceImage || '')}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            {/* If we have a source image, we show it with a style filter */}
            {sourceImage ? (
              <div className="relative w-full h-full">
                <img 
                  src={sourceImage} 
                  alt="Source"
                  className="w-full h-full object-cover"
                  style={{
                    filter: activeStyle.id === 'minimalist' ? 'grayscale(0.5) brightness(1.1) contrast(0.9)' :
                            activeStyle.id === 'japandi' ? 'sepia(0.3) brightness(1.05) saturate(0.8)' :
                            activeStyle.id === 'industrial' ? 'contrast(1.2) brightness(0.8) saturate(0.5)' :
                            'none'
                  }}
                />
                {/* Overlay the preset style partially to show the "Target Vision" */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.4 }}
                  className="absolute inset-0 mix-blend-overlay pointer-events-none"
                >
                  <img src={activeStyle.image} className="w-full h-full object-cover" alt="" />
                </motion.div>
              </div>
            ) : (
              <img 
                src={activeStyle.image} 
                alt={activeStyle.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Processing Overlay */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 bg-ink/40 backdrop-blur-sm flex items-center justify-center"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
                <span className="text-white text-[10px] font-bold uppercase tracking-widest">AI Reimagining...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Style Info */}
        <div className="absolute bottom-8 left-8 right-8 z-10">
          <motion.div
            key={activeStyle.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: activeStyle.color }} 
                />
                <h4 className="text-white font-serif font-bold text-xl">{activeStyle.name}</h4>
              </div>
              {sourceImage && (
                <div className="px-3 py-1 bg-gold/20 rounded-full border border-gold/40">
                  <span className="text-[8px] text-gold font-bold uppercase tracking-widest">AI Analysis Applied</span>
                </div>
              )}
            </div>
            <p className="text-white/70 text-sm font-medium leading-relaxed mb-4">
              {activeStyle.description}
            </p>

            {activeStyle.furniture && activeStyle.furniture.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {activeStyle.furniture.map((item: any, i: number) => (
                  <button 
                    key={i}
                    onClick={() => window.open(item.link, '_blank')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 transition-all group/item"
                  >
                    <ShoppingBag className="w-3 h-3 text-gold" />
                    <span className="text-[9px] text-white font-bold uppercase tracking-widest">{item.name}</span>
                    <ArrowRight className="w-3 h-3 text-white/20 group-hover/item:text-gold group-hover/item:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* AI Processing Indicator */}
        <div className="absolute top-8 right-8 z-10">
          <div className="bg-ink/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-gold animate-pulse" />
            <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-white">
              {sourceImage ? 'AI Redesign Active' : 'AI Vision Active'}
            </span>
          </div>
        </div>

        {/* Source Reference Thumbnail */}
        {sourceImage && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-8 left-8 z-10"
          >
            <div className="relative w-24 aspect-video rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl">
              <img src={sourceImage} className="w-full h-full object-cover" alt="Reference" />
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute bottom-1 left-2">
                <span className="text-[6px] text-white font-bold uppercase tracking-widest">Reference</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Style Selector Bar */}
      <div className="bg-luxury-white p-4 sm:p-6 border-t border-black/5">
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          {STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => setActiveStyle(style)}
              className={`group relative flex items-center gap-3 px-6 py-3 rounded-2xl transition-all duration-500 ${
                activeStyle.id === style.id 
                  ? 'bg-ink text-white shadow-xl scale-105' 
                  : 'bg-white text-ink/40 hover:bg-luxury-gray hover:text-ink'
              }`}
            >
              <Palette className={`w-4 h-4 transition-colors ${
                activeStyle.id === style.id ? 'text-gold' : 'text-ink/20 group-hover:text-gold'
              }`} />
              <span className="text-[10px] font-bold uppercase tracking-widest">{style.name}</span>
              
              {activeStyle.id === style.id && (
                <motion.div 
                  layoutId="activeStyleMarker"
                  className="absolute -top-1 -right-1 w-3 h-3 bg-gold rounded-full border-2 border-white"
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StyleVisionary;
