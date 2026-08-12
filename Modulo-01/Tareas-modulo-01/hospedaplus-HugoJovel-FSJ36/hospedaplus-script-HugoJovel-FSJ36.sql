-- =====================================================================
--  HOSPEDA+  |  Plataforma de Gestión de Alojamientos
--  Script de creación de base de datos, estructura y datos de prueba
--  Motor objetivo : MySQL 8.0+ / MariaDB 10.5+
--  Autor          : Hugo Ernesto Jovel Actividad Individual - Modelado ER e Implementación SQL
-- =====================================================================


-- =====================================================================
-- PARTE 2.1  CREACIÓN DE LA BASE DE DATOS
-- =====================================================================
DROP DATABASE IF EXISTS hospedaplus;

CREATE DATABASE hospedaplus
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE hospedaplus;


-- =====================================================================
-- PARTE 2.2  CREACIÓN DE TABLAS Y RESTRICCIONES
-- =====================================================================

-- ---------------------------------------------------------------------
-- Tabla: alojamiento
-- Entidad fuerte. Representa cada propiedad administrada por Hospeda+.
-- ---------------------------------------------------------------------
CREATE TABLE alojamiento (
    id_alojamiento      INT             NOT NULL AUTO_INCREMENT,
    nombre              VARCHAR(120)    NOT NULL,
    tipo                ENUM('hotel','hostal','cabana','apartamento') NOT NULL,
    direccion           VARCHAR(200)    NOT NULL,
    ciudad              VARCHAR(80)     NOT NULL,
    pais                VARCHAR(60)     NOT NULL,
    capacidad_maxima    SMALLINT UNSIGNED NOT NULL,
    precio_noche        DECIMAL(10,2)   NOT NULL,
    wifi                BOOLEAN         NOT NULL DEFAULT FALSE,
    desayuno            BOOLEAN         NOT NULL DEFAULT FALSE,
    estacionamiento     BOOLEAN         NOT NULL DEFAULT FALSE,
    aire_acondicionado  BOOLEAN         NOT NULL DEFAULT FALSE,
    disponible          BOOLEAN         NOT NULL DEFAULT TRUE,   -- TRUE = disponible / FALSE = fuera de servicio
    fecha_creacion       TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_alojamiento          PRIMARY KEY (id_alojamiento),
    CONSTRAINT uq_alojamiento_nombre   UNIQUE (nombre),
    CONSTRAINT ck_alojamiento_capacidad CHECK (capacidad_maxima > 0),
    CONSTRAINT ck_alojamiento_precio    CHECK (precio_noche >= 0)
) ENGINE=InnoDB;

CREATE INDEX ix_alojamiento_ciudad ON alojamiento (ciudad);
CREATE INDEX ix_alojamiento_tipo   ON alojamiento (tipo);


-- ---------------------------------------------------------------------
-- Tabla: cliente
-- Entidad fuerte. Representa a los huéspedes registrados en el sistema.
-- ---------------------------------------------------------------------
CREATE TABLE cliente (
    id_cliente          INT             NOT NULL AUTO_INCREMENT,
    nombre_completo      VARCHAR(120)   NOT NULL,
    correo              VARCHAR(150)    NOT NULL,
    telefono            VARCHAR(20)     NOT NULL,
    pais_origen         VARCHAR(60)     NOT NULL,
    fecha_registro      DATE            NOT NULL DEFAULT (CURRENT_DATE),
    CONSTRAINT pk_cliente           PRIMARY KEY (id_cliente),
    CONSTRAINT uq_cliente_correo    UNIQUE (correo),
    CONSTRAINT ck_cliente_correo    CHECK (correo LIKE '%_@__%.__%')
) ENGINE=InnoDB;

CREATE INDEX ix_cliente_pais ON cliente (pais_origen);


