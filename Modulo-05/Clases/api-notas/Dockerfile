# syntax=docker/dockerfile:1

# ---------- Etapa 1: dependencias ----------
# Aquí se instalan los paquetes. Esta etapa NO llega a la imagen final;
# solo se copia de ella lo necesario (node_modules).
FROM node:22-alpine AS deps
RUN apk upgrade --no-cache
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---------- Etapa 2: runtime (imagen final) ----------
FROM node:22-alpine3.22 AS runtime
RUN apk upgrade --no-cache
ENV NODE_ENV=production \
  PORT=3000 \
  DATA_DIR=/app/data
WORKDIR /app

COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json ./
COPY --chown=node:node src ./src

# Carpeta de datos con dueño "node". Al montar un volumen NOMBRADO aquí,
# Docker hereda estos permisos y el usuario no-root puede escribir.
# (No se usa la instrucción VOLUME a propósito: así, sin -v, los datos
# viven en la capa del contenedor y se pierden al borrarlo.)
RUN mkdir -p /app/data && chown node:node /app/data

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "src/server.js"]
