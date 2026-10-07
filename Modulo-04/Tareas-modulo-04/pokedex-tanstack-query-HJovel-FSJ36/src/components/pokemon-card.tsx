"use client";

import Image from "next/image";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { pokemonDetailOptions } from "@/lib/queries";
import {
  formatId,
  formatName,
  officialArtworkUrl,
} from "@/lib/pokemon-utils";
import type { PokemonListItem } from "@/types/pokemon";

export function PokemonCard({
  pokemon,
  priority = false,
}: {
  pokemon: PokemonListItem;
  priority?: boolean;
}) {
  const queryClient = useQueryClient();

  /**
   * Prefetch en hover (y en foco de teclado, por accesibilidad).
   * prefetchQuery respeta staleTime: si el dato ya está fresco en caché
   * (24 h) no se vuelve a pedir; además deduplica peticiones en vuelo.
   */
  const prefetchDetail = () => {
    void queryClient.prefetchQuery(pokemonDetailOptions(pokemon.name));
  };

  return (
    <Link
      href={`/pokemon/${pokemon.name}`}
      className="card"
      onMouseEnter={prefetchDetail}
      onFocus={prefetchDetail}
    >
      <span className="card__id">{formatId(pokemon.id)}</span>
      <Image
        src={officialArtworkUrl(pokemon.id)}
        alt={`Arte oficial de ${formatName(pokemon.name)}`}
        width={160}
        height={160}
        className="card__image"
        priority={priority}
      />
      <span className="card__name">{formatName(pokemon.name)}</span>
    </Link>
  );
}
