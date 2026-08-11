-- ============================================================================
--  SISTEMA DE GESTION - RESTAURANTE "SAZON CENTRAL"
--  Script de creacion de base de datos (DDL) derivado del Diagrama ER
--  Motor objetivo: MySQL 8.0+ / MariaDB 10.5+  (compatible con PostgreSQL
--  con mínimos ajustes: AUTO_INCREMENT -> SERIAL, ENUM -> CHECK, etc.)
-- ============================================================================

DROP DATABASE IF EXISTS sazon_central;
CREATE DATABASE sazon_central CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sazon_central;

-- ----------------------------------------------------------------------------
-- 1. CLIENTE
-- ----------------------------------------------------------------------------
CREATE TABLE cliente (
    cliente_id      INT AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(120) NOT NULL,
    telefono        VARCHAR(20),
    email           VARCHAR(120),
    CONSTRAINT uq_cliente_email UNIQUE (email)
);

-- ----------------------------------------------------------------------------
-- 2. MESA
-- ----------------------------------------------------------------------------
CREATE TABLE mesa (
    mesa_id         INT AUTO_INCREMENT PRIMARY KEY,
    numero_mesa     INT NOT NULL,
    capacidad       INT NOT NULL,
    estado          ENUM('disponible','ocupada','reservada','fuera_de_servicio')
                    NOT NULL DEFAULT 'disponible',
    CONSTRAINT uq_mesa_numero UNIQUE (numero_mesa)
);

-- ----------------------------------------------------------------------------
-- 3. EMPLEADO
-- ----------------------------------------------------------------------------
CREATE TABLE empleado (
    empleado_id     INT AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(120) NOT NULL,
    rol             ENUM('mesero','cocinero','cajero','administrador') NOT NULL
);

-- ----------------------------------------------------------------------------
-- 4. PLATO  (el precio vigente vive aquí; el precio histórico se congela
--    en detalle_pedido.precio_unitario para no alterar pedidos pasados)
-- ----------------------------------------------------------------------------
CREATE TABLE plato (
    plato_id        INT AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(120) NOT NULL,
    categoria       VARCHAR(60)  NOT NULL,
    precio_actual   DECIMAL(10,2) NOT NULL CHECK (precio_actual >= 0),
    disponibilidad  BOOLEAN NOT NULL DEFAULT TRUE
);

