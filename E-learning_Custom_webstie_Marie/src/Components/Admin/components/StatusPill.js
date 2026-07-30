'use client';

import { FaCheckCircle, FaClock } from 'react-icons/fa';

export default function StatusPill({ status }) {
  if (status === 'active') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-xs text-emerald-700">
        <FaCheckCircle size={12} /> Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-2.5 py-0.5 text-xs text-gray-500">
      <FaClock size={12} /> Inactive
    </span>
  );
}