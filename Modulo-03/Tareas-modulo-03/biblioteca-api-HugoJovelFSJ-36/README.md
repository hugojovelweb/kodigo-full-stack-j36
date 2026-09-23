# Biblioteca API — Autenticación JWT en Laravel 12

# Hugo Ernesto Jovel Hernández FUll Stack-36


**KODIGO — Desarrollo Seguro de APIs con Laravel**
Actividad: *Implementación de Blindaje en APIs: Autenticación con JSON Web Tokens (JWT) y Gestión Segura de Credenciales*

API RESTful para que una biblioteca comunitaria gestione su catálogo de libros y sus préstamos, con autenticación **stateless** basada en **JWT** (`tymon/jwt-auth`), cifrado de contraseñas con `bcrypt` y control de acceso a endpoints protegidos mediante middleware.

---

## 1. Descripción del caso de estudio

La biblioteca lleva su control de préstamos en papel: se pierden registros, no se sabe quién tiene cada libro ni cuándo debe devolverlo. Esta API resuelve el problema exponiendo:

- Un módulo de **autenticación** (registro, login, logout, perfil) que emite y valida tokens JWT.
- Un módulo de **catálogo de libros** (CRUD completo), accesible únicamente para bibliotecarios autenticados.

---

## 2. Arquitectura del proyecto

```
biblioteca-api/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── AuthController.php     # register, login, logout, me, refresh
│   │   │   ├── BookController.php     # CRUD de libros (protegido)
│   │   │   └── Controller.php
│   │   └── Middleware/
│   │       └── Authenticate.php       # evita redirección a "login" en API
│   └── Models/
│       ├── User.php                   # implementa JWTSubject
│       └── Book.php
├── bootstrap/
│   └── app.php                        # registro de rutas, middleware y manejo de excepciones (Laravel 12)
├── config/
│   ├── auth.php                       # guard "api" con driver "jwt"
│   ├── cors.php
│   └── jwt.php                        # configuración de tymon/jwt-auth
├── database/
│   ├── migrations/
│   │   ├── 2024_01_01_000000_create_users_table.php
│   │   └── 2024_01_01_000001_create_books_table.php
│   └── seeders/DatabaseSeeder.php
├── routes/
│   ├── api.php                        # endpoints públicos y protegidos
│   ├── web.php
│   └── console.php
├── postman/
│   └── biblioteca-api.postman_collection.json
├── composer.json
├── .env.example
└── .gitignore
```

> Este paquete contiene **el código fuente de la aplicación** (modelos, controladores, migraciones, rutas y configuración). No incluye la carpeta `vendor/` ni el "esqueleto" completo de Laravel (por ejemplo `public/index.php`, `artisan`, etc.), porque esos archivos los genera automáticamente el instalador de Laravel/Composer en el paso 4 de esta guía. Esto es intencional y es la forma correcta de trabajar: **nunca se versiona `vendor/` en Git**.

---

## 3. Requisitos técnicos

| Componente | Versión mínima |
|---|---|
| PHP | 8.2 |
| Composer | 2.x |
| MySQL / MariaDB | 8.0 / 10.6 |
| Extensiones PHP | `pdo_mysql`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`, `bcmath`, `curl`, `fileinfo` |
| Git | 2.x |
| Node.js (opcional, no es obligatorio para la API) | 18+ |

---

## 4. Instalación paso a paso en **Debian con entorno XFCE (Debian 13 "Trixie")**

Abre una terminal (en XFCE: **Aplicaciones → Accesorios → Terminal**, o el atajo `Ctrl+Alt+T` si está configurado).

### 4.1 Actualizar el sistema

```bash
sudo apt update && sudo apt full-upgrade -y
```

### 4.2 Instalar PHP 8.3 y las extensiones necesarias

Debian 13 incluye PHP 8.3 en sus repositorios oficiales, que cumple el requisito `^8.2` de Laravel 12.

```bash
sudo apt install -y php php-cli php-common php-mysql php-mbstring \
  php-xml php-bcmath php-curl php-zip php-intl php-gd php-fpm unzip curl git
