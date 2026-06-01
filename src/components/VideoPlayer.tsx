import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Minimize2, 
  Settings, ArrowLeft, Languages, SkipForward, Tv, Sparkles, Wifi
} from 'lucide-react';
import { Movie, Episode } from '../types';
import { SUBTITLE_DIALECTS } from '../data/initialMovies';

interface VideoPlayerProps {
  movie: Movie;
  activeEpisode?: Episode;
  initialTime?: number;
  onClose: () => void;
  onProgress: (currentTime: number, totalDuration: number) => void;
  onNextEpisode?: () => void;
}

export default function VideoPlayer({ 
  movie, 
  activeEpisode, 
  initialTime = 0, 
  onClose, 
  onProgress,
  onNextEpisode 
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedSubtitle, setSelectedSubtitle] = useState('English');
  const [selectedQuality, setSelectedQuality] = useState('Auto (1080p)');
  const [isBuffering, setIsBuffering] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSubtitlesMenu, setShowSubtitlesMenu] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [hasSkippedIntro, setHasSkippedIntro] = useState(false);
  const controlsTimeoutRef = useRef<number | null>(null);
  const bufferTimeoutRef = useRef<number | null>(null);

  // Clear buffering timeouts on unmount
  useEffect(() => {
    return () => {
      if (bufferTimeoutRef.current) window.clearTimeout(bufferTimeoutRef.current);
    };
  }, []);

  const handleWaiting = () => {
    if (bufferTimeoutRef.current) window.clearTimeout(bufferTimeoutRef.current);
    bufferTimeoutRef.current = window.setTimeout(() => {
      setIsBuffering(true);
    }, 350) as unknown as number; // Avoid sudden flickering during minor network jitter
  };

  const handlePlaying = () => {
    if (bufferTimeoutRef.current) window.clearTimeout(bufferTimeoutRef.current);
    setIsBuffering(false);
  };

  const titleText = activeEpisode 
    ? `${movie.title} • S1:E${activeEpisode.episodeNumber} - ${activeEpisode.title}`
    : movie.title;

  const currentVideoUrl = activeEpisode ? activeEpisode.videoUrl : movie.videoUrl;

  // Handle Initial Time and Setup
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = initialTime;
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    }
    setHasSkippedIntro(false);
  }, [currentVideoUrl, initialTime]);

  // Autoplay next episode helper
  useEffect(() => {
    if (currentTime > 0 && Math.abs(currentTime - duration) < 1.5) {
      if (onNextEpisode) {
        onNextEpisode();
      }
    }
  }, [currentTime, duration, onNextEpisode]);

  // Save progress callback on intervals
  useEffect(() => {
    if (currentTime > 0 && duration > 0) {
      onProgress(currentTime, duration);
    }
  }, [currentTime, duration]);

  // Event handlers
  const handlePlayPause = () => {
    const video = videoRef.current;
    if (video) {
      if (isPlaying) {
        video.pause();
        setIsPlaying(false);
      } else {
        video.play().catch(() => {});
        setIsPlaying(true);
      }
    }
    triggerControlsVisibility();
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      setCurrentTime(video.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) {
      setDuration(video.duration || 120); // fallback
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const video = videoRef.current;
    if (video) {
      video.currentTime = val;
      setCurrentTime(val);
    }
    triggerControlsVisibility();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    const video = videoRef.current;
    if (video) {
      video.volume = val;
      setIsMuted(val === 0);
    }
    triggerControlsVisibility();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      const nextMute = !isMuted;
      setIsMuted(nextMute);
      video.muted = nextMute;
    }
    triggerControlsVisibility();
  };

  const handleFullscreenToggle = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error('Error entering fullscreen:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(err => {});
    }
  };

  // Monitor document level FS state
  useEffect(() => {
    const handleFSChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFSChange);
    return () => document.removeEventListener('fullscreenchange', handleFSChange);
  }, []);

  const changePlaybackSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    const video = videoRef.current;
    if (video) {
      video.playbackRate = speed;
    }
    setShowSpeedMenu(false);
    setShowSettings(false);
  };

  const changeQuality = (quality: string) => {
    setSelectedQuality(quality);
    setIsBuffering(true);
    setShowQualityMenu(false);
    setShowSettings(false);
    
    // Simulate brief buffering delay for resolution switch
    setTimeout(() => {
      setIsBuffering(false);
    }, 800);
  };

  // Picture in Picture
  const togglePiP = async () => {
    const video = videoRef.current;
    if (video && document.pictureInPictureEnabled) {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await video.requestPictureInPicture();
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Intros handles
  const introStart = movie.introStart ?? 10;
  const introEnd = movie.introEnd ?? 30;
  const showSkipIntro = currentTime >= introStart && currentTime <= introEnd && !hasSkippedIntro;

  const handleSkipIntro = () => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = introEnd;
      setCurrentTime(introEnd);
      setHasSkippedIntro(true);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Handle auto-fade controls on idle mouse move
  const triggerControlsVisibility = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying && !showSettings && !showSubtitlesMenu && !showSpeedMenu && !showQualityMenu) {
        setShowControls(false);
      }
    }, 3500) as unknown as number;
  };

  useEffect(() => {
    const handleMouseMove = () => triggerControlsVisibility();
    const container = containerRef.current;
    container?.addEventListener('mousemove', handleMouseMove);
    container?.addEventListener('click', handleMouseMove);

    return () => {
      container?.removeEventListener('mousemove', handleMouseMove);
      container?.removeEventListener('click', handleMouseMove);
      if (controlsTimeoutRef.current) window.clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying, showSettings, showSubtitlesMenu, showSpeedMenu, showQualityMenu]);

  // Render Subtitles
  const getSubtitlesText = (): string => {
    if (selectedSubtitle === 'None') return '';
    const transcript = SUBTITLE_DIALECTS[selectedSubtitle];
    if (!transcript) return '';

    // Find the current active phrase
    const active = [...transcript]
      .reverse()
      .find((item) => currentTime >= item.time && currentTime < item.time + 4);
    
    return active ? active.text : '';
  };

  const subtitleText = getSubtitlesText();

  // Backward 10s helper
  const handleRewind = () => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = Math.max(0, video.currentTime - 10);
    }
  };

  // Forward 10s helper
  const handleForward = () => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = Math.min(duration, video.currentTime + 10);
    }
  };

  return (
    <div 
      id="video-player-root"
      ref={containerRef} 
      className="fixed inset-0 bg-black z-50 flex items-center justify-center select-none overflow-hidden"
    >
      {/* Actual HTML Video Tag */}
      <video
        ref={videoRef}
        src={currentVideoUrl}
        className="w-full h-full object-contain pointer-events-auto"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onWaiting={handleWaiting}
        onPlaying={handlePlaying}
        onClick={handlePlayPause}
        quality-level={selectedQuality}
      />

      {/* Buffering Indicator */}
      {isBuffering && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-xs z-20">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-white text-sm font-mono mt-4 tracking-wide flex items-center gap-2">
            <Wifi className="w-4 h-4 text-red-500 animate-pulse" /> Adaptive Buffering Channel ({selectedQuality})
          </span>
        </div>
      )}

      {/* Subtitles Overlay */}
      {subtitleText && (
        <div className="absolute bottom-28 left-4 right-4 text-center z-10 pointer-events-none">
          <span className="bg-black/85 text-white/95 text-lg md:text-2xl px-4 py-2 rounded-md font-sans border border-white/10 tracking-wide inline-block shadow-lg max-w-3xl">
            {subtitleText}
          </span>
        </div>
      )}

      {/* Skip Intro Floating Prompt */}
      {showSkipIntro && (
        <button
          id="btn-skip-intro"
          onClick={handleSkipIntro}
          className="absolute bottom-32 right-8 bg-white text-black hover:bg-red-600 hover:text-white font-bold px-5 py-2.5 rounded-sm border border-black/30 transition-all flex items-center gap-2 text-sm uppercase tracking-wider z-20 shadow-xl scale-105"
        >
          <SkipForward className="w-4 h-4 fill-current" />
          Skip Intro
        </button>
      )}

      {/* Controls Overlay Wrapper */}
      <div 
        className={`absolute inset-0 flex flex-col justify-between transition-opacity duration-300 bg-gradient-to-t from-black/80 via-transparent to-black/70 z-10 pointer-events-none ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Top Header controls */}
        <div className="p-4 flex items-center justify-between pointer-events-auto w-full">
          <div className="flex items-center gap-4">
            <button 
              id="player-back-btn"
              onClick={onClose} 
              className="p-2 mr-2 text-white/80 hover:text-white bg-black/40 rounded-full hover:bg-black/60 transition-all"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-white font-semibold text-lg md:text-xl line-clamp-1 flex items-center gap-2 font-sans tracking-tight">
                {titleText}
                {movie.isPremiumOnly && (
                  <span className="text-[10px] bg-red-600 text-white font-mono px-1.5 py-0.5 rounded uppercase font-bold tracking-widest">
                    PREMIUM
                  </span>
                )}
              </h2>
              <span className="text-white/60 text-xs font-mono uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Streaming Ready
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Subtitle Toggle button */}
            <button 
              id="player-sub-btn"
              onClick={() => {
                setShowSubtitlesMenu(!showSubtitlesMenu);
                setShowSettings(false);
                setShowSpeedMenu(false);
                setShowQualityMenu(false);
              }}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all flex items-center gap-1"
              title="Subtitle selection"
            >
              <Languages className="w-5 h-5" />
              <span className="text-xs font-mono hidden md:inline">{selectedSubtitle}</span>
            </button>
          </div>
        </div>

        {/* Center Play/Pause triggers */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none gap-8">
          <button 
            onClick={handleRewind}
            className="p-4 bg-black/40 hover:bg-black/75 text-white rounded-full transition-all pointer-events-auto transform hover:scale-110"
            title="Rewind 10s"
          >
            <RotateCcw className="w-6 h-6" />
          </button>

          <button 
            id="player-center-play"
            onClick={handlePlayPause}
            className="p-6 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all pointer-events-auto transform hover:scale-110 shadow-lg shadow-red-600/30"
          >
            {isPlaying ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current ml-1" />}
          </button>

          <button 
            onClick={handleForward}
            className="p-4 bg-black/40 hover:bg-black/75 text-white rounded-full transition-all pointer-events-auto transform hover:scale-110 select-none"
            title="Forward 10s"
          >
            <RotateCcw className="w-6 h-6 rotate-180" />
          </button>
        </div>

        {/* Bottom Panel controls */}
        <div className="p-4 md:p-6 space-y-4 pointer-events-auto bg-gradient-to-t from-black/90 via-black/40 to-transparent">
          {/* Custom Timeline Sliders & Times */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-mono text-white/70">
              <span>{formatTime(currentTime)}</span>
              <span>-{formatTime(Math.max(0, duration - currentTime))}</span>
            </div>
            
            <div className="relative group flex items-center w-full h-2">
              <input 
                type="range"
                min="0"
                max={duration || 120}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-white/20 hover:h-2 rounded-lg appearance-none cursor-pointer accent-red-600 transition-all outline-none"
              />
            </div>
          </div>

          {/* Buttons strip */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Play, Volume controls */}
            <div className="flex items-center gap-4">
              <button 
                id="player-bottom-play"
                onClick={handlePlayPause} 
                className="text-white hover:text-red-500 transition-colors"
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
              </button>

              <div className="flex items-center gap-2 group">
                <button onClick={toggleMute} className="text-white hover:text-red-500 transition-colors">
                  {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                </button>
                <input 
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 md:w-24 h-1 bg-white/35 rounded appearance-none cursor-pointer accent-red-600 transition-all outline-none"
                />
              </div>

              {movie.episodes && movie.episodes.length > 0 && onNextEpisode && (
                <button
                  id="player-next-ep-btn"
                  onClick={onNextEpisode}
                  className="text-white hover:text-red-500 flex items-center gap-1 text-xs font-mono border border-white/20 rounded px-2 py-1 bg-white/5"
                  title="Play next episode"
                >
                  <Tv className="w-4 h-4 text-red-500" />
                  Next Episode
                </button>
              )}
            </div>

            {/* Subtitle selection details banner */}
            <span className="hidden lg:inline text-xs font-mono text-white/50 tracking-wider">
              Codec: AVC-H.264 • Audio: {movie.audioLanguages.join(', ')} ({selectedSubtitle !== 'None' ? `Subtitle: ${selectedSubtitle}` : 'No Subtitles'})
            </span>

            {/* Right side settings, pip, speed, fullscreen */}
            <div className="flex items-center gap-4 relative">
              {/* Speed Multiplier Button */}
              <button 
                onClick={() => {
                  setShowSpeedMenu(!showSpeedMenu);
                  setShowSettings(false);
                  setShowSubtitlesMenu(false);
                  setShowQualityMenu(false);
                }}
                className="text-white bg-white/10 hover:bg-white/20 text-[11px] font-mono px-2.5 py-1 rounded border border-white/20"
                title="Playback speed"
              >
                {playbackSpeed === 1 ? 'Normal' : `${playbackSpeed}x`}
              </button>

              {/* PiP Trigger */}
              <button 
                onClick={togglePiP}
                className="text-white/80 hover:text-white transition-all hidden md:inline"
                title="Picture-in-Picture"
              >
                <Tv className="w-5 h-5 text-white/90" />
              </button>

              {/* Quality Preset / Adaptive Controller */}
              <button 
                onClick={() => {
                  setShowQualityMenu(!showQualityMenu);
                  setShowSettings(false);
                  setShowSubtitlesMenu(false);
                  setShowSpeedMenu(false);
                }}
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-2.5 transition-all text-xs font-mono flex items-center gap-1"
                title="Adaptive Video Resolution"
              >
                <Settings className="w-5 h-5" />
                <span className="hidden md:inline">{selectedQuality}</span>
              </button>

              {/* Fullscreen Button */}
              <button 
                id="player-fs-btn"
                onClick={handleFullscreenToggle} 
                className="text-white/90 hover:text-white transition-all"
              >
                {isFullscreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
              </button>

              {/* Context Selector Overlay Menu (Absolute Submenus) */}
              
              {/* SUBTITLES CONTEXT MENU */}
              {showSubtitlesMenu && (
                <div className="absolute right-0 bottom-12 w-48 bg-black/95 border border-white/15 rounded-md shadow-2xl p-2 text-left space-y-1 block z-40">
                  <h4 className="text-[10px] font-mono uppercase text-red-500 font-bold px-3 py-1 tracking-widest border-b border-white/10">Subtitles</h4>
                  {['None', ...movie.subtitles].map((sub) => (
                    <button
                      key={sub}
                      onClick={() => {
                        setSelectedSubtitle(sub);
                        setShowSubtitlesMenu(false);
                      }}
                      className={`w-full text-left font-sans text-xs px-3 py-1.5 rounded transition ${
                        selectedSubtitle === sub 
                          ? 'bg-red-600 text-white font-bold' 
                          : 'text-white/80 hover:bg-white/10'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              )}

              {/* PLAYBACK SPEED CONTEXT MENU */}
              {showSpeedMenu && (
                <div className="absolute right-12 bottom-12 w-40 bg-black/95 border border-white/15 rounded-md shadow-2xl p-2 text-left space-y-1 block z-40">
                  <h4 className="text-[10px] font-mono uppercase text-red-500 font-bold px-3 py-1 tracking-widest border-b border-white/10">Speed</h4>
                  {[0.5, 1, 1.25, 1.5, 2].map((sp) => (
                    <button
                      key={sp}
                      onClick={() => changePlaybackSpeed(sp)}
                      className={`w-full text-left font-mono text-xs px-3 py-1.5 rounded transition ${
                        playbackSpeed === sp 
                          ? 'bg-red-600 text-white font-bold' 
                          : 'text-white/80 hover:bg-white/10'
                      }`}
                    >
                      {sp === 1 ? 'Normal (1x)' : `${sp}x`}
                    </button>
                  ))}
                </div>
              )}

              {/* ADAPTIVE CHANNELS RESOLUTIONS */}
              {showQualityMenu && (
                <div className="absolute right-4 bottom-12 w-52 bg-black/95 border border-white/15 rounded-md shadow-2xl p-2 text-left space-y-1 block z-40">
                  <h4 className="text-[10px] font-mono uppercase text-red-500 font-bold px-3 py-1.5 tracking-widest border-b border-white/10 flex items-center justify-between">
                    <span>Quality Mode</span>
                    <Wifi className="w-3 h-3 text-green-500" />
                  </h4>
                  {['Auto (1080p)', '1080p FHD (WebM)', '720p HD (Low-Latency)', '480p SD (Data-Saver)'].map((quality) => (
                    <button
                      key={quality}
                      onClick={() => changeQuality(quality)}
                      className={`w-full text-left font-sans text-xs px-3 py-2 rounded transition ${
                        selectedQuality === quality 
                          ? 'bg-red-600 text-white font-bold' 
                          : 'text-white/80 hover:bg-white/10'
                      }`}
                    >
                      {quality}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
