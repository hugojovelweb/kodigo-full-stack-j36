<?php
require_once 'Database.php';
require_once 'Libro.php';
require_once 'Usuario.php';
require_once 'Prestamo.php';

/**
 * Clase Biblioteca
 * Actúa como "Gestor" / capa de servicio (Service Layer). Centraliza toda
 * la lógica de negocio del sistema y es la única clase que se comunica
 * directamente con la base de datos mediante sentencias preparadas (PDO).
 *
 * Los métodos de esta clase son consumidos por index.php, que se limita
 * a mostrar los datos y capturar el input del usuario.
 */
class Biblioteca {
    private $db;
    private $conn;

    public function __construct() {
        // Se instancia Database y se obtiene la conexión PDO activa.
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
    }

    /* =========================================================
     *  GESTIÓN DE LIBROS
     * ========================================================= */

    /**
     * Inserta un nuevo libro en la base de datos.
     * @param Libro $libro
     * @return bool
     */
    public function agregarLibro(Libro $libro) {
        $sql = "INSERT INTO libros (titulo, autor, isbn, cantidad) 
                VALUES (:titulo, :autor, :isbn, :cantidad)";
        $stmt = $this->conn->prepare($sql);

        $stmt->bindValue(':titulo', $libro->getTitulo());
        $stmt->bindValue(':autor', $libro->getAutor());
        $stmt->bindValue(':isbn', $libro->getIsbn());
        $stmt->bindValue(':cantidad', $libro->getCantidad(), PDO::PARAM_INT);

        return $stmt->execute();
    }

    /**
     * Actualiza los datos de un libro existente.
     * @param int $id
     * @param array $nuevosDatos Asociativo: titulo, autor, isbn, cantidad
     * @return bool
     */
    public function editarLibro($id, $nuevosDatos) {
        $sql = "UPDATE libros 
                SET titulo = :titulo, autor = :autor, isbn = :isbn, cantidad = :cantidad 
                WHERE id = :id";
        $stmt = $this->conn->prepare($sql);

        $stmt->bindValue(':titulo', $nuevosDatos['titulo']);
        $stmt->bindValue(':autor', $nuevosDatos['autor']);
        $stmt->bindValue(':isbn', $nuevosDatos['isbn']);
        $stmt->bindValue(':cantidad', $nuevosDatos['cantidad'], PDO::PARAM_INT);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);

