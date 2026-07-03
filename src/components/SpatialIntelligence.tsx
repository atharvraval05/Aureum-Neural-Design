import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Scan, Box, Maximize, MousePointer2, Sparkles, ArrowRight, ChevronRight, Activity, CheckCircle2, X, Ruler, Layers, Target, Eye } from 'lucide-react';
import { cn } from '../lib/utils';

const SpatialIntelligence = ({ onComplete }: { onComplete?: (image: string) => void }) => {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [detectedItems, setDetectedItems] = useState<{ id: number, label: string, x: number, y: number, confidence: number, distance: string }[]>([]);
  const [scanProgress, setScanProgress] = useState(0);

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        localStorage.setItem('aureum_captured_room', dataUrl);
        if (onComplete) {
          onComplete(dataUrl);
        } else {
          navigate('/makeover');
        }
      }
    } else {
      const fallbackUrl = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop';
      localStorage.setItem('aureum_captured_room', fallbackUrl);
      if (onComplete) {
        onComplete(fallbackUrl);
      } else {
        navigate('/makeover');
      }
    }
  };

  const startScan = async () => {
    setIsScanning(true);
    setIsComplete(false);
    setScanProgress(0);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Detailed simulation sequence
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 2;
        setScanProgress(progress);
        
        if (progress === 40) {
          setDetectedItems([
            { id: 1, label: 'Mid-century Sofa', x: 30, y: 45, confidence: 0.98, distance: '2.4m' },
          ]);
        }
        
        if (progress === 60) {
          setDetectedItems(prev => [
            ...prev,
            { id: 2, label: 'Oak Coffee Table', x: 60, y: 60, confidence: 0.94, distance: '1.8m' },
          ]);
        }
        
        if (progress === 80) {
          setDetectedItems(prev => [
            ...prev,
            { id: 3, label: 'Pendant Light', x: 45, y: 20, confidence: 0.91, distance: '3.1m' },
          ]);
        }

        if (progress >= 100) {
          clearInterval(progressInterval);
          setIsComplete(true);
          captureFrame();
        }
      }, 100);

    } catch (err) {
      console.error("Error accessing camera:", err);
      // Fallback simulation
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 2;
        setScanProgress(progress);
        if (progress >= 100) {
          clearInterval(progressInterval);
          setIsComplete(true);
          captureFrame();
        }
      }, 100);
      
      setDetectedItems([
        { id: 1, label: 'Mid-century Sofa', x: 30, y: 45, confidence: 0.98, distance: '2.4m' },
        { id: 2, label: 'Oak Coffee Table', x: 60, y: 60, confidence: 0.94, distance: '1.8m' },
      ]);
    }
  };

  const stopScan = () => {
    setIsScanning(false);
    setIsComplete(false);
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    setDetectedItems([]);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto aspect-video rounded-[40px] overflow-hidden bg-white shadow-2xl border border-black/5 group">
      <AnimatePresence mode="wait">
        {!isScanning ? (
          <motion.div 
            key="start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-luxury-white"
          >
            <div className="w-20 h-20 bg-white rounded-full shadow-xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-700">
              <Scan className="w-8 h-8 text-gold" />
            </div>
            <h3 className="text-2xl font-serif font-bold mb-4 text-ink">Spatial Intelligence v2.0</h3>
            <p className="text-ink/60 max-w-xs mb-8 text-sm font-medium">
              Advanced LiDAR simulation with real-time depth mapping, plane detection, and precision measurements.
            </p>
            <button 
              onClick={startScan}
              className="px-10 py-4 bg-ink text-white font-bold rounded-full flex items-center gap-3 hover:bg-gold transition-all shadow-lg shadow-black/10 group/btn"
            >
              <span className="text-xs uppercase tracking-widest">Initialize AI Scan</span>
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black"
          >
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover opacity-60"
            />
            
            {/* Scanning Line */}
            {!isComplete && (
              <motion.div 
                initial={{ top: '0%' }}
                animate={{ top: '100%' }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-[2px] bg-gold shadow-[0_0_20px_rgba(138,109,59,1)] z-10"
              />
            )}

            {/* HUD Elements */}
            <div className="absolute inset-0 p-8 pointer-events-none">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-4">
                  <div className="bg-white/10 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/20 shadow-2xl">
                    <div className="flex items-center gap-3">
                      {isComplete ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      ) : (
                        <Activity className="w-4 h-4 text-gold animate-pulse" />
                      )}
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white">
                          {isComplete ? 'Spatial Map Generated' : 'Analyzing Spatial Data...'}
                        </span>
                        {!isComplete && (
                          <div className="w-full h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                            <motion.div 
                              className="h-full bg-gold"
                              initial={{ width: 0 }}
                              animate={{ width: `${scanProgress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* New HUD Elements */}
                  <div className="bg-white/5 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-8">
                      <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Neural Load</span>
                      <span className="text-[8px] font-bold text-gold uppercase tracking-widest">{scanProgress}%</span>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(10)].map((_, i) => (
                        <div 
                          key={i} 
                          className={cn(
                            "h-1 flex-1 rounded-full transition-colors duration-300",
                            scanProgress > i * 10 ? "bg-gold" : "bg-white/10"
                          )} 
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={stopScan}
                  className="pointer-events-auto bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-3 rounded-full transition-colors border border-white/20"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Detected Items */}
              {detectedItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute"
                  style={{ left: `${item.x}%`, top: `${item.y}%` }}
                >
                  <div className="relative">
                    <div className="w-4 h-4 bg-gold rounded-full shadow-[0_0_15px_rgba(138,109,59,0.8)] border-2 border-white" />
                    
                    <div className="absolute left-8 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/20 shadow-2xl whitespace-nowrap">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[8px] text-gold font-bold uppercase tracking-widest">Identified</span>
                        <span className="text-[8px] text-white/40 font-bold">{(item.confidence * 100).toFixed(0)}% Match</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{item.label}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Corner Accents */}
      <div className="absolute top-8 left-8 w-8 h-8 border-t-2 border-l-2 border-gold/30 rounded-tl-2xl pointer-events-none" />
      <div className="absolute top-8 right-8 w-8 h-8 border-t-2 border-r-2 border-gold/30 rounded-tr-2xl pointer-events-none" />
      <div className="absolute bottom-8 left-8 w-8 h-8 border-b-2 border-l-2 border-gold/30 rounded-bl-2xl pointer-events-none" />
      <div className="absolute bottom-8 right-8 w-8 h-8 border-b-2 border-r-2 border-gold/30 rounded-br-2xl pointer-events-none" />
    </div>
  );
};

export default SpatialIntelligence;
