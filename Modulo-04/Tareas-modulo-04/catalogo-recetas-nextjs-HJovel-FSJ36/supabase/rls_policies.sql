-- =========================================================
-- Row Level Security (RLS): lectura pública, escritura bloqueada
-- Ejecutar DESPUÉS de schema.sql y seed.sql
-- =========================================================

-- 1. Habilitar RLS en ambas tablas (sin esto, ninguna política aplica)
alter table public.categorias enable row level security;
alter table public.recetas    enable row level security;

-- 2. Política de LECTURA pública (rol "anon", usado por NEXT_PUBLIC_SUPABASE_ANON_KEY)
--    Permite SELECT a cualquiera; NO permite INSERT/UPDATE/DELETE.
create policy "Lectura publica de categorias"
  on public.categorias
  for select
  to anon
  using (true);

create policy "Lectura publica de recetas"
  on public.recetas
  for select
  to anon
  using (true);

-- 3. (Opcional) Si más adelante agregas autenticación y quieres que
--    solo usuarios autenticados puedan insertar/editar recetas, descomenta:
--
-- create policy "Usuarios autenticados pueden insertar recetas"
--   on public.recetas
--   for insert
--   to authenticated
--   with check (true);
