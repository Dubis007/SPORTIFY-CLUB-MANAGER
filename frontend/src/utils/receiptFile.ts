/**
 * Tipos de comprobante que el visor puede mostrar en línea. Coinciden con los formatos que el backend
 * acepta al subir (.pdf, .png, .jpg/.jpeg). Cualquier otro tipo se trata como descarga.
 */
export type PreviewableReceiptType = 'application/pdf' | 'image/png' | 'image/jpeg';
export type ReceiptMimeType = PreviewableReceiptType | 'application/octet-stream';

const RECEIPT_EXTENSIONS: Record<ReceiptMimeType, string> = {
  'application/pdf': 'pdf',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'application/octet-stream': 'bin',
};

/**
 * Reduce el `Content-Type` de la respuesta a una lista cerrada. El blob del comprobante se crea siempre
 * con uno de estos tipos: un blob sin tipo (o con uno arbitrario) dejaría que el navegador lo interpretara
 * por su contenido, y un HTML disfrazado de comprobante se ejecutaría con el origen de la aplicación.
 */
export function resolveReceiptMimeType(rawContentType?: string | null): ReceiptMimeType {
  const normalized = (rawContentType ?? '').split(';')[0].trim().toLowerCase();
  switch (normalized) {
    case 'application/pdf':
    case 'image/png':
    case 'image/jpeg':
      return normalized;
    default:
      return 'application/octet-stream';
  }
}

export function isPreviewableReceipt(mimeType?: string | null): mimeType is PreviewableReceiptType {
  return resolveReceiptMimeType(mimeType) !== 'application/octet-stream';
}

export function buildReceiptFileName(pagoId: number, mimeType: ReceiptMimeType): string {
  return `Comprobante_Pago_${pagoId}.${RECEIPT_EXTENSIONS[mimeType]}`;
}
