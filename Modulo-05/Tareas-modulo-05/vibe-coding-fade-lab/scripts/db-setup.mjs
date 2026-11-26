// Crea las tablas y carga los datos de ejemplo en Neon.
// Uso:  npm run db:setup      (lee DATABASE_URL de .env.local)
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Falta DATABASE_URL. Copia .env.example a .env.local y pega tu cadena de conexion de Neon.");
  process.exit(1);
}
const sql = neon(url);

function sentencias(archivo) {
  const texto = readFileSync(new URL(`../db/${archivo}`, import.meta.url), "utf8")
    .split("\n")
    .filter((l) => !l.trim().startsWith("--"))
    .join("\n");
  return texto.split(/;\s*(?:\n|$)/).map((s) => s.trim()).filter(Boolean);
}

for (const archivo of ["schema.sql", "seed.sql"]) {
  const lista = sentencias(archivo);
  for (const [i, s] of lista.entries()) {
    try {
      await sql.query(s);
    } catch (e) {
      console.error(`Error en ${archivo}, sentencia ${i + 1}:\n${s.slice(0, 160)}...\n`, e.message);
      process.exit(1);
    }
  }
  console.log(`OK  ${archivo} (${lista.length} sentencias)`);
}
const [{ n }] = await sql.query("SELECT count(*)::int AS n FROM servicios");
console.log(`Listo. Servicios cargados: ${n}`);
