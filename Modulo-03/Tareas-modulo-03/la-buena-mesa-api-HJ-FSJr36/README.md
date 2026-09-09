# La Buena Mesa — API RESTful de Gestión de Menú
#### Hugo Ernesto Jovel Hernández Full Stack Jr 36

API RESTful construida con **Laravel 12** y **Eloquent ORM**, siguiendo principios de **arquitectura limpia** y separación de responsabilidades, para centralizar la gestión del menú del restaurante *"La Buena Mesa"* (cocina fusión contemporánea).

> Actividad: *Desarrollo de APIs RESTful Profesionales: Implementación de Eloquent ORM y Arquitectura Limpia para la Gestión de Datos.*

---

## Tabla de contenidos

1. [Caso de estudio](#caso-de-estudio)
2. [Arquitectura y decisiones de diseño](#arquitectura-y-decisiones-de-diseño)
3. [Estructura del proyecto](#estructura-del-proyecto)
4. [Requisitos previos](#requisitos-previos)
5. [Instalación — Debian 13 (Trixie) con entorno XFCE](#instalación--debian-13-trixie-con-entorno-xfce)
6. [Instalación rápida (resumen multiplataforma)](#instalación-rápida-resumen-multiplataforma)
7. [Documentación de endpoints](#documentación-de-endpoints)
8. [Ejemplos de uso de la API](#ejemplos-de-uso-de-la-api)
9. [Pruebas automatizadas](#pruebas-automatizadas)
10. [Solución de problemas comunes en Debian/XFCE](#solución-de-problemas-comunes-en-debianxfce)

---

## Caso de estudio

El restaurante **"La Buena Mesa"** necesita digitalizar la gestión de su menú para:

- Centralizar la información del menú en un único sistema accesible.
- Actualizar en tiempo real precios, disponibilidad y descripciones.
- Categorizar los platillos para facilitar su organización.
- Permitir integración futura con apps móviles y sistemas de punto de venta (POS).
- Garantizar escalabilidad para expandirse a múltiples sucursales.

Esta API RESTful es el **backend centralizado** que consumirán la app de meseros, el sistema de cocina y la plataforma web, todos leyendo y escribiendo contra la misma fuente de verdad.

---

## Arquitectura y decisiones de diseño

El proyecto sigue una **arquitectura en capas** (arquitectura limpia aplicada a Laravel), donde cada clase tiene una única responsabilidad:

```
Petición HTTP
     │
     ▼
routes/api.php ─────────────► define el contrato de URLs
     │
     ▼
Controller (MenuItemController) ─► orquesta la petición, NO valida ni transforma
     │
     ├──► FormRequest (Store/UpdateMenuItemRequest) ─► valida y autoriza la entrada
     │
     ├──► Model (MenuItem / Eloquent) ─► reglas de negocio y acceso a datos
     │
     └──► API Resource (MenuItemResource) ─► da forma a la respuesta JSON de salida
```

| Capa | Responsabilidad | Archivo |
|---|---|---|
| **Rutas** | Definir el contrato REST (verbo + URI → acción) | `routes/api.php` |
| **Controlador** | Orquestar la petición/respuesta, sin lógica de negocio ni validación | `app/Http/Controllers/Api/MenuItemController.php` |
| **Form Requests** | Validación y autorización de la entrada, desacoplada del controlador | `app/Http/Requests/Store...` / `Update...` |
| **Modelo (Eloquent)** | Acceso a datos, casts, scopes de consulta reutilizables, reglas del dominio | `app/Models/MenuItem.php` |
| **API Resource** | Transformar el modelo en el contrato JSON público (desacopla BD de API) | `app/Http/Resources/MenuItemResource.php` |
| **Migraciones** | Versionado del esquema de base de datos | `database/migrations/` |
| **Seeders / Factories** | Datos de ejemplo y datos de prueba reproducibles | `database/seeders/`, `database/factories/` |
| **Tests** | Verificación automática de cada endpoint del CRUD | `tests/Feature/MenuItemApiTest.php` |

**Buenas prácticas aplicadas:**

- **Mass assignment protegido** (`$fillable` explícito en el modelo, nunca `$guarded = []`).
- **Route Model Binding** (`{menuItem}` en las rutas resuelve automáticamente el modelo o devuelve 404 estandarizado).
- **Respuestas JSON consistentes**, incluso en errores 404 y 422 (ver `bootstrap/app.php`).
- **Soft Deletes**: los platillos "eliminados" no se pierden físicamente (auditoría / recuperación).
- **Scopes de consulta reutilizables** (`available()`, `byCategory()`) en lugar de condicionales repetidos en el controlador.
- **Form Requests con mensajes en español** y respuesta 422 uniforme.
- **CORS habilitado** (`config/cors.php`) para que la API pueda ser consumida desde la futura app móvil o el sistema POS.
- **Paginación** en el listado (`GET /api/menu-items`) para escalabilidad cuando el menú crezca.

---

## Estructura del proyecto

```
la-buena-mesa-api/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Controller.php
│   │   │   └── Api/
│   │   │       └── MenuItemController.php   # Controlador REST (CRUD + filtro por categoría)
│   │   ├── Requests/
│   │   │   ├── StoreMenuItemRequest.php     # Validación de creación
│   │   │   └── UpdateMenuItemRequest.php    # Validación de actualización
│   │   └── Resources/
│   │       └── MenuItemResource.php         # Forma de la respuesta JSON
│   ├── Models/
│   │   └── MenuItem.php                     # Modelo Eloquent (casts, scopes, soft deletes)
│   └── Providers/
│       └── AppServiceProvider.php
├── bootstrap/
│   ├── app.php                              # Registro de rutas, middleware y manejo de excepciones
│   └── providers.php
├── config/                                  # Configuración de la app (db, cache, cors, etc.)
├── database/
│   ├── factories/
│   │   └── MenuItemFactory.php              # Generador de datos de prueba
│   ├── migrations/
│   │   └── 2025_01_01_000000_create_menu_items_table.php
│   └── seeders/
│       ├── DatabaseSeeder.php
│       └── MenuItemSeeder.php                # Menú de ejemplo curado + datos aleatorios
├── routes/
│   ├── api.php                               # Endpoints /api/menu-items
│   ├── web.php
│   └── console.php
├── tests/
│   └── Feature/
│       └── MenuItemApiTest.php               # Pruebas de los 6 endpoints
├── .env.example
├── composer.json
├── phpunit.xml
├── postman_collection.json                   # Colección lista para importar en Postman
└── README.md
```

---

## Requisitos previos

- PHP **8.2 o superior** con extensiones: `mbstring`, `xml`, `curl`, `sqlite3` (o `mysql`/`pgsql`), `zip`, `bcmath`, `tokenizer`.
- **Composer 2.x** (gestor de dependencias de PHP).
- Base de datos: **SQLite** (recomendado para esta actividad, cero configuración) o MySQL/PostgreSQL.
- Git (opcional, para clonar/versionar el repositorio).

---

## Instalación — Debian 13 (Trixie) con entorno XFCE

Esta sección detalla **paso a paso** cómo dejar el proyecto corriendo en un Debian 13 recién instalado con escritorio XFCE, usando la terminal (`xfce4-terminal`).

### 1. Actualizar el sistema

Abre una terminal (`Aplicaciones → Accesorios → Terminal`, o el atajo `Ctrl+Alt+T` si está configurado) y ejecuta:

```bash
sudo apt update && sudo apt full-upgrade -y
```

### 2. Instalar PHP 8.2+ y las extensiones necesarias

Debian 13 "Trixie" incluye PHP 8.3 en sus repositorios oficiales, lo cual cumple el requisito (`^8.2`) de Laravel 12:

```bash
sudo apt install -y php php-cli php-common php-mbstring php-xml php-curl \
    php-sqlite3 php-zip php-bcmath php-tokenizer php-gd php-intl unzip curl git
```

Verifica la versión instalada:

```bash
php -v
```

Debe mostrar `PHP 8.3.x` (o superior a 8.2). Si tu instalación trae una versión distinta, instala el paquete específico, por ejemplo `sudo apt install php8.3 php8.3-sqlite3 ...`.

### 3. Instalar Composer

Composer no viene en los repos de Debian con la versión más reciente por defecto, así que se instala con el instalador oficial:

```bash
cd ~/Descargas   # o ~/Downloads según el idioma de tu sistema
curl -sS https://getcomposer.org/installer -o composer-setup.php
php composer-setup.php --install-dir=/usr/local/bin --filename=composer
rm composer-setup.php
composer --version
```

Deberías ver algo como `Composer version 2.x.x`.

### 4. (Opcional pero recomendado) Instalar MySQL/MariaDB

Si prefieres MySQL en lugar de SQLite:

```bash
sudo apt install -y mariadb-server php-mysql
sudo systemctl enable --now mariadb
sudo mysql_secure_installation
```

Luego crea la base de datos:

```bash
sudo mysql -u root -p -e "CREATE DATABASE la_buena_mesa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

> Para esta actividad, **SQLite es suficiente y más simple** (no requiere servidor de base de datos corriendo). El resto de la guía usa SQLite por defecto.

### 5. Descomprimir el proyecto y ubicarlo en tu carpeta de trabajo

Desde el archivo `.zip` descargado (por ejemplo en `~/Descargas`):

```bash
mkdir -p ~/proyectos
unzip ~/Descargas/la-buena-mesa-api.zip -d ~/proyectos/
cd ~/proyectos/la-buena-mesa-api
```

### 6. Instalar las dependencias PHP con Composer

```bash
composer install
```

Esto descarga el framework Laravel 12 y todas las dependencias declaradas en `composer.json` dentro de la carpeta `vendor/` (no incluida en el ZIP para mantenerlo liviano, como es estándar en cualquier repositorio Git).

### 7. Configurar el archivo de entorno

```bash
cp .env.example .env
php artisan key:generate
```

El segundo comando genera la clave `APP_KEY` única de tu instalación y la escribe automáticamente en `.env`.

### 8. Crear la base de datos SQLite

```bash
mkdir -p database
touch database/database.sqlite
```

Y en tu archivo `.env`, confirma (o descomenta) estas líneas:

```env
DB_CONNECTION=sqlite
DB_DATABASE=/home/TU_USUARIO/proyectos/la-buena-mesa-api/database/database.sqlite
```

> Sustituye `TU_USUARIO` por tu usuario real de Debian (puedes obtenerlo con `whoami`). Si dejas `DB_DATABASE` vacío, Laravel usará por defecto `database/database.sqlite` de forma relativa, lo cual también funciona.

### 9. Ejecutar las migraciones y los seeders

```bash
php artisan migrate --seed
```

Esto crea la tabla `menu_items` y la llena con el menú de ejemplo de "La Buena Mesa" (más datos aleatorios generados con la factory).

### 10. Levantar el servidor de desarrollo

```bash
php artisan serve
```

Verás un mensaje similar a:

```
INFO  Server running on [http://127.0.0.1:8000].
```

Abre el navegador de XFCE (Firefox ESR viene preinstalado en Debian) y visita:

- `http://127.0.0.1:8000/up` → chequeo de salud de la app.
- `http://127.0.0.1:8000/api/menu-items` → listado del menú en JSON.

Para probar los demás verbos HTTP (POST, PUT, DELETE) instala un cliente REST gráfico como **Insomnia** o **Postman** (hay `.deb`/`AppImage` para Linux), o usa `curl` directamente desde la terminal (ver sección de [ejemplos](#ejemplos-de-uso-de-la-api)). También se incluye `postman_collection.json` listo para importar.

---

## Instalación rápida (resumen multiplataforma)

Si ya tienes PHP 8.2+, Composer y Git instalados (en cualquier distro/SO):

```bash
git clone <URL_DE_TU_REPOSITORIO> la-buena-mesa-api
cd la-buena-mesa-api
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate --seed
php artisan serve
```

La API quedará disponible en `http://127.0.0.1:8000/api`.

---

## Documentación de endpoints

Prefijo base: **`/api`**. Todas las respuestas son `Content-Type: application/json`.

| Método | Endpoint | Descripción | Body de ejemplo |
|---|---|---|---|
| `GET` | `/api/menu-items` | Lista todos los elementos del menú (paginado). Filtros opcionales: `?available=true`, `?category=Postres`, `?per_page=15` | — |
| `GET` | `/api/menu-items/{id}` | Obtiene un elemento específico por su ID | — |
| `POST` | `/api/menu-items` | Crea un nuevo elemento del menú | Ver [ejemplo](#crear-un-elemento) |
| `PUT` | `/api/menu-items/{id}` | Actualiza (reemplazo completo) un elemento existente | Ver [ejemplo](#actualizar-un-elemento) |
| `PATCH` | `/api/menu-items/{id}` | Actualiza parcialmente un elemento existente | `{ "is_available": false }` |
| `DELETE` | `/api/menu-items/{id}` | Elimina (soft delete) un elemento del menú | — |
| `GET` | `/api/menu-items/category/{category}` | Filtra el menú por categoría vía segmento de ruta | — |

### Modelo de datos: `MenuItem`

| Campo | Tipo | Reglas de validación | Descripción |
|---|---|---|---|
| `id` | integer | autogenerado | Identificador único |
| `name` | string | requerido, máx. 150 | Nombre del platillo |
| `description` | string\|null | opcional, máx. 2000 | Descripción del platillo |
| `price` | decimal(8,2) | requerido, numérico, ≥ 0 | Precio actual |
| `category` | string | requerido, máx. 100 | Categoría (Entradas, Postres, etc.) |
| `is_available` | boolean | opcional (default `true`) | Disponibilidad en tiempo real |
| `image_url` | string\|null | opcional, URL válida | Imagen del platillo |
| `created_at` / `updated_at` | datetime ISO-8601 | autogenerado | Trazabilidad de cambios |

### Códigos de estado HTTP usados

| Código | Cuándo se devuelve |
|---|---|
| `200 OK` | Operación exitosa (GET, PUT, PATCH, DELETE) |
| `201 Created` | Elemento creado exitosamente (POST) |
| `404 Not Found` | El elemento solicitado no existe |
| `422 Unprocessable Entity` | Datos de entrada inválidos (con detalle de `errors`) |

---

## Ejemplos de uso de la API

> Los ejemplos usan `curl`. También puedes importar `postman_collection.json` directamente en Postman/Insomnia.

### Listar el menú completo

```bash
curl -s http://127.0.0.1:8000/api/menu-items | json_pp
```

### Listar solo los platillos disponibles

```bash
curl -s "http://127.0.0.1:8000/api/menu-items?available=true"
```

### Filtrar por categoría (query string)

```bash
curl -s "http://127.0.0.1:8000/api/menu-items?category=Postres"
```

### Filtrar por categoría (segmento de ruta)

```bash
curl -s http://127.0.0.1:8000/api/menu-items/category/Postres
```

### Obtener un elemento específico

```bash
curl -s http://127.0.0.1:8000/api/menu-items/1
```

### Crear un elemento

```bash
curl -s -X POST http://127.0.0.1:8000/api/menu-items \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
        "name": "Ceviche Mixto",
        "description": "Pescado y mariscos frescos en leche de tigre.",
        "price": 16.90,
        "category": "Entradas",
        "is_available": true,
        "image_url": "https://picsum.photos/seed/ceviche/600/400"
      }'
```

Respuesta (`201 Created`):

```json
{
  "data": {
    "id": 21,
    "name": "Ceviche Mixto",
    "description": "Pescado y mariscos frescos en leche de tigre.",
    "price": 16.9,
    "category": "Entradas",
    "is_available": true,
    "image_url": "https://picsum.photos/seed/ceviche/600/400",
    "created_at": "2026-09-03T18:00:00+00:00",
    "updated_at": "2026-09-03T18:00:00+00:00"
  }
}
```

### Actualizar un elemento

```bash
curl -s -X PUT http://127.0.0.1:8000/api/menu-items/21 \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
        "name": "Ceviche Mixto Especial",
        "description": "Pescado, camarón y pulpo en leche de tigre de rocoto.",
        "price": 18.50,
        "category": "Entradas",
        "is_available": true
      }'
```

### Actualizar solo la disponibilidad (PATCH)

```bash
curl -s -X PATCH http://127.0.0.1:8000/api/menu-items/21 \
  -H "Content-Type: application/json" \
  -d '{ "is_available": false }'
```

### Eliminar un elemento

```bash
curl -s -X DELETE http://127.0.0.1:8000/api/menu-items/21
```

Respuesta (`200 OK`):

```json
{ "message": "Elemento del menú eliminado correctamente." }
```

### Ejemplo de error de validación (`422`)

```bash
curl -s -X POST http://127.0.0.1:8000/api/menu-items \
  -H "Content-Type: application/json" \
  -d '{ "name": "", "price": -5 }'
```

```json
{
  "message": "Los datos proporcionados no son válidos.",
  "errors": {
    "name": ["El nombre del platillo es obligatorio."],
    "price": ["El precio no puede ser negativo."],
    "category": ["The category field is required."]
  }
}
```

---

## Pruebas automatizadas

El proyecto incluye pruebas de *feature* (`tests/Feature/MenuItemApiTest.php`) que cubren los 7 endpoints: listado, creación, validación, detalle, actualización, eliminación y filtro por categoría.

```bash
php artisan test
```

Salida esperada (resumen):

```
   PASS  Tests\Feature\MenuItemApiTest
  ✓ puede listar elementos del menu
  ✓ puede crear un elemento del menu
  ✓ rechaza creacion con datos invalidos
  ✓ puede mostrar un elemento especifico
  ✓ devuelve 404 para un elemento inexistente
  ✓ puede actualizar un elemento
  ✓ puede eliminar un elemento
  ✓ puede filtrar por categoria via ruta

  Tests:    8 passed
```

---

## Solución de problemas comunes en Debian/XFCE

| Problema | Causa probable | Solución |
|---|---|---|
| `php: command not found` | PHP no instalado o no está en el `PATH` | `sudo apt install php-cli` y reabrir la terminal |
| `composer: command not found` | El binario no quedó en `/usr/local/bin` | Repite el paso 3 o ejecuta `sudo mv composer.phar /usr/local/bin/composer` |
| `could not find driver (SQL: ...)` | Falta la extensión `sqlite3` de PHP | `sudo apt install php-sqlite3` y reinicia el servidor (`Ctrl+C` y `php artisan serve` de nuevo) |
| `The stream or file .../storage/logs/laravel.log could not be opened` | Permisos de la carpeta `storage` | `chmod -R ug+rwx storage bootstrap/cache` dentro del proyecto |
| El puerto 8000 ya está en uso | Otra instancia de `artisan serve` sigue activa | `php artisan serve --port=8001` o cierra el proceso anterior con `Ctrl+C` en su terminal |
| `zip`/`unzip` no reconocido al descomprimir el ZIP | Paquete `unzip` no instalado | `sudo apt install unzip` |
| El firewall de XFCE bloquea el acceso desde otro dispositivo de la red (para probar desde el móvil) | `ufw` activo o reglas de red | `php artisan serve --host=0.0.0.0 --port=8000` y, si usas `ufw`, `sudo ufw allow 8000/tcp` |

---

## Créditos
### Hugo Ernesto Jovel Hernández Full Stack Jr-36

Proyecto desarrollado como actividad práctica: *"Desarrollo de APIs RESTful Profesionales: Implementación de Eloquent ORM y Arquitectura Limpia para la Gestión de Datos"*, caso de estudio del restaurante ficticio **La Buena Mesa**.
