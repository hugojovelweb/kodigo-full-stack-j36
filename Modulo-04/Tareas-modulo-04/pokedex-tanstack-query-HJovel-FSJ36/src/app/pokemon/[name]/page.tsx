import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getServerQueryClient } from "@/lib/get-server-query-client";
import { PokeApiError } from "@/lib/pokeapi";
import { pokemonDetailOptions } from "@/lib/queries";
import { formatName } from "@/lib/pokemon-utils";
import { PokemonDetailView } from "@/components/pokemon-detail";
import Link from "next/link";

interface DetailProps {
  params: Promise<{ name: string }>;
}

async function loadPokemon(rawName: string) {
  const name = decodeURIComponent(rawName).toLowerCase();
  const queryClient = getServerQueryClient();

  try {
    // Si el usuario ya hizo hover, el dato vive en la caché del navegador y
    // la UI es instantánea; en una entrada directa se obtiene aquí en el
    // servidor y se hidrata al cliente.
    const data = await queryClient.fetchQuery(pokemonDetailOptions(name));
    return { name, queryClient, data };
  } catch (error) {
    if (error instanceof PokeApiError && error.status === 404) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: DetailProps): Promise<Metadata> {
  const { name } = await params;
  const { data } = await loadPokemon(name);
  return {
    title: formatName(data.name),
    description: `Estadísticas, tipos, habilidades y evoluciones de ${formatName(data.name)}.`,
  };
}

export default async function PokemonPage({ params }: DetailProps) {
  const { name: rawName } = await params;
  const { name, queryClient } = await loadPokemon(rawName);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Link href="/" className="back-link">
        ← Volver a la lista
      </Link>
      <PokemonDetailView name={name} />
    </HydrationBoundary>
  );
}
