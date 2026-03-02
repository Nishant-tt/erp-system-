import React from 'react';

const Pagination = ({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
}) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(total, page * pageSize);

  if (total === 0) {
    return null;
  }

  const goTo = (target) => {
    if (target < 1 || target > totalPages || target === page) return;
    onPageChange(target);
  };

  const renderPageButton = (p) => (
    <button
      key={p}
      onClick={() => goTo(p)}
      className={`min-w-[36px] h-9 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all ${
        p === page
          ? 'bg-slate-900 text-white border-slate-900'
          : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-900'
      }`}
    >
      {p}
    </button>
  );

  const pages = [];
  if (totalPages <= 5) {
    for (let p = 1; p <= totalPages; p++) pages.push(p);
  } else {
    pages.push(1);
    const windowStart = Math.max(2, page - 1);
    const windowEnd = Math.min(totalPages - 1, page + 1);
    if (windowStart > 2) pages.push('left-ellipsis');
    for (let p = windowStart; p <= windowEnd; p++) pages.push(p);
    if (windowEnd < totalPages - 1) pages.push('right-ellipsis');
    pages.push(totalPages);
  }

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-slate-100 bg-slate-50/60">
      <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
        <span>
          Showing{' '}
          <span className="font-semibold text-slate-900">
            {startItem}-{endItem}
          </span>{' '}
          of{' '}
          <span className="font-semibold text-slate-900">
            {total}
          </span>
        </span>
        <span className="hidden sm:inline-block">items</span>
      </div>

      <div className="flex items-center gap-3">
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size} / page
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1">
          <button
            onClick={() => goTo(page - 1)}
            disabled={!canPrev}
            className="min-w-[36px] h-9 rounded-xl text-xs font-bold uppercase tracking-widest border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Prev
          </button>

          {pages.map((p, idx) =>
            typeof p === 'number' ? (
              renderPageButton(p)
            ) : (
              <span
                key={p + idx}
                className="px-1 text-xs font-bold text-slate-400"
              >
                ...
              </span>
            )
          )}

          <button
            onClick={() => goTo(page + 1)}
            disabled={!canNext}
            className="min-w-[36px] h-9 rounded-xl text-xs font-bold uppercase tracking-widest border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;