```

Verifica la versión instalada:

```bash
php -v
```

Debe mostrar `PHP 8.3.x`. Si tu repositorio trae una versión distinta pero ≥ 8.2, es igualmente válida.

### 4.3 Instalar Composer (gestor de dependencias de PHP)

```bash
cd ~
curl -sS https://getcomposer.org/installer -o composer-setup.php
php composer-setup.php --install-dir=/usr/local/bin --filename=composer
rm composer-setup.php
composer --version
```

> Si `curl` no tiene acceso a Internet por la configuración de red de tu equipo, descarga `composer-setup.php` desde otro equipo y cópialo por USB, o usa el paquete `sudo apt install composer` (versión algo más antigua pero funcional).

### 4.4 Instalar MySQL o MariaDB

En Debian se recomienda MariaDB (mantiene compatibilidad total con el driver `mysql` de Laravel):

```bash
sudo apt install -y mariadb-server mariadb-client
sudo systemctl enable --now mariadb
sudo mysql_secure_installation
```

Responde las preguntas del asistente (define una contraseña de root, elimina usuarios anónimos, deshabilita el acceso remoto de root, elimina la base `test`, recarga privilegios).

### 4.5 Crear la base de datos y el usuario de la aplicación

```bash
sudo mysql -u root -p
```

Dentro de la consola de MySQL/MariaDB:

```sql
CREATE DATABASE biblioteca_api CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'biblioteca_user'@'localhost' IDENTIFIED BY 'CAMBIA_ESTA_CLAVE';
GRANT ALL PRIVILEGES ON biblioteca_api.* TO 'biblioteca_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 4.6 Crear el proyecto Laravel 12 base

Aquí generamos el "esqueleto" oficial de Laravel (carpeta `public/`, `artisan`, `vendor/`, etc.) y luego copiamos encima los archivos de este entregable (modelos, controladores, rutas, migraciones y configuración ya elaborados).

```bash
cd ~/Documentos          # o la carpeta donde trabajas tus proyectos
composer create-project laravel/laravel biblioteca-api "^12.0"
cd biblioteca-api
```

### 4.7 Copiar los archivos del entregable dentro del proyecto

Descomprime el archivo `biblioteca-api.zip` de este entregable y copia (sobrescribiendo) su contenido dentro del proyecto Laravel recién creado:

```bash
unzip -o ~/Descargas/biblioteca-api.zip -d ~/Descargas/biblioteca-api-src
cp -r ~/Descargas/biblioteca-api-src/app/*        ~/Documentos/biblioteca-api/app/
cp -r ~/Descargas/biblioteca-api-src/database/*   ~/Documentos/biblioteca-api/database/
cp -r ~/Descargas/biblioteca-api-src/routes/*     ~/Documentos/biblioteca-api/routes/
cp    ~/Descargas/biblioteca-api-src/config/auth.php  ~/Documentos/biblioteca-api/config/auth.php
cp    ~/Descargas/biblioteca-api-src/config/cors.php  ~/Documentos/biblioteca-api/config/cors.php
cp    ~/Descargas/biblioteca-api-src/bootstrap/app.php ~/Documentos/biblioteca-api/bootstrap/app.php
cp    ~/Descargas/biblioteca-api-src/.env.example      ~/Documentos/biblioteca-api/.env.example
cp    ~/Descargas/biblioteca-api-src/.gitignore        ~/Documentos/biblioteca-api/.gitignore
```

### 4.8 Instalar el paquete `tymon/jwt-auth`

```bash
composer require tymon/jwt-auth:"^2.1"
```

Publica su archivo de configuración (esto sobrescribe `config/jwt.php`; puedes conservar el que trae este entregable, que ya está ajustado, o volver a publicarlo y compararlo):

```bash
php artisan vendor:publish --provider="Tymon\JWTAuth\Providers\LaravelServiceProvider"
```

