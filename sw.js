/* Generated from scripts/sw.template.js by node scripts/build-pwa.mjs.
 * Staged verified installs: the active app stays unchanged until the user requests a restart.
 */
const BUILD = "74e9320cf72745d8";
const APP_VERSION = "1.0.0";
const ASSETS = [["index.html","e4c62a566398ce7e2ad485ddd38962f308a46a1c6f1b71724be5263cc44d4be8"],["pwa.js","435034746aac38e5c8d2fd34380836f9d6fc4e0e46684c7fd6c2f884b42d4942"],["manifest.webmanifest","4d317779a070e920a375676bd1859b981adde774d7782da7e740c77775db1ef8"],["icon-192.png","10d21c7d69f55e1eb6bcee6e1c68d769fdc6c10b0e9660dcf2fda53689385023"],["icon-512.png","6a83ab8a6fe27741c99f089eff2af551b76d305c74545a3c9285c6c0ebfb237b"],["data/books.json","c5c0eac4534d838d9f74aa437d17d01ebe21b786cf5e1046d9c5a2fc77dbb887"],["data/green-line-2.json","90a58fd9ae8f444bc020d3e6c5d72b01e0f15fd47234a7116e829a4d0b89e3d9"],["data/adv-lghthse-1.json","c7c79a4dc1d419534317633fd2957c69afdee705681bfe6fbfce8fba0e65a722"],["data/bumblebee-workbook-3.json","db601e0e86840798eead311bc9aa42c7a6a05ee359d2b75ed3113bb5a0a0b6b2"]];
const CACHE_PREFIX = 'vokabeltrainer-pwa-';
const CACHE = CACHE_PREFIX + BUILD;
const SHA_HEADER = 'x-vocab-sha256';

async function broadcast(data) {
  const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
  await Promise.all(clients.map((client) => client.postMessage(data)));
}
async function sha256(buffer) {
  const d = new Uint8Array(await crypto.subtle.digest('SHA-256', buffer));
  return Array.from(d, (v) => v.toString(16).padStart(2, '0')).join('');
}
function withHash(buffer, contentType, hash) {
  const headers = new Headers({ [SHA_HEADER]: hash });
  if (contentType) headers.set('content-type', contentType);
  return new Response(buffer, { status: 200, headers });
}
async function reuse(url, hash, oldCaches) {
  for (const cache of oldCaches) {
    const match = await cache.match(url);
    if (!match || match.headers.get(SHA_HEADER) !== hash) continue;
    const body = await match.arrayBuffer();
    if (await sha256(body) === hash) return withHash(body, match.headers.get('content-type'), hash);
  }
  return null;
}
async function download(url, hash) {
  // A stale CDN response must never be allowed to produce a mixed-version install.
  for (let attempt = 0; attempt < 2; attempt++) {
    const cacheBust = attempt ? `${url}${url.includes('?') ? '&' : '?'}build=${BUILD}` : url;
    const response = await fetch(cacheBust, { cache: 'reload' });
    if (!response.ok || response.type === 'opaque') throw new Error(`${url}: HTTP ${response.status}`);
    const body = await response.arrayBuffer();
    if (await sha256(body) === hash) return withHash(body, response.headers.get('content-type'), hash);
  }
  throw new Error(`${url}: Datei stimmt nicht mit dem Release überein`);
}
async function install() {
  const cache = await caches.open(CACHE);
  const previousNames = (await caches.keys()).filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE);
  const previous = await Promise.all(previousNames.map((key) => caches.open(key)));
  let done = 0;
  const queue = ASSETS.slice();
  await Promise.all(Array.from({ length: Math.min(queue.length, 3) }, async () => {
    while (queue.length) {
      const [path, hash] = queue.shift();
      const url = new URL(path, self.registration.scope).href;
      const cached = await cache.match(url);
      const valid = cached && cached.headers.get(SHA_HEADER) === hash && await sha256(await cached.clone().arrayBuffer()) === hash;
      const response = valid ? cached : (await reuse(url, hash, previous)) || (await download(url, hash));
      if (!valid) await cache.put(url, response);
      done++;
      await broadcast({ type: 'INSTALL_PROGRESS', build: BUILD, version: APP_VERSION, done, total: ASSETS.length });
    }
  }));
}
self.addEventListener('install', (event) => {
  event.waitUntil(install().catch(async (error) => {
    await caches.delete(CACHE);
    await broadcast({ type: 'INSTALL_FAILED', build: BUILD, error: String(error?.message || error) });
    throw error; // failed updates must not replace the working offline version
  }));
  // No skipWaiting here: the user explicitly restarts once all files are downloaded and verified.
});
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data?.type === 'GET_VERSION') event.source?.postMessage({ type: 'VERSION', build: BUILD, version: APP_VERSION });
});
self.addEventListener('activate', (event) => event.waitUntil((async () => {
  for (const name of await caches.keys()) {
    if (name.startsWith(CACHE_PREFIX) && name !== CACHE) await caches.delete(name);
  }
  await self.clients.claim();
})()));
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;
  // Versions are ALWAYS fetched from the network, never from an offline cache.
  if (url.pathname === new URL('version.json', self.registration.scope).pathname) {
    event.respondWith(fetch(request, { cache: 'no-store' }));
    return;
  }
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const pathname = url.pathname;
    const base = new URL(self.registration.scope).pathname;
    const relative = pathname.slice(base.length);
    const key = request.mode === 'navigate' ? new URL('index.html', self.registration.scope).href : new URL(relative, self.registration.scope).href;
    const cached = await cache.match(key);
    if (cached) return cached;
    try { return await fetch(request); }
    catch (err) {
      if (request.mode === 'navigate') {
        const appShell = await cache.match(new URL('index.html', self.registration.scope).href);
        if (appShell) return appShell;
      }
      throw err;
    }
  })());
});
