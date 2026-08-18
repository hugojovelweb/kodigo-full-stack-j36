<?php

/**
 * Clase Database
 * Responsable de gestionar la conexión a la base de datos MySQL
 * utilizando PDO (PHP Data Objects).
 *
 * Aplica el patrón de encapsulamiento: las credenciales son privadas
 * y solo se exponen a través del método getConnection().
 */
class Database {
    private $host = 'localhost';
    private $port = '3307'; // XAMPP en este equipo corre MySQL en el puerto 3307, no el 3306 por defecto
    private $db_name = 'biblioteca';
    private $username = 'root';
    private $password = '';
    public $conn;

    /**
     * Método para obtener la conexión a la base de datos.
     * Crea una instancia PDO con el DSN (Data Source Name) correspondiente
     * y configura el modo de manejo de errores para lanzar excepciones.
     *
     * @return PDO|null Conexión activa a la base de datos o null si falla.
     */
    public function getConnection() {
        $this->conn = null;

        try {
            // DSN: driver, host, nombre de la base de datos y charset UTF-8
            $dsn = "mysql:host=" . $this->host . ";port=" . $this->port . ";dbname=" . $this->db_name . ";charset=utf8mb4";

            $this->conn = new PDO($dsn, $this->username, $this->password);

            // Configuraciones recomendadas de PDO
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            $this->conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

        } catch (PDOException $exception) {
            // En un entorno de producción esto se registraría en un log,
            // no se mostraría directamente al usuario.
            echo "Error de conexión: " . $exception->getMessage();
        }

        return $this->conn;
    }
}
