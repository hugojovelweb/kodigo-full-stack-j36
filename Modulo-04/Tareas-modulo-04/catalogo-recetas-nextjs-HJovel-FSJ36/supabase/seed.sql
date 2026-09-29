-- =========================================================
-- Datos de ejemplo: mínimo 5 registros en la tabla principal
-- Ejecutar DESPUÉS de schema.sql
-- =========================================================

insert into public.categorias (slug, nombre, descripcion) values
  ('postres',      'Postres',      'Dulces y postres para cualquier ocasión'),
  ('comida-rapida', 'Comida rápida', 'Recetas listas en menos de 30 minutos'),
  ('vegano',       'Vegano',       'Platillos 100% de origen vegetal')
on conflict (slug) do nothing;

insert into public.recetas
  (slug, titulo, descripcion, ingredientes, pasos, imagen_url, tiempo_preparacion, dificultad, categoria_id)
values
  (
    'pastel-de-chocolate',
    'Pastel de chocolate',
    'Un clásico pastel húmedo de chocolate, perfecto para cualquier celebración.',
    array['2 tazas de harina', '1 taza de cacao en polvo', '2 huevos', '1 taza de leche', '1 taza de azúcar'],
    array['Precalentar el horno a 180°C', 'Mezclar los ingredientes secos', 'Agregar los húmedos y batir', 'Hornear 35 minutos'],
    'https://images.unsplash.com/photo-1606313564200-e75d5e30476c',
    50,
    'Media',
    (select id from public.categorias where slug = 'postres')
  ),
  (
    'tacos-al-pastor',
    'Tacos al pastor',
    'Tacos jugosos marinados con achiote y piña, servidos en tortilla de maíz.',
    array['500g de cerdo', '2 cdas de achiote', 'Piña en trozos', 'Tortillas de maíz', 'Cebolla y cilantro'],
    array['Marinar la carne 2 horas', 'Cocinar en sartén o trompo', 'Picar finamente', 'Servir en tortillas con piña'],
    'https://images.unsplash.com/photo-1565299585323-38174c4a6471',
    40,
    'Media',
    (select id from public.categorias where slug = 'comida-rapida')
  ),
  (
    'ensalada-de-quinoa',
    'Ensalada de quinoa',
    'Ensalada fresca y ligera con quinoa, vegetales de temporada y limón.',
    array['1 taza de quinoa', 'Tomate cherry', 'Pepino', 'Jugo de limón', 'Aceite de oliva'],
    array['Cocinar la quinoa', 'Picar los vegetales', 'Mezclar todo', 'Aliñar con limón y aceite'],
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
    20,
    'Fácil',
    (select id from public.categorias where slug = 'vegano')
  ),
  (
    'hamburguesa-clasica',
    'Hamburguesa clásica',
    'Hamburguesa casera con carne jugosa, queso derretido y vegetales frescos.',
    array['200g de carne molida', 'Pan de hamburguesa', 'Queso cheddar', 'Lechuga y tomate', 'Salsas al gusto'],
    array['Formar la carne en discos', 'Cocinar a la plancha', 'Armar con el pan y vegetales'],
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
    25,
    'Fácil',
    (select id from public.categorias where slug = 'comida-rapida')
  ),
  (
    'brownie-vegano',
    'Brownie vegano',
    'Brownie húmedo sin ingredientes de origen animal, con un toque intenso de chocolate.',
    array['1 taza de harina', '1/2 taza de cacao', '1 taza de leche vegetal', '1/2 taza de aceite', '1 taza de azúcar'],
    array['Mezclar secos y húmedos por separado', 'Unir ambas mezclas', 'Hornear 25 minutos a 180°C'],
    'https://images.unsplash.com/photo-1606313564200-e75d5e30476c',
    35,
    'Fácil',
    (select id from public.categorias where slug = 'vegano')
  );
