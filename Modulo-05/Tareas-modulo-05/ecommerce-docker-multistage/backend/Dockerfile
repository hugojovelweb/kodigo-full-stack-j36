# syntax=docker/dockerfile:1.7
# =============================================================================
# Backend API Laravel — PHP-FPM + Nginx (proxy inverso) en una imagen multi-stage
#
# Etapas:
#   vendor      -> instala dependencias de Composer (sin dev) y optimiza autoload
#   production  -> php:<ver>-fpm-alpine + nginx + supervisor; recibe SOLO vendor/
#
# Composer NO existe en la imagen final (menos peso y menos superficie de ataque).
# Requisitos del proyecto: composer.json + composer.lock, artisan, public/index.php
# =============================================================================
ARG PHP_VERSION=8.4

# ---------- vendor: etapa de construcción ----------
FROM php:${PHP_VERSION}-cli-alpine AS vendor
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1 \
    COMPOSER_NO_INTERACTION=1
WORKDIR /app

# 1) Solo manifiestos: la capa pesada se reutiliza de caché si no cambian
COPY composer.json composer.lock ./
RUN --mount=type=cache,target=/root/.composer/cache \
    composer install \
      --no-dev --prefer-dist --no-progress \
      --no-scripts --no-autoloader

# 2) Código fuente y autoload optimizado (classmap autoritativo, sin dev)
COPY . .
RUN composer dump-autoload --no-dev --optimize --classmap-authoritative --no-scripts

# ---------- production: imagen final ----------
FROM php:${PHP_VERSION}-fpm-alpine AS production

# Paquetes y extensiones: capa estable que casi nunca cambia (va primero)
#  - pdo_mysql: se compila aquí.
#  - mbstring, openssl, tokenizer, xml, ctype, json ya vienen compilados en la
#    imagen oficial; el RUN de verificación hace fallar el build si faltara alguna.
RUN apk add --no-cache nginx supervisor su-exec \
    && docker-php-ext-install -j"$(nproc)" pdo_mysql opcache \
    && mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini" \
    && php -m | tr '[:upper:]' '[:lower:]' > /tmp/php-modules \
    && for ext in pdo_mysql mbstring openssl tokenizer xml ctype json; do \
         grep -qx "$ext" /tmp/php-modules || { echo "FALTA la extensión PHP: $ext"; exit 1; }; \
       done \
    && rm /tmp/php-modules \
    && mkdir -p /run/nginx \
    && ln -sf /dev/stdout /var/log/nginx/access.log \
    && ln -sf /dev/stderr /var/log/nginx/error.log

# Configuración (cambia poco): Nginx, PHP-FPM, PHP, supervisor y entrypoint
COPY docker/nginx/default.conf   /etc/nginx/http.d/default.conf
COPY docker/php/app.ini          /usr/local/etc/php/conf.d/zz-app.ini
COPY docker/php/zzz-app.conf     /usr/local/etc/php-fpm.d/zzz-app.conf
COPY docker/supervisord.conf     /etc/supervisord.conf
COPY docker/entrypoint.sh        /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

WORKDIR /var/www/html

# Únicamente la carpeta vendor/ proviene de la etapa de build
COPY --from=vendor /app/vendor ./vendor

# Código de la aplicación (lo que más cambia va al final para aprovechar caché).
# El .dockerignore excluye vendor/, .env y caches locales.
COPY . .

# El código pertenece a root (solo lectura para PHP); únicamente storage/ y
# bootstrap/cache/ son escribibles por www-data.
RUN mkdir -p storage/framework/cache/data storage/framework/sessions \
             storage/framework/views storage/logs storage/api-docs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && rm -rf docker Dockerfile

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=5 \
  CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["supervisord", "-c", "/etc/supervisord.conf"]
