# VIBE_CODING.md · Proceso de desarrollo guiado por IA

> **Borrador editable.** Refleja el flujo real de construcción con Claude. Antes de entregar, ajusta los prompts a los
> que tú escribiste y agrega tus capturas.

- **Proyecto:** Fade Lab, MVP de reservas para barberías/peluquerías/salones · **Autor:** Hugo Jovel (Hugo Jovel Web)
- **IA copiloto:** Claude (Anthropic) · **Stack:** Next.js 16, TypeScript, Tailwind CSS 4, Neon Postgres
- **Rol humano:** definir el producto, delimitar alcance, validar, probar y decidir. La IA propone; yo reviso.

## 1. Concepción

Elegí un tema con proyección de producto real. Antes de escribir código pedí un **análisis de encaje**: ¿cumple la rúbrica
(4+ rutas, API, Server/Client, hooks, loading/error, despliegue)? Conclusión: una landing sola no basta; el MVP debe ser un
flujo funcional de reservas. Decidí además la **persistencia desde el inicio (Neon)** para no construir sobre datos falsos.

Alcance de la actividad (Fase 0): catálogo público + reserva funcional. Fuera de alcance (fases siguientes): login, panel,
pagos, recordatorios, multi-negocio.

## 2. Prompts principales

| # | Prompt (resumen) | Resultado |
|---|---|---|
| P1 | "Analiza si este tema entra en la rúbrica y cómo escalaría a micro app, antes de tocar código." | Plan por fases y riesgos |
| P2 | "Diseña el modelo de datos con `negocio` como raíz, y evita doble reserva a nivel de base de datos." | `db/schema.sql` con restricción `EXCLUDE` |
| P3 | "Escribe el generador de horarios como función pura con pruebas (duración, traslape, anticipación)." | `lib/slots.ts` + 5 pruebas |
| P4 | "Crea repositorios, disponibilidad y Route Handlers con validación y códigos 400/401/404/409/422/500." | Capa de datos y API |
| P5 | "Crea el asistente de reserva en 4 pasos con `useState`/`useEffect`, `AbortController`, loading y error UI." | `components/reserva-wizard.tsx` |
| P6 | "Diseño minimalista oscuro (no negro puro), atractivo para jóvenes, responsive y dinámico." | Paleta carbón + lima, tarjetas y micro-animaciones |
| P7 | "Verifica todo: pruebas de integración de las reglas y smoke test de rutas y API." | Ver sección 6 |

## 3. Iteraciones

1. **Dominio y datos:** esquema, seed idempotente y script `db:setup`.
2. **Función pura de horarios** con pruebas antes de conectarla a nada.
3. **Repositorios y API:** el servidor revalida disponibilidad al reservar.
4. **UI:** tema, layout, header responsive, footer con sello y estados loading/error/404.
5. **Asistente de reserva:** cancelación de peticiones y reintento ante error.
6. **Verificación** con un PostgreSQL local y revisión de rutas (sección 6).

## 4. Decisiones técnicas

| Decisión | Motivo |
|---|---|
| `EXCLUDE USING gist` (profesional + rango de tiempo) | La integridad no depende del código: ni dos reservas simultáneas pueden traslaparse |
| Función pura para horarios | Es el corazón del negocio; se prueba sin base de datos |
| Capa de repositorios + `lib/db.ts` único | Cambiar de proveedor o agregar caché toca un solo lugar |
| `negocio` como raíz + tipo configurable | Camino directo a multi-negocio y a peluquerías/salones |
| Zona horaria explícita y precios en centavos | Evita errores clásicos de fechas y decimales |
| Neon con driver serverless (HTTP) | Funciona en Vercel sin administrar conexiones |
| Fuentes del sistema (sin `next/font/google`) | Sin dependencia de red en el build y carga más rápida |
| TypeScript fijado en 5.x | Compatibilidad con la cadena de herramientas de Next 16 |
| Páginas dinámicas (`force-dynamic`) | Leen la base de datos en cada petición; el build no necesita credenciales |

## 5. Desafíos y cómo se resolvieron

| Desafío | Solución |
|---|---|
| Evitar doble reserva con concurrencia | Restricción en la base de datos + manejo del error `23P01` como HTTP 409; probado con dos reservas simultáneas |
| Horarios y zonas horarias | `America/El_Salvador` (UTC−6, sin horario de verano) y cálculo del día local con `Intl` |
| Hidratación (fechas "de hoy" distintas en servidor y cliente) | La lista de días se calcula en `useEffect` tras el montaje |
| Condiciones de carrera al cambiar de día rápido | `AbortController` en el `fetch` de disponibilidad |
| No poder conectarme a Neon desde el entorno de desarrollo de la IA | Se verificó el esquema y las reglas con PostgreSQL local (pglite) y se documentó la conexión real a Neon paso a paso |
| `/reserva/[id]` inexistente devuelve 200 con página 404 | Comportamiento de streaming con `loading.tsx`; se marcó `noindex` y se documentó |
| Un `mkdir` con llaves falló en `sh` | Se reescribió con rutas explícitas y se revisó el árbol antes de seguir |

## 6. Verificación realizada

- `npm run build` y `npm run typecheck` sin errores; `npm test`: 5/5.
- **Integración contra PostgreSQL local:** esquema y seed ejecutados dos veces (idempotentes), traslape por duración,
  profesionales independientes, doble reserva rechazada (`23P01`), carrera simultánea (1 gana), citas contiguas permitidas,
  cancelar libera el horario, día cerrado / fecha pasada / fuera de rango / ids inexistentes.
- **Smoke test de la app (Next en producción):** las rutas responden 200 con el sello; API: 201, 409, 422, 400, 401 y 200 con clave.
- **Pendiente de verificar por ti:** conexión real a *tu* Neon, despliegue en Vercel y el asistente de reserva en navegador.

## 7. Evidencias para adjuntar

- [ ] Captura del proyecto y las tablas en Neon
- [ ] Captura de la app en producción (URL de Vercel)
- [ ] Captura del historial de commits
- [ ] Capturas de loading UI y error UI
- [ ] Captura de la conversación con la IA (prompts reales)
- [ ] Las capturas numeradas, el manual de la micro app y la matriz de cumplimiento de la rúbrica están en [`evidencias/`](./evidencias/) (documento Word, PDF e índice de capturas).

