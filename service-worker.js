const CACHE_NAME = 'simple-pwa-v1111111111';
const FILES_TO_CACHE = [
    './index.html',
    './manifest.json',
    './web-app-manifest-192x192.png',
    './web-app-manifest-512x512.png',
    './script.js',
    './style.css',
    './'
];


self.addEventListener('install', event => {
    console.log('Service worker: install');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    console.log('Service worker: activate');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(name => {
                    if (name !== CACHE_NAME) {
                        return caches.delete(name);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            const fetchPromise = fetch(event.request).then(networkResponse => {
                const responseClone = networkResponse.clone();

                caches.open(CACHE_NAME).then(async cache => {
                    const oldResponse = await cache.match(event.request);

                    // Put the new response in the cache
                    cache.put(event.request, responseClone);

                    // Compare ETag headers if available
                    const oldETag = oldResponse?.headers.get('ETag');
                    const newETag = networkResponse.headers.get('ETag');

                    if (!oldResponse) {
                        console.log('[SW] No previous cache. Cached new response:', event.request.url);
                    } else if (oldETag && newETag && oldETag !== newETag) {
                        console.log('[SW] ETag changed. Cache updated:', event.request.url);
                    } else if (!oldETag || !newETag) {
                        console.log('[SW] Cached response updated (ETag not available):', event.request.url);
                    } else {
                        console.log('[SW] Cached response unchanged:', event.request.url);
                    }
                });

                return networkResponse;
            });

            console.log('[SW] Fetch:', event.request.url, cachedResponse ? 'Cache hit' : 'Cache miss');
            return cachedResponse || fetchPromise;
        })
    );
});
