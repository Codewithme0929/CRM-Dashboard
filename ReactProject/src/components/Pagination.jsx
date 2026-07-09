import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";

export default function Pagination({
  page,
  totalPages,
  totalItems,
  limit,
  setLimit,
  onPageChange,
}) {
  return (
    <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-3">

      {/* Left Side */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-600">Show</span>

        <select
          value={limit}
          onChange={(e) => {
            setLimit(Number(e.target.value));
            onPageChange(1);
          }}
          className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
      </div>

      {/* Center */}
      <div className="flex items-center gap-1">

        <button
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          className="rounded border p-2 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronsLeft size={18} />
        </button>

        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="rounded border p-2 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="rounded border bg-white px-5 py-2 text-sm font-medium">
          Page {page} of {totalPages}
        </div>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="rounded border p-2 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={18} />
        </button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          className="rounded border p-2 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronsRight size={18} />
        </button>

      </div>

      {/* Right Side */}
      <div className="text-sm text-slate-600">
        {totalItems} Items
      </div>

    </div>
  );
}