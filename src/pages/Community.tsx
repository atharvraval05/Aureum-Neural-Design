import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart, MessageCircle, Share2, User, Sparkles, Filter, Search, ArrowUpRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { useLocation } from 'react-router-dom';

const Community = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Works');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search');
    if (search) {
      setSearchQuery(search);
    }
  }, [location.search]);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [avatarErrors, setAvatarErrors] = useState<Record<number, boolean>>({});

  const handleImageError = (id: number) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  const handleAvatarError = (id: number) => {
    setAvatarErrors(prev => ({ ...prev, [id]: true }));
  };

  const posts = [
    {
      id: 1,
      user: 'Elena Rossi',
      role: 'Architect',
      image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1000&auto=format&fit=crop',
      likes: '1.2k',
      comments: 48,
      title: 'Minimalist Loft in Milan',
      tags: ['Minimalism', 'Milan', 'Loft'],
      category: 'Minimalist'
    },
    {
      id: 2,
      user: 'Julian Chen',
      role: 'Interior Designer',
      image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1000&auto=format&fit=crop',
      likes: '856',
      comments: 32,
      title: 'Warm Organic Living Space',
      tags: ['Organic', 'Warm', 'Living'],
      category: 'Scandinavian'
    },
    {
      id: 3,
      user: 'Sarah Jenkins',
      role: 'Visual Artist',
      image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1000&auto=format&fit=crop',
      likes: '2.4k',
      comments: 124,
      title: 'The Brutalist Study',
      tags: ['Brutalist', 'Study', 'Concrete'],
      category: 'Industrial'
    },
    {
      id: 4,
      user: 'Marcus Thorne',
      role: 'Spatial Designer',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1000&auto=format&fit=crop',
      likes: '1.5k',
      comments: 56,
      title: 'Neo-Classical Revival',
      tags: ['Classical', 'Luxury', 'Revival'],
      category: 'Art Deco'
    },
    {
      id: 5,
      user: 'Aria Vance',
      role: 'Eco-Architect',
      image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1000&auto=format&fit=crop',
      likes: '3.1k',
      comments: 89,
      title: 'Vertical Garden Penthouse',
      tags: ['Biophilic', 'Green', 'Eco'],
      category: 'Biophilic'
    },
    {
      id: 6,
      user: 'Thomas Wright',
      role: 'Vintage Specialist',
      image: 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?q=80&w=1000&auto=format&fit=crop',
      likes: '920',
      comments: 41,
      title: 'Mid-Century Modern Den',
      tags: ['Vintage', 'Wood', 'Retro'],
      category: 'Mid-Century'
    }
  ];

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = activeCategory === 'All Works' || post.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const categories = ['All Works', 'Minimalist', 'Industrial', 'Scandinavian', 'Mid-Century', 'Art Deco', 'Biophilic'];

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen bg-luxury-white">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 text-gold text-[10px] font-bold tracking-[0.2em] uppercase mb-6"
            >
              <Sparkles className="w-3 h-3" />
              The Collective
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-serif font-bold text-ink leading-[0.9] mb-6"
            >
              Where Spaces <br /> <span className="text-gold italic font-normal">Find Their Voice.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-ink-light text-lg font-medium max-w-lg"
            >
              Join a global community of visionaries. Share your AI-generated designs, 
              get feedback, and find inspiration for your next project.
            </motion.p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/30" />
              <input 
                type="text" 
                placeholder="Search styles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-luxury-gray border border-black/5 rounded-2xl py-4 pl-12 pr-6 text-sm outline-none focus:border-gold/30 transition-all w-full md:w-64 shadow-sm"
              />
            </div>
            <button className="p-4 bg-luxury-gray border border-black/5 rounded-2xl text-ink/40 hover:text-ink transition-colors shadow-sm">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Categories Filler */}
        <div className="flex items-center gap-3 mb-12 overflow-x-auto pb-4 custom-scrollbar">
          {categories.map((cat) => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                activeCategory === cat ? "bg-ink text-white shadow-lg shadow-black/10" : "bg-luxury-gray border border-black/5 text-ink/40 hover:border-gold/30 hover:text-ink"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Filler: Trending Challenges */}
        <div className="mb-16 p-8 rounded-[40px] bg-gold/5 border border-gold/10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gold flex items-center justify-center shadow-lg shadow-gold/20">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-ink">Weekly Challenge: The Glass House</h3>
              <p className="text-ink/40 text-[10px] uppercase tracking-widest font-bold">Ends in 2 days • 1.2k Participants</p>
            </div>
          </div>
          <button className="px-8 py-4 bg-ink text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-gold transition-all">
            Join Challenge
          </button>
        </div>

        {/* Feed Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group"
              >
                <div className="relative aspect-[4/3] rounded-[40px] overflow-hidden mb-6 border border-black/5 shadow-sm group-hover:shadow-2xl transition-all duration-700 bg-luxury-gray">
                  <img 
                    src={imageErrors[post.id] ? `https://picsum.photos/seed/arch${post.id}/1000/800` : post.image} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                    alt={post.title}
                    referrerPolicy="no-referrer"
                    onError={() => handleImageError(post.id)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center overflow-hidden">
                        <img 
                          src={avatarErrors[post.id] ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user}` : `https://i.pravatar.cc/150?u=${post.id}`} 
                          alt={post.user} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer" 
                          onError={() => handleAvatarError(post.id)}
                        />
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">{post.user}</p>
                        <p className="text-white/60 text-[10px] uppercase tracking-widest">{post.role}</p>
                      </div>
                    </div>
                    <button className="w-12 h-12 rounded-full bg-gold text-white flex items-center justify-center shadow-lg">
                      <ArrowUpRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-start justify-between px-2">
                  <div>
                    <div className="flex gap-2 mb-3">
                      {post.tags.map(tag => (
                        <span key={tag} className="text-[8px] font-bold uppercase tracking-widest text-gold bg-gold/5 px-2 py-1 rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-ink group-hover:text-gold transition-colors">{post.title}</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 text-ink-light hover:text-red-500 transition-colors">
                      <Heart className="w-5 h-5" />
                      <span className="text-xs font-bold">{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-2 text-ink-light hover:text-gold transition-colors">
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-xs font-bold">{post.comments}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <p className="text-ink/40 font-serif text-2xl italic">No designs found matching your search...</p>
            </div>
          )}
        </div>

        {/* Filler Section - Join the movement */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-32 p-12 sm:p-20 rounded-[60px] bg-luxury-gray border border-black/5 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
            <div className="absolute top-10 left-10 w-40 h-40 border border-ink rounded-full" />
            <div className="absolute bottom-10 right-10 w-60 h-60 border border-ink rounded-full" />
          </div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-ink mb-8">Ready to showcase your vision?</h2>
            <p className="text-ink-light text-lg mb-12 font-medium">
              The Collective is growing every day. Upload your first scan and start 
              building your digital portfolio today.
            </p>
            <button className="px-12 py-5 bg-ink text-white font-bold rounded-full hover:bg-gold transition-all shadow-xl shadow-black/10 uppercase tracking-widest text-xs">
              Upload Your Design
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Community;
