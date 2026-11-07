# Instalación y ejecución — Debian 13 XFCE y Windows

## A. Debian 13 XFCE (entorno principal de trabajo)

### A.1 Verificar lo que ya tienes

```bash
docker --version
docker compose version        # debe ser Compose v2 (comando "docker compose", con espacio)
docker buildx version
docker context ls             # ¿cuál tiene el asterisco? (default = Engine, desktop-linux = Docker Desktop)
```

Si tienes **Docker Desktop y docker-ce a la vez**, usa uno solo por sesión. Los volúmenes e imágenes de un contexto
**no se ven** desde el otro:

```bash
docker context use default          # Docker Engine (recomendado para esta actividad)
# docker context use desktop-linux  # Docker Desktop
```

### A.2 Instalar Docker Engine (solo si falta) — método oficial para Debian

```bash
sudo apt update
sudo apt install -y ca-certificates curl git openssl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

sudo tee /etc/apt/sources.list.d/docker.sources >/dev/null <<EOT
Types: deb
URIs: https://download.docker.com/linux/debian
Suites: $(. /etc/os-release && echo "$VERSION_CODENAME")
Components: stable
Signed-By: /etc/apt/keyrings/docker.asc
EOT

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
sudo usermod -aG docker "$USER"      # luego CIERRA SESIÓN y vuelve a entrar (o: newgrp docker)
docker run --rm hello-world
```

### A.3 Preparar el repositorio con TUS proyectos del bootcamp

Los entregables piden el código del frontend y de la API en el repositorio. Impórtalos con el script (excluye
`node_modules`, `vendor`, `.env`, `.next` y cachés locales). Ojo con las **comillas**: tu ruta tiene un espacio
(`KODIGO /Full Stack Jr 36`).

```bash
cd ~/Projects                      # o donde prefieras
git clone https://github.com/<tu-usuario>/<tu-repo>.git ecommerce-docker-multistage
cd ecommerce-docker-multistage

API="/home/hugojovelweb/Projects/KODIGO /Full Stack Jr 36/kodigo-full-stack-j36/Modulo-03/Tareas-modulo-03/ecommerce-api-laravel12-HJovel-FSJ36"
FRONT="<ruta completa a tu carpeta del frontend e-commerce Next.js>"

./scripts/import-projects.sh "$API" "$FRONT"
```

Después, **agrega el sello a tu layout** (skill `sello-footer`; el script copia `site-footer.tsx` si no existía):

```tsx
// app/layout.tsx  (o src/app/layout.tsx)
import { SiteFooter } from "@/components/site-footer";
// ... dentro de <body>, después de {children}:
<SiteFooter stack="Kodigo Full Stack Jr 36 · Docker multi-stage · Next.js 16 · Laravel · MySQL 8" />
```

Verifica el alias `@/` en `tsconfig.json` (create-next-app lo trae); si no, usa la ruta relativa.
La API Laravel no lleva sello: la skill excluye entregables sin interfaz visual.

### A.4 Ajustes del código para Docker (una sola vez)

1. **Variable de la API en el frontend.** `docker-compose.yml` inyecta `BASE_URL=http://backend/api` al contenedor.
   Si tu código lee otro nombre (p. ej. `API_URL`), cámbialo en `.env` y en el servicio `frontend` de compose.
2. **Páginas que consultan la API al compilar.** `next build` ocurre *sin* la API levantada. Si el build falla por
   `fetch failed`/`ECONNREFUSED`, esas páginas deben ser dinámicas: `export const dynamic = "force-dynamic";` en el
   `page.tsx` afectado (o usar `cache: "no-store"`).
3. **`next.config`**: debe existir y `public/` también (el Dockerfile los copia). Con `next.config.ts`, si `next start`
   pidiera `typescript`, usa `next.config.mjs` o mueve `typescript` a `dependencies`.
4. **Laravel**: `composer.lock` versionado. Si Composer exige PHP ≥ 8.3, pon `PHP_VERSION=8.3` (u 8.4) en `.env`.
5. **Rutas `/api`**: Laravel expone la API bajo `/api`; por eso `BASE_URL` termina en `/api`.

### A.5 Levantar

```bash
./scripts/verify-env.sh
./scripts/gen-secrets.sh          # crea .env con secretos aleatorios
nano .env                          # opcional: STRIPE_* de PRUEBA (solo en tu .env local)
docker compose up -d --build
docker compose ps                  # espera (healthy)
docker compose exec backend php artisan db:seed --force    # primera vez, si tu API tiene seeders
./scripts/verify-project.sh        # checklist final antes de subir
```

Si usas `php artisan serve` (8000), `next dev` (3000) o MariaDB local en este equipo, apágalos o cambia
`FRONTEND_PORT` / `BACKEND_PORT` en `.env`. Con `docker-compose.dev.yml` MySQL sale por **3307** para no chocar con el 3306 local.

