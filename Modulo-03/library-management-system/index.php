<?php
require_once 'classes/Biblioteca.php';

// Instanciamos la clase Biblioteca (gestor de la lógica de negocio)
$biblioteca = new Biblioteca();

// Sección activa (libros | usuarios | prestamos). Por defecto: libros
$action = $_GET['action'] ?? 'libros';

// Mensaje de feedback para el usuario (éxito / error)
$mensaje = '';
$tipoMensaje = ''; // 'success' | 'error'

/* =========================================================
 *  MANEJO DE PETICIONES POST (Crear / Editar)
 * ========================================================= */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // ---------- LIBROS ----------
    if (isset($_POST['guardar_libro'])) {
        $titulo   = trim($_POST['titulo']);
        $autor    = trim($_POST['autor']);
        $isbn     = trim($_POST['isbn']);
        $cantidad = (int) $_POST['cantidad'];
        $id       = $_POST['id'] ?? '';

        if ($id !== '') {
            // Edición de libro existente
            $ok = $biblioteca->editarLibro($id, [
                'titulo' => $titulo, 'autor' => $autor,
                'isbn' => $isbn, 'cantidad' => $cantidad
            ]);
            $mensaje = $ok ? 'Libro actualizado correctamente.' : 'Error al actualizar el libro.';
        } else {
            // Creación de libro nuevo
            $libro = new Libro($titulo, $autor, $isbn, $cantidad);
            $ok = $biblioteca->agregarLibro($libro);
            $mensaje = $ok ? 'Libro agregado correctamente.' : 'Error al agregar el libro.';
        }
        $tipoMensaje = $ok ? 'success' : 'error';
        $action = 'libros';
    }

    // ---------- USUARIOS ----------
    if (isset($_POST['guardar_usuario'])) {
        $nombre   = trim($_POST['nombre']);
        $email    = trim($_POST['email']);
        $telefono = trim($_POST['telefono']);
        $id       = $_POST['id'] ?? '';

        if ($id !== '') {
            $ok = $biblioteca->editarUsuario($id, [
                'nombre' => $nombre, 'email' => $email, 'telefono' => $telefono
            ]);
            $mensaje = $ok ? 'Usuario actualizado correctamente.' : 'Error al actualizar el usuario.';
        } else {
            $usuario = new Usuario($nombre, $email, $telefono);
            $ok = $biblioteca->agregarUsuario($usuario);
            $mensaje = $ok ? 'Usuario agregado correctamente.' : 'Error al agregar el usuario.';
        }
        $tipoMensaje = $ok ? 'success' : 'error';
        $action = 'usuarios';
    }

    // ---------- PRÉSTAMOS ----------
    if (isset($_POST['prestar_libro'])) {
        $libro_id   = (int) $_POST['libro_id'];
        $usuario_id = (int) $_POST['usuario_id'];

        $ok = $biblioteca->prestarLibro($libro_id, $usuario_id);
        $mensaje = $ok
            ? 'Préstamo registrado correctamente.'
            : 'No se pudo registrar el préstamo (verifica que haya ejemplares disponibles).';
        $tipoMensaje = $ok ? 'success' : 'error';
        $action = 'prestamos';
    }
}

/* =========================================================
 *  MANEJO DE PETICIONES GET (Eliminar / Devolver)
 * ========================================================= */
if (isset($_GET['eliminar_libro'])) {
    $biblioteca->eliminarLibro((int) $_GET['eliminar_libro']);
    header('Location: index.php?action=libros');
    exit;
}

if (isset($_GET['eliminar_usuario'])) {
    $biblioteca->eliminarUsuario((int) $_GET['eliminar_usuario']);
    header('Location: index.php?action=usuarios');
    exit;
}

if (isset($_GET['devolver'])) {
    $biblioteca->devolverLibro((int) $_GET['devolver']);
    header('Location: index.php?action=prestamos');
    exit;
}

// Datos para edición (si se pasa ?editar_libro=ID o ?editar_usuario=ID)
$libroEditar = null;
if (isset($_GET['editar_libro'])) {
    $libroEditar = $biblioteca->buscarLibro((int) $_GET['editar_libro']);
}

$usuarioEditar = null;
if (isset($_GET['editar_usuario'])) {
    $usuarioEditar = $biblioteca->buscarUsuario((int) $_GET['editar_usuario']);
}

