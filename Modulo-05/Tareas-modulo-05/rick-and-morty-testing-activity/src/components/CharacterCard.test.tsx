import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CharacterCard from '@/components/CharacterCard';
import { makeCharacter } from '@/test/fixtures';

describe('<CharacterCard />', () => {
  it('muestra nombre, estado, especie y ubicación', () => {
    render(<CharacterCard character={makeCharacter()} />);

    expect(screen.getByRole('heading', { name: 'Rick Sanchez' })).toBeInTheDocument();
    expect(screen.getByText('Alive - Human')).toBeInTheDocument();
    expect(screen.getByText('Citadel of Ricks')).toBeInTheDocument();
    expect(screen.getByText('Last known location:')).toBeInTheDocument();
  });

  it('enlaza al detalle del personaje', () => {
    render(<CharacterCard character={makeCharacter({ id: 7 })} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/character/7');
  });

  it('renderiza la imagen con alt igual al nombre', () => {
    render(<CharacterCard character={makeCharacter()} />);
    expect(screen.getByAltText('Rick Sanchez')).toHaveAttribute(
      'src',
      'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
    );
  });

  it.each([
    ['Alive', 'bg-green-500'],
    ['Dead', 'bg-red-500'],
    ['unknown', 'bg-gray-500'],
  ] as const)('usa el color correcto para el estado %s', (status, cls) => {
    const { container } = render(<CharacterCard character={makeCharacter({ status })} />);
    expect(container.querySelector('span.rounded-full')).toHaveClass(cls);
  });

  it('usa gris por defecto si el estado no es reconocido', () => {
    const odd = makeCharacter({ status: 'Zombie' as never });
    const { container } = render(<CharacterCard character={odd} />);
    expect(container.querySelector('span.rounded-full')).toHaveClass('bg-gray-500');
  });
});
