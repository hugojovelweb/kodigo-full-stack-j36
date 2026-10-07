/** Extrae el id numérico desde una URL de la PokéAPI (…/pokemon/25/). */
export function extractIdFromUrl(url: string): number {
  const match = url.match(/\/(\d+)\/?$/);
  if (!match || !match[1]) {
    throw new Error(`No se pudo extraer el id desde la URL: ${url}`);
  }
  return Number(match[1]);
}

/** URL del arte oficial a partir del id (evita una petición extra por tarjeta). */
export function officialArtworkUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

/** "mr-mime" -> "Mr Mime" */
export function formatName(name: string): string {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatId(id: number): string {
  return `#${String(id).padStart(4, "0")}`;
}

const STAT_LABELS: Record<string, string> = {
  hp: "PS",
  attack: "Ataque",
  defense: "Defensa",
  "special-attack": "At. Esp.",
  "special-defense": "Def. Esp.",
  speed: "Velocidad",
};

export function formatStatName(name: string): string {
  return STAT_LABELS[name] ?? formatName(name);
}

export const TYPE_COLORS: Record<string, string> = {
  normal: "#a8a77a",
  fire: "#ee8130",
  water: "#6390f0",
  electric: "#f7d02c",
  grass: "#7ac74c",
  ice: "#96d9d6",
  fighting: "#c22e28",
  poison: "#a33ea1",
  ground: "#e2bf65",
  flying: "#a98ff3",
  psychic: "#f95587",
  bug: "#a6b91a",
  rock: "#b6a136",
  ghost: "#735797",
  dragon: "#6f35fc",
  dark: "#705746",
  steel: "#b7b7ce",
  fairy: "#d685ad",
};

export function typeColor(type: string): string {
  return TYPE_COLORS[type] ?? "#68a090";
}
