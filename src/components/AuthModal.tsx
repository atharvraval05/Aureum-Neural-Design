import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, ArrowRight, Github, AlertCircle } from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
  GithubAuthProvider
} from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setIsLogin(initialMode === 'login');
    }
  }, [isOpen, initialMode]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      setError("Firebase is not configured. Please add your API keys to the environment.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (err: any) {
      if (err.code === 'auth/unauthorized-domain') {
        setError("This domain is not authorized in your Firebase Console. Please add this URL to your 'Authorized domains' in the Firebase Auth settings.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'github') => {
    if (!auth) {
      setError("Firebase is not configured. Please add your API keys to the environment.");
      return;
    }
    setError(null);
    setLoading(true);
    const authProvider = provider === 'google' ? new GoogleAuthProvider() : new GithubAuthProvider();
    
    try {
      await signInWithPopup(auth, authProvider);
      onClose();
    } catch (err: any) {
      if (err.code === 'auth/popup-blocked') {
        try {
          await signInWithRedirect(auth, authProvider);
        } catch (redirectErr: any) {
          setError("Your browser blocked the popup window. Please allow popups or try again.");
        }
      } else if (err.code === 'auth/unauthorized-domain') {
        setError("This domain is not authorized in your Firebase Console. Please add this URL to your 'Authorized domains' in the Firebase Auth settings.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink/40 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden border border-black/5"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 hover:bg-luxury-gray rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-ink/40" />
            </button>

            <div className="p-10">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-serif font-bold text-ink mb-2">
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-ink/40 text-sm font-medium">
                  {isLogin ? 'Enter your details to access your studio.' : 'Join the collective of modern designers.'}
                </p>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleAuth} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/30" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    required
                    className="w-full bg-luxury-gray border border-transparent focus:border-gold/30 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none transition-all"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/30" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    className="w-full bg-luxury-gray border border-transparent focus:border-gold/30 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none transition-all"
                  />
                </div>
                
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-ink text-white font-bold rounded-2xl hover:bg-gold disabled:bg-ink/50 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-black/10"
                >
                  {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Get Started')}
                  {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>

              <div className="mt-8 flex items-center gap-4">
                <div className="h-[1px] flex-1 bg-black/5" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-ink/20">Or continue with</span>
                <div className="h-[1px] flex-1 bg-black/5" />
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleSocialAuth('github')}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 py-3 border border-black/5 rounded-xl hover:bg-luxury-gray transition-colors disabled:opacity-50"
                >
                  <Github className="w-4 h-4" />
                  <span className="text-xs font-bold">GitHub</span>
                </button>
                <button 
                  onClick={() => handleSocialAuth('google')}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 py-3 border border-black/5 rounded-xl hover:bg-luxury-gray transition-colors disabled:opacity-50"
                >
                  <div className="w-4 h-4 bg-red-500 rounded-full" />
                  <span className="text-xs font-bold">Google</span>
                </button>
              </div>

              <div className="mt-10 text-center">
                <button 
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError(null);
                  }}
                  className="text-xs font-bold text-ink/40 hover:text-gold transition-colors underline underline-offset-4"
                >
                  {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
