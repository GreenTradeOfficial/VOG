import { pollStreamEndpoint, checkFirestoreLiveConfig } from './liveStreamService';
import { LiveStreamConfig } from '../types';

export interface StreamMonitorStatus {
  isOnline: boolean;
  isReceivingData: boolean;
  statusCode?: number;
  message: string;
  details?: string;
  consecutiveFailures: number;
  isUnreachableOr404: boolean;
  lastCheckedAt: Date;
  offlineReason?: '404_not_found' | 'network_unreachable' | 'cors_blocked' | 'stream_ended' | 'empty_url' | 'none';
}

export interface StreamMonitorCallbacks {
  onStatusChange?: (status: StreamMonitorStatus) => void;
  onStreamUnreachable?: (status: StreamMonitorStatus) => void;
  onStreamRestored?: (status: StreamMonitorStatus) => void;
}

export interface StreamMonitorOptions {
  checkIntervalMs?: number; // default: 12000ms (12 seconds)
  failureThreshold?: number; // default: 2 consecutive failures to switch to offline
  timeoutMs?: number; // default: 5000ms
}

/**
 * Service Monitor that continuously monitors the health of an HLS/media stream.
 * Automatically switches the player state to offline placeholder when the stream
 * becomes unreachable, returns a 404, or fails to receive video segments.
 */
export class StreamServiceMonitor {
  private streamUrl: string = '';
  private isBroadcastingEnabled: boolean = false;
  private intervalId: number | null = null;
  private isChecking: boolean = false;
  private consecutiveFailures: number = 0;
  private currentStatus: StreamMonitorStatus;
  private callbacks: StreamMonitorCallbacks;
  private options: Required<StreamMonitorOptions>;

  constructor(callbacks: StreamMonitorCallbacks = {}, options: StreamMonitorOptions = {}) {
    this.callbacks = callbacks;
    this.options = {
      checkIntervalMs: options.checkIntervalMs ?? 12000,
      failureThreshold: options.failureThreshold ?? 2,
      timeoutMs: options.timeoutMs ?? 5000,
    };

    this.currentStatus = {
      isOnline: false,
      isReceivingData: false,
      consecutiveFailures: 0,
      isUnreachableOr404: false,
      lastCheckedAt: new Date(),
      offlineReason: 'none',
      message: 'Stream monitor initialized.',
    };
  }

  /**
   * Updates the target stream configuration to monitor.
   */
  public updateConfig(streamUrl: string, isBroadcastingEnabled: boolean) {
    const trimmedUrl = streamUrl ? streamUrl.trim() : '';
    const urlChanged = this.streamUrl !== trimmedUrl;
    const broadcastChanged = this.isBroadcastingEnabled !== isBroadcastingEnabled;

    this.streamUrl = trimmedUrl;
    this.isBroadcastingEnabled = isBroadcastingEnabled;

    if (urlChanged || broadcastChanged) {
      this.consecutiveFailures = 0;
      if (this.isBroadcastingEnabled && this.streamUrl) {
        // Immediate check on configuration change
        this.checkNow();
      } else {
        // Broadcast disabled or URL empty -> immediately reflect offline
        this.updateStatus({
          isOnline: false,
          isReceivingData: false,
          isUnreachableOr404: false,
          consecutiveFailures: 0,
          offlineReason: this.streamUrl ? 'none' : 'empty_url',
          message: this.streamUrl ? 'Broadcast is currently disabled.' : 'No stream URL configured.',
          lastCheckedAt: new Date(),
        });
      }
    }
  }

  /**
   * Starts periodic monitoring.
   */
  public start() {
    if (this.intervalId !== null) return;

    // Run first check immediately if configured
    if (this.isBroadcastingEnabled && this.streamUrl) {
      this.checkNow();
    }

    this.intervalId = window.setInterval(() => {
      if (this.isBroadcastingEnabled && this.streamUrl) {
        this.checkNow();
      }
    }, this.options.checkIntervalMs);
  }

