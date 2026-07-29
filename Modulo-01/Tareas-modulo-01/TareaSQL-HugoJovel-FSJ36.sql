-- ============================================================================
-- PRACTICA SQL - RapidNow
-- Usa la base "rapidnow" con las 20 filas insertadas por tabla.
-- ==========================HUGO JOVEL FSJ36==================================
-- ============================================================================

USE `rapidnow`;


-- ============================================================================
-- NIVEL BASICO
-- ============================================================================

-- 1. Listado simple con filtro
-- Muestra item_id, nombre y precio de todos los items cuyo precio sea mayor a
-- $8, ordenados de mayor a menor precio.

SELECT  item_id, nombre, precio FROM ITEMS
WHERE precio > 8
ORDER BY precio DESC;



-- 2. Filtro por texto y rango de fechas
-- Obten cliente_id, nombre y fecha_registro de los clientes registrados entre
-- el 2026-01-01 y el 2026-06-30 que vivan en 'San Salvador'.

SELECT cliente_id, nombre, fecha_registro
FROM CLIENTES
WHERE fecha_registro BETWEEN '2026-01-01 00:00:00' AND '2026-06-30 23:59:59'
  AND direccion LIKE '%San Salvador%'
ORDER BY fecha_registro;



-- ============================================================================
-- NIVEL INTERMEDIO (JOINs)
-- ============================================================================

-- 3. Catalogo con categoria
-- Muestra el nombre del item, su precio y la categoria del restaurante al que
-- pertenece, para los primeros 10 items con mayor precio.

SELECT
    i.nombre AS item,
    i.precio,
    r.categoria
FROM ITEMS i
INNER JOIN MENU m ON i.menu_id = m.menu_id
INNER JOIN RESTAURANTES r ON m.restaurante_id = r.restaurante_id
ORDER BY i.precio DESC
LIMIT 10;



-- 4. Ordenes con datos del cliente
-- Lista las 10 ordenes mas recientes mostrando orden_id, fecha_pedido, estado,
-- valor_total y el nombre completo del cliente que la realizo.

SELECT
    o.orden_id,
    o.fecha_pedido,
    o.estado,
    o.valor_total,
    c.nombre AS nombre_cliente
FROM ORDENES o
INNER JOIN CLIENTES c ON o.cliente_id = c.cliente_id
ORDER BY o.fecha_pedido DESC
LIMIT 10;



-- 5. Detalle completo de una orden
-- Para la orden con orden_id = 1, muestra cada item comprado (nombre), la
-- cantidad, el precio unitario y el subtotal de cada linea.

SELECT i.nombre as item, 
	d.cantidad, 
    d.precio_unitario,
    ROUND((d.cantidad * d.precio_unitario),2) AS subtotal
FROM detalle_orden d
JOIN items i ON d.item_id = i.item_id
where d.orden_id = 1;


-- ============================================================================
-- NIVEL INTERMEDIO-ALTO (agregaciones)
-- ============================================================================

-- 6. Ingresos por categoria
-- Calcula el ingreso total (SUM de cantidad * precio_unitario) generado por
-- cada categoria de restaurante, ordenado de mayor a menor ingreso.

SELECT 
    r.categoria,
    SUM(d.cantidad * d.precio_unitario) AS ingreso_total
FROM DETALLE_ORDEN d
INNER JOIN RESTAURANTES r ON d.restaurante_id = r.restaurante_id
GROUP BY r.categoria
ORDER BY ingreso_total DESC;



-- 7. Clientes mas valiosos (Top N)
-- Obten los 5 clientes que mas han gastado en total (SUM de valor_total de sus
-- ordenes), mostrando nombre, numero de ordenes y monto total gastado.

SELECT
 c.nombre,
    COUNT(o.orden_id) AS numero_ordenes,
    SUM(o.valor_total) AS monto_total_gastado
FROM ORDENES o
INNER JOIN CLIENTES c ON o.cliente_id = c.cliente_id
GROUP BY c.cliente_id, c.nombre
ORDER BY monto_total_gastado DESC
LIMIT 5;