### 4.9 Configurar el archivo `.env`

```bash
cp .env.example .env
nano .env      # o usa el editor de texto gráfico "Mousepad" de XFCE: mousepad .env
```

Ajusta como mínimo:

```
DB_DATABASE=biblioteca_api
DB_USERNAME=biblioteca_user
DB_PASSWORD=CAMBIA_ESTA_CLAVE
```

### 4.10 Generar las claves de la aplicación y del JWT

```bash
php artisan key:generate
php artisan jwt:secret
```

- `key:generate` genera `APP_KEY`, usada por Laravel para cifrar cookies/datos internos.
- `jwt:secret` genera `JWT_SECRET`, la clave simétrica con la que se **firman y verifican** los tokens JWT (algoritmo HS256).

### 4.11 Ejecutar las migraciones

```bash
php artisan migrate
```

Esto crea las tablas `users`, `books`, `password_reset_tokens`, `sessions`, `cache`, `jobs`, etc.

### 4.12 Levantar el servidor de desarrollo

```bash
php artisan serve
```

La API queda disponible en `http://127.0.0.1:8000/api/...`. Deja esa terminal abierta; abre una segunda pestaña de terminal para las pruebas con `curl`.

---

## 5. Instalación paso a paso en **Windows**

Existen dos rutas; se documentan ambas.

### Opción A — Laravel Herd (la más simple, recomendada)

1. Descarga e instala **Laravel Herd** desde `https://herd.laravel.com` (incluye PHP, Nginx y Composer preconfigurados; no requiere XAMPP).
2. Herd instala PHP 8.3 por defecto. Verifica en **PowerShell**:
   ```powershell
   php -v
   composer -V
   ```
3. Instala **MySQL** con Herd (Herd Pro) o instala **MySQL Community Server / MariaDB** por separado desde `https://dev.mysql.com/downloads/installer/`.
4. Instala **Git for Windows**: `https://git-scm.com/download/win`.
5. Continúa desde el paso "Crear el proyecto Laravel 12 base" de la sección Windows más abajo.

### Opción B — XAMPP + Composer manual

1. Descarga **XAMPP con PHP 8.3** desde `https://www.apachefriends.org` e instálalo (incluye Apache, MySQL/MariaDB y phpMyAdmin).
2. Abre el **Panel de control de XAMPP** y arranca los servicios **Apache** y **MySQL**.
3. Añade PHP al `PATH` de Windows:
   - Panel de control → Sistema → Configuración avanzada del sistema → Variables de entorno.
   - Edita la variable `Path` y agrega, por ejemplo, `C:\xampp\php`.
4. Verifica en **PowerShell** o **CMD**:
   ```powershell
   php -v
   ```
5. Instala **Composer** con el instalador oficial para Windows: `https://getcomposer.org/Composer-Setup.exe` (detecta automáticamente el PHP de XAMPP).
6. Instala **Git for Windows**: `https://git-scm.com/download/win`.

### Crear la base de datos en Windows (phpMyAdmin o consola)

Con XAMPP abre `http://localhost/phpmyadmin` y crea la base `biblioteca_api` con cotejamiento `utf8mb4_unicode_ci`, o por consola:

```powershell
mysql -u root -p
```

