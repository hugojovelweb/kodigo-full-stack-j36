import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

vi.mock('next/font/google', () => ({
  Geist: () => ({ variable: 'geist-sans' }),
  Geist_Mono: () => ({ variable: 'geist-mono' }),
}));
vi.mock('@/app/globals.css', () => ({}));

import RootLayout, { metadata } from '@/app/layout';

describe('RootLayout', () => {
  it('define los metadatos de la aplicación', () => {
    expect(metadata.title).toBe('Rick and Morty Explorer');
    expect(metadata.description).toBe('Explore the Rick and Morty universe');
  });

  it('envuelve a los hijos con header, nav y footer con el sello', () => {
    const html = renderToStaticMarkup(
      <RootLayout>
        <p>contenido de prueba</p>
      </RootLayout>,
    );

    expect(html).toContain('<html lang="en">');
    expect(html).toContain('contenido de prueba');
    expect(html).toContain('Rick &amp; Morty App');
    expect(html).toContain('href="https://rickandmortyapi.com/documentation"');
    expect(html).toContain('Hugo Jovel Web');
    expect(html).toContain('Kodigo Full Stack Jr 36');
  });
});
