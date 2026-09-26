// Offline cache so the games work without internet once loaded.
const CACHE = 'tiny-play-v1';
const FILES = [
  './', 'index.html', 'css/style.css', 'manifest.webmanifest', 'icons/icon.svg', 'js/engine.js',
  ...['bus', 'shapes', 'feed', 'balloons', 'size', 'count', 'quantity', 'memory', 'tidy', 'find', 'shadow'].map((g) => `js/games/${g}.js`),
];
self.addEventListener('install', (e) => e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', (e) => e.waitUntil(
  caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
));
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
    const copy = res.clone();
    caches.open(CACHE).then((c) => c.put(e.request, copy));
    return res;
  }).catch(() => hit)));
});
