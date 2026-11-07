# LÍNEA BASE (antes de optimizar): Apache + PHP, Composer y git dentro de la imagen final.
FROM php:8.4-apache
RUN apt-get update && apt-get install -y git unzip \
    && docker-php-ext-install pdo_mysql
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /var/www/html
COPY . .
RUN composer install
EXPOSE 80
