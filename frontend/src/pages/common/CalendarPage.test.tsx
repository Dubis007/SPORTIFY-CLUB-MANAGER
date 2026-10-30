import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import CalendarPage from './CalendarPage';
import { trainingService } from '../../services/trainings/trainingService';
import { competitionService } from '../../services/competitions/competitionService';

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

describe('CalendarPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

    fireEvent.click(screen.getAllByText('Copa Departamental Otoño')[0]);

    const gcalLink = await screen.findByRole('link', {
      name: /Añadir a Google Calendar/i,
    });
    expect(gcalLink).toHaveAttribute(
      'href',
      expect.stringContaining('https://calendar.google.com/calendar/render?')
    );
  });
});
