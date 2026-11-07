#!/usr/bin/env bash
# Crea .env a partir de .env.example con contraseñas y llaves aleatorias.
# Uso: ./scripts/gen-secrets.sh        (no sobrescribe un .env existente)
#      ./scripts/gen-secrets.sh --force
set -euo pipefail
cd "$(dirname "$0")/.."

if [ -f .env ] && [ "${1:-}" != "--force" ]; then
  echo ".env ya existe. Usa --force para regenerarlo (se pierde el actual)."
  exit 0
fi
command -v openssl >/dev/null || { echo "Falta openssl (sudo apt install openssl)"; exit 1; }

cp .env.example .env
ROOT_PW="$(openssl rand -hex 16)"
DB_PW="$(openssl rand -hex 16)"
APP_KEY="base64:$(openssl rand -base64 32 | tr -d '\n')"
JWT="$(openssl rand -base64 48 | tr -d '\n')"

# Delimitador | porque base64 puede contener / y +
sed -i "s|^MYSQL_ROOT_PASSWORD=.*|MYSQL_ROOT_PASSWORD=${ROOT_PW}|" .env
sed -i "s|^MYSQL_PASSWORD=.*|MYSQL_PASSWORD=${DB_PW}|"             .env
sed -i "s|^APP_KEY=.*|APP_KEY=${APP_KEY}|"                          .env
sed -i "s|^JWT_SECRET=.*|JWT_SECRET=${JWT}|"                        .env
chmod 600 .env
echo ".env creado con secretos aleatorios (permisos 600). Revisa STRIPE_* si los usas."
