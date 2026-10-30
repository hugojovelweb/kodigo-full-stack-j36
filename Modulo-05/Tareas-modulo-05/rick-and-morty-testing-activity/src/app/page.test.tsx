import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from '@/app/page';
import * as api from '@/lib/api';
import { makeCharacter, makeCharacterResponse } from '@/test/fixtures';

const renderHome = async (searchParams: Record<string, string | string[] | undefined>) =>
  render(await Home({ searchParams: Promise.resolve(searchParams) }));

describe('Home (lista de personajes)', () => {
  it('carga la página 1 por defecto y pinta una tarjeta por personaje', async () => {
    const spy = vi.spyOn(api, 'getCharacters').mockResolvedValue(
      makeCharacterResponse([
        makeCharacter({ id: 1, name: 'Rick Sanchez' }),
        makeCharacter({ id: 2, name: 'Morty Smith' }),
      ], 42),
    );

    await renderHome({});

    expect(spy).toHaveBeenCalledWith(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Rick and Morty Characters');
    expect(screen.getByText('Rick Sanchez')).toBeInTheDocument();
    expect(screen.getByText('Morty Smith')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 42')).toBeInTheDocument();
  });

  it('usa el parámetro ?page= cuando es texto', async () => {
    const spy = vi.spyOn(api, 'getCharacters').mockResolvedValue(makeCharacterResponse());
    await renderHome({ page: '3' });

    expect(spy).toHaveBeenCalledWith(3);
    expect(screen.getByText('Page 3 of 42')).toBeInTheDocument();
  });

  it('ignora ?page= si llega como arreglo y usa la página 1', async () => {
    const spy = vi.spyOn(api, 'getCharacters').mockResolvedValue(makeCharacterResponse());
    await renderHome({ page: ['2', '3'] });
    expect(spy).toHaveBeenCalledWith(1);
  });

  it('propaga el error de la API (lo captura error.tsx)', async () => {
    vi.spyOn(api, 'getCharacters').mockRejectedValue(new Error('Failed to fetch characters'));
    await expect(Home({ searchParams: Promise.resolve({}) })).rejects.toThrow(
      'Failed to fetch characters',
    );
  });
});
