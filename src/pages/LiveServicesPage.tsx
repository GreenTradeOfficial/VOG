import React, { useState, useEffect } from 'react';
import { useChurch } from '../context/ChurchContext';
import {
  Radio,
  Play,
  Send,
  Sparkles,
  Settings,
  Calendar,
  Clock,
  Info,
  AlertTriangle,
  Server,
  RefreshCw,
  Video,
  CheckCircle2,
  Lock,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Terminal,
  Cpu,
} from 'lucide-react';
import { ChurchArtwork } from '../components/ChurchArtwork';
import { HlsPlayer } from '../components/HlsPlayer';
import { analyzeStreamUrl, testStreamSource } from '../utils/streamUtils';
import {
  determineTrulyActiveBroadcast,
  pollStreamEndpoint,
} from '../services/liveStreamService';
import {
  StreamServiceMonitor,
  StreamMonitorStatus,
} from '../services/streamMonitorService';
import { LiveChat } from '../components/LiveChat';

export const LiveServicesPage: React.FC = () => {
  const { liveConfig, updateLiveConfig, sermons, serviceSchedule, showToast } = useChurch();

  const [showUrlModal, setShowUrlModal] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [copiedCodeKey, setCopiedCodeKey] = useState<string | null>(null);

  // Playback runtime status inside the component
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [playerKey, setPlayerKey] = useState(0);

  // Admin Modal state
  const [streamUrlInput, setStreamUrlInput] = useState(liveConfig.streamUrl || '');
  const [adminIsLiveInput, setAdminIsLiveInput] = useState(liveConfig.isLive);
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    isAvailable: boolean;
    message: string;
    details?: string;
    isHttpsRequired?: boolean;
  } | null>(null);
  const [isTestingStream, setIsTestingStream] = useState(false);

  // Service Monitor Status: Tracks stream reachability and automatic offline switching
  const [monitorStatus, setMonitorStatus] = useState<StreamMonitorStatus>({
    isOnline: false,
    isReceivingData: false,
    consecutiveFailures: 0,
    isUnreachableOr404: false,
    lastCheckedAt: new Date(),
    message: 'Stream monitor initialized.',
  });

  // Real-time analysis of the active configured stream
  const activeAnalysis = analyzeStreamUrl(liveConfig.streamUrl);

  // Real-time analysis of modal input
  const modalInputAnalysis = analyzeStreamUrl(streamUrlInput);

  // SERVICE MONITOR INSTANCE & EFFECT:
  // Regularly monitors the HLS stream URL (every 10s).
  // Automatically switches player to offline placeholder if unreachable or 404.
  useEffect(() => {
    const monitor = new StreamServiceMonitor(
      {
        onStatusChange: (status) => {
          setMonitorStatus(status);
        },
        onStreamUnreachable: (status) => {
          setMonitorStatus(status);
          setPlaybackError(status.message);
        },
        onStreamRestored: (status) => {
          setMonitorStatus(status);
          setPlaybackError(null);
          showToast('Sanctuary live stream reconnected!', 'success');
        },
      },
      {
        checkIntervalMs: 10000, // Regular polling every 10 seconds
        failureThreshold: 2,   // Auto-switch to offline after 2 failures or on 404
        timeoutMs: 5000,
      }
    );

    monitor.updateConfig(liveConfig.streamUrl, liveConfig.isLive);
    monitor.start();

    return () => {
      monitor.stop();
    };
  }, [liveConfig.streamUrl, liveConfig.isLive, showToast]);

  // Genuine broadcasting state calculation:
  // Automatically switches to offline placeholder if:
  // 1. liveConfig.isLive is false
  // 2. streamUrl is invalid or empty
  // 3. stream is unreachable or returns 404 (detected by service monitor)
  // 4. playbackError occurred
  const isBroadcastingActive =
    liveConfig.isLive &&
    activeAnalysis.isValid &&
    !monitorStatus.isUnreachableOr404 &&
    !playbackError;

  const isTrulyReceivingData =
    isBroadcastingActive &&
    (monitorStatus.isReceivingData || liveConfig.isReceivingData || liveConfig.validationStatus === 'verified_active');

  // Standby screen countdown
  const [countdown, setCountdown] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateNextServiceCountdown = () => {
      const now = new Date();
      const currentDay = now.getDay(); // 0 is Sunday, 4 is Thursday
      let target = new Date(now);

      if (currentDay === 0 && now.getHours() < 11) {
        // Sunday morning
        target.setHours(8, 0, 0, 0);
        if (target <= now) {
          target = now;
        }
      } else if (currentDay < 4 || (currentDay === 4 && now.getHours() < 17)) {
        // Next is Thursday 5:00 PM
        const daysUntilThursday = (4 - currentDay + 7) % 7;
        target.setDate(now.getDate() + (daysUntilThursday === 0 ? 7 : daysUntilThursday));
        target.setHours(17, 0, 0, 0);
      } else {
        // Next is Sunday 8:00 AM
        const daysUntilSunday = (7 - currentDay) % 7;
        target.setDate(now.getDate() + (daysUntilSunday === 0 ? 7 : daysUntilSunday));
        target.setHours(8, 0, 0, 0);
      }

      const diff = Math.max(0, target.getTime() - now.getTime());
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    };

    calculateNextServiceCountdown();
    const interval = setInterval(calculateNextServiceCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRetryStream = async () => {
    setIsRetrying(true);
    setPlaybackError(null);
    try {
      const poll = await pollStreamEndpoint(liveConfig.streamUrl);
      if (poll.isReceivingData) {
        setPlayerKey((k) => k + 1);
        setPlaybackError(null);
        showToast('Stream is reachable! Reconnecting sanctuary video...', 'success');
      } else {
        const errorMsg = poll.statusCode === 404
          ? 'Stream server returned 404 Not Found. Camera broadcast is not active.'
          : poll.message || 'Stream is currently unreachable.';
        setPlaybackError(errorMsg);
        showToast(errorMsg, 'info');
      }
    } catch {
      setPlaybackError('Could not connect to streaming server.');
      showToast('Could not reach the streaming server.', 'info');
    } finally {
      setIsRetrying(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeKey(key);
    setTimeout(() => setCopiedCodeKey(null), 2500);
    showToast('Copied to clipboard!', 'info');
  };

  // Test Stream action inside Admin Modal
  const handleTestStream = async () => {
    setIsTestingStream(true);
    setTestResult(null);
    try {
      const poll = await pollStreamEndpoint(streamUrlInput);
      setTestResult({
        tested: true,
        isAvailable: poll.isReceivingData,
        message: poll.message,
        details: poll.details || (poll.segmentCount ? `${poll.segmentCount} video segment(s) received from stream.` : undefined),
      });
    } catch {
      setTestResult({
        tested: true,
        isAvailable: false,
        message: 'Could not reach the streaming server.',
        details: 'Verify internet connection and ensure your MediaMTX server has HTTPS and CORS enabled.',
      });
    } finally {
      setIsTestingStream(false);
    }
  };

  const handleSaveModalConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = streamUrlInput.trim();

    // Validate URL format before saving
    if (cleanUrl) {
      const check = analyzeStreamUrl(cleanUrl);
      if (!check.isValid) {
        showToast(check.error || 'Please enter a valid stream URL.', 'info');
        return;
      }
    }

    const isReceiving = Boolean(testResult?.isAvailable);
    updateLiveConfig({
      streamUrl: cleanUrl,
      streamType: 'independent_hls',
      isLive: adminIsLiveInput,
      isReceivingData: adminIsLiveInput ? isReceiving : false,
      validationStatus: adminIsLiveInput ? (isReceiving ? 'verified_active' : 'unverified') : 'offline',
      statusMessage: adminIsLiveInput
        ? (isReceiving ? 'LIVE NOW: Sanctuary service is streaming directly inside VOG.' : 'Broadcast active. Waiting for video data from sanctuary camera.')
        : 'The church is not currently broadcasting live. Check the service schedule below for upcoming services.',
    });

    setPlaybackError(null);
    setPlayerKey((k) => k + 1);
    setShowUrlModal(false);
    showToast('Live stream settings updated and synced across all devices!', 'success');
  };

  // Sync modal state when opened
  useEffect(() => {
    if (showUrlModal) {
      setStreamUrlInput(liveConfig.streamUrl || '');
      setAdminIsLiveInput(liveConfig.isLive);
      setTestResult(null);
    }
  }, [showUrlModal, liveConfig]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
              VOG LIVE BROADCAST
            </span>
            <span className="text-slate-400 text-xs">·</span>
            <span className="text-xs text-slate-500 font-medium">
              Vessel of Grace Christian Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-950 font-serif-church">
            Church Live Services
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Admin stream configure button */}
          <button
            onClick={() => setShowUrlModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors min-h-[40px] shadow-sm"
            title="Configure Stream URL"
          >
            <Settings className="w-3.5 h-3.5 text-blue-900" />
            <span>Configure Stream URL</span>
          </button>
        </div>
      </div>

      {/* VIDEO PLAYER & STANDBY CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Video Viewport (2 cols on large) */}
        <div className="lg:col-span-2 space-y-4">
          {isBroadcastingActive ? (
            /* ACTIVE BROADCAST: Genuine in-app HLS Player */
            activeAnalysis.type === 'hls_independent' || activeAnalysis.type === 'direct_video' ? (
              <HlsPlayer
                key={`hls-${playerKey}`}
                streamUrl={liveConfig.streamUrl}
                serviceTitle={liveConfig.title}
                onStreamActive={() => {
                  setPlaybackError(null);
                  setMonitorStatus((prev) => ({
                    ...prev,
                    isOnline: true,
                    isReceivingData: true,
                    isUnreachableOr404: false,
                  }));
                }}
                onStreamError={(err) => {
                  setPlaybackError(err);
                  setMonitorStatus((prev) => ({
                    ...prev,
                    isOnline: false,
                    isReceivingData: false,
                    isUnreachableOr404: true,
                    message: err,
                  }));
                }}
              />
            ) : activeAnalysis.embedUrl ? (
              /* Fallback iframe embed (e.g. YouTube or custom) */
              <div className="relative rounded-3xl overflow-hidden bg-slate-950 shadow-2xl border border-slate-800 aspect-video flex flex-col justify-between">
                <iframe
                  key={`embed-${playerKey}`}
                  src={activeAnalysis.embedUrl}
                  title="VOG Live Stream"
                  className="w-full h-full border-0 absolute inset-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : null
          ) : (
            /* STANDBY / OFFLINE VIEW: Clean, welcoming standby screen informing visitors */
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 shadow-2xl border border-blue-900/30 aspect-video flex flex-col justify-between p-6 sm:p-8 text-white">
              {/* Standby Header Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                    monitorStatus.isUnreachableOr404
                      ? 'bg-rose-950/80 text-rose-300 border-rose-800/80'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}>
                    {monitorStatus.isUnreachableOr404 ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                    ) : (
                      <Radio className="w-3 h-3 text-slate-400" />
                    )}
                    <span>
                      {monitorStatus.offlineReason === '404_not_found'
                        ? 'STREAM NOT FOUND (404)'
                        : monitorStatus.isUnreachableOr404
                        ? 'STREAM UNREACHABLE'
                        : 'BROADCAST STANDBY'}
                    </span>
                  </div>
                  <span className="text-[11px] text-blue-200 bg-blue-900/40 px-2.5 py-1 rounded-full border border-blue-800/60 hidden sm:inline">
                    Omagwa Sanctuary Feed
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold bg-black/40 px-3 py-1 rounded-full border border-white/10">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Next: Sundays 8:00 AM · Thursdays 5:00 PM</span>
                </div>
              </div>

              {/* Standby Main Message */}
              <div className="text-center max-w-lg mx-auto space-y-3 py-2">
                <div className={`w-14 h-14 mx-auto rounded-2xl border flex items-center justify-center shadow-inner ${
                  monitorStatus.isUnreachableOr404
                    ? 'bg-rose-950/40 border-rose-700/50 text-rose-300'
                    : 'bg-blue-900/40 border-blue-700/50 text-blue-300'
                }`}>
                  {monitorStatus.isUnreachableOr404 ? (
                    <AlertTriangle className="w-7 h-7 text-rose-400" />
                  ) : (
                    <Radio className="w-7 h-7" />
                  )}
                </div>

                <div>
                  <h3 className="text-base sm:text-xl font-bold text-white font-serif-church">
                    {monitorStatus.offlineReason === '404_not_found'
                      ? 'Stream Endpoint Not Found (404 Offline)'
                      : monitorStatus.isUnreachableOr404
                      ? 'Sanctuary Live Stream Currently Unreachable'
                      : 'The church is not currently broadcasting live. Check the service schedule below for upcoming services.'}
                  </h3>
                  <p className="text-xs text-blue-200/80 mt-1.5 leading-relaxed">
                    {monitorStatus.isUnreachableOr404
                      ? 'The service monitor detected that the streaming endpoint is not publishing live video data (unreachable or 404). The player has safely switched to offline standby mode.'
                      : 'Live broadcasts stream directly inside this application during Sunday Celebration (8:00 AM), Mid-Week Breakthrough (5:00 PM), and the 10th Anniversary (Oct 28 – Nov 1, 2026).'}
                  </p>
                </div>

                {/* Countdown to Next Scheduled Gathering */}
                <div className="pt-2">
                  <div className="inline-flex items-center gap-3 bg-black/50 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15">
                    <div className="text-center">
                      <span className="text-base sm:text-lg font-black text-amber-400 font-mono">
                        {String(countdown.days).padStart(2, '0')}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider block text-slate-400">Days</span>
                    </div>
                    <span className="text-slate-600 font-bold">:</span>
                    <div className="text-center">
                      <span className="text-base sm:text-lg font-black text-amber-400 font-mono">
                        {String(countdown.hours).padStart(2, '0')}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider block text-slate-400">Hours</span>
                    </div>
                    <span className="text-slate-600 font-bold">:</span>
                    <div className="text-center">
                      <span className="text-base sm:text-lg font-black text-amber-400 font-mono">
                        {String(countdown.minutes).padStart(2, '0')}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider block text-slate-400">Mins</span>
                    </div>
                    <span className="text-slate-600 font-bold">:</span>
                    <div className="text-center">
                      <span className="text-base sm:text-lg font-black text-amber-400 font-mono">
                        {String(countdown.seconds).padStart(2, '0')}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider block text-slate-400">Secs</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Standby Bottom Controls / Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-white/10 text-xs">
                <span className="text-slate-400 text-[11px]">
                  Omagwa Sanctuary, Port Harcourt · Senior Pastor West Somina
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRetryStream}
                    disabled={isRetrying}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold"
                  >
                    <RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
                    <span>Check Broadcast Now</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Service Title & Live Information Strip */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-serif-church">
                  {liveConfig.title}
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Senior Pastor: <span className="font-semibold text-blue-900">Pastor West Somina</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
                  <Video className="w-3.5 h-3.5 text-blue-900" />
                  <span>In-App Sanctuary Feed (Independent HLS)</span>
                </div>
              </div>
            </div>

            {/* Honest Status Description based on real data reception */}
            {isTrulyReceivingData ? (
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
                <span className="relative flex h-2.5 w-2.5 mt-1 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                </span>
                <div>
                  <span className="font-bold text-emerald-900 block">LIVE NOW — Receiving Sanctuary Stream:</span>
                  <span className="text-[11px] text-emerald-800">
                    Active church service is broadcasting live and receiving video data inside the VOG application.
                  </span>
                </div>
              </div>
            ) : isBroadcastingActive && !isTrulyReceivingData ? (
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <span className="font-bold text-amber-900 block">Broadcast Active · Waiting for Video Data:</span>
                  <span className="text-[11px] text-amber-800">
                    Broadcasting is enabled by church admin, but the stream is currently connecting or buffering data segments.
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-slate-500" />
                <div>
                  <span className="font-bold text-slate-900 block">Sanctuary Broadcast Standby:</span>
                  <span className="text-[11px] text-slate-600">
                    The church is not currently broadcasting live. Check the service schedule below for upcoming services.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Real-time Sanctuary Live Chat & Prayer Wall (Firestore Connected) */}
        <div className="h-full">
          <LiveChat className="h-full min-h-[520px] lg:h-[560px]" />
        </div>
      </div>

      {/* WEEKLY CHURCH SERVICE BROADCAST SCHEDULE */}
      <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-blue-950 font-serif-church">
              Regular Church Service Times & Broadcast Schedule
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Join us physically at the sanctuary or worship live online during official church service hours
            </p>
          </div>
          <span className="text-[11px] font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 self-start sm:self-auto">
            Omagwa Sanctuary
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Sunday Service */}
          <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-blue-900 font-black text-xs uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-blue-900" />
                <span>Sunday Service</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                {serviceSchedule.sundayDay}
              </span>
            </div>
            <h4 className="text-base font-black text-blue-950">
              Sunday Celebration Service
            </h4>
            <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-blue-100 text-sm font-black text-blue-950">
              <Clock className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{serviceSchedule.sundayDisplay}</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {serviceSchedule.descriptionSunday || 'High praise, communion, prophetic ministration and the uncompromised Word with Senior Pastor West Somina.'}
            </p>
          </div>

          {/* Thursday Service */}
          <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-amber-900 font-black text-xs uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-amber-700" />
                <span>Thursday Service</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                {serviceSchedule.thursdayDay}
              </span>
            </div>
            <h4 className="text-base font-black text-slate-900">
              Mid-Week Breakthrough Service
            </h4>
            <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-amber-100 text-sm font-black text-slate-900">
              <Clock className="w-4 h-4 text-red-600 shrink-0" />
              <span>{serviceSchedule.thursdayDisplay}</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {serviceSchedule.descriptionThursday || 'In-depth scriptural exposition, spiritual warfare prayers, faith discipleship, and fellowship.'}
            </p>
          </div>

          {/* Special Programs & 10th Anniversary */}
          <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-indigo-900 font-black text-xs uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-indigo-900" />
                <span>Special Programs</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-900">
                VOG @ 10
              </span>
            </div>
            <h4 className="text-base font-black text-slate-900">
              10th Anniversary Celebration (ACCESS)
            </h4>
            <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-indigo-100 text-xs font-bold text-slate-800">
              <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>28 OCTOBER – 1 NOVEMBER 2026</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Theme: <strong>ACCESS</strong> (1 Corinthians 2:9–10). Evening services 5:00 PM daily (Oct 28–31), Sunday Thanksgiving service 8:00 AM (Nov 1). Location: Beside AP (Front) Filling Station, Omagwa.
            </p>
          </div>
        </div>
      </section>

      {/* PREVIOUS CHURCH SERVICES ARCHIVE */}
      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-blue-950 font-serif-church">
            Previous Church Services & Broadcast Replays
          </h3>
          <p className="text-xs text-slate-500">
            Recorded video archives and past sermon messages from previous services
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {sermons.map((sermon) => (
            <div
              key={sermon.id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="relative aspect-video">
                <ChurchArtwork
                  theme={sermon.serviceType.includes('Sunday') ? 'worship' : 'sermon'}
                  className="w-full h-full"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="w-9 h-9 rounded-full bg-white/90 text-blue-900 flex items-center justify-center shadow-lg">
                    <Play className="w-4 h-4 fill-blue-900 ml-0.5" />
                  </div>
                </div>
                <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 text-white rounded text-[10px] font-mono">
                  {sermon.duration}
                </span>
              </div>

              <div className="p-3.5 space-y-1">
                <span className="text-[10px] font-bold text-amber-700">
                  {sermon.date} · {sermon.serviceType}
                </span>
                <h4 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-blue-900">
                  {sermon.title}
                </h4>
                <p className="text-[11px] text-slate-500 truncate">
                  {sermon.speaker}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ADMIN STREAM CONFIGURATION MODAL */}
      {showUrlModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Independent Live Stream Configuration
                </h3>
                <p className="text-xs text-slate-500">
                  Direct church video streaming from your IP Camera and MediaMTX server.
                </p>
              </div>
              <span className="p-2 bg-blue-50 text-blue-900 rounded-xl">
                <Settings className="w-4 h-4" />
              </span>
            </div>

            <form onSubmit={handleSaveModalConfig} className="mt-4 space-y-4">
              {/* Architecture Banner */}
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-blue-950 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-blue-900">
                  <Cpu className="w-4 h-4 text-blue-700" />
                  <span>Church Streaming Architecture</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  <strong>IP Camera (RTSP)</strong> → <strong>Church Laptop (MediaMTX)</strong> → <strong>Public HTTPS HLS Endpoint</strong> → <strong>VOG Application</strong>
                </p>
                <button
                  type="button"
                  onClick={() => setShowSetupGuide(!showSetupGuide)}
                  className="text-[11px] font-bold text-blue-900 hover:underline flex items-center gap-1 pt-1"
                >
                  <span>{showSetupGuide ? 'Hide Equipment Setup Guide' : 'View Practical Church Equipment Setup Guide →'}</span>
                  {showSetupGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Practical Equipment Setup Guide (Expandable) */}
              {showSetupGuide && (
                <div className="p-4 rounded-2xl bg-slate-900 text-white text-xs space-y-3.5 border border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-amber-300 flex items-center gap-1.5">
                      <Terminal className="w-4 h-4" />
                      <span>Step-by-Step Equipment Setup</span>
                    </span>
                    <span className="text-[10px] text-slate-400">IP Camera + Laptop + Router</span>
                  </div>

                  {/* Step 1 */}
                  <div className="space-y-1">
                    <p className="font-bold text-slate-200 text-[11px]">1. Sanctuary IP Camera (RTSP Stream):</p>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Connect your IP camera to the church router via Ethernet or Wi-Fi. Determine its local IP address (e.g. <code>192.168.1.120</code>). Its RTSP feed URL is typically:
                    </p>
                    <div className="bg-black/60 p-2 rounded-lg font-mono text-[10px] text-emerald-400 flex items-center justify-between">
                      <span>rtsp://admin:password@192.168.1.120:554/stream1</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('rtsp://admin:password@192.168.1.120:554/stream1', 'rtsp')}
                        className="text-slate-400 hover:text-white"
                      >
                        {copiedCodeKey === 'rtsp' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="space-y-1">
                    <p className="font-bold text-slate-200 text-[11px]">2. MediaMTX on Church Laptop (mediamtx.yml):</p>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Download MediaMTX (free lightweight media server). In <code>mediamtx.yml</code>, add your camera under <code>paths</code>:
                    </p>
                    <div className="bg-black/60 p-2 rounded-lg font-mono text-[10px] text-amber-300 whitespace-pre leading-relaxed relative">
                      {`paths:
  sanctuary:
    source: rtsp://admin:password@192.168.1.120:554/stream1
    sourceOnDemand: no
    hlsAlwaysRemux: yes`}
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            `paths:\n  sanctuary:\n    source: rtsp://admin:password@192.168.1.120:554/stream1\n    sourceOnDemand: no\n    hlsAlwaysRemux: yes`,
                            'mediamtx'
                          )
                        }
                        className="absolute top-2 right-2 text-slate-400 hover:text-white"
                      >
                        {copiedCodeKey === 'mediamtx' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="space-y-1">
                    <p className="font-bold text-slate-200 text-[11px]">3. Make it Public & Secure with HTTPS (Cloudflare Tunnel):</p>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Because this web app runs on HTTPS, browsers block insecure HTTP streams. Run Cloudflare Tunnel on your laptop:
                    </p>
                    <div className="bg-black/60 p-2 rounded-lg font-mono text-[10px] text-cyan-300 flex items-center justify-between">
                      <span>cloudflared tunnel --url http://localhost:8888</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('cloudflared tunnel --url http://localhost:8888', 'tunnel')}
                        className="text-slate-400 hover:text-white"
                      >
                        {copiedCodeKey === 'tunnel' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Copy the resulting public HTTPS URL (e.g. <code>https://your-tunnel.trycloudflare.com/sanctuary/index.m3u8</code>) and paste it below.
                    </p>
                  </div>
                </div>
              )}

              {/* Public HLS Stream URL Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Public HTTPS HLS Stream URL (.m3u8) *
                  </label>
                  <button
                    type="button"
                    onClick={handleTestStream}
                    disabled={isTestingStream || !streamUrlInput.trim()}
                    className="text-[11px] font-bold text-blue-900 hover:text-blue-700 underline flex items-center gap-1 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isTestingStream ? 'animate-spin' : ''}`} />
                    <span>Test Stream Connectivity</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={streamUrlInput}
                  onChange={(e) => {
                    setStreamUrlInput(e.target.value);
                    setTestResult(null);
                  }}
                  placeholder="https://your-tunnel.trycloudflare.com/sanctuary/index.m3u8"
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-900 font-mono text-[11px]"
                />
              </div>

              {/* Live Test Result Diagnostic */}
              {testResult && (
                <div
                  className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                    testResult.isAvailable
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : 'bg-rose-50 border-rose-200 text-rose-950'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold">
                    {testResult.isAvailable ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{testResult.isAvailable ? 'Stream Reachable & Online' : 'Stream Connection Diagnostic'}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">{testResult.message}</p>
                  {testResult.details && (
                    <p className="text-[10px] text-slate-600 border-t border-slate-200/50 pt-1 mt-1 leading-relaxed">
                      <strong>Technical Note:</strong> {testResult.details}
                    </p>
                  )}
                </div>
              )}

              {/* URL Real-time Diagnostics Badge */}
              <div className="p-3.5 rounded-2xl border text-xs space-y-1.5 bg-slate-50 border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Stream Source Type:
                  </span>
                  <span className="font-bold text-blue-900 text-xs px-2.5 py-0.5 rounded-full bg-blue-100 border border-blue-200">
                    {modalInputAnalysis.label}
                  </span>
                </div>

                {modalInputAnalysis.error && (
                  <div className="flex items-start gap-1.5 text-rose-700 font-medium pt-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-600" />
                    <span>{modalInputAnalysis.error}</span>
                  </div>
                )}

                {modalInputAnalysis.warning && (
                  <div className="flex items-start gap-1.5 text-amber-800 font-medium pt-1">
                    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                    <span>{modalInputAnalysis.warning}</span>
                  </div>
                )}

                <p className="text-[11px] text-slate-600 pt-1 leading-relaxed border-t border-slate-200/60 mt-1">
                  <strong>Admin Guidance:</strong> {modalInputAnalysis.adminGuidance}
                </p>
              </div>

              {/* Broadcast Live Status Toggle */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Broadcast Live Status Toggle
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Switch ON when actively broadcasting live from sanctuary
                  </span>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adminIsLiveInput}
                    onChange={(e) => setAdminIsLiveInput(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Syncs to cloud & all devices</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowUrlModal(false)}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors min-h-[40px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow-md transition-all active:scale-95 min-h-[40px]"
                  >
                    Save Stream Configuration
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
