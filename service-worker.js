const CACHE_NAME = 'simple-pwa-v1';
const FILES_TO_CACHE = [
    '/index.html',
    '/manifest.json',
    '/web-app-manifest-192x192.png',
    '/web-app-manifest-512x512.png',
    '/'
];


self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
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
        caches.match(event.request).then(response => {
            return response || fetch(event.request).catch(() => {
                // You can return a fallback page here if desired
                return new Response("You're offline. RIP.", {
                    headers: { 'Content-Type': 'text/plain' }
                });
            });
        })
    );
});