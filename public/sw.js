const CACHE_NAME = 'inshort-v2';
const OFFLINE_URL = '/offline';

// Only cache essential same-origin assets
const PRECACHE_URLS = [
    OFFLINE_URL,
    '/logo.svg'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(PRECACHE_URLS))
            .catch((err) => console.warn('[SW] Precache failed:', err))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // CRITICAL: Only handle same-origin requests
    // This prevents the SW from interfering with third-party scripts (FB, Google, etc.)
    if (url.origin !== self.location.origin) {
        return; // Let the browser handle external requests normally
    }

    // Only handle GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Skip API routes - they should always be fresh
    if (url.pathname.startsWith('/api/')) {
        return;
    }

    // Stale-While-Revalidate for same-origin GET requests
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request)
                .then((networkResponse) => {
                    // Only cache successful same-origin responses
                    if (networkResponse && networkResponse.status === 200) {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return networkResponse;
                })
                .catch(() => {
                    // Network failed - show offline page for navigation requests
                    if (event.request.mode === 'navigate') {
                        return caches.match(OFFLINE_URL);
                    }
                    return null;
                });

            return cachedResponse || fetchPromise;
        })
    );
});
