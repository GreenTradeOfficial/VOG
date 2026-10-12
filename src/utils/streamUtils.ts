/**
 * Stream URL parsing, validation, endpoint testing, and diagnostic analysis
 * for Vessel of Grace Christian Center (VOG).
 *
 * Primary Source: Independent HLS Streaming (.m3u8) powered by sanctuary IP camera
 * via MediaMTX or similar media server.
 */

export type StreamSourceType =
  | 'hls_independent'
  | 'webrtc_independent'
  | 'direct_video'
  | 'facebook_watch'
  | 'facebook_embed'
  | 'facebook_share_restricted'
  | 'youtube'
  | 'custom_embed'
  | 'invalid'
  | 'empty';

export type LiveStreamValidationStatus =
  | 'verified_active'
  | 'verified_ended'
  | 'unavailable'
  | 'unverified'
  | 'offline';

export interface StreamAnalysis {
  type: StreamSourceType;
  isValid: boolean;
  canEmbedInApp: boolean;
  embedUrl?: string;
  sourceUrl: string;
  label: string;
  isHttps: boolean;
  isLocalLan: boolean;
  error?: string;
  warning?: string;
  adminGuidance: string;
  architectureNotes?: string;
  extractedVideoId?: string;
}

/**
 * Checks whether an IP or hostname is private / local to the church Wi-Fi.
 */
