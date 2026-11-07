# 🛒 TiendaKodigo — Frontend E-commerce (Next.js 16 + Laravel 12 + Stripe)
# Alumno: Hugo Ernesto Jovel Hernández

Actividad evaluada · **Kodigo Full Stack Jr 36** · *Optimización Avanzada de Rendimiento: Dominio de Web Vitals y Mutaciones Asíncronas en el Servidor*

Frontend en **Next.js 16 (App Router) + TypeScript + Tailwind CSS v4** que consume la API REST de e-commerce (Laravel 12 + JWT + Swagger + Stripe) del Módulo 3. Flujo completo: **catálogo → detalle → registro/login → carrito → orden → pago → confirmación → historial**.

| Requisito de la actividad | Dónde está |
|---|---|
| Lecturas con **Server Components** (fetch en servidor) | `src/lib/data.ts`, `ProductGrid`, `OrdersList`, `productos/[id]/page.tsx` |
| Mutaciones con **Server Actions** | `src/app/actions/auth.ts` (login, registro, logout) · `src/app/actions/orders.ts` (crear orden + pago) |
| Token en **cookie httpOnly** | `src/lib/session.ts` + `src/proxy.ts` (middleware de Next 16) |
| `loading.tsx` en catálogo y checkout | `src/app/productos/loading.tsx`, `src/app/checkout/loading.tsx` (+ historial) |
| `error.tsx` por segmento | `src/app/error.tsx`, `productos/`, `checkout/`, `historial/` |
| **Suspense** en secciones pesadas | `ProductGrid` (home y catálogo), `OrdersList` (historial), resumen de orden (éxito) |
| `revalidatePath()` / `revalidateTag()` | `checkoutAction` y login/logout/registro |
| Carrito en estado local | `src/lib/cart-store.ts` (`useSyncExternalStore` + localStorage) |
| Lighthouse | `scripts/lighthouse.sh` y `docs/EVIDENCIAS.md` |

---

## 1. Requisitos

- **Node.js ≥ 20.9** (recomendado 22 LTS) y **npm**
- **Git**
- La **API Laravel 12** del Módulo 3 corriendo (por defecto en `http://localhost:8000/api`)
- (Solo para medir) Chromium o Chrome

## 2. Instalación y ejecución

### 🐧 Debian 13 XFCE (entorno principal)

```bash
# 1) Clonar (o entrar a la carpeta si ya la tienes)
git clone https:
cd ecommerce-frontend-nextjs-HJovel-FSJ36

# 2) Instalar TODO (git, curl, chromium, Node si hace falta, .env.local y npm install)
bash scripts/setup-debian.sh

# 3) Encender la API Laravel en OTRA terminal (carpeta de la API del Módulo 3)
#    php artisan serve          →  http://localhost:8000

# 4) Frontend en modo desarrollo
npm run dev                     # →  http://localhost:3000
```

Instalación manual equivalente:

```bash
sudo apt update && sudo apt install -y git curl chromium
node -v   # si es < 20.9 o no existe:  instala nvm y luego  nvm install 22
cp .env.example .env.local      # y revisa BASE_URL
npm install
npm run dev
```

