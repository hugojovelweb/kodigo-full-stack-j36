import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getServerQueryClient } from "@/lib/get-server-query-client";
import { pokemonPageOptions } from "@/lib/queries";
import { PokemonGrid } from "@/components/pokemon-grid";
import { Pagination } from "@/components/pagination";

interface HomeProps {
  // En Next.js 16 searchParams es una Promise.
  searchParams: Promise<{ page?: string }>;
}

function parsePage(raw: string | undefined): number {
  const parsed = Number.parseInt(raw ?? "1", 10);
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
}

export async function generateMetadata({
  searchParams,
}: HomeProps): Promise<Metadata> {
  const page = parsePage((await searchParams).page);
  return { title: page === 1 ? "Inicio" : `Página ${page}` };
}

/**
 * React Server Component: obtiene la lista en el servidor, la guarda en el
 * QueryClient de la petición y la "deshidrata" hacia el cliente.
 */
export default async function HomePage({ searchParams }: HomeProps) {
  const page = parsePage((await searchParams).page);
  const queryClient = getServerQueryClient();

  // fetchQuery: espera los datos (y lanza si falla -> error.tsx) además de
  // dejarlos en el caché que se deshidrata a continuación.
  const data = await queryClient.fetchQuery(pokemonPageOptions(page));

  if (page > data.totalPages) notFound();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <section>
        <div className="page-head">
          <h1>Pokédex</h1>
          <p>
            {data.count.toLocaleString("es")} Pokémon · página {page} de{" "}
            {data.totalPages}. Pasa el mouse sobre una tarjeta para precargar
            su detalle.
          </p>
        </div>
        <PokemonGrid page={page} />
        <Pagination page={page} totalPages={data.totalPages} />
      </section>
    </HydrationBoundary>
  );
}
