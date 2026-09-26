// Offline cache so the games work without internet once loaded.
const CACHE = 'tiny-play-v4';
const FILES = [
  './', 'index.html', 'css/style.css', 'manifest.webmanifest', 'icons/icon.svg', 'js/engine.js',
  ...['bus', 'shapes', 'egg', 'feed', 'balloons', 'farm', 'size', 'potion', 'count', 'quantity', 'brush', 'memory', 'stickers', 'tidy', 'pattern', 'find', 'gifts', 'shadow', 'letters', 'pixel'].map((g) => `js/games/${g}.js`),
  ...['egg', 'potion', 'farm', 'brush', 'stickers', 'pixel', 'pattern', 'gifts', 'letters'].map((g) => `css/games/${g}.css`),
];
self.addEventListener('install', (e) => e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', (e) => e.waitUntil(
  caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
));
// Stale-while-revalidate: answer from cache instantly (works offline), refresh the cache in the background
// so new versions show up on the next launch.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.open(CACHE).then((cache) => cache.match(e.request).then((hit) => {
    const fresh = fetch(e.request).then((res) => {
      if (res.ok) cache.put(e.request, res.clone());
      return res;
    }).catch(() => hit);
    return hit || fresh;
  })));
});
