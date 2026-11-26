import { neon } from "@neondatabase/serverless";

type Cliente = ReturnType<typeof neon>;
let cliente: Cliente | null = null;

/** Unico punto de acceso a la base de datos (Neon Postgres). Siempre con parametros ($1, $2...) -> sin SQL injection. */
export async function query<T = Record<string, unknown>>(texto: string, params: unknown[] = []): Promise<T[]> {
  if (!cliente) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("Falta DATABASE_URL. Copia .env.example a .env.local y pega tu cadena de conexion de Neon.");
    }
    cliente = neon(url);
  }
  const filas = await cliente.query(texto, params);
  return filas as unknown as T[];
}