```sql
CREATE DATABASE biblioteca_api CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'biblioteca_user'@'localhost' IDENTIFIED BY 'CAMBIA_ESTA_CLAVE';
GRANT ALL PRIVILEGES ON biblioteca_api.* TO 'biblioteca_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Crear el proyecto Laravel 12 base (PowerShell)

```powershell
cd C:\Users\TU_USUARIO\Documents
composer create-project laravel/laravel biblioteca-api "^12.0"
cd biblioteca-api
```

### Copiar los archivos del entregable (PowerShell)

Descomprime `biblioteca-api.zip` (clic derecho → *Extraer todo…*) y copia su contenido dentro del proyecto:

```powershell
Copy-Item -Recurse -Force "C:\Users\TU_USUARIO\Downloads\biblioteca-api-src\app\*"      "app\"
Copy-Item -Recurse -Force "C:\Users\TU_USUARIO\Downloads\biblioteca-api-src\database\*" "database\"
Copy-Item -Recurse -Force "C:\Users\TU_USUARIO\Downloads\biblioteca-api-src\routes\*"   "routes\"
Copy-Item -Force "C:\Users\TU_USUARIO\Downloads\biblioteca-api-src\config\auth.php"     "config\auth.php"
Copy-Item -Force "C:\Users\TU_USUARIO\Downloads\biblioteca-api-src\config\cors.php"     "config\cors.php"
Copy-Item -Force "C:\Users\TU_USUARIO\Downloads\biblioteca-api-src\bootstrap\app.php"   "bootstrap\app.php"
Copy-Item -Force "C:\Users\TU_USUARIO\Downloads\biblioteca-api-src\.env.example"        ".env.example"
Copy-Item -Force "C:\Users\TU_USUARIO\Downloads\biblioteca-api-src\.gitignore"          ".gitignore"
```

### Instalar jwt-auth, configurar `.env` y migrar (PowerShell)

```powershell
composer require tymon/jwt-auth:"^2.1"
php artisan vendor:publish --provider="Tymon\JWTAuth\Providers\LaravelServiceProvider"

Copy-Item ".env.example" ".env"
notepad .env      # edita DB_DATABASE, DB_USERNAME, DB_PASSWORD

php artisan key:generate
php artisan jwt:secret
php artisan migrate
php artisan serve
```

La API queda disponible en `http://127.0.0.1:8000/api/...`.

---

## 6. Endpoints implementados

### Públicos

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/register` | Registrar nuevo usuario |
| POST | `/api/auth/login` | Iniciar sesión y obtener token JWT |

### Protegidos (requieren header `Authorization: Bearer {token}`)

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/logout` | Cerrar sesión e invalidar token |
| GET | `/api/auth/me` | Perfil del usuario autenticado |
| POST | `/api/auth/refresh` | Renovar el token JWT |
| GET | `/api/books` | Listar todos los libros (paginado) |
| GET | `/api/books/{id}` | Obtener un libro específico |
| POST | `/api/books` | Crear un nuevo libro |
| PUT / PATCH | `/api/books/{id}` | Actualizar información de un libro |
| DELETE | `/api/books/{id}` | Eliminar un libro del catálogo |

---

## 7. Pruebas manuales con `curl`

Funcionan igual en la terminal de Debian XFCE y en PowerShell/CMD de Windows (Windows 10+ trae `curl` nativo).

**Registrar usuario**
```bash
curl -X POST http://127.0.0.1:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Bibliotecario Demo","email":"demo@biblioteca.test","password":"Secreta123!","password_confirmation":"Secreta123!"}'
```

**Login (guarda el `access_token` de la respuesta)**
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@biblioteca.test","password":"Secreta123!"}'
```

**Ver perfil autenticado**
```bash
curl -X GET http://127.0.0.1:8000/api/auth/me \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

**Crear un libro**
```bash
curl -X POST http://127.0.0.1:8000/api/books \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{"title":"Cien años de soledad","author":"Gabriel García Márquez","isbn":"978-0307474728","genre":"Novela","published_year":1967,"copies_available":3}'
```

**Listar libros**
```bash
curl -X GET http://127.0.0.1:8000/api/books \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

**Cerrar sesión (invalida el token)**
```bash
curl -X POST http://127.0.0.1:8000/api/auth/logout \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

También se incluye la colección lista para importar en Postman/Insomnia: `postman/biblioteca-api.postman_collection.json`.

---

## 8. Principios de seguridad implementados