  /**
   * Stops periodic monitoring.
   */
  public stop() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Returns current monitoring status.
   */
  public getStatus(): StreamMonitorStatus {
    return this.currentStatus;
  }

  /**
   * Manually triggers an immediate health check of the stream.
   */
  public async checkNow(): Promise<StreamMonitorStatus> {
    if (this.isChecking) return this.currentStatus;
    if (!this.streamUrl || !this.isBroadcastingEnabled) {
      const offlineStatus: StreamMonitorStatus = {
        isOnline: false,
        isReceivingData: false,
        consecutiveFailures: 0,
        isUnreachableOr404: false,
        lastCheckedAt: new Date(),
        offlineReason: !this.streamUrl ? 'empty_url' : 'none',
        message: !this.streamUrl ? 'No stream URL configured.' : 'Broadcast is currently disabled.',
      };
      this.updateStatus(offlineStatus);
      return offlineStatus;
    }

    this.isChecking = true;

    try {
      const poll = await pollStreamEndpoint(this.streamUrl, this.options.timeoutMs);
      const is404 = poll.statusCode === 404;
      const isUnreachable = !poll.isReceivingData;

      if (poll.isReceivingData) {
        // Stream is healthy & receiving data
        const wasFailing = this.consecutiveFailures >= this.options.failureThreshold;
        this.consecutiveFailures = 0;

        const onlineStatus: StreamMonitorStatus = {
          isOnline: true,
          isReceivingData: true,
          statusCode: poll.statusCode ?? 200,
          consecutiveFailures: 0,
          isUnreachableOr404: false,
          lastCheckedAt: new Date(),
          offlineReason: 'none',
          message: poll.message,
          details: poll.details,
        };

        this.updateStatus(onlineStatus);

        if (wasFailing) {
          this.callbacks.onStreamRestored?.(onlineStatus);
        }

        return onlineStatus;
      } else {
        // Failure or warning
        this.consecutiveFailures += 1;
        const reachedThreshold = this.consecutiveFailures >= this.options.failureThreshold;

        let offlineReason: StreamMonitorStatus['offlineReason'] = 'network_unreachable';
        if (is404) {
          offlineReason = '404_not_found';
        } else if (poll.message.includes('ended')) {
          offlineReason = 'stream_ended';
        } else if (poll.message.includes('CORS')) {
          offlineReason = 'cors_blocked';
        }

        const failureStatus: StreamMonitorStatus = {
          isOnline: !reachedThreshold,
          isReceivingData: false,
          statusCode: poll.statusCode,
          consecutiveFailures: this.consecutiveFailures,
          isUnreachableOr404: is404 || reachedThreshold,
          lastCheckedAt: new Date(),
          offlineReason,
          message: is404
            ? 'Stream server returned 404 (Path Not Found). The sanctuary broadcast is offline or camera disconnected.'
            : poll.message,
          details: poll.details,
        };

        this.updateStatus(failureStatus);

        if (reachedThreshold || is404) {
          this.callbacks.onStreamUnreachable?.(failureStatus);
        }

        return failureStatus;
      }
    } catch (err: any) {
      this.consecutiveFailures += 1;
      const reachedThreshold = this.consecutiveFailures >= this.options.failureThreshold;

      const errorStatus: StreamMonitorStatus = {
        isOnline: false,
        isReceivingData: false,
        consecutiveFailures: this.consecutiveFailures,
        isUnreachableOr404: true,
        lastCheckedAt: new Date(),
        offlineReason: 'network_unreachable',
        message: 'Could not connect to HLS stream server (Network unreachable).',
        details: err?.message || 'Server timeout or connection refused.',
      };

      this.updateStatus(errorStatus);
      if (reachedThreshold) {
        this.callbacks.onStreamUnreachable?.(errorStatus);
      }
      return errorStatus;
    } finally {
      this.isChecking = false;
    }
  }

  private updateStatus(newStatus: StreamMonitorStatus) {
    this.currentStatus = newStatus;
    this.callbacks.onStatusChange?.(newStatus);
  }
}
