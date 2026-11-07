# LÍNEA BASE (antes de optimizar): una sola etapa, imagen completa, sin caché de capas.
# Solo se usa en scripts/compare-sizes.sh para medir la mejora.
FROM node:20
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
