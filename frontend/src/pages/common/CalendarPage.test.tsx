import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import CalendarPage from './CalendarPage';
import { trainingService } from '../../services/trainings/trainingService';
import { competitionService } from '../../services/competitions/competitionService';
import { userService } from '../../services/users/userService';

vi.mock('../../services/trainings/trainingService', () => ({
  trainingService: {
    getAll: vi.fn(),
  },
}));

vi.mock('../../services/competitions/competitionService', () => ({
  competitionService: {
    getAll: vi.fn(),
  },
}));

vi.mock('../../services/users/userService', () => ({
  userService: {
    getUpcomingBirthdays: vi.fn(),
  },
}));

describe('CalendarPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userService.getUpcomingBirthdays).mockResolvedValue([]);
  });

  it('muestra estados vacíos amigables cuando no hay eventos en el mes (VID2-RNF-005)', async () => {
    vi.mocked(trainingService.getAll).mockResolvedValue([]);
    vi.mocked(competitionService.getAll).mockResolvedValue([]);

    render(<CalendarPage />);

    await waitFor(() => {
      expect(
        screen.getByText('Sin eventos programados este mes.')
      ).toBeInTheDocument();
    });
    expect(
      screen.getByText('Sin eventos programados para el día seleccionado.')
    ).toBeInTheDocument();
  });

  it('renderiza entrenamientos y competencias del mes actual y permite abrir enlace a Google Calendar', async () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayIso = `${year}-${month}-${day}T15:00:00`;
    const todayEndIso = `${year}-${month}-${day}T17:00:00`;

    vi.mocked(trainingService.getAll).mockResolvedValue([
      {
        id: 1,
        sedeId: 1,
        sedeNombre: 'Sede Principal Norte',
        entrenadorId: 3,
        titulo: 'Sesión Velocidad Patinaje',
        descripcion: 'Trabajo de series en pista',
        fechaHora: todayIso,
        fechaFin: todayEndIso,
        capacidadMaxima: 25,
        estado: 'PENDIENTE',
      },
    ]);

    vi.mocked(competitionService.getAll).mockResolvedValue([
      {
        id: 2,
        nombre: 'Copa Departamental Otoño',
        descripcion: 'Torneo oficial federado',
        fechaInicio: todayIso,
        fechaFin: todayEndIso,
        ubicacion: 'Patinódromo Norte',
        creadoEn: todayIso,
      },
    ]);

    render(<CalendarPage />);

    await waitFor(() => {
      expect(screen.getAllByText('Sesión Velocidad Patinaje').length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText('Copa Departamental Otoño').length).toBeGreaterThan(0);

    // El entrenamiento muestra el nombre de la sede, no su identificador interno
    expect(screen.getAllByText(/Sede Principal Norte/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Sede #1/)).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByText('Copa Departamental Otoño')[0]);

    const gcalLink = await screen.findByRole('link', {
      name: /Añadir a Google Calendar/i,
    });
    expect(gcalLink).toHaveAttribute(
      'href',
      expect.stringContaining('https://calendar.google.com/calendar/render?')
    );
  });

  it('muestra aviso de próximos cumpleaños y marca el evento de cumpleaños en el calendario (TAREA-P2-06C)', async () => {
    const now = new Date();
    const year = now.getFullYear();
    const monthNum = now.getMonth() + 1;
    const dayNum = Math.min(now.getDate(), 25);
    const nextDay = dayNum + 3;
    const proxIso = `${year}-${String(monthNum).padStart(2, '0')}-${String(nextDay).padStart(2, '0')}T00:00:00Z`;

    vi.mocked(trainingService.getAll).mockResolvedValue([]);
    vi.mocked(competitionService.getAll).mockResolvedValue([]);
    vi.mocked(userService.getUpcomingBirthdays).mockResolvedValue([
      {
        usuarioId: 4,
        nombreCompleto: 'Mario Miembro',
        rol: 'MIEMBRO',
        mes: monthNum,
        dia: nextDay,
        proximaFecha: proxIso,
        diasFaltantes: 3,
      },
    ]);

    render(<CalendarPage />);

    await waitFor(() => {
      expect(screen.getByTestId('calendar-birthday-notice')).toBeInTheDocument();
    });

    expect(screen.getByText('Aviso de Próximos Cumpleaños')).toBeInTheDocument();
    expect(screen.getByText('En 3 días')).toBeInTheDocument();
    expect(screen.getAllByText('Cumpleaños: Mario Miembro').length).toBeGreaterThan(0);

    // Al hacer clic en el aviso enfoca ese día en la agenda diaria
    fireEvent.click(
      within(screen.getByTestId('calendar-birthday-notice')).getByRole('button', {
        name: /Mario Miembro/i,
      })
    );
    expect(screen.getAllByText('Cumpleaños: Mario Miembro').length).toBeGreaterThanOrEqual(2);
  });
});