> Si usas VS Code: abre la carpeta del proyecto y la terminal integrada (`Ctrl+ñ` / `` Ctrl+` ``) y ejecuta los mismos comandos.

### 🪟 Windows 10/11 (PowerShell)

```powershell
git clone https://github.com/<tu-usuario>/<tu-repo>.git
cd ecommerce-frontend-nextjs-HJovel-FSJ36

Set-ExecutionPolicy -Scope Process Bypass
.\scripts\setup-windows.ps1     # instala Node LTS y Git con winget, crea .env.local y npm install

npm run dev                     # →  http://localhost:3000
```

Manual: instala [Node.js LTS](https://nodejs.org) y [Git](https://git-scm.com), luego `copy .env.example .env.local` y `npm install`.

### Configuración del `.env`

```bash
cp .env.example .env.local        # Windows: copy .env.example .env.local
```

| Variable | Descripción | Ejemplo |
|---|---|---|
| `BASE_URL` | URL base de la API REST (con `/api`, sin `/` final). **Solo servidor**, no se expone al navegador. | `http://localhost:8000/api` |
| `STRIPE_PAYMENT_METHOD` | Método de pago de Stripe en **modo test** enviado al endpoint de pago. | `pm_card_visa` |
| `COOKIE_SECURE` | (opcional) fuerza el flag `Secure` de la cookie. | `false` |

> ⚠️ Nunca subas `.env.local` ni claves de Stripe al repositorio (GitHub *push protection* las bloquea). Este frontend **no necesita ninguna clave de Stripe**: el pago lo ejecuta la API.

### Producción local

```bash
npm run build
npm run start      # http://localhost:3000
```

### Sin tener la API a mano (opcional)

```bash
npm run mock-api   # API simulada en http://localhost:8000/api (solo desarrollo)
```

---

## 3. Contrato de la API (Swagger)

Los endpoints están centralizados en **`src/lib/config.ts` → `ENDPOINTS`**. Si tus rutas de Laravel difieren, cámbialas solo ahí.

| Método | Endpoint | Auth | Uso en el frontend |
|---|---|---|---|
| POST | `/auth/register` | – | Registro (`name, email, password, password_confirmation`) |
| POST | `/auth/login` | – | Login → token JWT (`access_token` o `token`) |
| POST | `/auth/logout` | Bearer | Cerrar sesión |
| GET | `/products?page=` | – | Catálogo público paginado |
| GET | `/products/{id}` | – | Detalle de producto |
| POST | `/orders` | Bearer | Crear orden `{ items: [{ product_id, quantity }] }` |
| GET | `/orders` | Bearer | Historial del usuario |
| GET | `/orders/{id}` | Bearer | Detalle (pantalla de confirmación) |
| POST | `/orders/{id}/pay` | Bearer | Pago Stripe `{ payment_method }` |

Los *normalizadores* de `src/lib/data.ts` aceptan variaciones habituales de Laravel (`{ data: [...] }`, `{ data: { data: [...] } }`, precios como string, `image_url`/`image`, `items`/`order_items`).

## 4. Rutas implementadas

| Ruta | Tipo | Acceso | Notas |
|---|---|---|---|
| `/` | Server | Público | Hero + destacados con Suspense |
| `/productos` | Server | Público | Catálogo paginado · `loading.tsx` · `error.tsx` · Suspense |
| `/productos/[id]` | Server | Público | Detalle · `notFound()` · metadata dinámica |
| `/login` · `/registro` | Server + Server Action | Solo invitados | Validación + errores de la API |
| `/carrito` | Client (estado local) | Público | Agregar/quitar/cambiar cantidad |
| `/checkout` | Server + Server Action | 🔒 Protegido | Crear orden + pagar · `loading.tsx` · `error.tsx` |
| `/checkout/exito?orden=ID` | Server | 🔒 Protegido | Confirmación de compra |
| `/historial` | Server | 🔒 Protegido | Órdenes del usuario · Suspense · `loading.tsx` · `error.tsx` |

## 5. Decisiones técnicas

**Seguridad**
- El JWT vive en una cookie `httpOnly` + `sameSite=lax` (+ `secure` en producción): JavaScript del navegador no puede leerla (mitiga robo por XSS). Nunca se guarda en `localStorage`.
- `BASE_URL` y el token solo existen en el servidor (`import "server-only"`).
- `src/proxy.ts` redirige a `/login?next=…` si falta la cookie; además `/checkout` y `/historial` verifican sesión en el propio Server Component (defensa en profundidad).
- El parámetro `next` se valida (`safeNext`) para evitar *open redirect*.
- El navegador envía solo `product_id` y `quantity`; **los precios y totales los calcula la API**.

**Rendimiento y Web Vitals**
- **LCP**: Server Components (HTML ya renderizado), imagen prioritaria (`fetchPriority="high"`) en las primeras tarjetas, fuentes del sistema (0 bytes de fuentes externas).
- **CLS**: `width/height` + `aspect-ratio` en imágenes y *skeletons* con las mismas dimensiones que el contenido final.
- **INP / TBT**: JavaScript de cliente mínimo (solo carrito, formularios y botones); lecturas y listas en servidor.
- **Streaming**: `Suspense` + `loading.tsx` muestran la estructura al instante mientras llega la API.
- **Caché**: catálogo público con `fetch(..., { next: { revalidate: 60, tags: ["products"] } })`; datos autenticados siempre `no-store` (nunca se mezclan entre usuarios).

**Mutaciones sin UI desactualizada**
- Tras pagar: `revalidateTag("products", "max")` (el stock cambió), `revalidatePath("/productos", "layout")` y `revalidatePath("/historial")`.
- Tras login/registro/logout: `revalidatePath("/", "layout")` para refrescar el header.
- Si la orden se crea pero el **pago falla**, se conserva el `orderId` y el botón pasa a **“Reintentar pago”** sin duplicar la orden.

## 6. Evidencias para la entrega

Guía paso a paso en [`docs/EVIDENCIAS.md`](docs/EVIDENCIAS.md): capturas de Swagger (`http://localhost:8000/api/documentation`), flujo completo de compra y reporte Lighthouse (`npm run lighthouse` o pestaña *Lighthouse* de Chrome DevTools).

## 7. Estructura

```
src/
├─ proxy.ts                  # protección de rutas (middleware de Next 16)
├─ app/
│  ├─ layout.tsx · page.tsx · error.tsx · not-found.tsx
│  ├─ actions/auth.ts · actions/orders.ts      # Server Actions
│  ├─ productos/ (page, loading, error, [id]/)
│  ├─ login/ · registro/ · carrito/
│  ├─ checkout/ (page, loading, error, exito/)
│  └─ historial/ (page, loading, error)
├─ components/                # Header, ProductGrid, CheckoutForm, OrdersList…
└─ lib/ (config, api, data, session, cart-store, format, types)
scripts/ (setup-debian.sh, setup-windows.ps1, lighthouse.sh, mock-api.mjs)
```

## 8. Solución de problemas

| Síntoma | Causa / solución |
|---|---|
| “No se pudo conectar con la API” | Enciende Laravel (`php artisan serve`) y revisa `BASE_URL` en `.env.local`. Reinicia `npm run dev` tras editar el `.env`. |
| Todo da 404 de la API | Falta el prefijo `/api` en `BASE_URL`, o tus rutas difieren: ajusta `ENDPOINTS`. |
| El pago falla | Revisa en Swagger el body de `/orders/{id}/pay` y ajusta `STRIPE_PAYMENT_METHOD` o `orders.ts`. |
| La sesión no persiste con `npm run start` | Pon `COOKIE_SECURE=false` en `.env.local`. |
| `EADDRINUSE :3000` | `npm run dev -- -p 3001` o libera el puerto (`fuser -k 3000/tcp`). |
| `node: command not found` (Debian) | Ejecuta `bash scripts/setup-debian.sh`. |
| Lighthouse no encuentra Chrome | `sudo apt install chromium` y `export CHROME_PATH=$(command -v chromium)`. |

---
Autor: **Hugo Jovel** · Kodigo Full Stack Jr 36 · Se usó IA como asistente (permitido por la actividad); el código fue revisado y probado.
