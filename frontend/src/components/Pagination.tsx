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
    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-semibold text-slate-200 bg-slate-800/90 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors';

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-800 bg-slate-900/95 text-xs text-slate-400">
      <div className="flex items-center gap-2.5">
        <span>Filas por página:</span>
        <select
          value={pageSize}
          disabled={loading}
          onChange={e => onPageSizeChange(Number(e.target.value))}
          aria-label="Filas por página"
          className="border border-slate-700 bg-slate-950 text-slate-200 rounded-lg px-2.5 py-1 outline-none focus:border-blue-500"
        >
          {pageSizeOptions.map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
        <span className="text-slate-400 font-medium">
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
          <ChevronLeft size={14} /> Anterior
        </button>
        <span className="px-2.5 font-semibold text-slate-300">
          Página {page} de {lastPage}
        </span>
        <button
          type="button"
          className={buttonClass}
          disabled={loading || page >= lastPage}
          onClick={() => onPageChange(page + 1)}
        >
          Siguiente <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
