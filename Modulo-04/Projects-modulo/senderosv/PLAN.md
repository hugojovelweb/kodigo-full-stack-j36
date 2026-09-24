# Espacio para planear mi solución (Reto SenderoSV)

## Archivos que voy a crear o modificar
- [x] `src/lib/queries.ts` (agregar 2 funciones: `getZonaBySlug`, `getRutasByZona`)
- [x] `src/app/zonas/[slug]/page.tsx` (nuevo)
- [x] `src/app/page.tsx` (convertir tarjetas de zona en `Link`)
- [x] `src/components/FiltroDificultad.tsx` (nuevo — extensión opcional)

## ¿Qué le voy a pasar a `generateStaticParams`?
Las zonas que ya existen, con `getZonas()`, transformadas a `{ slug }`:
`zonas.map((z) => ({ slug: z.slug }))`. Así se pre-genera una página estática
por zona en el build (occidente, oriente, central). Como `getZonas()` usa
`cache()`, la home y esta página no repiten la consulta dentro de un mismo render.

## ¿Qué pasa si `slug` no coincide con ninguna zona?
`getZonaBySlug` usa `maybeSingle()`, que devuelve `null` (no un error) cuando no
hay fila. La página detecta `!zona` y llama a `notFound()`, que renderiza mi
`not-found.tsx` personalizada. `generateMetadata` también maneja el `null`
y devuelve el título "Zona no encontrada".
Si de verdad falla Supabase (red, llave incorrecta), `getZonaBySlug` lanza
`Error` y se muestra `error.tsx` con el botón "Reintentar".

## Mi plan para el filtro de dificultad (opcional)
1. Crear `FiltroDificultad` como Client Component (`"use client"`), la única
   parte de la home que lo necesita.
2. Recibe `rutas: Ruta[]` por props (la home sigue siendo Server Component e ISR).
3. `useState<Dificultad | null>(null)` guarda el filtro activo (`null` = todas).
4. Antes de renderizar: `filtro ? rutas.filter(r => r.dificultad === filtro) : rutas`.
5. Botones Fácil / Moderada / Difícil (+ "Todas" para limpiar el filtro), con
   `aria-pressed` para accesibilidad, y mensaje si no hay resultados.
