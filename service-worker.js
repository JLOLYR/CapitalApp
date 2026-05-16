const CACHE_NAME = 'capital-v2'; // Cambia el v1 por v2 para forzar al navegador a actualizar
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './Capital192.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then((res) => res || fetch(e.request)));
});