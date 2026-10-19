import React from 'react';
import { X } from 'lucide-react';

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string | null;
  title?: string;
}

const PdfViewerModal: React.FC<PdfViewerModalProps> = ({ isOpen, onClose, pdfUrl, title = 'Ver Comprobante' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-4xl rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between border-b pb-3">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button
            type="button"
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none"
            onClick={onClose}
          >
            <span className="sr-only">Cerrar</span>
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="h-[75vh] w-full">
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="h-full w-full rounded-md border-0"
              title={title}
            />
          ) : (
            <div className="flex h-full items-center justify-center rounded-md bg-gray-100 text-gray-500">
              No se pudo cargar el documento
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PdfViewerModal;
