import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearStoredCsrfToken,
  getStoredCsrfToken,
  isJwtTokenValid,
  isStateChangingMethod,
  setStoredCsrfToken,
} from './csrfTokenManager';

function buildFakeJwt(expOffsetSeconds: number): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: '4',
      role: 'MIEMBRO',
      exp: Math.floor(Date.now() / 1000) + expOffsetSeconds,
    })
  );
  return `${header}.${payload}.signature`;
}

describe('csrfTokenManager y validación de JWT en cliente', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('almacena, recupera y limpia el token CSRF correctamente', () => {
    expect(getStoredCsrfToken()).toBeNull();
    setStoredCsrfToken('csrf-payload.hmac-sig');
    expect(getStoredCsrfToken()).toBe('csrf-payload.hmac-sig');
    clearStoredCsrfToken();
    expect(getStoredCsrfToken()).toBeNull();
  });

  it('identifica métodos HTTP mutadores que requieren encabezado X-CSRF-TOKEN', () => {
    expect(isStateChangingMethod('POST')).toBe(true);
    expect(isStateChangingMethod('put')).toBe(true);
    expect(isStateChangingMethod('PATCH')).toBe(true);
    expect(isStateChangingMethod('delete')).toBe(true);
    expect(isStateChangingMethod('GET')).toBe(false);
  });

  it('valida la vigencia (exp) y estructura de tokens JWT', () => {
    const activeJwt = buildFakeJwt(3600);
    const expiredJwt = buildFakeJwt(-120);

    expect(isJwtTokenValid(activeJwt)).toBe(true);
    expect(isJwtTokenValid(expiredJwt)).toBe(false);
    expect(isJwtTokenValid('')).toBe(false);
  });
});
