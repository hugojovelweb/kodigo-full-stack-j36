# SenderoSV — Rutas y miradores de El Salvador
## Hugo Ernesto Jovel Hernández - Full Stack Jr - 36

Bootcamp Full Stack Junior · Módulo 4 · Kodigo — Ejercicio guiado + Reto
Stack: **Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + Supabase**

| Ruta | Qué muestra | Estrategia |
|---|---|---|
| `/` | Zonas (ahora enlazadas) + todas las rutas con filtro de dificultad | ISR (`revalidate = 60`) |
| `/rutas/[id]` | Detalle de una ruta | SSG + ISR |
| `/zonas/[slug]` | **Reto:** zona + sus rutas | SSG + ISR |

## Qué se resolvió en el Reto

- [x] `getZonaBySlug` y `getRutasByZona` en `src/lib/queries.ts` (`cache()`, `maybeSingle()`, `overrideTypes`, `throw new Error` si Supabase falla)
- [x] `src/app/zonas/[slug]/page.tsx` con `params` como `Promise`, `generateStaticParams`, `generateMetadata`, `revalidate = 60` y `notFound()`
- [x] Enlace roto de `/rutas/[id]` → `/zonas/[slug]` ya funciona (sin tocar ese archivo)
- [x] Tarjetas de zona en la home convertidas en `<Link>`
- [x] Opcional: `FiltroDificultad` (Client Component con `useState`)
- [x] Plan escrito en `PLAN.md`

---

## 1. Preparar Debian 13 (XFCE)

Abre una terminal: menú **Aplicaciones → Emulador de terminal** (o `Ctrl+Alt+T` si lo tienes configurado).

### Opción A — Automática (recomendada)

```bash
sudo apt update && sudo apt install -y unzip
cd ~/Documentos                      # o la carpeta donde guardaste el .zip
unzip senderosv.zip
cd senderosv
bash scripts/setup-debian.sh
```

El script instala `git`, `curl`, `build-essential`, **nvm**, **Node.js LTS**, **pnpm**, y corre `pnpm install`. Crea `.env.local` desde la plantilla si no existe.

### Opción B — Manual

```bash
# 1) Paquetes base
sudo apt update
sudo apt install -y git curl ca-certificates build-essential unzip

# 2) nvm + Node LTS
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.nvm/nvm.sh
nvm install --lts
node -v          # Next.js 16 requiere >= 20.9

# 3) pnpm
npm install -g pnpm
pnpm -v

# 4) Dependencias
cd ~/Documentos/senderosv
pnpm install
```

> **Sobre Node en Debian 13:** el paquete `nodejs` de `apt` trae la serie 20.x (20.19.2), que ya cumple el mínimo de Next.js 16 pero está fuera de soporte upstream. Por eso se usa **nvm** con la versión LTS vigente; además no necesita `sudo` ni choca con el sistema.

> Si al abrir una terminal nueva `node` o `pnpm` no aparecen: `source ~/.nvm/nvm.sh` (nvm agrega esa línea a `~/.bashrc` al instalarse).

---

## 2. Supabase (base de datos)

1. Entra a <https://supabase.com> → **New project**.
2. Ve a **SQL Editor → New query**, pega **todo** el contenido de `supabase/schema.sql` y presiona **Run**.
3. En **Table Editor** verifica que existan `zonas` (3 filas) y `rutas` (6 filas) con **RLS enabled**.
4. Copia tus credenciales desde **Project Settings → API**: *Project URL* y la llave **publishable** (`sb_publishable_...`).

## 3. Variables de entorno

```bash
cp .env.local.example .env.local     # solo si el script no lo creó
mousepad .env.local                  # editor gráfico de XFCE (o: nano .env.local)
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxx
```

`.env.local` está en `.gitignore`: **no lo subas a GitHub**. Reinicia `pnpm dev` cada vez que lo cambies.

## 4. Correr el proyecto

```bash
pnpm dev
```

Abre <http://localhost:3000> en Firefox. Detén el servidor con `Ctrl+C`.

### Verificación en modo producción (recomendado antes de entregar)

```bash
pnpm lint
pnpm typecheck   # genera los tipos de rutas (LayoutProps) y corre tsc
pnpm build     # necesita Supabase accesible: generateStaticParams consulta la BD
pnpm start     # http://localhost:3000
```

En la salida de `pnpm build` deben aparecer `/rutas/[id]` y `/zonas/[slug]` con `●` (SSG) y `Revalidate 1m`, con 6 rutas y 3 zonas pre-generadas.

---

## 5. Checklists

**Parte guiada**
- [ ] `pnpm dev` corre sin errores
- [ ] La home muestra las 3 zonas y las 6 rutas
- [ ] Cada tarjeta lleva a `/rutas/[id]`
- [ ] La etiqueta de dificultad cambia de color (verde / ámbar / rosa)
- [ ] `/rutas/999` muestra la 404 personalizada

**Reto**
- [ ] `getZonaBySlug` y `getRutasByZona` en `queries.ts`
- [ ] `/zonas/occidente`, `/zonas/oriente` y `/zonas/central` muestran zona + sus rutas (2 cada una)
- [ ] `/zonas/no-existe` muestra la 404 personalizada
- [ ] El enlace de zona en el detalle de una ruta ya no da 404
- [ ] Las tarjetas de zona de la home son enlaces
- [ ] (Opcional) El filtro Fácil / Moderada / Difícil funciona sin recargar (2 / 3 / 1 rutas)

## 6. Problemas frecuentes

| Síntoma | Causa / solución |
|---|---|
| `Faltan variables de entorno de Supabase` | Falta `.env.local` o tiene nombres distintos. Reinicia `pnpm dev`. |
| La home carga pero sin zonas ni rutas (`[]`) | RLS activo sin política `select`. Vuelve a correr la parte 2 de `schema.sql`. |
| `Invalid src prop ... hostname is not configured` | Agrega el dominio de la imagen en `remotePatterns` de `next.config.ts`. |
| VS Code marca `Cannot find name 'LayoutProps'` | Los tipos de rutas se generan con `pnpm dev`, `pnpm build` o `pnpm typecheck`. Corre uno y reinicia el servidor de TypeScript. |
| `pnpm: command not found` | Terminal nueva sin nvm cargado: `source ~/.nvm/nvm.sh`. |
| `Port 3000 is already in use` | `pnpm dev -p 3001` o cierra el otro proceso. |
| `pnpm build` falla con `fetch failed` | Sin internet o credenciales incorrectas: el build consulta Supabase. |
| Aviso de `sharp` / scripts de build ignorados | `pnpm approve-builds` (aprueba `sharp`) y `pnpm install`. Solo afecta a la optimización de imágenes en `pnpm start`. |

**Nota técnica sobre el 404:** como el proyecto tiene un `loading.tsx` global (streaming), Next.js ya envió el código HTTP 200 cuando `notFound()` se ejecuta en una ruta no pre-generada. En pantalla se ve la 404 personalizada y la página lleva `<meta name="robots" content="noindex">`, que es lo que pide la guía. Es comportamiento normal del App Router, no un error.
