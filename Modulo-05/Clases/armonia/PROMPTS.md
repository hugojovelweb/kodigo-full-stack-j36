# PROMPTS.md · Landing "Armonía"

Registro de los prompts usados y de lo que hubo que corregir. La rúbrica pide ser honesto sobre lo que la IA hizo mal.
Las líneas con ✏️ las debes completar tú con lo que veas en tu propia sesión: no las dejes con texto inventado.

Los prompts completos están en `docs/PASO_A_PASO.md`.

---

## Prompt 1 · Mockup a partir de 2 referencias (Gemini o ChatGPT)

- **Herramienta:** ✏️ Gemini / ChatGPT
- **Referencias usadas:** ✏️ links o nombres (estructura + colores)
- **Prompt:** Prompt A de `docs/PASO_A_PASO.md` (academia "Armonía", modo oscuro, degradado violeta y ámbar, íconos Aprende / Practica / Preséntate, 16:9).
- **Qué hubo que corregir:** ✏️ (ej.: la primera versión traía menú; texto con errores de ortografía; pedí otra versión)

## Prompt 2 · Fondo sin texto

- **Prompt:** Prompt B (mismo fondo, sin textos, botones, íconos, logos ni círculos).
- **Qué hubo que corregir:** ✏️ (ej.: la imagen seguía con un círculo; resolución baja)
- **Nota:** el `hero.jpg` incluido en este proyecto es un fondo de ejemplo generado con ffmpeg (`scripts/generar-fondos.sh`), no el del mockup. Reemplázalo.

## Prompt 3 · Contexto + hero

- **Prompt:** bloque de contexto (Next.js 16, Tailwind 4 con `@theme`, `next/font`, lucide-react, `"use client"`) + tarea del hero, adaptado a "Armonía".
- **Qué hubo que corregir:**
  - Se añadió al contexto que `next.config.ts` trae `cacheComponents` activado. Según la documentación local de Next 16 (`node_modules/next/dist/docs`), `new Date()` en el prerender rompe el build; por eso el año del footer vive en una función con `"use cache"` y `cacheLife("days")`.
  - El texto sobre el video usa `text-shadow` y no un overlay de color, porque la guía prohíbe el overlay sobre el video.
  - ✏️ Añade aquí lo que tuviste que corregir en tu sesión con claude.ai.

## Prompt 4 · Video de fondo

- **Prompt:** agregar `/videos/hero.mp4` sobre `/hero.jpg`, con `autoPlay`, `muted`, `loop`, `playsInline` y sin overlay.
- **Qué hubo que corregir:**
  - Se añadió `motion-reduce:hidden` al video para respetar a quien tiene el movimiento reducido (queda la imagen).
  - Los videos incluidos son degradados animados generados con ffmpeg (720p, menos de 1 MB). ✏️ Si usas videos de Pexels, anota cuáles y cuánto pesan.

## Prompt 5 · Funciones en zigzag, testimonios, CTA y fade-in

- **Prompt:** Paso 8 de `docs/PASO_A_PASO.md`.
- **Qué hubo que corregir:**
  - El bloque invertido se resolvió con `md:order-2` y `md:order-1`, sin duplicar markup.
  - El fade-in respeta `prefers-reduced-motion` (`motion-reduce:opacity-100`).
  - ✏️ Añade lo que te falló a ti (espacios, alturas, textos).

## Prompt 6 · Revisión en móvil (390 px)

- **Prompt:** lista numerada de problemas con captura, "arregla solo eso, sin cambiar escritorio".
- **Qué hubo que corregir:**
  - En el proyecto base se midió `scrollWidth` = `clientWidth` = 390: no hubo scroll horizontal.
  - Los 3 pasos del hero quedan en una fila de 3 columnas en móvil, solo ícono y título; la descripción aparece desde `sm`.
  - ✏️ Anota los problemas que viste tú en tu captura.

## Prompt 7 · (opcional) Ediciones precisas

- **Prompt:** ✏️ pega el mensaje numerado que enviaste (tamaños, espacios, quitar bordes).
- **Qué hubo que corregir:** ✏️
