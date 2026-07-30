'use client';

import React, { useState, useCallback } from 'react';
import { FaArrowLeft, FaCheckSquare, FaChevronDown, FaSpinner, FaPencilAlt, FaPlusCircle, FaTrashAlt, FaPlus } from 'react-icons/fa';
import { IoMdNotifications } from 'react-icons/io';
import { useRouter, useParams } from 'next/navigation';
import { useFetchCategoryByIdQuery, useSaveCapsuleInCategoryMutation, useDeleteModuleMutation, useDeleteCapsuleMutation } from '@/redux/api/adminApi';
import { useToast } from '@/Components/Admin/hooks/useToast';
import { useConfirm } from '@/Components/Admin/hooks/useConfirm';
import { useUnsavedChanges } from '@/Components/Admin/hooks/useUnsavedChanges';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

const PASTEL_GRADIENTS = [
  'from-purple-100 to-blue-50',
  'from-cyan-100 to-teal-50',
  'from-pink-100 to-purple-50',
  'from-amber-100 to-yellow-50',
];

function createEmptyCapsule(index = 0) {
  return {
    id: `tmp_${Date.now()}_${index}`,
    title: '',
    description: '',
    shortDescription: '',
    level: LEVELS[index % LEVELS.length],
    thumbnailUrl: '',
    modules: [],
    numberOfModules: '',
    price: '',
    whatYouWillLearn: [''],
  };
}

