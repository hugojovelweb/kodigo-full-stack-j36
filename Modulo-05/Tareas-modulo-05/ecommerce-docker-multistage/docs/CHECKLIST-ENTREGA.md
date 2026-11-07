# Checklist de entrega — trazabilidad contra el enunciado

## Frontend — Next.js
| Requisito | Dónde se cumple |
|-----------|-----------------|
| Next.js 16+ con App Router | Código importado en `frontend/` |
| Build de producción (`next build`) | Etapa `builder` (`npm run build`) |
| Imagen base `node:20-alpine` | `ARG NODE_VERSION=20` en todas las etapas |
| Multi-stage: dependencias vs producción | Etapas `deps`, `builder`, `prod-deps`, `runner` |
| Solo lo necesario para `next start` | `runner` copia `.next`, `public`, `package.json`, `next.config.*`, `node_modules` (prod) |
| Puerto 3000 | `EXPOSE 3000` + `ports` en compose |

## Backend — Laravel
| Requisito | Dónde se cumple |
|-----------|-----------------|
| PHP 8.2+ con PHP-FPM + Nginx | `php:8.4-fpm-alpine` + `nginx` (proxy FastCGI) |
| Extensiones pdo_mysql, mbstring, openssl, tokenizer, xml, ctype, json | `docker-php-ext-install pdo_mysql` + verificación que rompe el build si falta alguna |
| Composer en etapa de build | Etapa `vendor` |
| Solo `vendor/` copiado a la imagen final | `COPY --from=vendor /app/vendor ./vendor` |
| Puerto 8000 u 80 | Contenedor 80, publicado en `8000:80` |

## Base de datos — MySQL
| Requisito | Dónde se cumple |
|-----------|-----------------|
| `mysql:8.0` | `docker-compose.yml` → `db.image` |
| 4 variables de entorno | `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD` |
| Volumen `/var/lib/mysql` | `mysql_data` |
| Init SQL en `/docker-entrypoint-initdb.d/` | `./database/init/01-init.sql` |
| 3306 interno, no expuesto | Sin `ports` + red `backend_net: internal` |

## Entregables
- [ ] Repositorio **público** en GitHub
- [ ] `frontend/Dockerfile` y `backend/Dockerfile` (+ `docker-compose.yml`)
- [ ] `.env.example` documentado (sin secretos reales)
- [ ] Código del frontend Next.js en `frontend/`
- [ ] Código de la API Laravel en `backend/`
- [ ] `README.md`: descripción, arquitectura, `docker compose up`, decisiones técnicas
- [ ] Tabla de la sección 6 del README rellenada con `./scripts/compare-sizes.sh`
- [ ] Sello de footer visible en todas las páginas del frontend (año dinámico, enlace con `noopener noreferrer`)
- [ ] `./scripts/verify-project.sh` sin FALLAs
- [ ] Prueba final desde cero: `docker compose down -v && docker compose up -d --build` y revisar 3 × `healthy`
- [ ] Entregar la URL del repositorio en la plataforma antes del **viernes 6 de noviembre de 2026, 23:59**