        return $stmt->execute();
    }

    /**
     * Elimina un libro de la base de datos por su ID.
     * @param int $id
     * @return bool
     */
    public function eliminarLibro($id) {
        $sql = "DELETE FROM libros WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }

    /**
     * Retorna la lista completa de libros ordenada por título.
     * @return array
     */
    public function obtenerLibros() {
        $sql = "SELECT * FROM libros ORDER BY titulo ASC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Retorna un único libro según su ID.
     * @param int $id
     * @return array|false
     */
    public function buscarLibro($id) {
        $sql = "SELECT * FROM libros WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /* =========================================================
     *  GESTIÓN DE USUARIOS
     * ========================================================= */

    /**
     * Inserta un nuevo usuario en la base de datos.
     * @param Usuario $usuario
     * @return bool
     */
    public function agregarUsuario(Usuario $usuario) {
        $sql = "INSERT INTO usuarios (nombre, email, telefono) 
                VALUES (:nombre, :email, :telefono)";
        $stmt = $this->conn->prepare($sql);

        $stmt->bindValue(':nombre', $usuario->getNombre());
        $stmt->bindValue(':email', $usuario->getEmail());
        $stmt->bindValue(':telefono', $usuario->getTelefono());

        return $stmt->execute();
    }

    /**
     * Actualiza los datos de un usuario existente.
     * @param int $id
     * @param array $nuevosDatos Asociativo: nombre, email, telefono
     * @return bool
     */
    public function editarUsuario($id, $nuevosDatos) {
        $sql = "UPDATE usuarios 
                SET nombre = :nombre, email = :email, telefono = :telefono 
                WHERE id = :id";
        $stmt = $this->conn->prepare($sql);

        $stmt->bindValue(':nombre', $nuevosDatos['nombre']);
        $stmt->bindValue(':email', $nuevosDatos['email']);
        $stmt->bindValue(':telefono', $nuevosDatos['telefono']);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);

        return $stmt->execute();
    }

    /**
     * Elimina un usuario de la base de datos por su ID.
     * @param int $id
     * @return bool
     */
    public function eliminarUsuario($id) {
        $sql = "DELETE FROM usuarios WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }

    /**
     * Retorna la lista completa de usuarios ordenada por nombre.
     * @return array
     */
    public function obtenerUsuarios() {
        $sql = "SELECT * FROM usuarios ORDER BY nombre ASC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Retorna un único usuario según su ID.
     * @param int $id
     * @return array|false
     */
    public function buscarUsuario($id) {
        $sql = "SELECT * FROM usuarios WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /* =========================================================
     *  GESTIÓN DE PRÉSTAMOS
     * ========================================================= */

    /**
     * Registra un préstamo de un libro a un usuario.
     * Operación transaccional: inserta el registro en "prestamos" y
     * decrementa en 1 el campo "cantidad" del libro correspondiente.
     * Si cualquiera de las dos operaciones falla, se revierte todo (rollback).
     *
     * @param int $libro_id
     * @param int $usuario_id
     * @return bool
     */
    public function prestarLibro($libro_id, $usuario_id) {
        // Verificamos primero que haya stock disponible.
        $libro = $this->buscarLibro($libro_id);
        if (!$libro || (int)$libro['cantidad'] <= 0) {
            return false; // No hay ejemplares disponibles para prestar
        }

        try {
            $this->conn->beginTransaction();

            // 1. Insertar el registro de préstamo
            $prestamo = new Prestamo($libro_id, $usuario_id);
            $sqlInsert = "INSERT INTO prestamos (libro_id, usuario_id, fecha_prestamo, estado) 
                          VALUES (:libro_id, :usuario_id, :fecha_prestamo, :estado)";
            $stmtInsert = $this->conn->prepare($sqlInsert);
            $stmtInsert->bindValue(':libro_id', $prestamo->getLibroId(), PDO::PARAM_INT);
            $stmtInsert->bindValue(':usuario_id', $prestamo->getUsuarioId(), PDO::PARAM_INT);
            $stmtInsert->bindValue(':fecha_prestamo', $prestamo->getFechaPrestamo());
            $stmtInsert->bindValue(':estado', $prestamo->getEstado());
            $stmtInsert->execute();

            // 2. Disminuir en 1 la cantidad disponible del libro
            $sqlUpdate = "UPDATE libros SET cantidad = cantidad - 1 WHERE id = :id AND cantidad > 0";
            $stmtUpdate = $this->conn->prepare($sqlUpdate);
            $stmtUpdate->bindValue(':id', $libro_id, PDO::PARAM_INT);
            $stmtUpdate->execute();

            $this->conn->commit();
            return true;

        } catch (PDOException $e) {
            $this->conn->rollBack();
            return false;
        }
    }

    /**
     * Registra la devolución de un préstamo.
     * Operación transaccional: actualiza fecha_devolucion y estado en
     * "prestamos" y aumenta en 1 el campo "cantidad" del libro asociado.
     *
     * @param int $prestamo_id
     * @return bool
     */
    public function devolverLibro($prestamo_id) {
        // Obtenemos el préstamo para conocer el libro asociado
        $sqlBuscar = "SELECT * FROM prestamos WHERE id = :id";
        $stmtBuscar = $this->conn->prepare($sqlBuscar);
        $stmtBuscar->bindValue(':id', $prestamo_id, PDO::PARAM_INT);
        $stmtBuscar->execute();
        $prestamo = $stmtBuscar->fetch(PDO::FETCH_ASSOC);

        if (!$prestamo || $prestamo['estado'] === 'devuelto') {
            return false; // Préstamo inexistente o ya devuelto
        }

        try {
            $this->conn->beginTransaction();

            // 1. Actualizar el préstamo: fecha de devolución y estado
            $sqlUpdatePrestamo = "UPDATE prestamos 
                                   SET fecha_devolucion = :fecha_devolucion, estado = 'devuelto' 
                                   WHERE id = :id";
            $stmtUpdatePrestamo = $this->conn->prepare($sqlUpdatePrestamo);
            $stmtUpdatePrestamo->bindValue(':fecha_devolucion', date('Y-m-d'));
            $stmtUpdatePrestamo->bindValue(':id', $prestamo_id, PDO::PARAM_INT);
            $stmtUpdatePrestamo->execute();

            // 2. Aumentar en 1 la cantidad disponible del libro
            $sqlUpdateLibro = "UPDATE libros SET cantidad = cantidad + 1 WHERE id = :id";
            $stmtUpdateLibro = $this->conn->prepare($sqlUpdateLibro);
            $stmtUpdateLibro->bindValue(':id', $prestamo['libro_id'], PDO::PARAM_INT);
            $stmtUpdateLibro->execute();

            $this->conn->commit();
            return true;

        } catch (PDOException $e) {
            $this->conn->rollBack();
            return false;
        }
    }

    /**
     * Retorna la lista de préstamos activos, incluyendo información
     * del libro y del usuario mediante JOIN.
     * @return array
     */
    public function obtenerPrestamosActivos() {
        $sql = "SELECT p.id, p.fecha_prestamo, p.fecha_devolucion, p.estado,
                       l.id AS libro_id, l.titulo AS libro_titulo,
                       u.id AS usuario_id, u.nombre AS usuario_nombre
                FROM prestamos p
                INNER JOIN libros l ON p.libro_id = l.id
                INNER JOIN usuarios u ON p.usuario_id = u.id
                WHERE p.estado = 'activo'
                ORDER BY p.fecha_prestamo DESC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Retorna el historial completo de préstamos (activos y devueltos),
     * incluyendo información del libro y del usuario.
     * @return array
     */
    public function obtenerTodosLosPrestamos() {
        $sql = "SELECT p.id, p.fecha_prestamo, p.fecha_devolucion, p.estado,
                       l.id AS libro_id, l.titulo AS libro_titulo,
                       u.id AS usuario_id, u.nombre AS usuario_nombre
                FROM prestamos p
                INNER JOIN libros l ON p.libro_id = l.id
                INNER JOIN usuarios u ON p.usuario_id = u.id
                ORDER BY p.fecha_prestamo DESC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
