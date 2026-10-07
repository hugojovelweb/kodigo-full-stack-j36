/** URL base de la PokéAPI (configurable por variable de entorno). */
export const POKEAPI_URL =
  process.env.NEXT_PUBLIC_POKEAPI_URL ?? "https://pokeapi.co/api/v2";

/** Cantidad de Pokémon por página (el requisito pide al menos 50). */
export const PAGE_SIZE = 60;

/**
 * Estrategia de caché de TanStack Query.
 *
 * - STALE_TIME: durante 24 h los datos se consideran "frescos": no hay
 *   refetch en montaje, foco de ventana ni reconexión. Los datos de la
 *   PokéAPI son prácticamente estáticos, por lo que 24 h es seguro.
 * - GC_TIME: tiempo que un query sin observadores permanece en memoria
 *   antes de ser recolectado. Se fija en 7 días (> staleTime) para que
 *   un dato prefetched o ya visitado siga disponible durante toda la sesión.
 */
export const STALE_TIME = 24 * 60 * 60 * 1000; // 24 horas
export const GC_TIME = 7 * 24 * 60 * 60 * 1000; // 7 días

/** Revalidación del Data Cache de Next.js para fetch en servidor (segundos). */
export const NEXT_REVALIDATE_SECONDS = 24 * 60 * 60;
