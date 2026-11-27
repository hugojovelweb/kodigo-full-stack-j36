# Armonía · Landing de una academia de música
### By Hugo Jovel Web

Ejercicio en parejas · Kodigo Full Stack Jr 36 · Módulo 5 · Semana 21 (vibe coding con Next.js y Claude).

Landing de una academia de música ficticia, "Armonía": hero con video de fondo, 2 funciones en zigzag,
3 testimonios, llamado a la acción final y footer con sello.

- **Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · lucide-react
- **Fuentes:** Instrument Serif (títulos) e Inter (texto), con `next/font/google`
- **Sin librerías extra** para animaciones: el fade-in usa `IntersectionObserver`

## Estructura

```
app/
  layout.tsx        fuentes, metadata en español y <SiteFooter />
  globals.css       Tailwind 4: @import "tailwindcss" + @theme (colores y fuentes)
  page.tsx          hero, funciones, testimonios y llamado a la acción
components/
  site-footer.tsx   sello "© año Hugo Jovel Web" (un solo punto del proyecto)
  bg-video.tsx      <video> con autoPlay, muted, loop y playsInline
  feature-block.tsx bloque en zigzag (video + título + texto + botón)
  reveal.tsx        "use client": fade-in al hacer scroll
public/
  hero.jpg          fondo sin texto (imagen de respaldo)
  videos/           hero.mp4, funcion-1.mp4, funcion-2.mp4 (720p, < 1 MB cada uno)
scripts/generar-fondos.sh   regenera los fondos de ejemplo con ffmpeg
PROMPTS.md          prompts usados y qué hubo que corregir
docs/PASO_A_PASO.md flujo de la guía aplicado a este tema, con prompts listos
```

---

## Requisitos

| Herramienta | Versión |
|---|---|
| Node.js | 20.9 o superior (probado con 22) |
| npm | 10 o superior |
| Git | cualquiera reciente |
| VS Code | opcional, recomendado |

Se necesita internet la primera vez: `next/font/google` descarga las fuentes al compilar.

---

## Opción A · Debian XFCE 13 (entorno principal)

### 1. Instalar lo necesario

```bash
sudo apt update
sudo apt install -y git curl ca-certificates unzip
```

Node.js: usa **nvm**, así no dependes de la versión que traiga el repositorio de Debian y no necesitas `sudo` para `npm`.

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
# cierra y abre la terminal (o ejecuta: source ~/.bashrc)
nvm install --lts
node -v    # debe mostrar v20.9 o superior
npm -v
```

Si prefieres los paquetes de Debian: `sudo apt install -y nodejs npm` y revisa que `node -v` sea 20.9 o superior.

### 2. Descomprimir y abrir el proyecto

```bash
cd ~/Escritorio
unzip armonia-landing.zip
cd armonia
code .          # abre VS Code (opcional)
```

### 3. Instalar dependencias y correr

```bash
npm install
npm run dev
```

Abre http://localhost:3000 en el navegador.

### 4. Validar como en la rúbrica

```bash
npm run lint
npm run build
npm run start      # sirve la versión de producción en http://localhost:3000
```

`npm run build` debe terminar con `Compiled successfully`.

### 5. Ver la versión móvil

En Chrome o Chromium: `F12` → `Ctrl+Shift+M` → elige iPhone (390 px). No debe haber scroll horizontal.

### 6. (Opcional) Regenerar o comprimir videos

```bash
sudo apt install -y ffmpeg
./scripts/generar-fondos.sh
# Comprimir un video de Pexels a 720p, sin audio:
ffmpeg -i original.mp4 -vf scale=1280:-2 -an -c:v libx264 -crf 28 -movflags +faststart public/videos/hero.mp4
```

---

## Opción B · Windows 10/11

### 1. Instalar lo necesario (PowerShell)

```powershell
winget install OpenJS.NodeJS.LTS
winget install Git.Git
winget install Microsoft.VisualStudioCode
```

Cierra y abre PowerShell, y comprueba: `node -v` y `npm -v`.

Si `npm` falla con "la ejecución de scripts está deshabilitada":

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

### 2. Descomprimir y correr

Clic derecho sobre `armonia-landing.zip` → **Extraer todo**. Luego, en PowerShell:

```powershell
cd $HOME\Desktop\armonia
code .
npm install
npm run dev
```

Abre http://localhost:3000. Para validar: `npm run lint` y `npm run build`.

### 3. (Opcional) ffmpeg para videos

```powershell
winget install Gyan.FFmpeg
```

El script `scripts/generar-fondos.sh` se ejecuta desde **Git Bash** (viene con Git para Windows).

---

## Publicar: GitHub + Vercel

### Si el proyecto va en su propio repositorio

```bash
git init
git add -A
git commit -m "feat: landing de Armonía con hero, funciones y testimonios"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/armonia-landing.git
git push -u origin main
```

### Si lo guardas dentro del repo general del bootcamp

Copia la carpeta, por ejemplo, a `Modulo-05/Tareas-modulo-05/landing-academia-musica/` y haz commit desde la raíz del repo.
En Vercel, al importar el repositorio, abre **Root Directory** y elige esa carpeta. El link que entregas es el de esa carpeta en GitHub.

### Vercel

1. Entra a https://vercel.com con tu cuenta de GitHub (plan Hobby, gratis).
2. **Add New → Project**, elige el repositorio.
3. Framework: Next.js (se detecta solo). No hay variables de entorno.
4. **Deploy**. En un minuto tienes la URL pública.

---

## Solución de problemas

| Síntoma | Causa y solución |
|---|---|
| `Failed to fetch Instrument Serif from Google Fonts` | Sin internet o proxy. Conéctate y vuelve a correr `npm run build`. |
| `Unknown font` | En `next/font` el nombre lleva guion bajo: `Instrument_Serif`. |
| Los estilos no se aplican | Borra `tailwind.config.js` o `postcss.config.*` si Claude los creó. Tailwind 4 no los usa. |
| `You're importing a component that needs useEffect` | Falta `"use client"` al inicio del componente. |
| Error por `new Date()` en el build | Next 16 con `cacheComponents` lo exige dentro de `"use cache"` (ver `components/site-footer.tsx`). |
| El video no se reproduce en el celular | Falta `muted` o `playsInline` en el `<video>`. |
| Puerto 3000 ocupado | `npm run dev -- -p 3001` |
| `EACCES` al instalar en Debian | No uses `sudo npm`. Instala Node con nvm. |

---

© Hugo Jovel Web. Proyecto educativo del bootcamp Kodigo Full Stack Jr 36.
