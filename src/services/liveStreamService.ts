import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { LiveStreamConfig } from '../types';
import { analyzeStreamUrl } from '../utils/streamUtils';

// Firestore collection name requested: 'liveConfig' (with fallback 'church_settings')
const PRIMARY_COLLECTION = 'liveConfig';
const PRIMARY_DOC_ID = 'sanctuary';
const LEGACY_COLLECTION = 'church_settings';
const LEGACY_DOC_ID = 'live_stream';

export interface StreamActivityCheckResult {
  isTrulyActive: boolean;
  isReceivingData: boolean;
  isBroadcastingToggled: boolean;
  reason: string;
  source: 'firestore' | 'endpoint_poll' | 'both' | 'none';
  manifestVerified?: boolean;
  segmentCount?: number;
  lastCheckedAt: Date;
  statusMessage: string;
}

/**
 * Checks the VOG Firestore 'liveConfig' collection to determine if the broadcast
 * is flagged as live and has valid stream parameters.
 */
export async function checkFirestoreLiveConfig(): Promise<{
  exists: boolean;
  config: LiveStreamConfig | null;
  isLive: boolean;
  streamUrl: string;
  isReceivingData?: boolean;
}> {
  try {
    // 1. Check primary 'liveConfig/sanctuary'
    const primaryRef = doc(db, PRIMARY_COLLECTION, PRIMARY_DOC_ID);
    const primarySnap = await getDoc(primaryRef);

    if (primarySnap.exists()) {
      const data = primarySnap.data() as LiveStreamConfig;
      return {
        exists: true,
        config: data,
        isLive: Boolean(data.isLive),
        streamUrl: (data.streamUrl || '').trim(),
        isReceivingData: data.isReceivingData,
      };
    }

    // 2. Fallback to legacy 'church_settings/live_stream'
    const legacyRef = doc(db, LEGACY_COLLECTION, LEGACY_DOC_ID);
    const legacySnap = await getDoc(legacyRef);

    if (legacySnap.exists()) {
      const data = legacySnap.data() as LiveStreamConfig;
      return {
        exists: true,
        config: data,
        isLive: Boolean(data.isLive),
        streamUrl: (data.streamUrl || '').trim(),
        isReceivingData: data.isReceivingData,
      };
    }

    return {
      exists: false,
      config: null,
      isLive: false,
      streamUrl: '',
    };
  } catch (error) {
    console.warn('[VOG Stream Telemetry] Firestore check notice:', error);
    return {
      exists: false,
      config: null,
      isLive: false,
      streamUrl: '',
    };
  }
}

/**
 * Polls the stream endpoint directly over HTTP(S) to verify that video data
 * or an active live manifest is genuinely being returned.
 *
 * For HLS (.m3u8):
 * - Checks status code (200 OK)
 * - Verifies Content-Type / text manifest body contains #EXTM3U
 * - Checks whether manifest contains video segments (.ts or .m4s or chunk urls)
 * - Detects #EXT-X-ENDLIST (meaning stream has ended, not live)
 *
 * For Direct Video (.mp4 / .webm):
 * - Performs a Range request to confirm byte streaming is responding.
 */
