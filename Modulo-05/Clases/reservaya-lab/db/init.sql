-- Se ejecuta una sola vez, cuando el volumen de la base de datos está vacío.
CREATE TABLE IF NOT EXISTS reservas (
  id         SERIAL PRIMARY KEY,
  cliente    TEXT NOT NULL,
  personas   INT  NOT NULL CHECK (personas > 0),
  fecha      DATE NOT NULL,
  creada_en  TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO reservas (cliente, personas, fecha) VALUES
  ('Ana López', 2, '2026-11-20'),
  ('Carlos Méndez', 4, '2026-11-21');