-- ---------------------------------------------------------------------
-- Tabla: reservacion
-- Entidad asociativa (débil respecto al negocio) que resuelve la
-- relación N:M "real" entre cliente y alojamiento, materializándola
-- como dos relaciones 1:N:
--        cliente     (1) ---- (N) reservacion
--        alojamiento (1) ---- (N) reservacion
-- numero_noches se calcula automáticamente con una columna generada.
-- ---------------------------------------------------------------------
CREATE TABLE reservacion (
    id_reservacion      INT             NOT NULL AUTO_INCREMENT,
    id_cliente          INT             NOT NULL,
    id_alojamiento      INT             NOT NULL,
    fecha_entrada        DATE           NOT NULL,
    fecha_salida         DATE           NOT NULL,
    numero_huespedes     SMALLINT UNSIGNED NOT NULL,
    numero_noches        INT GENERATED ALWAYS AS (DATEDIFF(fecha_salida, fecha_entrada)) STORED,
    precio_total         DECIMAL(10,2)  NOT NULL,
    estado               ENUM('confirmada','cancelada','completada') NOT NULL DEFAULT 'confirmada',
    fecha_creacion        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_reservacion      PRIMARY KEY (id_reservacion),
    CONSTRAINT fk_reservacion_cliente
        FOREIGN KEY (id_cliente) REFERENCES cliente (id_cliente)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_reservacion_alojamiento
        FOREIGN KEY (id_alojamiento) REFERENCES alojamiento (id_alojamiento)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT ck_reservacion_fechas    CHECK (fecha_salida > fecha_entrada),
    CONSTRAINT ck_reservacion_huespedes CHECK (numero_huespedes > 0),
    CONSTRAINT ck_reservacion_precio    CHECK (precio_total >= 0)
) ENGINE=InnoDB;

CREATE INDEX ix_reservacion_cliente     ON reservacion (id_cliente);
CREATE INDEX ix_reservacion_alojamiento ON reservacion (id_alojamiento);
CREATE INDEX ix_reservacion_estado      ON reservacion (estado);
CREATE INDEX ix_reservacion_fechas      ON reservacion (fecha_entrada, fecha_salida);


-- ---------------------------------------------------------------------
-- Tabla: pago
-- Entidad débil que depende existencialmente de reservacion.
-- Relación: reservacion (1) ---- (N) pago  (pagos parciales).
-- ---------------------------------------------------------------------
CREATE TABLE pago (
    id_pago              INT            NOT NULL AUTO_INCREMENT,
    id_reservacion       INT             NOT NULL,
    monto_pagado         DECIMAL(10,2)  NOT NULL,
    fecha_pago            DATE          NOT NULL,
    metodo_pago           ENUM('tarjeta','transferencia','efectivo') NOT NULL,
    CONSTRAINT pk_pago PRIMARY KEY (id_pago),
    CONSTRAINT fk_pago_reservacion
        FOREIGN KEY (id_reservacion) REFERENCES reservacion (id_reservacion)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT ck_pago_monto CHECK (monto_pagado > 0)
) ENGINE=InnoDB;

CREATE INDEX ix_pago_reservacion ON pago (id_reservacion);


-- ---------------------------------------------------------------------
-- Vista de apoyo (opcional): saldo pendiente por reservación.
-- No es requerida por el enunciado, pero demuestra el uso conjunto de
-- las cuatro tablas y facilita validar los datos de prueba.
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW v_saldo_reservacion AS
SELECT
    r.id_reservacion,
    c.nombre_completo,
    a.nombre AS alojamiento,
    r.precio_total,
    COALESCE(SUM(p.monto_pagado), 0)                    AS total_pagado,
    r.precio_total - COALESCE(SUM(p.monto_pagado), 0)   AS saldo_pendiente,
    r.estado
FROM reservacion r
JOIN cliente     c ON c.id_cliente     = r.id_cliente
JOIN alojamiento a ON a.id_alojamiento = r.id_alojamiento
LEFT JOIN pago   p ON p.id_reservacion = r.id_reservacion
GROUP BY r.id_reservacion, c.nombre_completo, a.nombre, r.precio_total, r.estado;


-- =====================================================================
-- PARTE 3  INSERCIÓN DE DATOS DE PRUEBA
-- =====================================================================

-- ---------------------------------------------------------------------
-- 3.1  Alojamientos (5, con los 4 tipos solicitados)
-- ---------------------------------------------------------------------
INSERT INTO alojamiento
    (nombre, tipo, direccion, ciudad, pais, capacidad_maxima, precio_noche,
     wifi, desayuno, estacionamiento, aire_acondicionado, disponible)
VALUES
    ('Hotel Vista Volcán',        'hotel',       'Av. Central 123',       'Antigua Guatemala', 'Guatemala',   4, 95.00,  TRUE,  TRUE,  TRUE,  TRUE,  TRUE),
    ('Hostal Mochilero Feliz',    'hostal',      'Calle Bolívar 45',      'San Salvador',       'El Salvador', 6, 18.50,  TRUE,  TRUE,  FALSE, FALSE, TRUE),
    ('Cabañas Bosque Nuboso',     'cabana',      'Km 62 Ruta a Copán',    'Copán Ruinas',       'Honduras',    5, 60.00,  TRUE,  FALSE, TRUE,  FALSE, TRUE),
    ('Apartamento Malecón 202',   'apartamento', 'Malecón Central 202',   'Managua',            'Nicaragua',   3, 45.00,  TRUE,  FALSE, TRUE,  TRUE,  TRUE),
    ('Hotel Playa Dorada',        'hotel',       'Blvd. Costanera 8',     'Puntarenas',         'Costa Rica',  2, 120.00, TRUE,  TRUE,  TRUE,  TRUE,  FALSE);  -- fuera de servicio


