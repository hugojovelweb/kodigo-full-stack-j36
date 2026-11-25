# ReservaYa Lab · Semana 20
### By Hugo Jovel Web
Arquitectura de AWS simulada en tu máquina con Docker Compose:

```
Cliente → gateway (API Gateway) → lb (ALB) → api × 3 (ECS Service) → db (RDS)
           puerto 8080              red interna de Docker (≈ subredes privadas)
```

| Pieza local | Archivo | Equivale en AWS a |
|---|---|---|
| `db` (Postgres + volumen) | `docker-compose.yml`, `db/init.sql` | Amazon RDS |
| `api` con 3 réplicas y `restart: always` | `api/`, `docker-compose.yml` | Servicio de ECS con 3 tareas |
| `lb` (nginx) | `nginx/lb.conf` | Application Load Balancer |
| `gateway` (nginx) | `nginx/gateway.conf` | Amazon API Gateway |
| `.env` | `.env` | AWS Secrets Manager |

## Requisitos

- Docker Desktop instalado y corriendo: `docker info` debe responder sin error.
- Nada más: Node y Postgres corren dentro de los contenedores.

## Levantar el proyecto

```bash
docker compose up -d --build
docker compose ps          # 6 contenedores: db, 3 × api, lb y gateway
curl http://localhost:8080/health
```

En Windows (PowerShell) usa `curl.exe` en lugar de `curl`.

## Peticiones

La API key es `kodigo-2026` y va en la cabecera `x-api-key`.

**Mac / Linux**

```bash
curl -H "x-api-key: kodigo-2026" http://localhost:8080/api/reservas

curl -X POST -H "x-api-key: kodigo-2026" -H "Content-Type: application/json" \
  -d '{"cliente":"Lucía Ramos","personas":3,"fecha":"2026-11-22"}' \
  http://localhost:8080/api/reservas
```

**Windows (PowerShell)**

```powershell
curl.exe -H "x-api-key: kodigo-2026" http://localhost:8080/api/reservas

$h = @{ "x-api-key" = "kodigo-2026" }
Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/reservas -Headers $h `
  -ContentType "application/json" -Body '{"cliente":"Lucía Ramos","personas":3,"fecha":"2026-11-22"}'
```

## Rutas de la API

| Ruta (a través del gateway) | Qué hace |
|---|---|
| `GET /health` | Pública. Revisa que la API llegue a la base de datos. |
| `GET /api/` | Responde qué réplica atendió. No usa la base de datos. |
| `GET /api/reservas` | Lista las reservas. |
| `POST /api/reservas` | Crea una reserva (`cliente`, `personas`, `fecha`). |
| `POST /api/crash` | Hace que la réplica que atiende se caiga, para practicar alta disponibilidad. |

## Comandos útiles

```bash
docker compose ps                        # estado de los contenedores
docker compose logs -f api               # logs de las réplicas
docker compose up -d --scale api=5       # escalar a 5 réplicas
docker compose exec db psql -U app_user -d reservaya   # entrar a la base
docker compose stop db / start db        # simular la caída de la base
```

## Limpieza

```bash
docker compose down        # apaga todo y conserva los datos
docker compose down -v     # apaga todo y BORRA la base (como borrar RDS sin snapshot final)
```
