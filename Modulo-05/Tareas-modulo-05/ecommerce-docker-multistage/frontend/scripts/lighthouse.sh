#!/usr/bin/env bash
# Genera reportes Lighthouse (HTML) en docs/evidencias/lighthouse/
# Requisitos: API encendida, `npm run build && npm run start` corriendo en :3000
# y Chromium/Chrome instalado (Debian: sudo apt install chromium).
set -euo pipefail
BASE="${1:-http://localhost:3000}"
OUT="docs/evidencias/lighthouse"
mkdir -p "$OUT"

if [ -z "${CHROME_PATH:-}" ]; then
  for c in chromium chromium-browser google-chrome google-chrome-stable; do
    if command -v "$c" >/dev/null 2>&1; then export CHROME_PATH="$(command -v "$c")"; break; fi
  done
fi
echo "Chrome: ${CHROME_PATH:-no encontrado}"

for route in productos productos/1 carrito; do
  name="$(echo "$route" | tr / -)"
  echo "▶ $BASE/$route"
  npx --yes lighthouse "$BASE/$route" \
    --chrome-flags="--headless=new --no-sandbox" \
    --only-categories=performance,accessibility,best-practices,seo \
    --output=html --output=json --output-path="$OUT/$name" --quiet
done
echo "✔ Reportes en $OUT (abre los .report.html en el navegador y toma captura/PDF)"
