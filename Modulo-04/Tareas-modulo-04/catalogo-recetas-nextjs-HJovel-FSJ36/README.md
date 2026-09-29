# 🍲 Catálogo de Recetas — Next.js App Router + Supabase

Proyecto académico — Kodigo Full Stack Jr 36
Alumno: Hugo Ernesto Jovel Hernández
Actividad: *Dominio del App Router y Gestión de Datos: Construcción de Rutas Dinámicas y Persistencia con servicio serverless*

## 📚 Descripción del proyecto

Landing page de un catálogo de recetas de cocina construida con **Next.js 16 (App Router)** y **Supabase** como base de datos y backend serverless. El proyecto consume datos exclusivamente desde **Server Components**, implementa **rutas dinámicas** para recetas y categorías, y aplica **Row Level Security (RLS)** para exponer solo lectura pública.

### Funcionalidades

- Landing page (`/`) con grid responsive de recetas, obtenidas desde Supabase.
- Ruta dinámica `/recetas/[slug]` — detalle de una receta (ingredientes y pasos).
- Ruta dinámica `/categorias/[slug]` — recetas filtradas por categoría.
- `loading.js`, `error.js` y `not-found.js` en cada segmento de ruta.
- `generateStaticParams` + `generateMetadata` para SEO y pre-renderizado.
- Diseño responsive con Tailwind CSS.
- Row Level Security en Supabase: solo `select` público, sin escritura desde el cliente.

### Estructura del proyecto

```
catalogo-recetas-nextjs-HJovel-FSJ36/
├── app/
│   ├── layout.js
│   ├── page.js                     # Home: lista de recetas
│   ├── loading.js / error.js / not-found.js
│   ├── recetas/[slug]/page.js      # Ruta dinámica: detalle de receta
│   └── categorias/[slug]/page.js   # Ruta dinámica: recetas por categoría
├── components/                     # Header, Footer, RecetaCard
├── lib/
│   ├── supabaseClient.js           # Cliente Supabase (server-side)
│   └── queries.js                  # Funciones de consulta a la BD
├── supabase/
│   ├── schema.sql                  # Tablas: categorias, recetas
│   ├── seed.sql                    # 5+ registros de ejemplo
│   └── rls_policies.sql            # Políticas RLS de lectura pública
├── .env.example
└── package.json
```

## ⚙️ Instalación local

### 1. Requisitos

- Node.js 20 LTS o superior
- Cuenta gratuita en [Supabase](https://supabase.com)
- Cuenta gratuita en [Vercel](https://vercel.com) (para el despliegue)

### 2. Clonar e instalar dependencias

```bash
git clone https://github.com/hugojovelweb/kodigo-full-stack-j36.git
cd kodigo-full-stack-j36/Modulo-XX/Tareas-modulo-XX/catalogo-recetas-nextjs-HJovel-FSJ36
npm install
```

### 3. Crear el proyecto en Supabase

1. Crea un proyecto nuevo en [supabase.com](https://supabase.com/dashboard).
2. Ve a **SQL Editor** y ejecuta, en este orden:
   - `supabase/schema.sql`
   - `supabase/seed.sql`
   - `supabase/rls_policies.sql`
3. Ve a **Project Settings > API** y copia:
   - `Project URL`
   - `anon public` key

### 4. Variables de entorno

Copia `.env.example` como `.env.local` y completa tus credenciales:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_tu-clave-aqui
```

> ⚠️ `.env.local` está en `.gitignore` — nunca se sube a GitHub.

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

### 6. Build de producción (opcional, local)

```bash
npm run build
npm run start
```

## 🚀 Despliegue

Desplegado en **Vercel**, importando este repositorio y configurando las mismas variables de entorno (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) en **Project Settings > Environment Variables**.

- **URL en producción:** _(agregar enlace aquí al desplegar)_
- **Repositorio:** https://github.com/hugojovelweb/kodigo-full-stack-j36

## 🔐 Variables de entorno necesarias

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto de Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave pública (anon) de Supabase, protegida por RLS |

## 🧑‍💻 Autor

Hugo Jovel — Kodigo Full Stack Jr 36
