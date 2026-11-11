# 🐳 Next.js + Docker — Contenerización de aplicaciones web
# Hugo Ernesto Jovel.

Actividad práctica individual · **Kodigo Full Stack Jr 36**

Aplicación **Next.js 16** (App Router, TypeScript, Tailwind CSS) contenerizada con **Docker** usando un **Dockerfile multi-stage**, para garantizar entornos de desarrollo **consistentes, aislados y portables**.

> La misma imagen se construye y se ejecuta igual en Debian, Windows (WSL 2) o cualquier servidor con Docker.

---

## 📁 Estructura del repositorio

```text
nextjs-docker-activity/
├── Dockerfile          # Build multi-stage (deps → builder → prod-deps → runner)
├── .dockerignore       # Archivos excluidos del contexto de build
├── README.md           # Este documento
├── package.json        # Scripts: dev, build, start, lint
├── next.config.ts
├── public/
└── src/
    ├── app/
    │   ├── layout.tsx            # Layout raíz (monta el footer una sola vez)
    │   ├── page.tsx              # Página principal
    │   └── api/health/route.ts   # Endpoint usado por el HEALTHCHECK
    └── components/
        ├── site-footer.tsx       # Sello de footer
        ├── current-year.tsx      # Año calculado dinámicamente
        └── runtime-info.tsx      # Hostname/Node del contenedor en ejecución
```

---

## ✅ Requisitos

| Herramienta | Versión | Para qué |
|---|---|---|
| Docker Engine (Linux) o Docker Desktop (Windows) | reciente | Construir y ejecutar el contenedor |
| Git | cualquiera | Clonar / subir el repositorio |
| Node.js | **≥ 20.9** (se recomienda 22 LTS) | Solo para desarrollo local y `create-next-app` (no hace falta para correr el contenedor) |

