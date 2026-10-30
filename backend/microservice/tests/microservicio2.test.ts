import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  processAnalyticalAggregation,
  computeExecutiveKpis,
  getReportingHealth,
} from '../microservicio2/microservicio.js';
import {
  DateRangeFilterSchema,
  FinancialRangeSchema,
} from '../microservicio2/validator.js';

describe('Microservicio 2 — Agregación Analítica, KPIs Ejecutivos y Validación Zod', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('sincroniza métricas reales desde GET /api/dashboard/metrics (CORE_API_LIVE)', async () => {
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({
          miembrosActivos: 10,
          membresiasVencidas: 2,
          membresiasPendientes: 0,
          ingresosTotalesAprobados: 1200000,
          pagosPendientesRevision: 1,
          entrenamientosProgramados: 8,
          competenciasActivas: 2,
          tasaAsistenciaPromedio: 91.4,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )) as typeof fetch;

    const report = await processAnalyticalAggregation(
      {
        dateRange: { periodPreset: 'CURRENT_MONTH' },
        exportParams: { format: 'QUESTPDF_PAYLOAD', includeBreakdown: true, requestedByRole: 'ADMIN' },
      },
      'Bearer test-jwt-token'
    );

    assert.equal(report.dataSource, 'CORE_API_LIVE');
    assert.equal(report.financialSummary.approvedRevenue, 1200000);
    assert.equal(report.membershipSummary.totalMemberships, 12);
    assert.equal(report.membershipSummary.retentionRatePct, 83.3);
    assert.equal(report.sportsOperations.averageAttendancePct, 91.4);
    assert.equal(report.monthlySeries.length, 6);
    assert.equal(report.questPdfMetadata.readyForQuestPdf, true);
  });

  it('protege cálculos de KPIs y retención contra división 0/0 cuando hay 0 miembros (VID2-RNF-005)', async () => {
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({
          miembrosActivos: 0,
          membresiasVencidas: 0,
          membresiasPendientes: 0,
          ingresosTotalesAprobados: 0,
          pagosPendientesRevision: 0,
          entrenamientosProgramados: 0,
          competenciasActivas: 0,
          tasaAsistenciaPromedio: 0,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )) as typeof fetch;

    const kpis = await computeExecutiveKpis({
      role: 'ADMIN',
      currency: 'COP',
      includeTrends: false,
    });

    assert.equal(kpis.source, 'CORE_API_LIVE');
    assert.equal(kpis.kpis.tasaRetencionMiembros, 0);
    assert.equal(kpis.kpis.ingresoPromedioPorMiembro, 0);
    assert.equal(kpis.kpis.tasaAsistenciaDeportiva, 0);
    assert.equal(kpis.trends, undefined);
  });

  it('filtra pagos crudos por rango financiero, estado y membresías con fallback a caché si la API no responde', async () => {
    globalThis.fetch = (async () => {
      throw new Error('Core API offline');
    }) as typeof fetch;

    const report = await processAnalyticalAggregation({
      financialRange: { minAmount: 100000, maxAmount: 200000, paymentStatus: 'ALL', currency: 'COP' },
      membershipFilter: { membershipIds: [10, 20], membershipStatus: 'ALL' },
      rawPayments: [
        { id: 1, membresiaId: 10, monto: 120000, estado: 'APROBADO' },
        { id: 2, membresiaId: 20, monto: 150000, estado: 'PENDIENTE' },
        { id: 3, membresiaId: 99, monto: 180000, estado: 'APROBADO' }, // Excluido por membershipIds
        { id: 4, membresiaId: 10, monto: 50000, estado: 'APROBADO' }, // Excluido por minAmount
      ],
    });

    assert.equal(report.dataSource, 'ANALYTICAL_CACHE');
    assert.equal(report.financialSummary.approvedRevenue, 120000);
    assert.equal(report.financialSummary.pendingPaymentsCount, 1);
  });

  it('rechaza rangos de fecha o montos inconsistentes mediante refinamientos Zod', () => {
    assert.throws(() =>
      DateRangeFilterSchema.parse({
        startDate: '2026-12-31',
        endDate: '2026-01-01',
      })
    );
    assert.throws(() =>
      FinancialRangeSchema.parse({
        minAmount: 500000,
        maxAmount: 100000,
      })
    );

    const health = getReportingHealth();
    assert.equal(health.status, 'Healthy');
  });
});
