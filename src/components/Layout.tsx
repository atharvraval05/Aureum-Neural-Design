import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { motion, AnimatePresence } from 'motion/react';
import Lenis from 'lenis';

const Layout = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-luxury-white selection:bg-gold selection:text-white">
      <Navbar />
      <main>
        <AnimatePresence mode="wait">
          <Outlet />
        </AnimatePresence>
      </main>
      
      <footer className="py-20 px-6 border-t border-black/5 bg-luxury-gray">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <h2 className="font-serif text-4xl font-bold text-ink mb-6">AUREUM</h2>
            <p className="text-ink/50 max-w-md leading-relaxed font-medium">
              Redefining interior spaces through the lens of artificial intelligence. 
              Experience the future of home design with our advanced AI-driven
              generative visualization tools.
            </p>
          </div>
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-ink/30 mb-8">Features</h4>
            <ul className="space-y-4 text-ink/60 text-sm font-semibold">
              <li><a href="#" className="hover:text-gold transition-colors">Real-time Editor</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">Style Makeover</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">VR Walkthrough</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-ink/30 mb-8">Connect</h4>
            <ul className="space-y-4 text-ink/60 text-sm font-semibold">
              <li><a href="#" className="hover:text-gold transition-colors">Collective</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">Showcase</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">Support</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">API</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-4 text-ink/30 text-[10px] font-bold uppercase tracking-widest">
          <p>© 2026 AUREUM AI. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-ink transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-ink transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