> **Sobre `node:18-alpine`:** la actividad lo recomienda, pero **Next.js 16 exige Node.js ≥ 20.9** y ya no soporta Node 18. Por eso el `Dockerfile` usa **`node:22-alpine`** (LTS). La versión es configurable con `--build-arg NODE_VERSION=...` (ver [Solución de problemas](#-solución-de-problemas)).

---

## 🐧 Opción A — Debian XFCE 13 (trixie)

### A.1 Instalar Git y Node.js (con nvm)

```bash
sudo apt update
sudo apt install -y git curl ca-certificates

# nvm (revisa la última versión en https://github.com/nvm-sh/nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

# Cierra y abre la terminal (o ejecuta):
source ~/.bashrc

nvm install 22
node -v   # debe mostrar v22.x
npm -v
```

### A.2 Instalar Docker Engine (repositorio oficial `apt`)

Debian 13 (trixie) es una versión soportada por Docker Engine.

```bash
# 1) Desinstalar paquetes no oficiales que puedan chocar (si no hay, apt avisa y no pasa nada)
sudo apt remove $(dpkg --get-selections docker.io docker-compose docker-doc podman-docker containerd runc | cut -f1)

# 2) Agregar la llave GPG oficial de Docker
sudo apt update
sudo apt install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# 3) Agregar el repositorio
sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/debian
Suites: $(. /etc/os-release && echo "$VERSION_CODENAME")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF

# 4) Instalar Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 5) Comprobar que el servicio está activo
sudo systemctl status docker
```

### A.3 Usar Docker sin `sudo`

```bash
sudo usermod -aG docker $USER
newgrp docker            # o cierra sesión y vuelve a entrar
docker run hello-world   # debe imprimir "Hello from Docker!"
```

---

## 🪟 Opción B — Windows 10/11

Abre **PowerShell** y ejecuta:

```powershell
# 1) WSL 2 (como Administrador). Reinicia el equipo al terminar.
wsl --install

# 2) Herramientas
winget install -e --id Git.Git
winget install -e --id OpenJS.NodeJS.LTS
winget install -e --id Docker.DockerDesktop
```

1. Abre **Docker Desktop**, acepta los términos y verifica en *Settings → General* que esté activado **"Use the WSL 2 based engine"**.
2. Cierra y vuelve a abrir PowerShell, y comprueba:

```powershell
node -v
docker --version
docker run hello-world
```

> 💡 **Recomendación:** trabaja el proyecto dentro del sistema de archivos de WSL (terminal de Debian/Ubuntu en WSL) para que Docker construya mucho más rápido que desde `C:\`.

Los comandos `docker ...` de las siguientes secciones son **idénticos** en Debian y en PowerShell.

---

## 🚀 1. Crear el proyecto Next.js desde cero

Con el comando oficial `create-next-app`:

```bash
npx create-next-app@latest nextjs-docker-activity --ts --eslint --tailwind --app --src-dir --import-alias "@/*" --use-npm
cd nextjs-docker-activity
```

Este repositorio es ese proyecto con la página, el footer y el endpoint `/api/health` ya personalizados. Para el desarrollo local (sin Docker):

```bash
npm install
npm run dev        # http://localhost:3000
```

---

## 🏗️ 2. Construir la imagen (`docker build`)

Desde la **raíz del proyecto** (donde está el `Dockerfile`):

```bash
docker build -t nextjs-docker-activity:1.0 .
```

- `-t nextjs-docker-activity:1.0` → nombre y etiqueta de la imagen.
- `.` → contexto de build (el `.dockerignore` filtra lo que no debe entrar).

Comprobar que la imagen existe y ver su tamaño:

```bash
docker image ls nextjs-docker-activity
```

### ¿Qué hace cada etapa del Dockerfile?

| Etapa | Qué hace |
|---|---|
| `deps` | Copia `package.json`/`package-lock.json` y ejecuta `npm ci` (aprovecha la caché de capas). |
| `builder` | Copia el código y ejecuta `npm run build` (`next build`). |
| `prod-deps` | Instala solo dependencias de producción (`npm ci --omit=dev`). |
| `runner` | Imagen final: copia `.next`, `public` y `node_modules` de producción, corre como usuario **no root**, expone el **puerto 3000** y arranca con **`next start`** (`npm start`). |

---

## ▶️ 3. Ejecutar el contenedor (`docker run`)

```bash
docker run -d --name nextjs-docker-app -p 3000:3000 nextjs-docker-activity:1.0
```

- `-d` → en segundo plano.
- `--name` → nombre del contenedor.
- `-p 3000:3000` → `puerto_del_equipo:puerto_del_contenedor`.

Abre 👉 **http://localhost:3000**

Si el puerto 3000 de tu equipo está ocupado, usa otro (por ejemplo 8080):

```bash
docker run -d --name nextjs-docker-app -p 8080:3000 nextjs-docker-activity:1.0
```

---

## 🔎 4. Verificar que todo funciona sin errores

```bash
# El contenedor debe aparecer como "Up" (y luego "healthy")
docker ps

# Los logs deben mostrar "▲ Next.js 16.x" y "✓ Ready", sin errores
docker logs nextjs-docker-app

# Estado del HEALTHCHECK: debe devolver "healthy"
docker inspect --format='{{.State.Health.Status}}' nextjs-docker-app

# Endpoint de salud: debe responder {"status":"ok"}
curl http://localhost:3000/api/health          # PowerShell: curl.exe http://localhost:3000/api/health

# La página debe responder HTTP 200
curl -I http://localhost:3000                  # PowerShell: curl.exe -I http://localhost:3000

# El proceso NO corre como root (debe imprimir "nextjs")
docker exec nextjs-docker-app whoami
```

En la página principal, la tarjeta **"Información del contenedor en ejecución"** muestra el *hostname* (ID del contenedor), la versión de Node.js y el usuario del proceso: evidencia visual de que la app corre dentro del contenedor.

---

## 🧰 Comandos útiles

```bash
docker logs -f nextjs-docker-app        # Seguir logs en vivo
docker stop nextjs-docker-app           # Detener
docker start nextjs-docker-app          # Volver a iniciar
docker rm -f nextjs-docker-app          # Eliminar el contenedor
docker rmi nextjs-docker-activity:1.0   # Eliminar la imagen
docker build --no-cache -t nextjs-docker-activity:1.0 .   # Reconstruir sin caché
docker system prune -f                  # Limpiar recursos sin usar
```

---

## 🛠️ Solución de problemas

| Problema | Causa / solución |
|---|---|
| `permission denied ... /var/run/docker.sock` (Debian) | Tu usuario no está en el grupo `docker`: `sudo usermod -aG docker $USER` y `newgrp docker` (o reinicia sesión). |
| `port is already allocated` / `address already in use` | El puerto 3000 está ocupado. Usa `-p 8080:3000` o libera el puerto. |
| La página no carga desde el navegador, pero el contenedor está "Up" | La app debe escuchar en `0.0.0.0`. El `Dockerfile` ya define `HOSTNAME=0.0.0.0` (Docker asigna el ID del contenedor a `HOSTNAME`; sin este valor Next.js escucharía solo en esa interfaz). |
| `Next.js requires Node.js >= 20.9` | Next.js 16 no soporta Node 18. Usa la imagen por defecto (`node:22-alpine`) o `--build-arg NODE_VERSION=20`. Solo con Next.js ≤ 15 puedes usar `--build-arg NODE_VERSION=18`. |
| `npm ci` falla por falta de `package-lock.json` | Asegúrate de haber hecho commit del `package-lock.json` (no lo excluyas). |
| `next build` falla descargando fuentes de Google | Este proyecto usa fuentes del sistema para que el build no dependa de internet externo. Si agregas `next/font/google`, el build necesita salida a Google Fonts. |
| Docker Desktop no arranca en Windows | Activa la virtualización en la BIOS, ejecuta `wsl --install` y reinicia. |

---

## 🌱 Mejora opcional: imagen aún más liviana (`output: "standalone"`)

Next.js puede generar un servidor mínimo con solo los archivos necesarios (`.next/standalone`). Para usarlo habría que añadir `output: "standalone"` en `next.config.ts` y arrancar con `node server.js` en lugar de `next start`. En esta actividad se mantiene **`next start`** porque es lo que pide la consigna.

---

## 📤 Publicar en GitHub (repositorio público)

Crea antes el repositorio vacío y **público** en GitHub (sin README ni .gitignore, porque ya existen aquí). Luego:

```bash
git init
git add .
git commit -m "feat: contenerizar app Next.js con Docker multi-stage"
git branch -M main
git remote add origin https://github.com/<tu-usuario>/nextjs-docker-activity.git
git push -u origin main
```

### ✔️ Checklist de entrega

- [ ] Proyecto Next.js completo (creado con `create-next-app`).
- [ ] `Dockerfile` funcional con multi-stage build, `next build` y `next start`.
- [ ] `.dockerignore` (excluye `node_modules`, `.next`, `.env` y temporales).
- [ ] `README.md` con comandos de build y run.
- [ ] `docker build` termina sin errores.
- [ ] `docker run` levanta el contenedor y `http://localhost:3000` responde.
- [ ] Repositorio público en GitHub.

---

<sub>Kodigo Full Stack Jr 36 · Next.js 16 · Docker multi-stage · © Hugo Jovel Web</sub>
