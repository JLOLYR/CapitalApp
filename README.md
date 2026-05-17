# Capital — PWA Setup

## Estructura del repositorio

Sube estos archivos a la raíz del repositorio (o donde tengas el `index.html` actual):

```
tu-repo/
├── index.html
├── manifest.json
├── service-worker.js
└── icons/
    ├── icon-192.png
    ├── icon-512.png
    └── icon-maskable-512.png
```

## Por qué fallaba la PWA en GitHub Pages

GitHub Pages sirve los repositorios bajo una URL del tipo:
`https://tuusuario.github.io/nombre-del-repo/`

El problema más común es que el `manifest.json` usa rutas **absolutas** (`/`, `/index.html`),
que apuntan a la raíz del dominio (`tuusuario.github.io/`) y no a tu subdirectorio.

Cuando instalas la PWA, el sistema operativo usa `start_url` para abrirla. Si esa URL es
absoluta y errónea, el lanzador intenta cargar `tuusuario.github.io/index.html` (que no existe)
en vez de `tuusuario.github.io/nombre-del-repo/index.html`.

## Solución aplicada

Todas las rutas en `manifest.json` y `service-worker.js` son **relativas** (`./`):

- `start_url: "./index.html"` — funciona en cualquier subdirectorio
- `scope: "./"` — limita el SW al directorio actual
- Íconos: `"./icons/..."`
- Registro del SW: `navigator.serviceWorker.register('./service-worker.js', { scope: './' })`

## Pasos para activar correctamente

1. **Sube los archivos** a tu repo manteniendo la estructura.
2. **Activa GitHub Pages** en `Settings → Pages → Source: main branch / root`.
3. **Espera 1-2 minutos** a que se publique.
4. **Abre la página en Chrome móvil o Edge** y verifica:
   - Abre DevTools (en escritorio) → pestaña `Application` → `Manifest`
   - No debe haber errores rojos
   - En `Service Workers`: debe aparecer "activated and running"
5. **Antes de instalar de nuevo**, si ya habías instalado la versión anterior:
   - **Desinstala** la PWA antigua de tu dispositivo
   - En el navegador, abre DevTools → `Application` → `Storage` → `Clear site data`
   - Cierra y vuelve a abrir la pestaña
   - Recién ahí instala la PWA nuevamente

## Verificación rápida

Una vez instalada, deberías poder abrirla **sin conexión a internet** y seguir viendo
la aplicación cargada desde el cache. Si te dice "página no existe", revisa que:

- El `index.html` esté en la misma carpeta que `manifest.json` y `service-worker.js`
- El navegador puede acceder a `tuusuario.github.io/repo/manifest.json` directamente
- El navegador puede acceder a `tuusuario.github.io/repo/service-worker.js` directamente

## Actualizar la app después de cambios

Cada vez que modifiques `index.html`, incrementa el número en `service-worker.js`:

```js
const CACHE_NAME = 'capital-v2'; // sube el número
```

Esto fuerza a los dispositivos instalados a descargar la versión nueva.
