// API de ReservaYa: el "servicio" que en AWS correría como tareas de ECS/Fargate.
const express = require("express");
const os = require("os");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Si la base de datos se cae, las conexiones inactivas emiten un error.
// Sin este manejador, el proceso de Node se cerraría y todas las réplicas caerían a la vez.
pool.on("error", (err) => {
  console.error(`[${process.env.INSTANCIA || os.hostname()}] Error en el pool de PostgreSQL:`, err.message);
});
const INSTANCIA = process.env.INSTANCIA || os.hostname(); // en Docker, el ID corto del contenedor
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

// Raíz: responde sin tocar la base de datos (útil como health check básico)
app.get("/", (req, res) => {
  res.json({ servicio: "reservaya-api", instancia: INSTANCIA });
});

// Health check completo: el balanceador lo usa para saber si esta tarea está sana
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, instancia: INSTANCIA });
  } catch {
    res.status(503).json({ ok: false, instancia: INSTANCIA, error: "sin conexión a la base de datos" });
  }
});

app.get("/reservas", async (req, res) => {
  const { rows } = await pool.query(
    "SELECT id, cliente, personas, to_char(fecha, 'YYYY-MM-DD') AS fecha FROM reservas ORDER BY id"
  );
  res.json({ instancia: INSTANCIA, total: rows.length, reservas: rows });
});

app.post("/reservas", async (req, res) => {
  const { cliente, personas, fecha } = req.body || {};
  if (!cliente || !personas || !fecha) {
    return res.status(400).json({ error: "cliente, personas y fecha son requeridos" });
  }
  const { rows } = await pool.query(
    "INSERT INTO reservas (cliente, personas, fecha) VALUES ($1, $2, $3) RETURNING id, cliente, personas, to_char(fecha, 'YYYY-MM-DD') AS fecha",
    [cliente, personas, fecha]
  );
  res.status(201).json({ instancia: INSTANCIA, reserva: rows[0] });
});

// Simula una falla: el proceso termina con error y el contenedor se cae.
// Sirve para ver cómo el "servicio" lo revive y cómo el balanceador lo saca de rotación.
app.post("/crash", (req, res) => {
  console.log(`[${INSTANCIA}] Simulando una falla: el proceso se cae en 1 segundo`);
  res.json({ instancia: INSTANCIA, mensaje: "Me caigo en 1 segundo" });
  setTimeout(() => process.exit(1), 1000);
});

// Errores no controlados (por ejemplo, la base de datos caída)
app.use((err, req, res, next) => {
  console.error(`[${INSTANCIA}]`, err.message);
  res.status(500).json({ instancia: INSTANCIA, error: "error interno" });
});

app.listen(PORT, HOST, () => {
  console.log(`[${INSTANCIA}] reservaya-api escuchando en el puerto ${PORT}`);
});
