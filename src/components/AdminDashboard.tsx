import React, { useState } from 'react';
import { 
  Users, DollarSign, Film, TrendingUp, Plus, Trash2, Edit2, CheckCircle2, 
  X, BarChart3, Database, Save, RotateCcw, AlertTriangle, Send, Shield, Smartphone 
} from 'lucide-react';
import { Movie, User, Transaction } from '../types';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend 
} from 'recharts';

interface AdminDashboardProps {
  movies: Movie[];
  setMovies: React.Dispatch<React.SetStateAction<Movie[]>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  onClose: () => void;
  onSendSystemNotification: (title: string, message: string) => void;
}

export default function AdminDashboard({
  movies,
  setMovies,
  users,
  setUsers,
  transactions,
  setTransactions,
  onClose,
  onSendSystemNotification
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'analytics' | 'content' | 'users' | 'tech'>('analytics');
  
  // Movie Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMovie, setNewMovie] = useState<Partial<Movie>>({
    title: '',
    description: '',
    category: 'movie',
    genres: [],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&q=80',
    rating: 'PG-13',
    year: 2026,
    duration: '2h 0m',
    cast: [],
    subtitles: ['English', 'Spanish', 'French', 'Swahili'],
    audioLanguages: ['English'],
    isPremiumOnly: false,
    introStart: 10,
    introEnd: 30
  });
  
  // Custom states for cast & genres input string
  const [castInput, setCastInput] = useState('');
  const [genresInput, setGenresInput] = useState('');

  // Bulk system notifications trigger
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [isNotifSuccess, setIsNotifSuccess] = useState(false);

  // Stats calculation
  const totalSubscribers = users.filter(u => u.subscription !== 'none' && u.subscriptionStatus === 'active').length;
  const stripeRevenue = transactions.filter(t => t.paymentMethod === 'Stripe' && t.status === 'Completed').reduce((sum, t) => sum + t.amount, 0);
  const mpesaRevenue = transactions.filter(t => t.paymentMethod === 'M-Pesa' && t.status === 'Completed').reduce((sum, t) => sum + t.amount, 0);
  const totalRevenue = stripeRevenue + mpesaRevenue;

  // Recharts Chart Mock Series
  const subscribersTimeSeries = [
    { name: 'Dec', Basic: 120, Standard: 240, Premium: 480 },
    { name: 'Jan', Basic: 150, Standard: 310, Premium: 600 },
    { name: 'Feb', Basic: 180, Standard: 400, Premium: 750 },
    { name: 'Mar', Basic: 240, Standard: 490, Premium: 920 },
    { name: 'Apr', Basic: 320, Standard: 560, Premium: 1100 },
    { name: 'May', Basic: totalSubscribers * 12, Standard: totalSubscribers * 25, Premium: totalSubscribers * 48 }
  ];

  const revenueChartData = [
    { name: 'Stripe Gateways', value: stripeRevenue, fill: '#ef4444' },
    { name: 'M-Pesa Safaricom', value: mpesaRevenue, fill: '#22c55e' }
  ];

  const handleCreateMovie = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMovie.title || !newMovie.description) return;

    const parsedMovie: Movie = {
      id: `m_${Date.now()}`,
      title: newMovie.title,
      description: newMovie.description,
      category: newMovie.category as 'movie' | 'series' | 'documentary' | 'live',
      genres: genresInput ? genresInput.split(',').map(s => s.trim()) : ['General'],
      type: newMovie.category as 'movie' | 'series' | 'documentary' | 'live',
      videoUrl: newMovie.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      trailerUrl: newMovie.trailerUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      posterUrl: newMovie.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80',
      backdropUrl: newMovie.backdropUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&q=80',
      rating: newMovie.rating || 'PG-13',
      year: Number(newMovie.year) || 2026,
      duration: newMovie.duration || '2h 00m',
      cast: castInput ? castInput.split(',').map(s => s.trim()) : ['Unknown'],
      subtitles: newMovie.subtitles || ['English'],
      audioLanguages: newMovie.audioLanguages || ['English'],
      isPremiumOnly: newMovie.isPremiumOnly,
      likes: 0,
      introStart: Number(newMovie.introStart) || 10,
      introEnd: Number(newMovie.introEnd) || 30
    };

    setMovies(prev => [parsedMovie, ...prev]);
    onSendSystemNotification('New Release!', `"${parsedMovie.title}" is now streaming! Upgrade to Watch now.`);
    
    // Reset Form
    setNewMovie({
      title: '',
      description: '',
      category: 'movie',
      genres: [],
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&q=80',
      rating: 'PG-13',
      year: 2026,
      duration: '2h 0m',
      cast: [],
      subtitles: ['English', 'Spanish', 'French', 'Swahili'],
      audioLanguages: ['English'],
      isPremiumOnly: false,
      introStart: 10,
      introEnd: 30
    });
    setCastInput('');
    setGenresInput('');
    setShowAddForm(false);
  };

  const handleDeleteMovie = (id: string) => {
    if (confirm('Are you sure you want to remove this video from StreamFlix?')) {
      setMovies(prev => prev.filter(m => m.id !== id));
    }
  };

  const handleUpdateSubscription = (userId: string, plan: 'none' | 'basic' | 'standard' | 'premium') => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          subscription: plan,
          subscriptionStatus: plan === 'none' ? 'canceled' : 'active'
        };
      }
      return u;
    }));
  };

  const triggerPushBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle || !notifBody) return;
    onSendSystemNotification(notifTitle, notifBody);
    setIsNotifSuccess(true);
    setNotifTitle('');
    setNotifBody('');
    setTimeout(() => {
      setIsNotifSuccess(false);
    }, 4000);
  };

  return (
    <div id="admin-dashboard-container" className="fixed inset-0 bg-[#0e0f12] text-white z-40 overflow-y-auto font-sans flex flex-col">
      {/* Top Bar Navigation */}
      <header className="border-b border-white/10 bg-[#16181f]/95 sticky top-0 z-30 px-4 py-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-red-500" />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              StreamFlix Core Admin Console
              <span className="text-[10px] bg-red-600/15 border border-red-500/25 text-red-400 px-2 py-0.5 rounded-full font-mono uppercase font-bold">
                ROOT MODE
              </span>
            </h1>
            <p className="text-xs text-white/50 hidden md:block">Real-time local content replication, payment logs, and Docker runtime config</p>
          </div>
        </div>
        <button 
          id="close-admin-panel-btn"
          onClick={onClose} 
          className="p-1 px-3 bg-white/10 hover:bg-red-600 rounded-sm font-semibold text-xs tracking-wider uppercase border border-white/10 text-white transition-all"
        >
          Exit Dashboard
        </button>
      </header>

      {/* Main Grid section */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar categories switcher */}
        <nav className="col-span-1 lg:col-span-3 space-y-2 flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible pb-3 lg:pb-0 gap-2 md:gap-0">
          <button 
            id="tab-analytics"
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-md font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === 'analytics' ? 'bg-red-600 text-white shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Vitals & Analytics
          </button>
          <button 
            id="tab-content"
            onClick={() => setActiveTab('content')}
            className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-md font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === 'content' ? 'bg-red-600 text-white shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Film className="w-4 h-4" />
            Streaming Content Manager ({movies.length})
          </button>
          <button 
            id="tab-users"
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-md font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === 'users' ? 'bg-red-600 text-white shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" />
            Subscriber Accounts ({users.length})
          </button>
          <button 
            id="tab-tech"
            onClick={() => setActiveTab('tech')}
            className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-md font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === 'tech' ? 'bg-red-600 text-white shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Database className="w-4 h-4" />
            API & Database Specs
          </button>

          {/* Prompt quick notification dispatch */}
          <div className="hidden lg:block pt-6 border-t border-white/10 mt-6 space-y-4">
            <h4 className="text-xs font-mono uppercase text-white/50 tracking-widest flex items-center gap-1">
              <Send className="w-3.5 h-3.5 text-red-500" /> Push Broadcast
            </h4>
            <form onSubmit={triggerPushBroadcast} className="space-y-3 bg-[#13151b] p-3 rounded border border-white/5">
              <div>
                <label className="text-[10px] text-white/50 uppercase font-bold">Campaign Trigger Header</label>
                <input 
                  type="text" 
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  placeholder="System Broadcast..." 
                  className="w-full bg-[#1b1e26] border border-white/10 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-red-600 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] text-white/50 uppercase font-bold">Message Sub-content</label>
                <textarea 
                  rows={2} 
                  value={notifBody}
                  onChange={(e) => setNotifBody(e.target.value)}
                  placeholder="Upgrade to stream season 2 live now!" 
                  className="w-full bg-[#1b1e26] border border-white/10 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-red-600 focus:outline-none resize-none"
                  required
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-700 font-semibold py-1.5 rounded text-xs transition-colors"
              >
                Send Instantly
              </button>
              {isNotifSuccess && (
                <div className="p-1 px-2 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] text-center rounded">
                  Broadcast successfully dispatched!
                </div>
              )}
            </form>
          </div>
        </nav>

        {/* Content body based on active tab */}
        <main className="col-span-1 lg:col-span-9 space-y-6">
          
          {/* 1. ANALYTICS VITALS TAB */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Stat Bento Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#12141c] border border-white/10 rounded-lg p-4 md:p-5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Subscribers</span>
                    <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">{totalSubscribers}</h3>
                    <span className="text-green-500 text-[10px] font-mono mt-1 block font-bold">▲ 14% this month</span>
                  </div>
                  <Users className="w-8 h-8 text-red-500 opacity-80" />
                </div>

                <div className="bg-[#12141c] border border-white/10 rounded-lg p-4 md:p-5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Stream Revenue</span>
                    <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">${totalRevenue.toLocaleString()}</h3>
                    <span className="text-green-500 text-[10px] font-mono mt-1 block font-bold">▲ 8.3% vs projections</span>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500 opacity-80" />
                </div>

                <div className="bg-[#12141c] border border-white/10 rounded-lg p-4 md:p-5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Videos Live</span>
                    <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">{movies.length}</h3>
                    <span className="text-white/40 text-[10px] font-mono mt-1 block">Live catalogs sync</span>
                  </div>
                  <Film className="w-8 h-8 text-blue-500 opacity-80" />
                </div>

                <div className="bg-[#12141c] border border-white/10 rounded-lg p-4 md:p-5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Bandwidth Served</span>
                    <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">4.8 TB</h3>
                    <span className="text-green-500 text-[10px] font-mono mt-1 block font-bold">99.98% Cache hit</span>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500 opacity-80" />
                </div>
              </div>

              {/* AREA GROWTH CHART */}
              <div className="bg-[#12141c] border border-white/10 rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-white tracking-wide">Paid Subscription Plan Tiers Growth</h3>
                    <p className="text-xs text-white/50">Simulated monthly progression of active subscriptions</p>
                  </div>
                  <span className="text-xs font-mono bg-white/5 px-2.5 py-1 text-white/80 border border-white/10 rounded">
                    Active users data
                  </span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={subscribersTimeSeries} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorBasic" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorStandard" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorPremium" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#1e2230" strokeDasharray="3 3" />
                      <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: 10 }} />
                      <YAxis stroke="#64748b" style={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#13151c', border: '1px solid rgba(255,255,255,0.1)' }} />
                      <Legend style={{ fontSize: 11 }} />
                      <Area type="monotone" dataKey="Basic" stroke="#3b82f6" fillOpacity={1} fill="url(#colorBasic)" strokeWidth={2} />
                      <Area type="monotone" dataKey="Standard" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorStandard)" strokeWidth={2} />
                      <Area type="monotone" dataKey="Premium" stroke="#ef4444" fillOpacity={1} fill="url(#colorPremium)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* REVENUE BREAKDOWN BLOCK & TRANS TABLE */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Stripe vs M-Pesa Payment Method Bar Chart */}
                <div className="col-span-1 md:col-span-5 bg-[#12141c] border border-white/10 rounded-lg p-5">
                  <h3 className="text-sm font-semibold text-white mb-2 tracking-wide">Stripe vs M-Pesa SAFARICOM</h3>
                  <p className="text-xs text-white/50 mb-4">Total revenue breakdown per primary gateway API</p>
                  
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueChartData}>
                        <CartesianGrid stroke="#1e2230" strokeDasharray="3 3" />
                        <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: 9 }} />
                        <YAxis stroke="#64748b" style={{ fontSize: 9 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#13151c', border: '1px solid rgba(255,255,255,0.1)' }} />
                        <Bar dataKey="value" strokeWidth={1} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center justify-around text-center text-xs mt-3">
                    <div>
                      <span className="text-red-400 block font-bold font-mono">${stripeRevenue}</span>
                      <span className="text-[10px] text-white/50">Stripe Gateways</span>
                    </div>
                    <div>
                      <span className="text-green-400 block font-bold font-mono">${mpesaRevenue}</span>
                      <span className="text-[10px] text-white/50">M-Pesa Safaricom</span>
                    </div>
                  </div>
                </div>

                {/* Real-time Simulated billing list */}
                <div className="col-span-1 md:col-span-7 bg-[#12141c] border border-white/10 rounded-lg p-5">
                  <h3 className="text-sm font-semibold text-white mb-4 tracking-wide">Mock Gateway Callback Transactions</h3>
                  <div className="space-y-3 overflow-y-auto max-h-48 pr-1">
                    {transactions.map((tr) => (
                      <div key={tr.id} className="border-b border-white/5 pb-2 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-semibold block text-white/90">{tr.userEmail}</span>
                          <span className="text-[10px] text-white/40 font-mono">
                            {tr.date} via <span className={tr.paymentMethod === 'M-Pesa' ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>{tr.paymentMethod}</span>
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-white block font-bold">${tr.amount}.00</span>
                          <span className="text-[10px] bg-green-500/10 border border-green-500/25 text-green-400 px-1 py-0.5 rounded">
                            {tr.plan.toUpperCase()} PLANS
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 2. CATOLOG CONTENT MANAGER */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              
              {/* Section Header Controls */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[16px] font-bold text-white tracking-wide">Video Content Catalogs</h2>
                  <p className="text-xs text-white/50">Perform metadata injections, video streams uploads, and tags updates</p>
                </div>
                <button
                  id="admin-add-movie-btn"
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-2 px-4 rounded flex items-center gap-2 transition-all shadow-md"
                >
                  <Plus className="w-4 h-4" /> Add Streaming Unit
                </button>
              </div>

              {/* Add New Movie Form Panel */}
              {showAddForm && (
                <form id="add-movie-form" onSubmit={handleCreateMovie} className="bg-[#12141c] border border-white/15 p-6 rounded-lg space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="text-sm font-bold text-red-500 flex items-center gap-2">
                      <Film className="w-4 h-4" /> Upload New Stream Meta config
                    </h3>
                    <button 
                      type="button" 
                      onClick={() => setShowAddForm(false)} 
                      className="text-white/60 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-white/80 block mb-1">Title</label>
                      <input 
                        type="text" 
                        value={newMovie.title}
                        onChange={(e) => setNewMovie(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full bg-[#1b1e26] border border-white/10 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-red-600 focus:outline-none"
                        placeholder="Space Odyssey..."
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-white/80 block mb-1">Category Type</label>
                      <select 
                        value={newMovie.category}
                        onChange={(e) => setNewMovie(prev => ({ ...prev, category: e.target.value as any, type: e.target.value as any }))}
                        className="w-full bg-[#1b1e26] border border-white/10 rounded px-2.5 py-2 text-xs focus:ring-1 focus:ring-red-600 focus:outline-none"
                      >
                        <option value="movie">Movies catalog</option>
                        <option value="series">TV Show Series</option>
                        <option value="documentary">Documentary Feature</option>
                        <option value="live">Live Broadcasting TV</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-white/80 block mb-1">Year of Release</label>
                      <input 
                        type="number" 
                        value={newMovie.year}
                        onChange={(e) => setNewMovie(prev => ({ ...prev, year: Number(e.target.value) }))}
                        className="w-full bg-[#1b1e26] border border-white/10 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-red-600 focus:outline-none"
                        min="1990"
                        max="2030"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-white/80 block mb-1">Synopsis Plot Summary</label>
                    <textarea 
                      rows={3}
                      value={newMovie.description}
                      onChange={(e) => setNewMovie(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-[#1b1e26] border border-white/10 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-red-600 focus:outline-none resize-none"
                      placeholder="Enter deep movie lore..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-white/80 block mb-1">Casts (Comma separated)</label>
                      <input 
                        type="text" 
                        value={castInput}
                        onChange={(e) => setCastInput(e.target.value)}
                        className="w-full bg-[#1b1e26] border border-white/10 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-red-600 focus:outline-none"
                        placeholder="John Doe, Sarah Connor..."
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-white/80 block mb-1">Genres (Comma separated)</label>
                      <input 
                        type="text" 
                        value={genresInput}
                        onChange={(e) => setGenresInput(e.target.value)}
                        className="w-full bg-[#1b1e26] border border-white/10 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-red-600 focus:outline-none"
                        placeholder="Sci-Fi, Thriller, Action..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-white/80 block mb-1">Poster URL (stock image path or free link)</label>
                      <input 
                        type="url" 
                        value={newMovie.posterUrl}
                        onChange={(e) => setNewMovie(prev => ({ ...prev, posterUrl: e.target.value }))}
                        className="w-full bg-[#1b1e26] border border-white/10 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-red-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-white/80 block mb-1">Backdrop Backdrop (Banner path)</label>
                      <input 
                        type="url" 
                        value={newMovie.backdropUrl}
                        onChange={(e) => setNewMovie(prev => ({ ...prev, backdropUrl: e.target.value }))}
                        className="w-full bg-[#1b1e26] border border-white/10 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-red-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-white/80 block mb-1">Adaptive Stream URL (MP4 / HLS Link)</label>
                      <input 
                        type="url" 
                        value={newMovie.videoUrl}
                        onChange={(e) => setNewMovie(prev => ({ ...prev, videoUrl: e.target.value }))}
                        className="w-full bg-[#1b1e26] border border-white/10 rounded px-3 py-2 text-xs font-mono focus:ring-1 focus:ring-red-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-white/80 block mb-1">Trailer Video URL</label>
                      <input 
                        type="url" 
                        value={newMovie.trailerUrl}
                        onChange={(e) => setNewMovie(prev => ({ ...prev, trailerUrl: e.target.value }))}
                        className="w-full bg-[#1b1e26] border border-white/10 rounded px-3 py-2 text-xs font-mono focus:ring-1 focus:ring-red-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-white/80 block mb-1">Content Age Rating Group</label>
                      <input 
                        type="text" 
                        value={newMovie.rating}
                        onChange={(e) => setNewMovie(prev => ({ ...prev, rating: e.target.value }))}
                        className="w-full bg-[#1b1e26] border border-white/10 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-red-600 focus:outline-none"
                        placeholder="R, PG-13, G..."
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={newMovie.isPremiumOnly}
                        onChange={(e) => setNewMovie(prev => ({ ...prev, isPremiumOnly: e.target.checked }))}
                        className="w-4 h-4 rounded border-gray-300 accent-red-600 text-red-600"
                      />
                      <span className="text-xs text-white">Restrict to Premium Plan Subs</span>
                    </label>

                    <div className="flex-1 flex justify-end gap-3">
                      <button 
                        type="button" 
                        onClick={() => setShowAddForm(false)} 
                        className="bg-white/10 hover:bg-white/20 text-xs px-4 py-2 rounded"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-5 py-2 rounded"
                      >
                        Save & Deploy
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Grid lists of movies */}
              <div className="bg-[#12141c] border border-white/10 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-white/10 text-xs font-mono flex items-center justify-between text-white/50">
                  <span>Current Live Streams & Media listings on server state</span>
                  <span>{movies.length} Catalog Entries</span>
                </div>
                
                <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
                  {movies.map((mv) => (
                    <div key={mv.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={mv.posterUrl} 
                          alt={mv.title} 
                          className="w-12 h-16 object-cover rounded shadow border border-white/10 flex-shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h4 className="font-semibold text-sm text-white flex items-center gap-1.5 flex-wrap">
                            {mv.title}
                            {mv.isPremiumOnly && (
                              <span className="text-[9px] bg-red-600 text-white px-1.5 rounded uppercase font-mono font-bold tracking-widest leading-normal">
                                Premium Only
                              </span>
                            )}
                            <span className="text-[10px] bg-white/10 border border-white/10 text-white/70 px-1.5 py-0.5 rounded font-mono">
                              {mv.category.toUpperCase()}
                            </span>
                          </h4>
                          <p className="text-xs text-white/50 line-clamp-1 mt-0.5 max-w-xl">{mv.description}</p>
                          <div className="flex items-center gap-2 text-[10px] font-mono text-white/40 mt-1">
                            <span>Year: {mv.year}</span>
                            <span>•</span>
                            <span>Rating: {mv.rating}</span>
                            <span>•</span>
                            <span>Cast: {mv.cast?.join(', ')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end md:self-auto">
                        <button 
                          className="p-1.5 hover:bg-red-600/20 text-red-400 hover:text-red-500 rounded border border-white/10 transition"
                          onClick={() => handleDeleteMovie(mv.id)}
                          title="Delete movie"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. SUBSCRIBERS ACCOUNTS TAB */}
          {activeTab === 'users' && (
            <div className="bg-[#12141c] border border-white/10 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white tracking-wide">Registered Streams Accounts</h3>
                  <p className="text-xs text-white/50">Modify subscription boundaries and view subscriber credentials</p>
                </div>
                <span className="text-xs font-mono text-white/50">{users.length} Active Accounts</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-[#161821] text-white/60 font-mono text-[10px] uppercase tracking-wider">
                      <th className="p-4">Customer Name</th>
                      <th className="p-4">Email Address</th>
                      <th className="p-4">OAuth Provider</th>
                      <th className="p-4">Current Subscription status</th>
                      <th className="p-4">Plan Override controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map((us) => (
                      <tr key={us.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-semibold text-white">{us.name}</td>
                        <td className="p-4 text-white/70 font-mono">{us.email}</td>
                        <td className="p-4">
                          <span className="bg-white/10 text-white font-mono rounded px-2 py-0.5 text-[10px] uppercase">
                            {us.email.includes('google') ? 'Google Social' : us.email.includes('apple') ? 'Apple Social' : 'Email/Password'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-block font-mono text-[10px] uppercase px-2 py-0.5 rounded font-bold ${
                            us.subscription === 'premium' ? 'bg-red-600/20 text-red-400 border border-red-500/30' :
                            us.subscription === 'standard' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' :
                            us.subscription === 'basic' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' :
                            'bg-white/10 text-white/40'
                          }`}>
                            {us.subscription.toUpperCase()} ({us.subscriptionStatus.toUpperCase()})
                          </span>
                        </td>
                        <td className="p-4">
                          <select 
                            value={us.subscription}
                            onChange={(e) => handleUpdateSubscription(us.id, e.target.value as any)}
                            className="bg-[#1b1e26] border border-white/15 text-xs text-white rounded px-2.5 py-1 focus:ring-1 focus:ring-red-600 focus:outline-none"
                          >
                            <option value="none">None (Free Trial)</option>
                            <option value="basic">Basic Tier</option>
                            <option value="standard">Standard Tier</option>
                            <option value="premium">Premium Pro</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. API & DATABASE INTEGRATION SPECS DUMP */}
          {activeTab === 'tech' && (
            <div className="space-y-6">
              
              {/* Database Schema Panel */}
              <div className="bg-[#12141c] border border-white/10 rounded-lg p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                  <Database className="w-5 h-5 text-red-500" />
                  <div>
                    <h3 className="text-sm font-semibold text-white">PostgreSQL + Redis Database Schema Configuration</h3>
                    <p className="text-xs text-white/50">Designed schema code modeling plans, users, content catalogs, and HLS sessions</p>
                  </div>
                </div>

                <div className="bg-black/40 p-4 rounded border border-white/5 font-mono text-[11px] overflow-x-auto text-green-400 pr-1 select-text max-h-64">
{`-- PostgreSQL Streaming catalogs tables structure
CREATE TABLE users (
  id VARCHAR(80) PRIMARY KEY,
  email VARCHAR(180) UNIQUE NOT NULL,
  hashed_password VARCHAR(256),
  oauth_id VARCHAR(80),
  subscription_tier VARCHAR(20) DEFAULT 'none',
  subscription_status VARCHAR(20) DEFAULT 'expired',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(80) REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  avatar_url VARCHAR(256),
  is_kids BOOLEAN DEFAULT FALSE
);

CREATE TABLE movies (
  id VARCHAR(8) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(25) NOT NULL, -- 'movie', 'series', 'documentary', 'live'
  genres TEXT[],
  video_url VARCHAR(512) NOT NULL,
  poster_url VARCHAR(512),
  backdrop_url VARCHAR(512),
  rating VARCHAR(8),
  release_year INT,
  is_premium_only BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tv_episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id VARCHAR(8) REFERENCES movies(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  episode_number INT NOT NULL,
  season_number INT DEFAULT 1,
  duration VARCHAR(20),
  video_url VARCHAR(512) NOT NULL
);

-- Redis Caching Cache layer setup rules:
-- Key Pattern: streamflix:movie:<id> (Cache duration: 24h)
-- Key Pattern: streamflix:profile:<id>:watchlist (SADD set)
-- Key Pattern: streamflix:profile:<id>:continue_watching (HSET with currentTime)`}
                </div>
              </div>

              {/* REST API Endpoints Specs */}
              <div className="bg-[#12141c] border border-white/10 rounded-lg p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                  <Smartphone className="w-5 h-5 text-green-500" />
                  <div>
                    <h3 className="text-sm font-semibold text-white">Full-Stack API Routes Specification</h3>
                    <p className="text-xs text-white/50">REST resources serving adaptive endpoints used by high-performance apps</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-black/30 border border-white/5 rounded text-xs space-y-1">
                    <span className="font-mono bg-blue-600/20 text-blue-400 font-bold px-1.5 py-0.5 rounded mr-2">POST</span>
                    <span className="font-mono text-white">/api/v1/auth/register-login</span>
                    <p className="text-white/50 text-[11px] mt-1 pl-4">Authenticates client sessions via JWT token generation or Social auth callback bindings.</p>
                  </div>

                  <div className="p-3 bg-black/30 border border-white/5 rounded text-xs space-y-1">
                    <span className="font-mono bg-green-600/20 text-green-400 font-bold px-1.5 py-0.5 rounded mr-2">GET</span>
                    <span className="font-mono text-white">/api/v1/movies/:id</span>
                    <p className="text-white/50 text-[11px] mt-1 pl-4">Fetches unified film profile details, episodes list, subtitles SRT tracks, and streaming stream URLs.</p>
                  </div>

                  <div className="p-3 bg-black/30 border border-white/5 rounded text-xs space-y-1">
                    <span className="font-mono bg-red-600/20 text-red-400 font-bold px-1.5 py-0.5 rounded mr-2">POST</span>
                    <span className="font-mono text-white">/api/v1/billing/mpesa-callback</span>
                    <p className="text-white/50 text-[11px] mt-1 pl-4">Instant SafariCom M-Pesa push API hook tracking STK push successes/failures in billing ledger.</p>
                  </div>
                </div>
              </div>

              {/* Docker Deployment Panel */}
              <div className="bg-[#12141c] border border-white/10 rounded-lg p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                  <Shield className="w-5 h-5 text-purple-400" />
                  <div>
                    <h3 className="text-sm font-semibold text-white">Production Dockerfile Blueprint</h3>
                    <p className="text-xs text-white/50">Container image optimized for fast multi-stage production deployment</p>
                  </div>
                </div>

                <div className="bg-black/40 p-4 rounded border border-white/5 font-mono text-[11px] text-purple-300 overflow-x-auto select-text">
{`# Multi-stage build process for maximum delivery speed
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["npm", "run", "start"]`}
                </div>
              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  );
}
