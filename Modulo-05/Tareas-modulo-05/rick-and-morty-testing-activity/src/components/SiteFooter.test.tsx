import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import SiteFooter from '@/components/SiteFooter';

afterEach(() => vi.useRealTimers());

describe('<SiteFooter /> (sello Hugo Jovel Web)', () => {
  it('muestra el stack recibido por props', () => {
    render(<SiteFooter stack="Kodigo Full Stack Jr 36 · Next.js 16" />);
    expect(screen.getByText('Kodigo Full Stack Jr 36 · Next.js 16')).toBeInTheDocument();
  });

  it('calcula el año dinámicamente', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2031-05-01T12:00:00Z'));
    render(<SiteFooter stack="x" />);
    expect(screen.getByRole('contentinfo')).toHaveTextContent('© 2031');
  });

  it('enlaza "Hugo Jovel Web" en negrita, en pestaña nueva y de forma segura', () => {
    render(<SiteFooter stack="x" />);
    const link = screen.getByRole('link', { name: 'Hugo Jovel Web' });

    expect(link).toHaveAttribute('href', 'https://hugojovelweb.tech/');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link.querySelector('strong')).toHaveTextContent('Hugo Jovel Web');
  });

  it('incluye la leyenda de derechos reservados y el crédito de la API', () => {
    render(<SiteFooter stack="x" />);
    expect(screen.getByText(/Todos los derechos reservados/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'The Rick and Morty API' })).toHaveAttribute(
      'href',
      'https://rickandmortyapi.com',
    );
  });
});
