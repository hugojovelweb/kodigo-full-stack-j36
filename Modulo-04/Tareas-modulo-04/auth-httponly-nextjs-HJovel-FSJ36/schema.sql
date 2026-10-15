-- =====================================================================
-- SecureAuth · esquema de base de datos para Neon (PostgreSQL)
-- Ejecutar en: Neon Console -> SQL Editor  (o:  npm run db:migrate)
-- Idempotente: se puede ejecutar varias veces sin romper nada.
-- Cada sentencia termina con ";" al final de la línea (lo usa db:migrate).
-- =====================================================================

-- 1) Usuarios ----------------------------------------------------------
create table if not exists users (
  id                uuid primary key default gen_random_uuid(),
  email             text not null,
  password_hash     text not null,
  display_name      text not null check (char_length(display_name) between 2 and 60),
  email_verified_at timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  -- El correo se guarda SIEMPRE en minúsculas (la app lo normaliza); el CHECK lo garantiza.
  constraint users_email_lowercase check (email = lower(email)),
  constraint users_email_length check (char_length(email) <= 254)
);

create unique index if not exists users_email_key on users (email);

-- 2) Sesiones ----------------------------------------------------------
-- "id" es el SHA-256 del token que viaja en la cookie httpOnly.
-- Si la base de datos se filtrara, los hashes NO sirven para suplantar sesiones.
create table if not exists sessions (
  id         text primary key,
  user_id    uuid not null references users (id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  user_agent text
);

create index if not exists sessions_user_id_idx on sessions (user_id);
create index if not exists sessions_expires_at_idx on sessions (expires_at);

-- 3) Tokens de un solo uso (verificar correo / recuperar contraseña) ----
-- "id" es el SHA-256 del token enviado por correo.
create table if not exists email_tokens (
  id         text primary key,
  user_id    uuid not null references users (id) on delete cascade,
  type       text not null check (type in ('verify', 'reset')),
  expires_at timestamptz not null,
  used_at    timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists email_tokens_user_id_idx on email_tokens (user_id);

-- 4) Límite de intentos (anti fuerza bruta) ----------------------------
create table if not exists rate_limits (
  key      text primary key,
  count    integer not null,
  reset_at timestamptz not null
);
