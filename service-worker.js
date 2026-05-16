const CACHE_NAME = 'capital-v3'; // Cambiar a v3 para forzar actualización

self.addEventListener('install', (e) => {
    self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});