import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import toast from 'react-hot-toast';
import RegistrationsPage from './RegistrationsPage';
import { registrationService } from '../../services/registrations/registrationService';

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('../../services/registrations/registrationService', () => ({
  registrationService: {
    getAll: vi.fn(),
    getOptions: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('RegistrationsPage — convocatoria de deportistas a torneos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(registrationService.getAll).mockResolvedValue([
      {
        id: 1,
        usuarioId: 4,
        competenciaId: 9,
        estado: 'PENDIENTE',
        fechaInscripcion: '2026-11-11T10:00:00',
        usuarioNombre: 'Mario Miembro',
        competenciaNombre: 'Copa Regional',
      },
    ] as any);
    vi.mocked(registrationService.getOptions).mockResolvedValue({
      members: [{ id: 5, nombre: 'Laura', apellido: 'Prueba' }],
      competitions: [{ id: 9, nombre: 'Copa Regional', fechaInicio: '2026-12-05T09:00:00' }],
    });
    vi.mocked(registrationService.create).mockResolvedValue({ id: 2 } as any);
    vi.mocked(registrationService.update).mockResolvedValue({ id: 1 } as any);
  });

  it('convoca sin enviar estado: la inscripción queda pendiente hasta que el deportista responda', async () => {
    render(<RegistrationsPage />);
    await screen.findByText('Mario Miembro');

    fireEvent.click(screen.getByRole('button', { name: /Convocar Deportista/ }));

    expect(screen.getByText(/hasta que el\s+deportista la acepte o la rechace/)).toBeInTheDocument();
    expect(screen.queryByLabelText('Estado')).not.toBeInTheDocument();

    const [memberSelect, competitionSelect] = screen.getAllByRole('combobox');
    fireEvent.change(memberSelect, { target: { value: '5' } });
    fireEvent.change(competitionSelect, { target: { value: '9' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar Convocatoria' }));

    await waitFor(() => {
      expect(registrationService.create).toHaveBeenCalledWith({ usuarioId: 5, competenciaId: 9 });
    });
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Convocatoria enviada al deportista.');
    });
  });

  it('permite al personal corregir el estado de una inscripción existente', async () => {
    render(<RegistrationsPage />);
    await screen.findByText('Mario Miembro');

    fireEvent.click(screen.getByTitle('Cambiar estado'));
    fireEvent.change(screen.getByLabelText('Estado'), { target: { value: 'CANCELADA' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() => {
      expect(registrationService.update).toHaveBeenCalledWith(1, {
        usuarioId: 4,
        competenciaId: 9,
        estado: 'CANCELADA',
      });
    });
  });
});
