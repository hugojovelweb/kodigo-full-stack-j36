import { cache } from "react";
import { makeQueryClient } from "@/lib/query-client";

/**
 * Un QueryClient por petición del servidor (React `cache` lo deduplica dentro
 * del mismo render: generateMetadata y la page comparten el mismo cliente).
 * Nunca se comparte entre usuarios, evitando fugas de datos entre requests.
 */
export const getServerQueryClient = cache(makeQueryClient);
