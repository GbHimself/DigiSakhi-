/* ============================================
   DigiSakhi Service Worker
   Caches core pages for offline access
   ============================================ */

const CACHE_NAME = 'digisakhi-v1';

/* Core files to cache on install */
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/mobile-usage.html',
  '/online-safety.html',
  '/social-media.html',
  '/real-incidents.html',
  '/ai-safety.html',
  '/resources.html',
  '/file-complaint.html',
  '/feedback.html',
  '/quick-quiz.html',
  '/404.html',
  '/css/styles.css',
  '/js/main.js',
  '/js/translate.js',
  '/scam-alerts.json',
  '/images/og-preview.svg'
];

/* Install — cache core assets */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CORE_ASSETS);
    })
  );
  self.skipWaiting();
});

/* Activate — clean up old caches */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

/* Fetch — serve from cache, fall back to network */
self.addEventListener('fetch', event => {
  /* Only handle GET requests for same-origin resources */
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  /* Skip Google Translate and external CDN requests */
  if (event.request.url.includes('googleapis.com') ||
      event.request.url.includes('cloudflare') ||
      event.request.url.includes('fonts.google') ||
      event.request.url.includes('formspree') ||
      event.request.url.includes('docs.google')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        /* Cache successful responses */
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        /* Offline fallback for HTML pages */
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/offline.html') || caches.match('/index.html');
        }
      });
    })
  );
});
