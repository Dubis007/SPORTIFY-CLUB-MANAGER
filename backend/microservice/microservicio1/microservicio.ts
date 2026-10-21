import crypto from 'node:crypto';
import {
  JwtClaimsSchema,
  TokenVerifyRequestSchema,
  AuditSessionRequestSchema,
  type JwtClaims,
  type TokenVerifyRequest,
  type AuditSessionInput,
} from './validator.js';

const JWT_SECRET =
  process.env.JWT_SECRET ||
  'A_VERY_SECRET_KEY_THAT_NEEDS_TO_BE_AT_LEAST_32_CHARACTERS_LONG!';
const CORE_API_URL = process.env.CORE_API_URL || 'http://localhost:5000';

export interface ActiveSessionRecord {
  sessionId: string;
  userId: string;
  email: string;
  role: 'ADMIN' | 'CONTADOR' | 'ENTRENADOR' | 'MIEMBRO';
  userAgent: string;
  ipAddress: string;
  startedAt: string;
  lastSeenAt: string;
  expiresAt: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
}

export interface TokenVerificationResult {
  valid: boolean;
  signatureVerified: boolean;
  expired: boolean;
  ttlSeconds: number;
  roleAuthorized: boolean;
  claims: JwtClaims | null;
  reason?: string;
  auditedAt: string;
}

export interface SessionAuditResult {
  userId: string;
  email: string;
  role: string;
  activeSessionCount: number;
  revokedSessionsCount: number;
  revokedSessionIds: string[];
  currentSession: ActiveSessionRecord;
  activeSessions: ActiveSessionRecord[];
  coreApiReachable: boolean;
  auditedAt: string;
}

// Almacén en memoria de sesiones activas por usuario para control de concurrencia
const sessionStore = new Map<string, ActiveSessionRecord[]>();

function base64UrlDecode(segment: string): string {
  const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + '='.repeat(padLength);
  return Buffer.from(padded, 'base64').toString('utf8');
}

