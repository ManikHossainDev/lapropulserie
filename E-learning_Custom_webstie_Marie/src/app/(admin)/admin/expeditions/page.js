'use client';

import React, { useCallback, useState } from 'react';
import { FaExclamationCircle, FaFileAlt, FaSpinner, FaPencilAlt, FaTrashAlt, FaPlus } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import UserPageHeader from '@/Components/Admin/components/UserPageHeader';
import { useFetchExpeditionsQuery, useDeleteExpeditionMutation } from '@/redux/api/adminApi';
import { useToast } from '@/Components/Admin/hooks/useToast';
import { useConfirm } from '@/Components/Admin/hooks/useConfirm';

export default function ExpeditionsPage() {
  const router = useRouter();
  const { show } = useToast();
  const confirm = useConfirm();

  const { data: expeditionsData, isLoading, error } = useFetchExpeditionsQuery();
  const [deleteExpedition] = useDeleteExpeditionMutation();

  const items = Array.isArray(expeditionsData?.data?.results) ? expeditionsData?.data?.results : [];

  const handleDelete = useCallback(async (item) => {
    const ok = await confirm({
      title: 'Delete expedition?',
      description: `"${item.title}" and all its capsules will be permanently removed.`,
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;

    try {
      await deleteExpedition(item.id).unwrap();
      show('Expedition deleted.', 'info', 2000);
    } catch (err) {
      show(err instanceof Error ? err.message : 'Delete failed.', 'error');
    }
  }, [confirm, show]);

  return (
    <div className="p-6">
      <UserPageHeader
        title="Expedition Journey"
        subtitle="Create capsules and monitor expedition progress"
      />

      <div className="mt-5 bg-white rounded-xl border border-gray-200 p-6 min-h-[65vh]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-[#2E2A5A] rounded-full" />
            <h2 className="text-sm font-bold text-[#2E2A5A]">Expeditions</h2>
          </div>
          <button
            onClick={() => router.push('/admin/expeditions/new')}
            className="flex items-center gap-2 bg-[#2E2A5A] hover:bg-[#3d3870] text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            Create New Journey
            <FaPlus size={16} />
          </button>
        </div>

        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={() => { }} />
        ) : items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:border-[#2E2A5A]/40 hover:shadow-sm transition-all"
              >
                <button
                  onClick={() => router.push(`/admin/expeditions/${item.id}`)}
                  className="flex-1 text-left min-w-0"
                >
                  <h3 className="font-semibold text-gray-900 truncate">
                    {item.title || `Expedition ${String(index + 1).padStart(2, '0')}`}
                  </h3>
                  {item.roadmapBrief && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{item.roadmapBrief}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span>{item.capsulesCount || 0} capsules</span>
                    {item.price && <span>${item.price}</span>}
                    <span>Updated {formatDate(item.updatedAt)}</span>
                  </div>
                </button>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => router.push(`/admin/expeditions/${item.id}`)}
                    className="p-2 text-[#2E2A5A] hover:bg-indigo-50 rounded-md"
                    aria-label="Edit"
                  >
                    <FaPencilAlt size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-md"
                    aria-label="Delete"
                  >
                    <FaTrashAlt size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[380px] text-gray-400">
      <FaSpinner size={34} className="animate-spin mb-3" />
      <p className="text-sm">Loading expeditions...</p>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[380px] text-center">
      <FaExclamationCircle size={34} className="text-red-500 mb-3" />
      <p className="text-sm font-medium text-gray-800 mb-1">Could not load expeditions</p>
      <p className="text-xs text-gray-500 mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 text-sm font-medium bg-[#2E2A5A] text-white rounded-lg hover:bg-[#3d3870]"
      >
        Try Again
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[420px] text-center">
      <FaFileAlt size={54} strokeWidth={1.2} className="text-gray-300 mb-3" />
      <p className="text-sm text-gray-400">No expeditions yet. Create a new journey to get started.</p>
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '-';
  }
}
