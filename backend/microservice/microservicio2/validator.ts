import { z } from 'zod';

/**
 * Esquema Zod para filtros de rango de fechas
 */
export const DateRangeFilterSchema = z
  .object({
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}/, 'Formato de fecha inicial inválido (YYYY-MM-DD)')
      .optional(),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}/, 'Formato de fecha final inválido (YYYY-MM-DD)')
      .optional(),
    periodPreset: z
      .enum(['CURRENT_MONTH', 'LAST_QUARTER', 'YEAR_TO_DATE', 'ALL_TIME'])
      .default('ALL_TIME'),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate).getTime() <= new Date(data.endDate).getTime();
      }
      return true;
    },
    { message: 'La fecha inicial no puede ser posterior a la fecha final', path: ['startDate'] }
  );

/**
 * Esquema Zod para rangos financieros y estados de pago
 */
export const FinancialRangeSchema = z
  .object({
    minAmount: z.number().nonnegative('El monto mínimo no puede ser negativo').default(0),
    maxAmount: z.number().positive('El monto máximo debe ser positivo').optional(),
    currency: z.enum(['COP', 'USD']).default('COP'),
    paymentStatus: z
      .enum(['ALL', 'APROBADO', 'PENDIENTE', 'RECHAZADO'])
      .default('ALL'),
  })
  .refine(
    (data) => (data.maxAmount !== undefined ? data.maxAmount >= data.minAmount : true),
    { message: 'El monto máximo debe ser mayor o igual al monto mínimo', path: ['maxAmount'] }
  );

/**
 * Esquema Zod para filtros de membresías
 */
export const MembershipFilterSchema = z.object({
  membershipIds: z.array(z.number().int().positive()).optional(),
  membershipStatus: z
    .enum(['ALL', 'ACTIVA', 'PENDIENTE', 'VENCIDA', 'CANCELADA'])
    .default('ALL'),
});

/**
 * Esquema Zod para parámetros de exportación e integración con QuestPDF / Dashboard ERP
 */
export const ExportParamsSchema = z.object({
  format: z.enum(['JSON', 'QUESTPDF_PAYLOAD', 'EXECUTIVE_SUMMARY']).default('JSON'),
  includeBreakdown: z.boolean().default(true),
  includeProjections: z.boolean().default(true),
  requestedByRole: z
    .enum(['ADMIN', 'CONTADOR', 'ENTRENADOR', 'MIEMBRO'])
    .default('ADMIN'),
});

/**
 * Esquema Zod consolidado para el endpoint /reports/aggregate
 */
export const ReportAggregateRequestSchema = z.object({
  dateRange: DateRangeFilterSchema.default({ periodPreset: 'ALL_TIME' }),
  financialRange: FinancialRangeSchema.default({
    minAmount: 0,
    currency: 'COP',
    paymentStatus: 'ALL',
  }),
  membershipFilter: MembershipFilterSchema.default({ membershipStatus: 'ALL' }),
  exportParams: ExportParamsSchema.default({
    format: 'JSON',
    includeBreakdown: true,
    includeProjections: true,
    requestedByRole: 'ADMIN',
  }),
  rawPayments: z
    .array(
      z.object({
        id: z.number(),
        membresiaId: z.number(),
        monto: z.number(),
        estado: z.string(),
        fechaPago: z.string().optional(),
        concepto: z.string().optional(),
      })
    )
    .optional(),
  rawMemberships: z
    .array(
      z.object({
        id: z.number(),
        estado: z.string(),
        precio: z.number().optional(),
      })
    )
    .optional(),
});

/**
 * Esquema Zod para consultas rápidas de KPIs en /reports/kpis
 */
export const KpiQuerySchema = z.object({
  role: z.enum(['ADMIN', 'CONTADOR', 'ENTRENADOR', 'MIEMBRO']).default('ADMIN'),
  currency: z.enum(['COP', 'USD']).default('COP'),
  includeTrends: z.coerce.boolean().default(true),
});

export type ReportAggregateRequest = z.infer<typeof ReportAggregateRequestSchema>;
export type KpiQueryInput = z.infer<typeof KpiQuerySchema>;
