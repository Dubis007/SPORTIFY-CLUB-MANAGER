import { describe, expect, it } from 'vitest';
import { buildReceiptFileName, isPreviewableReceipt, resolveReceiptMimeType } from './receiptFile';

describe('receiptFile — tipo y nombre de los comprobantes descargados', () => {
  it.each([
    ['application/pdf', 'application/pdf'],
    ['image/png', 'image/png'],
    ['image/jpeg', 'image/jpeg'],
    ['Application/PDF; charset=binary', 'application/pdf'],
  ])('reconoce %s como formato previsualizable', (raw, expected) => {
    expect(resolveReceiptMimeType(raw)).toBe(expected);
    expect(isPreviewableReceipt(raw)).toBe(true);
  });

  it.each([['text/html'], ['image/svg+xml'], ['application/javascript'], ['constructor'], [''], [undefined], [null]])(
    'trata %s como descarga: nunca se interpreta en línea',
    (raw) => {
      expect(resolveReceiptMimeType(raw)).toBe('application/octet-stream');
      expect(isPreviewableReceipt(raw)).toBe(false);
    }
  );

  it('nombra la descarga con la extensión real del archivo', () => {
    expect(buildReceiptFileName(12, 'application/pdf')).toBe('Comprobante_Pago_12.pdf');
    expect(buildReceiptFileName(12, 'image/png')).toBe('Comprobante_Pago_12.png');
    expect(buildReceiptFileName(12, 'image/jpeg')).toBe('Comprobante_Pago_12.jpg');
    expect(buildReceiptFileName(12, 'application/octet-stream')).toBe('Comprobante_Pago_12.bin');
  });
});
