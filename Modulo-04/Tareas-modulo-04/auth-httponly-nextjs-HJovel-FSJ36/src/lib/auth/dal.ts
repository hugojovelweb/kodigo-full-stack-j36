import "server-only";
import { cache } from "react";
import { getSessionToken, validateSessionToken } from "./session";

/**
 * Capa de acceso a datos (DAL): ÚNICA puerta para saber "quién es el usuario".
 * Cada página/acción protegida la llama; el proxy es la primera barrera, esta
 * es la segunda (defensa en profundidad). `cache` evita consultar la BD más de
 * una vez por petición.
 */
export const getSession = cache(async () => {
  const token = await getSessionToken();
  if (!token) return null;
  return validateSessionToken(token);
});

export const getCurrentUser = cache(async () => (await getSession())?.user ?? null);
