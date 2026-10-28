import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Pagination from '@/components/Pagination';

describe('<Pagination />', () => {
  it('muestra la página actual y el total', () => {
    render(<Pagination currentPage={3} totalPages={10} />);
    expect(screen.getByText('Page 3 of 10')).toBeInTheDocument();
  });

  it('en la primera página deshabilita Previous y habilita Next', () => {
    render(<Pagination currentPage={1} totalPages={5} />);

    expect(screen.queryByRole('link', { name: /Previous/ })).not.toBeInTheDocument();
    expect(screen.getByText(/Previous/)).toHaveClass('cursor-not-allowed');
    expect(screen.getByRole('link', { name: /Next/ })).toHaveAttribute('href', '/?page=2');
  });

  it('en una página intermedia habilita ambos enlaces', () => {
    render(<Pagination currentPage={2} totalPages={5} />);

    expect(screen.getByRole('link', { name: /Previous/ })).toHaveAttribute('href', '/?page=1');
    expect(screen.getByRole('link', { name: /Next/ })).toHaveAttribute('href', '/?page=3');
  });

  it('en la última página deshabilita Next y habilita Previous', () => {
    render(<Pagination currentPage={5} totalPages={5} />);

    expect(screen.queryByRole('link', { name: /Next/ })).not.toBeInTheDocument();
    expect(screen.getByText(/Next/)).toHaveClass('cursor-not-allowed');
    expect(screen.getByRole('link', { name: /Previous/ })).toHaveAttribute('href', '/?page=4');
  });

  it('con una sola página ambos controles quedan deshabilitados', () => {
    render(<Pagination currentPage={1} totalPages={1} />);
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });
});