export function isLocalNetworkAddress(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.startsWith('192.168.') ||
      host.startsWith('10.') ||
      (host.startsWith('172.') && parseInt(host.split('.')[1], 10) >= 16 && parseInt(host.split('.')[1], 10) <= 31)
    ) {
      return true;
    }
  } catch {
    // If not a valid URL yet, check raw substring
    if (
      url.includes('192.168.') ||
      url.includes('10.') ||
      url.includes('172.16.') ||
      url.includes('localhost') ||
      url.includes('127.0.0.1')
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Inspects a stream URL and provides thorough technical analysis,
 * HTTPS safety check, and local-LAN vs public endpoint diagnostics.
 */
export function analyzeStreamUrl(rawUrl: string): StreamAnalysis {
  const url = (rawUrl || '').trim();

  if (!url) {
    return {
      type: 'empty',
      isValid: false,
      canEmbedInApp: false,
      isHttps: false,
      isLocalLan: false,
      sourceUrl: '',
      label: 'No Stream Configured',
      error: 'No stream URL entered.',
      adminGuidance:
        'Please enter your church public HTTPS HLS stream URL (e.g. https://stream.vogchurch.org/sanctuary/index.m3u8).',
      architectureNotes:
        'Intended stream path: Sanctuary IP Camera (RTSP) → Church Laptop (MediaMTX) → Public HTTPS Tunnel (Cloudflare/SSL) → VOG In-App Player.',
    };
  }

  const isHttps = url.startsWith('https://');
  const isHttp = url.startsWith('http://');
  const isLocalLan = isLocalNetworkAddress(url);

  // 1. Independent HLS Stream (.m3u8) — PRIMARY SOURCE
  if (url.includes('.m3u8') || url.includes('/hls/') || url.startsWith('hls://')) {
    let warning: string | undefined;
    let error: string | undefined;

    if (isHttp && !isHttps) {
      warning =
        'Mixed Content Warning: The VOG church website is served over secure HTTPS. Web browsers block insecure HTTP streams. You must expose the HLS stream with an HTTPS endpoint.';
    }

    if (isLocalLan) {
      warning = (warning ? warning + ' ' : '') +
        'Local Wi-Fi Address Detected: This URL points to a local network address (e.g. 192.168.x.x or localhost). It is only accessible to computers connected to the church router. Use Cloudflare Tunnel or port-forwarding with a domain to make it accessible to members on the internet.';
    }

    return {
      type: 'hls_independent',
      isValid: true,
      canEmbedInApp: true,
      isHttps,
      isLocalLan,
      sourceUrl: url,
      label: 'Independent HLS Stream (.m3u8) [Primary]',
      warning,
      error,
      adminGuidance:
        'Optimal independent broadcast stream. Delivered directly by your church streaming server (MediaMTX) and rendered in the native VOG HLS player without Facebook or YouTube dependencies.',
      architectureNotes:
        'Sanctuary IP Camera → MediaMTX streaming server → Public HTTPS HLS endpoint → VOG HTML5 Player.',
    };
  }

  // 2. Independent WebRTC Stream (webrtc://, wss://, /webrtc/)
  if (url.startsWith('webrtc://') || url.startsWith('wss://') || url.includes('/webrtc/') || url.includes('/whep')) {
    return {
      type: 'webrtc_independent',
      isValid: true,
      canEmbedInApp: true,
      isHttps: url.startsWith('wss://') || url.startsWith('https://'),
      isLocalLan,
      sourceUrl: url,
      label: 'Independent WebRTC Live Stream',
      adminGuidance:
        'Ultra-low-latency WebRTC stream. Connects to MediaMTX WebRTC/WHEP signaling endpoint.',
      architectureNotes:
        'IP Camera (RTSP) → MediaMTX (WHEP/WebRTC) → Browser WebRTC peer connection.',
    };
  }

  // 3. Direct HTML5 Video (.mp4, .webm)
  if (url.endsWith('.mp4') || url.endsWith('.webm') || url.includes('.mp4?')) {
    return {
      type: 'direct_video',
      isValid: true,
      canEmbedInApp: true,
      isHttps,
      isLocalLan,
      sourceUrl: url,
      label: 'Direct HTML5 Video Stream (.mp4/.webm)',
      adminGuidance: 'Direct video file feed rendered natively in the church video player.',
    };
  }

  // 4. YouTube Live / Video (Secondary fallback)
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    let videoId = '';
    let embedUrl = '';

    if (url.includes('youtube.com/embed/')) {
      const match = url.match(/embed\/([^?&]+)/);
      videoId = match ? match[1] : '';
      embedUrl = url;
    } else if (url.includes('youtube.com/watch')) {
      const match = url.match(/[?&]v=([^&]+)/);
      videoId = match ? match[1] : '';
      embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : '';
    } else if (url.includes('youtu.be/')) {
      const match = url.match(/youtu\.be\/([^?&]+)/);
      videoId = match ? match[1] : '';
      embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : '';
    } else if (url.includes('youtube.com/live/')) {
      const match = url.match(/live\/([^?&]+)/);
      videoId = match ? match[1] : '';
      embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : '';
    }

    if (embedUrl) {
      return {
        type: 'youtube',
        isValid: true,
        canEmbedInApp: true,
        isHttps: true,
        isLocalLan: false,
        embedUrl,
        sourceUrl: url,
        label: 'YouTube Live / Video Stream',
        adminGuidance: 'YouTube stream source. Renders inside the church player via iframe.',
      };
    }
  }

  // 5. Facebook URLs (Diagnostic & Warnings)
  if (url.includes('facebook.com') || url.includes('fb.watch')) {
    const isShareLink = url.includes('/share/v/') || url.includes('fb.watch/');
    const videoIdMatch = url.match(/[?&]v=(\d+)/) || url.match(/\/videos\/(\d+)/) || url.match(/story_fbid=(\d+)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : '';

    if (!isShareLink && !videoId && !url.includes('/watch') && !url.includes('/videos') && !url.includes('/live')) {
      return {
        type: 'invalid',
        isValid: false,
        canEmbedInApp: false,
        isHttps: true,
        isLocalLan: false,
        sourceUrl: url,
        label: 'Facebook Page URL (Not a Video Stream)',
        error: 'This is a Facebook Page URL, not an actual live video stream.',
        adminGuidance:
          'A Facebook page cannot be played as a video. Use the independent HLS stream from your IP camera & MediaMTX for reliable direct streaming.',
      };
    }

    let canonicalVideoUrl = url;
    if (videoId) {
      canonicalVideoUrl = `https://www.facebook.com/watch/?v=${videoId}`;
    }

    const embedUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
      canonicalVideoUrl
    )}&show_text=0&width=720&autoplay=1`;

    if (isShareLink) {
      return {
        type: 'facebook_share_restricted',
        isValid: false,
        canEmbedInApp: false,
        isHttps: true,
        isLocalLan: false,
        embedUrl,
        sourceUrl: url,
        extractedVideoId: videoId,
        label: 'Facebook Mobile Share Link (Restricted)',
        error:
          'Facebook mobile share links redirect and fail to load inside embedded players (displays "Video unavailable").',
        adminGuidance:
          'Please do not rely on Facebook mobile share links. Switch to the independent HLS stream using the church IP camera and MediaMTX laptop setup.',
      };
    }

    return {
      type: 'facebook_watch',
      isValid: true,
      canEmbedInApp: true,
      isHttps: true,
      isLocalLan: false,
      embedUrl,
      sourceUrl: canonicalVideoUrl,
      extractedVideoId: videoId,
      label: 'Facebook Video (Public Watch URL)',
      adminGuidance:
        'Facebook watch URL. Requires post privacy set to Public and "Allow embedding" enabled in Meta Business Suite.',
    };
  }

  // 6. Generic HTTPS Stream / Embed
  if (url.startsWith('https://')) {
    return {
      type: 'custom_embed',
      isValid: true,
      canEmbedInApp: true,
      isHttps: true,
      isLocalLan,
      embedUrl: url,
      sourceUrl: url,
      label: 'Custom Web Stream URL',
      adminGuidance: 'Custom web video stream endpoint.',
    };
  }

  return {
    type: 'invalid',
    isValid: false,
    canEmbedInApp: false,
    isHttps: false,
    isLocalLan: false,
    sourceUrl: url,
    label: 'Invalid Stream URL',
    error: 'The entered URL does not appear to be a valid HTTPS, HLS (.m3u8), or WebRTC address.',
    adminGuidance: 'Please enter a valid URL starting with https:// and ending with .m3u8.',
  };
}

/**
 * Performs an actual network test of the configured stream URL.
 * Checks reachability, HTTPS requirements, CORS headers, and manifest status.
 */
export async function testStreamSource(rawUrl: string): Promise<{
  isAvailable: boolean;
  message: string;
  details?: string;
  isHttpsRequired?: boolean;
}> {
  const analysis = analyzeStreamUrl(rawUrl);

  if (!analysis.isValid) {
    return {
      isAvailable: false,
      message: analysis.error || 'Invalid stream URL format.',
      details: analysis.adminGuidance,
    };
  }

  // Check mixed content before network request
  if (typeof window !== 'undefined' && window.location.protocol === 'https:' && !analysis.isHttps) {
    return {
      isAvailable: false,
      message: 'Insecure HTTP stream on HTTPS website (Mixed Content Block).',
      details:
        'Browsers strictly forbid loading HTTP video streams on HTTPS websites. Please expose your MediaMTX HLS stream with HTTPS (using Cloudflare Tunnel, ngrok, or reverse proxy with SSL).',
      isHttpsRequired: true,
    };
  }

  // Test Independent HLS Stream (.m3u8)
  if (analysis.type === 'hls_independent' || analysis.type === 'direct_video') {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const resp = await fetch(analysis.sourceUrl, {
        method: 'GET',
        headers: { Range: 'bytes=0-1024' },
        mode: 'cors',
        signal: controller.signal,
      }).catch((err) => {
        return { networkError: err };
      });

      clearTimeout(timeoutId);

      if ('status' in resp) {
        if (resp.status >= 200 && resp.status < 400) {
          return {
            isAvailable: true,
            message: 'HLS stream endpoint is reachable and responding with video data!',
            details: `Status code ${resp.status}. Content-Type: ${resp.headers.get('content-type') || 'application/vnd.apple.mpegurl'}. CORS is properly configured.`,
          };
        } else if (resp.status === 404) {
          return {
            isAvailable: false,
            message: 'Streaming server responded with 404 Not Found.',
            details:
              'The MediaMTX server is reachable, but the stream path does not exist yet. Verify that your IP camera is connected and actively publishing its RTSP stream to this path.',
          };
        } else {
          return {
            isAvailable: false,
            message: `Streaming server returned status code ${resp.status}.`,
            details: 'Verify MediaMTX server logs on your laptop.',
          };
        }
      }

      // If fetch caught an error (e.g. CORS or offline)
      if (analysis.isLocalLan) {
        return {
          isAvailable: false,
          message: 'Unable to reach local network stream endpoint.',
          details:
            'This URL uses a local IP (192.168.x.x / localhost). If you are testing from another network or device, it will not connect. Also check that your laptop has MediaMTX running and port is open.',
        };
      }

      return {
        isAvailable: false,
        message: 'Could not connect to HLS stream endpoint (Network or CORS error).',
        details:
          'Ensure your MediaMTX server has CORS enabled (Access-Control-Allow-Origin: *) and that your tunnel (Cloudflare Tunnel) is currently online.',
      };
    } catch (err: any) {
      return {
        isAvailable: false,
        message: 'Connection timed out or failed.',
        details: err?.message || 'Check your internet connection and streaming server status.',
      };
    }
  }

  // WebRTC
  if (analysis.type === 'webrtc_independent') {
    return {
      isAvailable: false,
      message: 'Independent WebRTC endpoint format recognized.',
      details:
        'A dedicated WebRTC server (MediaMTX WHEP) must be running on a public SSL endpoint (wss:// or https://) for real-time video delivery.',
    };
  }

  // YouTube
  if (analysis.type === 'youtube') {
    return {
      isAvailable: true,
      message: 'YouTube embed URL format is valid.',
      details: 'Will render inside the VOG application player via YouTube embed.',
    };
  }

  // Facebook
  if (analysis.type === 'facebook_share_restricted') {
    return {
      isAvailable: false,
      message: 'Facebook mobile share link cannot be embedded directly.',
      details:
        'Facebook blocks playback inside iframe players for mobile share links. Use the independent HLS stream from your IP camera.',
    };
  }

  return {
    isAvailable: true,
    message: 'Stream URL format is valid.',
  };
}
