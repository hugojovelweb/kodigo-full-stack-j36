# Bitácora de Vibe Coding — Rompope Ink

Proyecto construido conversando con IA (Claude) desde cero durante la semana de Vibe Coding.

## Decisiones

| Decisión | Motivo |
|---|---|
| Landing de estudio de tatuajes (en vez de la micro app de citas) | Cero base de datos ni secretos críticos → menor riesgo de despliegue; la micro app con WhatsApp API queda como proyecto aparte |
| Next.js **15** | Soporte oficial de Amplify Hosting SSR; Next 16 no figura como oficialmente soportado |
| `output: "standalone"` solo con `DOCKER_BUILD=1` | Imagen Docker pequeña sin alterar el build de Amplify |
| Variables `NEXT_PUBLIC_*` + `/api/health` | El paso de variables de producción es real y se puede verificar en la URL |
| WhatsApp con enlace `wa.me` | Sin API ni costo; el número real se cambia solo con una variable |
| Imágenes y logo ficticios (SVG propios) | No usar material con derechos de terceros |

## Prompts clave

1. «Landing de un tatuador: marca "Rompope Ink", vintage-moderno-minimalista, que destaque; botón de cita con scroll.»
2. «Dockerizar con multi-stage y compose; documentar para Debian y Windows.»
3. «Desplegar en AWS Amplify desde un monorepo con variables de entorno en producción.»

## Problemas encontrados

- **TypeScript 7** no es compatible con Next 15 → fijado a TypeScript 5.
- `next.config.ts` falló al cargar → se usa `next.config.mjs`.
- Alias `@/` no resolvía en la verificación → imports relativos.
