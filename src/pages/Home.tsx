import React, { useState } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'motion/react';
import StyleVisionary from '../components/StyleVisionary';
import SpatialIntelligence from '../components/SpatialIntelligence';
import { Sparkles, ArrowRight, LayoutGrid, Users, Zap, Shield, Globe, Scan, Play, ChevronDown, Clock, Rocket, Heart, Palette, Wand2, Lightbulb, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [isScanComplete, setIsScanComplete] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const { scrollYProgress } = useScroll();
  
  // Parallax transforms
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -600]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 1.3]);
  const opacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.4], [0, 150]);
  
  const springY1 = useSpring(y1, { stiffness: 150, damping: 40 });

  return (
    <div className="relative bg-luxury-white">
      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6 py-24 sm:py-32">
        {/* Background Parallax */}
        <motion.div 
          style={{ y: springY1, scale, opacity }}
          className="absolute inset-0 -z-10"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/30 to-luxury-white z-10" />
          <img 
            src="https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?q=80&w=2000&auto=format&fit=crop" 
            alt="Modern Indian Living Room" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        {/* Floating Elements */}
        <motion.div 
          style={{ y: y2 }}
          className="absolute top-1/4 -right-20 w-64 h-64 sm:w-96 sm:h-96 bg-gold/5 blur-[80px] sm:blur-[120px] rounded-full -z-10"
        />
        <motion.div 
          style={{ y: y1 }}
          className="absolute bottom-1/4 -left-20 w-56 h-56 sm:w-80 sm:h-80 bg-gold/10 blur-[60px] sm:blur-[100px] rounded-full -z-10"
        />

        <div className="max-w-6xl mx-auto text-center relative z-20">
          <motion.div
            style={{ y: textY, opacity }}
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-5xl sm:text-7xl md:text-[9rem] lg:text-[11rem] font-serif font-bold mb-6 sm:mb-10 leading-[0.9] sm:leading-[0.85] tracking-tighter text-ink">
              Spatial <br /> <span className="text-gold italic font-normal">Intelligence.</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-ink-light max-w-2xl mx-auto mb-10 sm:mb-16 leading-relaxed font-medium px-4">
              Aureum is the world's first neural design engine. Transform your environment with the power of generative AI and spatial reasoning.
            </p>

            {/* CENTRAL INTERACTIVE ELEMENT */}
            <div className="w-full max-w-5xl mx-auto mt-12 mb-16 px-4">
              <SpatialIntelligence 
                onComplete={(img) => {
                  setScannedImage(img);
                  setIsScanComplete(true);
                }} 
              />
              
              <div className="flex items-center justify-center gap-6 sm:gap-12 mt-12">
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-serif font-bold text-ink">v0.1</p>
                  <p className="text-[8px] sm:text-[10px] uppercase tracking-widest text-ink/40 font-bold">Beta Phase</p>
                </div>
                <div className="w-[1px] h-6 sm:h-8 bg-black/10" />
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-serif font-bold text-ink">Early</p>
                  <p className="text-[8px] sm:text-[10px] uppercase tracking-widest text-ink/40 font-bold">Access</p>
                </div>
                <div className="w-[1px] h-6 sm:h-8 bg-black/10" />
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-serif font-bold text-ink">100%</p>
                  <p className="text-[8px] sm:text-[10px] uppercase tracking-widest text-ink/40 font-bold">Community Driven</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
        >
          <ChevronDown className="w-6 h-6 text-ink/20 animate-bounce" />
        </motion.div>
      </section>

      {/* AI Vision Section */}
      <section id="scan" className="py-24 sm:py-40 px-4 sm:px-6 bg-luxury-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold mb-6 block">Spatial Intelligence</span>
              <h2 className="text-5xl sm:text-6xl md:text-7xl font-serif font-bold mb-8 sm:mb-10 leading-[0.95] text-ink">
                Visionary <br /> <span className="italic font-normal">Intelligence.</span>
              </h2>
              <p className="text-ink-light text-base sm:text-lg mb-10 sm:mb-12 leading-relaxed font-medium">
                Our spatial engine understands your environment with unprecedented depth. From object recognition to structural analysis, experience a new dimension of design.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                {[
                  { icon: Lightbulb, title: "Design Tips", desc: "Professional advice for your space." },
                  { icon: ShoppingBag, title: "Furniture Picks", desc: "Curated items that fit your room." },
                  { icon: Palette, title: "Color Theory", desc: "Perfect palettes for your lighting." },
                  { icon: Sparkles, title: "Style Makeover", desc: "Instant visual transformations." }
                ].map((feature, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex flex-col gap-4 p-6 rounded-[32px] bg-luxury-gray border border-black/5 hover:border-gold/20 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:bg-gold transition-colors">
                      <feature.icon className="w-5 h-5 text-gold group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold mb-1 text-ink uppercase tracking-wider">{feature.title}</h4>
                      <p className="text-ink-light text-[10px] font-medium">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="relative h-[600px]"
            >
              <div className="absolute -inset-10 bg-gold/10 blur-[100px] rounded-full opacity-30" />
              <StyleVisionary sourceImage={scannedImage} isScanComplete={isScanComplete} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Filler Section: How it Works */}
      <section id="how-it-works" className="py-24 sm:py-40 px-4 sm:px-6 bg-luxury-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-end justify-between gap-8 mb-20">
            <div className="max-w-2xl">
              <h2 className="text-4xl sm:text-6xl font-serif font-bold text-ink mb-6">The Path to <br /> <span className="text-gold italic font-normal">Perfection.</span></h2>
              <p className="text-ink-light text-lg font-medium">Three simple steps to redefine your living experience.</p>
            </div>
            <div className="flex items-center gap-4">
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  onClick={() => setActiveStep(i)}
                  className={`w-12 h-12 rounded-full border transition-all duration-500 flex items-center justify-center font-bold ${
                    activeStep === i 
                      ? 'bg-gold text-white border-gold shadow-lg shadow-gold/20' 
                      : 'border-black/5 text-ink/20 hover:border-gold/40 hover:text-gold/40'
                  }`}
                >
                  0{i + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: "01", title: "Upload", desc: "Share a photo of your current space to begin the transformation." },
              { step: "02", title: "Analyze", desc: "Our AI identifies furniture, lighting, and layout opportunities." },
              { step: "03", title: "Redesign", desc: "Receive professional tips and see your room reimagined instantly." }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                onClick={() => setActiveStep(i)}
                className={`relative p-10 rounded-[40px] border transition-all duration-500 cursor-pointer group ${
                  activeStep === i 
                    ? 'bg-white border-gold/20 shadow-2xl scale-105 z-10' 
                    : 'bg-luxury-gray border-black/5 hover:border-gold/10'
                }`}
              >
                <span className={`text-8xl font-serif font-bold absolute top-4 right-8 select-none transition-colors duration-500 ${
                  activeStep === i ? 'text-gold/10' : 'text-black/5'
                }`}>{item.step}</span>
                <h3 className={`text-2xl font-serif font-bold mb-4 transition-colors duration-500 ${
                  activeStep === i ? 'text-gold' : 'text-ink'
                }`}>{item.title}</h3>
                <p className={`text-sm leading-relaxed font-medium transition-colors duration-500 ${
                  activeStep === i ? 'text-ink' : 'text-ink-light'
                }`}>{item.desc}</p>
                
                {activeStep === i && (
                  <motion.div 
                    layoutId="activeStepIndicator"
                    className="absolute bottom-6 left-10 right-10 h-1 bg-gold rounded-full"
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Manifestations Section */}
      <section className="py-24 sm:py-40 px-4 sm:px-6 bg-luxury-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <motion.span 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold mb-4 block"
            >
              Neural Network
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-6xl font-serif font-bold text-ink"
            >
              Community <span className="text-gold italic font-normal">Manifestations.</span>
            </motion.h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {[
              { img: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=600&auto=format&fit=crop', style: 'Minimalist', user: 'Arjun K.' },
              { img: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=600&auto=format&fit=crop', style: 'Luxury', user: 'Priya S.' },
              { img: 'https://images.unsplash.com/photo-1616137466211-f939a420be84?q=80&w=600&auto=format&fit=crop', style: 'Urban', user: 'Rahul M.' },
              { img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=600&auto=format&fit=crop', style: 'Modern', user: 'Sanya V.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="group relative aspect-[3/4] rounded-[32px] overflow-hidden border border-black/5 shadow-xl"
              >
                <img src={item.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Manifestation" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                  <span className="text-[10px] font-bold text-gold uppercase tracking-widest mb-1">{item.style}</span>
                  <p className="text-white font-serif font-bold text-lg">{item.user}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section id="features" className="py-24 sm:py-40 px-4 sm:px-6 bg-luxury-gray">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 sm:mb-24">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mb-6 sm:mb-8 text-ink"
            >
              The Aureum Suite
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-ink-light max-w-2xl mx-auto font-medium text-base sm:text-lg"
            >
              Everything you need to transform your space, from concept to reality.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <Link to="/makeover" className="group">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="relative h-[400px] sm:h-[500px] rounded-[40px] overflow-hidden border border-black/5 bg-white p-8 sm:p-12 flex flex-col justify-end shadow-sm hover:shadow-2xl transition-all duration-500"
              >
                <img 
                  src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1932&auto=format&fit=crop" 
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-1000" 
                  alt="Makeover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent z-0" />
                <div className="relative z-10">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gold flex items-center justify-center mb-6 sm:mb-8 shadow-lg shadow-gold/20">
                    <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-serif font-bold mb-4 text-ink">AI Room Makeover</h3>
                  <p className="text-ink-light max-w-md font-medium text-sm sm:text-base">
                    Instant stylistic transformations with generative AI. Get personalized design tips and furniture suggestions for your space.
                  </p>
                </div>
              </motion.div>
            </Link>

            <Link to="/aether-vision" className="group">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                whileHover={{ y: -10 }}
                className="relative h-[400px] sm:h-[500px] rounded-[40px] overflow-hidden border border-black/5 bg-white p-8 sm:p-12 flex flex-col justify-end shadow-sm hover:shadow-2xl transition-all duration-500"
              >
                <img 
                  src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1932&auto=format&fit=crop" 
                  className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:scale-105 transition-transform duration-1000" 
                  alt="Aether Vision"
                  referrerPolicy="no-referrer"
                />
                <div className="relative z-10">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-ink flex items-center justify-center mb-6 sm:mb-8 shadow-lg shadow-black/20">
                    <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-gold" />
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-serif font-bold mb-4 text-ink">Aether Vision</h3>
                  <p className="text-ink-light max-w-md font-medium text-sm sm:text-base">
                    The ultimate bridge between thought and space. Conversational design synthesis that manifests your dream atmosphere.
                  </p>
                </div>
              </motion.div>
            </Link>
          </div>
        </div>
      </section>

      {/* Filler Section: Testimonials */}
      <section className="py-24 sm:py-40 px-4 sm:px-6 bg-luxury-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl sm:text-6xl font-serif font-bold text-ink mb-8">Building with the <br /> <span className="text-gold italic font-normal">Early Adopters.</span></h2>
              <p className="text-ink-light text-lg font-medium mb-12">We're currently in private beta, working closely with a select group of designers to perfect the experience.</p>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full border-2 border-white bg-luxury-gray overflow-hidden shadow-lg">
                      <img src={`https://i.pravatar.cc/150?u=${i + 20}`} alt="User" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-bold text-ink uppercase tracking-widest">1,200+ Manifestations</p>
                  <p className="text-[8px] font-bold text-gold uppercase tracking-widest">Growing Community</p>
                </div>
              </div>
            </div>
            <div className="bg-luxury-gray p-12 rounded-[60px] border border-black/5 relative">
              <div className="absolute -top-6 -left-6 w-12 h-12 bg-gold rounded-full flex items-center justify-center text-white font-serif text-4xl">"</div>
              <p className="text-2xl font-serif italic text-ink leading-relaxed mb-8">
                "The vision for Aureum is exactly what the industry has been waiting for. A truly spatial approach to design that feels natural and intuitive."
              </p>
              <div>
                <p className="font-bold text-ink">Design Team</p>
                <p className="text-[10px] uppercase tracking-widest text-gold font-bold">Early Preview Feedback</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
