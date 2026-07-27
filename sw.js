/* ============================================================
   Reality Kisumu Hub — Service Worker
   ------------------------------------------------------------
   Three caches with three different strategies:

     shell   -> precached app files, cache-first
     runtime -> images + CDN assets, cache-first w/ revalidate
     data    -> Supabase reads, network-first (offline fallback)

   Previously a single cache was wiped on every activation and
   only same-origin responses were stored, so the CDN-hosted CSS
   and JS were never available offline.
   ============================================================ */

const VERSION = 'v5';
const SHELL_CACHE = `rk-shell-${VERSION}`;
const RUNTIME_CACHE = `rk-runtime-${VERSION}`;
const DATA_CACHE = `rk-data-${VERSION}`;
const CURRENT_CACHES = [SHELL_CACHE, RUNTIME_CACHE, DATA_CACHE];

const SHELL_ASSETS = [
    'index.html',
    'house.html',
    'liked.html',
    'listing.html',
    'login.html',
    'signup.html',
    'offline.html',
    'manifest.json',
    'assets/css/main.css',
    'assets/js/app.js',
    'assets/js/auth.js',
    'assets/js/supabase.js',
    'assets/js/pwa.js',
    'assets/js/forms.js',
    'images/icon-192.png',
    'images/icon-512.png',
    'images/apple-touch-icon.png',
    'images/favicon-32.png',
    'images/luxury.jpg',
    'images/u.jpg'
];

const CDN_HOSTS = ['cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'];

/* ---------------------------------------------------------
   Install — precache the shell so the very first offline
   visit works. addAll() is all-or-nothing, so each asset is
   fetched individually and a single 404 cannot abort install.
   --------------------------------------------------------- */
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(SHELL_CACHE).then((cache) =>
            Promise.all(
                SHELL_ASSETS.map((asset) =>
                    cache.add(new Request(asset, { cache: 'reload' })).catch(() => {
                        console.warn('[sw] could not precache', asset);
                    })
                )
            )
        ).then(() => self.skipWaiting())
    );
});

/* ---------------------------------------------------------
   Activate — drop only caches this version does not use.
   --------------------------------------------------------- */
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys
                    .filter((key) => key.startsWith('rk-') && !CURRENT_CACHES.includes(key))
                    .map((key) => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

/* Allows the page's "Refresh" button to activate a waiting worker. */
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

/* ---------------------------------------------------------
   Fetch routing
   --------------------------------------------------------- */
self.addEventListener('fetch', (event) => {
    const request = event.request;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

    // Page navigations: fresh content when possible, cached page when not.
    if (request.mode === 'navigate') {
        event.respondWith(handleNavigation(request));
        return;
    }

    // Supabase reads: fresh data preferred, last-known data when offline.
    if (url.hostname.endsWith('.supabase.co')) {
        if (url.pathname.startsWith('/rest/')) event.respondWith(networkFirst(request, DATA_CACHE));
        return; // realtime/auth traffic passes straight through
    }

    // Everything static: serve instantly from cache, refresh in background.
    if (url.origin === self.location.origin || CDN_HOSTS.includes(url.hostname)) {
        event.respondWith(staleWhileRevalidate(request, cacheForRequest(request)));
    }
});

function cacheForRequest(request) {
    const url = new URL(request.url);
    const isShell = url.origin === self.location.origin &&
        SHELL_ASSETS.some((asset) => url.pathname.endsWith(asset));
    return isShell ? SHELL_CACHE : RUNTIME_CACHE;
}

/* Only store responses we can actually replay. Opaque responses
   (no-cors) have status 0 and would poison the cache. */
function isCacheable(response) {
    return response && (response.status === 200 || response.type === 'opaque') && response.type !== 'error';
}

async function handleNavigation(request) {
    try {
        const fresh = await fetch(request);
        if (isCacheable(fresh)) {
            const cache = await caches.open(SHELL_CACHE);
            cache.put(request, fresh.clone());
        }
        return fresh;
    } catch (err) {
        const cached = await caches.match(request, { ignoreSearch: true });
        if (cached) return cached;
        const offline = await caches.match('offline.html');
        return offline || new Response('You are offline.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
        });
    }
}

async function networkFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    try {
        const fresh = await fetch(request);
        if (isCacheable(fresh)) cache.put(request, fresh.clone());
        return fresh;
    } catch (err) {
        const cached = await cache.match(request);
        if (cached) return cached;
        throw err;
    }
}

async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    const network = fetch(request)
        .then((response) => {
            if (isCacheable(response)) cache.put(request, response.clone());
            return response;
        })
        .catch(() => null);

    if (cached) return cached;

    const fresh = await network;
    if (fresh) return fresh;

    return new Response('', { status: 504, statusText: 'Offline' });
}