export default function CapsuleEditorPage() {
  const { id: catId, capId } = useParams();
  const router = useRouter();
  const { show } = useToast();
  const confirm = useConfirm();

  const isNew = !capId || capId === 'new';

  const [capsule, setCapsule] = useState(() => createEmptyCapsule(0));
  const [saving, setSaving] = useState(false);
  const [editingInfo, setEditingInfo] = useState(isNew);

  useUnsavedChanges(true);

  const { data: categoryData, isLoading } = useFetchCategoryByIdQuery(catId, { skip: !catId || isNew });
  const [saveCapsuleInCategory] = useSaveCapsuleInCategoryMutation();
  const [deleteModule] = useDeleteModuleMutation();

  React.useEffect(() => {
    if (categoryData && !isNew && capId) {
      const existing = categoryData.capsules?.find((c) => c.id === capId);
      if (existing) {
        setCapsule(existing);
        setEditingInfo(false);
      } else {
        show('Capsule not found', 'error');
        router.push(`/admin/capsules/category/${catId}`);
      }
    }
  }, [categoryData, capId, isNew, router, show]);

  React.useEffect(() => {
    if (isNew || !catId || !capId) {
      setCapsule(createEmptyCapsule(0));
      setEditingInfo(true);
    }
  }, [isNew, catId, capId]);

  const handleSave = useCallback(async () => {
    if (!capsule.title.trim()) {
      show('Capsule title is required', 'error');
      return;
    }
    if (!catId) return;
    setSaving(true);
    try {
      const saved = await saveCapsuleInCategory({ categoryId: catId, capsule }).unwrap();
      show('Capsule saved!', 'success');
      setEditingInfo(false);
      if (isNew) {
        router.replace(`/admin/capsules/category/${catId}/capsule/${saved.id}`);
      }
    } catch {
      show('Failed to save capsule', 'error');
    } finally {
      setSaving(false);
    }
  }, [capsule, catId, isNew, router, show]);

  const handleDeleteModule = async (moduleId, title) => {
    const ok = await confirm({
      title: 'Delete Module',
      description: `Delete "${title || 'Untitled'}"?`,
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    try {
      if (catId && capsule.id && !capsule.id.startsWith('tmp_')) {
        await deleteModule({ categoryId: catId, moduleId }).unwrap();
      }
      setCapsule((prev) => ({
        ...prev,
        modules: prev.modules.filter((m) => m.id !== moduleId),
      }));
      show('Module deleted', 'success');
    } catch {
      show('Failed to delete module', 'error');
    }
  };

  const updateField = (field, value) => {
    setCapsule((prev) => ({ ...prev, [field]: value }));
    setEditingInfo(true);
  };

  const addLearnItem = () => {
    setCapsule((prev) => ({
      ...prev,
      whatYouWillLearn: [...prev.whatYouWillLearn, ''],
    }));
  };

  const updateLearnItem = (idx, val) => {
    setCapsule((prev) => {
      const items = [...prev.whatYouWillLearn];
      items[idx] = val;
      return { ...prev, whatYouWillLearn: items };
    });
  };

  const removeLearnItem = (idx) => {
    setCapsule((prev) => ({
      ...prev,
      whatYouWillLearn: prev.whatYouWillLearn.filter((_, i) => i !== idx),
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <FaSpinner className="w-8 h-8 animate-spin text-[#2E2A5A]" />
      </div>
    );
  }

  const disabled = !editingInfo;

  return (
    <div className="px-6 py-5 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/admin/capsules/category/${catId}`)}
            className="text-gray-400 hover:text-[#2E2A5A] transition"
          >
            <FaArrowLeft size={20} />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-[#2E2A5A]">
            Create New Capsule
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {editingInfo ? (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-[#2E2A5A] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#3d3875] transition disabled:opacity-50"
            >
              {saving ? (
                <FaSpinner size={16} className="animate-spin" />
              ) : (
                <>
                  {isNew ? 'Create capsule' : 'Save Changes'}{' '}
                  <FaCheckSquare size={16} />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => setEditingInfo(true)}
              className="flex items-center gap-2 bg-[#2E2A5A] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#3d3875] transition"
            >
              Save Changes <CheckSquare size={16} />
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
                  Edit
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Capsule Title *
                </label>
                <input
                  type="text"
                  value={capsule.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  disabled={disabled}
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[#2E2A5A] disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Level (for whom) *
                </label>
                <div className="relative">
                  <select
                    value={capsule.level}
                    onChange={(e) => updateField('level', e.target.value)}
                    disabled={disabled}
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[#2E2A5A] appearance-none bg-white disabled:bg-gray-50"
                  >
                    <option value="">Select level...</option>
                    {LEVELS.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                  <FaChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  About this capsule (Description) *
                </label>
                <textarea
                  value={capsule.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  disabled={disabled}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[#2E2A5A] resize-none disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Number of Modules *
                </label>
                <input
                  type="text"
                  value={capsule.numberOfModules}
                  onChange={(e) => updateField('numberOfModules', e.target.value)}
                  disabled={disabled}
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[#2E2A5A] disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Price ($) *
                </label>
                <input
                  type="text"
                  value={capsule.price}
                  onChange={(e) => updateField('price', e.target.value)}
                  disabled={disabled}
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[#2E2A5A] disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  What you will learn *
                </label>
                <div className="space-y-2">
                  {capsule.whatYouWillLearn.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={addLearnItem}
                        disabled={disabled}
                        className="text-[#2E2A5A] hover:text-[#3d3875] disabled:opacity-40 shrink-0"
                      >
                        <FaPlusCircle size={18} />
                      </button>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => updateLearnItem(idx, e.target.value)}
                        disabled={disabled}
                        placeholder="write what mentees will learn from this capsule"
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#2E2A5A] disabled:bg-gray-50"
                      />
                      <button
                        type="button"
                        onClick={() => removeLearnItem(idx)}
                        disabled={disabled || capsule.whatYouWillLearn.length <= 1}
                        className="text-red-400 hover:text-red-600 disabled:opacity-30 shrink-0"
                      >
                        <FaTrashAlt size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Thumbnail *
                </label>
                <input
                  type="text"
                  value={capsule.thumbnailUrl}
                  onChange={(e) => updateField('thumbnailUrl', e.target.value)}
                  disabled={disabled}
                  placeholder="Image URL"
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[#2E2A5A] disabled:bg-gray-50"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 min-h-[30vh]">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-[#F4B731] rounded-full" />
                <h2 className="text-sm font-bold text-[#2E2A5A]">
                  {capsule.id && !capsule.id.startsWith('tmp_')
                    ? 'Lessons'
                    : 'Modules'}
                </h2>
              </div>
              {capsule.id && !capsule.id.startsWith('tmp_') ? (
                <button
                  onClick={() =>
                    router.push(`/admin/capsules/category/${catId}/capsule/${capsule.id}/module/new`)
                  }
                  className="flex items-center gap-2 bg-[#2E2A5A] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#3d3875] transition"
                >
                  Create New Modules <FaPlus size={16} />
                </button>
              ) : (
                <button
                  disabled
                  className="flex items-center gap-2 bg-[#2E2A5A]/40 text-white px-5 py-2.5 rounded-lg text-sm font-medium cursor-not-allowed"
                >
                  Create New Modules <FaPlus size={16} />
                </button>
              )}
            </div>

            {capsule.modules.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
                No questions yet. Click &quot;Create New Capsule&quot; to get started.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {capsule.modules.map((mod, i) => (
                  <div
                    key={mod.id}
                    className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition"
                  >
                    <div
                      className={`h-28 bg-gradient-to-br ${PASTEL_GRADIENTS[i % PASTEL_GRADIENTS.length]} rounded-t-xl`}
                    />
                    <div className="p-3">
                      <h3 className="font-semibold text-sm text-gray-900 truncate">
                        {mod.title || 'Untitled Module'}
                      </h3>
                    </div>
                    <div className="flex items-center border-t border-gray-100 px-1 py-1">
                      <button
                        onClick={() =>
                          router.push(
                            `/admin/capsules/category/${catId}/capsule/${capsule.id}/module/${mod.id}`
                          )
                        }
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-[#2E2A5A] py-1.5 rounded transition"
                      >
                        <FaPencilAlt size={12} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteModule(mod.id, mod.title)}
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
            <div className={`h-32 rounded-xl bg-gradient-to-br ${PASTEL_GRADIENTS[0]}`} />
            <div className="mt-3">
              <p className="font-semibold text-gray-900">{capsule.title || 'Capsule Title'}</p>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{capsule.shortDescription || 'Short description...'}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full">{capsule.level}</span>
                <span className="text-xs text-gray-500">{capsule.numberOfModules} modules</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}