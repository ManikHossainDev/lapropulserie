'use client';

import React, { useState, useCallback } from 'react';
import { FaArrowLeft, FaCheckSquare, FaSpinner, FaPencilAlt, FaCog, FaTrashAlt, FaSave, FaPlus } from 'react-icons/fa';
import { IoMdNotifications } from 'react-icons/io';
import { useRouter, useParams } from 'next/navigation';
import { useFetchCategoryByIdQuery, useSaveCategoryMutation, useFetchCategoriesQuery, useDeleteCapsuleMutation } from '@/redux/api/adminApi';
import { useToast } from '@/Components/Admin/hooks/useToast';
import { useConfirm } from '@/Components/Admin/hooks/useConfirm';
import { useUnsavedChanges } from '@/Components/Admin/hooks/useUnsavedChanges';

const PASTEL_GRADIENTS = [
  'from-purple-100 to-blue-50',
  'from-cyan-100 to-teal-50',
  'from-pink-100 to-purple-50',
  'from-amber-100 to-yellow-50',
  'from-emerald-100 to-cyan-50',
  'from-rose-100 to-pink-50',
];

export default function CategoryEditor() {
  const { id: catId } = useParams();
  const router = useRouter();
  const { show } = useToast();
  const confirm = useConfirm();

  const isNew = !catId || catId === 'new';

  const [category, setCategory] = useState({
    title: '',
    description: '',
    thumbnailUrl: '',
    capsules: []
  });
  const [saving, setSaving] = useState(false);
  const [editingInfo, setEditingInfo] = useState(isNew);

  useUnsavedChanges(editingInfo);

  const { data: categoryData, isLoading } = useFetchCategoryByIdQuery(catId, { skip: isNew });
  const [saveCategory] = useSaveCategoryMutation();
  const [deleteCapsule] = useDeleteCapsuleMutation();

  React.useEffect(() => {
    if (categoryData) {
      setCategory(categoryData);
    }
  }, [categoryData]);

  React.useEffect(() => {
    if (isNew) {
      setCategory({ title: '', description: '', thumbnailUrl: '', capsules: [] });
      setEditingInfo(true);
    }
  }, [isNew]);

  const handleSave = useCallback(async () => {
    if (!category.title.trim()) {
      show('Category title is required', 'error');
      return;
    }
    setSaving(true);
    try {
      const saved = await saveCategory(category).unwrap();
      show('Category saved!', 'success');
      setEditingInfo(false);
      if (isNew) {
        router.replace(`/admin/capsules/category/${saved.id}`);
      }
    } catch {
      show('Failed to save category', 'error');
    } finally {
      setSaving(false);
    }
  }, [category, isNew, router, show]);

  const handleDeleteCapsule = async (capsule) => {
    const ok = await confirm({
      title: 'Delete Capsule',
      description: `Delete "${capsule.title || 'Untitled'}"? This cannot be undone.`,
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    try {
      if (category.id) {
        await deleteCapsule({ categoryId: category.id, capsuleId: capsule.id }).unwrap();
      }
      setCategory((prev) => ({
        ...prev,
        capsules: prev.capsules.filter((c) => c.id !== capsule.id),
      }));
      show('Capsule deleted', 'success');
    } catch {
      show('Failed to delete capsule', 'error');
    }
  };

  function updateField(field, value) {
    setCategory((prev) => ({ ...prev, [field]: value }));
    setEditingInfo(true);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <FaSpinner className="w-8 h-8 animate-spin text-[#2E2A5A]" />
      </div>
    );
  }

  return (
    <div className="px-6 py-5 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/admin/capsules')}
            className="text-gray-400 hover:text-[#2E2A5A] transition"
          >
            <FaArrowLeft size={20} />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-[#2E2A5A]">
            {isNew ? 'Create New Capsule Category' : 'Create New Capsule Category'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {editingInfo && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-[#2E2A5A] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#3d3875] transition disabled:opacity-50"
            >
              {saving ? (
                <FaSpinner size={16} className="animate-spin" />
              ) : (
                <>
                  {isNew ? 'Create Category' : 'Save Changes'}{' '}
                  <FaCheckSquare size={16} />
                </>
              )}
            </button>
          )}
          <button className="relative bg-[#3d3875] text-white p-2.5 rounded-full">
            <IoMdNotifications size={18} />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-white" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-[#2E2A5A] rounded-full" />
                <h2 className="text-sm font-bold text-[#2E2A5A]">Basic Information</h2>
              </div>
              {!editingInfo && !isNew && (
                <button
                  onClick={() => setEditingInfo(true)}
                  className="flex items-center gap-2 bg-[#2E2A5A] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#3d3875] transition"
                >
                  Edit <FaCog size={14} />
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Category Title
                </label>
                <input
                  type="text"
                  value={category.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  disabled={!editingInfo}
                  placeholder=""
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[#2E2A5A] disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={category.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  disabled={!editingInfo}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[#2E2A5A] resize-none disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Thumbnail
                </label>
                <input
                  type="text"
                  value={category.thumbnailUrl}
                  onChange={(e) => updateField('thumbnailUrl', e.target.value)}
                  disabled={!editingInfo}
                  placeholder="Image URL"
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[#2E2A5A] disabled:bg-gray-50"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 min-h-[40vh]">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-[#F4B731] rounded-full" />
                <h2 className="text-sm font-bold text-[#2E2A5A]">Capsules</h2>
              </div>
              {category.id && (
                <button
                  onClick={() => router.push(`/admin/capsules/category/${category.id}/capsule/new`)}
                  className="flex items-center gap-2 bg-[#2E2A5A] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#3d3875] transition"
                >
                  Create New Capsule <FaPlus size={16} />
                </button>
              )}
              {!category.id && (
                <button
                  disabled
                  className="flex items-center gap-2 bg-[#2E2A5A]/40 text-white px-5 py-2.5 rounded-lg text-sm font-medium cursor-not-allowed"
                >
                  Create New Capsule <FaPlus size={16} />
                </button>
              )}
            </div>

            {category.capsules.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                No questions yet. Click &quot;Create New Capsule&quot; to get started.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {category.capsules.map((capsule, i) => (
                  <div
                    key={capsule.id}
                    className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition"
                  >
                    <div
                      className={`h-32 bg-gradient-to-br ${PASTEL_GRADIENTS[i % PASTEL_GRADIENTS.length]} rounded-t-xl`}
                    />
                    <div className="p-3">
                      <h3 className="font-semibold text-sm text-gray-900 truncate">
                        {capsule.title || 'Untitled Capsule'}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                        {capsule.description ||
                          'Establish your baseline for meaningful growth.'}
                      </p>
                    </div>
                    <div className="flex items-center border-t border-gray-100 px-1 py-1">
                      <button
                        onClick={() =>
                          router.push(
                            `/admin/capsules/category/${category.id}/capsule/${capsule.id}`
                          )
                        }
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-[#2E2A5A] py-1.5 rounded transition"
                      >
                        <FaPencilAlt size={12} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCapsule(capsule)}
                        className="p-1.5 text-red-400 hover:text-red-600 transition"
                      >
                        <FaTrashAlt size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
            <h2 className="text-lg font-bold text-[#2E2A5A] mb-4">Preview</h2>
            <div className={`h-40 rounded-xl bg-gradient-to-br ${PASTEL_GRADIENTS[0]}`} />
            <div className="mt-3">
              <p className="font-semibold text-gray-900">{category.title || 'Category Title'}</p>
              <p className="text-sm text-gray-500 mt-1">{category.description || 'Category description will appear here...'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}