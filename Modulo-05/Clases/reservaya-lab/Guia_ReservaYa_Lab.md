# Guía práctica ReservaYa Lab

*Arquitectura tipo AWS en tu máquina con Docker Compose: qué se hizo, por qué y cuándo usarlo*

- Kodigo · Full Stack Jr 36 · Módulo 05 · Semana 20
- Autor: Hugo Jovel
- Práctica realizada: 19 de noviembre de 2026
- Entorno: Debian XFCE · Docker Desktop (Docker 29.9.3, Compose v5.2.0)

## Contenido

- 1. Resumen: qué se hizo y por qué
- 2. La arquitectura
- 3. Entorno y requisitos
- 4. Estructura del proyecto
- 5. Guía paso a paso
- 6. Cuándo usar cada técnica
- 7. Ejemplos hipotéticos (temas extra)
- 8. Problemas frecuentes
- 9. Hoja rápida de comandos
- 10. Glosario breve
- 11. Lista de verificación final

---

## 1. Resumen: qué se hizo y por qué

**ReservaYa Lab** es una práctica de la Semana 20 (Módulo 05) que simula en tu computadora una arquitectura típica de AWS usando **Docker Compose**. Con un solo comando se levantan 6 contenedores que trabajan juntos: una puerta de entrada (gateway), un balanceador de carga, tres réplicas de una API en Node.js y una base de datos PostgreSQL.

El objetivo no es memorizar comandos, sino entender **por qué** un sistema real se separa en capas y **qué pasa** cuando una de ellas falla.

**Lo que se practicó:**

- Levantar un sistema de varios servicios con un solo comando (`docker compose up -d --build`).
- Comprobar el balanceo de carga: las peticiones rotan entre 3 réplicas de la API.
- Ver el gateway en acción: API key (401), ruta no expuesta (404) y límite de peticiones (429).
- Consultar y modificar la base de datos con `psql` y probar sus restricciones.
- Crear un snapshot (respaldo) de la base con `pg_dump`.
- Provocar una falla con `/api/crash` y observar la recuperación automática.

---

## 2. La arquitectura

```text
Cliente → gateway (API Gateway) → lb (ALB) → api × 3 (ECS Service) → db (RDS)
           puerto 8080              red interna de Docker (≈ subredes privadas)
```

Solo el **gateway** publica un puerto (8080). Todo lo demás vive en la red interna de Docker, igual que los recursos en subredes privadas de una VPC.

| Pieza | Archivo | Qué hace | Equivale en AWS |
|---|---|---|---|
| `gateway` | `nginx/gateway.conf` | Único punto de entrada. Valida la cabecera `x-api-key` (401), limita a 5 peticiones por segundo por IP (429) y devuelve 404 en rutas no expuestas. | Amazon API Gateway |
| `lb` | `nginx/lb.conf` | Reparte las peticiones entre las réplicas, reintenta con otra si una falla y agrega la cabecera `X-Atendido-Por`. | Application Load Balancer |
| `api` × 3 | `api/index.js`, `api/Dockerfile` | API Node.js/Express sin estado. Tres réplicas con `restart: always`. | Servicio de ECS/Fargate con 3 tareas |
| `db` | `docker-compose.yml`, `db/init.sql` | PostgreSQL 16 con volumen persistente y sin puerto publicado. | Amazon RDS for PostgreSQL |
| `.env` | `.env` | Guarda `DB_PASSWORD`. No se sube a git. | AWS Secrets Manager |

### Ideas clave detrás del diseño

- **Un solo punto de entrada.** Todo pasa por el gateway: ahí se concentran la seguridad y los límites. La base de datos y las réplicas no son accesibles desde fuera.
- **Réplicas sin estado.** La API no guarda nada en memoria: todo vive en la base de datos. Por eso se pueden crear, destruir y reiniciar réplicas libremente.
- **Arranque en cadena con healthchecks.** `db` → `api` ×3 → `lb` → `gateway`. Cada eslabón espera a que el anterior esté sano, no solo iniciado.
- **Datos separados del código.** El volumen `db-data` conserva la información. `db/init.sql` solo se ejecuta cuando ese volumen está vacío (la primera vez).
- **Secretos fuera del código.** La clave de la base viene del archivo `.env`, que `.gitignore` excluye.

---

## 3. Entorno y requisitos

La práctica se ejecutó en **Debian XFCE** con **Docker Desktop** (Docker 29.9.3 y Compose v5.2.0, contexto `desktop-linux`). No hace falta instalar Node ni PostgreSQL: corren dentro de los contenedores.

```bash
docker --version
docker compose version
docker info
```

