import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmDialogModal from './ConfirmDialogModal';

describe('ConfirmDialogModal', () => {
  it('renderiza diálogo accesible, ejecuta confirmación y soporta cierre con Escape', () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();

    render(
      <ConfirmDialogModal
        isOpen={true}
        title="Eliminar registro"
        description="Esta operación no se puede revertir."
        confirmLabel="Sí, eliminar"
        variant="danger"
        onConfirm={onConfirm}
        onClose={onClose}
      />
    );

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText('Eliminar registro')).toBeInTheDocument();

    // Verifica que el foco inicial recae en el botón seguro ("Cancelar") para evitar patrones oscuros
    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus();

    fireEvent.click(screen.getByRole('button', { name: 'Sí, eliminar' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('muestra estado de espera cómodo (Procesando...) y bloquea cierre accidental mientras procesa', () => {
    const onClose = vi.fn();

    render(
      <ConfirmDialogModal
        isOpen={true}
        title="Cerrar sesión deportiva"
        description="Guardando cambios en servidor..."
        loading={true}
        onConfirm={vi.fn()}
        onClose={onClose}
      />
    );

    expect(screen.getByRole('button', { name: 'Procesando...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });
});
