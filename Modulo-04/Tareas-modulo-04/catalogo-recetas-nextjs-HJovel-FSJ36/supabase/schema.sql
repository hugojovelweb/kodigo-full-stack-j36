-- =========================================================
-- Esquema: Catálogo de Recetas
-- Ejecutar en: Supabase Dashboard > SQL Editor > New query
-- =========================================================

-- Extensión para generar UUID si no está habilitada por defecto
create extension if not exists "pgcrypto";

-- Tabla de categorías (ej: Postres, Comida rápida, Vegano)
create table if not exists public.categorias (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  nombre      text not null,
  descripcion text,
  created_at  timestamptz not null default now()
);

-- Tabla principal de recetas
create table if not exists public.recetas (
  id                  uuid primary key default gen_random_uuid(),
  slug                text unique not null,
  titulo              text not null,
  descripcion         text not null,
  ingredientes        text[] not null default '{}',
  pasos               text[] not null default '{}',
  imagen_url          text,
  tiempo_preparacion  integer not null default 0, -- minutos
  dificultad          text not null default 'Fácil' check (dificultad in ('Fácil', 'Media', 'Difícil')),
  categoria_id        uuid references public.categorias(id) on delete set null,
  created_at          timestamptz not null default now()
);

-- Índices para las búsquedas por slug (rutas dinámicas) y por categoría
create index if not exists idx_recetas_slug on public.recetas (slug);
create index if not exists idx_recetas_categoria_id on public.recetas (categoria_id);
create index if not exists idx_categorias_slug on public.categorias (slug);
