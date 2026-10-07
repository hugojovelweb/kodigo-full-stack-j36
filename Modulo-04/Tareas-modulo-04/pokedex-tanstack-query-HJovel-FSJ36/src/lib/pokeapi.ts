import {
  NEXT_REVALIDATE_SECONDS,
  PAGE_SIZE,
  POKEAPI_URL,
} from "@/lib/constants";
import {
  extractIdFromUrl,
  formatName,
  officialArtworkUrl,
} from "@/lib/pokemon-utils";
import type {
  ChainLink,
  EvolutionChainApiResponse,
  EvolutionStep,
  PokemonApiResponse,
  PokemonDetail,
  PokemonListApiResponse,
  PokemonPage,
  PokemonSpeciesApiResponse,
} from "@/types/pokemon";

/** Error tipado para distinguir 404 (no existe) de fallos de red/servidor. */
export class PokeApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "PokeApiError";
    this.status = status;
  }
}

/**
 * fetch genérico y tipado. La opción `next.revalidate` alimenta el Data Cache
 * de Next.js en el servidor (24 h); en el navegador simplemente se ignora.
 */
async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: NEXT_REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new PokeApiError(
      `PokéAPI respondió ${response.status} para ${url}`,
      response.status,
    );
  }

  return (await response.json()) as T;
}

/* ------------------------------ Lista ------------------------------ */

export async function getPokemonPage(page: number): Promise<PokemonPage> {
  const offset = (page - 1) * PAGE_SIZE;
  const data = await fetchJson<PokemonListApiResponse>(
    `${POKEAPI_URL}/pokemon?limit=${PAGE_SIZE}&offset=${offset}`,
  );

  return {
    count: data.count,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(data.count / PAGE_SIZE)),
    results: data.results.map((item) => ({
      id: extractIdFromUrl(item.url),
      name: item.name,
    })),
  };
}

/* ----------------------------- Detalle ----------------------------- */

function flattenEvolutionChain(
  link: ChainLink,
  stage = 0,
  acc: EvolutionStep[] = [],
): EvolutionStep[] {
  const detail = link.evolution_details[0];
  let requirement: string | null = null;

  if (detail) {
    if (detail.min_level) requirement = `Nivel ${detail.min_level}`;
    else if (detail.item) requirement = formatName(detail.item.name);
    else requirement = formatName(detail.trigger.name);
  }

  acc.push({
    id: extractIdFromUrl(link.species.url),
    name: link.species.name,
    requirement,
    stage,
  });

  link.evolves_to.forEach((next) => flattenEvolutionChain(next, stage + 1, acc));
  return acc;
}

function cleanFlavorText(text: string): string {
  return text.replace(/[\n\f\r]/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Obtiene TODA la información del detalle en una sola función:
 * pokemon + species + evolution-chain. Al ser un único queryFn, un solo
 * prefetchQuery en hover deja la página de detalle completa en caché.
 */
export async function getPokemonDetail(idOrName: string): Promise<PokemonDetail> {
  const pokemon = await fetchJson<PokemonApiResponse>(
    `${POKEAPI_URL}/pokemon/${encodeURIComponent(idOrName)}`,
  );

  const species = await fetchJson<PokemonSpeciesApiResponse>(pokemon.species.url);
  const chain = await fetchJson<EvolutionChainApiResponse>(
    species.evolution_chain.url,
  );

  const flavor =
    species.flavor_text_entries.find((e) => e.language.name === "es") ??
    species.flavor_text_entries.find((e) => e.language.name === "en");
  const genus =
    species.genera.find((g) => g.language.name === "es") ??
    species.genera.find((g) => g.language.name === "en");

  const artwork =
    pokemon.sprites.other?.["official-artwork"]?.front_default ??
    pokemon.sprites.front_default ??
    officialArtworkUrl(pokemon.id);

  const spriteCandidates: [string, string | null][] = [
    ["Frente", pokemon.sprites.front_default],
    ["Espalda", pokemon.sprites.back_default],
    ["Shiny frente", pokemon.sprites.front_shiny],
    ["Shiny espalda", pokemon.sprites.back_shiny],
  ];

  return {
    id: pokemon.id,
    name: pokemon.name,
    genus: genus?.genus ?? null,
    description: flavor ? cleanFlavorText(flavor.flavor_text) : null,
    heightM: pokemon.height / 10,
    weightKg: pokemon.weight / 10,
    baseExperience: pokemon.base_experience,
    types: pokemon.types.sort((a, b) => a.slot - b.slot).map((t) => t.type.name),
    abilities: pokemon.abilities
      .sort((a, b) => a.slot - b.slot)
      .map((a) => ({ name: a.ability.name, isHidden: a.is_hidden })),
    stats: pokemon.stats.map((s) => ({ name: s.stat.name, value: s.base_stat })),
    artwork,
    sprites: spriteCandidates
      .filter((entry): entry is [string, string] => entry[1] !== null)
      .map(([label, url]) => ({ label, url })),
    evolutions: flattenEvolutionChain(chain.chain),
  };
}
