'use client';

import React, { useState } from 'react';
import { FaFileAlt, FaSearch, FaPencilAlt, FaTrashAlt, FaSpinner, FaExclamationCircle, FaPlus } from 'react-icons/fa';
import { IoMdNotifications } from 'react-icons/io';
import UserPageHeader from '@/Components/Admin/components/UserPageHeader';
import SearchToolbar from '@/Components/Admin/components/SearchToolbar';
import { useFetchCategoriesQuery, useDeleteCategoryMutation } from '@/redux/api/adminApi';
import { useDebounce } from '@/Components/Admin/hooks/useDebounce';
import { useToast } from '@/Components/Admin/hooks/useToast';
import { useConfirm } from '@/Components/Admin/hooks/useConfirm';
import { useRouter } from 'next/navigation';

const PASTEL_GRADIENTS = [
  'from-purple-100 to-blue-50',
  'from-cyan-100 to-teal-50',
  'from-pink-100 to-purple-50',
  'from-amber-100 to-yellow-50',
  'from-emerald-100 to-cyan-50',
  'from-rose-100 to-pink-50',
];

export default function CapsulesPage() {
  const router = useRouter();
  const { show } = useToast();
  const confirm = useConfirm();
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const debounced = useDebounce(search, 300);

  const { data: categories, isLoading, error } = useFetchCategoriesQuery(debounced);
  const [deleteCategory] = useDeleteCategoryMutation();

  const categoriesList = categories || [];

  const handleDelete = async (id, title) => {
    const ok = await confirm({
      title: 'Delete Category',
      description: `Delete "${title}"? All capsules within it will also be removed.`,
      confirmLabel: 'Delete',
      destructive: true
    });
    if (!ok) return;
    try {
      await deleteCategory(id).unwrap();
      show('Category deleted', 'success');
    } catch (err) {
      show('Failed to delete category', 'error');
    }
  };

  const handleEdit = (id) => {
    router.push(`/admin/capsules/category/${id}`);
  };

  const handleCreate = () => {
    setCreating(true);
    router.push('/admin/capsules/category/new');
    setTimeout(() => setCreating(false), 500);
  };

  return (
    <div className="p-6">
      <div className="bg-gray-100 px-6 py-5 flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#2E2A5A]">Individual Capsules</h1>
          <p className="text-sm text-gray-700 font-medium mt-1">Create Capsules And Monitor The Capsule</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCreate}
            disabled={creating}
            className="flex items-center gap-2 bg-[#2E2A5A] hover:bg-[#3d3870] disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            {creating ? (
              <>
                <FaSpinner size={16} className="animate-spin" />
                Creating...
              </>
            ) : (
              <>
                Create New Capsule Category
                <FaPlus size={16} />
              </>
            )}
          </button>
          <button
            type="button"
            className="relative bg-[#8B8DB0] hover:bg-[#7a7c9e] text-white p-2.5 rounded-lg transition-colors"
            aria-label="Notifications"
          >
            <IoMdNotifications size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-yellow-400 rounded-full border border-[#8B8DB0]"></span>
          </button>
        </div>
      </div>

      <div className="mt-5">
        <SearchToolbar
          query={search}
          onQueryChange={setSearch}
          placeholder="Search category..."
        />
      </div>

      <div className="mt-5 bg-white rounded-xl border border-gray-200 p-6 min-h-[calc(100vh-180px)]">
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error instanceof Error ? error.message : 'Failed to load'} onRetry={() => { }} />
        ) : !categories || categories.length === 0 ? (
          <EmptyState onCreate={handleCreate} creating={creating} />
        ) : (
          <CategoryList
            items={categoriesList}
            onOpen={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400">
      <FaSpinner size={36} className="animate-spin mb-3" />
      <p className="text-sm">Loading categories...</p>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <FaExclamationCircle size={36} className="text-red-500 mb-3" />
      <p className="text-sm font-medium text-gray-800 mb-1">Could not load categories</p>
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

function EmptyState({ onCreate, creating }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
      <div className="w-16 h-16 rounded-lg flex items-center justify-center mb-4">
        <FaFileAlt size={56} strokeWidth={1.25} className="text-gray-300" />
      </div>
      <p className="text-sm text-gray-400">No Content yet, click &quot;Create New Capsule Category&quot; get started</p>
      <button
        onClick={onCreate}
        disabled={creating}
        className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#2E2A5A] hover:underline disabled:opacity-60"
      >
        {creating ? <FaSpinner size={14} className="animate-spin" /> : <FaPlus size={14} />}
        Create your first category
      </button>
    </div>
  );
}

function CategoryList({
  items,
  onOpen,
  onDelete,
}) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={item.id}
          className="border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:border-[#2E2A5A]/40 hover:shadow-sm transition-all"
        >
          <button
            onClick={() => onOpen(item.id)}
            className="flex-1 text-left min-w-0"
          >
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 truncate">
                {item.title || `Category ${String(index + 1).padStart(2, '0')}`}
              </h3>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span>{item.capsules} capsules</span>
              <span>·</span>
              <span>Updated {formatDate(item.updatedAt)}</span>
            </div>
          </button>
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => onOpen(item.id)}
              className="p-2 text-[#2E2A5A] hover:bg-indigo-50 rounded-md transition-colors"
              aria-label="Edit"
            >
              <FaPencilAlt size={16} />
            </button>
            <button
              onClick={() => onDelete(item.id, item.title)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
              aria-label="Delete"
            >
              <FaTrashAlt size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}