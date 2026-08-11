/* ═══════════════════════════════════════════════════════════════════════════
   Viera Amber — service worker

   Deliberately conservative. The site is content-led and updates often, so the
   worker never serves a stale page: HTML always goes to the network first and
   only falls back to cache when the device is genuinely offline.

   Two different asset strategies, split by whether the URL can actually
   change content without changing its filename:

   - Vite's own build output (/assets/*.js, *.css) is content-hashed — a
     changed file always gets a new URL — so those are safe to cache-first.

   - Everything else that matches an image/icon/video extension (favicons,
     the wordmark SVG, manifest icons, brand photography) lives in public/
     under a STABLE filename. A new deploy overwrites the same URL, so
     cache-first here was wrong: once a browser cached e.g. /favicon.ico or
     /viva-logo.svg once, it would keep serving those exact bytes forever —
     this is what the client was seeing as "this logo has refused to leave."
     These now use stale-while-revalidate: the cached copy still answers
     instantly, but every fetch also goes to the network in the background
     and overwrites the cache, so the NEXT load — not some indefinite future
     deploy — already has the update.

   Bump CACHE_VERSION to retire every old cache on the next activation. v2
   purged the logo/favicon bytes stuck under v1's old cache-first policy.
   Bumped again to v3 because the actual icon FILES (icon-512.png, icon-192,
   icon-64, apple-touch-icon, icon-maskable-512, favicon.ico) still had the
   old orange-chevron artwork baked in until now — v2 had already cached
   those wrong bytes under the new stale-while-revalidate policy, so without
   this bump the first hit after v2 would still show the old icon once more
   before quietly refreshing. v3 forces a clean break instead of an eventual
   one.
   ═══════════════════════════════════════════════════════════════════════════ */

const CACHE_VERSION = "va-v3";
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const ASSET_CACHE = `${CACHE_VERSION}-assets`;

/* Kept intentionally small — just enough to render something branded when the
   network is gone. Everything else is cached as it is actually used. */
const SHELL_ASSETS = [
  "/",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      // addAll rejects the whole install if any single request 404s, so add
      // them individually and tolerate misses.
      .then((cache) => Promise.allSettled(SHELL_ASSETS.map((a) => cache.add(a))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => !k.startsWith(CACHE_VERSION))
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Never touch cross-origin traffic: Paystack, Supabase, Google Fonts and
  // analytics must always hit the network and must never be served stale.
  if (url.origin !== self.location.origin) return;

  // ── Navigations: network-first, cache as offline fallback ────────────────
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(SHELL_CACHE).then((cache) => cache.put("/", copy));
          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || caches.match("/")),
        ),
    );
    return;
  }

  // ── Vite build output: cache-first, filenames are content-hashed ─────────
  if (/^\/assets\//.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            // Opaque/error responses are not worth persisting.
            if (!response || response.status !== 200) return response;
            const copy = response.clone();
            caches.open(ASSET_CACHE).then((cache) => cache.put(request, copy));
            return response;
          }),
      ),
    );
    return;
  }

  // ── Everything else static (public/ — favicons, logos, icons, brand
  // photography, video): stale-while-revalidate. Unlike /assets/, these
  // sit at stable filenames a redeploy can silently overwrite, so a pure
  // cache-first policy here would mean a changed logo/favicon never gets
  // picked up on a browser that already cached the old one. Serving the
  // cached copy immediately keeps the offline/instant-load benefit; the
  // parallel network fetch keeps the cache from going stale forever.
  if (/\.(?:js|css|woff2?|png|jpe?g|webp|svg|ico|mp4)$/i.test(url.pathname)) {
    event.respondWith(
      caches.open(ASSET_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          const network = fetch(request)
            .then((response) => {
              if (response && response.status === 200) {
                cache.put(request, response.clone());
              }
              return response;
            })
            .catch(() => cached);
          return cached || network;
        }),
      ),
    );
  }
});

/* Lets the page trigger an immediate update instead of waiting for all tabs
   to close. */
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
