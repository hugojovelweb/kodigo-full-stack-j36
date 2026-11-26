-- Fade Lab · esquema PostgreSQL (Neon)
-- Idempotente: se puede ejecutar varias veces sin romper nada.
-- Ejecutar en Neon -> SQL Editor, o con: npm run db:setup

CREATE EXTENSION IF NOT EXISTS btree_gist;

-- El negocio es la raiz del modelo: hoy hay uno, manana la app sera multi-negocio.
CREATE TABLE IF NOT EXISTS negocios (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text NOT NULL UNIQUE,
  nombre      text NOT NULL,
  tipo        text NOT NULL CHECK (tipo IN ('barberia', 'peluqueria', 'salon')),
  eslogan     text NOT NULL DEFAULT '',
  whatsapp    text NOT NULL DEFAULT '',
  direccion   text NOT NULL DEFAULT '',
  creado_en   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS servicios (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  negocio_id       uuid NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
  nombre           text NOT NULL,
  descripcion      text NOT NULL DEFAULT '',
  duracion_min     integer NOT NULL CHECK (duracion_min BETWEEN 10 AND 480),
  precio_centavos  integer NOT NULL CHECK (precio_centavos >= 0),
  orden            integer NOT NULL DEFAULT 0,
  activo           boolean NOT NULL DEFAULT true,
  UNIQUE (negocio_id, nombre)
);

CREATE TABLE IF NOT EXISTS profesionales (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  negocio_id    uuid NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
  nombre        text NOT NULL,
  especialidad  text NOT NULL DEFAULT '',
  bio           text NOT NULL DEFAULT '',
  orden         integer NOT NULL DEFAULT 0,
  activo        boolean NOT NULL DEFAULT true,
  UNIQUE (negocio_id, nombre)
);

-- dia_semana: 0 = domingo ... 6 = sabado. Sin fila = cerrado ese dia.
CREATE TABLE IF NOT EXISTS horarios (
  negocio_id  uuid NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
  dia_semana  smallint NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
  abre        time NOT NULL,
  cierra      time NOT NULL,
  PRIMARY KEY (negocio_id, dia_semana),
  CHECK (cierra > abre)
);

CREATE TABLE IF NOT EXISTS citas (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  negocio_id        uuid NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
  servicio_id       uuid NOT NULL REFERENCES servicios(id),
  profesional_id    uuid NOT NULL REFERENCES profesionales(id),
  inicio            timestamptz NOT NULL,
  fin               timestamptz NOT NULL,
  cliente_nombre    text NOT NULL,
  cliente_telefono  text NOT NULL,
  estado            text NOT NULL DEFAULT 'confirmada' CHECK (estado IN ('confirmada', 'cancelada', 'completada')),
  creada_en         timestamptz NOT NULL DEFAULT now(),
  CHECK (fin > inicio),
  -- Garantia a nivel de base de datos: un profesional no puede tener dos citas activas que se traslapen.
  -- Aunque dos personas reserven al mismo tiempo, solo una gana (la otra recibe error 23P01 -> HTTP 409).
  CONSTRAINT citas_sin_traslape EXCLUDE USING gist (
    profesional_id WITH =,
    tstzrange(inicio, fin) WITH &&
  ) WHERE (estado <> 'cancelada')
);

CREATE INDEX IF NOT EXISTS citas_negocio_inicio_idx ON citas (negocio_id, inicio);
