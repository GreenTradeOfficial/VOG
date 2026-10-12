import { isSupported, getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { doc, setDoc, serverTimestamp, collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { app, db } from '../lib/firebase';
import { NotificationPreferences } from '../types';

let messagingInstance: Messaging | null = null;

/**
 * Checks if browser supports Firebase Cloud Messaging and Web Push Notifications
 */
export async function isFCMSupported(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!('Notification' in window)) return false;
  if (!('serviceWorker' in navigator)) return false;

  try {
    return await isSupported();
  } catch (err) {
    console.warn('FCM isSupported check returned false:', err);
    return false;
  }
}

/**
 * Gets the current browser Notification permission status
 */
export function getNotificationPermissionStatus(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Lazy initializes Firebase Messaging instance
 */
async function getMessagingClient(): Promise<Messaging | null> {
  if (messagingInstance) return messagingInstance;
  const supported = await isFCMSupported();
  if (!supported) return null;

  try {
    messagingInstance = getMessaging(app);
    return messagingInstance;
  } catch (err) {
    console.warn('Failed to initialize Firebase Messaging:', err);
    return null;
  }
}

/**
 * Requests browser push permission and retrieves the FCM registration token
 */
export async function registerPushNotifications(options?: {
  userId?: string | null;
  email?: string | null;
  preferences?: NotificationPreferences;
}): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return { success: false, error: 'Push notifications are not supported on this browser.' };
    }

    // Request user permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { success: false, error: 'Push notification permission was denied by user.' };
    }

    const messaging = await getMessagingClient();
    if (!messaging) {
      return { success: false, error: 'FCM messaging is not supported in this runtime environment.' };
    }

    // Register / obtain service worker registration for FCM
    let swReg: ServiceWorkerRegistration | undefined;
    if ('serviceWorker' in navigator) {
      try {
        swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/',
        });
      } catch (swErr) {
        console.warn('FCM service worker registration fallback:', swErr);
      }
    }

    // Get FCM Token
    const token = await getToken(messaging, {
      serviceWorkerRegistration: swReg,
    });

    if (!token) {
      return { success: false, error: 'No FCM registration token received.' };
    }

    // Persist token to Firestore for targeted push delivery
    const tokenDocId = token.replace(/[^a-zA-Z0-9_-]/g, '_').slice(-60) || 'web_token';
    const tokenRef = doc(db, 'fcm_tokens', tokenDocId);

    await setDoc(
      tokenRef,
      {
        token,
        userId: options?.userId || null,
        email: options?.email || null,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        platform: 'pwa-web',
        topics: {
          services: options?.preferences?.churchServices ?? true,
          announcements: options?.preferences?.specialEvents ?? true,
          devotionals: options?.preferences?.morningDevotion ?? true,
          dailyLift: options?.preferences?.dailyLift ?? true,
        },
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    // Also persist under user's private collection if signed in
    if (options?.userId) {
      const userTokenRef = doc(db, 'users', options.userId, 'fcm_tokens', tokenDocId);
      await setDoc(
        userTokenRef,
        {
          token,
          createdAt: serverTimestamp(),
          platform: 'pwa-web',
        },
        { merge: true }
      );
    }

    try {
      localStorage.setItem('vog_fcm_token', token);
      localStorage.setItem('vog_push_enabled', 'true');
    } catch {}

    return { success: true, token };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('Error registering FCM push token:', message);
    return { success: false, error: message };
  }
}

/**
 * Listens for foreground push messages while the app is actively open
 */
export function subscribeToForegroundFCM(
  onNotificationReceived: (payload: { title: string; body: string; url?: string; category?: string }) => void
): () => void {
  let unsubscribe: (() => void) | null = null;

  getMessagingClient().then((messaging) => {
    if (!messaging) return;
    try {
      unsubscribe = onMessage(messaging, (payload) => {
        const title = payload.notification?.title || payload.data?.title || 'Vessel of Grace';
        const body = payload.notification?.body || payload.data?.body || 'New church alert';
        const url = payload.data?.url || '/';
        const category = payload.data?.category || 'general';

        onNotificationReceived({ title, body, url, category });

        // If system permission is granted, also present native notification
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification(title, {
              body,
              icon: '/pwa-192x192.png',
              badge: '/favicon.svg',
            });
          } catch {
            // Some mobile browsers require serviceWorker showNotification
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.ready.then((reg) => {
                reg.showNotification(title, {
                  body,
                  icon: '/pwa-192x192.png',
                  badge: '/favicon.svg',
                });
              });
            }
          }
        }
      });
    } catch (err) {
      console.warn('Could not attach FCM foreground message listener:', err);
    }
  });

  return () => {
    if (unsubscribe) unsubscribe();
  };
}

export interface PushBroadcastRecord {
  id?: string;
  title: string;
  body: string;
  category: 'services' | 'announcements' | 'devotionals' | 'general';
  targetUrl?: string;
  senderEmail: string;
  sentAt: string;
}

/**
 * Administrative action to broadcast a notification to church members
 * Records to Firestore /push_broadcasts collection
 */
export async function broadcastChurchNotification(
  title: string,
  body: string,
  category: 'services' | 'announcements' | 'devotionals' | 'general',
  senderEmail: string,
  targetUrl: string = '/'
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const docRef = await addDoc(collection(db, 'push_broadcasts'), {
      title,
      body,
      category,
      senderEmail,
      targetUrl,
      sentAt: new Date().toISOString(),
      timestamp: serverTimestamp(),
    });

    // Also trigger native test notification locally if permissions allow
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`[VOG ${category.toUpperCase()}] ${title}`, {
          body,
          icon: '/pwa-192x192.png',
          badge: '/favicon.svg',
        });
      } catch (e) {
        console.log('Native notification fallback:', e);
      }
    }

    return { success: true, id: docRef.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Error broadcasting church notification:', message);
    return { success: false, error: message };
  }
}

/**
 * Fetches recent administrative push broadcasts
 */
export async function fetchRecentBroadcasts(): Promise<PushBroadcastRecord[]> {
  try {
    const q = query(collection(db, 'push_broadcasts'), orderBy('sentAt', 'desc'), limit(15));
    const snap = await getDocs(q);
    const results: PushBroadcastRecord[] = [];
    snap.forEach((d) => {
      results.push({ id: d.id, ...d.data() } as PushBroadcastRecord);
    });
    return results;
  } catch (err) {
    console.warn('Could not fetch broadcasts (using empty baseline):', err);
    return [];
  }
}