> **Nota:** Si `docker info` responde sin error, Docker está listo. Docker Desktop corre en una máquina virtual con sus propios recursos (en esta práctica: 4 CPUs y unos 2.7 GiB de RAM), suficientes para este laboratorio.

Antes de levantar el proyecto, confirma que el puerto 8080 esté libre:

```bash
ss -ltn | grep 8080 || echo "8080 libre" 
```

---

## 4. Estructura del proyecto

```text
reservaya-lab/
├── .env                  # DB_PASSWORD (no se sube a git)
├── .gitignore
├── docker-compose.yml    # define los 4 servicios
├── README.md
├── snapshot.sql          # respaldo de ejemplo de la base
├── api/
│   ├── .dockerignore
│   ├── Dockerfile
│   ├── index.js          # la API Express
│   ├── package.json
│   └── package-lock.json
├── db/
│   └── init.sql          # tabla reservas + 2 datos de ejemplo
└── nginx/
    ├── gateway.conf      # API Gateway
    └── lb.conf           # balanceador
```

---

## 5. Guía paso a paso

> **Nota:** Todos los comandos se ejecutan desde la carpeta donde está `docker-compose.yml`. Los pasos 1 a 12 corresponden a lo trabajado o pedido en clase; el paso 13 reúne complementos del README que conviene practicar. Los IDs de contenedor y de instancia que aparecen son de ejemplo: los tuyos serán distintos.

### Paso 1. Verificar Docker y el puerto 8080

**Qué hacemos:** confirmar que Docker funciona y que nada ocupa el puerto 8080.

```bash
docker --version
docker compose version
docker info
docker ps
ss -ltn | grep 8080 || echo "8080 libre"
```

**Resultado esperado:** las versiones de Docker y Compose, `docker info` sin errores, `docker ps` sin ningún contenedor usando el 8080 y el mensaje `8080 libre`.

**Por qué:** si Docker no está corriendo o el puerto está ocupado, el gateway no arranca.

**Cuándo usarlo:** antes de levantar cualquier proyecto que publique puertos.

### Paso 2. Preparar la carpeta del proyecto

**Qué hacemos:** entrar a la carpeta correcta y limpiar basura del zip.

```bash
cd reservaya-lab        # carpeta interna, donde está docker-compose.yml
rm -rf ../__MACOSX      # basura que deja un zip creado en Mac
pwd
ls -la
cat .env
```

**Resultado esperado:** en `ls -la` aparecen `.env`, `docker-compose.yml`, `api/`, `db/` y `nginx/`. El `.env` muestra `DB_PASSWORD=cambia-esta-clave`.

**Por qué:** al descomprimir, el proyecto quedó anidado (`reservaya-lab/reservaya-lab`). Si estás en la carpeta de afuera, `.env` y el compose no existen. Además, `docker compose` siempre se ejecuta donde está el `docker-compose.yml`.

**Cuándo usarlo:** cada vez que recibes un proyecto comprimido. Revisa siempre dónde quedó el compose y abre en el editor (`code .`) esa carpeta.

### Paso 3. Leer el docker-compose.yml antes de ejecutarlo

**Qué hacemos:** entender qué va a crear Docker antes de correrlo. Estas son las líneas clave:

| Línea en el compose | Qué significa |
|---|---|
| `ports: "8080:80"` (solo en `gateway`) | Es el único servicio accesible desde tu máquina. |
| `db` sin `ports` | La base de datos no es accesible desde fuera. |
| `healthcheck` | Cómo sabe Docker si un servicio está sano (`pg_isready` en la base, `/health` en la API). |
| `depends_on` con `condition: service_healthy` | Espera a que la dependencia esté sana, no solo iniciada. |
| `deploy.replicas: 3` | Crea tres copias de la API. |
| `restart: always` | Si el proceso se cae, Docker reinicia el contenedor. |
| `${DB_PASSWORD}` | Valor que Compose lee del archivo `.env`. |
| `volumes: db-data` | Los datos sobreviven a `docker compose down`. |

**Por qué:** un compose de origen desconocido puede publicar puertos o montar carpetas que no esperas. Leerlo es el primer control de seguridad.

**Cuándo usarlo:** siempre que levantes un proyecto que no escribiste tú.

### Paso 4. Levantar el sistema

```bash
docker compose up -d --build
docker compose ps
curl http://localhost:8080/health
```

**Resultado esperado:**

- La primera vez descarga `nginx:1.28-alpine` y `postgres:16-alpine` y construye la imagen `reservaya-lab-api`; por eso tarda más.
- `docker compose ps` muestra 6 contenedores: `db`, `api-1`, `api-2`, `api-3`, `lb` y `gateway`. La base y las tres API aparecen como `healthy`.
- Solo `gateway` muestra `0.0.0.0:8080->80/tcp`. `db` muestra `5432/tcp` sin flecha: no está publicado.
- `/health` responde `{"ok":true,"instancia":"4848fd3bd3ea"}`.

