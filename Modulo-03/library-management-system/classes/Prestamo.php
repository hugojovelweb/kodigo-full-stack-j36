<?php

/**
 * Clase Prestamo
 * Representa la entidad "Préstamo" del sistema. Modela la relación
 * N:M "resuelta" entre Libro y Usuario a través de una tabla intermedia.
 */
class Prestamo {
    private $id;
    private $libro_id;
    private $usuario_id;
    private $fecha_prestamo;
    private $fecha_devolucion;
    private $estado;

    public function __construct($libro_id = null, $usuario_id = null) {
        $this->libro_id = $libro_id;
        $this->usuario_id = $usuario_id;
        // Al crear un nuevo préstamo, la fecha de préstamo es la fecha actual
        // y el estado por defecto es "activo".
        $this->fecha_prestamo = date('Y-m-d');
        $this->fecha_devolucion = null;
        $this->estado = 'activo';
    }

    // ---------------- Getters y Setters ----------------

    public function getId() {
        return $this->id;
    }

    public function setId($id) {
        $this->id = $id;
    }

    public function getLibroId() {
        return $this->libro_id;
    }

    public function setLibroId($libro_id) {
        $this->libro_id = $libro_id;
    }

    public function getUsuarioId() {
        return $this->usuario_id;
    }

    public function setUsuarioId($usuario_id) {
        $this->usuario_id = $usuario_id;
    }

    public function getFechaPrestamo() {
        return $this->fecha_prestamo;
    }

    public function setFechaPrestamo($fecha) {
        $this->fecha_prestamo = $fecha;
    }

    public function getFechaDevolucion() {
        return $this->fecha_devolucion;
    }

    public function setFechaDevolucion($fecha) {
        $this->fecha_devolucion = $fecha;
    }

    public function getEstado() {
        return $this->estado;
    }

    public function setEstado($estado) {
        $this->estado = $estado;
    }
}
