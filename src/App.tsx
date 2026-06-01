import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Info, Plus, Check, Heart, HeartOff, Download, Trash2, 
  Sparkles, Shield, Monitor, Compass, Tv, Award, RefreshCw, Layers, Wifi, WifiOff, Bell
} from 'lucide-react';
import { Movie, User, Profile, AppNotification, Transaction, Episode } from './types';
import { INITIAL_MOVIES, MOCK_GENRES } from './data/initialMovies';

// Subcomponents imports
import Layout from './components/Layout';
import VideoPlayer from './components/VideoPlayer';
import AuthModal from './components/AuthModal';
import MovieDetailModal from './components/MovieDetailModal';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  // ------------------------------------
  // Local Database Persistence Syncs
  // ------------------------------------
  const [movies, setMovies] = useState<Movie[]>(() => {
    const saved = localStorage.getItem('streamflix_movies');
    return saved ? JSON.parse(saved) : INITIAL_MOVIES;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('streamflix_users');
    if (saved) return JSON.parse(saved);

    // Initial default mock users with premium active for seamless UX
    const defaultUser: User = {
      id: 'usr_tito',
      email: 'titokilonzo3@gmail.com',
      name: 'Tito Kilonzo',
      role: 'admin',
      subscription: 'premium',
      subscriptionStatus: 'active',
      billingCycle: 'monthly',
      createdAt: new Date().toISOString().split('T')[0],
      profiles: [
        {
          id: 'prof_tito_adult',
          name: 'Tito (Primary)',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
          isKids: false,
          watchlist: ['m1', 'm3', 'm8'],
          continueWatching: [
            { movieId: 'm1', position: 120, duration: 7260, updatedAt: new Date().toISOString() },
            { movieId: 'm4', episodeId: 'ep1', position: 450, duration: 900, updatedAt: new Date().toISOString() }
          ],
          downloads: [
            { movieId: 'm2', progress: 100, isCompleted: true, downloadedAt: new Date().toISOString(), fileSize: '180 MB' }
          ]
        },
        {
          id: 'prof_tito_kids',
          name: 'Kids Academy',
          avatarUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150&q=80',
          isKids: true,
          watchlist: ['m2'],
          continueWatching: [],
          downloads: []
        }
      ]
    };
    return [defaultUser];
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('streamflix_current_user');
    return saved ? JSON.parse(saved) : users[0] || null;
  });

  const [activeProfile, setActiveProfile] = useState<Profile | null>(() => {
    if (!currentUser) return null;
    const lastProfileId = localStorage.getItem('streamflix_active_profile_id');
    const profile = currentUser.profiles.find(p => p.id === lastProfileId);
    return profile || currentUser.profiles[0] || null;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('streamflix_transactions');
    if (saved) return JSON.parse(saved);

    // Default mock transactions ledger
    const dummyTrans: Transaction[] = [
      { id: 'tx_101', userEmail: 'titokilonzo3@gmail.com', plan: 'premium', amount: 15.99, paymentMethod: 'Stripe', status: 'Completed', date: '2026-05-15' },
      { id: 'tx_102', userEmail: 'm-pesa.api@safaricom.co.ke', plan: 'standard', amount: 11.99, paymentMethod: 'M-Pesa', status: 'Completed', date: '2026-05-28' },
      { id: 'tx_103', userEmail: 'customer.care@google.com', plan: 'basic', amount: 7.99, paymentMethod: 'Stripe', status: 'Completed', date: '2026-05-30' }
    ];
    return dummyTrans;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('streamflix_notifications');
    if (saved) return JSON.parse(saved);

    const initialNotifs: AppNotification[] = [
      { id: 'n1', title: 'Season 2 Premiere', message: '"The Great Hackers: Syndicate" is live. Stream season premiere with spatial audio!', isRead: false, createdAt: '10:15 AM', type: 'release', movieId: 'm4' },
      { id: 'n2', title: 'Network Stream Secured', message: 'Offline downloads cache initialized. Ready for cellular data-saver modes.', isRead: true, createdAt: 'Yesterday', type: 'info' }
    ];
    return initialNotifs;
  });

  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);
  const lastNotifsCountRef = useRef(notifications.length);

  useEffect(() => {
    if (notifications.length > lastNotifsCountRef.current) {
      const newest = notifications[0];
      if (newest) {
        setActiveToast(newest);
        const timer = setTimeout(() => {
          setActiveToast(null);
        }, 4500);
        return () => clearTimeout(timer);
      }
    }
    lastNotifsCountRef.current = notifications.length;
  }, [notifications]);

  // ------------------------------------
  // GUI & Navigation States
  // ------------------------------------
  const [activeTab, setActiveTab] = useState<'home' | 'movies' | 'tv' | 'documentaries' | 'watchlist' | 'downloads'>('home');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(true);

  // Modal controls
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [playingMovie, setPlayingMovie] = useState<Movie | null>(null);
  const [playingEpisode, setPlayingEpisode] = useState<Episode | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(() => !currentUser || !activeProfile);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [showPlansModal, setShowPlansModal] = useState(false);

  // Sync state to local storage on changes
  useEffect(() => {
    localStorage.setItem('streamflix_movies', JSON.stringify(movies));
  }, [movies]);

  useEffect(() => {
    localStorage.setItem('streamflix_users', JSON.stringify(users));
    if (currentUser) {
      const refreshedUser = users.find(u => u.id === currentUser.id);
      if (refreshedUser) {
        localStorage.setItem('streamflix_current_user', JSON.stringify(refreshedUser));
      }
    }
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('streamflix_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('streamflix_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    if (activeProfile) {
      localStorage.setItem('streamflix_active_profile_id', activeProfile.id);
    } else {
      localStorage.removeItem('streamflix_active_profile_id');
    }
  }, [activeProfile]);

  useEffect(() => {
    localStorage.setItem('streamflix_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('streamflix_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Handle deep-linking query parameters on mount or updates
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const movieIdParam = params.get('movie');
    if (movieIdParam) {
      const match = movies.find(m => m.id === movieIdParam);
      if (match) {
        setSelectedMovie(match);
      }
    }
  }, [movies]);

  // Keep active profile synced with users array changes
  useEffect(() => {
    if (currentUser && activeProfile) {
      const matchingUser = users.find(u => u.id === currentUser.id);
      if (matchingUser) {
        const matchingProfile = matchingUser.profiles.find(p => p.id === activeProfile.id);
        if (matchingProfile) {
          setActiveProfile(matchingProfile);
        }
      }
    }
  }, [users, currentUser]);

  // Handle Logins Callbacks
  const handleLogin = (email: string, name: string, isSocial = false) => {
    let existingUser = users.find(u => u.email === email);
    if (!existingUser) {
      existingUser = {
        id: `usr_${Date.now()}`,
        email,
        name,
        role: email.includes('admin') || email.includes('tito') ? 'admin' : 'user',
        subscription: 'none',
        subscriptionStatus: 'expired',
        billingCycle: 'monthly',
        createdAt: new Date().toISOString().split('T')[0],
        profiles: [
          {
            id: `p_primary_${Date.now()}`,
            name: name,
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
            isKids: false,
            watchlist: [],
            continueWatching: [],
            downloads: []
          }
        ]
      };
      setUsers(prev => [...prev, existingUser!]);
    }
    setCurrentUser(existingUser);
    setActiveProfile(existingUser.profiles[0]);
    if (existingUser.subscriptionStatus !== 'active') {
      setShowPlansModal(true);
    } else {
      setShowAuthModal(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveProfile(null);
    setShowAuthModal(true);
    setShowAdminDashboard(false);
    setShowPlansModal(false);
    localStorage.removeItem('streamflix_current_user');
    localStorage.removeItem('streamflix_active_profile_id');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);
  };

  const handleSelectProfile = (id: string) => {
    if (currentUser) {
      const prof = currentUser.profiles.find(p => p.id === id);
      if (prof) {
        setActiveProfile(prof);
        // Switch to appropriate catalogs tab
        setActiveTab('home');
        
        // Push notification of active session swap inside layout
        const newNotif: AppNotification = {
          id: `notif_${Date.now()}`,
          title: 'Session Profile Ready',
          message: `Streaming controls swapped to "${prof.name}". Content filtered.`,
          isRead: false,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'info'
        };
        setNotifications(prev => [newNotif, ...prev]);
      }
    }
  };

  // Add Dynamic Transactions ledger callback
  const handleAddTransaction = (plan: 'basic' | 'standard' | 'premium', amount: number, method: 'Stripe' | 'M-Pesa') => {
    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      userEmail: currentUser?.email || 'anonymous@streamflix.tv',
      plan,
      amount,
      paymentMethod: method,
      status: 'Completed',
      date: new Date().toISOString().split('T')[0]
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  // ------------------------------------
  // Interactions & Features Operations
  // ------------------------------------
  
  // Watchlist Toggle
  const handleToggleWatchlist = (movieId: string) => {
    if (!currentUser || !activeProfile) return;
    
    const isAdded = activeProfile.watchlist.includes(movieId);
    const nextWatchlist = isAdded 
      ? activeProfile.watchlist.filter(id => id !== movieId)
      : [...activeProfile.watchlist, movieId];

    const updatedProfile = {
      ...activeProfile,
      watchlist: nextWatchlist
    };

    const updatedProfiles = currentUser.profiles.map(p => 
      p.id === activeProfile.id ? updatedProfile : p
    );

    handleUpdateUser({
      ...currentUser,
      profiles: updatedProfiles
    });
  };

  // Download simulation worker
  const handleTriggerDownload = (movieId: string) => {
    if (!currentUser || !activeProfile) return;

    const existingDl = activeProfile.downloads.find(dl => dl.movieId === movieId);
    if (existingDl) {
      if (existingDl.isCompleted) {
        alert('File is already downloaded and cached locally!');
        return;
      }
    }

    const movieMeta = movies.find(m => m.id === movieId);
    const sizeStr = movieMeta && movieMeta.type === 'series' ? '820 MB' : '1.4 GB';

    // Start tracking in downloads list
    const newDl = {
      movieId,
      progress: 0,
      isCompleted: false,
      downloadedAt: new Date().toISOString(),
      fileSize: sizeStr
    };

    const nextDownloads = [...activeProfile.downloads, newDl];
    const updatedProfiles = currentUser.profiles.map(p => {
      if (p.id === activeProfile.id) {
        return {
          ...p,
          downloads: nextDownloads
        };
      }
      return p;
    });

    handleUpdateUser({
      ...currentUser,
      profiles: updatedProfiles
    });

    // Simulated background timer updating progress
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 20;
      
      setUsers(currentUsers => {
        return currentUsers.map(u => {
          if (u.id === currentUser.id) {
            const profs = u.profiles.map(p => {
              if (p.id === activeProfile.id) {
                const updatedDls = p.downloads.map(dl => {
                  if (dl.movieId === movieId) {
                    return {
                      ...dl,
                      progress: Math.min(100, currentProgress),
                      isCompleted: currentProgress >= 100
                    };
                  }
                  return dl;
                });
                return {
                  ...p,
                  downloads: updatedDls
                };
              }
              return p;
            });
            return {
              ...u,
              profiles: profs
            };
          }
          return u;
        });
      });

      if (currentProgress >= 100) {
        clearInterval(interval);
        
        // Dispatches app system notification
        const titleVal = movieMeta ? movieMeta.title : 'StreamFlix Media';
        const finishedNotif: AppNotification = {
          id: `notif_${Date.now()}`,
          title: 'Download Successful',
          message: `"${titleVal}" has been cached securely. Ready to play offline!`,
          isRead: false,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'download',
          movieId: movieId
        };
        setNotifications(prev => [finishedNotif, ...prev]);
      }
    }, 1200);
  };

  // Delete downloaded file
  const handleDeleteDownload = (movieId: string) => {
    if (!currentUser || !activeProfile) return;

    const filteredDls = activeProfile.downloads.filter(dl => dl.movieId !== movieId);
    const updatedProfiles = currentUser.profiles.map(p => {
      if (p.id === activeProfile.id) {
        return {
          ...p,
          downloads: filteredDls
        };
      }
      return p;
    });

    handleUpdateUser({
      ...currentUser,
      profiles: updatedProfiles
    });
  };

  // Track continued watches positions
  const handleProgressUpdate = (currentTimeVal: number, durationVal: number) => {
    if (!currentUser || !activeProfile || !playingMovie) return;

    const existingIndex = activeProfile.continueWatching.findIndex(cw => cw.movieId === playingMovie.id);
    let updatedCw = [...activeProfile.continueWatching];

    const item = {
      movieId: playingMovie.id,
      episodeId: playingEpisode?.id,
      position: Math.round(currentTimeVal),
      duration: Math.round(durationVal),
      updatedAt: new Date().toISOString()
    };

    if (existingIndex > -1) {
      updatedCw[existingIndex] = item;
    } else {
      updatedCw = [item, ...updatedCw];
    }

    const updatedProfiles = currentUser.profiles.map(p => {
      if (p.id === activeProfile.id) {
        return {
          ...p,
          continueWatching: updatedCw
        };
      }
      return p;
    });

    // Update state quietly
    setUsers(curr => curr.map(u => u.id === currentUser.id ? { ...u, profiles: updatedProfiles } : u));
  };

  // Next episode trigger
  const handleNextEpisode = () => {
    if (playingMovie && playingMovie.episodes && playingEpisode) {
      const idx = playingMovie.episodes.findIndex(ep => ep.id === playingEpisode.id);
      if (idx !== -1 && idx < playingMovie.episodes.length - 1) {
        setPlayingEpisode(playingMovie.episodes[idx + 1]);
      } else {
        alert('You have successfully binge-watched the entire season live!');
        setPlayingMovie(null);
        setPlayingEpisode(null);
      }
    }
  };

  // Broadcast campaign to notifications center
  const handleSendSystemNotification = (title: string, message: string) => {
    const freshNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      title,
      message,
      isRead: false,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'release'
    };
    setNotifications(prev => [freshNotif, ...prev]);
  };

  // ------------------------------------
  // Dynamic Content Query Filters
  // ------------------------------------
  const filteredCatalog = movies.filter(mv => {
    // 1. Kids profile restrictions
    if (activeProfile?.isKids) {
      if (mv.rating === 'R' || mv.genres.includes('Thriller') || !mv.genres.includes('Animation') && !mv.genres.includes('Kids')) {
        return false;
      }
    }

    // 2. Tab filtering rules
    if (activeTab === 'movies' && mv.category !== 'movie') return false;
    if (activeTab === 'tv' && mv.category !== 'series') return false;
    if (activeTab === 'documentaries' && mv.category !== 'documentary') return false;
    if (activeTab === 'watchlist') {
      return activeProfile?.watchlist.includes(mv.id) || false;
    }
    if (activeTab === 'downloads') {
      const isDownloaded = activeProfile?.downloads.some(dl => dl.movieId === mv.id && dl.isCompleted);
      return isDownloaded || false;
    }

    // 3. Genre Selector rule
    if (selectedGenre !== 'All' && !mv.genres.includes(selectedGenre)) return false;

    // 4. Search queries matching titles, genres, actors
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const matchTitle = mv.title.toLowerCase().includes(query);
      const matchGenre = mv.genres.some(g => g.toLowerCase().includes(query));
      const matchActor = mv.cast.some(c => c.toLowerCase().includes(query));
      const matchYear = mv.year.toString().includes(query);
      return matchTitle || matchGenre || matchActor || matchYear;
    }

    return true;
  });

  // Spotlight Header selection
  const spotlightMovie = movies.find(m => m.isTrending) || INITIAL_MOVIES[0];

  return (
    <div id="streamflix-core-canvas">
      
      {/* 1. LAYOUT STRUCTURAL SHELL wrapper */}
      <Layout
        currentUser={currentUser}
        activeProfile={activeProfile}
        activeTab={activeTab}
        setActiveTab={(t) => {
          setActiveTab(t);
          setSearchQuery('');
          setSelectedGenre('All');
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        notifications={notifications}
        onMarkNotificationRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))}
        onClearNotifications={() => setNotifications([])}
        onOpenProfileSelector={() => setShowAuthModal(true)}
        onOpenOpenPlans={() => { setShowAuthModal(true); }}
        onOpenAdmin={() => setShowAdminDashboard(true)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onSelectMovieById={(id) => {
          const matched = movies.find(m => m.id === id);
          if (matched) setSelectedMovie(matched);
        }}
      >
        
        {/* 2. DYNAMIC MAIN HOME PANEL */}
        {activeTab !== 'downloads' && activeTab !== 'watchlist' && searchQuery.trim() === '' && (
          <div id="v-billboard-header" className="relative">
            {/* HERO BILBOARD BANNER */}
            {spotlightMovie && (
              <div className="relative h-[480px] md:h-[600px] w-full bg-black">
                <img 
                  src={spotlightMovie.backdropUrl} 
                  alt={spotlightMovie.title} 
                  className="w-full h-full object-cover opacity-80"
                  referrerPolicy="no-referrer"
                />
                
                {/* Immersive Dark Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/30 to-black/40"></div>
                
                {/* Content Overlay */}
                <div className="absolute bottom-16 md:bottom-24 left-4 md:left-12 max-w-xl space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#E50914] text-white text-[10px] px-2 py-0.5 rounded font-mono font-bold tracking-widest uppercase">
                      #1 MOST POPULAR
                    </span>
                    <span className="text-white/60 text-xs font-semibold">{spotlightMovie.year} • {spotlightMovie.duration}</span>
                  </div>

                  <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-tight font-sans uppercase">
                    {spotlightMovie.title}
                  </h1>

                  <p className="text-sm md:text-base text-white/80 leading-relaxed font-sans line-clamp-3">
                    {spotlightMovie.description}
                  </p>

                  <div className="flex items-center gap-3">
                    <button 
                      id="hero-play-btn"
                      onClick={() => setPlayingMovie(spotlightMovie)}
                      className="bg-[#E50914] hover:bg-[#b80710] text-white font-extrabold text-xs md:text-sm px-6 py-3 rounded flex items-center gap-2 tracking-wide uppercase transition transform hover:scale-105 shadow-xl shadow-[#E50914]/15"
                    >
                      <Play className="w-4 h-4 fill-current animate-pulse" /> Stream Live
                    </button>
                    <button 
                      id="hero-info-btn"
                      onClick={() => setSelectedMovie(spotlightMovie)}
                      className="bg-white/10 hover:bg-white/20 border border-white/25 text-white font-bold text-xs md:text-sm px-5 py-3 rounded flex items-center gap-2 transition"
                    >
                      <Info className="w-4 h-4" /> Expand Details
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. CORE CATEGORIES & GRID SCROLLER SECTION */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-8 select-none">
          
          {/* Flat Genre Slider filters */}
          {activeTab !== 'downloads' && activeTab !== 'watchlist' && (
            <div className="flex items-center gap-2 overflow-x-auto py-2 no-scrollbar">
              {MOCK_GENRES.map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGenre(g)}
                  className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition whitespace-nowrap border ${
                    selectedGenre === g 
                      ? 'bg-[#E50914] text-white border-[#E50914] shadow'
                      : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          )}

          {/* DYNAMIC LISTINGS / GRID CAROUSEL */}
          {activeTab === 'downloads' || activeTab === 'watchlist' || searchQuery.trim() !== '' || selectedGenre !== 'All' ? (
            <div className="space-y-4">
              <h2 className="text-lg font-bold tracking-tight uppercase border-l-4 border-[#E50914] pl-3">
                {activeTab === 'downloads' ? 'My Downloads' : activeTab === 'watchlist' ? 'My List' : 'Search & Filter Results'} 
                <span className="text-xs text-white/40 block mt-1 normal-case font-mono">{filteredCatalog.length} matching content items</span>
              </h2>

              <div id="filtered-grid-gallery" className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {filteredCatalog.map((mv) => (
                  <div 
                    key={mv.id}
                    onClick={() => setSelectedMovie(mv)}
                    className="group bg-[#0f0f0f] border border-neutral-900 rounded-lg overflow-hidden relative cursor-pointer transform hover:-translate-y-1 transition duration-300 shadow-md flex flex-col"
                  >
                    <div className="aspect-[2/3] w-full overflow-hidden relative">
                      <img src={mv.posterUrl} alt={mv.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 to-transparent flex flex-col justify-end p-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-bold text-[#E50914] line-clamp-1">{mv.genres.join(', ')}</span>
                      </div>
                    </div>
                    <div className="p-3 shrink-0">
                      <h4 className="font-bold text-xs line-clamp-1">{mv.title}</h4>
                      <div className="flex items-center justify-between mt-1 text-[10px] font-mono opacity-60">
                        <span>{mv.year} • {mv.duration}</span>
                        <span>{mv.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredCatalog.length === 0 && (
                <div className="text-center py-16 space-y-3">
                  <Monitor className="w-12 h-12 text-slate-500 mx-auto opacity-50" />
                  <p className="text-sm font-semibold opacity-60">No matched streams live for this search parameters</p>
                  <button 
                    onClick={() => { setSearchQuery(''); setSelectedGenre('All'); }} 
                    className="bg-[#E50914] text-white font-bold text-xs px-4 py-1.5 rounded"
                  >
                    Reset Query Filters
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              
              {/* Dynamic CONTINUE WATCHING panel if profiles have progress */}
              {activeProfile && activeProfile.continueWatching.length > 0 && (
                <div id="row-continue" className="space-y-3">
                  <h3 className="text-sm font-extrabold tracking-widest text-[#E50914] uppercase font-mono flex items-center gap-1.5 hover:text-white transition-all">
                    ● Continue Watching for {activeProfile.name}
                  </h3>
                  
                  <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                    {activeProfile.continueWatching.map((cw) => {
                      const matchedItem = movies.find(m => m.id === cw.movieId);
                      if (!matchedItem) return null;

                      return (
                        <div 
                          key={cw.movieId}
                          onClick={() => {
                            setSelectedMovie(matchedItem);
                          }}
                          className="w-48 sm:w-56 bg-[#0f0f0f] border border-neutral-900 rounded-lg overflow-hidden shrink-0 relative cursor-pointer"
                        >
                          <div className="h-28 w-full relative">
                            <img src={matchedItem.backdropUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                              <span className="p-2 border border-white/40 bg-black/60 rounded-full text-white">
                                <Play className="w-4 h-4 fill-current ml-0.5" />
                              </span>
                            </div>
                            
                            {/* Continued slider progress line */}
                            <div className="absolute bottom-0 inset-x-0 h-1.5 bg-white/20">
                              <div 
                                className="h-full bg-[#E50914]" 
                                style={{ width: `${Math.min(100, (cw.position / cw.duration) * 100)}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="p-2">
                            <h4 className="font-bold text-xs text-white line-clamp-1">{matchedItem.title}</h4>
                            <span className="text-[10px] font-mono text-white/50 block mt-0.5">Resume: {Math.round(cw.position / 60)} min left</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TRENDING SLIDER CAROUSEL */}
              <div id="row-trending" className="space-y-3">
                <h3 className="text-sm font-semibold tracking-wider text-white uppercase font-sans border-l-4 border-[#E50914] pl-2">Trending Releases</h3>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                  {movies.filter(m => m.isTrending).map((mv) => (
                    <div 
                      key={mv.id}
                      onClick={() => setSelectedMovie(mv)}
                      className="w-36 sm:w-44 shrink-0 transition-transform duration-200 hover:-translate-y-1 cursor-pointer bg-[#0f0f0f] border border-neutral-900 rounded-lg overflow-hidden shadow"
                    >
                      <div className="aspect-[2/3] w-full overflow-hidden">
                        <img src={mv.posterUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="p-2 bg-black/10">
                        <h4 className="font-bold text-xs line-clamp-1">{mv.title}</h4>
                        <span className="text-[10px] font-mono text-white/50">{mv.year} • {mv.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* NEW RELEASES */}
              <div id="row-new-releases" className="space-y-3">
                <h3 className="text-sm font-semibold tracking-wider text-white uppercase font-sans border-l-4 border-[#E50914] pl-2">Hot & New Releases</h3>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                  {movies.filter(m => m.isNewRelease).map((mv) => (
                    <div 
                      key={mv.id}
                      onClick={() => setSelectedMovie(mv)}
                      className="w-36 sm:w-44 shrink-0 transition-transform duration-200 hover:-translate-y-1 cursor-pointer bg-[#0f0f0f] border border-neutral-900 rounded-lg overflow-hidden shadow"
                    >
                      <div className="aspect-[2/3] w-full overflow-hidden">
                        <img src={mv.posterUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="p-2 bg-black/10">
                        <h4 className="font-bold text-xs line-clamp-1">{mv.title}</h4>
                        <span className="text-[10px] font-mono text-white/50">{mv.year} • {mv.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* POPULAR MOVIES & TV SERIES */}
              <div id="row-popular" className="space-y-3">
                <h3 className="text-sm font-semibold tracking-wider text-white uppercase font-sans border-l-4 border-[#E50914] pl-2">Popular Movies & TV Shows</h3>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                  {movies.filter(m => m.isPopular).map((mv) => (
                    <div 
                      key={mv.id}
                      onClick={() => setSelectedMovie(mv)}
                      className="w-36 sm:w-44 shrink-0 transition-transform duration-200 hover:-translate-y-1 cursor-pointer bg-[#0f0f0f] border border-neutral-900 rounded-lg overflow-hidden shadow"
                    >
                      <div className="aspect-[2/3] w-full overflow-hidden">
                        <img src={mv.posterUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="p-2 bg-black/10">
                        <h4 className="font-bold text-xs line-clamp-1">{mv.title}</h4>
                        <span className="text-[10px] font-mono text-white/50">{mv.year} • {mv.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RECOMMENDED FOR YOU (KIDS FILTER ADAPTORS ENFORCED AUTOMATICALLY) */}
              <div id="row-recommended" className="space-y-3">
                <h3 className="text-sm font-semibold tracking-wider text-white uppercase font-sans border-l-4 border-[#E50914] pl-2">
                  {activeProfile?.isKids ? 'Kids Animated Favorites' : 'Recommended For You'}
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                  {movies
                    .filter(m => {
                      if (activeProfile?.isKids) {
                        return m.rating === 'G' || m.genres.includes('Animation') || m.genres.includes('Kids');
                      }
                      return !m.isTrending;
                    })
                    .slice(0, 5)
                    .map((mv) => (
                      <div 
                        key={mv.id}
                        onClick={() => setSelectedMovie(mv)}
                        className="w-36 sm:w-44 shrink-0 transition-transform duration-200 hover:-translate-y-1 cursor-pointer bg-[#0f0f0f] border border-neutral-900 rounded-lg overflow-hidden shadow"
                      >
                        <div className="aspect-[2/3] w-full overflow-hidden">
                          <img src={mv.posterUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="p-2 bg-black/10">
                          <h4 className="font-bold text-xs line-clamp-1">{mv.title}</h4>
                          <span className="text-[10px] font-mono text-white/50">{mv.year} • {mv.duration}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

            </div>
          )}

        </div>
      </Layout>

      {/* 4. IMMERSIVE VIDEO PLAYER COMPONENT (Video streaming overlay) */}
      {playingMovie && (
        <VideoPlayer
          movie={playingMovie}
          activeEpisode={playingEpisode || undefined}
          onClose={() => {
            setPlayingMovie(null);
            setPlayingEpisode(null);
          }}
          onProgress={handleProgressUpdate}
          onNextEpisode={playingMovie.type === 'series' ? handleNextEpisode : undefined}
          initialTime={
            activeProfile?.continueWatching.find(cw => cw.movieId === playingMovie.id && cw.episodeId === playingEpisode?.id)?.position || 0
          }
        />
      )}

      {/* 5. MOVIE DETAIL MODAL POPUP */}
      {selectedMovie && (
        <MovieDetailModal
          movie={selectedMovie}
          activeProfile={activeProfile}
          onClose={() => setSelectedMovie(null)}
          onPlayClick={(m, ep) => {
            setPlayingMovie(m);
            if (ep) setPlayingEpisode(ep);
            setSelectedMovie(null);
          }}
          onToggleWatchlist={handleToggleWatchlist}
          onTriggerDownload={handleTriggerDownload}
          allMovies={movies}
          onSelectMovie={(m) => setSelectedMovie(m)}
          isPremiumUser={currentUser?.subscription === 'premium'}
          onOpenBilling={() => {
            setSelectedMovie(null);
            setShowAuthModal(true);
          }}
        />
      )}

      {/* 6. ADMIN SECURITY DASHBOARD OVERLAY */}
      {showAdminDashboard && currentUser?.role === 'admin' && (
        <AdminDashboard
          movies={movies}
          setMovies={setMovies}
          users={users}
          setUsers={setUsers}
          transactions={transactions}
          setTransactions={setTransactions}
          onClose={() => setShowAdminDashboard(false)}
          onSendSystemNotification={handleSendSystemNotification}
        />
      )}

      {/* 7. SECURE AUTH & PROFILES LOGIN FLOWS OVERLAY */}
      {showAuthModal && (
        <AuthModal
          currentUser={currentUser}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onUpdateUser={handleUpdateUser}
          onSelectProfile={handleSelectProfile}
          onClose={() => setShowAuthModal(false)}
          onAddTransaction={handleAddTransaction}
        />
      )}

      {/* 8. REAL-TIME INTERACTIVE PUSH NOTIFICATION TOAST */}
      {activeToast && (
        <div 
          onClick={() => {
            if (activeToast.movieId) {
              const matched = movies.find(m => m.id === activeToast.movieId);
              if (matched) setSelectedMovie(matched);
            }
            setActiveToast(null);
          }}
          className="fixed bottom-20 md:bottom-6 right-4 max-w-sm w-full bg-[#14151f] border border-red-500/30 text-white rounded-lg p-4 shadow-2xl z-50 transform transition-all duration-300 animate-slide-in cursor-pointer hover:border-red-500 hover:scale-[1.02] flex items-start gap-3"
        >
          <div className="bg-[#E50914] text-white p-1.5 rounded-full shrink-0">
            <Bell className="w-4 h-4 animate-bounce text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-extrabold text-[11px] uppercase tracking-widest text-[#E50914] font-mono">Alert Channel</span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveToast(null);
                }} 
                className="text-white/40 hover:text-white text-xs font-bold font-sans"
              >
                ✕
              </button>
            </div>
            <h4 className="font-bold text-xs mt-1 text-white leading-snug line-clamp-1">{activeToast.title}</h4>
            <p className="text-[10px] text-white/70 mt-1 leading-normal line-clamp-2">{activeToast.message}</p>
            {activeToast.movieId && (
              <span className="text-[9px] text-[#E50914] font-bold uppercase tracking-wider mt-1.5 block hover:underline">
                Click to view stream details →
              </span>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
