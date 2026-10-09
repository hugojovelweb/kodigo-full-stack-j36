# ⚡ Pokédex · Optimización de transferencia de datos con TanStack Query v5

### Hugo Ernesto Jovel Hernández  Full Stack Jr - 36
 
Actividad práctica — Bootcamp **Kodigo Full Stack Jr 36**
**Optimización de Transferencia de Datos: Implementación de TanStack Query y Estrategias Avanzadas de Caché en Aplicaciones Modernas**

Aplicación con **Next.js 16 (App Router)**, **React Server Components**, **TanStack Query v5**, **TypeScript estricto** y la [PokéAPI](https://pokeapi.co/).

---

## 1. Funcionalidades (cumplimiento de requisitos)

| Requisito | Dónde está implementado |
|---|---|
| a) Lista en Server Component, ≥ 50 Pokémon, tarjetas con nombre e imagen, paginación | `src/app/page.tsx` (RSC), `PAGE_SIZE = 60` en `src/lib/constants.ts`, `src/components/pagination.tsx` (`?page=N`) |
| b) `prefetchQuery` en `onMouseEnter` | `src/components/pokemon-card.tsx` (también en `onFocus` para teclado) |
| c) `<HydrationBoundary>` + `dehydrate` | `src/app/page.tsx` y `src/app/pokemon/[name]/page.tsx`; config de `dehydrate` en `src/lib/query-client.ts` |
| d) Ruta dinámica `/pokemon/[name]` con stats, tipos, habilidades, cadena evolutiva y sprites | `src/app/pokemon/[name]/page.tsx` + `src/components/pokemon-detail.tsx` |
| `staleTime` 24 h y `gcTime` | `src/lib/constants.ts` → usados en `query-client.ts` y `queries.ts` |
| Estados de carga y error | `loading.tsx`, `error.tsx`, `not-found.tsx`, skeletons y botón «Reintentar» |
| TypeScript con tipado completo de la API | `src/types/pokemon.ts` (respuestas crudas + modelos de dominio) |

## 2. Arquitectura

```
src/
├─ app/
│  ├─ layout.tsx                 # RSC: layout + <Providers> (cliente)
│  ├─ page.tsx                   # RSC: prefetch lista + HydrationBoundary + paginación
│  ├─ loading.tsx / error.tsx / not-found.tsx
│  └─ pokemon/[name]/
│     ├─ page.tsx                # RSC: prefetch detalle + HydrationBoundary
│     ├─ loading.tsx / error.tsx
├─ components/
│  ├─ providers.tsx              # CLIENTE: QueryClientProvider + Devtools
│  ├─ pokemon-grid.tsx           # CLIENTE: useQuery (lee la caché hidratada)
│  ├─ pokemon-card.tsx           # CLIENTE: onMouseEnter -> prefetchQuery
│  ├─ pokemon-detail.tsx         # CLIENTE: useQuery del detalle
│  ├─ pagination.tsx             # SERVIDOR: enlaces, sin JS de cliente
│  ├─ type-badge.tsx, detail-skeleton.tsx
├─ lib/
│  ├─ constants.ts               # PAGE_SIZE, STALE_TIME, GC_TIME
│  ├─ pokeapi.ts                 # fetchers tipados + PokeApiError
│  ├─ queries.ts                 # queryKeys + queryOptions compartidos
│  ├─ query-client.ts            # fábrica de QueryClient + singleton de navegador
│  ├─ get-server-query-client.ts # QueryClient por petición (React cache)
│  └─ pokemon-utils.ts
└─ types/pokemon.ts
```

**Separación Server / Client:** solo es `"use client"` lo que necesita hooks o eventos (`useQuery`, `useQueryClient`, `onMouseEnter`, Devtools). Páginas, paginación y layout son Server Components.

## 3. Estrategia de caché (documentación solicitada)

Hay **tres capas** de caché que se complementan:

### 3.1 Caché de TanStack Query (navegador)
| Opción | Valor | Justificación |
|---|---|---|
| `staleTime` | `24 * 60 * 60 * 1000` (24 h) | Los datos de la PokéAPI son casi estáticos. Durante 24 h el dato es «fresco»: **no hay refetch** al montar, al volver a la pestaña ni al reconectar. |
| `gcTime` | `7 * 24 * 60 * 60 * 1000` (7 días) | Debe ser **≥ `staleTime`**. Mantiene en memoria los datos de queries sin observadores, así un Pokémon visitado o precargado sigue disponible en toda la sesión (volver atrás es instantáneo). |
| `retry` | `1` | Un reintento ante fallo transitorio sin bloquear la UI. |
| `refetchOnWindowFocus` | `false` | Evita peticiones innecesarias con datos que no cambian. |

Las opciones viven **una sola vez** en `src/lib/constants.ts` y se aplican como valores por defecto del `QueryClient` y en cada `queryOptions`.

### 3.2 Flujo de datos con hydration
1. **Servidor (RSC):** `getServerQueryClient()` crea un `QueryClient` *por petición* → `fetchQuery(pokemonPageOptions(page))` → `dehydrate(queryClient)`.
2. `<HydrationBoundary state={...}>` serializa ese estado en el HTML.
3. **Cliente:** `PokemonGrid` usa `useQuery` con **la misma `queryKey`** → los datos ya existen en el primer render: HTML con tarjetas pintadas, **sin spinner ni refetch** (por el `staleTime`).
4. `dehydrate.shouldDehydrateQuery` incluye también queries `pending` (compatible con streaming de promesas).

