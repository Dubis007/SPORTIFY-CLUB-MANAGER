import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import toast from 'react-hot-toast';
import MemberDashboard from './MemberDashboard';
import { memberService } from '../../services/members/memberService';

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('../../services/members/memberService', () => ({
  memberService: {
    getProfile: vi.fn(),
    getPayments: vi.fn(),
    getActivities: vi.fn(),
    changePassword: vi.fn(),
    updateBirthDate: vi.fn(),
    cancelMembership: vi.fn(),
    acceptInvitation: vi.fn(),
    declineInvitation: vi.fn(),
  },
}));

vi.mock('../../services/api/paymentService', () => ({
  paymentService: { create: vi.fn(), uploadReceipt: vi.fn() },
}));

const renderAt = (tab: string) =>
  render(
    <MemoryRouter initialEntries={[`/member/dashboard?tab=${tab}`]}>
      <MemberDashboard />
    </MemoryRouter>
  );

describe('MemberDashboard — membresías y pagos del deportista', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(memberService.getProfile).mockResolvedValue({
      id: 4,
      nombre: 'Mario',
      apellido: 'Miembro',
      correo: 'miembro@sportify.com',
      activo: true,
    });
    // Mismo contrato camelCase que devuelve la API real
    vi.mocked(memberService.getPayments).mockResolvedValue({
      memberships: [
        { id: 1, plan: 'Plan Premium', estado: 'ACTIVA', fechaInicio: '2026-11-01T00:00:00', fechaFin: '2026-12-01T00:00:00' },
      ],
      payments: [
        { id: 7, montoCOP: 120000, estado: 'APROBADO', fechaPago: '2026-11-01T00:00:00', plan: 'Plan Premium' },
      ],
    });
    vi.mocked(memberService.getActivities).mockResolvedValue({
      upcomingTrainings: [],
      attendances: [],
      competitions: [
        {
          inscripcionId: 7,
          competenciaId: 9,
          nombre: 'Copa Regional',
          fechaInicio: '2026-12-05T09:00:00',
          ubicacion: 'Coliseo Central',
          estadoInscripcion: 'PENDIENTE',
        },
        {
          inscripcionId: 3,
          competenciaId: 2,
          nombre: 'Torneo Relámpago',
          fechaInicio: '2026-11-16T09:00:00',
          ubicacion: 'Sede Principal Norte',
          estadoInscripcion: 'CONFIRMADA',
        },
      ],
    });
  });

  it('muestra la membresía vigente con sus acciones y el historial de pagos', async () => {
    renderAt('membresias');

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Plan Premium' })).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Subir Comprobante de Pago/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancelar Membresía/ })).toBeInTheDocument();
    expect(screen.getByText(/120\.000 COP/)).toBeInTheDocument();
  });

  it('cancela la membresía tras confirmar y avisa solo cuando el servidor lo acepta', async () => {
    vi.mocked(memberService.cancelMembership).mockResolvedValue({ id: 1, estado: 'SUSPENDIDA' });
    renderAt('membresias');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Cancelar Membresía/ })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Cancelar Membresía/ }));
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(memberService.cancelMembership).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar baja' }));

    await waitFor(() => {
      expect(memberService.cancelMembership).toHaveBeenCalledWith(1);
    });
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Membresía cancelada correctamente.');
    });
  });

  it('informa el motivo cuando el servidor rechaza la cancelación', async () => {
    vi.mocked(memberService.cancelMembership).mockRejectedValue({
      response: { status: 400, data: { message: 'Solo se pueden cancelar membresías activas o pendientes.' } },
    });
    renderAt('membresias');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Cancelar Membresía/ })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Cancelar Membresía/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar baja' }));

    await waitFor(() => {
      expect(screen.getByText('Solo se pueden cancelar membresías activas o pendientes.')).toBeInTheDocument();
    });
    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
  });

  it('separa las convocatorias pendientes de las competencias ya inscritas', async () => {
    renderAt('actividades');

    const pending = await screen.findByTestId('member-pending-invitations');
    expect(within(pending).getByText('Copa Regional')).toBeInTheDocument();
    expect(within(pending).queryByText('Torneo Relámpago')).not.toBeInTheDocument();
    expect(within(pending).getByRole('button', { name: 'Aceptar convocatoria a Copa Regional' })).toBeInTheDocument();
    expect(within(pending).getByRole('button', { name: 'Rechazar convocatoria a Copa Regional' })).toBeInTheDocument();

    // La autoinscripción directa ya no existe: el deportista solo responde convocatorias.
    expect(screen.queryByRole('button', { name: /Inscribirse a Competencia/ })).not.toBeInTheDocument();
    expect(screen.getByText('Torneo Relámpago')).toBeInTheDocument();
  });

  it('acepta una convocatoria y confirma la inscripción', async () => {
    vi.mocked(memberService.acceptInvitation).mockResolvedValue({ id: 7, estado: 'CONFIRMADA' });
    renderAt('actividades');

    fireEvent.click(await screen.findByRole('button', { name: 'Aceptar convocatoria a Copa Regional' }));

    await waitFor(() => {
      expect(memberService.acceptInvitation).toHaveBeenCalledWith(7);
    });
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Convocatoria aceptada: quedaste inscrito en Copa Regional.');
    });
  });

  it('pide confirmación antes de rechazar una convocatoria', async () => {
    vi.mocked(memberService.declineInvitation).mockResolvedValue({ id: 7, estado: 'CANCELADA' });
    renderAt('actividades');

    fireEvent.click(await screen.findByRole('button', { name: 'Rechazar convocatoria a Copa Regional' }));
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(memberService.declineInvitation).not.toHaveBeenCalled();

    fireEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Rechazar convocatoria' }));

    await waitFor(() => {
      expect(memberService.declineInvitation).toHaveBeenCalledWith(7);
    });
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Convocatoria rechazada.');
    });
  });
});
