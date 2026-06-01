import React, { useState } from 'react';
import { 
  Search, Bell, User as UserIcon, LogOut, ChevronDown, Monitor, Sparkles, 
  Moon, Sun, ShieldCheck, Heart, Download, Info, Menu, X, Wifi, WifiOff, Smartphone
} from 'lucide-react';
import { User, Profile, AppNotification } from '../types';

interface LayoutProps {
  currentUser: User | null;
  activeProfile: Profile | null;
  activeTab: 'home' | 'movies' | 'tv' | 'documentaries' | 'watchlist' | 'downloads';
  setActiveTab: (tab: 'home' | 'movies' | 'tv' | 'documentaries' | 'watchlist' | 'downloads') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  notifications: AppNotification[];
  onMarkNotificationRead: (id: string) => void;
  onClearNotifications: () => void;
  onOpenProfileSelector: () => void;
  onOpenOpenPlans: () => void;
  onOpenAdmin: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onSelectMovieById: (id: string) => void;
  children: React.ReactNode;
}

export default function Layout({
  currentUser,
  activeProfile,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  notifications,
  onMarkNotificationRead,
  onClearNotifications,
  onOpenProfileSelector,
  onOpenOpenPlans,
  onOpenAdmin,
  darkMode,
  setDarkMode,
  onSelectMovieById,
  children
}: LayoutProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);
  const [showPwaPrompt, setShowPwaPrompt] = useState(true);

  const unreadNotifsCount = notifications.filter(n => !n.isRead).length;

  const handlePwaInstall = () => {
    setIsPwaInstalled(true);
    setShowPwaPrompt(false);
    alert('StreamFlix Progressive Web App (PWA) configured and pinned to launcher successfully! Service Worker offline-caches are primed.');
  };

  return (
    <div className="min-h-screen font-sans flex flex-col bg-[#050505] text-[#E5E5E5]">
      
      {/* 1. MOCK SERVICE WORKER PWA BANNER */}
      {showPwaPrompt && !isPwaInstalled && (
        <div className="bg-[#12141d] border-b border-white/5 py-1.5 px-4 text-xs flex items-center justify-between text-white font-mono gap-1.5 shrink-0 select-none">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#E50914] animate-pulse hidden sm:inline" />
            <span className="text-[10px] md:text-xs text-[#E5E5E5]/90">Install **StreamFlix App** for offline access and instant push alerts.</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePwaInstall}
              id="pwa-install-banner-btn"
              className="bg-[#E50914] hover:bg-[#b80710] font-extrabold text-[9px] uppercase px-2.5 py-1 rounded text-white tracking-widest transition"
            >
              Install App
            </button>
            <button onClick={() => setShowPwaPrompt(false)} className="text-white/40 hover:text-white font-bold px-1 text-[11px]">✕</button>
          </div>
        </div>
      )}

      {/* 2. MAIN HEADER NAVBAR */}
      <header className="sticky top-0 z-30 transition-all border-b shrink-0 bg-[#050505]/95 border-white/5 backdrop-blur-md text-[#E5E5E5]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between gap-4">
          
          {/* Brand Logo & Desktop Switcher */}
          <div className="flex items-center gap-8">
            <span 
              onClick={() => setActiveTab('home')}
              className="text-2xl sm:text-3xl font-black tracking-tighter text-[#E50914] uppercase cursor-pointer select-none font-sans"
            >
              STREAM<span className="text-white">FLIX</span>
            </span>

            {/* Desktop Quick Nav Menu tabs */}
            <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
              <button 
                id="dekstop-tab-home"
                onClick={() => { setActiveTab('home'); setShowMobileMenu(false); }}
                className={`pb-1 transition-all text-xs tracking-wider uppercase cursor-pointer ${
                  activeTab === 'home' 
                    ? 'text-white border-b-2 border-[#E50914] font-bold' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Home
              </button>
              <button 
                id="dekstop-tab-movies"
                onClick={() => { setActiveTab('movies'); setShowMobileMenu(false); }}
                className={`pb-1 transition-all text-xs tracking-wider uppercase cursor-pointer ${
                  activeTab === 'movies' 
                    ? 'text-white border-b-2 border-[#E50914] font-bold' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Movies
              </button>
              <button 
                id="dekstop-tab-tv"
                onClick={() => { setActiveTab('tv'); setShowMobileMenu(false); }}
                className={`pb-1 transition-all text-xs tracking-wider uppercase cursor-pointer ${
                  activeTab === 'tv' 
                    ? 'text-white border-b-2 border-[#E50914] font-bold' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                TV Shows
              </button>
              <button 
                id="dekstop-tab-docs"
                onClick={() => { setActiveTab('documentaries'); setShowMobileMenu(false); }}
                className={`pb-1 transition-all text-xs tracking-wider uppercase cursor-pointer ${
                  activeTab === 'documentaries' 
                    ? 'text-white border-b-2 border-[#E50914] font-bold' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Documentaries
              </button>
              <button 
                id="dekstop-tab-watchlist"
                onClick={() => { setActiveTab('watchlist'); setShowMobileMenu(false); }}
                className={`pb-1 transition-all text-xs tracking-wider uppercase cursor-pointer ${
                  activeTab === 'watchlist' 
                    ? 'text-white border-b-2 border-[#E50914] font-bold' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                My List
              </button>
              <button 
                id="dekstop-tab-downloads"
                onClick={() => { setActiveTab('downloads'); setShowMobileMenu(false); }}
                className={`pb-1 transition-all text-xs tracking-wider uppercase cursor-pointer ${
                  activeTab === 'downloads' 
                    ? 'text-white border-b-2 border-[#E50914] font-bold' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Downloads
              </button>
            </nav>
          </div>

          {/* Right side interactions */}
          <div className="flex items-center gap-3 md:gap-5 flex-1 justify-end">
            
            {/* Search Input */}
            <div className="relative max-w-xs w-full xs:block hidden">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-opacity-55 text-slate-400" />
              <input 
                type="text"
                id="layout-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies, genre, actor..."
                className="w-full rounded-full pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#E50914] transition-all bg-[#1b1d28] text-white placeholder-white/30"
              />
            </div>

            {/* Notification Bell with Dropdown selection */}
            <div className="relative">
              <button 
                id="bell-notif-btn"
                onClick={() => { setShowNotifMenu(!showNotifMenu); setShowProfileMenu(false); }}
                className="p-2 rounded-full transition-all relative hover:bg-white/10 text-white"
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E50914] ring-2 ring-[#E50914] animate-ping"></span>
                )}
              </button>

              {showNotifMenu && (
                <div id="notif-dropdown-container" className="absolute right-0 mt-2.5 w-72 rounded-lg border shadow-2xl p-3 space-y-2 z-40 bg-[#101010] border-neutral-800 text-[#E5E5E5]">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-xs font-bold uppercase font-mono text-[#E50914]">Alerts ({unreadNotifsCount})</span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          notifications.forEach(n => onMarkNotificationRead(n.id));
                        }}
                        className="text-[9px] text-[#E5E5E5]/60 hover:text-[#E50914] font-mono uppercase tracking-wider transition-colors"
                      >
                        Read All
                      </button>
                      <span className="text-white/20 select-none">|</span>
                      <button 
                        onClick={onClearNotifications} 
                        className="text-[9px] text-[#E5E5E5]/60 hover:text-[#E50914] font-mono uppercase tracking-wider transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <div className="text-center py-4 text-white/40 text-xs">No active push logs</div>
                    ) : (
                      notifications.map((notif) => (
                        <div 
                          key={notif.id} 
                          onClick={() => {
                            if (notif.movieId) {
                              onSelectMovieById(notif.movieId);
                            }
                            onMarkNotificationRead(notif.id);
                            setShowNotifMenu(false);
                          }}
                          className={`p-2 rounded text-xs select-none cursor-pointer border border-transparent transition hover:border-[#E50914]/20 ${
                            notif.isRead ? 'opacity-60' : 'bg-white/5'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-white leading-normal block">{notif.title}</span>
                            <span className="text-[8px] font-mono text-white/40">{notif.createdAt}</span>
                          </div>
                          <p className="text-[10px] text-white/70 mt-1 line-clamp-2 leading-relaxed">{notif.message}</p>
                          {!notif.isRead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onMarkNotificationRead(notif.id);
                              }}
                              className="text-[8px] text-[#E50914] hover:underline font-mono mt-1 block"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Picker Dropdown info banner */}
            {currentUser && (
              <div className="relative">
                <button 
                  id="profile-dropdown-btn"
                  onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifMenu(false); }}
                  className="flex items-center gap-1 bg-white/5 hover:bg-white/10 border border-white/10 p-1.5 pr-2.5 rounded-full transition text-left"
                >
                  <img 
                    src={activeProfile?.avatarUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80"} 
                    alt="avatar" 
                    className="w-6.5 h-6.5 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-xs font-semibold text-white/90 hidden md:inline ml-1">{activeProfile?.name || currentUser.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-white/50 hidden md:inline" />
                </button>

                {showProfileMenu && (
                  <div id="profile-dropdown-container" className="absolute right-4 mt-2.5 w-52 rounded-lg border shadow-2xl p-2.5 space-y-1.5 z-40 text-left bg-[#101010] border-neutral-800 text-[#E5E5E5]">
                    <div className="pb-1.5 border-b border-white/15 px-2">
                      <span className="text-xs font-bold block text-white/95 line-clamp-1">{activeProfile?.name}</span>
                      <span className="text-[9px] font-mono text-white/40 block mt-0.5 uppercase tracking-widest">{currentUser.subscription.toUpperCase()} SUBSCRIP</span>
                    </div>

                    <button 
                      id="opt-switch-profile"
                      onClick={() => { onOpenProfileSelector(); setShowProfileMenu(false); }}
                      className="w-full text-left text-xs font-medium text-white/80 hover:bg-white/5 p-1.5 rounded transition"
                    >
                      Swap Profile User
                    </button>

                    <button 
                      id="opt-subscription-checkout"
                      onClick={() => { onOpenOpenPlans(); setShowProfileMenu(false); }}
                      className="w-full text-left text-xs font-medium text-white/80 hover:bg-white/5 p-1.5 rounded transition flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse fill-current" />
                      Plan Upgrade Settings
                    </button>

                    {currentUser.role === 'admin' && (
                      <button 
                        id="opt-admin-console"
                        onClick={() => { onOpenAdmin(); setShowProfileMenu(false); }}
                        className="w-full text-left text-xs font-bold text-red-500 hover:bg-[#E50914]/10 p-1.5 rounded transition flex items-center gap-1.5 border border-[#E50914]/20 bg-[#E50914]/5"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Admin Core Console
                      </button>
                    )}

                    <div className="border-t border-white/15 pt-1.5">
                      <button 
                        id="opt-sign-out"
                        onClick={() => window.location.reload()} 
                        className="w-full text-left text-xs font-bold text-red-400 hover:bg-red-500/10 p-1.5 rounded transition flex items-center gap-1.5"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out Session
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Hamburger menu triggers */}
            <button 
              id="hamburger-btn"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 hover:bg-white/10 rounded-full"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>

        {/* Mobile menu view */}
        {showMobileMenu && (
          <div className="lg:hidden px-4 pb-4 space-y-3 border-t border-white/5 bg-[#101010] animate-slide-down">
            {/* Search Input inline for mobile */}
            <div className="relative pt-2">
              <Search className="absolute left-3 top-4 w-4 h-4 text-[#E5E5E5]/45" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies, TV shows..."
                className="w-full bg-[#1b1d28] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-bold text-center">
              <button 
                onClick={() => { setActiveTab('home'); setShowMobileMenu(false); }}
                className={`py-2 px-1 rounded uppercase tracking-wider ${activeTab === 'home' ? 'bg-[#E50914] text-white' : 'bg-white/5 text-white/70'}`}
              >
                Browse Video
              </button>
              <button 
                onClick={() => { setActiveTab('movies'); setShowMobileMenu(false); }}
                className={`py-2 px-1 rounded uppercase tracking-wider ${activeTab === 'movies' ? 'bg-[#E50914] text-white' : 'bg-white/5 text-white/70'}`}
              >
                Movies
              </button>
              <button 
                onClick={() => { setActiveTab('tv'); setShowMobileMenu(false); }}
                className={`py-2 px-1 rounded uppercase tracking-wider ${activeTab === 'tv' ? 'bg-[#E50914] text-white' : 'bg-white/5 text-white/70'}`}
              >
                TV Series
              </button>
              <button 
                onClick={() => { setActiveTab('documentaries'); setShowMobileMenu(false); }}
                className={`py-2 px-1 rounded uppercase tracking-wider ${activeTab === 'documentaries' ? 'bg-[#E50914] text-white' : 'bg-white/5 text-white/70'}`}
              >
                Documentaries
              </button>
              <button 
                onClick={() => { setActiveTab('watchlist'); setShowMobileMenu(false); }}
                className={`py-2 px-1 rounded uppercase tracking-wider ${activeTab === 'watchlist' ? 'bg-[#E50914] text-white' : 'bg-white/5 text-white/70'}`}
              >
                My List
              </button>
              <button 
                onClick={() => { setActiveTab('downloads'); setShowMobileMenu(false); }}
                className={`py-2 px-1 rounded uppercase tracking-wider ${activeTab === 'downloads' ? 'bg-[#E50914] text-white' : 'bg-white/5 text-white/70'}`}
              >
                Downloads
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 3. MAIN CHILD COMPONENT VIEWPORT AREA */}
      <main className="flex-1 overflow-x-hidden p-0">
        {children}
      </main>

      {/* 4. MOBIL STICKY BOTTOM TAB NAVIGATION */}
      <footer className="sticky bottom-0 z-30 lg:hidden border-t py-2 px-4 shadow-xl flex items-center justify-around shrink-0 bg-[#050505]/95 border-white/5 text-[#E5E5E5]">
        <button 
          id="m-tab-home"
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-0.5 text-[9px] font-bold uppercase transition ${activeTab === 'home' ? 'text-[#E50914] font-extrabold' : 'text-slate-400'}`}
        >
          <Monitor className="w-5 h-5" />
          <span>Home</span>
        </button>
        <button 
          id="m-tab-watchlist"
          onClick={() => setActiveTab('watchlist')}
          className={`flex flex-col items-center gap-0.5 text-[9px] font-bold uppercase transition ${activeTab === 'watchlist' ? 'text-[#E50914] font-extrabold' : 'text-slate-400'}`}
        >
          <Heart className="w-5 h-5 animate-pulse" />
          <span>My List</span>
        </button>
        <button 
          id="m-tab-downloads"
          onClick={() => setActiveTab('downloads')}
          className={`flex flex-col items-center gap-0.5 text-[9px] font-bold uppercase transition ${activeTab === 'downloads' ? 'text-[#E50914] font-extrabold' : 'text-slate-400'}`}
        >
          <Download className="w-5 h-5" />
          <span>Offline</span>
        </button>
        <button 
          id="m-tab-developer"
          onClick={onOpenProfileSelector}
          className="flex flex-col items-center gap-0.5 text-[9px] font-bold uppercase text-slate-400 transition"
        >
          <img 
            src={activeProfile?.avatarUrl} 
            alt="avat-icon" 
            className="w-5 h-5 rounded-full object-cover" 
            referrerPolicy="no-referrer"
          />
          <span>Profiles</span>
        </button>
      </footer>

    </div>
  );
}
