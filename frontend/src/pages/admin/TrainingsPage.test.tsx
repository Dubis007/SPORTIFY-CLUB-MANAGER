import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TrainingsPage from './TrainingsPage';
import { trainingService } from '../../services/trainings/trainingService';

const ENTRENADOR = { id: 3, nombre: 'Eduardo', apellido: 'Entrenador', rol: 'ENTRENADOR' };
const ADMIN = { id: 1, nombre: 'Ana', apellido: 'Admin', rol: 'ADMIN' };
let mockUser = ENTRENADOR;

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: mockUser }),
}));

vi.mock('../../services/trainings/trainingService', () => ({
  trainingService: {
    getAll: vi.fn(),
    getFormOptions: vi.fn(),
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
    mockUser = ENTRENADOR;
    vi.mocked(trainingService.getFormOptions).mockResolvedValue({
      sedes: [{ id: 1, nombre: 'Sede Principal Norte' }],
      entrenadores: [{ id: 3, nombre: 'Eduardo Entrenador' }],
    });
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

describe('TrainingsPage — sede y entrenador de la sesión', () => {
  const sesionGuardada = {
    id: 11,
    entrenadorId: 7,
    entrenadorNombre: 'Bruno Suárez',
    sedeId: 2,
    sedeNombre: 'Sede Sur',
    titulo: 'Técnica de carrera',
    descripcion: '',
    fechaHora: '2026-11-20T16:00:00',
    fechaFin: '2026-11-20T18:00:00',
    capacidadMaxima: 20,
    estado: 'PENDIENTE',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = ADMIN;
    vi.mocked(trainingService.getAll).mockResolvedValue([
      {
        id: 10,
        entrenadorId: 3,
        entrenadorNombre: 'Eduardo Entrenador',
        sedeId: 1,
        sedeNombre: 'Sede Principal Norte',
        titulo: 'Entrenamiento Táctico Sub-20',
        descripcion: 'Presión alta y salida limpia',
        fechaHora: '2026-11-01T16:00:00',
        fechaFin: '2026-11-01T18:00:00',
        capacidadMaxima: 22,
        estado: 'PENDIENTE',
      },
    ]);
    vi.mocked(trainingService.getFormOptions).mockResolvedValue({
      sedes: [
        { id: 1, nombre: 'Sede Principal Norte' },
        { id: 2, nombre: 'Sede Sur' },
      ],
      entrenadores: [
        { id: 7, nombre: 'Bruno Suárez' },
        { id: 3, nombre: 'Eduardo Entrenador' },
      ],
    });
    vi.mocked(trainingService.create).mockResolvedValue(sesionGuardada);
    vi.mocked(trainingService.update).mockResolvedValue(sesionGuardada);
  });

  const abrirNuevaSesion = async () => {
    render(<TrainingsPage />);
    await screen.findByText('Entrenamiento Táctico Sub-20');
    // Las opciones de los selectores llegan en una petición aparte del listado
    await waitFor(() => expect(trainingService.getFormOptions).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: /Nueva Sesión/i }));
    await screen.findByRole('heading', { name: 'Programar Nueva Sesión' });
  };

  it('muestra en el listado la sede y el entrenador de cada sesión', async () => {
    render(<TrainingsPage />);

    expect(await screen.findByText('Sede Principal Norte')).toBeInTheDocument();
    expect(screen.getByText('Eduardo Entrenador')).toBeInTheDocument();
  });

  it('el administrador debe elegir sede y entrenador, y la sesión se guarda con los que eligió', async () => {
    await abrirNuevaSesion();

    const sede = screen.getByLabelText(/^Sede/);
    const entrenador = screen.getByLabelText(/^Entrenador responsable/);
    fireEvent.change(screen.getByLabelText(/^Título de la sesión/), {
      target: { value: 'Técnica de carrera' },
    });

    // Sin elegir, el formulario explica qué falta junto a cada selector y no envía nada
    fireEvent.click(screen.getByRole('button', { name: 'Guardar Sesión' }));
    expect(await screen.findByText('Selecciona una sede')).toBeInTheDocument();
    expect(screen.getByText('Selecciona un entrenador')).toBeInTheDocument();
    expect(sede).toHaveAttribute('aria-invalid', 'true');
    expect(sede).toHaveAttribute('aria-describedby', 'training-sede-error');
    expect(trainingService.create).not.toHaveBeenCalled();

    fireEvent.change(sede, { target: { value: '2' } });
    fireEvent.change(entrenador, { target: { value: '7' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar Sesión' }));

    await waitFor(() => {
      expect(trainingService.create).toHaveBeenCalledWith(
        expect.objectContaining({ titulo: 'Técnica de carrera', sedeId: 2, entrenadorId: 7 })
      );
    });
    // La sesión nueva aparece en el listado con su sede y su entrenador
    expect(await screen.findByText('Sede Sur')).toBeInTheDocument();
    expect(screen.getByText('Bruno Suárez')).toBeInTheDocument();
  });

  it('el entrenador no elige responsable: la sesión queda a su nombre y la única sede llega elegida', async () => {
    mockUser = ENTRENADOR;
    vi.mocked(trainingService.getFormOptions).mockResolvedValue({
      sedes: [{ id: 1, nombre: 'Sede Principal Norte' }],
      entrenadores: [{ id: 3, nombre: 'Eduardo Entrenador' }],
    });
    await abrirNuevaSesion();

    expect(
      screen.queryByRole('combobox', { name: /Entrenador responsable/ })
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText('Entrenador responsable')).toHaveValue('Eduardo Entrenador');
    expect(screen.getByLabelText(/^Sede/)).toHaveValue('1');

    fireEvent.change(screen.getByLabelText(/^Título de la sesión/), {
      target: { value: 'Fuerza' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar Sesión' }));

    await waitFor(() => {
      expect(trainingService.create).toHaveBeenCalledWith(
        expect.objectContaining({ titulo: 'Fuerza', sedeId: 1, entrenadorId: 3 })
      );
    });
  });

  it('al editar conserva la sede y el responsable que la sesión ya tenía aunque hoy no se puedan elegir', async () => {
    vi.mocked(trainingService.getAll).mockResolvedValue([
      {
        id: 12,
        entrenadorId: 1,
        entrenadorNombre: 'Ana Admin',
        sedeId: 9,
        sedeNombre: 'Sede Antigua',
        titulo: 'Sesión heredada',
        descripcion: '',
        fechaHora: '2026-11-05T16:00:00',
        fechaFin: '2026-11-05T18:00:00',
        capacidadMaxima: 18,
        estado: 'PENDIENTE',
      },
    ]);
    render(<TrainingsPage />);
    await screen.findByText('Sesión heredada');
    await waitFor(() => expect(trainingService.getFormOptions).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'Editar sesión Sesión heredada' }));
    await screen.findByRole('heading', { name: 'Editar Sesión' });

    expect(screen.getByRole('option', { name: 'Sede Antigua (inactiva)' })).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Ana Admin (ya no es entrenador activo)' })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^Sede/)).toHaveValue('9');
    expect(screen.getByLabelText(/^Entrenador responsable/)).toHaveValue('1');

    fireEvent.click(screen.getByRole('button', { name: 'Guardar Sesión' }));

    await waitFor(() => {
      expect(trainingService.update).toHaveBeenCalledWith(
        12,
        expect.objectContaining({ sedeId: 9, entrenadorId: 1, capacidadMaxima: 18 })
      );
    });
  });
});