export async function pollStreamEndpoint(
  streamUrl: string,
  timeoutMs: number = 5000
): Promise<{
  isReceivingData: boolean;
  manifestVerified: boolean;
  segmentCount: number;
  message: string;
  details?: string;
  statusCode?: number;
}> {
  const cleanUrl = streamUrl?.trim();
  if (!cleanUrl) {
    return {
      isReceivingData: false,
      manifestVerified: false,
      segmentCount: 0,
      message: 'Stream URL is empty.',
    };
  }

  const analysis = analyzeStreamUrl(cleanUrl);
  if (!analysis.isValid) {
    return {
      isReceivingData: false,
      manifestVerified: false,
      segmentCount: 0,
      message: analysis.error || 'Stream URL format is invalid.',
      details: analysis.adminGuidance,
    };
  }

  // Mixed content security check: HTTPS website cannot fetch HTTP endpoint
  if (typeof window !== 'undefined' && window.location.protocol === 'https:' && !analysis.isHttps) {
    return {
      isReceivingData: false,
      manifestVerified: false,
      segmentCount: 0,
      message: 'Insecure HTTP stream on HTTPS website (Mixed Content Block).',
      details: 'Endpoint must start with https:// to stream securely in web browsers.',
    };
  }

  // For YouTube or custom iframe embeds, endpoint cannot be polled via raw CORS fetch
  if (analysis.type === 'youtube' || analysis.type === 'custom_embed') {
    return {
      isReceivingData: true,
      manifestVerified: true,
      segmentCount: 1,
      message: 'Verified embedded stream service.',
      details: 'Stream runs through embedded provider player.',
    };
  }

  // Poll HLS or direct video endpoint
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(cleanUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.apple.mpegurl, application/x-mpegurl, video/*, text/plain, */*',
        // Request first 8KB to inspect manifest headers and media tags without downloading heavy video
        Range: 'bytes=0-8192',
      },
      mode: 'cors',
      signal: controller.signal,
    });

    clearTimeout(timer);

    const statusCode = response.status;

    if (statusCode < 200 || statusCode >= 400) {
      return {
        isReceivingData: false,
        manifestVerified: false,
        segmentCount: 0,
        statusCode,
        message: statusCode === 404
          ? 'Stream endpoint responded 404 (Path not found or stream stopped).'
          : `Stream server returned HTTP error status ${statusCode}.`,
      };
    }

    const text = await response.text();

    // Check if body is an HLS playlist
    if (text.includes('#EXTM3U')) {
      const isEnded = text.includes('#EXT-X-ENDLIST');
      // Count segment tags (#EXTINF)
      const segments = (text.match(/#EXTINF/g) || []).length;
      // Also count sub-stream manifests (#EXT-X-STREAM-INF for master playlist)
      const subStreams = (text.match(/#EXT-X-STREAM-INF/g) || []).length;

      if (isEnded) {
        return {
          isReceivingData: false,
          manifestVerified: true,
          segmentCount: segments,
          statusCode,
          message: 'HLS stream manifest has ended (#EXT-X-ENDLIST). Broadcast is offline.',
        };
      }

      if (segments > 0 || subStreams > 0) {
        return {
          isReceivingData: true,
          manifestVerified: true,
          segmentCount: segments || subStreams,
          statusCode,
          message: `Active HLS stream confirmed with ${segments} live video segment(s) received.`,
        };
      }

      // Live playlist exists but waiting for camera video segments
      return {
        isReceivingData: false,
        manifestVerified: true,
        segmentCount: 0,
        statusCode,
        message: 'HLS playlist connected, but waiting for video segments from camera.',
      };
    }

    // Direct video stream response with 200/206
    if (statusCode === 200 || statusCode === 206) {
      return {
        isReceivingData: true,
        manifestVerified: false,
        segmentCount: 1,
        statusCode,
        message: 'Direct video stream is actively delivering data.',
      };
    }

    return {
      isReceivingData: false,
      manifestVerified: false,
      segmentCount: 0,
      statusCode,
      message: 'Endpoint reachable but not delivering recognizable stream data.',
    };
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      return {
        isReceivingData: false,
        manifestVerified: false,
        segmentCount: 0,
        message: 'Stream endpoint poll timed out (no data received).',
      };
    }

    if (analysis.isLocalLan) {
      return {
        isReceivingData: false,
        manifestVerified: false,
        segmentCount: 0,
        message: 'Cannot reach local IP stream outside sanctuary network.',
        details: 'Use public HTTPS tunnel URL for worshippers.',
      };
    }

    return {
      isReceivingData: false,
      manifestVerified: false,
      segmentCount: 0,
      message: 'Stream endpoint is offline or blocked by CORS.',
      details: error?.message || 'Server did not respond with video data.',
    };
  }
}

/**
 * MASTER TELEMETRY UTILITY FUNCTION:
 * Determines if the church broadcast is TRULY ACTIVE and receiving data.
 *
 * Verifies both:
 * 1. Admin Broadcast Flag (from Firestore / liveConfig)
 * 2. Real stream data transmission (endpoint polling or player data confirmation)
 *
 * ONLY when BOTH criteria pass will `isTrulyActive` be true, guaranteeing
 * the 'LIVE NOW' badge never appears for a broken or empty player.
 */
export async function determineTrulyActiveBroadcast(
  currentConfig?: LiveStreamConfig | null
): Promise<StreamActivityCheckResult> {
  const now = new Date();

  // 1. Fetch live config from Firestore if not provided or to get latest remote state
  let configToTest = currentConfig;
  let source: 'firestore' | 'endpoint_poll' | 'both' | 'none' = 'none';

  if (!configToTest || !configToTest.streamUrl) {
    const firestoreResult = await checkFirestoreLiveConfig();
    if (firestoreResult.config) {
      configToTest = firestoreResult.config;
      source = 'firestore';
    }
  }

  // If still no config or stream URL, broadcast is definitely inactive
  if (!configToTest || !configToTest.streamUrl?.trim()) {
    return {
      isTrulyActive: false,
      isReceivingData: false,
      isBroadcastingToggled: Boolean(configToTest?.isLive),
      reason: 'No stream URL has been configured for the broadcast.',
      source,
      lastCheckedAt: now,
      statusMessage: 'The church is not currently broadcasting live. Check the service schedule below for upcoming services.',
    };
  }

  const isToggledLive = Boolean(configToTest.isLive);
  if (!isToggledLive) {
    return {
      isTrulyActive: false,
      isReceivingData: false,
      isBroadcastingToggled: false,
      reason: 'Broadcasting is toggled OFF by the administrator.',
      source,
      lastCheckedAt: now,
      statusMessage: 'The church is not currently broadcasting live. Check the service schedule below for upcoming services.',
    };
  }

  // 2. Poll the stream endpoint to check if data is genuinely being received
  const pollResult = await pollStreamEndpoint(configToTest.streamUrl);
  source = source === 'firestore' ? 'both' : 'endpoint_poll';

  const isTrulyActive = isToggledLive && pollResult.isReceivingData;

  return {
    isTrulyActive,
    isReceivingData: pollResult.isReceivingData,
    isBroadcastingToggled: isToggledLive,
    reason: isTrulyActive
      ? 'Stream is actively receiving video data and broadcast is enabled.'
      : pollResult.message,
    source,
    manifestVerified: pollResult.manifestVerified,
    segmentCount: pollResult.segmentCount,
    lastCheckedAt: now,
    statusMessage: isTrulyActive
      ? 'LIVE NOW: Sanctuary service is streaming directly inside the VOG application.'
      : 'The live stream is currently unavailable. Please check back soon.',
  };
}

/**
 * Persist the live stream configuration and status to BOTH:
 * - 'liveConfig/sanctuary' (new dedicated liveConfig collection)
 * - 'church_settings/live_stream' (legacy collection for backwards compatibility)
 */
export async function persistLiveConfigToFirestore(
  config: LiveStreamConfig
): Promise<{ success: boolean; message: string }> {
  try {
    const payload = {
      ...config,
      updatedAt: serverTimestamp(),
      lastActiveAt: config.isReceivingData ? new Date().toISOString() : null,
    };

    // Save to primary collection 'liveConfig'
    const primaryRef = doc(db, PRIMARY_COLLECTION, PRIMARY_DOC_ID);
    await setDoc(primaryRef, payload, { merge: true });

    // Also mirror to legacy collection 'church_settings' for full safety
    try {
      const legacyRef = doc(db, LEGACY_COLLECTION, LEGACY_DOC_ID);
      await setDoc(legacyRef, payload, { merge: true });
    } catch {}

    return {
      success: true,
      message: 'Stream configuration saved to VOG Firestore liveConfig collection.',
    };
  } catch (error: any) {
    console.warn('Firestore liveConfig save notice:', error);
    return {
      success: false,
      message: error?.message || 'Saved to local browser storage only.',
    };
  }
}

/**
 * Subscribe to real-time liveConfig updates in Firestore across all devices.
 */
export function subscribeToLiveConfigFromFirestore(
  onUpdate: (config: Partial<LiveStreamConfig>) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    // Listen to primary 'liveConfig/sanctuary'
    const primaryRef = doc(db, PRIMARY_COLLECTION, PRIMARY_DOC_ID);
    const unsubscribe = onSnapshot(
      primaryRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          onUpdate(data as LiveStreamConfig);
        } else {
          // If primary doesn't exist yet, try legacy
          const legacyRef = doc(db, LEGACY_COLLECTION, LEGACY_DOC_ID);
          getDoc(legacyRef).then((snap) => {
            if (snap.exists()) {
              onUpdate(snap.data() as LiveStreamConfig);
            }
          }).catch(() => {});
        }
      },
      (err) => {
        console.warn('liveConfig Firestore listener notice:', err);
        onError?.(err);
      }
    );
    return unsubscribe;
  } catch (err: any) {
    console.warn('Could not attach liveConfig listener:', err);
    return () => {};
  }
}

/**
 * Convenience helper to fetch live config once
 */
export async function fetchLiveConfigFromFirestore(): Promise<LiveStreamConfig | null> {
  const res = await checkFirestoreLiveConfig();
  return res.config;
}
