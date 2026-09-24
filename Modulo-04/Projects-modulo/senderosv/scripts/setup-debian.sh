#!/usr/bin/env bash
# =============================================================
# SenderoSV - preparación del entorno en Debian 13 (XFCE)
# Uso (desde la raíz del proyecto):  bash scripts/setup-debian.sh
# No requiere ejecutarse como root (solo pide sudo para apt).
# =============================================================
set -euo pipefail

echo "==> 1/5 Paquetes base (git, curl, build-essential)"
sudo apt update
sudo apt install -y git curl ca-certificates build-essential

echo "==> 2/5 nvm (gestor de versiones de Node, se instala en ~/.nvm)"
export NVM_DIR="$HOME/.nvm"
if [ ! -s "$NVM_DIR/nvm.sh" ]; then
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
fi
# shellcheck disable=SC1091
. "$NVM_DIR/nvm.sh"

echo "==> 3/5 Node.js LTS (Next.js 16 exige Node >= 20.9)"
nvm install --lts
nvm use --lts
node -v
npm -v

echo "==> 4/5 pnpm"
npm install -g pnpm
pnpm -v

echo "==> 5/5 Dependencias del proyecto"
pnpm install

if [ ! -f .env.local ]; then
  cp .env.local.example .env.local
  echo
  echo "!! Se creó .env.local desde la plantilla."
  echo "!! Edítalo con tu URL y tu llave publishable de Supabase antes de correr 'pnpm dev'."
fi

echo
echo "Listo. Siguiente paso:  pnpm dev   ->  http://localhost:3000"
