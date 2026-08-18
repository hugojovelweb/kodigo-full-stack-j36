# 📚 Sistema de Gestión de Biblioteca (Mini-Aplicación OOP)
### Hugo Ernesto Jovel Hernandez - FSJ-36

Implementación completa de un sistema de gestión bibliotecaria desarrollado en **PHP**, aplicando **Programación Orientada a Objetos (POO)** y **MySQL** a través de **PDO**. El sistema permite administrar libros, usuarios y préstamos, incluyendo el control de disponibilidad (stock) mediante transacciones.

---

## 🧱 Arquitectura del Proyecto

El proyecto sigue una separación de responsabilidades sencilla, similar a un patrón MVC simplificado:

```
library-management-system/
│
├── index.php                # Vista / Controlador de entrada (routing + HTML)
├── biblioteca.sql           # Script de creación de la base de datos
├── README.md                # Este archivo
│
└── classes/
    ├── Database.php         # Conexión PDO a MySQL (Singleton simple de conexión)
    ├── Libro.php             # Modelo/Entidad: Libro
    ├── Usuario.php            # Modelo/Entidad: Usuario
    ├── Prestamo.php          # Modelo/Entidad: Préstamo
    └── Biblioteca.php        # Capa de servicio: lógica de negocio + acceso a datos (CRUD)
```

**Flujo de la aplicación:**

`index.php` (vista) → captura `$_GET` / `$_POST` → invoca métodos de `Biblioteca` (servicio) → `Biblioteca` usa `Database` para obtener la conexión PDO y ejecuta sentencias preparadas → los resultados se retornan a `index.php` para ser renderizados en HTML.

La lógica de negocio **nunca** vive en `index.php`; este archivo solo captura input del usuario y presenta datos.

---

## ⚙️ Requisitos

* XAMPP (o Laragon / WAMP) con **PHP 7.4+** y **MySQL/MariaDB**
* Extensión `pdo_mysql` habilitada (viene por defecto en XAMPP)
* Navegador web

---

## 🚀 Instalación y Configuración

### 1. Clonar o descargar el proyecto

```bash
git clone https://github.com/Kodigo-academic/library-management-system.git
cd library-management-system
```

Coloca la carpeta del proyecto dentro de `htdocs` (XAMPP) o `www` (Laragon):

```
C:\xampp\htdocs\library-management-system\
```

### 2. Iniciar servicios

Abre el **Panel de Control de XAMPP** y enciende:
* ✅ Apache
* ✅ MySQL

### 3. Crear la base de datos

Abre **phpMyAdmin** en `http://localhost/phpmyadmin`:

1. Ve a la pestaña **SQL**.
2. Copia y pega el contenido de `biblioteca.sql` (o usa **Importar** → selecciona el archivo).
3. Ejecuta. Esto creará:
   * La base de datos `biblioteca`
   * La tabla `libros`
   * La tabla `usuarios`
   * La tabla `prestamos` (con llaves foráneas hacia `libros` y `usuarios`)

Alternativamente, desde línea de comandos:

```bash
mysql -u root -p < biblioteca.sql
```

### 4. Configurar credenciales de conexión

Archivo `classes/Database.php`:

```php
private $host = 'localhost';
private $db_name = 'biblioteca';
private $username = 'root';
private $password = ''; // Ajusta si tu MySQL tiene contraseña
```

Por defecto, XAMPP usa `root` sin contraseña, por lo que normalmente **no modificar nada**.

### 5. Ejecutar la aplicación

Abre en el navegador:

```
http://localhost:8012/library-management-system/index.php   //Ojo verificar su puerto si es 80 o 8012 u otro yo 
ocupo 8012.
```

---

## 🧩 Detalle Técnico de la Implementación

### `classes/Database.php` — Conexión PDO

Se implementó `getConnection()` construyendo un DSN (`mysql:host=...;dbname=...;charset=utf8mb4`) e instanciando `PDO`. Se configuran tres atributos clave:

| Atributo | Valor | Propósito |
|---|---|---|
| `PDO::ATTR_ERRMODE` | `PDO::ERRMODE_EXCEPTION` | Lanza excepciones ante errores SQL, permitiendo `try/catch` |
| `PDO::ATTR_DEFAULT_FETCH_MODE` | `PDO::FETCH_ASSOC` | Los resultados se devuelven como arrays asociativos |
| `PDO::ATTR_EMULATE_PREPARES` | `false` | Usa sentencias preparadas **reales** del driver MySQL (mayor seguridad) |

### `classes/Libro.php`, `Usuario.php`, `Prestamo.php` — Modelos (Encapsulamiento)

Cada clase modelo:
* Declara sus propiedades como **`private`** (encapsulamiento).
* Inicializa los atributos en el **constructor**.
* Expone **getters y setters** públicos para cada propiedad.

`Prestamo` incorpora lógica adicional en su constructor: al crear un préstamo nuevo, `fecha_prestamo` se autoasigna con `date('Y-m-d')` y `estado` se inicializa en `'activo'`.

### `classes/Biblioteca.php` — Lógica de Negocio (Capa de Servicio)

Implementa el **CRUD completo** usando sentencias preparadas de PDO (`bindValue` + `execute`) para prevenir inyección SQL:

**Libros:** `agregarLibro()`, `editarLibro()`, `eliminarLibro()`, `obtenerLibros()`, `buscarLibro()`

**Usuarios:** `agregarUsuario()`, `editarUsuario()`, `eliminarUsuario()`, `obtenerUsuarios()`, `buscarUsuario()`

**Préstamos (operaciones transaccionales):**

