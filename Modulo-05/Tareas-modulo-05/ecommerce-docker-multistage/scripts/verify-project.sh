#!/usr/bin/env bash
# Comprueba que el repositorio está completo y es seguro subirlo a GitHub.
set -uo pipefail
cd "$(dirname "$0")/.."
RC=0
ok(){ printf "  [OK]    %s\n" "$1"; }
fail(){ printf "  [FALLA] %s\n" "$1"; RC=1; }
chk(){ if [ -e "$1" ]; then ok "$1"; else fail "falta $1"; fi; }

echo "== Archivos de orquestación =="
for f in docker-compose.yml .env.example README.md frontend/Dockerfile backend/Dockerfile \
         backend/docker/entrypoint.sh backend/docker/nginx/default.conf database/init/01-init.sql; do chk "$f"; done

echo "== Código fuente importado =="
for f in frontend/package.json frontend/package-lock.json frontend/public \
         backend/artisan backend/composer.json backend/composer.lock backend/public/index.php; do chk "$f"; done
ls frontend/next.config.* >/dev/null 2>&1 && ok "frontend/next.config.*" || fail "falta frontend/next.config.* (o quita esa línea del Dockerfile)"
[ -f frontend/COLOCA-AQUI-TU-FRONTEND.md ] && fail "borra frontend/COLOCA-AQUI-TU-FRONTEND.md (importa primero tu código)"
[ -f backend/COLOCA-AQUI-TU-API-LARAVEL.md ] && fail "borra backend/COLOCA-AQUI-TU-API-LARAVEL.md (importa primero tu código)"

echo "== Sello de footer (skill sello-footer) =="
if grep -rqs "Hugo Jovel Web" --include='*.tsx' --include='*.jsx' --exclude-dir=node_modules --exclude-dir=.next frontend; then
  ok "Sello presente en el frontend"
  grep -rqs "getFullYear" --include='*.tsx' --include='*.jsx' --exclude-dir=node_modules --exclude-dir=.next frontend && ok "Año dinámico" || fail "El año debe calcularse con new Date().getFullYear()"
  grep -rqs "noopener noreferrer" --include='*.tsx' --include='*.jsx' --exclude-dir=node_modules --exclude-dir=.next frontend && ok "rel noopener noreferrer" || fail "Falta rel=\"noopener noreferrer\""
else fail "No se encontró el sello 'Hugo Jovel Web' en frontend/ (usa snippets/site-footer.tsx)"; fi

echo "== Seguridad =="
if [ -f .env ] && git ls-files --error-unmatch .env >/dev/null 2>&1; then fail ".env está versionado en Git"; else ok ".env no está versionado"; fi
if grep -rEIl --exclude-dir=node_modules --exclude-dir=vendor --exclude-dir=.git --exclude-dir=.next --exclude=.env \
     -e 'sk_(live|test)_[A-Za-z0-9]{16,}' -e 'whsec_[A-Za-z0-9]{16,}' . 2>/dev/null | grep -q .; then
  fail "Se detectó una posible llave de Stripe real en archivos del repo (reemplázala por un placeholder)"
else ok "Sin llaves de Stripe en el repo"; fi

echo "== docker compose =="
if ! command -v docker >/dev/null 2>&1; then
  printf "  [AVISO] docker no instalado: se omite la validación de compose\n"
elif [ -f .env ]; then
  docker compose config -q 2>/dev/null && ok "docker compose config válido" || fail "docker compose config falló (revisa .env)"
else ok "(sin .env: omitido; corre ./scripts/gen-secrets.sh)"; fi
exit $RC
