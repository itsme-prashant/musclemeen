/* =====================================================================
   MuscularMen service worker – offline support
   · App shell: network-first (fresh updates), falls back to cache offline
   · Demo videos & images: cache-first, saved the first time they play;
     serves byte ranges so cached videos can seek
   · /api/* (coach, sync): always network
   Bump VERSION when shipping changes to force a refresh of the shell.
   ===================================================================== */
const VERSION = 'mm-shell-v3';
const MEDIA = 'tf-media-v1';
const SHELL = [
  './', 'index.html', 'js/foods.js', 'js/features.js', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'brand/logo-icon.svg', 'brand/apple-touch-icon.png',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js',
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    await Promise.all(SHELL.map(url => cache.add(new Request(url, url.startsWith('http') ? { mode: 'no-cors' } : {})).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key !== VERSION && key !== MEDIA) await caches.delete(key);
    await self.clients.claim();
  })());
});

/* Build a 206 response for a Range request from a full cached response */
async function ranged(request, response) {
  const range = request.headers.get('range');
  if (!range || response.status !== 200) return response;
  const buf = await response.arrayBuffer();
  const m = /bytes=(\d*)-(\d*)/.exec(range) || [];
  const size = buf.byteLength;
  const start = m[1] ? +m[1] : 0, end = m[2] ? Math.min(+m[2], size - 1) : size - 1;
  return new Response(buf.slice(start, end + 1), {
    status: 206,
    headers: { 'Content-Type': response.headers.get('Content-Type') || 'video/mp4', 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': String(end - start + 1), 'Accept-Ranges': 'bytes' },
  });
}

async function media(event) {
  const req = event.request, url = req.url.split('#')[0];
  const cache = await caches.open(MEDIA);
  const hit = await cache.match(url);
  if (hit) return ranged(req, hit);
  // Not cached yet: fetch the whole file once, store it, then serve (ranged if asked)
  try {
    const full = await fetch(url);
    if (full.ok && full.status === 200) {
      await cache.put(url, full.clone());
      return ranged(req, full);
    }
    return full;
  } catch (e) {
    return new Response('', { status: 504, statusText: 'Offline' });
  }
}

async function shell(event) {
  const cache = await caches.open(VERSION);
  try {
    const res = await fetch(event.request);
    if (res && (res.ok || res.type === 'opaque')) cache.put(event.request, res.clone()).catch(() => {});
    return res;
  } catch (e) {
    const hit = await cache.match(event.request, { ignoreSearch: true });
    if (hit) return hit;
    if (event.request.mode === 'navigate') return (await cache.match('index.html')) || Response.error();
    return Response.error();
  }
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin && url.pathname.includes('/api/')) return;            // network only
  if (url.origin === location.origin && /\/(videos|images)\//.test(url.pathname)) { event.respondWith(media(event)); return; }
  if (url.origin === location.origin || url.hostname.endsWith('cdnjs.cloudflare.com') || url.hostname.includes('fonts.g')) event.respondWith(shell(event));
});

/* Clicking the "rest over" notification brings the app back */
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    if (all.length) return all[0].focus();
    return self.clients.openWindow('./index.html#/today');
  })());
});
