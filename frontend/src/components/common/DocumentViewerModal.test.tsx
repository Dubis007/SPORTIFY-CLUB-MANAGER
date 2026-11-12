import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, renderHook, screen, act } from '@testing-library/react';
import DocumentViewerModal from './DocumentViewerModal';
import { useDocumentViewer } from './useDocumentViewer';

const BLOB_URL = 'blob:http://localhost/documento';

describe('DocumentViewerModal — visor de comprobantes y colillas', () => {
  it('no muestra nada mientras está cerrado', () => {
    render(<DocumentViewerModal isOpen={false} onClose={vi.fn()} documentUrl={BLOB_URL} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('muestra un PDF dentro de un marco con título accesible', () => {
    render(
      <DocumentViewerModal
        isOpen
        onClose={vi.fn()}
        documentUrl={BLOB_URL}
        mimeType="application/pdf"
        title="Colilla del pago #5"
      />
    );

    expect(screen.getByRole('dialog', { name: 'Colilla del pago #5' })).toBeInTheDocument();
    expect(screen.getByTitle('Colilla del pago #5')).toHaveAttribute('src', BLOB_URL);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it.each(['image/png', 'image/jpeg'])('muestra un comprobante %s como imagen con texto alternativo', (mimeType) => {
    render(
      <DocumentViewerModal
        isOpen
        onClose={vi.fn()}
        documentUrl={BLOB_URL}
        mimeType={mimeType}
        title="Comprobante del pago #5"
      />
    );

    expect(screen.getByRole('img', { name: 'Comprobante del pago #5' })).toHaveAttribute('src', BLOB_URL);
    expect(screen.queryByTitle('Comprobante del pago #5')).not.toBeInTheDocument();
  });

  it('no interpreta en línea un tipo desconocido: solo ofrece descargarlo', () => {
    const { container } = render(
      <DocumentViewerModal
        isOpen
        onClose={vi.fn()}
        documentUrl={BLOB_URL}
        mimeType="application/octet-stream"
        title="Comprobante del pago #5"
        downloadName="Comprobante_Pago_5.bin"
      />
    );

    expect(container.querySelector('iframe')).toBeNull();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Descargar archivo/ })).toHaveAttribute(
      'download',
      'Comprobante_Pago_5.bin'
    );
  });

  it('enfoca el botón de cerrar al abrirse y avisa al cerrarse', () => {
    const onClose = vi.fn();
    render(<DocumentViewerModal isOpen onClose={onClose} documentUrl={BLOB_URL} />);

    // El foco inicial lo decide el propio <dialog> a partir del atributo autofocus
    expect(screen.getByRole('button', { name: 'Cerrar visor' })).toHaveAttribute('autofocus');

    // Esc, el gesto "atrás" y los botones del formulario cierran el diálogo nativo, que emite `close`
    fireEvent(screen.getByRole('dialog'), new Event('close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('useDocumentViewer — ciclo de vida de las URL de objeto', () => {
  it('libera la URL anterior al abrir otro documento y la última al salir de la pantalla', () => {
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const { result, unmount } = renderHook(() => useDocumentViewer());

    act(() => result.current.openDocument({ url: 'blob:http://localhost/a', title: 'A' }));
    expect(result.current.viewerProps.isOpen).toBe(true);
    expect(result.current.viewerProps.documentUrl).toBe('blob:http://localhost/a');
    expect(revoke).not.toHaveBeenCalled();

    act(() => result.current.viewerProps.onClose());
    expect(result.current.viewerProps.isOpen).toBe(false);

    act(() => result.current.openDocument({ url: 'blob:http://localhost/b', title: 'B' }));
    expect(revoke).toHaveBeenCalledWith('blob:http://localhost/a');

    unmount();
    expect(revoke).toHaveBeenCalledWith('blob:http://localhost/b');
    revoke.mockRestore();
  });
});