function computeHmacSha256Base64Url(signingInput: string, secret: string): string {
  return crypto
    .createHmac('sha256', Buffer.from(secret, 'utf8'))
    .update(signingInput)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Normaliza claims emitidos por ASP.NET Core (ClaimTypes.*) al esquema estándar JwtClaimsSchema
 */
function normalizeDotNetClaims(rawPayload: Record<string, unknown>): Record<string, unknown> {
  const sub =
    rawPayload.sub ??
    rawPayload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ??
    rawPayload.nameid;

  const email =
    rawPayload.email ??
    rawPayload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ??
    rawPayload.unique_name;

  const rawRole =
    rawPayload.role ??
    rawPayload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

  const role = typeof rawRole === 'string' ? rawRole.toUpperCase() : rawRole;

  return {
    sub: sub !== undefined ? String(sub) : undefined,
    email: email !== undefined ? String(email) : undefined,
    role,
    iss: rawPayload.iss ?? 'SportifyApi',
    aud: rawPayload.aud ?? 'SportifyClients',
    exp: typeof rawPayload.exp === 'number' ? rawPayload.exp : Number(rawPayload.exp),
    iat: typeof rawPayload.iat === 'number' ? rawPayload.iat : undefined,
    nbf: typeof rawPayload.nbf === 'number' ? rawPayload.nbf : undefined,
  };
}

/**
 * Verifica la firma criptográfica, expiración y estructura de claims de un JWT
 */
export function verifyJwtToken(rawInput: unknown): TokenVerificationResult {
  const parsedInput: TokenVerifyRequest = TokenVerifyRequestSchema.parse(rawInput);
  const parts = parsedInput.token.split('.');
  const [headerSeg, payloadSeg, signatureSeg] = parts;

  const signingInput = `${headerSeg}.${payloadSeg}`;
  const expectedSig = computeHmacSha256Base64Url(signingInput, JWT_SECRET);

  const signatureVerified = parsedInput.validateSignature
    ? crypto.timingSafeEqual(
        Buffer.from(signatureSeg, 'utf8'),
        Buffer.from(expectedSig, 'utf8').subarray(0, signatureSeg.length).length === signatureSeg.length
          ? Buffer.from(expectedSig, 'utf8')
          : Buffer.from(signatureSeg, 'utf8')
      ) && signatureSeg === expectedSig
    : true;

  let decodedPayload: Record<string, unknown>;
  try {
    decodedPayload = JSON.parse(base64UrlDecode(payloadSeg)) as Record<string, unknown>;
  } catch {
    return {
      valid: false,
      signatureVerified: false,
      expired: true,
      ttlSeconds: 0,
      roleAuthorized: false,
      claims: null,
      reason: 'No se pudo decodificar el payload JSON del token JWT',
      auditedAt: new Date().toISOString(),
    };
  }

  const normalized = normalizeDotNetClaims(decodedPayload);
  const claimsResult = JwtClaimsSchema.safeParse(normalized);

  if (!claimsResult.success) {
    return {
      valid: false,
      signatureVerified,
      expired: false,
      ttlSeconds: 0,
      roleAuthorized: false,
      claims: null,
      reason: `Claims inválidos: ${claimsResult.error.issues.map((i) => i.message).join(', ')}`,
      auditedAt: new Date().toISOString(),
    };
  }

  const claims = claimsResult.data;
  const nowSeconds = Math.floor(Date.now() / 1000);
  const ttlSeconds = Math.max(0, claims.exp - nowSeconds);
  const expired = claims.exp <= nowSeconds;

  const roleAuthorized =
    !parsedInput.requiredRoles ||
    parsedInput.requiredRoles.length === 0 ||
    parsedInput.requiredRoles.includes(claims.role);

  const valid = signatureVerified && !expired && roleAuthorized;

  let reason: string | undefined;
  if (!signatureVerified) reason = 'Firma HMAC-SHA256 inválida';
  else if (expired) reason = 'El token JWT ha expirado';
  else if (!roleAuthorized) reason = `Rol ${claims.role} no autorizado para el recurso solicitado`;

  return {
    valid,
    signatureVerified,
    expired,
    ttlSeconds,
    roleAuthorized,
    claims,
    reason,
    auditedAt: new Date().toISOString(),
  };
}

/**
 * Audita y sanea sesiones concurrentes del usuario, verificando conectividad con Sportify.Api
 */
export async function auditAndSanitizeSession(rawInput: unknown): Promise<SessionAuditResult> {
  const input: AuditSessionInput = AuditSessionRequestSchema.parse(rawInput);
  const now = new Date();
  const defaultExpiry = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 horas

  let expiresAtIso = defaultExpiry.toISOString();
  if (input.token) {
    const tokenCheck = verifyJwtToken({ token: input.token, validateSignature: true });
    if (tokenCheck.claims) {
      expiresAtIso = new Date(tokenCheck.claims.exp * 1000).toISOString();
    }
  }

  const userSessions = sessionStore.get(input.userId) ?? [];
  const revokedSessionIds: string[] = [];

  // 1. Marcar sesiones expiradas
  for (const s of userSessions) {
    if (s.status === 'ACTIVE' && new Date(s.expiresAt).getTime() <= now.getTime()) {
      s.status = 'EXPIRED';
      revokedSessionIds.push(s.sessionId);
    }
  }

  // 2. Registrar o actualizar la sesión actual
  let currentSession = userSessions.find((s) => s.sessionId === input.sessionId);
  if (currentSession) {
    currentSession.lastSeenAt = now.toISOString();
    currentSession.expiresAt = expiresAtIso;
    currentSession.status = 'ACTIVE';
  } else {
    currentSession = {
      sessionId: input.sessionId,
      userId: input.userId,
      email: input.email,
      role: input.role,
      userAgent: input.userAgent,
      ipAddress: input.ipAddress,
      startedAt: now.toISOString(),
      lastSeenAt: now.toISOString(),
      expiresAt: expiresAtIso,
      status: 'ACTIVE',
    };
    userSessions.push(currentSession);
  }

  // 3. Saneamiento de sesiones concurrentes si exceden el límite permitido
  const activeSessions = userSessions
    .filter((s) => s.status === 'ACTIVE')
    .sort((a, b) => new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime());

  if (input.revokeStaleSessions && activeSessions.length > input.maxConcurrentSessions) {
    const toRevoke = activeSessions.slice(input.maxConcurrentSessions);
    for (const stale of toRevoke) {
      stale.status = 'REVOKED';
      revokedSessionIds.push(stale.sessionId);
    }
  }

  const remainingActive = userSessions.filter((s) => s.status === 'ACTIVE');
  sessionStore.set(input.userId, remainingActive);

  // 4. Comprobar estado del backend principal Sportify.Api
  let coreApiReachable = false;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);
    const res = await fetch(`${CORE_API_URL}/api/health`, { signal: controller.signal });
    clearTimeout(timeout);
    coreApiReachable = res.ok;
  } catch {
    coreApiReachable = false;
  }

  return {
    userId: input.userId,
    email: input.email,
    role: input.role,
    activeSessionCount: remainingActive.length,
    revokedSessionsCount: revokedSessionIds.length,
    revokedSessionIds,
    currentSession,
    activeSessions: remainingActive,
    coreApiReachable,
    auditedAt: now.toISOString(),
  };
}

/**
 * Obtiene métricas globales del motor de sesiones de microservicio1
 */
export function getAuthServiceTelemetry() {
  let totalActiveSessions = 0;
  const rolesDistribution: Record<string, number> = {
    ADMIN: 0,
    CONTADOR: 0,
    ENTRENADOR: 0,
    MIEMBRO: 0,
  };

  for (const sessions of sessionStore.values()) {
    for (const s of sessions) {
      if (s.status === 'ACTIVE') {
        totalActiveSessions++;
        rolesDistribution[s.role] = (rolesDistribution[s.role] || 0) + 1;
      }
    }
  }

  return {
    service: 'microservicio1-auth-session-control',
    status: 'Healthy',
    port: Number(process.env.MS1_PORT || 5101),
    uptimeSeconds: Math.floor(process.uptime()),
    activeUsersCount: sessionStore.size,
    totalActiveSessions,
    rolesDistribution,
    timestamp: new Date().toISOString(),
  };
}