**Por qué:** `-d` deja todo en segundo plano y `--build` construye la imagen de la API a partir de su Dockerfile. El orden de arranque lo controlan los healthchecks.

**Cuándo usarlo:** `up -d --build` cada vez que cambias código de la API o el Dockerfile. Si solo cambias configuración de nginx, basta reiniciar el servicio afectado.

### Paso 5. Emular 6 peticiones (balanceo de carga)

**Qué hacemos:** pedir seis veces la ruta raíz de la API y ver qué réplica responde cada vez.

```bash
for i in 1 2 3 4 5 6; do
  curl -s -H "x-api-key: kodigo-2026" http://localhost:8080/api/
  echo
done
```

**Resultado esperado:** tres IDs de instancia distintos que se repiten en rotación:

```json
{"servicio":"reservaya-api","instancia":"9f600a810571"}
{"servicio":"reservaya-api","instancia":"e9b2edeb1bc8"}
{"servicio":"reservaya-api","instancia":"4848fd3bd3ea"}
{"servicio":"reservaya-api","instancia":"9f600a810571"}
{"servicio":"reservaya-api","instancia":"e9b2edeb1bc8"}
{"servicio":"reservaya-api","instancia":"4848fd3bd3ea"}
```

**Por qué:** `curl -s` hace la petición en silencio y `echo` agrega el salto de línea. Que roten los IDs demuestra que el balanceador reparte la carga entre las réplicas.

**Cuándo usarlo:** para comprobar que un balanceador realmente reparte, o que una réplica nueva entró a la rotación.

> **Atención:** Si copias este comando desde un documento con formato, la URL puede quedar convertida en enlace (por ejemplo `[texto](url)`) y `curl` falla. Escribe la URL en texto plano: `http://localhost:8080/api/`, con el `;` después de ella cuando uses una sola línea.

### Paso 6. Ver IDs y nombres de los contenedores

```bash
docker ps --format "{{.ID}}  {{.Names}}" 
```

**Resultado esperado:** una línea por contenedor, con el ID corto y el nombre:

```text
a1b2c3d4e5f6  reservaya-lab-gateway-1
b2c3d4e5f6a7  reservaya-lab-lb-1
4848fd3bd3ea  reservaya-lab-api-3
e9b2edeb1bc8  reservaya-lab-api-2
9f600a810571  reservaya-lab-api-1
c3d4e5f6a7b8  reservaya-lab-db-1
```

**Por qué:** el campo `instancia` que devuelve la API es el hostname del contenedor, que en Docker es su ID corto. Con esta lista puedes saber qué réplica atendió cada petición.

**Variantes útiles:**

```bash
# con estado y puertos
docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Status}}\t{{.Ports}}"

# incluir contenedores detenidos
docker ps -a --format "{{.ID}}  {{.Names}}  {{.Status}}"

# solo las réplicas de la API
docker ps --filter "name=api" --format "{{.ID}}  {{.Names}}"
```

**Cuándo usarlo:** para relacionar lo que dicen los logs o las respuestas con un contenedor concreto.

### Paso 7. Ver las cabeceras del balanceador

```bash
curl -i -H "x-api-key: kodigo-2026" http://localhost:8080/api/
```

**Resultado esperado:**

```text
HTTP/1.1 200 OK
Server: nginx/1.28.3
Content-Type: application/json
X-Atendido-Por: 172.18.0.5:3000
X-Gateway: reservaya-gateway

{"servicio":"reservaya-api","instancia":"9f600a810571"}
```

- `X-Atendido-Por` lo agrega el balanceador: es la IP interna y el puerto de la réplica que atendió.
- `X-Gateway` lo agrega el gateway y prueba que la petición pasó por él.
- Repite el comando varias veces: la IP y la instancia rotan.

**Por qué:** `-i` incluye las cabeceras de la respuesta. Las cabeceras son una forma barata de dejar rastro de qué componente intervino.

**Cuándo usarlo:** para depurar por qué una petición se comporta distinto (qué capa respondió, qué réplica, qué código).

### Paso 8. Seguridad del gateway y límite de peticiones

```bash
# 1. Sin API key: el gateway rechaza
curl -i http://localhost:8080/api/reservas

# 2. Ruta que el gateway no expone
curl -i http://localhost:8080/otra-cosa

# 3. Rate limit: 20 peticiones seguidas
for i in $(seq 1 20); do curl -s -o /dev/null -w "%{http_code} " -H "x-api-key: kodigo-2026" http://localhost:8080/api/; done; echo
```

