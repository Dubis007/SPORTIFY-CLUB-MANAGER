/// <reference types="vite/client" />

/**
 * Contrato estricto de variables de entorno públicas del cliente.
 * SEGURIDAD: Jamás definir llaves secretas, tokens privados ni credenciales en ImportMetaEnv.
 */
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_MS1_AUTH_URL?: string;
  readonly VITE_MS2_REPORTS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