// Datos necesarios para cada sección
$libros = $biblioteca->obtenerLibros();
$usuarios = $biblioteca->obtenerUsuarios();
$prestamos = $biblioteca->obtenerTodosLosPrestamos();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistema de Gestión de Biblioteca</title>
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            margin: 0;
            background: #f4f6f8;
            color: #2b2b2b;
        }
        .container { max-width: 1000px; margin: 0 auto; padding: 20px; }
        h1 { color: #1a4f6e; }
        h2 { color: #1a4f6e; border-bottom: 2px solid #1a4f6e; padding-bottom: 6px; }

        nav {
            margin-bottom: 25px;
            background: #1a5a6e;
            padding: 12px 18px;
            border-radius: 6px;
        }
        nav a {
            margin-right: 20px;
            text-decoration: none;
            color: #fff;
            font-weight: 600;
        }
        nav a:hover { text-decoration: underline; }

        .mensaje {
            padding: 10px 15px;
            border-radius: 5px;
            margin-bottom: 15px;
            font-weight: 600;
        }
        .mensaje.success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .mensaje.error   { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }

        .card {
            background: #fff;
            padding: 18px;
            border-radius: 8px;
            box-shadow: 0 1px 4px rgba(0,0,0,0.1);
            margin-bottom: 25px;
        }

        form.inline-form { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        form.inline-form.two-col { grid-template-columns: 1fr; }
        form label { font-size: 13px; font-weight: 600; color: #555; display: block; margin-bottom: 4px; }
        form input, form select {
            width: 100%;
            padding: 8px 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-size: 14px;
        }
        .form-actions { grid-column: 1 / -1; margin-top: 8px; }

        button, .btn {
            background: #1a5a6e;
            color: #fff;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            text-decoration: none;
            display: inline-block;
        }
        button:hover, .btn:hover { background: #142f57; }
        .btn-danger { background: #c0392b; }
        .btn-danger:hover { background: #96281b; }
        .btn-success { background: #27ae60; }
        .btn-success:hover { background: #1e8449; }
        .btn-secondary { background: #7f8c8d; }

        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e0e0e0; font-size: 14px; }
        th { background: #eef2f7; color: #1a4f6e; }
        tr:hover { background: #f9fbfd; }

        .badge { padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; }
        .badge.activo { background: #fff3cd; color: #856404; }
        .badge.devuelto { background: #d4edda; color: #155724; }

        .acciones a { margin-right: 10px; font-size: 13px; }
        .empty { color: #888; font-style: italic; padding: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📚 Biblioteca Mini-App</h1>

        <nav>
            <a href="index.php?action=libros">Inicio / Libros</a>
            <a href="index.php?action=usuarios">Usuarios</a>
            <a href="index.php?action=prestamos">Préstamos</a>
        </nav>

        <?php if ($mensaje): ?>
            <div class="mensaje <?= $tipoMensaje ?>"><?= htmlspecialchars($mensaje) ?></div>
        <?php endif; ?>

        <div id="content">

        <?php if ($action === 'libros'): ?>
            <!-- ==================== SECCIÓN LIBROS ==================== -->
            <div class="card">
                <h2><?= $libroEditar ? 'Editar Libro' : 'Agregar Nuevo Libro' ?></h2>
                <form class="inline-form" method="POST" action="index.php">
                    <?php if ($libroEditar): ?>
                        <input type="hidden" name="id" value="<?= htmlspecialchars($libroEditar['id']) ?>">
                    <?php endif; ?>

                    <div>
                        <label>Título</label>
                        <input type="text" name="titulo" required
                               value="<?= htmlspecialchars($libroEditar['titulo'] ?? '') ?>">
                    </div>
                    <div>
                        <label>Autor</label>
                        <input type="text" name="autor" required
                               value="<?= htmlspecialchars($libroEditar['autor'] ?? '') ?>">
                    </div>
                    <div>
                        <label>ISBN</label>
                        <input type="text" name="isbn"
                               value="<?= htmlspecialchars($libroEditar['isbn'] ?? '') ?>">
                    </div>
                    <div>
                        <label>Cantidad</label>
                        <input type="number" name="cantidad" min="0" required
                               value="<?= htmlspecialchars($libroEditar['cantidad'] ?? 1) ?>">
                    </div>
                    <div class="form-actions">
                        <button type="submit" name="guardar_libro">
                            <?= $libroEditar ? 'Actualizar Libro' : 'Agregar Libro' ?>
                        </button>
                        <?php if ($libroEditar): ?>
                            <a class="btn btn-secondary" href="index.php?action=libros">Cancelar</a>
                        <?php endif; ?>
                    </div>
                </form>
            </div>

            <div class="card">
                <h2>Listado de Libros</h2>
                <?php if (empty($libros)): ?>
                    <p class="empty">No hay libros registrados todavía.</p>
                <?php else: ?>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th><th>Título</th><th>Autor</th><th>ISBN</th><th>Disponibles</th><th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($libros as $l): ?>
                        <tr>
                            <td><?= htmlspecialchars($l['id']) ?></td>
                            <td><?= htmlspecialchars($l['titulo']) ?></td>
                            <td><?= htmlspecialchars($l['autor']) ?></td>
                            <td><?= htmlspecialchars($l['isbn']) ?></td>
                            <td><?= htmlspecialchars($l['cantidad']) ?></td>
                            <td class="acciones">
                                <a href="index.php?action=libros&editar_libro=<?= $l['id'] ?>">Editar</a>
                                <a href="index.php?eliminar_libro=<?= $l['id'] ?>"
                                   onclick="return confirm('¿Eliminar este libro?');">Eliminar</a>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
                <?php endif; ?>
            </div>

        <?php elseif ($action === 'usuarios'): ?>
            <!-- ==================== SECCIÓN USUARIOS ==================== -->
            <div class="card">
                <h2><?= $usuarioEditar ? 'Editar Usuario' : 'Agregar Nuevo Usuario' ?></h2>
                <form class="inline-form" method="POST" action="index.php">
                    <?php if ($usuarioEditar): ?>
                        <input type="hidden" name="id" value="<?= htmlspecialchars($usuarioEditar['id']) ?>">
                    <?php endif; ?>

                    <div>
                        <label>Nombre</label>
                        <input type="text" name="nombre" required
                               value="<?= htmlspecialchars($usuarioEditar['nombre'] ?? '') ?>">
                    </div>
                    <div>
                        <label>Email</label>
                        <input type="email" name="email" required
                               value="<?= htmlspecialchars($usuarioEditar['email'] ?? '') ?>">
                    </div>
                    <div>
                        <label>Teléfono</label>
                        <input type="text" name="telefono"
                               value="<?= htmlspecialchars($usuarioEditar['telefono'] ?? '') ?>">
                    </div>
                    <div class="form-actions">
                        <button type="submit" name="guardar_usuario">
                            <?= $usuarioEditar ? 'Actualizar Usuario' : 'Agregar Usuario' ?>
                        </button>
                        <?php if ($usuarioEditar): ?>
                            <a class="btn btn-secondary" href="index.php?action=usuarios">Cancelar</a>
                        <?php endif; ?>
                    </div>
                </form>
            </div>

            <div class="card">
                <h2>Listado de Usuarios</h2>
                <?php if (empty($usuarios)): ?>
                    <p class="empty">No hay usuarios registrados todavía.</p>
                <?php else: ?>
                <table>
                    <thead>
                        <tr><th>ID</th><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Acciones</th></tr>
                    </thead>
                    <tbody>
                        <?php foreach ($usuarios as $u): ?>
                        <tr>
                            <td><?= htmlspecialchars($u['id']) ?></td>
                            <td><?= htmlspecialchars($u['nombre']) ?></td>
                            <td><?= htmlspecialchars($u['email']) ?></td>
                            <td><?= htmlspecialchars($u['telefono']) ?></td>
                            <td class="acciones">
                                <a href="index.php?action=usuarios&editar_usuario=<?= $u['id'] ?>">Editar</a>
                                <a href="index.php?eliminar_usuario=<?= $u['id'] ?>"
                                   onclick="return confirm('¿Eliminar este usuario?');">Eliminar</a>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
                <?php endif; ?>
            </div>

        <?php elseif ($action === 'prestamos'): ?>
            <!-- ==================== SECCIÓN PRÉSTAMOS ==================== -->
            <div class="card">
                <h2>Registrar Nuevo Préstamo</h2>
                <form class="inline-form" method="POST" action="index.php">
                    <div>
                        <label>Libro</label>
                        <select name="libro_id" required>
                            <option value="">-- Selecciona un libro --</option>
                            <?php foreach ($libros as $l): ?>
                                <option value="<?= $l['id'] ?>" <?= $l['cantidad'] <= 0 ? 'disabled' : '' ?>>
                                    <?= htmlspecialchars($l['titulo']) ?> (Disponibles: <?= $l['cantidad'] ?>)
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div>
                        <label>Usuario</label>
                        <select name="usuario_id" required>
                            <option value="">-- Selecciona un usuario --</option>
                            <?php foreach ($usuarios as $u): ?>
                                <option value="<?= $u['id'] ?>"><?= htmlspecialchars($u['nombre']) ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div class="form-actions">
                        <button type="submit" name="prestar_libro">Registrar Préstamo</button>
                    </div>
                </form>
            </div>

            <div class="card">
                <h2>Historial de Préstamos</h2>
                <?php if (empty($prestamos)): ?>
                    <p class="empty">No hay préstamos registrados todavía.</p>
                <?php else: ?>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th><th>Libro</th><th>Usuario</th><th>Fecha Préstamo</th>
                            <th>Fecha Devolución</th><th>Estado</th><th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($prestamos as $p): ?>
                        <tr>
                            <td><?= htmlspecialchars($p['id']) ?></td>
                            <td><?= htmlspecialchars($p['libro_titulo']) ?></td>
                            <td><?= htmlspecialchars($p['usuario_nombre']) ?></td>
                            <td><?= htmlspecialchars($p['fecha_prestamo']) ?></td>
                            <td><?= htmlspecialchars($p['fecha_devolucion'] ?? '—') ?></td>
                            <td><span class="badge <?= $p['estado'] ?>"><?= htmlspecialchars($p['estado']) ?></span></td>
                            <td class="acciones">
                                <?php if ($p['estado'] === 'activo'): ?>
                                    <a class="btn btn-success" href="index.php?devolver=<?= $p['id'] ?>"
                                       onclick="return confirm('¿Confirmar devolución de este libro?');">Devolver</a>
                                <?php else: ?>
                                    —
                                <?php endif; ?>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
                <?php endif; ?>
            </div>

        <?php endif; ?>
        </div>
    </div>
</body>
</html>