-- ----------------------------------------------------------------------------
-- 5. RESERVA  (requiere obligatoriamente cliente y mesa)
-- ----------------------------------------------------------------------------
CREATE TABLE reserva (
    reserva_id          INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id          INT NOT NULL,
    mesa_id             INT NOT NULL,
    fecha               DATE NOT NULL,
    hora                TIME NOT NULL,
    cantidad_personas   INT NOT NULL CHECK (cantidad_personas > 0),
    estado              ENUM('confirmada','cancelada','completada')
                        NOT NULL DEFAULT 'confirmada',
    CONSTRAINT fk_reserva_cliente FOREIGN KEY (cliente_id)
        REFERENCES cliente(cliente_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_reserva_mesa FOREIGN KEY (mesa_id)
        REFERENCES mesa(mesa_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ----------------------------------------------------------------------------
-- 6. PEDIDO
--    cliente_id, mesa_id y empleado_id son OPCIONALES a nivel de modelo
--    (permiten NULL), porque:
--      - cliente_id: la asociación con cliente es opcional (requerimiento)
--      - mesa_id:    obligatoria solo si tipo_atencion = 'salon'
--      - empleado_id: obligatorio solo si tipo_atencion = 'salon'
--    Estas reglas condicionales NO son expresables como restricción
--    estructural simple del ER; se aplican con un CHECK o un TRIGGER.
-- ----------------------------------------------------------------------------
CREATE TABLE pedido (
    pedido_id       INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id      INT NULL,
    mesa_id         INT NULL,
    empleado_id     INT NULL,
    fecha_hora      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tipo_atencion   ENUM('salon','para_llevar','delivery') NOT NULL,
    estado          ENUM('en_preparacion','listo','entregado','pagado','cancelado')
                    NOT NULL DEFAULT 'en_preparacion',
    CONSTRAINT fk_pedido_cliente FOREIGN KEY (cliente_id)
        REFERENCES cliente(cliente_id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_pedido_mesa FOREIGN KEY (mesa_id)
        REFERENCES mesa(mesa_id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_pedido_empleado FOREIGN KEY (empleado_id)
        REFERENCES empleado(empleado_id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    -- Regla de negocio: pedidos de salón exigen mesa y empleado asignados
    CONSTRAINT chk_pedido_salon CHECK (
        tipo_atencion <> 'salon' OR (mesa_id IS NOT NULL AND empleado_id IS NOT NULL)
    )
);

-- ----------------------------------------------------------------------------
-- 7. DETALLE_PEDIDO  (entidad asociativa: resuelve la relación N:M
--    entre PEDIDO y PLATO; precio_unitario congela el precio del plato
--    al momento del pedido)
-- ----------------------------------------------------------------------------
CREATE TABLE detalle_pedido (
    detalle_id      INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id       INT NOT NULL,
    plato_id        INT NOT NULL,
    cantidad        INT NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2) NOT NULL CHECK (precio_unitario >= 0),
    CONSTRAINT fk_detalle_pedido FOREIGN KEY (pedido_id)
        REFERENCES pedido(pedido_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_detalle_plato FOREIGN KEY (plato_id)
        REFERENCES plato(plato_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ----------------------------------------------------------------------------
-- 8. PAGO
-- ----------------------------------------------------------------------------
CREATE TABLE pago (
    pago_id         INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id       INT NOT NULL,
    metodo_pago     ENUM('efectivo','tarjeta','transferencia','billetera_digital')
                    NOT NULL,
    fecha_pago      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    monto           DECIMAL(10,2) NOT NULL CHECK (monto > 0),
    CONSTRAINT fk_pago_pedido FOREIGN KEY (pedido_id)
        REFERENCES pedido(pedido_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ----------------------------------------------------------------------------
-- INDICES DE APOYO PARA CONSULTAS ADMINISTRATIVAS
-- (reportes de ventas, consumo de platos, estado de pedidos)
-- ----------------------------------------------------------------------------
CREATE INDEX idx_pedido_fecha       ON pedido(fecha_hora);
CREATE INDEX idx_pedido_estado      ON pedido(estado);
CREATE INDEX idx_detalle_plato      ON detalle_pedido(plato_id);
CREATE INDEX idx_reserva_fecha_mesa ON reserva(fecha, mesa_id);
CREATE INDEX idx_pago_pedido        ON pago(pedido_id);

-- ----------------------------------------------------------------------------
-- TRIGGER: evita cerrar (marcar como 'pagado') un pedido sin al menos
-- un pago registrado que cubra el total. Se deja como ejemplo de cómo
-- forzar en el motor una regla de negocio no estructural.
-- ----------------------------------------------------------------------------
DELIMITER $$
CREATE TRIGGER trg_pedido_cierre_requiere_pago
BEFORE UPDATE ON pedido
FOR EACH ROW
BEGIN
    DECLARE total_pagado DECIMAL(10,2);
    IF NEW.estado = 'pagado' AND OLD.estado <> 'pagado' THEN
        SELECT IFNULL(SUM(monto), 0) INTO total_pagado
        FROM pago WHERE pedido_id = NEW.pedido_id;
        IF total_pagado <= 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'No se puede cerrar un pedido sin al menos un pago registrado';
        END IF;
    END IF;
END$$
DELIMITER ;

-- ----------------------------------------------------------------------------
-- VISTAS DE APOYO PARA REPORTES ADMINISTRATIVOS
-- ----------------------------------------------------------------------------
CREATE VIEW v_ventas_por_pedido AS
SELECT p.pedido_id,
       p.fecha_hora,
       p.tipo_atencion,
       p.estado,
       SUM(dp.cantidad * dp.precio_unitario) AS total_pedido,
       IFNULL((SELECT SUM(pg.monto) FROM pago pg WHERE pg.pedido_id = p.pedido_id), 0) AS total_pagado
FROM pedido p
JOIN detalle_pedido dp ON dp.pedido_id = p.pedido_id
GROUP BY p.pedido_id, p.fecha_hora, p.tipo_atencion, p.estado;

CREATE VIEW v_consumo_por_plato AS
SELECT pl.plato_id, pl.nombre, pl.categoria,
       SUM(dp.cantidad) AS unidades_vendidas,
       SUM(dp.cantidad * dp.precio_unitario) AS ingresos_generados
FROM plato pl
JOIN detalle_pedido dp ON dp.plato_id = pl.plato_id
GROUP BY pl.plato_id, pl.nombre, pl.categoria;