### 3.3 Prefetching en hover
`onMouseEnter` (y `onFocus`) en cada tarjeta ejecuta `queryClient.prefetchQuery(pokemonDetailOptions(name))`:
- Un único `queryFn` (`getPokemonDetail`) trae **pokemon + species + evolution-chain**, así un solo prefetch deja el detalle completo en caché.
- `prefetchQuery` **respeta `staleTime`** (no repite si ya está fresco) y **deduplica** peticiones en vuelo.
- Al hacer clic, `/pokemon/[name]` muestra los datos **instantáneamente** desde la caché del navegador; si se entra directo por URL, el servidor los obtiene e hidrata.

### 3.4 Data Cache de Next.js (servidor)
Cada `fetch` del servidor usa `next: { revalidate: 86400 }` (24 h), alineado con el `staleTime`. Varias peticiones de usuarios distintos a la misma URL de la PokéAPI se sirven sin volver a llamarla.

> Nota: `staleTime`/`gcTime` aplican a `queryKey` exactas. Los enlaces de la app usan el **nombre** (`/pokemon/pikachu`); entrar manualmente con `/pokemon/25` crea otra clave (funciona, pero no reutiliza el prefetch).

## 4. Requisitos previos

- **Node.js ≥ 20.9** (probado con Node 22 y compatible con Node 24 LTS), **npm ≥ 10**
- Git
- Conexión a internet (PokéAPI y sprites de `raw.githubusercontent.com`)

## 5. Instalación y ejecución en **Debian XFCE 13**

> Si tu ruta tiene espacios (p. ej. `KODIGO /Full Stack Jr 36/...`), escríbela **entre comillas**.

```bash
# 1) Verifica herramientas (si ya las tienes, salta al paso 3)
node -v && npm -v && git --version

# 2) Si falta Node.js: instalar con nvm (sin sudo)
sudo apt update && sudo apt install -y curl git ca-certificates
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install --lts
node -v && npm -v

# 3) Ir a tu carpeta de tareas y copiar/descomprimir el proyecto
cd "/home/hugojovelweb/Projects/KODIGO /Full Stack Jr 36/kodigo-full-stack-j36/"   # ajusta tu módulo
unzip ~/Descargas/pokedex-tanstack-query-HJovel-FSJ36.zip
cd pokedex-tanstack-query-HJovel-FSJ36

# 4) Instalar dependencias
npm install

# 5) (Opcional) variables de entorno — el valor por defecto ya funciona
cp .env.example .env.local

# 6) Desarrollo
npm run dev            # http://localhost:3000

# 7) Verificación de calidad y producción
npm run typecheck
npm run lint
npm run build
npm run start          # http://localhost:3000
```

Abrir en VS Code: `code .`

## 6. Instalación y ejecución en **Windows 10/11**

**Opción A — PowerShell nativo**
```powershell
# 1) Instalar Node.js LTS y Git (una sola vez)
winget install OpenJS.NodeJS.LTS
winget install Git.Git
# Cierra y abre PowerShell, luego verifica:
node -v; npm -v; git --version

# 2) Descomprime el .zip, entra a la carpeta y ejecuta
cd C:\ruta\pokedex-tanstack-query-HJovel-FSJ36
npm install
Copy-Item .env.example .env.local     # opcional
npm run dev                            # http://localhost:3000
```
Si PowerShell bloquea `npm` por la política de scripts:
`Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`

**Opción B — WSL2 (Debian)**: `wsl --install -d Debian`, y dentro sigue exactamente la sección 5 (Debian).

## 7. Cómo comprobar que funciona (para la demo)

1. `npm run dev`, abre `http://localhost:3000` → se ven 60 tarjetas; *Ver código fuente* muestra las tarjetas ya renderizadas en el HTML (SSR).
2. Abre **DevTools → Network** (filtro `pokeapi`), pasa el mouse sobre una tarjeta → aparecen las peticiones de `pokemon`, `pokemon-species` y `evolution-chain` (prefetch).
3. Haz clic en esa tarjeta → el detalle aparece **sin skeleton** y sin nuevas peticiones.
4. Abre el panel de **React Query Devtools** (icono flotante) → verás las queries `["pokemon","detail",nombre]` en estado *fresh* con `staleTime` 24 h.
5. Prueba `/pokemon/no-existe` (404) y desconecta la red para ver el estado de error con «Reintentar».

## 8. Despliegue (Vercel)

```bash
git init && git add . && git commit -m "feat: pokedex con tanstack query v5"
git remote add origin https://github.com/<tu-usuario>/pokedex-tanstack-query-HJovel-FSJ36.git
git push -u origin main
```
Importa el repositorio en Vercel; no requiere variables de entorno obligatorias.

## 9. Scripts

| Script | Acción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción |
| `npm run start` | Servidor de producción |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (config oficial de Next.js) |

## 10. Créditos
Datos: [PokéAPI](https://pokeapi.co/). Imágenes: [PokeAPI/sprites](https://github.com/PokeAPI/sprites). Pokémon es marca de Nintendo / Game Freak; uso exclusivamente educativo.
