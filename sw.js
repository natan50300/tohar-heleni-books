// Offline support. Scope is the folder this file is served from (the GitHub Pages base path).
const RUNTIME = 'runtime-v1';
const SCOPE = self.registration.scope;

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(RUNTIME).then((c) => c.add(SCOPE)).catch(() => {}));
});

self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  // The page itself and the book lists must stay fresh; images, fonts and code never change.
  const fresh = req.mode === 'navigate' || url.pathname.endsWith('.json');
  e.respondWith(fresh ? networkFirst(req) : cacheFirst(req));
});

async function put(req, res) {
  if (res.ok) {
    const cache = await caches.open(RUNTIME);
    cache.put(req, res.clone());
  }
  return res;
}

async function networkFirst(req) {
  try {
    // Skip the browser's own 10-minute copy, so a new version shows up at once.
    return await put(req, await fetch(req.url, { cache: 'no-store' }));
  } catch {
    return (await caches.match(req)) || (await caches.match(SCOPE)) || Response.error();
  }
}

async function cacheFirst(req) {
  return (await caches.match(req)) || put(req, await fetch(req));
}
