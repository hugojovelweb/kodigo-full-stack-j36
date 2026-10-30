import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorPage from '@/app/error';

describe('error.tsx', () => {
  it('muestra el mensaje de error y registra el error en consola', () => {
    const err = new Error('boom');
    const logSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<ErrorPage error={err} reset={() => {}} />);

    expect(screen.getByText('Something went wrong!')).toBeInTheDocument();
    expect(logSpy).toHaveBeenCalledWith(err);
  });

  it('llama a reset al pulsar "Try again"', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const reset = vi.fn();

    render(<ErrorPage error={new Error('x')} reset={reset} />);
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(reset).toHaveBeenCalledTimes(1);
  });
});