-- ---------------------------------------------------------------------
-- 3.2  Clientes (5, de distintos países)
-- ---------------------------------------------------------------------
INSERT INTO cliente
    (nombre_completo, correo, telefono, pais_origen, fecha_registro)
VALUES
    ('María José Hernández',  'mariajose.hernandez@correo.com', '+503-7011-2233', 'El Salvador',  '2025-01-15'),
    ('Carlos Andrés Pérez',   'carlos.perez@correo.com',        '+502-5522-1144', 'Guatemala',     '2025-02-03'),
    ('Ana Lucía Ramírez',     'ana.ramirez@correo.com',         '+504-9988-7766', 'Honduras',      '2025-02-20'),
    ('John Smith',            'john.smith@correo.com',          '+1-305-555-0199', 'Estados Unidos','2025-03-10'),
    ('Sofía Martínez',        'sofia.martinez@correo.com',      '+506-8899-4433', 'Costa Rica',    '2025-04-05');


-- ---------------------------------------------------------------------
-- 3.3  Reservaciones (8, con distintos estados)
--      Nota: numero_noches se calcula solo (columna GENERATED)
-- ---------------------------------------------------------------------
INSERT INTO reservacion
    (id_cliente, id_alojamiento, fecha_entrada, fecha_salida, numero_huespedes, precio_total, estado)
VALUES
    (1, 1, '2025-06-10', '2025-06-14', 2, 380.00,  'completada'),   -- 4 noches x $95
    (2, 2, '2025-06-15', '2025-06-18', 1, 55.50,   'completada'),   -- 3 noches x $18.50
    (3, 3, '2025-07-01', '2025-07-05', 4, 216.00,  'confirmada'),   -- 4 noches x $60 con 10% descuento
    (4, 4, '2025-07-10', '2025-07-12', 2, 90.00,   'cancelada'),    -- 2 noches x $45, cliente canceló
    (5, 1, '2025-08-01', '2025-08-03', 3, 190.00,  'confirmada'),   -- 2 noches x $95
    (1, 3, '2025-08-15', '2025-08-20', 5, 270.00,  'confirmada'),   -- 5 noches x $60, 10% descuento
    (2, 4, '2025-09-05', '2025-09-07', 2, 90.00,   'completada'),   -- 2 noches x $45
    (3, 2, '2025-09-20', '2025-09-25', 6, 92.50,   'confirmada');   -- 5 noches x $18.50


-- ---------------------------------------------------------------------
-- 3.4  Pagos (10, distribuidos entre reservaciones; incluye pagos
--      parciales para demostrar la relación 1:N reservacion -> pago)
-- ---------------------------------------------------------------------
INSERT INTO pago
    (id_reservacion, monto_pagado, fecha_pago, metodo_pago)
VALUES
    (1, 380.00, '2025-06-09', 'tarjeta'),                 -- reservación 1 pagada en su totalidad
    (2,  55.50, '2025-06-14', 'efectivo'),                -- reservación 2 pagada en su totalidad
    (3, 100.00, '2025-06-25', 'transferencia'),           -- reservación 3: pago parcial 1
    (3, 116.00, '2025-06-30', 'tarjeta'),                 -- reservación 3: pago parcial 2 (completa el saldo)
    (5, 100.00, '2025-07-28', 'tarjeta'),                 -- reservación 5: pago parcial 1
    (5,  90.00, '2025-08-01', 'efectivo'),                -- reservación 5: pago parcial 2
    (6, 150.00, '2025-08-10', 'transferencia'),           -- reservación 6: pago parcial 1
    (6, 120.00, '2025-08-14', 'tarjeta'),                 -- reservación 6: pago parcial 2 (completa el saldo)
    (7,  90.00, '2025-09-04', 'efectivo'),                -- reservación 7 pagada en su totalidad
    (8,  50.00, '2025-09-18', 'transferencia');           -- reservación 8: pago parcial (reservación aún no completada)


-- =====================================================================
-- CONSULTAS DE VERIFICACIÓN (opcionales, para validar la carga de datos)
-- =====================================================================
-- SELECT * FROM alojamiento;
-- SELECT * FROM cliente;
-- SELECT id_reservacion, id_cliente, id_alojamiento, fecha_entrada, fecha_salida,
--        numero_noches, precio_total, estado
-- FROM reservacion;
-- SELECT * FROM pago;
-- SELECT * FROM v_saldo_reservacion;
