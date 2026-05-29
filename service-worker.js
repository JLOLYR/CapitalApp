// ============================================================
//  Service Worker — Capital Finanzas
//  Cache offline + estrategia network-first para HTML
// ============================================================

const CACHE_NAME = 'capital-v12';

// Detectar la base del scope para que funcione en cualquier subdirectorio
// (e.g. github.io/mi-repo/) sin tener que hardcodear el nombre del repo
const SCOPE = self.registration.scope;

// Recursos críticos (rutas relativas al scope)
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json'
];

// ============================================================
//  INSTALL — Cachear recursos esenciales
// ============================================================
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Cacheando recursos iniciales');
                // addAll falla si UNO solo falla; los agregamos individualmente para tolerar errores
                return Promise.all(
                    ASSETS_TO_CACHE.map(url =>
                        cache.add(url).catch(err =>
                            console.warn('[SW] No se pudo cachear:', url, err)
                        )
                    )
                );
            })
            .then(() => self.skipWaiting())
    );
});

// ============================================================
//  ACTIVATE — Limpiar caches antiguos
// ============================================================
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

// ============================================================
//  FETCH — Estrategia:
//    HTML/navegación → Network first, fallback a cache
//    Otros recursos (CDN, scripts) → Cache first, fallback a red
// ============================================================
self.addEventListener('fetch', event => {
    const req = event.request;

    // Solo manejamos GET
    if (req.method !== 'GET') return;

    // Navegación HTML: siempre intentar red primero (para que se actualice la app)
    if (req.mode === 'navigate' || req.destination === 'document') {
        event.respondWith(
            fetch(req)
                .then(res => {
                    // Cachear copia fresca
                    const copy = res.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
                    return res;
                })
                .catch(() =>
                    // Sin red → servir desde cache; si no existe, fallback al index
                    caches.match(req).then(cached =>
                        cached || caches.match('./index.html')
                    )
                )
        );
        return;
    }

    // Otros recursos: cache primero (rápido), red de respaldo
    event.respondWith(
        caches.match(req).then(cached => {
            if (cached) return cached;
            return fetch(req).then(res => {
                // Solo cacheamos respuestas válidas
                if (res && res.status === 200 && res.type !== 'opaque') {
                    const copy = res.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
                }
                return res;
            }).catch(() => {
                // Sin red y sin cache → fallar silenciosamente
                return new Response('', { status: 408, statusText: 'Sin conexión' });
            });
        })
    );
});
