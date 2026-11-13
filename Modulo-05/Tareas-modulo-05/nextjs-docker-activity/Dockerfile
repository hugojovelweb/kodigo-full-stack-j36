# syntax=docker/dockerfile:1

# =============================================================================
# Next.js 16 · Dockerfile multi-stage (deps → builder → prod-deps → runner)
#
# NOTA SOBRE LA VERSIÓN DE NODE:
# La actividad recomienda node:18-alpine, pero Next.js 16 exige Node.js >= 20.9
# (Node 18 ya no está soportado). Por eso se usa node:22-alpine (LTS).
# Si tu proyecto usa Next.js 15 o anterior, puedes construir con Node 18 así:
#   docker build --build-arg NODE_VERSION=18 -t nextjs-docker-activity:1.0 .
# =============================================================================
ARG NODE_VERSION=22

# -----------------------------------------------------------------------------
# Etapa base: imagen oficial de Node.js sobre Alpine (liviana)
# -----------------------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS base
# libc6-compat: compatibilidad con binarios nativos que esperan glibc en Alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app

# -----------------------------------------------------------------------------
# Etapa 1 · deps: instala TODAS las dependencias (incluye devDependencies)
# Solo se copian los manifiestos para aprovechar la caché de capas de Docker.
# -----------------------------------------------------------------------------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# -----------------------------------------------------------------------------
# Etapa 2 · builder: copia el código y compila con `next build`
# -----------------------------------------------------------------------------
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# -----------------------------------------------------------------------------
# Etapa 3 · prod-deps: solo dependencias de producción (sin devDependencies)
# -----------------------------------------------------------------------------
FROM base AS prod-deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# -----------------------------------------------------------------------------
# Etapa 4 · runner: imagen final de producción (arranca con `next start`)
# -----------------------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Usuario sin privilegios (buena práctica de seguridad: no correr como root)
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

COPY --from=prod-deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder   --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder   --chown=nextjs:nodejs /app/public ./public
COPY --from=builder   --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder   --chown=nextjs:nodejs /app/next.config.ts ./next.config.ts

USER nextjs

# Puerto en el que escucha Next.js dentro del contenedor
EXPOSE 3000

# Comprueba que la app responde (wget viene incluido en Alpine/busybox)
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health >/dev/null 2>&1 || exit 1

# Comando de inicio: next start (script "start" de package.json)
CMD ["npm", "start"]
