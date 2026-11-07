#!/usr/bin/env bash
# Verifica el entorno del host (Debian XFCE 13 o WSL2): Docker, Compose, BuildKit, puertos.
set -uo pipefail
ok(){ printf "  [OK]    %s\n" "$1"; }
warn(){ printf "  [AVISO] %s\n" "$1"; }
fail(){ printf "  [FALLA] %s\n" "$1"; RC=1; }
RC=0

echo "== Docker =="
if command -v docker >/dev/null; then ok "$(docker --version)"; else fail "docker no está instalado (ver docs/INSTALACION.md)"; fi
if docker info >/dev/null 2>&1; then ok "El daemon responde (contexto: $(docker context show 2>/dev/null))"; else fail "El daemon no responde o tu usuario no está en el grupo docker"; fi
if docker compose version >/dev/null 2>&1; then ok "$(docker compose version)"; else fail "Falta el plugin docker compose v2"; fi
if docker buildx version >/dev/null 2>&1; then ok "buildx disponible (necesario para --mount=type=cache)"; else warn "buildx no encontrado; instala docker-buildx-plugin"; fi

echo "== Puertos del host (si están ocupados, cambia FRONTEND_PORT / BACKEND_PORT en .env) =="
for p in 3000 8000 3306 3307; do
  if ss -ltn 2>/dev/null | awk '{print $4}' | grep -Eq "[:.]${p}$"; then warn "Puerto $p EN USO (¿php artisan serve, next dev o MariaDB local?)"; else ok "Puerto $p libre"; fi
done

echo "== Recursos =="
df -h . | awk 'NR==2{print "  Espacio libre aquí: "$4}'
exit $RC
