import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Play,
  Pause,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Volume2,
  Radio,
  Clock,
} from 'lucide-react';
import { uploadVoiceNotePermanently, VoiceNoteUploadResult } from '../services/voiceNoteService';

interface VoiceNoteRecorderProps {
  onRecorded: (result: VoiceNoteUploadResult, localAudioUrl: string) => void;
  onDiscard?: () => void;
  category?: string;
  className?: string;
}

export const VoiceNoteRecorder: React.FC<VoiceNoteRecorderProps> = ({
  onRecorded,
  onDiscard,
  category = 'prayer_request',
  className = '',
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [localAudioUrl, setLocalAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSeconds, setPlaybackSeconds] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Format seconds into MM:SS
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (localAudioUrl) {
        URL.revokeObjectURL(localAudioUrl);
      }
    };
  }, [localAudioUrl]);

  // Start recording
  const startRecording = async () => {
    setErrorMessage(null);
    audioChunksRef.current = [];

    // Check MediaRecorder API availability
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage(
        'Voice recording is not supported in this browser. Please try Chrome on Android or Safari on iOS.'
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      setHasPermission(true);

      // Determine best supported MIME type
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        mimeType = 'audio/ogg;codecs=opus';
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        // Stop all audio stream tracks so the microphone indicator turns off
        stream.getTracks().forEach((track) => track.stop());

        const finalBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(finalBlob);

        const url = URL.createObjectURL(finalBlob);
        setLocalAudioUrl(url);
        setIsRecording(false);
      };

      recorder.start(250); // Slice every 250ms
      setIsRecording(true);
      setRecordingSeconds(0);

      // Start elapsed timer
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          // Auto-stop at 5 minutes
          if (prev >= 300) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      console.error('Microphone permission or recording error:', err);
      setHasPermission(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage(
          'Microphone permission was denied. Please allow microphone access in your browser settings to record your voice note.'
        );
      } else if (err.name === 'NotFoundError') {
        setErrorMessage('No microphone device found on this phone or computer.');
      } else {
        setErrorMessage(`Microphone error: ${err.message || 'Could not start audio recording.'}`);
      }
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  // Playback handlers
  const togglePlayback = () => {
    if (!audioElementRef.current) return;

    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        setErrorMessage('Could not play back audio recording: ' + e.message);
      });
    }
  };

  // Delete & reset recording
  const handleDiscard = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
    if (localAudioUrl) {
      URL.revokeObjectURL(localAudioUrl);
    }
    setAudioBlob(null);
    setLocalAudioUrl(null);
    setIsPlaying(false);
    setRecordingSeconds(0);
    setPlaybackSeconds(0);
    setErrorMessage(null);
    if (onDiscard) onDiscard();
  };

  // Upload recorded note permanently
  const handleUploadAndSave = async () => {
    if (!audioBlob) return;

    setIsUploading(true);
    setUploadPercent(0);
    setErrorMessage(null);

    try {
      const result = await uploadVoiceNotePermanently(
        audioBlob,
        recordingSeconds,
        category,
        (percent) => setUploadPercent(percent)
      );

      onRecorded(result, localAudioUrl || '');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload voice note. Please try again.');
      setIsUploading(false);
    }
  };

  return (
    <div className={`p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-4 ${className}`}>
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center shadow-xs">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-blue-950">Record Voice Prayer Note</h4>
            <p className="text-[10px] text-slate-500">
              Speak directly to the pastoral care & intercessory team (Confidential)
            </p>
          </div>
        </div>

        {isRecording && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-700 text-xs font-black rounded-full animate-pulse border border-red-300">
            <Radio className="w-3 h-3 text-red-600 animate-spin" />
            <span>REC {formatTime(recordingSeconds)}</span>
          </div>
        )}
      </div>

      {/* Error feedback */}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">{errorMessage}</p>
        </div>
      )}

      {/* Hidden audio element for preview playback */}
      {localAudioUrl && (
        <audio
          ref={audioElementRef}
          src={localAudioUrl}
          onTimeUpdate={(e) => setPlaybackSeconds(Math.floor(e.currentTarget.currentTime))}
          onEnded={() => {
            setIsPlaying(false);
            setPlaybackSeconds(0);
          }}
        />
      )}

      {/* Active Recording State */}
      {isRecording && (
        <div className="py-5 flex flex-col items-center justify-center space-y-3 bg-white/80 rounded-xl border border-blue-100">
          <div className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center animate-pulse shadow-md">
            <Mic className="w-8 h-8" />
          </div>

          <div className="text-center space-y-1">
            <div className="font-mono text-2xl font-black text-slate-900">
              {formatTime(recordingSeconds)}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Recording your voice... Speak clearly into your phone.
            </p>
          </div>

          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-transform active:scale-95 shadow-sm"
          >
            <Square className="w-3.5 h-3.5 fill-white" />
            <span>Stop Recording</span>
          </button>
        </div>
      )}

      {/* Recorded Preview State */}
      {!isRecording && localAudioUrl && (
        <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={togglePlayback}
                className="w-10 h-10 rounded-full bg-blue-900 text-white flex items-center justify-center hover:bg-blue-800 transition-colors shadow-xs"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Voice Note Recorded
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {formatTime(playbackSeconds)} / {formatTime(recordingSeconds)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDiscard}
              disabled={isUploading}
              className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-xs font-semibold flex items-center gap-1"
              title="Delete and re-record"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>

          {/* Progress bar during playback */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-900 h-full transition-all duration-200"
              style={{
                width: `${recordingSeconds > 0 ? (playbackSeconds / recordingSeconds) * 100 : 0}%`,
              }}
            />
          </div>

          {/* Upload Button */}
          {isUploading ? (
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-blue-950">
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="w-3 h-3 animate-spin text-blue-700" />
                  <span>Uploading voice note to Cloud Storage...</span>
                </span>
                <span className="font-mono">{uploadPercent}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-900 h-full transition-all duration-300"
                  style={{ width: `${uploadPercent}%` }}
                />
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleUploadAndSave}
              className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Attach Voice Note to Prayer Request</span>
            </button>
          )}
        </div>
      )}

      {/* Initial Idle State: Tap to Record Button */}
      {!isRecording && !localAudioUrl && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white/70 rounded-xl border border-blue-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center shrink-0">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                Prefer to speak your prayer request?
              </p>
              <p className="text-[10px] text-slate-500">
                Tap record to leave an audio note for Pastor West Somina & intercessors.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={startRecording}
            className="w-full sm:w-auto px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm whitespace-nowrap min-h-[40px]"
          >
            <Mic className="w-4 h-4 text-amber-300" />
            <span>Record Voice Note</span>
          </button>
        </div>
      )}
    </div>
  );
};
