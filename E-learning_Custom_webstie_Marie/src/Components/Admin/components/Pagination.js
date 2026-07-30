'use client';

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('…');
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (page < totalPages - 2) pages.push('…');
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-end gap-2 text-xs">
      <button type="button" onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1} className="rounded-md border border-gray-200 px-3 py-1.5 text-gray-600 transition hover:bg-gray-50 disabled:opacity-40">
        Previous
      </button>
      {pages.map((p, idx) =>
        p === '…' ? (
          <span key={`e${idx}`} className="px-2 text-gray-400">…</span>
        ) : (
          <button key={p} type="button" onClick={() => onChange(p)} className={`rounded-md px-3 py-1.5 ${page === p ? 'bg-[#2E2A5A] text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {p}
          </button>
        ),
      )}
      <button type="button" onClick={() => onChange(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="rounded-md border border-gray-200 px-3 py-1.5 text-gray-600 transition hover:bg-gray-50 disabled:opacity-40">
        Next
      </button>
    </div>
  );
}