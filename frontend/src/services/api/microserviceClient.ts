import axios from 'axios';

const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env;
const MS1_BASE_URL = metaEnv?.VITE_MS1_AUTH_URL || 'http://localhost:5101';
const MS2_BASE_URL = metaEnv?.VITE_MS2_REPORTS_URL || 'http://localhost:5102';
const CORE_API_URL = metaEnv?.VITE_API_URL || 'http://localhost:5000/api';

export interface MicroserviceHealthStatus {
  coreApi: { online: boolean; status: string; latencyMs: number };
  ms1Auth: { online: boolean; status: string; activeSessions: number; port: number };
  ms2Reports: { online: boolean; status: string; engine: string; port: number };
  checkedAt: string;
}

export interface TokenVerifyResponse {
  valid: boolean;
  signatureVerified: boolean;
  expired: boolean;
  ttlSeconds: number;
  roleAuthorized: boolean;
  claims: {
    sub: string;
    email: string;
    role: 'ADMIN' | 'CONTADOR' | 'ENTRENADOR' | 'MIEMBRO';
    exp: number;
  } | null;
  reason?: string;
  auditedAt: string;
}

export interface SessionAuditResponse {
  userId: string;
  email: string;
  role: string;
  activeSessionCount: number;
  revokedSessionsCount: number;
  revokedSessionIds: string[];
  coreApiReachable: boolean;
  auditedAt: string;
}

export interface AnalyticalAggregateResponse {
  reportId: string;
  generatedAt: string;
  dataSource: 'CORE_API_LIVE' | 'ANALYTICAL_CACHE';
  financialSummary: {
    currency: string;
    approvedRevenue: number;
    pendingPaymentsCount: number;
    rejectedPaymentsCount: number;
    estimatedPendingRevenue: number;
    projectedMonthlyRevenue: number;
    collectionEfficiencyPct: number;
  };
  membershipSummary: {
    totalMemberships: number;
    activeCount: number;
    expiredCount: number;
    pendingCount: number;
    retentionRatePct: number;
  };
  sportsOperations: {
    scheduledTrainings: number;
    activeCompetitions: number;
    averageAttendancePct: number;
  };
  monthlySeries: Array<{
    mes: string;
    recaudado: number;
    proyectado: number;
    asistencia: number;
  }>;
  questPdfMetadata: {
    documentTitle: string;
    issuer: string;
    readyForQuestPdf: boolean;
  };
}

export interface ExecutiveKpiResponse {
  service: string;
  source: string;
  roleContext: string;
  currency: string;
  generatedAt: string;
  kpis: {
    ingresosAprobados: number;
    ingresoPromedioPorMiembro: number;
    tasaRetencionMiembros: number;
    tasaAsistenciaDeportiva: number;
    pagosEnColaAuditoria: number;
    indiceSaludFinanciera: 'OPTIMO' | 'ATENCION_REQUERIDA';
  };
  trends?: {
    ingresosMoM: string;
    retencionMoM: string;
    asistenciaMoM: string;
  };
}

