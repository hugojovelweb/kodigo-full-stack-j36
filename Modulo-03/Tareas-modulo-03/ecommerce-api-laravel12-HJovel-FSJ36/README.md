# 🛒 API de E-commerce Segura con Swagger Completo

# Hugo Ernesto Jovel Hernández - Full Stack Developer 36

API RESTful desarrollada con **Laravel 12** y **PHP 8.2+** para la gestión de un e-commerce básico: clientes, catálogo de productos, órdenes de compra y procesamiento de pagos con **Stripe**. Documentada completamente con **Swagger/OpenAPI** (`l5-swagger`) y autenticación **JWT** (`tymon/jwt-auth`).

---

## 📋 Índice

1. [Stack tecnológico](#-stack-tecnológico)
2. [Estructura del proyecto](#-estructura-del-proyecto)
3. [Modelo de base de datos](#-modelo-de-base-de-datos)
4. [Instalación en Debian 13 (XFCE)](#-instalación-en-debian-13-xfce)
5. [Instalación en Windows](#-instalación-en-windows)
6. [Configuración del archivo .env](#-configuración-del-archivo-env)
7. [Migraciones y seeders](#-migraciones-y-seeders)
8. [Configuración de JWT](#-configuración-de-jwt)
9. [Configuración de Stripe](#-configuración-de-stripe)
10. [Levantar el servidor](#-levantar-el-servidor)
11. [Documentación Swagger](#-documentación-swagger)
12. [Endpoints disponibles](#-endpoints-disponibles)
13. [Probar el flujo completo](#-probar-el-flujo-completo-registro--compra--pago)
14. [Manejo de errores](#-manejo-de-errores)
15. [Solución de problemas comunes](#-solución-de-problemas-comunes)

---

## 🧰 Stack tecnológico

| Componente          | Tecnología                                   |
| ------------------- | -------------------------------------------- |
| Framework           | Laravel 12                                   |
| Lenguaje            | PHP 8.2+                                     |
| Base de datos       | MySQL 8.x                                    |
| Autenticación       | JWT (`tymon/jwt-auth`)                       |
| Pagos               | Stripe (`stripe/stripe-php`)                 |
| Documentación API   | Swagger / OpenAPI (`darkaonline/l5-swagger`) |
| Gestor dependencias | Composer 2.x                                 |

---

## 📁 Estructura del proyecto

```
ecommerce-api-laravel12/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   │   ├── AuthController.php
│   │   │   ├── ProductController.php
│   │   │   ├── OrderController.php
│   │   │   └── PaymentController.php
│   │   └── Requests/
│   │       ├── RegisterRequest.php
│   │       ├── LoginRequest.php
│   │       ├── StoreProductRequest.php
│   │       ├── UpdateProductRequest.php
│   │       └── StoreOrderRequest.php
│   └── Models/
│       ├── User.php
│       ├── Product.php
│       ├── Order.php
│       ├── OrderItem.php
│       └── Payment.php
├── bootstrap/app.php        # Rutas + manejo global de excepciones (Laravel 12)
├── config/
│   ├── auth.php             # Guard "api" con driver jwt
│   ├── jwt.php
│   ├── l5-swagger.php
│   ├── services.php         # Credenciales de Stripe
│   └── cors.php
├── database/
│   ├── migrations/          # 5 migraciones principales
│   ├── seeders/             # UserSeeder, ProductSeeder, DatabaseSeeder
│   └── factories/ProductFactory.php
├── routes/
│   ├── api.php
│   └── web.php
├── .env.example
└── composer.json
```

> Nota: este repositorio contiene los archivos de **código fuente propios** del proyecto (modelos, controladores, migraciones, rutas, configuración y seeders). Las carpetas generadas automáticamente por Laravel/Composer (`vendor/`, `bootstrap/cache/`, `node_modules/`) **no se incluyen** y se generan al ejecutar `composer install`, tal como indica este README.

---

## 🗄️ Modelo de base de datos

| Tabla         | Descripción                                              |
| ------------- | -------------------------------------------------------- |
| `users`       | Clientes/administradores (`role`: customer / admin)      |
| `products`    | Catálogo de productos (nombre, precio, stock, sku, etc.) |
| `orders`      | Órdenes de compra (estado, total, dirección de envío)    |
| `order_items` | Detalle de productos por orden (cantidad, subtotal)      |
| `payments`    | Registro de transacciones Stripe (PaymentIntent, estado) |

Relaciones: `User 1—N Order`, `Order 1—N OrderItem`, `Product 1—N OrderItem`, `Order 1—1 Payment`.

---

## 🐧 Instalación en Debian 13 (XFCE)

Estas instrucciones asumen una instalación limpia de **Debian 13 "Trixie"** con entorno XFCE, trabajando en una terminal (`xfce4-terminal`).

### 1. Actualizar el sistema

```bash
sudo apt update && sudo apt full-upgrade -y
```

### 2. Instalar PHP 8.2+ y extensiones necesarias

Debian 13 incluye PHP 8.3 en sus repositorios oficiales (cumple el requisito `^8.2`):

```bash
sudo apt install -y php php-cli php-common php-mysql php-mbstring \
  php-xml php-bcmath php-curl php-zip php-gd php-tokenizer php-fpm unzip curl git
```

Verifica la versión instalada:

```bash
php -v
# Debe mostrar PHP 8.2.x o superior
```

### 3. Instalar Composer

```bash
curl -sS https://getcomposer.org/installer -o composer-setup.php
sudo php composer-setup.php --install-dir=/usr/local/bin --filename=composer
rm composer-setup.php
composer --version
```

### 4. Instalar y configurar MySQL Server

```bash
sudo apt install -y mysql-server
sudo systemctl enable --now mysql
sudo mysql_secure_installation
```

Crear la base de datos y el usuario para el proyecto:

```bash
sudo mysql -u root -p
```

Dentro de la consola de MySQL:

```sql
CREATE DATABASE ecommerce_api CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'ecommerce_user'@'localhost' IDENTIFIED BY 'change_me';
GRANT ALL PRIVILEGES ON ecommerce_api.* TO 'ecommerce_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 5. Clonar el repositorio

```bash
cd ~/Escritorio    # o la carpeta de trabajo que prefieras
git clone https://github.com/TU-USUARIO/ecommerce-api-laravel12.git
cd ecommerce-api-laravel12
```

### 6. Instalar dependencias PHP

```bash
composer install
```

Esto descarga Laravel, `tymon/jwt-auth`, `darkaonline/l5-swagger` y `stripe/stripe-php` definidos en `composer.json`.

### 7. Configurar el archivo de entorno

```bash
cp .env.example .env
php artisan key:generate
```

Edita `.env` con tu editor de texto favorito (en XFCE puedes usar `mousepad` o `nano`):

```bash
nano .env
```

Ajusta `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` con los valores creados en el paso 4, y las credenciales de Stripe (ver sección [Configuración de Stripe](#-configuración-de-stripe)).

### 8. Generar la clave secreta JWT

```bash
php artisan jwt:secret
```

Esto agrega automáticamente `JWT_SECRET=...` a tu `.env`.

### 9. Publicar configuración de Swagger (si no existe `config/l5-swagger.php`)

```bash
php artisan vendor:publish --provider "L5Swagger\L5SwaggerServiceProvider"
```

> Este proyecto ya incluye `config/l5-swagger.php` preconfigurado; solo ejecuta este comando si necesitas regenerarlo.

### 10. Ejecutar migraciones y seeders

```bash
php artisan migrate --seed
```

### 11. Generar la documentación Swagger

```bash
php artisan l5-swagger:generate
```

### 12. Levantar el servidor de desarrollo

```bash
php artisan serve
```

La API quedará disponible en `http://127.0.0.1:8000/api` y la documentación en `http://127.0.0.1:8000/api/documentation`.

---

## 🪟 Instalación en Windows

### 1. Instalar PHP 8.2+

1. Descarga PHP para Windows (versión **Thread Safe**, x64) desde: https://windows.php.net/download/
2. Extrae el contenido en `C:\php`.
3. Agrega `C:\php` a la variable de entorno `PATH`:
    - Panel de control → Sistema → Configuración avanzada del sistema → Variables de entorno → `Path` → Nuevo → `C:\php`.
4. Copia `php.ini-development` a `php.ini` y habilita las extensiones necesarias descomentando (quitar el `;`):
    ```ini
    extension=curl
    extension=fileinfo
    extension=mbstring
    extension=openssl
    extension=pdo_mysql
    extension=zip
    extension=gd
    ```
5. Verifica en `cmd` o PowerShell:
    ```powershell
    php -v
    ```

### 2. Instalar Composer

1. Descarga el instalador desde https://getcomposer.org/Composer-Setup.exe
2. Ejecuta el instalador y apunta a tu `php.exe` en `C:\php\php.exe`.
3. Verifica:
    ```powershell
    composer --version
    ```

### 3. Instalar MySQL

1. Descarga MySQL Community Server: https://dev.mysql.com/downloads/installer/
2. Durante la instalación, configura usuario `root` y una contraseña.
3. Abre **MySQL Workbench** o la línea de comandos y crea la base de datos:
    ```sql
    CREATE DATABASE ecommerce_api CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    CREATE USER 'ecommerce_user'@'localhost' IDENTIFIED BY 'change_me';
    GRANT ALL PRIVILEGES ON ecommerce_api.* TO 'ecommerce_user'@'localhost';
    FLUSH PRIVILEGES;
    ```

> Alternativa recomendada: instalar **XAMPP** o **Laragon**, que incluyen PHP, MySQL y Composer preconfigurados, evitando la configuración manual de PATH.

### 4. Instalar Git

Descarga e instala Git para Windows: https://git-scm.com/download/win

### 5. Clonar el repositorio

En PowerShell o Git Bash:

```powershell
cd C:\Proyectos
git clone https://github.com/TU-USUARIO/ecommerce-api-laravel12.git
cd ecommerce-api-laravel12
```

### 6. Instalar dependencias y configurar entorno

```powershell
composer install
copy .env.example .env
php artisan key:generate
php artisan jwt:secret
```

Edita `.env` con Notepad++, VS Code o el bloc de notas, ajustando `DB_*` y las claves de Stripe.

### 7. Migraciones, seeders y Swagger

```powershell
php artisan migrate --seed
php artisan l5-swagger:generate
```

### 8. Levantar el servidor

```powershell
php artisan serve
```

Abre `http://127.0.0.1:8000/api/documentation` en el navegador.

---

## ⚙️ Configuración del archivo .env

Copia `.env.example` a `.env` y ajusta como mínimo:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ecommerce_api
DB_USERNAME=ecommerce_user
DB_PASSWORD=change_me

JWT_SECRET=            # se genera con: php artisan jwt:secret
JWT_TTL=60

STRIPE_SECRET_KEY=your_stripe_test_key_here

L5_SWAGGER_CONST_HOST=http://localhost:8000/api
```

---

## 🌱 Migraciones y seeders

```bash
php artisan migrate --seed
```

Esto crea las tablas `users`, `products`, `orders`, `order_items`, `payments` y las puebla con:

- **2 usuarios** (`UserSeeder`):
    - `admin@example.com` / `Admin1234` (rol `admin`, puede gestionar productos)
    - `cliente@example.com` / `Cliente1234` (rol `customer`)
- **15 productos** de ejemplo (`ProductSeeder`).

Para revertir y volver a poblar desde cero:

```bash
php artisan migrate:fresh --seed
```

---

## 🔐 Configuración de JWT

1. Instala el paquete (ya está en `composer.json`):
    ```bash
    composer require tymon/jwt-auth
    ```
2. Publica su configuración (ya incluida en este repo como `config/jwt.php`):
    ```bash
    php artisan vendor:publish --provider="Tymon\JWTAuth\Providers\LaravelServiceProvider"
    ```
3. Genera la clave secreta:
    ```bash
    php artisan jwt:secret
    ```
4. El guard `api` ya está configurado en `config/auth.php` con `'driver' => 'jwt'`.
5. Uso: enviar el token en el header `Authorization: Bearer {token}` en cada petición protegida.

---

## 💳 Configuración de Stripe

1. Crea una cuenta gratuita en https://dashboard.stripe.com/register
2. Ve a **Developers → API keys** y copia:
    - `Publishable key` → `STRIPE_KEY`
    - `Secret key` → `STRIPE_SECRET`
3. Para probar el webhook localmente, instala **Stripe CLI**:
    - Debian: descarga el `.deb` desde https://github.com/stripe/stripe-cli/releases e instala con `sudo dpkg -i stripe_X.X.X_linux_amd64.deb`
    - Windows: descarga el `.exe` desde el mismo repositorio de releases.
4. Autentícate y reenvía eventos a tu entorno local:
    ```bash
    stripe login
    stripe listen --forward-to localhost:8000/api/payments/webhook
    ```
5. Copia el `whsec_...` que te entrega el comando `stripe listen` en `STRIPE_WEBHOOK_SECRET`.
6. Usa las [tarjetas de prueba de Stripe](https://stripe.com/docs/testing) para simular pagos, por ejemplo `4242 4242 4242 4242` con cualquier fecha futura y CVC.

---

## ▶️ Levantar el servidor

```bash
php artisan serve
```

Por defecto corre en `http://127.0.0.1:8000`. Para exponerlo en la red local (útil si pruebas desde el móvil en la misma red):

```bash
php artisan serve --host=0.0.0.0 --port=8000
```

---

## 📖 Documentación Swagger

Regenerar la documentación después de modificar anotaciones `@OA\...`:

```bash
php artisan l5-swagger:generate
```

Accede a Swagger UI en:

```
http://127.0.0.1:8000/api/documentation
```

Desde ahí puedes:

- Ver todos los endpoints agrupados por etiquetas (Autenticación, Productos, Órdenes, Pagos).
- Usar el botón **Authorize** para pegar tu token JWT (`Bearer {token}`) y probar rutas protegidas directamente desde el navegador.

---

## 🔗 Endpoints disponibles

| Método | Endpoint                 | Descripción                              | Auth  |
| ------ | ------------------------ | ---------------------------------------- | ----- |
| POST   | `/api/auth/register`     | Registrar nuevo cliente                  | No    |
| POST   | `/api/auth/login`        | Iniciar sesión (retorna JWT)             | No    |
| GET    | `/api/auth/me`           | Datos del usuario autenticado            | Sí    |
| POST   | `/api/auth/logout`       | Cerrar sesión (invalida token)           | Sí    |
| POST   | `/api/auth/refresh`      | Refrescar token JWT                      | Sí    |
| GET    | `/api/products`          | Listado público de productos             | No    |
| GET    | `/api/products/{id}`     | Detalle de un producto                   | No    |
| POST   | `/api/products`          | Crear producto                           | Admin |
| PUT    | `/api/products/{id}`     | Actualizar producto                      | Admin |
| DELETE | `/api/products/{id}`     | Eliminar producto                        | Admin |
| POST   | `/api/orders`            | Crear orden de compra                    | Sí    |
| GET    | `/api/orders`            | Historial de compras del usuario         | Sí    |
| GET    | `/api/orders/{id}`       | Detalle de una orden propia              | Sí    |
| POST   | `/api/payments/checkout` | Crear PaymentIntent de Stripe para pagar | Sí    |
| POST   | `/api/payments/webhook`  | Webhook de confirmación de Stripe        | No\*  |

\* El webhook no usa JWT: Stripe firma la petición y se valida con `STRIPE_WEBHOOK_SECRET`.

---

## 🔄 Probar el flujo completo (registro → compra → pago)

1. **Registrar cliente**
    ```bash
    curl -X POST http://127.0.0.1:8000/api/auth/register \
      -H "Content-Type: application/json" \
      -d '{"name":"Juan Pérez","email":"juan@example.com","password":"Secreto123","password_confirmation":"Secreto123"}'
    ```
2. **Login** (guarda el `token` de la respuesta)
    ```bash
    curl -X POST http://127.0.0.1:8000/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{"email":"juan@example.com","password":"Secreto123"}'
    ```
3. **Listar productos**
    ```bash
    curl http://127.0.0.1:8000/api/products
    ```
4. **Crear una orden** (reemplaza `{TOKEN}`)
    ```bash
    curl -X POST http://127.0.0.1:8000/api/orders \
      -H "Authorization: Bearer {TOKEN}" \
      -H "Content-Type: application/json" \
      -d '{"items":[{"product_id":1,"quantity":2}],"shipping_address":"Col. Escalón, San Salvador"}'
    ```
5. **Iniciar el pago** (con el `id` de la orden creada)
    ```bash
    curl -X POST http://127.0.0.1:8000/api/payments/checkout \
      -H "Authorization: Bearer {TOKEN}" \
      -H "Content-Type: application/json" \
      -d '{"order_id":1}'
    ```
    Usa el `client_secret` retornado en un frontend con Stripe.js/Elements (o Stripe CLI para simular) para confirmar el pago; el webhook actualizará automáticamente la orden a `paid`.
6. **Consultar historial de compras**
    ```bash
    curl http://127.0.0.1:8000/api/orders -H "Authorization: Bearer {TOKEN}"
    ```

---

## ⚠️ Manejo de errores

Todas las respuestas siguen un formato JSON consistente:

**Éxito:**

```json
{ "success": true, "message": "...", "data": {} }
```

**Error de validación (422):**

```json
{
    "success": false,
    "message": "Error de validación.",
    "errors": { "email": ["El correo ya está registrado."] }
}
```

**No autenticado (401) / No autorizado (403) / No encontrado (404) / Error del servidor (500):**

```json
{ "success": false, "message": "Descripción del error." }
```

Este comportamiento se centraliza en `bootstrap/app.php` mediante `withExceptions()`, propio de la nueva estructura de Laravel 11/12 (ya no existe `app/Exceptions/Handler.php`).

---

## 🛠️ Solución de problemas comunes

| Problema                                                     | Solución                                                                                                            |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `SQLSTATE[HY000] [2002] Connection refused`                  | Verifica que MySQL esté corriendo: `sudo systemctl status mysql` (Debian) o el servicio en XAMPP/Laragon (Windows). |
| `Class "Tymon\JWTAuth..." not found`                         | Ejecuta `composer install` de nuevo y confirma que `tymon/jwt-auth` está en `composer.json`.                        |
| `php artisan jwt:secret` no agrega la clave                  | Verifica que el `.env` exista (`cp .env.example .env`) antes de ejecutar el comando.                                |
| Swagger UI muestra "No operations defined"                   | Ejecuta `php artisan l5-swagger:generate` y revisa que `L5_SWAGGER_GENERATE_ALWAYS=true` en `.env`.                 |
| Stripe webhook responde 400                                  | Confirma que `STRIPE_WEBHOOK_SECRET` coincide con el valor entregado por `stripe listen`.                           |
| Error de permisos en `storage/` o `bootstrap/cache/` (Linux) | `sudo chmod -R 775 storage bootstrap/cache && sudo chown -R $USER:www-data storage bootstrap/cache`                 |
| `Class 'GD' not found` al generar imágenes                   | Instala la extensión: `sudo apt install php-gd` y reinicia `php-fpm`/`apache`.                                      |

---

## 📄 Licencia

MIT — libre para uso educativo y de referencia.
