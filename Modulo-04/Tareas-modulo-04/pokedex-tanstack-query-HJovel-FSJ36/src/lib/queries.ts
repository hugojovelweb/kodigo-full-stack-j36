import { queryOptions } from "@tanstack/react-query";
import { GC_TIME, STALE_TIME } from "@/lib/constants";
import { getPokemonDetail, getPokemonPage } from "@/lib/pokeapi";

/**
 * Fábricas de `queryOptions` COMPARTIDAS entre servidor y cliente.
 * Usar exactamente la misma queryKey en prefetch (servidor / hover) y en
 * useQuery (cliente) es lo que permite que los datos estén "instantáneos".
 */
export const pokemonKeys = {
  all: ["pokemon"] as const,
  lists: () => [...pokemonKeys.all, "list"] as const,
  list: (page: number) => [...pokemonKeys.lists(), page] as const,
  details: () => [...pokemonKeys.all, "detail"] as const,
  detail: (name: string) => [...pokemonKeys.details(), name] as const,
};

export const pokemonPageOptions = (page: number) =>
  queryOptions({
    queryKey: pokemonKeys.list(page),
    queryFn: () => getPokemonPage(page),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });

export const pokemonDetailOptions = (name: string) =>
  queryOptions({
    queryKey: pokemonKeys.detail(name),
    queryFn: () => getPokemonDetail(name),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
