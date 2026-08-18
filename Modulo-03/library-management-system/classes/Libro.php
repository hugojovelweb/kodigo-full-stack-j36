<?php

/**
 * Clase Libro
 * Representa la entidad "Libro" del sistema (modelo / entidad de dominio).
 * Aplica encapsulamiento: todos los atributos son privados y se accede
 * a ellos únicamente mediante getters y setters.
 */
class Libro {
    private $id;
    private $titulo;
    private $autor;
    private $isbn;
    private $cantidad;

    public function __construct($titulo = null, $autor = null, $isbn = null, $cantidad = 1) {
        $this->titulo = $titulo;
        $this->autor = $autor;
        $this->isbn = $isbn;
        $this->cantidad = $cantidad;
    }

    // ---------------- Getters y Setters ----------------

    public function getId() {
        return $this->id;
    }

    public function setId($id) {
        $this->id = $id;
    }

    public function getTitulo() {
        return $this->titulo;
    }

    public function setTitulo($titulo) {
        $this->titulo = $titulo;
    }

    public function getAutor() {
        return $this->autor;
    }

    public function setAutor($autor) {
        $this->autor = $autor;
    }

    public function getIsbn() {
        return $this->isbn;
    }

    public function setIsbn($isbn) {
        $this->isbn = $isbn;
    }

    public function getCantidad() {
        return $this->cantidad;
    }

    public function setCantidad($cantidad) {
        $this->cantidad = $cantidad;
    }
}
