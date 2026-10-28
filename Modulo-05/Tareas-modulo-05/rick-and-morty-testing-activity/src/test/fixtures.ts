import { vi } from 'vitest';
import type { Character, CharacterResponse, Episode } from '@/types/rickandmorty';

export const makeCharacter = (overrides: Partial<Character> = {}): Character => ({
  id: 1,
  name: 'Rick Sanchez',
  status: 'Alive',
  species: 'Human',
  type: '',
  gender: 'Male',
  origin: { name: 'Earth (C-137)', url: 'https://rickandmortyapi.com/api/location/1' },
  location: { name: 'Citadel of Ricks', url: 'https://rickandmortyapi.com/api/location/3' },
  image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
  episode: [
    'https://rickandmortyapi.com/api/episode/1',
    'https://rickandmortyapi.com/api/episode/2',
  ],
  url: 'https://rickandmortyapi.com/api/character/1',
  created: '2017-11-04T18:48:46.250Z',
  ...overrides,
});

export const makeEpisode = (overrides: Partial<Episode> = {}): Episode => ({
  id: 1,
  name: 'Pilot',
  air_date: 'December 2, 2013',
  episode: 'S01E01',
  characters: [],
  url: 'https://rickandmortyapi.com/api/episode/1',
  created: '2017-11-10T12:56:33.798Z',
  ...overrides,
});

export const makeCharacterResponse = (
  results: Character[] = [makeCharacter()],
  pages = 42,
): CharacterResponse => ({
  info: { count: results.length, pages, next: null, prev: null },
  results,
});

export const mockFetchOnce = (body: unknown, ok = true) =>
  vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
    ok,
    json: async () => body,
  } as Response);
