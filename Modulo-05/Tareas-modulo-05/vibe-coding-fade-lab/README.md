# Fade Lab · MVP de reservas para barberías, peluquerías y salones

Aplicación web **funcional** de reservas de citas con **Next.js 16 + TypeScript + Tailwind CSS 4 + Neon Postgres**.
Negocio y datos **ficticios**. Hecha con *Vibe Coding* para la actividad evaluada del bootcamp **Kodigo Full Stack Jr 36**
y diseñada como **semilla** de una micro app para barberías, peluquerías y salones.

- 🌐 **Producción:** `https://TU-PROYECTO.vercel.app`  ← _reemplaza con tu URL de Vercel_
- 🧠 **Proceso de Vibe Coding:** [`VIBE_CODING.md`](./VIBE_CODING.md)
- 🛠️ **Guía paso a paso (Neon, Debian, Windows, Vercel):** [`docs/GUIA-NEON-DEBIAN-WINDOWS.md`](./docs/GUIA-NEON-DEBIAN-WINDOWS.md)
- 📸 **Evidencias y manual de la micro app (capturas, Word y PDF):** [`evidencias/`](./evidencias/) · [PDF](./evidencias/Evidencias-Fade-Lab.pdf)

## Qué hace

El cliente elige **servicio → profesional → día y hora → datos** y la cita queda confirmada al instante.
La disponibilidad se calcula según el horario del negocio, la duración del servicio y las citas existentes de cada profesional.

## Rutas

| Ruta | Tipo | Descripción |
|---|---|---|
| `/` | Server Component | Inicio con datos de Neon |
| `/servicios` | Server Component | Catálogo con precio y duración |
| `/equipo` | Server Component | Profesionales |
| `/reservar` | Server + Client | Asistente de 4 pasos (`useState`, `useEffect`, loading y error UI) |
| `/reserva/[id]` | Server (ruta dinámica) | Comprobante de la cita + aviso por WhatsApp |
| `/contacto` | Server Component | Dirección, WhatsApp y horario |
| `GET /api/servicios` · `GET /api/profesionales` | Route Handler | Catálogo en JSON |
| `GET /api/disponibilidad` | Route Handler | `?servicioId&profesionalId&fecha` → horarios libres |
| `POST /api/citas` | Route Handler | Crea la cita (201 · 409 · 422 · 400 · 500) |
| `GET /api/citas` | Route Handler | Agenda del dueño (cabecera `x-admin-key`) |

También: `app/loading.tsx`, `app/error.tsx` (con reintento) y `app/not-found.tsx`.

## Decisiones de ingeniería (lo "senior")

- **Sin doble reserva, garantizado por la base de datos:** restricción `EXCLUDE USING gist` sobre `(profesional, rango de tiempo)`.
  Si dos personas reservan a la vez, solo una gana y la otra recibe `409`. Probado con reservas simultáneas.
- **Lógica de horarios como función pura** (`lib/slots.ts`) con pruebas (`npm test`).
- **Capa de repositorios** (`lib/repositories`) y único punto de acceso a datos (`lib/db.ts`) → cambiar de proveedor toca un solo archivo.
- **El servidor siempre revalida** la disponibilidad al reservar; el cliente no es de confianza.
- **SQL parametrizado** (`$1, $2…`) en todas las consultas. `DATABASE_URL` y `ADMIN_API_KEY` solo en servidor.
- **Zona horaria explícita** (America/El_Salvador) y precios en centavos (enteros).
- **Modelo multi-negocio desde el inicio:** `negocio` es la raíz (servicios, profesionales, horarios, citas) y el tipo
  (`barberia | peluqueria | salon`) cambia los textos sin tocar componentes.

## Cumplimiento de la actividad

- [x] Next.js 16 App Router · [x] TypeScript estricto · [x] Tailwind CSS
- [x] 6 rutas + API con Route Handlers · [x] Server y Client Components combinados
- [x] `useState` y `useEffect` · [x] Responsive (mobile-first) · [x] Loading UI y Error UI
- [x] `.env.local` + `.env.example` · [x] README y `VIBE_CODING.md`
- [x] Repo en GitHub con historial de commits (ver plan en la guía) · [x] URL de producción en Vercel
- [x] Carpeta de evidencias con capturas y manual ([`evidencias/`](./evidencias/))

## Instalación

Requisitos: **Node.js 20.9+** (recomendado 22 LTS), npm, Git y una cuenta de **Neon**.

### Debian XFCE 13

```bash
sudo apt update && sudo apt install -y git curl ca-certificates build-essential
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc && nvm install 22
cd vibe-coding-fade-lab            # carpeta del proyecto
npm install
cp .env.example .env.local   # pega tu DATABASE_URL de Neon
npm run db:setup       # crea tablas y datos de ejemplo
npm run dev            # http://localhost:3000
```

### Windows 10/11 (PowerShell)

```powershell
winget install OpenJS.NodeJS.LTS
winget install Git.Git
# cierra y abre PowerShell
cd vibe-coding-fade-lab
npm install
Copy-Item .env.example .env.local   # pega tu DATABASE_URL de Neon
npm run db:setup
npm run dev
```

> Si PowerShell bloquea npm: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.
> Crear el proyecto y la base en Neon: ver la guía.

| Comando | Qué hace |
|---|---|
| `npm run dev` | Desarrollo |
| `npm run build` / `npm start` | Producción |
| `npm run typecheck` | TypeScript |
| `npm test` | Pruebas del generador de horarios |
| `npm run db:setup` | Crea tablas + datos de ejemplo en Neon (idempotente) |

## Variables de entorno

| Variable | Uso |
|---|---|
| `DATABASE_URL` | Cadena de conexión de Neon (solo servidor) |
| `NEGOCIO_SLUG` | Negocio a mostrar (`fade-lab`) |
| `NEXT_PUBLIC_SITE_URL` | URL pública |
| `ADMIN_API_KEY` | Clave de `GET /api/citas` |

## Despliegue (Vercel)

Importa el repo en vercel.com, define **Root Directory** si el proyecto está en una subcarpeta, agrega las 4 variables y **Deploy**.
La base de datos de Neon es la misma (usa una rama `dev` de Neon para desarrollo si quieres separarla).

## Hoja de ruta hacia la micro app

| Fase | Contenido |
|---|---|
| **0 · Esta actividad** | Sitio público + reserva funcional con Neon |
| 1 | Login del dueño (cookies httpOnly), panel de agenda, cancelar/reprogramar |
| 2 | Recordatorios por WhatsApp, servicios por profesional, descansos y feriados |
| 3 | Multi-negocio (subdominios), planes de suscripción, pagos |

## Limitaciones conocidas

- Sin autenticación de clientes ni panel de administración (Fase 1). La agenda se consulta por API con clave.
- Sin límite de peticiones (rate limiting) en `POST /api/citas`: pendiente antes de producción real.
- Si el ID de `/reserva/[id]` no existe, la página muestra el 404 pero el código HTTP puede ser 200 (comportamiento de streaming de Next con `loading.tsx`); la página va con `noindex`.
- Datos, nombres, imágenes y teléfono son ficticios.

---

Sello de footer único en `components/site-footer.tsx`, visible en todas las páginas.
