// Minimal offline cache — core routes + fonts.
const CACHE = 'pfw-v1';
const CORE = ['/', '/home', '/play', '/missions', '/puzzles', '/teacher', '/favicon.svg', '/manifest.webmanifest'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE).catch(() => {})));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // Cache-first for same-origin and Google Fonts.
  if (u.origin === self.location.origin || u.hostname.endsWith('gstatic.com') || u.hostname.endsWith('googleapis.com')) {
    e.respondWith(
      caches.match(e.request).then((hit) =>
        hit ||
        fetch(e.request).then((r) => {
          const copy = r.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
          return r;
        }).catch(() => caches.match('/')),
      ),
    );
  }
});
