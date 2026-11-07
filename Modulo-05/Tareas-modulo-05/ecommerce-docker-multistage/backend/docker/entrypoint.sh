#!/bin/sh
# Entrypoint de la API Laravel: prepara cachés con las variables de entorno
# REALES del contenedor y luego arranca supervisord (PHP-FPM + Nginx).
set -e
cd /var/www/html

if [ -z "${APP_KEY:-}" ]; then
  echo "[entrypoint] ERROR: APP_KEY no está definida (ver .env / scripts/gen-secrets.sh)" >&2
  exit 1
fi

# Si storage/ viene de un volumen vacío, recrea la estructura que Laravel necesita
mkdir -p storage/framework/cache/data storage/framework/sessions \
         storage/framework/views storage/logs storage/api-docs bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

# Todo artisan corre como www-data (así los archivos creados no quedan de root)
artisan() { su-exec www-data:www-data php artisan "$@"; }

echo "[entrypoint] package:discover"
artisan package:discover --ansi

if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
  echo "[entrypoint] migrate --force"
  artisan migrate --force
fi

if [ "${RUN_SWAGGER_GENERATE:-false}" = "true" ] \
   && artisan list --raw 2>/dev/null | grep -q '^l5-swagger:generate'; then
  echo "[entrypoint] l5-swagger:generate"
  artisan l5-swagger:generate || echo "[entrypoint] aviso: no se pudo generar Swagger"
fi

artisan storage:link --force >/dev/null 2>&1 || true

echo "[entrypoint] cachés de producción"
artisan config:cache || echo "[entrypoint] aviso: config:cache falló"
artisan route:cache  || echo "[entrypoint] aviso: route:cache falló (¿rutas con closures?)"
artisan event:cache  || true
artisan view:cache   || true

exec "$@"
