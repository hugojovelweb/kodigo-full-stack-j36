import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CharacterPage from '@/app/character/[id]/page';
import * as api from '@/lib/api';
import { makeCharacter, makeEpisode } from '@/test/fixtures';

const renderPage = async (id = '1') =>
  render(await CharacterPage({ params: Promise.resolve({ id }) }));

describe('CharacterPage (detalle)', () => {
  it('muestra la información completa del personaje', async () => {
    vi.spyOn(api, 'getCharacter').mockResolvedValue(makeCharacter({ type: 'Genius' }));
    vi.spyOn(api, 'getEpisodes').mockResolvedValue([
      makeEpisode(),
      makeEpisode({ id: 2, episode: 'S01E02', name: 'Lawnmower Dog' }),
    ]);

    await renderPage();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Rick Sanchez');
    expect(screen.getByText('Alive - Human')).toBeInTheDocument();
    expect(screen.getByText('Male')).toBeInTheDocument();
    expect(screen.getByText('Genius')).toBeInTheDocument();
    expect(screen.getByText('Earth (C-137)')).toBeInTheDocument();
    expect(screen.getByText('Citadel of Ricks')).toBeInTheDocument();
    expect(screen.getByText('November 4, 2017')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Back to Characters/ })).toHaveAttribute('href', '/');
  });

  it('extrae los ids de episodios desde las URLs y los consulta', async () => {
    vi.spyOn(api, 'getCharacter').mockResolvedValue(makeCharacter());
    const spy = vi.spyOn(api, 'getEpisodes').mockResolvedValue([]);

    await renderPage('1');
    expect(spy).toHaveBeenCalledWith(['1', '2']);
  });

  it('lista los episodios con su contador y tooltip', async () => {
    vi.spyOn(api, 'getCharacter').mockResolvedValue(makeCharacter());
    vi.spyOn(api, 'getEpisodes').mockResolvedValue([makeEpisode()]);

    await renderPage();

    expect(screen.getByText('Episodes (1)')).toBeInTheDocument();
    expect(screen.getByText('S01E01')).toHaveAttribute('title', 'Pilot - December 2, 2013');
  });

  it('muestra "Unknown" cuando el personaje no tiene type', async () => {
    vi.spyOn(api, 'getCharacter').mockResolvedValue(makeCharacter({ type: '' }));
    vi.spyOn(api, 'getEpisodes').mockResolvedValue([]);

    await renderPage();
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it.each([
    ['Alive', 'bg-green-500'],
    ['Dead', 'bg-red-500'],
    ['unknown', 'bg-gray-500'],
  ] as const)('colorea el indicador de estado %s', async (status, cls) => {
    vi.spyOn(api, 'getCharacter').mockResolvedValue(makeCharacter({ status }));
    vi.spyOn(api, 'getEpisodes').mockResolvedValue([]);

    const { container } = await renderPage();
    expect(container.querySelector('span.rounded-full')).toHaveClass(cls);
  });

  it('propaga el error si el personaje no existe', async () => {
    vi.spyOn(api, 'getCharacter').mockRejectedValue(new Error('Failed to fetch character details'));
    await expect(CharacterPage({ params: Promise.resolve({ id: '0' }) })).rejects.toThrow(
      'Failed to fetch character details',
    );
  });
});
