/* ============================================
   DigiSakhi Service Worker
   Caches core pages for offline access
   ============================================ */

const CACHE_NAME = 'digisakhi-v2';

/* Core files to cache on install */
const CORE_ASSETS = [
  '/DigiSakhi-/',
  '/DigiSakhi-/index.html',
  '/DigiSakhi-/mobile-usage.html',
  '/DigiSakhi-/online-safety.html',
  '/DigiSakhi-/social-media.html',
  '/DigiSakhi-/real-incidents.html',
  '/DigiSakhi-/ai-safety.html',
  '/DigiSakhi-/resources.html',
  '/DigiSakhi-/file-complaint.html',
  '/DigiSakhi-/feedback.html',
  '/DigiSakhi-/quick-quiz.html',
  '/DigiSakhi-/404.html',
  '/DigiSakhi-/css/styles.css',
  '/DigiSakhi-/js/main.js',
  '/DigiSakhi-/js/translate.js',
  '/DigiSakhi-/scam-alerts.json',
  '/DigiSakhi-/images/og-preview.svg'
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
          return caches.match('/DigiSakhi-/offline.html') || caches.match('/DigiSakhi-/index.html');
        }
      });
    })
  );
});