-- 8. Restaurantes con mejor precio promedio (adaptado; rapidnow no tiene reviews)
-- Lista los restaurantes con mayor precio promedio en su menu, que tengan al
-- menos 3 items registrados, mostrando nombre, promedio (2 decimales) y total
-- de items.

SELECT
    r.nombre AS restaurante,
    ROUND(AVG(i.precio), 2) AS precio_promedio,
    COUNT(i.item_id) AS total_items
FROM RESTAURANTES r
INNER JOIN MENU m ON r.restaurante_id = m.restaurante_id
INNER JOIN ITEMS i ON m.menu_id = i.menu_id
GROUP BY r.restaurante_id, r.nombre
HAVING COUNT(i.item_id) >= 3
ORDER BY precio_promedio DESC;



-- ============================================================================
-- NIVEL AVANZADO (subconsultas y condiciones complejas)
-- ============================================================================

-- 9. Items nunca vendidos
-- Encuentra todos los items que no aparecen en ningun DETALLE_ORDEN, mostrando
-- item_id, nombre y menu_id. Usa LEFT JOIN ... IS NULL.

SELECT
    i.item_id,
    i.nombre,
    i.menu_id
FROM ITEMS i
LEFT JOIN DETALLE_ORDEN d ON i.item_id = d.item_id
WHERE d.detalle_orden_id IS NULL;

-- 10. Clientes sin ordenes entregadas (adaptado; rapidnow no tiene tabla de pagos)
-- Lista los clientes que tienen al menos una orden, pero ninguna de ellas esta
-- en estado 'entregado'. Muestra cliente_id, nombre y cantidad de ordenes.

SELECT
    c.cliente_id,
    c.nombre,
    COUNT(o.orden_id) AS cantidad_ordenes
FROM CLIENTES c
INNER JOIN ORDENES o ON c.cliente_id = o.cliente_id
GROUP BY c.cliente_id, c.nombre
HAVING SUM(CASE WHEN o.estado = 'entregado' THEN 1 ELSE 0 END) = 0;


-- ============================================================================
-- NIVEL EXPERTO (window functions / CTE)
-- ============================================================================

-- 11. Ranking de items por categoria
-- Usando RANK(), obten el item mas vendido (por cantidad total) dentro de cada
-- categoria de restaurante. Una sola fila por categoria: categoria, nombre del
-- item, unidades vendidas.

WITH ventas_item AS (
    SELECT
        r.categoria,
        i.nombre AS item,
        SUM(d.cantidad) AS unidades_vendidas
    FROM DETALLE_ORDEN d
    INNER JOIN ITEMS i ON d.item_id = i.item_id
    INNER JOIN RESTAURANTES r ON d.restaurante_id = r.restaurante_id
    GROUP BY r.categoria, i.item_id, i.nombre
),
ranking_items AS (
    SELECT
        categoria,
        item,
        unidades_vendidas,
        RANK() OVER (PARTITION BY categoria ORDER BY unidades_vendidas DESC) AS posicion
    FROM ventas_item
)
SELECT
    categoria,
    item,
    unidades_vendidas
FROM ranking_items
WHERE posicion = 1;




-- 12. Comparativa mensual de ventas (CTE + funciones de fecha)
-- Usando un CTE, calcula el total de ventas (SUM de valor_total de ORDENES)
-- agrupado por año y mes. Luego calcula la diferencia respecto al mes anterior
-- usando LAG(). Ordena cronologicamente.

WITH ventas_mensuales AS (
    SELECT
        YEAR(fecha_pedido) AS anio,
        MONTH(fecha_pedido) AS mes,
        SUM(valor_total) AS total_ventas
    FROM ORDENES
    GROUP BY YEAR(fecha_pedido), MONTH(fecha_pedido)
)
SELECT
    anio,
    mes,
    total_ventas,
    LAG(total_ventas) OVER (ORDER BY anio, mes) AS ventas_mes_anterior,
    total_ventas - LAG(total_ventas) OVER (ORDER BY anio, mes) AS diferencia
FROM ventas_mensuales
ORDER BY anio, mes;

