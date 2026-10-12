/* eslint-disable no-undef */
// Firebase Cloud Messaging Service Worker for Vessel of Grace Christian Center
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCARbiZT9NbxXwm2EkBh3t0IlrWfbk9Q7U",
  authDomain: "clear-pillar-52w8r.firebaseapp.com",
  projectId: "clear-pillar-52w8r",
  storageBucket: "clear-pillar-52w8r.firebasestorage.app",
  messagingSenderId: "294212335223",
  appId: "1:294212335223:web:f740f8db5142407791f872",
});

const messaging = firebase.messaging();

// Handle background notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Handle incoming background push notifications
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);
  const notificationTitle = payload.notification?.title || payload.data?.title || 'Vessel of Grace Christian Center';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'New church notification available.',
    icon: '/pwa-192x192.png',
    badge: '/favicon.svg',
    vibrate: [200, 100, 200],
    data: {
      url: payload.data?.url || '/',
      click_action: payload.data?.url || '/',
      timestamp: Date.now(),
    },
    actions: [
      { action: 'open', title: 'Open VOG App' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
