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
  },
}));

vi.mock('../services/api/paymentService', () => ({
  paymentService: { create: vi.fn(), uploadReceipt: vi.fn() },
}));

vi.mock('../services/competitions/competitionService', () => ({
  competitionService: { getAll: vi.fn().mockResolvedValue([]) },
}));

vi.mock('../services/registrations/registrationService', () => ({
  registrationService: { create: vi.fn() },
}));

const activeMembership = {
  id: 1,
  plan: 'Plan Premium',
  estado: 'ACTIVA',
  fechaInicio: '2026-11-01T00:00:00',
  fechaFin: '2026-12-01T00:00:00',
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
      competitions: [],
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
});
