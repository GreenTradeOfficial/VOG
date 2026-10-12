import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  RefreshCw,
  AlertTriangle,
  Wifi,
  WifiOff,
  Radio,
  Lock,
} from 'lucide-react';

interface HlsPlayerProps {
  streamUrl: string;
  autoplay?: boolean;
  muted?: boolean;
  onStreamActive?: () => void;
  onStreamError?: (errorMessage: string) => void;
  className?: string;
  serviceTitle?: string;
}

export const HlsPlayer: React.FC<HlsPlayerProps> = ({
  streamUrl,
  autoplay = true,
  muted = false,
  onStreamActive,
  onStreamError,
  className = '',
  serviceTitle = 'VOG Sanctuary Live Broadcast',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  // Check for HTTPS mixed-content constraint
  const isPageHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const isStreamHttp = streamUrl.toLowerCase().startsWith('http://');
  const isMixedContent = isPageHttps && isStreamHttp;

  // Check for local private IP address (LAN)
  const isLocalLan =
    streamUrl.includes('192.168.') ||
    streamUrl.includes('10.') ||
    streamUrl.includes('172.16.') ||
    streamUrl.includes('localhost') ||
    streamUrl.includes('127.0.0.1');

  const cleanUpHls = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  }, []);

  const initPlayer = useCallback(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    cleanUpHls();
    setIsLoading(true);
    setErrorMessage(null);

    // Mixed content block warning
    if (isMixedContent) {
      const msg =
        'Mixed Content Block: This application runs over HTTPS, so web browsers automatically block insecure HTTP streams. Please expose your MediaMTX HLS stream over HTTPS (e.g. using Cloudflare Tunnel or an SSL reverse proxy).';
      setErrorMessage(msg);
      setIsLoading(false);
      onStreamError?.(msg);
      return;
    }

    const canPlayNative = video.canPlayType('application/vnd.apple.mpegurl');
    const isHlsJsSupported = Hls.isSupported();

    // 1. Native HLS Playback (iOS Safari, macOS Safari)
    if (canPlayNative && !isHlsJsSupported) {
      video.src = streamUrl;
      video.load();

      const onTimeUpdate = () => {
        if (video.currentTime > 0) {
          setIsLoading(false);
          setIsLiveConnected(true);
          onStreamActive?.();
        }
      };

      const onCanPlay = () => {
        setIsLoading(false);
        if (autoplay) {
          video.play().catch(() => {
            // Autoplay with sound might be blocked by browser; retry muted
            video.muted = true;
            setIsMuted(true);
            video.play().catch(() => {});
          });
        }
      };

      const onVideoError = () => {
        const error =
          'Native HLS stream playback failed. The camera or streaming server may be offline, or CORS is not enabled.';
        setErrorMessage(error);
        setIsLoading(false);
        setIsLiveConnected(false);
        onStreamError?.(error);
      };

      video.addEventListener('canplay', onCanPlay, { once: true });
      video.addEventListener('timeupdate', onTimeUpdate);
      video.addEventListener('error', onVideoError);

      return () => {
        video.removeEventListener('canplay', onCanPlay);
        video.removeEventListener('timeupdate', onTimeUpdate);
        video.removeEventListener('error', onVideoError);
      };
    }

    // 2. hls.js Playback (Chrome, Android, Edge, Firefox, Desktop)
    if (isHlsJsSupported) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 30,
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 8,
        maxLiveSyncPlaybackRate: 1.5,
        manifestLoadingTimeOut: 12000,
        manifestLoadingMaxRetry: 4,
        manifestLoadingRetryDelay: 2000,
        levelLoadingTimeOut: 10000,
        fragLoadingTimeOut: 15000,
      });

      hlsRef.current = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        setReconnectAttempts(0);
        if (autoplay) {
          video.play().catch(() => {
            video.muted = true;
            setIsMuted(true);
            video.play().catch(() => {});
          });
        }
      });

      // Confirm stream is receiving actual media data fragments
      hls.on(Hls.Events.FRAG_LOADED, () => {
        setIsLoading(false);
        setIsLiveConnected(true);
        onStreamActive?.();
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          setIsLiveConnected(false);
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              // If server responded with 404 Not Found, immediately fail and notify stream error
              if (data.response?.code === 404) {
                hls.destroy();
                const notFoundErr = 'Stream endpoint returned 404 Not Found. The camera broadcast is offline or not publishing.';
                setErrorMessage(notFoundErr);
                setIsLoading(false);
                onStreamError?.(notFoundErr);
                return;
              }

              // Automatic retry with exponential backoff up to 3 times
              if (reconnectAttempts < 3) {
                const nextAttempt = reconnectAttempts + 1;
                setReconnectAttempts(nextAttempt);
                setIsLoading(true);
                reconnectTimeoutRef.current = window.setTimeout(() => {
                  hls.startLoad();
                }, nextAttempt * 2000);
              } else {
                const netErr =
                  'Network connection to stream server lost. Please ensure your MediaMTX server and IP camera are actively transmitting.';
                setErrorMessage(netErr);
                setIsLoading(false);
                onStreamError?.(netErr);
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              const genErr =
                'Stream playback encountered a fatal error. Please verify the HLS endpoint URL and CORS settings.';
              setErrorMessage(genErr);
              setIsLoading(false);
              onStreamError?.(genErr);
              break;
          }
        }
      });

      return () => {
        cleanUpHls();
      };
    }

    // 3. Fallback direct src
    video.src = streamUrl;
  }, [
    streamUrl,
    autoplay,
    isMixedContent,
    cleanUpHls,
    onStreamActive,
    onStreamError,
    reconnectAttempts,
  ]);

  useEffect(() => {
    initPlayer();
    return () => {
      cleanUpHls();
    };
  }, [initPlayer, cleanUpHls]);

  // Video element event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => {
      setIsMuted(video.muted);
      setVolume(video.volume);
    };
    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => {
      setIsLoading(false);
      setIsLiveConnected(true);
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
    };
  }, []);

  const handleManualRetry = () => {
    setReconnectAttempts(0);
    setErrorMessage(null);
    initPlayer();
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
  };

  const handleVolumeSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const video = videoRef.current;
    if (!video) return;
    video.volume = val;
    video.muted = val === 0;
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative rounded-3xl overflow-hidden bg-slate-950 shadow-2xl border border-slate-800 aspect-video flex flex-col justify-between group ${className}`}
    >
      {/* Top Overlay: Live Status Bar */}
      <div className="relative z-30 p-3 sm:p-4 flex items-center justify-between bg-gradient-to-b from-black/85 via-black/40 to-transparent">
        <div className="flex items-center gap-2">
          {isLiveConnected ? (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white rounded-full text-xs font-black shadow-lg shadow-red-600/40 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white" />
              <span>LIVE NOW</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/90 text-slate-950 rounded-full text-xs font-bold">
              <Radio className="w-3 h-3 text-slate-950 animate-pulse" />
              <span>CONNECTING STREAM</span>
            </div>
          )}

          <div className="px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full text-white/90 text-[11px] font-semibold border border-white/10 hidden sm:inline-flex items-center gap-1.5">
            <Wifi className="w-3 h-3 text-emerald-400" />
            <span>HLS Sanctuary Camera</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-white/90 font-medium hidden md:inline truncate max-w-xs">
            {serviceTitle}
          </span>

          <button
            onClick={handleManualRetry}
            className="p-1.5 hover:bg-white/15 rounded-lg text-white/80 hover:text-white transition-colors flex items-center gap-1 text-xs"
            title="Retry Stream Connection"
            aria-label="Retry Stream"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="text-[11px] hidden sm:inline">Retry</span>
          </button>
        </div>
      </div>

      {/* Video Viewport */}
      <div className="absolute inset-0 flex items-center justify-center bg-black">
        <video
          ref={videoRef}
          playsInline
          className="w-full h-full object-contain bg-black"
        />

        {/* Loading Spinner */}
        {isLoading && !errorMessage && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-xs z-10 text-white space-y-3">
            <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
            <div className="text-center">
              <p className="text-xs font-bold text-white">Loading Sanctuary Feed...</p>
              <p className="text-[11px] text-slate-400">Connecting to church HLS broadcast</p>
            </div>
          </div>
        )}

        {/* Error / Offline Screen */}
        {errorMessage && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white bg-slate-950/95 z-20 space-y-3 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              {isMixedContent ? <Lock className="w-6 h-6" /> : <WifiOff className="w-6 h-6" />}
            </div>

            <div>
              <h4 className="text-sm font-bold text-white">
                {isMixedContent ? 'HTTPS Stream Security Requirement' : 'Camera Stream Interrupted'}
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed text-balance">
                {errorMessage}
              </p>
              {isLocalLan && (
                <p className="text-[11px] text-amber-300 bg-amber-950/40 border border-amber-500/30 rounded-xl p-2.5 mt-2 leading-relaxed text-left">
                  <strong>Notice for Administrator:</strong> This URL uses a private local IP (e.g. 192.168.x.x). To allow worshipers outside church Wi-Fi to watch, expose your MediaMTX HLS stream using a public HTTPS tunnel (like Cloudflare Tunnel).
                </p>
              )}
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={handleManualRetry}
                className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Connection</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="relative z-30 p-3 sm:p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between text-white transition-opacity">
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-white" />
            ) : (
              <Play className="w-5 h-5 fill-white ml-0.5" />
            )}
          </button>

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleMute}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5 text-rose-400" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeSlider}
              className="w-16 sm:w-20 accent-blue-500 h-1.5 bg-white/20 rounded-lg cursor-pointer"
              aria-label="Volume Slider"
            />
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-white/80 bg-white/10 px-2.5 py-1 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>HTML5 HLS Player</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Toggle Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
