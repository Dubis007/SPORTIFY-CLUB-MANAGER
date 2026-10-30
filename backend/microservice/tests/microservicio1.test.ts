import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {
  verifyJwtToken,
  auditAndSanitizeSession,
  getAuthServiceTelemetry,
} from '../microservicio1/microservicio.js';
import { CredentialsSchema, TokenVerifyRequestSchema } from '../microservicio1/validator.js';

const DEFAULT_SECRET =
  process.env.JWT_SECRET ||
  'A_VERY_SECRET_KEY_THAT_NEEDS_TO_BE_AT_LEAST_32_CHARACTERS_LONG!';

function toBase64Url(input: string): string {
  return Buffer.from(input, 'utf8')
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function signTestJwt(payload: Record<string, unknown>, secret = DEFAULT_SECRET): string {
  const headerSeg = toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payloadSeg = toBase64Url(JSON.stringify(payload));
  const signingInput = `${headerSeg}.${payloadSeg}`;
  const sigSeg = crypto
    .createHmac('sha256', Buffer.from(secret, 'utf8'))
    .update(signingInput)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `${signingInput}.${sigSeg}`;
}

describe('Microservicio 1 — Validación JWT y Control de Sesiones Concurrentes', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ status: 'Healthy' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })) as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('valida firma HMAC-SHA256 y normaliza claims XML emitidos por ASP.NET Core', () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const token = signTestJwt({
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': '1',
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': 'admin@sportify.com',
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': 'admin',
      exp,
    });

    const result = verifyJwtToken({
      token,
      requiredRoles: ['ADMIN'],
      validateSignature: true,
    });

    assert.equal(result.valid, true);
    assert.equal(result.signatureVerified, true);
    assert.equal(result.expired, false);
    assert.equal(result.roleAuthorized, true);
    assert.equal(result.claims?.sub, '1');
    assert.equal(result.claims?.email, 'admin@sportify.com');
    assert.equal(result.claims?.role, 'ADMIN');
  });

  it('rechaza tokens con firma adulterada o expirados', () => {
    const validExp = Math.floor(Date.now() / 1000) + 3600;
    const tamperedToken = signTestJwt(
      { sub: '4', email: 'miembro@sportify.com', role: 'MIEMBRO', exp: validExp },
      'WRONG_SECRET_KEY_THAT_DOES_NOT_MATCH_SPORTIFY_API!'
    );

    const tamperedResult = verifyJwtToken({ token: tamperedToken, validateSignature: true });
    assert.equal(tamperedResult.valid, false);
    assert.equal(tamperedResult.signatureVerified, false);
    assert.match(tamperedResult.reason ?? '', /Firma HMAC-SHA256 inválida/);

    const expiredToken = signTestJwt({
      sub: '4',
      email: 'miembro@sportify.com',
      role: 'MIEMBRO',
      exp: Math.floor(Date.now() / 1000) - 60,
    });

    const expiredResult = verifyJwtToken({ token: expiredToken, validateSignature: true });
    assert.equal(expiredResult.valid, false);
    assert.equal(expiredResult.expired, true);
    assert.match(expiredResult.reason ?? '', /expirado/);
  });

  it('deniega acceso cuando el rol del token no pertenece a requiredRoles', () => {
    const token = signTestJwt({
      sub: '4',
      email: 'miembro@sportify.com',
      role: 'MIEMBRO',
      exp: Math.floor(Date.now() / 1000) + 1800,
    });

    const result = verifyJwtToken({
      token,
      requiredRoles: ['ADMIN', 'CONTADOR'],
      validateSignature: true,
    });

    assert.equal(result.valid, false);
    assert.equal(result.roleAuthorized, false);
    assert.match(result.reason ?? '', /no autorizado/);
  });

  it('sanea sesiones concurrentes revocando las excedentes cuando superan el límite (>2)', async () => {
    const userId = 'usr-concurrency-test';
    await auditAndSanitizeSession({
      userId,
      email: 'coach@sportify.com',
      role: 'ENTRENADOR',
      sessionId: 'sess_device_1',
      maxConcurrentSessions: 2,
      revokeStaleSessions: true,
    });
    await new Promise((resolve) => setTimeout(resolve, 10));

    await auditAndSanitizeSession({
      userId,
      email: 'coach@sportify.com',
      role: 'ENTRENADOR',
      sessionId: 'sess_device_2',
      maxConcurrentSessions: 2,
      revokeStaleSessions: true,
    });
    await new Promise((resolve) => setTimeout(resolve, 10));

    const thirdAudit = await auditAndSanitizeSession({
      userId,
      email: 'coach@sportify.com',
      role: 'ENTRENADOR',
      sessionId: 'sess_device_3',
      maxConcurrentSessions: 2,
      revokeStaleSessions: true,
    });

    assert.equal(thirdAudit.activeSessionCount, 2);
    assert.equal(thirdAudit.revokedSessionsCount, 1);
    assert.deepEqual(thirdAudit.revokedSessionIds, ['sess_device_1']);
    assert.equal(thirdAudit.coreApiReachable, true);

    const telemetry = getAuthServiceTelemetry();
    assert.equal(telemetry.status, 'Healthy');
    assert.ok(telemetry.totalActiveSessions >= 2);
  });

  it('valida esquemas Zod de credenciales y estructura JWT', () => {
    assert.throws(() =>
      CredentialsSchema.parse({ email: 'correo-invalido', password: '123' })
    );
    assert.throws(() =>
      TokenVerifyRequestSchema.parse({ token: 'segmento-sin-formato-jwt' })
    );
  });
});