**Resultado esperado:**

- Sin API key: `401` con `{"error":"Falta la cabecera x-api-key o no es válida"}`.
- Ruta no expuesta: `404` con `{"error":"Ruta no expuesta por el gateway"}`.
- Rate limit: una tanda de `200` seguida de varios `429`, con algún `200` suelto entre ellos (se recupera cupo a 5 peticiones por segundo). Ejemplo: `200 200 200 200 200 200 200 429 200 429 429 429 ...`

**Por qué:** el gateway concentra la seguridad: valida la llave, limita el tráfico por IP (5 por segundo con una ráfaga de 5 extra) y solo deja pasar lo que empieza con `/api/` (más `/health`, que es pública).

**Cuándo usarlo:** para exponer una API a terceros sin dejar que cualquiera la consuma sin límite.

### Paso 9. Leer y crear reservas por la API

```bash
# listar
curl -H "x-api-key: kodigo-2026" http://localhost:8080/api/reservas

# crear
curl -X POST -H "x-api-key: kodigo-2026" -H "Content-Type: application/json" \
  -d '{"cliente":"Lucía Ramos","personas":3,"fecha":"2026-11-22"}' \
  http://localhost:8080/api/reservas

# listar de nuevo
curl -H "x-api-key: kodigo-2026" http://localhost:8080/api/reservas
```

**Resultado esperado:** al inicio, 2 reservas (Ana López y Carlos Méndez, las de `db/init.sql`). El POST responde con la reserva creada (`id` 3). El último GET muestra 3.

**Observación importante:** el POST y el GET los atiende normalmente una réplica distinta cada vez, y aun así todas ven la reserva nueva. Es la prueba de que las réplicas no guardan estado: todo está en la base.

**Validación de la API:** si falta un campo, la API responde `400` con `{"error":"cliente, personas y fecha son requeridos"}`:

```bash
curl -i -X POST -H "x-api-key: kodigo-2026" -H "Content-Type: application/json" \
  -d '{"cliente":"Sin datos"}' http://localhost:8080/api/reservas
```

**Cuándo usarlo:** para probar un endpoint de punta a punta, atravesando todas las capas, antes de conectarle un frontend.

### Paso 10. Entrar a la base de datos con psql

**Qué hacemos:** como la base no publica puertos, se entra ejecutando `psql` dentro del contenedor. Primero se confirma que el 5432 no está expuesto:

```bash
ss -ltn | grep 5432 || echo "5432 no está expuesto"
docker compose exec db psql -U app_user -d reservaya
```

El prompt cambia a `reservaya=#`. Dentro, ejecuta una línea a la vez:

```sql
\dt
\d reservas
SELECT * FROM reservas;
INSERT INTO reservas (cliente, personas, fecha) VALUES ('Hugo Jovel', 2, '2026-11-25');
SELECT * FROM reservas;
INSERT INTO reservas (cliente, personas, fecha) VALUES ('Prueba', 0, '2026-11-27');
\q
```

**Resultado esperado:**

- `\dt` lista la tabla `reservas`; `\d reservas` muestra las columnas y la restricción `CHECK (personas > 0)`.
- El primer `INSERT` responde `INSERT 0 1` y el segundo `SELECT` muestra tu reserva con `id` y `creada_en` llenados automáticamente.
- El `INSERT` con 0 personas **falla a propósito** con un error de la restricción `reservas_personas_check`.

| Qué escribes | Qué hace |
|---|---|
| `\dt` | Lista las tablas. |
| `\d reservas` | Describe la tabla: columnas, tipos y restricciones. |
| `\q` (o Ctrl+D) | Sale de psql. Lleva barra invertida; una `q` sola no hace nada. |
| `\r` | Borra el texto pendiente cuando el prompt quedó como `reservaya-#`. |
| `;` al final | Toda instrucción SQL (`SELECT`, `INSERT`) termina en punto y coma. Los comandos con `\` no lo llevan. |

**Verificar desde la API:** `curl -H "x-api-key: kodigo-2026" http://localhost:8080/api/reservas` debe mostrar `Hugo Jovel` y no mostrar `Prueba`.

**Dato curioso:** el `INSERT` que falla por el `CHECK` igual consume un número de la secuencia `SERIAL`, así que el siguiente `id` puede saltarse un valor. Es normal en PostgreSQL.

**Por qué:** la base tiene su propia validación, independiente de la API. Es la última línea de defensa de los datos.

**Cuándo usarlo:** para administrar, auditar o corregir datos sin exponer la base a internet.

