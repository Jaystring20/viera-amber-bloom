/* ═══════════════════════════════════════════════════════════════════════════
   Viera Amber — service worker

   Deliberately conservative. The site is content-led and updates often, so the
   worker never serves a stale page: HTML always goes to the network first and
   only falls back to cache when the device is genuinely offline. Fingerprinted
   build assets and images are cache-first, since their filenames change when
   their contents do.

   Bump CACHE_VERSION to retire every old cache on the next activation.
   ═══════════════════════════════════════════════════════════════════════════ */

const CACHE_VERSION = "va-v1";
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

  // ── Static assets: cache-first, filenames are content-hashed ─────────────
  if (/\.(?:js|css|woff2?|png|jpe?g|webp|svg|ico|mp4)$/i.test(url.pathname)) {
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
  }
});

/* Lets the page trigger an immediate update instead of waiting for all tabs
   to close. */
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