### A.6 Subir a GitHub (monorepo del bootcamp)

Esta actividad vive dentro del repositorio `kodigo-full-stack-j36`, en `Modulo-05/Tareas-modulo-05/ecommerce-docker-multistage/`.
Se agrega **solo esta carpeta** (no `git add .` desde la raíz, para no subir otros archivos de la carpeta de tareas):

```bash
cd "$(git rev-parse --show-toplevel)"
git status --short
git add Modulo-05/Tareas-modulo-05/ecommerce-docker-multistage
git status --short             # confirma que NO aparece .env, vendor/ ni node_modules/
git commit -m "feat(docker): imágenes multi-stage para Next.js, Laravel y MySQL con docker compose"
git push
```

GitHub bloquea el push si detecta una llave de Stripe: nunca pongas llaves reales en el README, `.env.example` ni en commits;
`./scripts/verify-project.sh` lo comprueba antes.

---

## B. Windows 10/11

### B.1 Opción recomendada: Docker Desktop + WSL2

1. PowerShell **como administrador**: `wsl --install -d Debian` y reinicia.
2. Instala **Docker Desktop** (https://www.docker.com/products/docker-desktop/) con el backend WSL2 activado.
3. Docker Desktop → *Settings → Resources → WSL integration* → activa tu distro Debian.
4. Abre la terminal **Debian (WSL)** y sigue la sección **A** completa (A.3 a A.6). Clona el repo **dentro** del
   sistema de archivos de WSL (`~/proyectos`), no en `C:\...`: el build es mucho más rápido y evita problemas de CRLF.

### B.2 Opción PowerShell nativa (sin WSL)

```powershell
winget install Git.Git
winget install Docker.DockerDesktop      # reinicia y abre Docker Desktop

git clone https://github.com/<tu-usuario>/<tu-repo>.git
cd <tu-repo>
.\scripts\import-projects.ps1 -Api "C:\ruta\api-laravel" -Front "C:\ruta\frontend-nextjs"
Copy-Item .env.example .env
notepad .env                              # reemplaza todos los CAMBIAR_*
docker compose up -d --build
docker compose ps
```

Si PowerShell bloquea el `.ps1`: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`.
Copia `snippets\site-footer.tsx` a `frontend\src\components\` y agrégalo al layout (ver A.3).

---

## Problemas frecuentes

| Síntoma | Causa y solución |
|---------|------------------|
| `permission denied ... /var/run/docker.sock` | Tu usuario no está en el grupo `docker`: `sudo usermod -aG docker $USER` y reinicia la sesión. |
| `port is already allocated` / `address already in use` | Otro proceso usa 3000/8000/3306. Cambia `FRONTEND_PORT`/`BACKEND_PORT` en `.env` o detén `artisan serve`/`next dev`. Ver quién: `ss -ltnp \| grep -E ':3000\|:8000'`. |
| Imágenes/volúmenes "desaparecieron" | Estás en otro contexto (Docker Desktop vs Engine): `docker context ls` y `docker context use default`. |
| `required variable APP_KEY is missing` | No existe `.env`: `./scripts/gen-secrets.sh` (en Windows: copia `.env.example` y rellénalo). |
| `exec /usr/local/bin/docker-entrypoint.sh: no such file or directory` | El script quedó con saltos CRLF (Windows). `.gitattributes` lo evita; arregla con `sed -i 's/\r$//' backend/docker/entrypoint.sh` y reconstruye. |
| El build de Next falla con `ECONNREFUSED`/`fetch failed` | Una página consulta la API durante `next build`. Hazla dinámica (ver A.4 punto 2). |
| `COPY ... next.config.*: no source files` | Tu proyecto no tiene `next.config.*`; elimina esa línea del Dockerfile. |
| `npm ci` falla: falta `package-lock.json` | Genera el lock (`npm install`) y haz commit; el Dockerfile exige instalaciones reproducibles. |
| `composer install` falla por versión de PHP | Sube `PHP_VERSION` en `.env` (8.3 / 8.4) y reconstruye: `docker compose build --no-cache backend`. |
| `backend` queda `unhealthy` | `docker compose logs backend`. Causas típicas: `APP_KEY` mal formada (debe empezar con `base64:`) o error en una migración. |
| `SQLSTATE[HY000] [2002]` / `Access denied` | Cambiaste las credenciales de MySQL **después** de crear el volumen. MySQL solo las toma con el volumen vacío: `docker compose down -v` (borra datos) y vuelve a levantar. |
| Login funciona pero la sesión no persiste | Cookie `Secure` con `NODE_ENV=production`: accede por `http://localhost:3000` (no por IP LAN). |
| Swagger no carga | Verifica que el paquete `l5-swagger` esté en `require` (no `require-dev`) y `RUN_SWAGGER_GENERATE=true`. |
| Disco lleno tras muchos builds | `docker builder prune` y `docker image prune`. |
