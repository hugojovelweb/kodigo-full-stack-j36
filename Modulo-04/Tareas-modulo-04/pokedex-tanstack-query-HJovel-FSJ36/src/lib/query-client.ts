import {
  QueryClient,
  defaultShouldDehydrateQuery,
  isServer,
} from "@tanstack/react-query";
import { GC_TIME, STALE_TIME } from "@/lib/constants";

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 24 h: evita refetch inmediato tras la hidratación y en navegación.
        staleTime: STALE_TIME,
        // 7 días en memoria tras quedar sin observadores (debe ser >= staleTime).
        gcTime: GC_TIME,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      dehydrate: {
        // Incluye también queries "pending" para poder hacer streaming de
        // promesas del servidor al cliente sin bloquear el render.
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === "pending",
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/**
 * En el navegador devuelve un singleton (la caché sobrevive a re-renders y a
 * suspensiones de React). En el servidor este helper NO debe usarse: ver
 * `get-server-query-client.ts`, que crea un cliente por petición.
 */
export function getBrowserQueryClient(): QueryClient {
  if (isServer) return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}
