// v3 — network-first for HTML, skip Next's hashed chunks entirely.
// A stale SW from an earlier deploy was holding on to old chunk names
// after Vercel rebuilt; this version wipes old caches on install and
// never caches /_next/static/* so chunk mismatches can't happen again.
const CACHE = 'pfw-v3';
const APP_SHELL = ['/favicon.svg', '/manifest.webmanifest'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(APP_SHELL).catch(() => {})),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);

  // Never touch Next.js build artifacts — they have hashed names and
  // the network copy is always the source of truth after a redeploy.
  if (u.origin === self.location.origin && u.pathname.startsWith('/_next/')) {
    return; // let the browser handle it directly
  }

  // Network-first for HTML/same-origin so redeploys show up immediately;
  // fall back to cache if offline.
  if (u.origin === self.location.origin) {
    e.respondWith(
      fetch(e.request).then((r) => {
        const copy = r.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return r;
      }).catch(() => caches.match(e.request).then((m) => m || caches.match('/'))),
    );
    return;
  }

  // Cache-first for Google Fonts (they're versioned URLs).
  if (u.hostname.endsWith('gstatic.com') || u.hostname.endsWith('googleapis.com')) {
    e.respondWith(
      caches.match(e.request).then((hit) =>
        hit ||
        fetch(e.request).then((r) => {
          const copy = r.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
          return r;
        }),
      ),
    );
  }
});
