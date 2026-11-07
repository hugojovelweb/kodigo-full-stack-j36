# syntax=docker/dockerfile:1.7
# =============================================================================
# Frontend Next.js 16+ (App Router) — build multi-stage que ejecuta `next start`
#
# Etapas:
#   base       -> imagen común (node:20-alpine + libc6-compat)
#   deps       -> instala TODAS las dependencias (npm ci) — capa cacheable
#   builder    -> compila (next build) con el código fuente
#   prod-deps  -> instala SOLO dependencias de producción (npm ci --omit=dev)
#   runner     -> imagen final: únicamente lo necesario para `next start`
#
# Requisitos del proyecto: package.json + package-lock.json (npm), carpeta public/
# y next.config.(js|mjs|ts). Si usas pnpm/yarn, adapta los comandos de install.
# =============================================================================
ARG NODE_VERSION=20

# ---------- base ----------
FROM node:${NODE_VERSION}-alpine AS base
# Compatibilidad glibc para binarios nativos (SWC/sharp) en Alpine (musl)
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ---------- deps: dependencias completas (necesarias para compilar) ----------
FROM base AS deps
# Solo los manifiestos: mientras no cambien, esta capa y el npm ci vienen de caché
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# ---------- builder: next build ----------
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* se incrusta en el bundle del navegador en tiempo de build
ARG NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}
# `npm run build` ejecuta `next build` (script estándar de create-next-app)
RUN npm run build \
    && rm -rf .next/cache

# ---------- prod-deps: solo dependencias de producción ----------
FROM base AS prod-deps
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

# ---------- runner: imagen final ----------
FROM node:${NODE_VERSION}-alpine AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
WORKDIR /app

# Solo lo necesario para `next start`
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=builder   --chown=node:node /app/.next        ./.next
COPY --from=builder   --chown=node:node /app/public       ./public
COPY --from=builder   --chown=node:node /app/package.json ./package.json
# Si tu proyecto no tiene next.config.*, elimina la línea siguiente
COPY --from=builder   --chown=node:node /app/next.config.* ./

# Usuario sin privilegios (viene incluido en la imagen oficial de Node)
USER node
EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=5 \
  CMD wget -q -O /dev/null http://127.0.0.1:3000/ || exit 1

# PID 1 = node directamente (recibe SIGTERM); equivale a `next start`
CMD ["node", "node_modules/next/dist/bin/next", "start"]
