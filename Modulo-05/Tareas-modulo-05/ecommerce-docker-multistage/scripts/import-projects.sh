#!/usr/bin/env bash
# Copia tus proyectos del bootcamp a backend/ y frontend/ SIN node_modules, vendor, .env ni builds.
# Uso: ./scripts/import-projects.sh "<ruta-api-laravel>" "<ruta-frontend-nextjs>"
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API_SRC="${1:-}"; FRONT_SRC="${2:-}"
[ -d "$API_SRC" ]   || { echo "Ruta de la API no válida: '$API_SRC'"; exit 1; }
[ -d "$FRONT_SRC" ] || { echo "Ruta del frontend no válida: '$FRONT_SRC'"; exit 1; }

# tar en lugar de rsync: viene instalado por defecto en Debian. Se conservan nuestros
# Dockerfile, .dockerignore y docker/ aunque tu proyecto tenga los suyos.
copy_tree() { # $1=origen $2=destino; resto = exclusiones
  src="$1"; dst="$2"; shift 2
  args=""
  for e in "$@"; do args="$args --exclude=$e"; done
  # shellcheck disable=SC2086
  tar -C "$src" $args -cf - . | tar -C "$dst" -xf -
}

echo ">> API Laravel: $API_SRC -> backend/"
copy_tree "$API_SRC" "$ROOT/backend" \
  ./vendor ./node_modules ./.git ./.env './.env.*' ./storage/logs ./storage/framework/cache \
  ./storage/framework/sessions ./storage/framework/views './bootstrap/cache/*.php' \
  ./public/hot ./public/storage ./Dockerfile ./.dockerignore ./docker ./docker-compose.yml
rm -f "$ROOT/backend/COLOCA-AQUI-TU-API-LARAVEL.md"
# Estructura de storage necesaria aunque venga vacía
mkdir -p "$ROOT/backend"/storage/framework/{cache/data,sessions,views} "$ROOT/backend/storage/logs" "$ROOT/backend/bootstrap/cache"

echo ">> Frontend Next.js: $FRONT_SRC -> frontend/"
copy_tree "$FRONT_SRC" "$ROOT/frontend" \
  ./node_modules ./.next ./.git ./.env './.env.*' ./out ./coverage \
  ./Dockerfile ./Dockerfile.standalone ./.dockerignore ./docker-compose.yml
rm -f "$ROOT/frontend/COLOCA-AQUI-TU-FRONTEND.md"

# Sello de footer (skill sello-footer): solo si el frontend aún no lo tiene
if ! grep -rqs "Hugo Jovel Web" --include='*.tsx' --include='*.jsx' --include='*.ts' --include='*.js' \
     --exclude-dir=node_modules --exclude-dir=.next "$ROOT/frontend"; then
  if   [ -d "$ROOT/frontend/src/app" ]; then DEST="$ROOT/frontend/src/components"
  elif [ -d "$ROOT/frontend/app" ];     then DEST="$ROOT/frontend/components"
  else DEST=""; fi
  if [ -n "$DEST" ]; then
    mkdir -p "$DEST"; cp "$ROOT/snippets/site-footer.tsx" "$DEST/site-footer.tsx"
    echo ">> Copiado $DEST/site-footer.tsx"
    echo "   PENDIENTE: importa <SiteFooter stack=\"...\"/> en tu app/layout.tsx (ver cabecera del archivo)."
  else
    echo "   AVISO: no se encontró app/ ni src/app/; copia snippets/site-footer.tsx a mano."
  fi
fi
echo "Listo. Siguiente paso: ./scripts/verify-project.sh"
