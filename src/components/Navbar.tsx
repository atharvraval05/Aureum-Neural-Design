import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutGrid, Sparkles, Users, Home as HomeIcon, User, Share2, Search, Menu, X, LogIn, ArrowRight, Box, Zap, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import AuthModal from './AuthModal';
import { useAuth } from '../lib/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navItems = [
    { path: '/', label: 'Home', icon: HomeIcon, id: 'hero' },
    { path: '/makeover', label: 'AI Room Makeover', icon: Sparkles },
    { path: '/aether-vision', label: 'Aether Vision', icon: Zap },
    { path: '/community', label: 'Community Section', icon: Users },
  ];

  const handleNavClick = (e: React.MouseEvent, path: string, id?: string) => {
    if (location.pathname === '/' && id) {
      e.preventDefault();
      const element = document.getElementById(id);
      if (element) {
        const offset = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
        setIsMobileMenuOpen(false);
      }
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Aureum Spatial Intelligence',
          text: 'Check out this amazing AI interior design tool!',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <>
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-[1000] transition-all duration-700 px-4 sm:px-8 lg:px-12",
        isScrolled 
          ? "py-3 bg-white/95 backdrop-blur-xl border-b border-black/5 shadow-2xl" 
          : "py-6 lg:py-10 bg-transparent"
      )}>
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          {/* Brand - Left Aligned */}
          <Link 
            to="/" 
            onClick={(e) => handleNavClick(e, '/', 'hero')}
            className="flex items-center gap-3 sm:gap-4 group relative z-50"
          >
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-2 border-dashed border-gold/20 rounded-full"
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute inset-2 border border-ink/5 rounded-full"
              />
              <Box className="w-4 h-4 sm:w-5 sm:h-5 text-gold group-hover:scale-125 transition-transform duration-700" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl sm:text-3xl font-bold tracking-tighter text-ink leading-none">AUREUM</span>
              <div className="hidden sm:flex items-center gap-2 mt-1">
                <span className="w-4 h-[1px] bg-gold" />
                <span className="text-[7px] uppercase tracking-[0.5em] text-gold font-bold">Spatial Intelligence</span>
              </div>
            </div>
          </Link>
          
          {/* Desktop Navigation - Centered Floating Bar */}
          <div className="hidden lg:flex items-center gap-2 bg-luxury-gray/40 backdrop-blur-md p-1.5 rounded-2xl border border-black/5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={(e) => handleNavClick(e, item.path, item.id)}
                  className={cn(
                    "relative px-4 py-2 text-[9px] font-bold uppercase tracking-[0.25em] transition-all rounded-xl flex items-center gap-2 overflow-hidden group",
                    isActive ? "bg-ink text-white shadow-lg" : "text-ink/40 hover:text-ink hover:bg-white/50"
                  )}
                >
                  <span className="relative z-10">{item.label}</span>
                  {!isActive && (
                    <motion.div 
                      className="absolute bottom-0 left-0 w-full h-[1px] bg-gold scale-x-0 group-hover:scale-x-100 transition-transform origin-left"
                    />
                  )}
                </Link>
              );
            })}
          </div>

            {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-4 relative z-[110]">
            <div className="hidden md:flex items-center gap-2">
              <div className={cn(
                "flex items-center bg-luxury-gray/40 backdrop-blur-md rounded-xl border border-black/5 transition-all duration-500 overflow-hidden",
                isSearchOpen ? "w-64 px-4" : "w-10 px-0"
              )}>
                <button 
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="w-10 h-10 shrink-0 flex items-center justify-center text-ink/70 hover:text-gold transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
                <input 
                  type="text"
                  placeholder="Search designs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "bg-transparent border-none outline-none text-[10px] font-bold uppercase tracking-widest text-ink placeholder:text-ink/20 transition-opacity duration-300",
                    isSearchOpen ? "opacity-100 w-full ml-2" : "opacity-0 w-0"
                  )}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery) {
                      window.location.href = `/community?search=${encodeURIComponent(searchQuery)}`;
                    }
                  }}
                />
              </div>
              <button 
                onClick={handleShare}
                className="w-10 h-10 rounded-xl hover:bg-black/5 flex items-center justify-center text-ink/70 transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
            
            <div className="w-[1px] h-6 bg-black/10 hidden md:block" />
            
            {user ? (
              <div className="flex items-center gap-2">
                <Link 
                  to="/profile"
                  className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-white text-ink rounded-xl hover:bg-gold hover:text-white transition-all duration-500 group border border-black/5 shadow-sm"
                >
                  <div className="w-6 h-6 rounded-lg bg-ink/5 flex items-center justify-center overflow-hidden">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-3 h-3 text-ink/40" />
                    )}
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest truncate max-w-[80px]">
                    {user.displayName || 'Profile'}
                  </span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-luxury-gray text-ink rounded-xl hover:bg-red-50 hover:text-red-600 transition-all duration-500 group border border-black/5"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => {
                  setAuthMode('signup');
                  setIsAuthModalOpen(true);
                }}
                className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-ink text-white rounded-xl hover:bg-gold transition-all duration-500 group shadow-lg shadow-black/10"
              >
                <User className="w-4 h-4" />
                <span className="text-[9px] font-bold uppercase tracking-widest">Portal</span>
              </button>
            )}
            
            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn(
                "lg:hidden w-10 h-10 backdrop-blur-md border rounded-xl flex items-center justify-center transition-all duration-500",
                isMobileMenuOpen 
                  ? "bg-gold border-gold text-white shadow-lg shadow-gold/20" 
                  : "bg-white/50 border-black/5 text-ink hover:bg-white"
              )}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ willChange: 'opacity' }}
            className="lg:hidden fixed inset-0 bg-ink/98 backdrop-blur-md z-[900] flex flex-col pointer-events-auto"
          >
            {/* Jarvis-like Grid Overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
              style={{ 
                backgroundImage: 'radial-gradient(circle, #8A6D3B 1px, transparent 1px)', 
                backgroundSize: '30px 30px' 
              }} 
            />

            <div className="relative z-10 flex flex-col h-full pt-24 pb-12 px-8">
              <div className="flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2 min-h-0">
                {navItems.map((item, i) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      style={{ willChange: 'transform, opacity' }}
                      transition={{ delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Link
                        to={item.path}
                        onClick={(e) => {
                          handleNavClick(e, item.path, item.id);
                          if (!item.id) setIsMobileMenuOpen(false);
                        }}
                        className={cn(
                          "group flex items-center justify-between p-5 rounded-3xl transition-all border",
                          isActive 
                            ? "bg-gold border-gold shadow-2xl shadow-gold/20" 
                            : "bg-white/5 border-white/10 hover:bg-white/10"
                        )}
                      >
                        <div className="flex items-center gap-5">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110",
                            isActive ? "bg-white text-gold" : "bg-white/10 text-white"
                          )}>
                            <item.icon className="w-6 h-6" />
                          </div>
                          <div className="flex flex-col">
                            <span className={cn(
                              "font-serif text-2xl font-bold tracking-tight",
                              isActive ? "text-white" : "text-white/90"
                            )}>{item.label}</span>
                            <span className={cn(
                              "text-[8px] uppercase tracking-[0.3em] font-bold",
                              isActive ? "text-white/60" : "text-gold/60"
                            )}>Navigation Phase 0{i+1}</span>
                          </div>
                        </div>
                        <ArrowRight className={cn(
                          "w-5 h-5 transition-transform group-hover:translate-x-1",
                          isActive ? "text-white" : "text-white/20"
                        )} />
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-auto flex flex-col gap-4">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="w-full"
                >
                  {user ? (
                    <div className="grid grid-cols-2 gap-4">
                      <Link 
                        to="/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="py-5 bg-white/5 border border-white/10 rounded-3xl font-bold uppercase tracking-[0.2em] text-[9px] text-white flex flex-col items-center justify-center gap-3 hover:bg-white/10 transition-all"
                      >
                        <User className="w-5 h-5 text-gold" />
                        Profile
                      </Link>
                      <button 
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          handleLogout();
                        }}
                        className="py-5 bg-white/5 border border-white/10 rounded-3xl font-bold uppercase tracking-[0.2em] text-[9px] text-white flex flex-col items-center justify-center gap-3 hover:bg-red-500/10 hover:text-red-500 transition-all"
                      >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => {
                        setAuthMode('signup');
                        setIsMobileMenuOpen(false);
                        setIsAuthModalOpen(true);
                      }}
                      className="w-full py-6 bg-gold shadow-xl shadow-gold/20 rounded-3xl font-bold uppercase tracking-[0.3em] text-[10px] text-ink flex items-center justify-center gap-4 hover:bg-gold-light transition-all"
                    >
                      <User className="w-6 h-6" />
                      Access Portal
                    </button>
                  )}
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="flex items-center justify-center gap-6 pt-6 border-t border-white/10"
                >
                  <span className="text-[8px] uppercase tracking-[0.5em] text-white/30 font-bold">Aureum Spatial Intelligence v2.5</span>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialMode={authMode}
      />
    </>
  );
};

export default Navbar;
