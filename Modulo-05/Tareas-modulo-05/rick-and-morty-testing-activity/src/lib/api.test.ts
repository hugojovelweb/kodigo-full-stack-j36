import { describe, it, expect, vi } from 'vitest';
import { getCharacters, getCharacter, getEpisodes } from '@/lib/api';
import { makeCharacter, makeCharacterResponse, makeEpisode, mockFetchOnce } from '@/test/fixtures';

const BASE = 'https://rickandmortyapi.com/api';

describe('getCharacters', () => {
  it('pide la página 1 por defecto y devuelve la respuesta', async () => {
    const body = makeCharacterResponse();
    const spy = mockFetchOnce(body);

    await expect(getCharacters()).resolves.toEqual(body);
    expect(spy).toHaveBeenCalledWith(`${BASE}/character?page=1`);
  });

  it('pide la página indicada', async () => {
    const spy = mockFetchOnce(makeCharacterResponse());
    await getCharacters(5);
    expect(spy).toHaveBeenCalledWith(`${BASE}/character?page=5`);
  });

  it('lanza error si la respuesta no es ok', async () => {
    mockFetchOnce({}, false);
    await expect(getCharacters()).rejects.toThrow('Failed to fetch characters');
  });
});

describe('getCharacter', () => {
  it('devuelve el personaje solicitado', async () => {
    const rick = makeCharacter();
    const spy = mockFetchOnce(rick);

    await expect(getCharacter('1')).resolves.toEqual(rick);
    expect(spy).toHaveBeenCalledWith(`${BASE}/character/1`);
  });

  it('lanza error si el personaje no existe', async () => {
    mockFetchOnce({ error: 'Character not found' }, false);
    await expect(getCharacter('99999')).rejects.toThrow('Failed to fetch character details');
  });
});

describe('getEpisodes', () => {
  it('devuelve [] sin llamar a la API cuando no hay ids', async () => {
    const spy = vi.spyOn(globalThis, 'fetch');
    await expect(getEpisodes([])).resolves.toEqual([]);
    expect(spy).not.toHaveBeenCalled();
  });

  it('une los ids con coma y devuelve el arreglo tal cual', async () => {
    const eps = [makeEpisode(), makeEpisode({ id: 2, episode: 'S01E02' })];
    const spy = mockFetchOnce(eps);

    await expect(getEpisodes(['1', '2'])).resolves.toEqual(eps);
    expect(spy).toHaveBeenCalledWith(`${BASE}/episode/1,2`);
  });

  it('envuelve en arreglo cuando la API devuelve un solo objeto', async () => {
    const ep = makeEpisode();
    mockFetchOnce(ep);
    await expect(getEpisodes(['1'])).resolves.toEqual([ep]);
  });

  it('lanza error si la respuesta no es ok', async () => {
    mockFetchOnce({}, false);
    await expect(getEpisodes(['1'])).rejects.toThrow('Failed to fetch episodes');
  });
});
