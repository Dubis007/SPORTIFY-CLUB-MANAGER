import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  loading?: boolean;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export default function Pagination({
  page,
  pageSize,
  totalCount,
  totalPages,
  loading = false,
  pageSizeOptions = [10, 20, 50],
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const lastPage = Math.max(totalPages, 1);
  const from = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);

  const buttonClass =
    'inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors';

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t bg-white text-sm text-gray-600">
      <div className="flex items-center gap-2">
        <span>Mostrar</span>
        <select
          value={pageSize}
          disabled={loading}
          onChange={e => onPageSizeChange(Number(e.target.value))}
          className="border rounded-lg px-2 py-1 outline-none focus:border-sportify-primary"
        >
          {pageSizeOptions.map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
        <span>
          {from}–{to} de {totalCount} registros
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className={buttonClass}
          disabled={loading || page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft size={16} /> Anterior
        </button>
        <span className="px-2 font-medium text-gray-700">
          Página {page} de {lastPage}
        </span>
        <button
          type="button"
          className={buttonClass}
          disabled={loading || page >= lastPage}
          onClick={() => onPageChange(page + 1)}
        >
          Siguiente <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
