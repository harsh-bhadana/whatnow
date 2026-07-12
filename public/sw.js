self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', () => {
  // A minimal fetch listener is required for some browsers to trigger the PWA install prompt.
  // We don't cache anything offline right now to keep things simple.
});
