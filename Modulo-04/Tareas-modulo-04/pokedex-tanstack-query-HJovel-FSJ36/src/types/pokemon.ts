/* ------------------------------------------------------------------ */
/* Respuestas crudas de la PokéAPI (solo los campos que se utilizan)   */
/* ------------------------------------------------------------------ */

export interface NamedAPIResource {
  name: string;
  url: string;
}

export interface PokemonListApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedAPIResource[];
}

export interface PokemonApiResponse {
  id: number;
  name: string;
  height: number; // decímetros
  weight: number; // hectogramos
  base_experience: number | null;
  types: { slot: number; type: NamedAPIResource }[];
  abilities: { ability: NamedAPIResource; is_hidden: boolean; slot: number }[];
  stats: { base_stat: number; effort: number; stat: NamedAPIResource }[];
  sprites: {
    front_default: string | null;
    back_default: string | null;
    front_shiny: string | null;
    back_shiny: string | null;
    other?: {
      "official-artwork"?: {
        front_default: string | null;
        front_shiny: string | null;
      };
    };
  };
  species: NamedAPIResource;
}

export interface PokemonSpeciesApiResponse {
  id: number;
  name: string;
  evolution_chain: { url: string };
  flavor_text_entries: {
    flavor_text: string;
    language: NamedAPIResource;
    version: NamedAPIResource;
  }[];
  genera: { genus: string; language: NamedAPIResource }[];
}

export interface ChainLink {
  species: NamedAPIResource;
  evolution_details: {
    min_level: number | null;
    trigger: NamedAPIResource;
    item: NamedAPIResource | null;
  }[];
  evolves_to: ChainLink[];
}

export interface EvolutionChainApiResponse {
  id: number;
  chain: ChainLink;
}

/* ------------------------------------------------------------------ */
/* Modelos de dominio (lo que consume la UI)                           */
/* ------------------------------------------------------------------ */

export interface PokemonListItem {
  id: number;
  name: string;
}

export interface PokemonPage {
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
  results: PokemonListItem[];
}

export interface PokemonStat {
  name: string;
  value: number;
}

export interface PokemonAbility {
  name: string;
  isHidden: boolean;
}

export interface EvolutionStep {
  id: number;
  name: string;
  /** Texto legible del requisito: "Nivel 16", "Piedra fuego", etc. */
  requirement: string | null;
  /** Etapa dentro de la cadena (0 = forma base). */
  stage: number;
}

export interface PokemonDetail {
  id: number;
  name: string;
  genus: string | null;
  description: string | null;
  heightM: number;
  weightKg: number;
  baseExperience: number | null;
  types: string[];
  abilities: PokemonAbility[];
  stats: PokemonStat[];
  artwork: string;
  sprites: { label: string; url: string }[];
  evolutions: EvolutionStep[];
}
