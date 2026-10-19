import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Pagination from './Pagination';

const baseProps = {
  pageSize: 10,
  totalCount: 25,
  totalPages: 3,
  onPageChange: () => {},
  onPageSizeChange: () => {},
};

describe('Pagination', () => {
  it('muestra el rango de registros de la página actual', () => {
    render(<Pagination {...baseProps} page={2} />);
    expect(screen.getByText('11–20 de 25 registros')).toBeInTheDocument();
    expect(screen.getByText('Página 2 de 3')).toBeInTheDocument();
  });

  it('deshabilita "Anterior" en la primera página y "Siguiente" en la última', () => {
    const { rerender } = render(<Pagination {...baseProps} page={1} />);
    expect(screen.getByRole('button', { name: /Anterior/ })).toBeDisabled();

    rerender(<Pagination {...baseProps} page={3} />);
    expect(screen.getByRole('button', { name: /Siguiente/ })).toBeDisabled();
  });

  it('pide la página siguiente al pulsar "Siguiente"', () => {
    const onPageChange = vi.fn();
    render(<Pagination {...baseProps} page={1} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
