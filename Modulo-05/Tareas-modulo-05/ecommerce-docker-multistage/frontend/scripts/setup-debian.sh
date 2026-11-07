#!/usr/bin/env bash
# Instalación en Debian 13 (XFCE). Uso:  bash scripts/setup-debian.sh
set -euo pipefail

echo "▶ 1/4 Paquetes base (git, curl, chromium para Lighthouse)…"
sudo apt update
sudo apt install -y git curl ca-certificates build-essential chromium

echo "▶ 2/4 Node.js (se requiere >= 20.9; se instala la LTS 22 con nvm si hace falta)…"
need_node=1
if command -v node >/dev/null 2>&1; then
  major="$(node -p 'process.versions.node.split(".")[0]')"
  minor="$(node -p 'process.versions.node.split(".")[1]')"
  if [ "$major" -gt 20 ] || { [ "$major" -eq 20 ] && [ "$minor" -ge 9 ]; }; then need_node=0; fi
fi
if [ "$need_node" -eq 1 ]; then
  export NVM_DIR="$HOME/.nvm"
  if [ ! -s "$NVM_DIR/nvm.sh" ]; then
    curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
  fi
  # shellcheck disable=SC1091
  . "$NVM_DIR/nvm.sh"
  nvm install 22
  nvm use 22
fi
echo "   node $(node -v) · npm $(npm -v)"

echo "▶ 3/4 Variables de entorno…"
[ -f .env.local ] || cp .env.example .env.local
echo "   .env.local listo (edita BASE_URL si tu API no está en http://localhost:8000/api)"

echo "▶ 4/4 Dependencias del proyecto…"
npm install

echo
echo "✔ Listo. Arranca con:  npm run dev   →  http://localhost:3000"
