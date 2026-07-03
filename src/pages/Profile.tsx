import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { LayoutGrid, Box, Clock, ArrowRight, User as UserIcon, Settings, Shield, LogOut, Loader2, Trash2, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [savedScene, setSavedScene] = useState<any>(null);
  const [visions, setVisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user && db) {
        try {
          // Fetch saved scene (if any)
          const docRef = doc(db, 'user_scenes', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setSavedScene(docSnap.data());
          }

          // Fetch visions
          const q = query(
            collection(db, 'visions'),
            where('uid', '==', user.uid),
            orderBy('createdAt', 'desc')
          );
          const visionSnap = await getDocs(q);
          setVisions(visionSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (err) {
          console.error('Error fetching profile data:', err);
        } finally {
          setLoading(false);
        }
      } else if (!authLoading && !user) {
        navigate('/');
      }
    };

    fetchUserData();
  }, [user, authLoading, navigate]);

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-luxury-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-gold animate-spin" />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">Accessing Secure Vault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-4 sm:px-8 lg:px-12 min-h-screen bg-luxury-white">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-gold/5 to-transparent rounded-[40px] -z-10" />
          <div className="p-8 sm:p-12 flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[40px] bg-ink flex items-center justify-center overflow-hidden border-4 border-white shadow-2xl">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-12 h-12 text-gold" />
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gold rounded-2xl flex items-center justify-center border-4 border-white shadow-lg">
                <Shield className="w-4 h-4 text-white" />
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <h1 className="text-4xl sm:text-5xl font-serif font-bold text-ink">
                  {user?.displayName || 'Aureum Member'}
                </h1>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-gold/10 text-gold text-[8px] font-bold uppercase tracking-widest border border-gold/20">
                  Pro Designer
                </span>
              </div>
              <p className="text-ink/40 font-medium mb-6">{user?.email}</p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-black/5 rounded-xl shadow-sm">
                  <Clock className="w-3 h-3 text-gold" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-ink/60">
                    Joined {user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Recently'}
                  </span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-500 border border-red-100 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                >
                  <LogOut className="w-3 h-3" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Stats & Settings */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-luxury-gray border border-black/5 rounded-[32px] p-8 shadow-sm">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-ink/30 mb-8">Studio Analytics</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                      <LayoutGrid className="w-5 h-5 text-gold" />
                    </div>
                    <span className="text-xs font-bold text-ink/60">Saved Scenes</span>
                  </div>
                  <span className="text-xl font-serif font-bold text-ink">{visions.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                      <Box className="w-5 h-5 text-gold" />
                    </div>
                    <span className="text-xs font-bold text-ink/60">Scene Assets</span>
                  </div>
                  <span className="text-xl font-serif font-bold text-ink">{savedScene?.items?.length || 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-luxury-gray border border-black/5 rounded-[32px] p-8 shadow-sm">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-ink/30 mb-8">Account Settings</h3>
              <div className="space-y-4">
                {[
                  { icon: UserIcon, label: 'Edit Profile' },
                  { icon: Shield, label: 'Security & Privacy' },
                  { icon: Settings, label: 'Preferences' }
                ].map((item) => (
                  <button key={item.label} className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border border-black/5 hover:border-gold/30 transition-all group">
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 text-ink/40 group-hover:text-gold transition-colors" />
                      <span className="text-xs font-bold text-ink/60">{item.label}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-ink/20 group-hover:translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Saved Designs */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-black/5 rounded-[40px] p-8 sm:p-12 shadow-sm min-h-[600px]">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="text-3xl font-serif font-bold text-ink mb-2">Saved Manifestations</h2>
                  <p className="text-ink/40 text-sm font-medium">Your architectural visions stored in the cloud.</p>
                </div>
                <Link 
                  to="/makeover" 
                  className="hidden sm:flex items-center gap-2 px-6 py-3 bg-gold text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-ink transition-all shadow-xl shadow-gold/20"
                >
                  <Plus className="w-4 h-4" />
                  New Design
                </Link>
              </div>

              {visions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {visions.map((vision) => (
                    <div key={vision.id} className="group relative bg-luxury-gray rounded-[32px] overflow-hidden border border-black/5 shadow-sm hover:shadow-xl transition-all">
                      <div className="aspect-video relative">
                        <img 
                          src={vision.resultImage} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          alt={vision.prompt}
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <p className="text-white text-[10px] font-bold uppercase tracking-widest line-clamp-1">{vision.prompt}</p>
                        </div>
                      </div>
                      <div className="p-4 flex items-center justify-between">
                        <span className="text-[8px] font-bold text-ink/40 uppercase tracking-widest">
                          {vision.createdAt?.toDate ? vision.createdAt.toDate().toLocaleDateString() : 'Recently'}
                        </span>
                        <div className="flex gap-2">
                          <Link 
                            to="/aether-vision" 
                            className="p-2 bg-white rounded-lg text-gold hover:bg-gold hover:text-white transition-all shadow-sm"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-24 h-24 rounded-[40px] bg-luxury-gray flex items-center justify-center mb-8">
                    <Box className="w-10 h-10 text-ink/10" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-ink/40 mb-2">No Manifestations Found</h3>
                  <p className="text-sm text-ink/30 max-w-xs mb-8">You haven't saved any spatial designs to the cloud yet.</p>
                  <Link 
                    to="/aether-vision" 
                    className="px-10 py-4 bg-ink text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-gold transition-all shadow-xl"
                  >
                    Start Designing
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Plus = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

export default Profile;