- **Cifrado de contraseñas**: el modelo `User` usa el cast nativo `'password' => 'hashed'`, que aplica `bcrypt` automáticamente; nunca se almacena texto plano.
- **Autenticación stateless con JWT**: no se usan sesiones ni cookies; cada petición se autentica exclusivamente con el header `Authorization: Bearer {token}`, firmado con `JWT_SECRET` (algoritmo HS256, configurable a RS256/ES256).
- **Expiración de tokens**: `JWT_TTL` (60 min por defecto) limita la vida útil de un token; `JWT_REFRESH_TTL` acota la ventana para renovarlo.
- **Invalidación real de tokens (blacklist)**: `JWT_BLACKLIST_ENABLED=true` hace que `/api/auth/logout` invalide el token de forma efectiva y no reutilizable, en lugar de solo "olvidarlo" del lado del cliente.
- **Middleware de autenticación (`auth:api`)** protegiendo cada endpoint sensible; las rutas del `AuthController` y `BookController` lo declaran explícitamente en el constructor y en `routes/api.php`.
- **Validación exhaustiva de entradas** (`Validator`) antes de tocar la base de datos, evitando inyección de datos malformados.
- **Gestión segura de credenciales**: `JWT_SECRET`, `APP_KEY` y credenciales de la base de datos viven únicamente en `.env`, el cual está excluido del control de versiones por `.gitignore`; el repositorio solo publica `.env.example` con valores de ejemplo.
- **Principio de mínimo privilegio en BD**: se crea un usuario de MySQL (`biblioteca_user`) dedicado a la aplicación, en lugar de usar `root`.

---

## 9. Publicar el proyecto en GitHub

```bash
cd ~/Documentos/biblioteca-api     # o la ruta del proyecto en Windows
git init
git add .
git status              # confirma que .env y vendor/ NO aparecen listados
git commit -m "Implementación de autenticación JWT en API de biblioteca (Laravel 12 + tymon/jwt-auth)"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/biblioteca-api.git
git push -u origin main
```

Antes de crear el commit, verifica siempre con `git status` que `.env` no aparece en la lista de archivos a subir (si aparece, revisa que `.gitignore` esté en la raíz del proyecto y contenga la línea `.env`).

---

## 10. Solución de problemas comunes

| Síntoma | Causa probable | Solución |
|---|---|---|
| `Class "Tymon\JWTAuth\..." not found` | No se instaló el paquete o falta `composer dump-autoload` | `composer require tymon/jwt-auth:"^2.1"` y luego `composer dump-autoload` |
| `SQLSTATE[HY000] [1045] Access denied` | Usuario/clave de BD incorrectos en `.env` | Revisar `DB_USERNAME`/`DB_PASSWORD` y que el usuario tenga permisos (`GRANT ALL PRIVILEGES`) |
| `jwt.secret` vacío / error "Secret is not set" | No se ejecutó `php artisan jwt:secret` | Ejecutar el comando y reiniciar `php artisan serve` |
| `419` o CSRF token mismatch | Se está probando un endpoint de `web.php` en vez de `api.php`, o el cliente HTTP agrega cookies | Usar siempre `/api/...` y no enviar cookies de sesión, solo el header `Authorization` |
| `401 Unauthorized` en un endpoint protegido | Falta el header `Authorization: Bearer {token}` o el token expiró | Volver a autenticar en `/api/auth/login` o usar `/api/auth/refresh` |
| `Class App\Models\User not found` al migrar | Config `auth.php` apunta a un modelo distinto | Confirmar que `providers.users.model` sea `App\Models\User::class` |
| Puerto 8000 ocupado | Otro proceso usando el puerto | `php artisan serve --port=8001` |
| En Windows, `php` no reconocido como comando | PHP no está en el `PATH` | Agregar la carpeta de PHP (p. ej. `C:\xampp\php`) a la variable de entorno `Path` y reabrir la terminal |

---

## 11. Créditos

Actividad práctica desarrollada para **KODIGO — Desarrollo Seguro de APIs con Laravel**.
## Alumno: Hugo Ernesto Jovel Hernández FUll Stack Jr -36
