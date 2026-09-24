#!/usr/bin/env bash
###############################################################################
# Author: Hugo Ernesto Jovel Hernandez
# probar-endpoints-biblioteca-api.sh
#
# Prueba, en orden, los 9 endpoints pedidos por la tarea:
#   register -> login -> me -> books(sin token, debe fallar) ->
#   books(crear) -> books(listar) -> books(ver uno) -> books(actualizar) ->
#   books(eliminar) -> logout -> me(con token ya invalido, debe fallar)
#
# Requiere que "php artisan serve" ya este corriendo en otra terminal.
# Requiere python3 (para leer JSON) - Debian XFCE lo trae por defecto.
#
# Uso:
#   chmod +x probar-endpoints-biblioteca-api.sh
#   ./probar-endpoints-biblioteca-api.sh [http://127.0.0.1:8000]
###############################################################################

BASE="${1:-http://127.0.0.1:8000}/api"
pass=0
fail=0

OK="\033[1;32m[OK]\033[0m"
FAIL="\033[1;31m[FALLA]\033[0m"

check() {
    local desc="$1" expected="$2" got="$3"
    if [ "$got" = "$expected" ]; then
        echo -e "  $OK  $desc (HTTP $got)"
        pass=$((pass+1))
    else
        echo -e "  $FAIL $desc (esperado $expected, obtuve $got)"
        fail=$((fail+1))
    fi
}

jget() {
    # jget <archivo.json> <clave.anidada.con.puntos>
    python3 -c "
import json,sys
try:
    d = json.load(open('$1'))
    for k in '$2'.split('.'):
        d = d[k]
    print(d)
except Exception:
    print('')
"
}

EMAIL="diagnostico_$RANDOM@biblioteca.test"

echo "======================================================================"
echo " PRUEBA DE ENDPOINTS — biblioteca-api ($BASE)"
echo "======================================================================"

echo ""
echo "1) POST /auth/register"
CODE=$(curl -s -o /tmp/reg.json -w "%{http_code}" -H "Accept: application/json" \
  -X POST "$BASE/auth/register" -H "Content-Type: application/json" \
  -d "{\"name\":\"Bibliotecario Test\",\"email\":\"$EMAIL\",\"password\":\"Secreta123!\",\"password_confirmation\":\"Secreta123!\"}")
check "Registro de usuario nuevo" "201" "$CODE"
TOKEN=$(jget /tmp/reg.json authorization.access_token)

echo ""
echo "2) POST /auth/login"
CODE=$(curl -s -o /tmp/login.json -w "%{http_code}" -H "Accept: application/json" \
  -X POST "$BASE/auth/login" -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"Secreta123!\"}")
check "Login con credenciales correctas" "200" "$CODE"
TOKEN=$(jget /tmp/login.json authorization.access_token)

echo ""
echo "2b) POST /auth/login con password incorrecta (debe fallar)"
CODE=$(curl -s -o /tmp/loginbad.json -w "%{http_code}" -H "Accept: application/json" \
  -X POST "$BASE/auth/login" -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"password-incorrecta\"}")
check "Login con credenciales incorrectas -> 401" "401" "$CODE"

echo ""
echo "3) GET /auth/me (con token)"
CODE=$(curl -s -o /tmp/me.json -w "%{http_code}" -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" "$BASE/auth/me")
check "Perfil del usuario autenticado" "200" "$CODE"

echo ""
echo "3b) GET /auth/me SIN token (debe rechazar)"
CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Accept: application/json" "$BASE/auth/me")
check "Sin token -> 401" "401" "$CODE"

echo ""
echo "4) POST /books SIN token (debe rechazar)"
CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Accept: application/json" \
  -X POST "$BASE/books" -H "Content-Type: application/json" -d '{}')
check "Crear libro sin token -> 401" "401" "$CODE"

echo ""
echo "5) POST /books (con token)"
ISBN="978-$RANDOM-$RANDOM"
CODE=$(curl -s -o /tmp/book.json -w "%{http_code}" -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" -X POST "$BASE/books" -H "Content-Type: application/json" \
  -d "{\"title\":\"Cien anios de soledad\",\"author\":\"Gabriel Garcia Marquez\",\"isbn\":\"$ISBN\",\"genre\":\"Novela\",\"published_year\":1967,\"copies_available\":3}")
check "Crear libro" "201" "$CODE"
BOOK_ID=$(jget /tmp/book.json book.id)

echo ""
echo "6) GET /books (listar, con token)"
CODE=$(curl -s -o /tmp/books.json -w "%{http_code}" -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" "$BASE/books")
check "Listar libros" "200" "$CODE"

echo ""
echo "7) GET /books/{id} (con token)"
CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" "$BASE/books/$BOOK_ID")
check "Ver un libro especifico" "200" "$CODE"

echo ""
echo "8) PUT /books/{id} (actualizar, con token)"
CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" -X PUT "$BASE/books/$BOOK_ID" -H "Content-Type: application/json" \
  -d '{"copies_available":5}')
check "Actualizar libro" "200" "$CODE"

echo ""
echo "9) DELETE /books/{id} (con token)"
CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" -X DELETE "$BASE/books/$BOOK_ID")
check "Eliminar libro" "200" "$CODE"

echo ""
echo "10) POST /auth/logout (con token)"
CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" -X POST "$BASE/auth/logout")
check "Logout" "200" "$CODE"

echo ""
echo "10b) GET /auth/me reusando el token YA invalidado (debe rechazar)"
CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" "$BASE/auth/me")
check "Token invalidado tras logout -> 401" "401" "$CODE"

echo ""
echo "======================================================================"
echo " RESUMEN: $pass OK, $fail fallas"
echo "======================================================================"