### Paso 11. Snapshot de la base de datos

**Qué hacemos:** generar un respaldo lógico (un archivo SQL con la estructura y los datos) y sacarlo del contenedor.

```bash
docker compose exec db pg_dump -U app_user -d reservaya -f /tmp/snapshot_db.sql
docker compose cp db:/tmp/snapshot_db.sql ./snapshot_db.sql
```

- El primer comando genera el dump **dentro del contenedor** (`-f /tmp/...`). No imprime nada si todo salió bien.
- El segundo lo copia a la carpeta de tu proyecto. Sin este paso, el archivo se pierde cuando el contenedor se recrea.

**Verificar el archivo:**

```bash
ls -lh snapshot_db.sql
grep -A8 "CREATE TABLE" snapshot_db.sql
grep -A8 "COPY public.reservas" snapshot_db.sql
```

Debes ver el `CREATE TABLE public.reservas` y, en el bloque `COPY`, las filas, incluida la de Hugo Jovel.

**Alternativa en un solo paso** (redirigiendo la salida a tu máquina; el `-T` evita que Docker meta caracteres de terminal en el archivo):

```bash
docker compose exec -T db pg_dump -U app_user -d reservaya > snapshot_db.sql
```

**Probar que el snapshot sirve** (un respaldo sin probar no es respaldo). Se restaura en una base aparte, sin tocar la real:

```bash
docker compose exec db createdb -U app_user reservaya_test
docker compose exec -T db psql -U app_user -d reservaya_test < snapshot_db.sql
docker compose exec db psql -U app_user -d reservaya_test -c "SELECT count(*) FROM reservas;"
docker compose exec db dropdb -U app_user reservaya_test
```

El `count` debe coincidir con el de la base real; el último comando borra la base de prueba.

> **Atención:** El `.gitignore` del proyecto solo excluye `snapshot.sql`. Un archivo llamado `snapshot_db.sql` **sí se subiría a git** y contiene datos reales. Agrégalo con `echo "snapshot_db.sql" >> .gitignore` y entrégalo por el medio que indique el coach, no por el repositorio.

**Por qué:** un snapshot permite recuperar datos después de un error (por ejemplo, un `down -v`), clonar datos a un entorno de pruebas o migrarlos a otra base.

**Cuándo usarlo:** antes de cambios riesgosos (migraciones, borrados masivos, `down -v`) y de forma programada como respaldo.

### Paso 12. Botar una instancia de la API (alta disponibilidad)

```bash
# 1. Antes
docker ps --format "{{.ID}}  {{.Names}}  {{.Status}}" --filter "name=api"

# 2. Botar una réplica
curl -X POST -H "x-api-key: kodigo-2026" http://localhost:8080/api/crash

# 3. Justo después: ¿el servicio sigue respondiendo?
for i in $(seq 1 6); do curl -s -o /dev/null -w "%{http_code} " -H "x-api-key: kodigo-2026" http://localhost:8080/api/reservas; done; echo

# 4. Después
sleep 5
docker ps --format "{{.ID}}  {{.Names}}  {{.Status}}" --filter "name=api"
docker compose logs --tail=10 api
```

**Resultado esperado:**

- El POST responde `{"instancia":"4848fd3bd3ea","mensaje":"Me caigo en 1 segundo"}`. Anota ese ID: es la réplica que cae.
- Un segundo después el proceso termina con `process.exit(1)`. En los logs aparece `Simulando una falla` y luego el `escuchando en el puerto 3000` de la réplica que volvió.
- El paso 3 debe dar todos `200`: el balanceador reintenta con otra réplica y el cliente no se entera.
- En el paso 4, **el ID de la réplica no cambia**. `restart: always` reinicia el mismo contenedor; lo que cambia es el estado (`Up 4 seconds` en lugar de varios minutos).

Si alguna petición devolviera `502` o `504`, es un buen tema de discusión en clase: significa que el balanceador no encontró réplica disponible a tiempo.

**Por qué:** simula lo que hace ECS al reemplazar una tarea caída y lo que hace el ALB al sacarla de rotación mientras tanto. En el balanceador, `max_fails=1 fail_timeout=10s` la aparta 10 segundos y `proxy_next_upstream error timeout` reintenta la petición con otra réplica.

**Cuándo usarlo:** para comprobar que un servicio realmente tolera fallas antes de depender de él (pruebas de caos a pequeña escala).

### Paso 13. Complementos recomendados (del README)

> **Nota:** Estos tres ejercicios no se ejecutaron en la sesión; son la continuación natural de la práctica. Los resultados indicados son los esperados según el código del proyecto: verifícalos en clase.

