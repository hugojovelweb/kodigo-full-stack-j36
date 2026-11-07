#!/usr/bin/env bash
# Construye la línea base (naive) y las imágenes optimizadas y imprime una tabla Markdown.
# Pega el resultado en README.md (sección "Resultados de optimización").
set -euo pipefail
cd "$(dirname "$0")/.."

size_mb(){ docker image inspect -f '{{.Size}}' "$1" | awk '{printf "%.0f", $1/1048576}'; }
build_secs(){ local s=$(date +%s); "$@" >/dev/null 2>&1; echo $(( $(date +%s) - s )); }

echo ">> Construyendo líneas base (sin caché)..." >&2
T_FN=$(build_secs docker build --no-cache -t cmp/frontend-naive -f docs/baseline/frontend.naive.Dockerfile ./frontend)
T_BN=$(build_secs docker build --no-cache -t cmp/backend-naive  -f docs/baseline/backend.naive.Dockerfile  ./backend)
echo ">> Construyendo imágenes optimizadas (sin caché)..." >&2
T_FO=$(build_secs docker build --no-cache -t cmp/frontend-opt ./frontend)
T_BO=$(build_secs docker build --no-cache -t cmp/backend-opt  ./backend)
echo ">> Reconstrucción tras cambiar 1 archivo de código (caché de capas)..." >&2
touch frontend/.rebuild-probe backend/.rebuild-probe
T_FR=$(build_secs docker build -t cmp/frontend-opt ./frontend)
T_BR=$(build_secs docker build -t cmp/backend-opt  ./backend)
rm -f frontend/.rebuild-probe backend/.rebuild-probe

cat <<TABLE

| Servicio | Imagen base ingenua | Imagen optimizada | Build sin caché (antes → después) | Rebuild con caché |
|----------|--------------------:|------------------:|----------------------------------:|------------------:|
| Frontend Next.js | $(size_mb cmp/frontend-naive) MB | $(size_mb cmp/frontend-opt) MB | ${T_FN}s → ${T_FO}s | ${T_FR}s |
| Backend Laravel  | $(size_mb cmp/backend-naive) MB  | $(size_mb cmp/backend-opt) MB  | ${T_BN}s → ${T_BO}s | ${T_BR}s |
TABLE
echo; echo "Capas de la imagen optimizada del backend:"; docker history --format '{{.Size}}\t{{.CreatedBy}}' cmp/backend-opt | head -15
