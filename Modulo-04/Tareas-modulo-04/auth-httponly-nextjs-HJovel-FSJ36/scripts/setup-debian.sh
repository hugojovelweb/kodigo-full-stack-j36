#!/usr/bin/env bash
# Prepara el proyecto en Debian XFCE 13: verifica herramientas, instala dependencias
# y crea .env.local. Uso:   chmod +x scripts/setup-debian.sh && ./scripts/setup-debian.sh
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Verificando herramientas…"
need_node_major=20
if ! command -v node >/dev/null 2>&1; then
  echo "✗ Node.js no está instalado."
  echo "  Instálalo con nvm (recomendado):"
  echo "    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash"
  echo "    source ~/.bashrc && nvm install 24"
  exit 1
fi
node_major="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$node_major" -lt "$need_node_major" ]; then
  echo "✗ Node $(node -v) es muy antiguo. Se requiere >= ${need_node_major}.9 (recomendado 24)."
  exit 1
fi
echo "✓ Node $(node -v) · npm $(npm -v) · $(git --version)"

echo "==> Instalando dependencias (npm ci si hay package-lock.json)…"
if [ -f package-lock.json ]; then npm ci; else npm install; fi

if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo "✓ Creado .env.local desde .env.example"
  echo "  ➜ Edítalo con tu DATABASE_URL de Neon:  nano .env.local   (o  code .env.local)"
else
  echo "• .env.local ya existe, no se modifica."
fi

echo "==> Verificación de tipos…"
npm run typecheck

echo
echo "Listo. Siguientes pasos:  npm run db:migrate  (crea las tablas en Neon)  y luego  npm run dev  →  http://localhost:3000"
