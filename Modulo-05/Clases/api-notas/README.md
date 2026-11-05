# API de notas con persistencia (Docker)
### By Hugo Jovel Web

Ejercicio práctico — Docker · Kodigo Bootcamp (Full Stack Jr 36).

Mini API REST de notas (Node.js + Express) dockerizada con un **Dockerfile multi-stage**.
Las notas se guardan en `/app/data/notes.json`, carpeta donde se monta un **volumen nombrado**,
por lo que **sobreviven aunque se borre el contenedor**.

## Endpoints

| Método | Ruta         | Descripción                                    |
|--------|--------------|------------------------------------------------|
| GET    | `/health`    | Estado del servicio                            |
| GET    | `/notes`     | Lista todas las notas                          |
| GET    | `/notes/:id` | Una nota por id                                |
| POST   | `/notes`     | Crea nota: `{ "title"?: string, "content": string }` |
| DELETE | `/notes/:id` | Borra una nota                                 |

## Estructura

```
api-notas/
├── src/server.js
├── package.json / package-lock.json
├── Dockerfile          # multi-stage: deps -> runtime
├── .dockerignore
└── README.md
```

## Requisitos

- Docker (Docker Desktop o Engine). Verifica con `docker --version` y `docker run --rm hello-world`.
- `curl` para probar (en Windows, usa Git Bash o `curl.exe`).

## 1. Construir la imagen

```bash
docker build -t api-notas:1.0 .
docker images api-notas
```

## 2. Crear el volumen y correr el contenedor

```bash
docker volume create notas-data
docker run -d --name notas -p 3000:3000 -v notas-data:/app/data api-notas:1.0
docker ps
```

## 3. Crear notas

```bash
curl -X POST localhost:3000/notes \
  -H 'Content-Type: application/json' \
  -d '{"title":"Primera","content":"Hola Docker"}'

curl localhost:3000/notes
```

## 4. Demostración de persistencia

```bash
# Borrar el contenedor por completo
docker rm -f notas
docker ps -a            # ya no existe

# Crear uno NUEVO con el MISMO volumen
docker run -d --name notas -p 3000:3000 -v notas-data:/app/data api-notas:1.0

curl localhost:3000/notes   # las notas siguen ahí ✅
```

Ver el archivo directamente dentro del volumen:

```bash
docker run --rm -v notas-data:/data alpine cat /data/notes.json
```

## 5. Contraste: sin volumen las notas se pierden

```bash
docker run -d --name notas-sin-vol -p 3001:3000 api-notas:1.0
curl -X POST localhost:3001/notes -H 'Content-Type: application/json' -d '{"content":"efímera"}'
curl localhost:3001/notes

docker rm -f notas-sin-vol
docker run -d --name notas-sin-vol -p 3001:3000 api-notas:1.0
curl localhost:3001/notes   # [] -> se perdieron ❌
```

## 6. Limpieza

```bash
docker rm -f notas notas-sin-vol
docker volume rm notas-data      # esto SÍ borra las notas
docker rmi api-notas:1.0
```

> No uses `docker system prune --volumes` si tienes otros volúmenes que quieres conservar.

## Decisiones técnicas

- **Multi-stage:** la etapa `deps` instala dependencias con `npm ci --omit=dev`; la etapa `runtime`
  solo copia `node_modules` y el código. Imagen final liviana (`node:22-alpine`).
- **Usuario no-root:** el contenedor corre como `node`. `/app/data` pertenece a `node`; un volumen
  nombrado hereda esos permisos al crearse.
- **Sin instrucción `VOLUME`:** así la demo de contraste (sin `-v`) pierde los datos al borrar el contenedor.
- **Escritura atómica** del JSON (archivo temporal + rename) para no corromper datos.
- **`HEALTHCHECK`** contra `/health` y cierre ordenado con `SIGTERM` (`docker stop` rápido).
- **Configuración por variables de entorno:** `PORT` (3000) y `DATA_DIR` (`/app/data`).