* **`prestarLibro($libro_id, $usuario_id)`**
  1. Verifica que el libro exista y tenga `cantidad > 0`.
  2. Abre una transacción (`beginTransaction()`).
  3. Inserta el registro en `prestamos` con `estado = 'activo'`.
  4. Decrementa `cantidad` en `libros` (`cantidad = cantidad - 1`).
  5. Si todo es exitoso: `commit()`. Si ocurre una excepción: `rollBack()`, garantizando que nunca se descuente stock sin haber registrado el préstamo (o viceversa).

* **`devolverLibro($prestamo_id)`**
  1. Busca el préstamo y valida que no esté ya devuelto.
  2. Abre una transacción.
  3. Actualiza `fecha_devolucion = hoy` y `estado = 'devuelto'`.
  4. Incrementa `cantidad` en `libros` (`cantidad = cantidad + 1`).
  5. `commit()` / `rollBack()` según corresponda.

* **`obtenerPrestamosActivos()`** y **`obtenerTodosLosPrestamos()`**: usan `INNER JOIN` con `libros` y `usuarios` para devolver el título del libro y el nombre del usuario junto al registro de préstamo, evitando así múltiples consultas (N+1) desde la vista.

### `index.php` — Interfaz de Usuario

* Enrutamiento simple basado en `?action=libros | usuarios | prestamos` (por defecto `libros`).
* Los formularios de **crear/editar** libro y usuario usan `POST` sobre el mismo `index.php`; se distingue creación vs edición según si viaja un campo oculto `id`.
* Las acciones de **eliminar** y **devolver** se ejecutan vía enlaces `GET` con confirmación JavaScript (`confirm()`), y luego redirigen (`header('Location: ...')`) para evitar reenvíos duplicados al refrescar la página.
* Toda salida de datos dinámicos pasa por `htmlspecialchars()` para prevenir XSS.
* El listado de préstamos muestra un `badge` visual distinto para estado `activo` (amarillo) y `devuelto` (verde).
* El formulario de préstamo deshabilita en el `<select>` los libros con `cantidad <= 0`, evitando prestar libros sin stock desde la propia interfaz.

---

## ✅ Funcionalidades Implementadas

| Módulo | Funcionalidad | Estado |
|---|---|---|
| Libros | Crear | ✅ |
| Libros | Listar | ✅ |
| Libros | Editar | ✅ |
| Libros | Eliminar | ✅ |
| Usuarios | Crear | ✅ |
| Usuarios | Listar | ✅ |
| Usuarios | Editar | ✅ |
| Usuarios | Eliminar | ✅ |
| Préstamos | Registrar préstamo (con validación de stock) | ✅ |
| Préstamos | Registrar devolución (con actualización de stock) | ✅ |
| Préstamos | Ver historial completo y préstamos activos | ✅ |
| General | Conexión PDO con manejo de excepciones | ✅ |
| General | Sentencias preparadas (prevención de SQL Injection) | ✅ |
| General | Transacciones (`beginTransaction`/`commit`/`rollBack`) | ✅ |
| General | Sanitización de salida (`htmlspecialchars`) | ✅ |

---

## 🧪 Guía de Pruebas Manuales

1. **Crear registros**: ir a *Inicio/Libros* y *Usuarios*, llenar el formulario y pulsar "Agregar". Verificar que el nuevo registro aparezca en la tabla.
2. **Editar información**: pulsar "Editar" en cualquier fila; el formulario se precarga con los datos existentes; guardar cambios y verificar la actualización en la tabla.
3. **Eliminar registros**: pulsar "Eliminar"; confirmar el diálogo; verificar que el registro desaparezca.
4. **Registrar préstamos**: ir a *Préstamos*, seleccionar un libro con disponibilidad y un usuario, pulsar "Registrar Préstamo". Verificar que la `cantidad` del libro disminuya en 1 y que el préstamo aparezca como `activo`.
5. **Registrar devoluciones**: pulsar "Devolver" en un préstamo activo. Verificar que el estado cambie a `devuelto`, se registre la fecha de devolución y que la `cantidad` del libro aumente en 1.

*(Adjuntar capturas de pantalla de cada uno de estos pasos en la carpeta `/screenshots` del repositorio al momento de entregar la tarea).*

---

## 🗃️ Modelo de Base de Datos

```
libros            usuarios            prestamos
--------          --------            ---------
id (PK)           id (PK)             id (PK)
titulo            nombre              libro_id (FK -> libros.id)
autor             email (UNIQUE)      usuario_id (FK -> usuarios.id)
isbn (UNIQUE)     telefono            fecha_prestamo
cantidad          created_at          fecha_devolucion
created_at                            estado (ENUM: activo/devuelto)
```

Relación: `prestamos` es una tabla intermedia que resuelve una relación **muchos a muchos** entre `libros` y `usuarios`, añadiendo atributos propios de la relación (fechas y estado).

---

## 👨‍💻 Conceptos de POO Aplicados

* **Encapsulamiento**: atributos `private` en todas las entidades, accedidos solo mediante getters/setters.
* **Abstracción**: `Database` oculta los detalles de la conexión PDO al resto del sistema.
* **Separación de responsabilidades**: modelos (datos) vs. servicio (`Biblioteca`, lógica + persistencia) vs. vista (`index.php`).
* **Reutilización de código**: los métodos CRUD de `Biblioteca` se reutilizan desde cualquier acción de `index.php`.
* **Inyección de dependencias simple**: `Biblioteca` recibe su conexión a través de una instancia de `Database`, en lugar de crear la conexión "a mano".

---

## 📌 Notas

* No se implementa sistema de autenticación/login, conforme a lo solicitado en la actividad.
* Las validaciones son básicas (campos requeridos vía HTML5 `required`); en un entorno de producción se recomendaría añadir validación adicional en el servidor (formato de email, longitud de ISBN, etc.).

### Author: Hugo Ernesto Jovel Hernandez - Full Stack Developer J-36
