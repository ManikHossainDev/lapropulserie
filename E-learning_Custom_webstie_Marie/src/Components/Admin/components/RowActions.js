'use client';

import { useEffect, useRef, useState } from 'react';
import { FaEllipsisV, FaTrashAlt, FaUserCog, FaShieldAlt, FaUserShield } from 'react-icons/fa';

export default function RowActions({ status, onDelete, onToggleStatus, onView }) {
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
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={onDelete}
        className="rounded-md p-1.5 text-red-500 transition hover:bg-red-50"
        title="Delete"
      >
        <FaTrashAlt size={16} />
      </button>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((s) => !s)}
          className="rounded-md p-1.5 text-gray-500 transition hover:bg-gray-100"
          title="More"
        >
          <FaEllipsisV size={16} />
        </button>
        {open && (
          <div className="absolute top-full right-0 z-20 mt-1 w-48 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-lg">
            {onView && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onView();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50"
              >
                <FaUserCog size={14} /> View profile
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onToggleStatus();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50"
            >
              {status === 'active' ? (
                <>
                  <FaShieldAlt size={14} className="text-amber-500" />
                  Deactivate
                </>
              ) : (
                <>
                  <FaUserShield size={14} className="text-emerald-500" />
                  Activate
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onDelete();
              }}
              className="flex w-full items-center gap-2 border-t border-gray-50 px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50"
            >
              <Trash2 size={14} /> Delete user
            </button>
          </div>
        )}
      </div>
    </div>
  );
}