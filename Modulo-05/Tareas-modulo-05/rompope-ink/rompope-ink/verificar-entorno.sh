#!/usr/bin/env bash
# verificar-entorno.sh — Debian XFCE 13: revisa el proyecto ANTES de subirlo a Amplify.
# Uso:  bash verificar-entorno.sh [ruta-del-proyecto]     (por defecto: carpeta actual)
# Con build local:  RUN_BUILD=1 bash verificar-entorno.sh ~/Escritorio/mi-proyecto
set -u
cd "${1:-.}" || { echo "No existe la ruta indicada"; exit 2; }
ERR=0
ok()   { echo "  [OK]   $1"; }
fail() { echo "  [FALLA] $1"; ERR=1; }
warn() { echo "  [AVISO] $1"; }

echo "== Herramientas =="
if command -v node >/dev/null; then
  if node -e 'const [a,b]=process.versions.node.split(".").map(Number);process.exit(a>20||(a===20&&b>=9)?0:1)'; then
    ok "Node $(node -v) (>= 20.9)"
  else fail "Node $(node -v) es menor a 20.9 (Next.js 16 lo exige). Usa: nvm install 22"; fi
else fail "Node no instalado"; fi
command -v npm >/dev/null && ok "npm $(npm -v)" || fail "npm no instalado"
command -v git >/dev/null && ok "$(git --version)" || fail "git no instalado"

echo "== Proyecto: $(pwd) =="
[ -f package.json ]   && ok "package.json"   || fail "falta package.json (¿estás en la carpeta correcta?)"
[ -f package-lock.json ] && ok "package-lock.json (necesario para npm ci)" || fail "sin package-lock.json: amplify.yml usa npm ci. Genéralo con npm install y súbelo (o cambia npm ci por npm install)"
grep -q '"build"' package.json 2>/dev/null && ok 'script "build" definido' || fail 'package.json no tiene script "build"'
grep -q '"next"' package.json 2>/dev/null && ok "dependencia next" || fail "no se encontró next en package.json"
[ -f .env.example ]   && ok ".env.example"   || fail "falta .env.example"
[ -f amplify.yml ]    && ok "amplify.yml"    || warn "sin amplify.yml (Amplify generará uno; se recomienda incluirlo)"
[ -f README.md ]      && ok "README.md"      || fail "falta README.md"
[ -f README.md ] && grep -qi 'amplifyapp.com\|https\?://' README.md && ok "README contiene una URL" || warn "README sin URL pública todavía"

echo "== Seguridad =="
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  if git ls-files | grep -E '(^|/)\.env(\.[a-z]+)?$' | grep -v '\.example$' | grep -q .; then
    fail "hay archivos .env versionados en Git (¡sácalos con git rm --cached y rota las claves!)"
  else ok "ningún .env real está versionado"; fi
else warn "no es un repositorio Git todavía (git init)"; fi
grep -qE '^\.env' .gitignore 2>/dev/null && ok ".gitignore ignora .env*" || fail ".gitignore no ignora .env*"

echo "== Sello de footer (skill sello-footer) =="
if grep -rqs --include='*.tsx' --include='*.jsx' --include='*.ts' --include='*.js' 'Hugo Jovel Web' app components src 2>/dev/null; then
  ok "sello 'Hugo Jovel Web' encontrado en el código"
else fail "no se encontró el sello de footer (usa site-footer.tsx)"; fi

if [ "${RUN_BUILD:-0}" = "1" ]; then
  echo "== Build local =="
  npm ci && npm run build && ok "npm run build terminó sin errores" || fail "npm run build falló"
else
  echo "(Para probar el build:  RUN_BUILD=1 bash verificar-entorno.sh)"
fi

echo
[ "$ERR" -eq 0 ] && echo "Listo para subir a GitHub y desplegar en Amplify." || echo "Corrige los puntos marcados como FALLA antes de desplegar."
exit "$ERR"
