
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Settings, Maximize, Lock, Unlock, Sun, MoreVertical, Layers, Zap, AlertCircle
} from 'lucide-react';
import { VideoFile, AspectRatio, PlayerSettings } from '../types';

interface VideoPlayerProps {
  video: VideoFile;
  onBack: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, onBack, onNext, onPrev, hasNext, hasPrev }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<PlayerSettings>({
    playbackSpeed: 1,
    aspectRatio: AspectRatio.FIT,
    isLocked: false
  });

  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !settings.isLocked) setShowControls(false);
    }, 3000);
  }, [isPlaying, settings.isLocked]);

  const togglePlay = useCallback(async () => {
    if (settings.isLocked || error) return;
    if (videoRef.current) {
      try {
        if (videoRef.current.paused) {
          await videoRef.current.play();
          setIsPlaying(true);
        } else {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      } catch (err) {
        console.error("Playback error:", err);
      }
    }
  }, [settings.isLocked, error]);

  const handleProgress = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setCurrentTime(current);
      setProgress((current / total) * 100);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (settings.isLocked) return;
    const newProgress = parseFloat(e.target.value);
    if (videoRef.current && videoRef.current.duration) {
      const newTime = (newProgress / 100) * videoRef.current.duration;
      videoRef.current.currentTime = newTime;
      setProgress(newProgress);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const changeAspectRatio = () => {
    const order = [AspectRatio.FIT, AspectRatio.STRETCH, AspectRatio.CROP, AspectRatio.SIXTEEN_NINE, AspectRatio.FOUR_THREE];
    const currentIndex = order.indexOf(settings.aspectRatio);
    const nextIndex = (currentIndex + 1) % order.length;
    setSettings(prev => ({ ...prev, aspectRatio: order[nextIndex] }));
  };

  const changeSpeed = () => {
    const speeds = [0.5, 1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(settings.playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    const newSpeed = speeds[nextIndex];
    setSettings(prev => ({ ...prev, playbackSpeed: newSpeed }));
    if (videoRef.current) videoRef.current.playbackRate = newSpeed;
  };

  const toggleLock = () => {
    setSettings(prev => ({ ...prev, isLocked: !prev.isLocked }));
    setShowControls(true);
  };

  // Video Load Effect
  useEffect(() => {
    setError(null);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = video.url;
      videoRef.current.load(); // CRITICAL: Refresh the media source
      
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            resetControlsTimer();
          })
          .catch(err => {
            console.warn("Autoplay blocked or load failed:", err);
            setIsPlaying(false);
          });
      }
    }
  }, [video, resetControlsTimer]);

  const handleVideoError = () => {
    setError("এই ভিডিওটি প্লে করা যাচ্ছে না। ফরম্যাটটি ব্রাউজার সাপোর্ট করে না।");
    setIsPlaying(false);
  };

  const videoObjectFit = () => {
    switch(settings.aspectRatio) {
      case AspectRatio.STRETCH: return 'fill';
      case AspectRatio.CROP: return 'cover';
      case AspectRatio.SIXTEEN_NINE: return '16 / 9';
      case AspectRatio.FOUR_THREE: return '4 / 3';
      default: return 'contain';
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden"
      onClick={resetControlsTimer}
      style={{ filter: `brightness(${brightness}%)` }}
    >
      <video
        ref={videoRef}
        playsInline
        className="w-full h-full transition-all duration-300"
        style={{ 
          objectFit: videoObjectFit() as any,
          aspectRatio: (settings.aspectRatio === AspectRatio.SIXTEEN_NINE ? '16/9' : settings.aspectRatio === AspectRatio.FOUR_THREE ? '4/3' : 'auto') 
        }}
        onTimeUpdate={handleProgress}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
        onEnded={() => setIsPlaying(false)}
        onError={handleVideoError}
        onClick={(e) => { e.stopPropagation(); togglePlay(); }}
      />

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-6 text-center z-50">
          <AlertCircle size={64} className="text-red-500 mb-4" />
          <p className="text-lg font-medium text-gray-200">{error}</p>
          <button 
            onClick={onBack}
            className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm transition-all"
          >
            ফিরে যান
          </button>
        </div>
      )}

      {/* Custom Controls Overlay */}
      <div className={`absolute inset-0 z-20 transition-opacity duration-300 flex flex-col justify-between p-4 bg-gradient-to-t from-black/80 via-transparent to-black/60 ${showControls && !error ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {!settings.isLocked && (
              <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <ArrowLeft size={24} />
              </button>
            )}
            <h2 className="text-white font-medium text-lg truncate max-w-[200px] md:max-w-md">
              {video.name}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {!settings.isLocked && (
              <>
                <button onClick={changeSpeed} className="flex items-center gap-1 text-xs bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20">
                  <Zap size={14} className="text-yellow-400" />
                  {settings.playbackSpeed}x
                </button>
                <button onClick={changeAspectRatio} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <Layers size={20} />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <MoreVertical size={20} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Center Controls */}
        <div className="flex-1 flex items-center justify-center gap-12">
          {!settings.isLocked ? (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); onPrev(); }}
                disabled={!hasPrev}
                className={`p-4 rounded-full transition-all ${!hasPrev ? 'opacity-30' : 'hover:bg-white/10 active:scale-90'}`}
              >
                <SkipBack size={36} fill="white" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
              >
                {isPlaying ? <Pause size={40} fill="white" /> : <Play size={40} className="ml-2" fill="white" />}
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onNext(); }}
                disabled={!hasNext}
                className={`p-4 rounded-full transition-all ${!hasNext ? 'opacity-30' : 'hover:bg-white/10 active:scale-90'}`}
              >
                <SkipForward size={36} fill="white" />
              </button>
            </>
          ) : (
            <div className="h-20" /> /* Spacer */
          )}
        </div>

        {/* Bottom Bar */}
        <div className="space-y-4">
          {!settings.isLocked && (
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="w-12 text-right">{formatTime(currentTime)}</span>
              <div className="flex-1 relative group h-1.5 flex items-center">
                <input 
                  type="range"
                  min="0"
                  max="100"
                  step="0.1"
                  value={progress}
                  onChange={handleSeek}
                  className="w-full h-full bg-white/20 rounded-lg cursor-pointer appearance-none outline-none"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 ${progress}%, rgba(255,255,255,0.2) ${progress}%)`
                  }}
                />
              </div>
              <span className="w-12">{formatTime(duration)}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={toggleLock} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all">
                {settings.isLocked ? <Lock size={20} /> : <Unlock size={20} />}
              </button>
              {!settings.isLocked && (
                <div className="flex items-center gap-2 bg-white/10 p-1.5 px-3 rounded-full">
                  <button onClick={() => {
                    const newVol = volume === 0 ? 1 : 0;
                    setVolume(newVol);
                    if (videoRef.current) videoRef.current.volume = newVol;
                  }}>
                    {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                  <input 
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setVolume(v);
                      if (videoRef.current) videoRef.current.volume = v;
                    }}
                    className="w-16 h-1 bg-white/30 rounded-full accent-white"
                  />
                </div>
              )}
            </div>

            {!settings.isLocked && (
              <div className="flex items-center gap-3">
                 <div className="flex items-center gap-2 bg-white/10 p-1.5 px-3 rounded-full">
                  <Sun size={18} />
                  <input 
                    type="range"
                    min="20"
                    max="150"
                    value={brightness}
                    onChange={(e) => setBrightness(parseInt(e.target.value))}
                    className="w-16 h-1 bg-white/30 rounded-full accent-white"
                  />
                </div>
                <button 
                  onClick={() => containerRef.current?.requestFullscreen()}
                  className="p-3 bg-white/10 rounded-full hover:bg-white/20"
                >
                  <Maximize size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
