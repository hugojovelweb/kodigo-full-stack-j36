import "server-only";
import { neon } from "@neondatabase/serverless";
import { env } from "@/lib/env";

type Sql = ReturnType<typeof neon>;
let client: Sql | undefined;

/**
 * Cliente de Neon (driver serverless sobre HTTP). Solo existe en el servidor
 * ("server-only" rompe el build si alguien lo importa desde un Client Component).
 * Las consultas usan plantillas etiquetadas: los valores viajan como PARÁMETROS
 * ($1, $2…) y nunca se concatenan al SQL, lo que previene inyección SQL.
 */
export function sql(): Sql {
  return (client ??= neon(env.databaseUrl));
}
