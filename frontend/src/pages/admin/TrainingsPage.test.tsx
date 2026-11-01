import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TrainingsPage from './TrainingsPage';
import { trainingService } from '../../services/trainings/trainingService';

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 3, nombre: 'Eduardo', apellido: 'Entrenador', rol: 'ENTRENADOR' },
  }),
}));

vi.mock('../../services/trainings/trainingService', () => ({
  trainingService: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    closeTraining: vi.fn(),
    getAttendance: vi.fn(),
    markAttendance: vi.fn(),
  },
}));

describe('TrainingsPage — Estados de Asistencia y Comentarios Opcionales (TAREA-P1-02)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(trainingService.getAll).mockResolvedValue([
      {
        id: 10,
        entrenadorId: 3,
        sedeId: 1,
        titulo: 'Entrenamiento Táctico Sub-20',
        descripcion: 'Presión alta y salida limpia',
        fechaHora: '2026-11-01T16:00:00Z',
        fechaFin: '2026-11-01T18:00:00Z',
        capacidadMaxima: 22,
        estado: 'PENDIENTE',
      },
    ]);
    vi.mocked(trainingService.getAttendance).mockResolvedValue([
      {
        id: 4,
        nombre: 'Mario',
        apellido: 'Miembro',
        asistio: false,
        estado: null,
        observaciones: null,
      },
    ]);
    vi.mocked(trainingService.markAttendance).mockResolvedValue(undefined);
  });

  it('permite marcar los 4 estados (Presente, Ausente, Tarde, Excusa) y guardar comentario opcional', async () => {
    render(<TrainingsPage />);

    await waitFor(() => {
      expect(screen.getByText('Entrenamiento Táctico Sub-20')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Asistencia/i }));

    await waitFor(() => {
      expect(screen.getByText('Mario Miembro')).toBeInTheDocument();
    });

    // Probar marcado de estado TARDE
    fireEvent.click(screen.getByLabelText('Marcar Tarde a Mario Miembro'));
    await waitFor(() => {
      expect(trainingService.markAttendance).toHaveBeenCalledWith(10, 4, 'TARDE', '');
    });
    expect(screen.getByText('Tarde: 1')).toBeInTheDocument();

    // Probar marcado de estado EXCUSA y comentario opcional
    fireEvent.click(screen.getByLabelText('Marcar Excusa a Mario Miembro'));
    await waitFor(() => {
      expect(trainingService.markAttendance).toHaveBeenCalledWith(10, 4, 'EXCUSA', '');
    });

    fireEvent.click(screen.getByLabelText('Comentario opcional para Mario Miembro'));
    const commentInput = screen.getByLabelText('Texto de comentario para Mario Miembro');
    fireEvent.change(commentInput, { target: { value: 'Cita médica justificada' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar nota' }));

    await waitFor(() => {
      expect(trainingService.markAttendance).toHaveBeenCalledWith(
        10,
        4,
        'EXCUSA',
        'Cita médica justificada'
      );
    });
  });
});
