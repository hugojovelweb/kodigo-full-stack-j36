-- Script OPCIONAL de inicialización (montado en /docker-entrypoint-initdb.d/).
-- MySQL lo ejecuta UNA sola vez, solo cuando el volumen mysql_data está vacío,
-- y lo corre sobre la base indicada en MYSQL_DATABASE.
-- Las tablas las crea Laravel con `php artisan migrate`; aquí solo se fija el
-- juego de caracteres de la base.
ALTER DATABASE CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
