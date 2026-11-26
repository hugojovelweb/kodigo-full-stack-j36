-- Fade Lab · datos de ejemplo (FICTICIOS). Idempotente.

INSERT INTO negocios (slug, nombre, tipo, eslogan, whatsapp, direccion)
VALUES ('fade-lab', 'Fade Lab', 'barberia', 'Cortes con precisión. Estilo sin ruido.', '50300000000', 'Col. Escalón, San Salvador (dirección ficticia)')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO servicios (negocio_id, nombre, descripcion, duracion_min, precio_centavos, orden)
SELECT n.id, v.nombre, v.descripcion, v.duracion_min, v.precio, v.orden
FROM negocios n,
(VALUES
  ('Corte clásico', 'Tijera o máquina, acabado limpio y peinado.', 30, 800, 1),
  ('Fade + diseño', 'Degradado a tu medida con líneas o diseño.', 45, 1200, 2),
  ('Barba y perfilado', 'Perfilado con navaja, toalla caliente y aceite.', 30, 600, 3),
  ('Corte + barba', 'El combo completo para salir listo.', 60, 1500, 4),
  ('Color y mechas', 'Decoloración, tinte o mechas con tratamiento.', 90, 3500, 5),
  ('Lavado y peinado', 'Lavado, masaje capilar y peinado de salida.', 30, 700, 6)
) AS v(nombre, descripcion, duracion_min, precio, orden)
WHERE n.slug = 'fade-lab'
ON CONFLICT (negocio_id, nombre) DO NOTHING;

INSERT INTO profesionales (negocio_id, nombre, especialidad, bio, orden)
SELECT n.id, v.nombre, v.especialidad, v.bio, v.orden
FROM negocios n,
(VALUES
  ('Kevin M.', 'Fades y diseños', 'Degradados limpios y líneas con precisión milimétrica.', 1),
  ('Dani R.', 'Color y estilismo', 'Color, texturas y cortes con tendencia.', 2),
  ('Rafa C.', 'Barba y clásicos', 'Barbería tradicional con toque moderno.', 3)
) AS v(nombre, especialidad, bio, orden)
WHERE n.slug = 'fade-lab'
ON CONFLICT (negocio_id, nombre) DO NOTHING;

-- Lunes a viernes 09:00-19:00, sabado 08:00-16:00, domingo cerrado.
INSERT INTO horarios (negocio_id, dia_semana, abre, cierra)
SELECT n.id, d.dia, d.abre::time, d.cierra::time
FROM negocios n,
(VALUES
  (1, '09:00', '19:00'), (2, '09:00', '19:00'), (3, '09:00', '19:00'),
  (4, '09:00', '19:00'), (5, '09:00', '19:00'), (6, '08:00', '16:00')
) AS d(dia, abre, cierra)
WHERE n.slug = 'fade-lab'
ON CONFLICT (negocio_id, dia_semana) DO NOTHING;
