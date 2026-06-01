import React, { useState, useEffect } from 'react';
import { 
  Play, Plus, Check, Download, Star, Volume2, Calendar, Clock, Languages, X, 
  Trash2, RefreshCw, AlertCircle, Sparkles, Film, ArrowRight, Share2
} from 'lucide-react';
import { Movie, Profile, Episode } from '../types';

interface MovieDetailModalProps {
  movie: Movie;
  activeProfile: Profile | null;
  onClose: () => void;
  onPlayClick: (movie: Movie, episode?: Episode) => void;
  onToggleWatchlist: (movieId: string) => void;
  onTriggerDownload: (movieId: string) => void;
  allMovies: Movie[];
  onSelectMovie: (movie: Movie) => void;
  isPremiumUser: boolean;
  onOpenBilling: () => void;
}

export default function MovieDetailModal({
  movie,
  activeProfile,
  onClose,
  onPlayClick,
  onToggleWatchlist,
  onTriggerDownload,
  allMovies,
  onSelectMovie,
  isPremiumUser,
  onOpenBilling
}: MovieDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'episodes' | 'more'>('info');
  const [copiedLink, setCopiedLink] = useState(false);
  const isInWatchlist = activeProfile?.watchlist.includes(movie.id) || false;

  // Find continues watching states
  const continueState = activeProfile?.continueWatching.find(cw => cw.movieId === movie.id);
  const downloadState = activeProfile?.downloads.find(dl => dl.movieId === movie.id);

  // Recommendations
  const recommendations = allMovies
    .filter(m => m.id !== movie.id && m.genres.some(g => movie.genres.includes(g)))
    .slice(0, 3);

  // Fallback if none matches
  const fallbackRecommendations = recommendations.length > 0 
    ? recommendations 
    : allMovies.filter(m => m.id !== movie.id).slice(0, 3);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const deepLinkUrl = `${window.location.origin}${window.location.pathname}?movie=${movie.id}`;
    const shareData = {
      title: movie.title,
      text: `Check out "${movie.title}" on StreamFlix! 🎬`,
      url: deepLinkUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(deepLinkUrl);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2200);
      }
    } catch (err) {
      console.warn('Native sharing failed, copying link fallback:', err);
      try {
        await navigator.clipboard.writeText(deepLinkUrl);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2200);
      } catch (clipErr) {
        console.error('Clipboard copy failed as fallback:', clipErr);
      }
    }
  };

  return (
    <div id="movie-detail-modal" className="fixed inset-0 bg-black/85 backdrop-blur-xs z-40 overflow-y-auto flex items-center justify-center p-2 sm:p-4">
      <div className="bg-[#121212] border border-neutral-800 rounded-xl w-full max-w-3xl overflow-hidden shadow-2xl relative">
        
        {/* Absolute Banner Close Trigger */}
        <button 
          id="close-movie-detail-modal"
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 text-white/50 hover:text-white rounded-full bg-black/60 hover:bg-[#E50914] transition-all z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Backdrop Banner with Title overlay */}
        <div className="relative h-60 sm:h-80 w-full overflow-hidden">
          <img 
            src={movie.backdropUrl} 
            alt={movie.title} 
            className="w-full h-full object-cover select-none"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/40 to-black/20"></div>
          
          {/* Headline details */}
          <div className="absolute bottom-6 left-6 right-6 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] bg-[#E50914] text-white font-mono px-2 py-0.5 rounded uppercase font-bold tracking-widest">
                {movie.category.toUpperCase()}
              </span>
              {movie.isPremiumOnly && (
                <span className="text-[10px] bg-amber-500 text-black font-semibold px-2 py-0.5 rounded uppercase tracking-wider">
                  PREMIUM PRO
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight uppercase font-sans drop-shadow">
              {movie.title}
            </h2>

            {/* Quick buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {movie.isPremiumOnly && !isPremiumUser ? (
                <button
                  onClick={onOpenBilling}
                  className="bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs sm:text-sm px-5 py-2.5 rounded-sm flex items-center gap-2 transition"
                >
                  <Sparkles className="w-4 h-4 fill-current animate-pulse" />
                  Upgrade Plan to Stream
                </button>
              ) : (
                <button
                  id="modal-play-btn"
                  onClick={() => onPlayClick(movie, movie.episodes?.[0])}
                  className="bg-[#E50914] hover:bg-[#b80710] text-white font-extrabold text-xs sm:text-sm px-6 py-2.5 rounded-sm flex items-center gap-2 transition transform hover:scale-105 shadow-lg shadow-[#E50914]/20"
                >
                  <Play className="w-4 h-4 fill-current" />
                  {continueState && continueState.position > 5 ? 'Resume watching' : 'Watch stream'}
                </button>
              )}

              <button
                id="modal-watchlist-btn"
                onClick={() => onToggleWatchlist(movie.id)}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white p-2.5 rounded-full transition flex items-center justify-center"
                title={isInWatchlist ? 'Remove from My List' : 'Add to My List'}
              >
                {isInWatchlist ? <Check className="w-5 h-5 text-green-500" /> : <Plus className="w-5 h-5" />}
              </button>

              {/* Download trigger */}
              <button
                id="modal-download-btn"
                onClick={() => onTriggerDownload(movie.id)}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white p-2.5 rounded-full transition flex items-center justify-center relative group"
                title="Download for offline access"
              >
                {downloadState ? (
                  downloadState.isCompleted ? (
                    <Check className="w-5 h-5 text-blue-400" />
                  ) : (
                    <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
                  )
                ) : (
                  <Download className="w-5 h-5" />
                )}
                {/* Floating bytes bar indicator */}
                {downloadState && !downloadState.isCompleted && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-[8px] px-1 py-0.5 rounded font-mono font-bold text-white">
                    {downloadState.progress}%
                  </span>
                )}
              </button>

              {/* Share trigger */}
              <button
                id="modal-share-btn"
                onClick={handleShare}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white p-2.5 rounded-full transition flex items-center justify-center relative group"
                title="Share this content link"
              >
                <Share2 className="w-5 h-5" />
                {copiedLink && (
                  <span className="absolute -top-9 bg-[#E50914] text-[9px] font-bold px-2 py-1 rounded text-white tracking-wider uppercase shadow-xl animate-bounce whitespace-nowrap">
                    Link Copied!
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-neutral-800 bg-[#0a0a0a] px-6">
          <button 
            onClick={() => setActiveTab('info')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 tracking-wide uppercase transition-all mr-6 ${
              activeTab === 'info' ? 'border-[#E50914] text-white' : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            Overview plots
          </button>
          {movie.type === 'series' && (
            <button 
              onClick={() => setActiveTab('episodes')}
              className={`py-3 text-xs sm:text-sm font-semibold border-b-2 tracking-wide uppercase transition-all mr-6 ${
                activeTab === 'episodes' ? 'border-[#E50914] text-white' : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              Episodes list ({movie.episodes?.length || 0})
            </button>
          )}
          <button 
            onClick={() => setActiveTab('more')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 tracking-wide uppercase transition-all ${
              activeTab === 'more' ? 'border-[#E50914] text-white' : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            Related Content
          </button>
        </div>

        {/* Body Container */}
        <div className="p-6 space-y-6 max-h-[350px] overflow-y-auto">
          
          {/* TAB 1: OVERVIEW METADATA */}
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              <div className="col-span-1 md:col-span-8 space-y-4">
                {/* Years, Duration, Rating indicators */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-white/70">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-red-500" />
                    {movie.year}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-red-500" />
                    {movie.duration}
                  </span>
                  <span className="bg-white/10 border border-white/10 text-white px-2 py-0.5 rounded font-bold">
                    {movie.rating}
                  </span>
                  {continueState && (
                    <span className="text-yellow-500 flex items-center gap-1 font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      In Progress ({Math.floor((continueState.position / continueState.duration) * 100)}%)
                    </span>
                  )}
                </div>

                <p className="text-sm text-white/85 leading-relaxed font-sans">{movie.description}</p>
                
                {/* Audio languages + Multi subtitles info */}
                <div className="pt-2 border-t border-white/5 space-y-2">
                  <div className="text-xs text-white/60 flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-white/40 flex-shrink-0" />
                    <span><strong className="text-white font-sans">Audio dialects:</strong> {movie.audioLanguages.join(', ')}</span>
                  </div>
                  <div className="text-xs text-white/60 flex items-center gap-2">
                    <Languages className="w-4 h-4 text-white/40 flex-shrink-0" />
                    <span><strong className="text-white font-sans">Adaptive subtitles:</strong> {movie.subtitles.join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* Cast List & details bar */}
              <div className="col-span-1 md:col-span-4 bg-white/5 border border-white/5 p-4 rounded-lg space-y-3 self-start">
                <div>
                  <label className="text-[10px] text-white/40 font-mono uppercase tracking-widest block mb-1">Stars Cast</label>
                  <p className="text-xs text-white leading-relaxed font-semibold">{movie.cast.join(', ')}</p>
                </div>
                <div>
                  <label className="text-[10px] text-white/40 font-mono uppercase tracking-widest block mb-1">Content genres</label>
                  <p className="text-xs text-red-400 font-sans">{movie.genres.join(', ')}</p>
                </div>
                {downloadState && (
                  <div className="pt-1.5 border-t border-white/10 text-xs text-white/60">
                    <span className="block font-mono text-[9px] uppercase tracking-widest text-[#508ef8] font-bold">DOWNLOADING ENGINE</span>
                    <p className="mt-1 font-mono">
                      {downloadState.isCompleted ? `Downloaded Completed (${downloadState.fileSize})` : `Progress: ${downloadState.progress}%`}
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: EPISODES SYSTEM */}
          {activeTab === 'episodes' && movie.episodes && (
            <div className="space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-widest text-[#E50914] font-bold">Season 1 Catalog Releases</h3>
              
              <div className="space-y-3">
                {movie.episodes.map((ep) => (
                  <div 
                    key={ep.id} 
                    className="bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors cursor-pointer"
                    onClick={() => {
                      if (movie.isPremiumOnly && !isPremiumUser) {
                        onOpenBilling();
                      } else {
                        onPlayClick(movie, ep);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#E50914]/10 border border-[#E50914]/25 text-[#E50914] flex items-center justify-center font-bold text-xs rounded">
                        E{ep.episodeNumber}
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs sm:text-sm text-white">{ep.title}</h4>
                        <span className="text-[10px] font-mono text-white/40">Duration: {ep.duration}</span>
                      </div>
                    </div>

                    <button 
                      className="bg-transparent hover:bg-white/10 text-[#E50914] hover:text-white px-3 py-1 rounded border border-[#E50914]/30 text-[10px] font-mono font-bold uppercase self-end sm:self-auto flex items-center gap-1 mr-2"
                    >
                      <Play className="w-3 h-3 fill-current" /> Stream Ep
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: MORE / RELATED ITEMS */}
          {activeTab === 'more' && (
            <div className="space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-widest text-[#E50914] font-bold">You Might Also Devour</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {fallbackRecommendations.map((rec) => (
                  <div 
                    key={rec.id} 
                    onClick={() => onSelectMovie(rec)}
                    className="bg-white/5 hover:bg-white/10 rounded-lg overflow-hidden border border-white/5 cursor-pointer transition transform hover:-translate-y-1 block shadow-md"
                  >
                    <div className="h-32 w-full relative">
                      <img 
                        src={rec.backdropUrl} 
                        alt={rec.title} 
                        className="w-full h-full object-cover select-none" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                      <span className="absolute bottom-2 left-2 text-[9px] bg-[#E50914] font-bold px-1.5 py-0.5 rounded uppercase text-white tracking-widest">
                        {rec.rating}
                      </span>
                    </div>
                    <div className="p-3 space-y-1">
                      <h4 className="font-bold text-xs text-white line-clamp-1">{rec.title}</h4>
                      <p className="text-[10px] text-white/50 line-clamp-2 leading-relaxed">{rec.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