#### 13.1 Simular la caída de la base de datos

```bash
docker compose stop db
curl -i http://localhost:8080/health
curl -i -H "x-api-key: kodigo-2026" http://localhost:8080/api/reservas
curl -i -H "x-api-key: kodigo-2026" http://localhost:8080/api/

docker compose start db
sleep 10
curl http://localhost:8080/health
```

- `/health` debe responder `503` con `{"ok":false,...,"error":"sin conexión a la base de datos"}`.
- `/api/reservas` debe responder `500` con `{"instancia":"...","error":"error interno"}`.
- `/api/` sigue respondiendo `200`: esa ruta no usa la base.
- Al arrancar la base de nuevo, el pool de conexiones se recupera y `/health` vuelve a `{"ok":true,...}`, sin reiniciar las API.

**Por qué importa:** una réplica con la base caída sigue viva (el proceso no se cae, porque el pool tiene un manejador de errores). Por eso el balanceador no la saca de rotación y el síntoma es un `503` o `500`, no un `502`.

#### 13.2 Escalar las réplicas

```bash
docker compose up -d --scale api=5
docker compose ps
for i in $(seq 1 10); do curl -s -H "x-api-key: kodigo-2026" http://localhost:8080/api/; echo; done

# volver a 3
docker compose up -d --scale api=3
```

Deben aparecer 5 IDs distintos rotando. El balanceador consulta el DNS interno cada 5 segundos, por eso ve las réplicas nuevas sin tocar su configuración.

#### 13.3 Limpieza: down contra down -v

```bash
docker compose down        # apaga todo y conserva los datos
docker compose down -v     # apaga todo y BORRA la base
```

> **Atención:** `down -v` borra el volumen `db-data`: pierdes todas las reservas y, al volver a levantar, `init.sql` vuelve a sembrar solo los 2 datos de ejemplo. Es el equivalente a borrar una instancia RDS sin snapshot final. Haz un snapshot (paso 11) antes.

---

## 6. Cuándo usar cada técnica

| Técnica | Úsala cuando | Ten cuidado si |
|---|---|---|
| `docker compose up -d --build` | Quieres levantar todo el sistema o aplicar cambios de código en la API. | Solo cambiaste una configuración de nginx: basta reiniciar ese servicio. |
| Healthcheck + `depends_on: service_healthy` | Un servicio no puede arrancar sin otro listo (la API sin la base). | El healthcheck es demasiado exigente y marca como caído un servicio que solo está lento. |
| Réplicas + balanceador | Necesitas más capacidad o seguir funcionando si una instancia cae. | La app guarda estado en memoria (sesiones, caché local): hay que moverlo a la base o a un servicio compartido. |
| Gateway con API key y rate limit | Expones una API a otros equipos o clientes. | La llave está escrita en un archivo del repositorio. En producción va en un gestor de secretos. |
| Base sin puertos publicados | Siempre en producción. | Necesitas administrarla: usa `docker compose exec db psql ...`. |
| `pg_dump` (respaldo lógico) | Bases pequeñas o medianas, migraciones, copiar datos a pruebas. | La base es muy grande: conviene respaldo físico o los snapshots automáticos del servicio administrado. |
| `restart: always` | Un proceso puede caerse y debe revivir solo. | Hay un error que lo tumba al arrancar: entra en un ciclo de reinicios. Revisa los logs. |
| `down` frente a `down -v` | `down` para apagar; `down -v` solo para empezar de cero a propósito. | Tienes datos que quieres conservar y no hiciste snapshot. |

---

## 7. Ejemplos hipotéticos (temas extra)

> **Nota:** Estos ejemplos son ideas para practicar y ampliar la clase. **No se ejecutaron en la sesión**: son propuestas basadas en la arquitectura del proyecto.

### 7.1 Adaptar la arquitectura a otro negocio: «PizzaYa»

**Escenario:** una pizzería quiere recibir pedidos con la misma arquitectura. Se reutilizan gateway, balanceador y réplicas; solo cambian la tabla y las rutas de la API.

En `db/init.sql`, una tabla nueva:

```sql
CREATE TABLE IF NOT EXISTS pedidos (
  id         SERIAL PRIMARY KEY,
  cliente    TEXT NOT NULL,
  producto   TEXT NOT NULL,
  cantidad   INT  NOT NULL CHECK (cantidad > 0),
  creado_en  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

En `api/index.js`, una ruta nueva (el gateway ya reenvía todo lo que empieza con `/api/`):

```js
app.get("/pedidos", async (req, res) => {
  const { rows } = await pool.query(
    "SELECT id, cliente, producto, cantidad FROM pedidos ORDER BY id"
  );
  res.json({ instancia: INSTANCIA, total: rows.length, pedidos: rows });
});
```

**Punto de aprendizaje:** `init.sql` solo se ejecuta con el volumen vacío. Para aplicarlo hay dos caminos: empezar de cero (`docker compose down -v` y luego `up -d --build`, perdiendo datos) o crear la tabla a mano con `psql` en la base existente.

### 7.2 Un día de mucho tráfico (tipo Black Friday)

**Escenario:** la API recibe diez veces más peticiones de lo normal.

```bash
docker compose up -d --scale api=8
docker compose ps
```

Si los clientes legítimos reciben `429`, se sube el límite en `nginx/gateway.conf` (por ejemplo `rate=20r/s`) y se reinicia el gateway:

```bash
docker compose restart gateway
```

**Qué enseña:** escalar tiene límites físicos (tu máquina) y un límite de tráfico mal calibrado rechaza clientes reales. En AWS, el equivalente es el auto scaling del servicio de ECS según CPU o número de peticiones, y los planes de uso de API Gateway.

### 7.3 Dos clientes con llaves distintas

**Escenario:** dos empresas consumen la API y quieres poder revocar la llave de una sin afectar a la otra.

```nginx
map $http_x_api_key $api_key_valida {
    default            0;
    "kodigo-2026"      1;
    "cliente-b-2026"   1;
}
```

Después de editar el archivo, se recarga la configuración sin apagar el servicio:

```bash
docker compose exec gateway nginx -s reload
```

**Qué enseña:** control de acceso por cliente. Escribir llaves en un archivo es solo didáctico; en producción se usan API keys con planes de uso y un gestor de secretos.

### 7.4 Respaldo programado con retención

**Escenario:** quieres un respaldo cada noche y conservar solo los últimos 7 días.

```bash
#!/usr/bin/env bash
set -euo pipefail
cd /ruta/a/reservaya-lab
mkdir -p backups
docker compose exec -T db pg_dump -U app_user -d reservaya > "backups/reservaya_$(date +%F).sql"
find backups -name "reservaya_*.sql" -mtime +7 -delete
```

Y en `crontab -e`, para ejecutarlo todos los días a las 2:00 a. m.:

```text
0 2 * * * /ruta/a/backup.sh
```

**Qué enseña:** un respaldo útil es automático, probado (restaurándolo, como en el paso 11) y guardado fuera del repositorio y de la misma máquina.

### 7.5 Guía de diagnóstico de incidentes

**Escenario:** el sistema falla y hay que decidir rápido dónde mirar.

| Síntoma | Causa probable | Qué comprobar |
|---|---|---|
| `401` | Falta la cabecera `x-api-key` o es incorrecta. | Revisar la cabecera y el valor del mapa en `gateway.conf`. |
| `404` | La ruta no empieza con `/api/` (ni es `/health`). | Usar `/api/reservas`, no `/reservas`. |
| `429` | Se superó el límite de peticiones por IP. | Esperar, o ajustar `rate` y `burst` si es legítimo. |
| `502` / `504` | Ninguna réplica disponible o respondió tarde. | `docker compose ps` y `docker compose logs api`. |
| `503` en `/health` | La API no llega a la base de datos. | `docker compose ps db`; si está detenida, `docker compose start db`. |
| `500` «error interno» | Falló una consulta (base caída o dato inválido). | `docker compose logs api` para ver el mensaje real. |

**Mejora posible:** hoy la API acepta `personas: -1` (el `!personas` solo atrapa 0 y vacío) y es la base la que lo rechaza con un `500`. Validar el rango en la API y responder `400` sería una buena práctica para ampliar la clase.

### 7.6 Llevar el laboratorio a AWS real

**Escenario:** después de entender el modelo local, se quiere desplegar de verdad. La equivalencia ya está en el diseño:

| En el laboratorio | En AWS | Notas |
|---|---|---|
| `db` (Postgres + volumen) | Amazon RDS for PostgreSQL | Subred privada, backups automáticos, opción Multi-AZ. |
| `api` × 3 + Dockerfile | ECS con Fargate (imagen en ECR) | El «desired count» reemplaza a `replicas`; auto scaling opcional. |
| `lb` (nginx) | Application Load Balancer | Health checks y target group en lugar de `max_fails`. |
| `gateway` (nginx) | Amazon API Gateway | API keys, usage plans y throttling en lugar de `limit_req`. |
| `.env` | AWS Secrets Manager | Los secretos se inyectan en las tareas, nunca en el repositorio. |
| `docker compose logs` | Amazon CloudWatch Logs | Logs centralizados por servicio. |
| `down -v` | Borrar RDS sin snapshot final | En AWS pide siempre snapshot final. |

**Qué enseña:** lo aprendido en local no es un juguete: cada pieza tiene un servicio gestionado equivalente, y los conceptos (réplicas, health checks, red privada, secretos) son los mismos.

---

## 8. Problemas frecuentes

| Síntoma | Causa | Solución |
|---|---|---|
| `cat: .env: No existe el fichero o el directorio` | Estás en la carpeta de afuera (zip anidado). | `cd reservaya-lab` y `ls -la`. |
| `curl` falla con una URL rara como `[;](http://...)` | El comando se copió con formato de enlace. | Escribir la URL en texto plano. |
| En psql, `q` no sale y el prompt queda `reservaya-#` | Faltó la barra invertida o hay texto pendiente. | `\r` para limpiar y `\q` (o Ctrl+D) para salir. |
| En psql el prompt es `-#` y no pasa nada | Falta el `;` al final de la instrucción SQL. | Escribir `;` y Enter, o `\r` para cancelar. |
| El puerto 8080 está ocupado | Otro programa o contenedor lo usa. | `docker ps` y `ss -ltn \| grep 8080`; o cambiar a `"8081:80"` en el compose. |
| El snapshot desapareció | Quedó en `/tmp` del contenedor. | Copiarlo con `docker compose cp` (o usar la redirección con `-T`). |
| `429` en las pruebas | Rate limit del gateway. | Esperar un segundo y repetir. |
| La primera vez tarda mucho | Descarga de imágenes y construcción de la API. | Es normal; las siguientes veces usa la caché. |

---

## 9. Hoja rápida de comandos

```bash
# Estado y logs
docker compose ps
docker compose logs -f api
docker ps --format "{{.ID}}  {{.Names}}"

# Levantar / apagar
docker compose up -d --build
docker compose down            # conserva datos
docker compose down -v         # BORRA la base

# Probar
curl http://localhost:8080/health
curl -H "x-api-key: kodigo-2026" http://localhost:8080/api/reservas
curl -i -H "x-api-key: kodigo-2026" http://localhost:8080/api/
curl -X POST -H "x-api-key: kodigo-2026" http://localhost:8080/api/crash

# Base de datos
docker compose exec db psql -U app_user -d reservaya
docker compose exec db pg_dump -U app_user -d reservaya -f /tmp/snapshot_db.sql
docker compose cp db:/tmp/snapshot_db.sql ./snapshot_db.sql
docker compose stop db / docker compose start db

# Escalar
docker compose up -d --scale api=5
```

---

## 10. Glosario breve

| Término | Significado |
|---|---|
| Contenedor | Proceso aislado que corre una aplicación con todo lo que necesita. |
| Imagen | Plantilla de la que se crea un contenedor (por ejemplo `postgres:16-alpine`). |
| Réplica | Copia idéntica de un servicio, para repartir carga y tolerar fallas. |
| Balanceador de carga | Reparte las peticiones entre varias réplicas. |
| API Gateway | Puerta de entrada que valida, limita y enruta las peticiones. |
| Healthcheck | Comprobación periódica para saber si un servicio está sano. |
| Volumen | Almacenamiento que sobrevive a la vida del contenedor. |
| Rate limiting | Límite de peticiones por unidad de tiempo (aquí, 5 por segundo por IP). |
| Snapshot | Copia de la base de datos en un momento dado (aquí, con `pg_dump`). |
| Servicio sin estado | Servicio que no guarda datos en su propia memoria; todo está en la base. |

---

## 11. Lista de verificación final

- [ ] Docker responde (`docker info`) y el puerto 8080 está libre.
- [ ] `docker compose ps` muestra 6 contenedores, con `db` y las 3 `api` en `healthy`.
- [ ] `/health` responde `{"ok":true,...}`.
- [ ] Las 6 peticiones rotan entre 3 instancias distintas.
- [ ] Sin API key da `401`; ruta no expuesta da `404`; el rate limit da `429`.
- [ ] Se creó una reserva por la API y otra por `psql`, y ambas aparecen en el listado.
- [ ] El `INSERT` con 0 personas fue rechazado por la base.
- [ ] Existe `snapshot_db.sql` fuera del contenedor y está en `.gitignore`.
- [ ] Se probó `/api/crash` y el servicio siguió respondiendo.
- [ ] Se hizo snapshot antes de cualquier `docker compose down -v`.

---

Kodigo Full Stack Jr 36 · Docker Compose · Node.js · PostgreSQL · nginx  
© 2026 [**Hugo Jovel Web**](https://hugojovelweb.tech/). Todos los derechos reservados.
