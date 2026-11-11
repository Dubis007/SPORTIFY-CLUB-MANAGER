import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useMemberViewModel } from './useMemberViewModel';
import { memberService } from '../services/members/memberService';

vi.mock('../services/members/memberService', () => ({
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

vi.mock('../services/api/paymentService', () => ({
  paymentService: { create: vi.fn(), uploadReceipt: vi.fn() },
}));

const activeMembership = {
  id: 1,
  plan: 'Plan Premium',
  estado: 'ACTIVA',
  fechaInicio: '2026-11-01T00:00:00',
  fechaFin: '2026-12-01T00:00:00',
};

const pendingInvitation = {
  inscripcionId: 7,
  competenciaId: 9,
  nombre: 'Copa Regional',
  fechaInicio: '2026-12-05T09:00:00',
  ubicacion: 'Coliseo Central',
  estadoInscripcion: 'PENDIENTE',
};

describe('useMemberViewModel — portal del deportista', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(memberService.getProfile).mockResolvedValue({ id: 4, nombre: 'Mario', apellido: 'Miembro' });
    // Mismo contrato camelCase que devuelve GET /api/members/me/payments
    vi.mocked(memberService.getPayments).mockResolvedValue({
      memberships: [activeMembership],
      payments: [{ id: 7, montoCOP: 120000, estado: 'APROBADO', fechaPago: '2026-11-01T00:00:00', plan: 'Plan Premium' }],
    });
    vi.mocked(memberService.getActivities).mockResolvedValue({
      upcomingTrainings: [],
      attendances: [],
      competitions: [pendingInvitation],
    });
  });

  it('carga las membresías y los pagos del socio', async () => {
    const { result } = renderHook(() => useMemberViewModel());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.paymentsData.memberships).toHaveLength(1);
    expect(result.current.paymentsData.memberships[0].plan).toBe('Plan Premium');
    expect(result.current.paymentsData.payments[0].montoCOP).toBe(120000);
  });

  it('cancela la membresía propia en el servidor y refresca los datos', async () => {
    vi.mocked(memberService.cancelMembership).mockResolvedValue({ id: 1, estado: 'SUSPENDIDA' });

    const { result } = renderHook(() => useMemberViewModel());
    await waitFor(() => expect(result.current.loading).toBe(false));

    vi.mocked(memberService.getPayments).mockResolvedValue({
      memberships: [{ ...activeMembership, estado: 'SUSPENDIDA' }],
      payments: [],
    });

    let ok = false;
    await act(async () => {
      ok = await result.current.cancelMembership(1);
    });

    expect(ok).toBe(true);
    expect(memberService.cancelMembership).toHaveBeenCalledWith(1);
    expect(result.current.paymentsData.memberships[0].estado).toBe('SUSPENDIDA');
    expect(result.current.error).toBeNull();
  });

  it('no simula éxito cuando el servidor rechaza la cancelación', async () => {
    vi.mocked(memberService.cancelMembership).mockRejectedValue({
      response: { status: 400, data: { message: 'Solo se pueden cancelar membresías activas o pendientes.' } },
    });

    const { result } = renderHook(() => useMemberViewModel());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let ok = true;
    await act(async () => {
      ok = await result.current.cancelMembership(1);
    });

    expect(ok).toBe(false);
    expect(result.current.paymentsData.memberships[0].estado).toBe('ACTIVA');
    expect(result.current.error).toBe('Solo se pueden cancelar membresías activas o pendientes.');
  });

  it('acepta una convocatoria propia y refresca las actividades', async () => {
    vi.mocked(memberService.acceptInvitation).mockResolvedValue({ id: 7, estado: 'CONFIRMADA' });

    const { result } = renderHook(() => useMemberViewModel());
    await waitFor(() => expect(result.current.loading).toBe(false));

    vi.mocked(memberService.getActivities).mockResolvedValue({
      upcomingTrainings: [],
      attendances: [],
      competitions: [{ ...pendingInvitation, estadoInscripcion: 'CONFIRMADA' }],
    });

    let ok = false;
    await act(async () => {
      ok = await result.current.respondToInvitation(7, true);
    });

    expect(ok).toBe(true);
    expect(memberService.acceptInvitation).toHaveBeenCalledWith(7);
    expect(memberService.declineInvitation).not.toHaveBeenCalled();
    expect(result.current.activitiesData.competitions[0].estadoInscripcion).toBe('CONFIRMADA');
  });

  it('rechaza una convocatoria propia', async () => {
    vi.mocked(memberService.declineInvitation).mockResolvedValue({ id: 7, estado: 'CANCELADA' });

    const { result } = renderHook(() => useMemberViewModel());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let ok = false;
    await act(async () => {
      ok = await result.current.respondToInvitation(7, false);
    });

    expect(ok).toBe(true);
    expect(memberService.declineInvitation).toHaveBeenCalledWith(7);
    expect(memberService.acceptInvitation).not.toHaveBeenCalled();
  });

  it('informa el motivo cuando no se puede aceptar la convocatoria (p. ej. sin membresía activa)', async () => {
    vi.mocked(memberService.acceptInvitation).mockRejectedValue({
      response: {
        status: 400,
        data: { message: 'Para aceptar la convocatoria necesitas una membresía activa (RN-03).' },
      },
    });

    const { result } = renderHook(() => useMemberViewModel());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let ok = true;
    await act(async () => {
      ok = await result.current.respondToInvitation(7, true);
    });

    expect(ok).toBe(false);
    expect(result.current.error).toBe('Para aceptar la convocatoria necesitas una membresía activa (RN-03).');
    expect(result.current.activitiesData.competitions[0].estadoInscripcion).toBe('PENDIENTE');
  });
});
