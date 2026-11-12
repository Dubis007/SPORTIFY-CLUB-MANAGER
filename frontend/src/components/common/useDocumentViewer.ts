import { useCallback, useEffect, useRef, useState } from 'react';
import type { DocumentViewerModalProps } from './DocumentViewerModal';

export interface ViewerDocument {
  url: string;
  mimeType?: string;
  title: string;
  downloadName?: string;
}

/**
 * Estado del visor de documentos de una pantalla. Los comprobantes y colillas llegan como URL de objeto
 * (`blob:`) creadas tras descargar el archivo con sesión: el hook libera la anterior al abrir otro
 * documento y la última al salir de la pantalla, para no dejar archivos privados retenidos en memoria.
 */
export function useDocumentViewer() {
  const [current, setCurrent] = useState<ViewerDocument | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const liveUrlRef = useRef<string | null>(null);

  const releaseLiveUrl = useCallback(() => {
    if (liveUrlRef.current?.startsWith('blob:')) {
      URL.revokeObjectURL(liveUrlRef.current);
    }
    liveUrlRef.current = null;
  }, []);

  const openDocument = useCallback(
    (doc: ViewerDocument) => {
      releaseLiveUrl();
      liveUrlRef.current = doc.url;
      setCurrent(doc);
      setIsOpen(true);
    },
    [releaseLiveUrl]
  );

  const closeDocument = useCallback(() => setIsOpen(false), []);

  useEffect(() => releaseLiveUrl, [releaseLiveUrl]);

  const viewerProps: DocumentViewerModalProps = {
    isOpen,
    onClose: closeDocument,
    documentUrl: current?.url ?? null,
    mimeType: current?.mimeType,
    title: current?.title,
    downloadName: current?.downloadName,
  };

  return { openDocument, closeDocument, viewerProps };
}
