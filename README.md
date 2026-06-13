# Origen — Landing

Landing page de la app **Origen** (suscripción de orgánicos con trazabilidad, La Paz · Bolivia).
HTML/CSS/JS **vanilla**, sin frameworks ni paso de build. Refactorizada desde el artefacto
autocontenido `ORIGEN Landing 6.0.html` a una estructura mantenible y publicable, **sin cambiar
ni un píxel ni una interacción**.

## Cómo previsualizar

> ⚠️ **No funciona abriendo `index.html` con doble clic** (protocolo `file://`): el navegador
> bloquea la carga de las fuentes y de los iframes de las pantallas de la app. Hay que servirlo
> por HTTP. Es normal — cualquier web con fuentes propias e iframes necesita un servidor local.

**La forma más fácil (Windows, sin instalar nada):**
doble clic en **`Previsualizar Origen.bat`** → arranca el servidor y abre el navegador solo.
Para detenerlo, cierra la ventana de PowerShell que queda abierta.

Otras opciones (desde la raíz del proyecto):

```powershell
# Opción A — PowerShell, sin dependencias (lo que usa el .bat)
powershell -ExecutionPolicy Bypass -File serve.ps1   # http://localhost:8000/

# Opción B — Python 3
python -m http.server 8000

# Opción C — Node (npx, sin instalar nada)
npx serve .

# Opción D — VS Code: extensión "Live Server" → "Go Live"
```

Luego abre **http://localhost:8000/** (o el puerto que indique la herramienta).

> Para volver a ver la intro cinematográfica en cualquier momento: recarga la página
> (se reproduce en cada carga, salvo `prefers-reduced-motion`, que puede forzarse con `?intro=1`).

## Estructura

```
Origen Landing/
├── index.html              ← markup semántico, sin estilos ni scripts inline
├── README.md
├── Previsualizar Origen.bat ← doble clic: levanta el servidor y abre el navegador
├── serve.ps1               ← servidor estático local opcional (PowerShell, sin dependencias)
├── netlify.toml            ← config de despliegue en Netlify (sitio estático)
├── .gitignore  ·  .nojekyll
├── css/
│   ├── base.css            ← tokens (:root), reset y tipografía base
│   ├── fonts.css           ← @font-face self-hosted (Hanken Grotesk · Spectral · Spline Sans Mono)
│   ├── components.css      ← botones, badges, tarjeta de producto, iconos
│   ├── layout.css          ← container, sección, encabezados, variantes de fondo, reveal
│   ├── intro.css           ← overlay de la intro 3D
│   ├── header.css          ← nav superior
│   ├── hero.css            ← hero + maqueta de teléfono (device)
│   ├── trust.css           ← franja de marcas
│   ├── problema.css        ← sección "El problema"
│   ├── showcase.css        ← "Lo que cambia con Origen"
│   ├── funciona.css        ← "Cómo funciona" (pasos)
│   ├── features.css        ← "Features clave" (beneficios)
│   ├── productos.css       ← grilla de productos destacados
│   ├── rewards.css         ← "Rewards · Yapas · Referidos"
│   ├── filosofia.css       ← sección "Filosofía"
│   ├── testimonios.css     ← testimonios
│   ├── planes.css          ← planes / precios
│   ├── faq.css             ← preguntas frecuentes
│   ├── cta.css             ← CTA final
│   └── footer.css          ← pie de página
├── js/
│   ├── intro-arm.js        ← arma la intro antes del 1er pintado (síncrono en <head>)
│   ├── intro.js            ← motor 3D de la intro (Three.js)
│   ├── toast.js            ← avisos efímeros para los CTA [data-toast]
│   ├── screens.js          ← carga las maquetas en los iframes (screens/*.html)
│   ├── reveal.js           ← aparición de bloques al hacer scroll
│   ├── nav.js              ← desplazamiento suave de anclas internas
│   └── vendor/
│       └── three.js        ← Three.js (librería de la intro)
├── css/fonts.css → fonts/  ← 31 .woff2 self-hosted
├── img/                    ← logos, isotipo e imágenes de producto
├── assets/                 ← favicons, apple-touch-icon, site.webmanifest
└── screens/
    ├── inicio.html         ← maqueta "Inicio" mostrada en el teléfono del hero
    └── carrito.html        ← maqueta "Mi caja" mostrada en el showcase
```

## Orden de carga

- **CSS** (en `<head>`): `base.css` primero (tokens), luego el resto en el orden del DOM.
- **JS**: `intro-arm.js` síncrono en `<head>` (debe correr antes del primer pintado para evitar
  parpadeo); el resto con `defer` al final del `<body>`, con `vendor/three.js` antes de `intro.js`.

## Notas de la refactorización

- Las fuentes (antes vía Google Fonts) ahora son **self-hosted** en `/fonts`, con nombres
  legibles (`familia-peso-subset.woff2`, p. ej. `spectral-700-latin.woff2`; Hanken Grotesk y
  Spline Sans Mono son variables → un archivo por subset). Los `@font-face` usan rutas relativas.
- Las imágenes, los iconos, la librería Three.js y las dos pantallas de la app —que en el
  artefacto venían empaquetadas en base64/gzip— se extrajeron a archivos reales.
- Se eliminaron estilos muertos del artefacto (componentes del sistema de diseño que la landing
  no usa) y declaraciones inline redundantes (colores que ya coincidían con los tokens).
- Los valores de estilo inline que sí afectaban al render se trasladaron a clases CSS con el
  mismo valor computado, para mantener el resultado **idéntico**.
- El artefacto original se conserva intacto como `ORIGEN Landing 6.0.html` (referencia/backup).

## Despliegue (web real)

Es un sitio **estático**: no hay build. Sube el contenido de la carpeta tal cual.

**GitHub Pages**
1. Crea un repo y sube todo (el `.gitignore` ya excluye el artefacto de respaldo de 5 MB y `.claude/`).
2. Repo → *Settings → Pages* → *Source: Deploy from a branch* → rama `main`, carpeta `/ (root)`.
3. Espera 1–2 min; tu sitio queda en `https://<usuario>.github.io/<repo>/`.
   (El `.nojekyll` evita que GitHub procese el sitio con Jekyll.)

**Netlify** (o Drag & Drop)
- Conecta el repo: el `netlify.toml` ya fija `publish = "."` y sin comando de build.
- O entra a app.netlify.com → *Add new site → Deploy manually* → arrastra la carpeta del proyecto.

**Cualquier hosting estático** (Hostinger, Vercel, Cloudflare Pages, etc.): sube los archivos a la
raíz pública. Todas las rutas son relativas, así que funciona también en un subdirectorio.
