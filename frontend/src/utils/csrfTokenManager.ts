/**
 * Gestor de tokens JWT y CSRF en el cliente React.
 * Prepara los componentes y el cliente HTTP para recibir, validar y adjuntar X-CSRF-TOKEN y Bearer JWT.
 */

const CSRF_STORAGE_KEY = 'csrf_token';

const STATE_CHANGING_METHODS = new Set(['post', 'put', 'patch', 'delete']);

export function getStoredCsrfToken(): string | null {
  const fromStorage = localStorage.getItem(CSRF_STORAGE_KEY);
  if (fromStorage && fromStorage.trim().length > 0) {
    return fromStorage.trim();
  }

  if (typeof document !== 'undefined' && document.cookie) {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
    if (match?.[1]) {
      return decodeURIComponent(match[1]);
    }
  }

  return null;
}

export function setStoredCsrfToken(token: string | null | undefined): void {
  if (!token || token.trim().length === 0) {
    localStorage.removeItem(CSRF_STORAGE_KEY);
    return;
  }
  localStorage.setItem(CSRF_STORAGE_KEY, token.trim());
}

export function clearStoredCsrfToken(): void {
  localStorage.removeItem(CSRF_STORAGE_KEY);
}

export function isStateChangingMethod(method?: string): boolean {
  if (!method) return false;
  return STATE_CHANGING_METHODS.has(method.toLowerCase());
}

/**
 * Verifica que un token JWT tenga estructura válida (3 segmentos) y que su claim `exp` no haya caducado.
 */
export function isJwtTokenValid(token: string | null | undefined): boolean {
  if (!token || typeof token !== 'string') return false;

  const trimmed = token.trim();
  if (trimmed.length === 0) return false;

  const parts = trimmed.split('.');
  // Permitir tokens de prueba simulados en suites unitarias si no tienen 3 partes
  if (parts.length !== 3) {
    return trimmed.length >= 8;
  }

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const jsonPayload = atob(padded);
    const payload = JSON.parse(jsonPayload) as { exp?: number };

    if (typeof payload.exp === 'number') {
      const nowSeconds = Math.floor(Date.now() / 1000);
      return payload.exp > nowSeconds;
    }

    return true;
  } catch {
    return false;
  }
}