export const microserviceClient = {
  /**
   * Consulta el estado de salud de los 3 nodos del ecosistema (API .NET + MS1 Auth + MS2 Reports)
   */
  async checkEcosystemHealth(): Promise<MicroserviceHealthStatus> {
    const startCore = performance.now();
    const [coreRes, ms1Res, ms2Res] = await Promise.allSettled([
      axios.get(`${CORE_API_URL}/health`, { timeout: 2000 }),
      axios.get(`${MS1_BASE_URL}/health`, { timeout: 2000 }),
      axios.get(`${MS2_BASE_URL}/health`, { timeout: 2000 }),
    ]);
    const latencyMs = Math.round(performance.now() - startCore);

    return {
      coreApi: {
        online: coreRes.status === 'fulfilled',
        status: coreRes.status === 'fulfilled' ? (coreRes.value.data?.status || 'Healthy') : 'Offline',
        latencyMs,
      },
      ms1Auth: {
        online: ms1Res.status === 'fulfilled',
        status: ms1Res.status === 'fulfilled' ? (ms1Res.value.data?.status || 'Healthy') : 'Offline',
        activeSessions:
          ms1Res.status === 'fulfilled' ? Number(ms1Res.value.data?.totalActiveSessions ?? 0) : 0,
        port: 5101,
      },
      ms2Reports: {
        online: ms2Res.status === 'fulfilled',
        status: ms2Res.status === 'fulfilled' ? (ms2Res.value.data?.status || 'Healthy') : 'Offline',
        engine:
          ms2Res.status === 'fulfilled'
            ? String(ms2Res.value.data?.engine ?? 'Zod + Async Aggregator')
            : 'Offline',
        port: 5102,
      },
      checkedAt: new Date().toISOString(),
    };
  },

  /**
   * MS1 (:5101) - Verifica firma criptográfica y vigencia de un token JWT
   */
  async verifyToken(token: string, requiredRoles?: string[]): Promise<TokenVerifyResponse | null> {
    try {
      const response = await axios.post<TokenVerifyResponse>(
        `${MS1_BASE_URL}/auth/verify`,
        { token, requiredRoles, validateSignature: true },
        { timeout: 2500 }
      );
      return response.data;
    } catch {
      return null;
    }
  },

  /**
   * MS1 (:5101) - Audita y sanea sesiones concurrentes del usuario autenticado
   */
  async auditSession(payload: {
    userId: string;
    email: string;
    role: 'ADMIN' | 'CONTADOR' | 'ENTRENADOR' | 'MIEMBRO';
    token?: string;
  }): Promise<SessionAuditResponse | null> {
    try {
      const sessionId =
        sessionStorage.getItem('sportify_session_id') ||
        `sess_${payload.userId}_${Date.now().toString(36)}`;
      sessionStorage.setItem('sportify_session_id', sessionId);

      const response = await axios.post<SessionAuditResponse>(
        `${MS1_BASE_URL}/auth/audit-session`,
        {
          ...payload,
          sessionId,
          userAgent: navigator.userAgent,
          maxConcurrentSessions: 2,
          revokeStaleSessions: true,
        },
        {
          headers: payload.token ? { Authorization: `Bearer ${payload.token}` } : undefined,
          timeout: 2500,
        }
      );
      return response.data;
    } catch {
      return null;
    }
  },

  /**
   * MS2 (:5102) - Obtiene agregación analítica financiera y operativa validada con Zod
   */
  async getAnalyticalAggregation(params?: {
    periodPreset?: 'CURRENT_MONTH' | 'LAST_QUARTER' | 'YEAR_TO_DATE' | 'ALL_TIME';
    paymentStatus?: 'ALL' | 'APROBADO' | 'PENDIENTE' | 'RECHAZADO';
    requestedByRole?: 'ADMIN' | 'CONTADOR' | 'ENTRENADOR' | 'MIEMBRO';
    rawPayments?: Array<{
      id: number;
      membresiaId: number;
      monto: number;
      estado: string;
      fechaPago?: string;
      concepto?: string;
    }>;
  }): Promise<AnalyticalAggregateResponse | null> {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('sportify_token');
      const response = await axios.post<AnalyticalAggregateResponse>(
        `${MS2_BASE_URL}/reports/aggregate`,
        {
          dateRange: { periodPreset: params?.periodPreset || 'ALL_TIME' },
          financialRange: {
            minAmount: 0,
            currency: 'COP',
            paymentStatus: params?.paymentStatus || 'ALL',
          },
          exportParams: {
            format: 'JSON',
            includeBreakdown: true,
            includeProjections: true,
            requestedByRole: params?.requestedByRole || 'ADMIN',
          },
          rawPayments: params?.rawPayments,
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          timeout: 3000,
        }
      );
      return response.data;
    } catch {
      return null;
    }
  },

  /**
   * MS2 (:5102) - Obtiene KPIs ejecutivos procesados asíncronamente
   */
  async getExecutiveKpis(
    role: 'ADMIN' | 'CONTADOR' | 'ENTRENADOR' | 'MIEMBRO' = 'ADMIN'
  ): Promise<ExecutiveKpiResponse | null> {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('sportify_token');
      const response = await axios.get<ExecutiveKpiResponse>(`${MS2_BASE_URL}/reports/kpis`, {
        params: { role, currency: 'COP', includeTrends: true },
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        timeout: 2500,
      });
      return response.data;
    } catch {
      return null;
    }
  },
};
