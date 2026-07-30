'use client';

import { useEffect, useRef, useState } from 'react';
import { FaFilter, FaSearch, FaTimes } from 'react-icons/fa';

export default function SearchToolbar({ query, onQueryChange, placeholder = 'Search by name or email...', filters, hasActiveFilters, onClearFilters }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <FaSearch size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-lg bg-gray-50 py-2.5 pr-3 pl-10 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>
        {filters && (
          <div ref={ref} className="relative">
            <button
              type="button"
              onClick={() => setOpen((s) => !s)}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition ${
                hasActiveFilters
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FaFilter size={14} />
              Filters
              {hasActiveFilters && (
                <span className="ml-1 h-1.5 w-1.5 rounded-full bg-indigo-500" />
              )}
            </button>
            {open && (
              <div className="absolute top-full right-0 z-20 mt-2 w-72 rounded-xl border border-gray-100 bg-white p-4 shadow-xl">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-[#2E2A5A]">Filters</h4>
                  {hasActiveFilters && onClearFilters && (
                    <button
                      type="button"
                      onClick={() => {
                        onClearFilters();
                        setOpen(false);
                      }}
                      className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
                    >
                      <FaTimes size={12} /> Clear
                    </button>
                  )}
                </div>
                {filters}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}