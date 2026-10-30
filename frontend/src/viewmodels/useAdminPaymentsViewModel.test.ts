import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useAdminPaymentsViewModel } from './useAdminPaymentsViewModel';
import { paymentService } from '../services/api/paymentService';
import { Payment } from '../models';

vi.mock('../services/api/paymentService', () => ({
  paymentService: {
    getAll: vi.fn(),
    getSummary: vi.fn(),
    getOptions: vi.fn(),
    approve: vi.fn(),
    reject: vi.fn(),
    registerManual: vi.fn(),
    downloadReceiptAttachment: vi.fn(),
    getPaymentVoucherBlobUrl: vi.fn(),
    downloadPaymentsReport: vi.fn(),
  },
}));

const samplePayments: Payment[] = [
  {
    id: 101,
    usuarioId: 4,
    nombreUsuario: 'Mario Miembro',
    montoCOP: 120000,
    estado: 'PENDIENTE',
    fechaPago: '2026-10-15T10:00:00Z',
    tieneComprobante: true,
    comprobanteUrl: '/comprobantes/receipts/p101.pdf',
  },
  {
    id: 102,
    usuarioId: 5,
    nombreUsuario: 'Laura Deportista',
    montoCOP: 50000,
    estado: 'APROBADO',
    fechaPago: '2026-10-16T10:00:00Z',
    tieneComprobante: false,
  },
];

describe('useAdminPaymentsViewModel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(paymentService.getAll).mockResolvedValue({
      items: samplePayments,
      page: 1,
      pageSize: 10,
      totalCount: 2,
      totalPages: 1,
    });
    vi.mocked(paymentService.getSummary).mockResolvedValue({
      pendientes: 1,
      totalAprobadoCOP: 50000,
    });
    vi.mocked(paymentService.getOptions).mockResolvedValue({
      Members: [{ id: 4, nombre: 'Mario', apellido: 'Miembro' }],
      Memberships: [{ id: 1, usuarioId: 4, plan: 'Premium', estado: 'ACTIVA' }],
    });
  });

  it('carga pagos, resumen financiero y opciones iniciales', async () => {
    const { result } = renderHook(() => useAdminPaymentsViewModel());

    await waitFor(() => {
      expect(result.current.payments).toHaveLength(2);
    });

    expect(result.current.summary.pendientes).toBe(1);
    expect(result.current.summary.totalAprobadoCOP).toBe(50000);
    expect(result.current.options.Members).toHaveLength(1);
  });

  it('filtra pagos por estado y término de búsqueda', async () => {
    const { result } = renderHook(() => useAdminPaymentsViewModel());
    await waitFor(() => expect(result.current.payments).toHaveLength(2));

    act(() => {
      result.current.setStatusFilter('PENDIENTE');
    });
    expect(result.current.filteredPayments).toHaveLength(1);
    expect(result.current.filteredPayments[0].id).toBe(101);

    act(() => {
      result.current.setStatusFilter('TODOS');
      result.current.setSearchTerm('laura');
    });
    expect(result.current.filteredPayments).toHaveLength(1);
    expect(result.current.filteredPayments[0].id).toBe(102);
  });

  it('aprueba y rechaza pagos actualizando la lista y el resumen', async () => {
    vi.mocked(paymentService.approve).mockResolvedValue({
      ...samplePayments[0],
      estado: 'APROBADO',
    });
    vi.mocked(paymentService.reject).mockResolvedValue({
      ...samplePayments[0],
      estado: 'RECHAZADO',
      comentarioRechazo: 'Comprobante ilegible en revisión',
    });

    const { result } = renderHook(() => useAdminPaymentsViewModel());
    await waitFor(() => expect(result.current.payments).toHaveLength(2));

    let approved = false;
    await act(async () => {
      approved = await result.current.approvePayment(101);
    });
    expect(approved).toBe(true);
    expect(result.current.payments.find((p) => p.id === 101)?.estado).toBe('APROBADO');

    let rejected = false;
    await act(async () => {
      rejected = await result.current.rejectPayment(101, 'Comprobante ilegible en revisión');
    });
    expect(rejected).toBe(true);
    expect(result.current.payments.find((p) => p.id === 101)?.estado).toBe('RECHAZADO');
  });
});
