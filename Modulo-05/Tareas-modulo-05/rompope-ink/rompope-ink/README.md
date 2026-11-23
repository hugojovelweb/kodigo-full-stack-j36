# Rompope Ink — Landing de estudio de tatuajes
### Hugo Jovel Web (Material inspirado en clase y futuro proyecto)

> Proyecto **Next.js 15** de la semana de **Vibe Coding** · Kodigo Full Stack Jr 36 · Actividad: despliegue en AWS.

## 🌐 Despliegue público (AWS Amplify)

**URL:**  ← URL real de Amplify

Comprobación del servidor y variables en producción: `<URL>/api/health`

**Futuro Proyecto Real** 

- A- Este proyecto nace como una actividad académica de la semana de Vibe Coding (Kodigo Full Stack Jr 36), pero está pensado desde el inicio como la base de un proyecto real en producción.

- B- La landing está inspirada en hechos reales: el trabajo de un tatuador nacional (un amigo cercano), para quien desarrollaré su sitio oficial. Por eso el contenido, la estructura y la identidad visual parten de un caso concreto y no de una maqueta genérica.

- C- Estado actual: demo funcional desplegada en AWS Amplify (URL arriba), con datos de ejemplo.
Siguiente fase: sustituir el contenido de muestra por el contenido real del estudio, ajustar dominio propio y publicar en producción como sitio oficial del tatuador.

Así, lo aprendido en clase (Next.js 15, despliegue en AWS) se convierte en un entregable real para un cliente.


## Qué incluye

- Landing con hero, sobre el artista, **galería con filtro por estilo** (Flash / Blackwork / Fine line), proceso y sección de cita.
- Botón «Agenda tu cita» (scroll) y enlace a **WhatsApp** prellenado con el estilo elegido.
- Ruta de servidor `/api/health` que lee las variables de entorno en runtime.
- **Docker**: `Dockerfile` multi-stage (usuario no root, healthcheck) y `docker-compose.yml`.
- Ilustraciones SVG de muestra (sin imágenes de terceros) y sello de footer.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · CSS propio · Docker · AWS Amplify Hosting (CI/CD desde GitHub)

## Requisitos

Node.js ≥ 20.9 (recomendado 22 LTS) · npm ≥ 10 · Git · Docker (opcional)

## Variables de entorno

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_STUDIO_NAME` | Nombre del estudio |
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp (solo dígitos con código de país). Valor de ejemplo por ahora |

Documentadas en [`.env.example`](./.env.example). En producción se configuran en **Amplify → Hosting → Environment variables**. Nunca se sube el `.env` real.

## Ejecutar en local

### Debian XFCE 13 (terminal)

```bash
cd Modulo-05/<ruta>/rompope-ink
cp .env.example .env.local
npm ci
npm run dev                 # http://localhost:3000
```

### Windows (PowerShell)

```powershell
cd Modulo-05\<ruta>\rompope-ink
Copy-Item .env.example .env.local
npm ci
npm run dev                 # http://localhost:3000
```

### Build de producción

```bash
npm run build && npm run start
```

## Docker

```bash
docker compose up --build   # http://localhost:3000  ·  salud: /api/health
docker compose down
```

## Despliegue en AWS Amplify

1. Repositorio público en GitHub (rama `main`). El proyecto vive en una subcarpeta, por eso el repo incluye `amplify.yml` en la raíz con `appRoot`.
2. Amplify → *Create new app* → GitHub → repositorio y rama `main`; marcar **«Mi aplicación es un monorepo»** con la ruta del proyecto.
3. Build con Node 22: `npm ci` y `npm run build` (ver `amplify.yml`).
4. Variables de entorno cargadas en la consola; el build las copia a `.env.production` para el runtime del servidor.
5. *Save and deploy* → estado **Deployed** → URL pública.

Amplify sirve el sitio a través de **Amazon CloudFront** (red de distribución global gestionada por AWS).

## Evidencias

| Evidencia | Archivo |
|---|---|
| Amplify con build exitoso (Deployed) | `docs/evidencia/01-amplify-deployed.png` |
| App funcionando en la URL pública | `docs/evidencia/02-app-en-produccion.png` |

Bitácora de construcción con IA: [`docs/vibe-coding.md`](./docs/vibe-coding.md)

---

Kodigo Full Stack Jr 36 · Next.js 15 · Docker · AWS Amplify  
© 2026 [**Hugo Jovel Web**](https://hugojovelweb.tech/). Todos los derechos reservados.
