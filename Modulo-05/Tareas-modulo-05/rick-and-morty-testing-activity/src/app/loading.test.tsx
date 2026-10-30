import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Loading from '@/app/loading';

describe('loading.tsx', () => {
  it('renderiza 8 tarjetas esqueleto animadas', () => {
    const { container } = render(<Loading />);
    expect(container.querySelectorAll('.h-96.animate-pulse')).toHaveLength(8);
  });
});
