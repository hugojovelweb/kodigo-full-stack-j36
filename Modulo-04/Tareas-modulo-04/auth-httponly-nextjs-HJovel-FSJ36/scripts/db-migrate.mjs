// Aplica db/schema.sql a Neon.  Uso:  npm run db:migrate
// (carga .env.local con la bandera --env-file de Node >= 20.6)
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("✗ Falta DATABASE_URL. Completa .env.local primero.");
  process.exit(1);
}

const sql = neon(url);
const file = new URL("../db/schema.sql", import.meta.url);

// Quita comentarios "--" y separa por ";" al final de línea (el esquema no usa funciones).
const statements = readFileSync(file, "utf8")
  .split("\n")
  .filter((line) => !line.trim().startsWith("--"))
  .join("\n")
  .split(/;\s*\n/)
  .map((s) => s.trim())
  .filter(Boolean);

for (const statement of statements) {
  await sql.query(statement);
  console.log("✓", statement.split("\n")[0]?.slice(0, 70));
}
console.log(`\nListo: ${statements.length} sentencias aplicadas.`);
