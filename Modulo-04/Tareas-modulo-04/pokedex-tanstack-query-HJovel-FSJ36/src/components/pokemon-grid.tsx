"use client";

import { useQuery } from "@tanstack/react-query";
import { pokemonPageOptions } from "@/lib/queries";
import { PokemonCard } from "@/components/pokemon-card";

/**
 * Lee la lista desde la caché de TanStack Query. Como la página (RSC) hizo
 * prefetch + dehydrate, `data` ya existe en el primer render: el HTML llega
 * con las tarjetas pintadas y no hay estado de carga ni refetch (staleTime 24 h).
 */
export function PokemonGrid({ page }: { page: number }) {
  const { data, isPending, isError, error, refetch, isFetching } = useQuery(
    pokemonPageOptions(page),
  );

  if (isPending) {
    return <p role="status">Cargando Pokémon…</p>;
  }

  if (isError) {
    return (
      <div role="alert" className="state state--error">
        <p>No se pudo cargar la lista: {error.message}</p>
        <button type="button" onClick={() => void refetch()} disabled={isFetching}>
          {isFetching ? "Reintentando…" : "Reintentar"}
        </button>
      </div>
    );
  }

  return (
    <ul className="grid">
      {data.results.map((pokemon, index) => (
        <li key={pokemon.id}>
          <PokemonCard pokemon={pokemon} priority={index < 6} />
        </li>
      ))}
    </ul>
  );
}
