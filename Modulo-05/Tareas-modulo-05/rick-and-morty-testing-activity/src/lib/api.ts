import { Character, CharacterResponse, Episode } from '@/types/rickandmorty';

const API_BASE_URL = 'https://rickandmortyapi.com/api';

export async function getCharacters(page: number = 1): Promise<CharacterResponse> {
  const res = await fetch(`${API_BASE_URL}/character?page=${page}`);
  
  if (!res.ok) {
    throw new Error('Failed to fetch characters');
  }

  return res.json();
}

export async function getCharacter(id: string): Promise<Character> {
  const res = await fetch(`${API_BASE_URL}/character/${id}`);
  
  if (!res.ok) {
    throw new Error('Failed to fetch character details');
  }

  return res.json();
}

export async function getEpisodes(ids: string[]): Promise<Episode[]> {
  if (ids.length === 0) return [];
  
  const res = await fetch(`${API_BASE_URL}/episode/${ids.join(',')}`);
  
  if (!res.ok) {
    throw new Error('Failed to fetch episodes');
  }

  const data = await res.json();
  // If only one episode is requested, the API returns an object, not an array.
  return Array.isArray(data) ? data : [data];
}
