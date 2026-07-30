'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FaExclamationCircle, FaCheckSquare, FaSpinner, FaPencilAlt, FaTrashAlt, FaPlus } from 'react-icons/fa';
import { useParams, useRouter } from 'next/navigation';
import UserPageHeader from '@/Components/Admin/components/UserPageHeader';
import { useFetchExpeditionByIdQuery, useDeleteExpeditionMutation } from '@/redux/api/adminApi';
import { useToast } from '@/Components/Admin/hooks/useToast';
import { useConfirm } from '@/Components/Admin/hooks/useConfirm';
import { useUnsavedChanges } from '@/Components/Admin/hooks/useUnsavedChanges';

function createEmptyExpedition() {
  return {
    id: '',
    title: '',
    roadmapBrief: '',
    price: '',
    description: '',
    capsules: [],
    thumbnailUrl: '',
  };
}

async function createExpedition(data) {
  const res = await fetch('/api/expedition', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create expedition');
  return res.json();
}

async function updateExpedition(data) {
  const res = await fetch('/api/expedition', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update expedition');
  return res.json();
}

async function deleteCapsule(expeditionId, capsuleId) {
  const res = await fetch(`/api/expedition/${expeditionId}/capsule/${capsuleId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete capsule');
  return res.json();
}

export default function ExpeditionEditorPage() {
  const { id } = useParams();
  const router = useRouter();
  const { show } = useToast();
  const confirm = useConfirm();

  const isNew = !id || id === 'new';

  const [expedition, setExpedition] = useState(() => createEmptyExpedition());
  const [saving, setSaving] = useState(false);
  const [editingInfo, setEditingInfo] = useState(isNew);
  const [dirty, setDirty] = useState(false);

  const { data: expeditionData, isLoading, error: loadError } = useFetchExpeditionByIdQuery(id, { skip: isNew });
  const [deleteExpedition] = useDeleteExpeditionMutation();

  useUnsavedChanges(dirty);

  React.useEffect(() => {
    if (isNew) {
      const empty = createEmptyExpedition();
      setExpedition(empty);
      setEditingInfo(true);
      setDirty(false);
    } else if (expeditionData?.data) {
      setExpedition(expeditionData?.data);
      setEditingInfo(false);
      setDirty(false);
    }
  }, [isNew, expeditionData]);

  const isInfoValid = useMemo(() => {
    return (
      expedition.title.trim().length > 0 &&
      expedition?.roadMapBrief?.trim().length > 0 &&
      expedition.price.toString().trim().length > 0
    );
  }, [expedition]);

  const setField = useCallback((key, value) => {
    setExpedition((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }, []);

  const handleSaveInfo = useCallback(async () => {
    if (!isInfoValid) {
      show('Please fill in all required fields.', 'error');
      return;
    }

    setSaving(true);
    try {
      if (isNew) {
        const created = await createExpedition(expedition);
        show('Expedition created.', 'success');
        setDirty(false);
        router.replace(`/admin/expeditions/${created.id}`);
      } else {
        const updated = await updateExpedition(expedition);
        setExpedition(updated);
        setEditingInfo(false);
        setDirty(false);
        show('Expedition saved.', 'success');
      }
    } catch (err) {
      show(err instanceof Error ? err.message : 'Save failed.', 'error');
    } finally {
      setSaving(false);
    }
  }, [expedition, isInfoValid, isNew, router, show]);

  const handleCancelEdit = useCallback(async () => {
    if (isNew) {
      router.push('/admin/expeditions');
      return;
    }
    if (expeditionData) {
      setExpedition(expeditionData);
    }
    setEditingInfo(false);
    setDirty(false);
  }, [isNew, expeditionData, router]);

  const handleDeleteCapsule = useCallback(async (capsule) => {
    if (!expedition.id || !capsule.id) return;
    const ok = await confirm({
      title: 'Delete capsule?',
      description: `"${capsule.title || 'This capsule'}" will be permanently removed.`,
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    try {
      await deleteCapsule(expedition.id, capsule.id);
      setExpedition((prev) => ({
        ...prev,
        capsules: prev.capsules.filter((item) => item.id !== capsule.id),
      }));
      show('Capsule deleted.', 'info', 2000);
    } catch (err) {
      show(err instanceof Error ? err.message : 'Delete failed.', 'error');
    }
  }, [confirm, expedition.id, show]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-400">
        <FaSpinner className="animate-spin mr-2" size={20} />
        Loading expedition...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <FaExclamationCircle size={36} className="text-red-500 mb-3" />
        <p className="text-sm text-gray-700 mb-4">{loadError}</p>
        <button
          onClick={() => router.push('/admin/expeditions')}
          className="px-4 py-2 text-sm bg-[#2E2A5A] text-white rounded-lg"
        >
          Back to Expeditions
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <UserPageHeader
        title={isNew ? 'Create Expedition' : 'Expedition Journey'}
        subtitle="Create capsules and monitor the expedition structure"
      />

      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="w-1 h-5 rounded bg-[#2BB1D6]" />
            <h2 className="text-base font-bold text-[#2E2A5A]">Expedition Information</h2>
          </div>

          {!isNew && !editingInfo && (
            <button
              onClick={() => setEditingInfo(true)}
              className="flex items-center gap-2 bg-[#2E2A5A] hover:bg-[#3d3870] text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Edit
              <FaPencilAlt size={14} />
            </button>
          )}

          {!isNew && editingInfo && (
            <div className="flex gap-2">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveInfo}
                disabled={saving || !isInfoValid}
                className="flex items-center gap-2 bg-[#2E2A5A] hover:bg-[#3d3870] disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                {saving ? <FaSpinner size={14} className="animate-spin" /> : <FaCheckSquare size={14} />}
                Save
              </button>
            </div>
          )}

          {isNew && (
            <button
              onClick={handleSaveInfo}
              disabled={saving || !isInfoValid}
              className="flex items-center gap-2 bg-[#2E2A5A] hover:bg-[#3d3870] disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-medium"
            >
              {saving ? (
                <>
                  <FaSpinner size={14} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Create Journey
                  <FaCheckSquare size={14} />
                </>
              )}
            </button>
          )}
        </div>

        <div className="space-y-4">
          <Field
            label="Expedition Title"
            required
            value={expedition.title}
            onChange={(value) => setField('title', value)}
            readOnly={!editingInfo}
            placeholder="Your 6-capsule journey"
          />
          <Field
            label="Roadmap Brief"
            required
            value={expedition.roadmapBrief}
            onChange={(value) => setField('roadmapBrief', value)}
            readOnly={!editingInfo}
            placeholder="Brief one-line summary of the journey"
            multiline
          />
          <Field
            label="Price ($)"
            required
            value={expedition.price}
            onChange={(value) => setField('price', value)}
            readOnly={!editingInfo}
            placeholder="150"
            type="number"
          />
        </div>
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="w-1 h-5 rounded bg-[#F4B731]" />
            <h2 className="text-base font-bold text-[#2E2A5A]">Capsules</h2>
          </div>
          <button
            onClick={() => router.push(`/admin/expeditions/${expedition.id}/capsule/new`)}
            disabled={!expedition.id}
            className="flex items-center gap-2 bg-[#2E2A5A] hover:bg-[#3d3870] disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Create New Capsule
            <FaPlus size={14} />
          </button>
        </div>

        {!expedition.id || expedition?.capsules?.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-14">
            No capsules yet. Click "Create New Capsule" to get started.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {expedition?.capsules?.map((capsule, index) => (
              <CapsuleCard
                key={capsule.id}
                capsule={capsule}
                index={index}
                onEdit={() => router.push(`/admin/expeditions/${expedition.id}/capsule/${capsule.id}`)}
                onDelete={() => handleDeleteCapsule(capsule)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required = false,
  readOnly = false,
  placeholder = '',
  multiline = false,
  type = 'text',
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
          placeholder={placeholder}
          rows={3}
          className={`w-full px-3 py-2.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2E2A5A]/30 focus:border-[#2E2A5A] resize-y ${readOnly ? 'bg-gray-50 border-gray-200 text-gray-700' : 'bg-white border-gray-300'
            }`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
          placeholder={placeholder}
          className={`w-full px-3 py-2.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2E2A5A]/30 focus:border-[#2E2A5A] ${readOnly ? 'bg-gray-50 border-gray-200 text-gray-700' : 'bg-white border-gray-300'
            }`}
        />
      )}
    </div>
  );
}

function CapsuleCard({ capsule, index, onEdit, onDelete }) {
  const modulesCount = capsule?.details?.modules?.length || Number(capsule?.numberOfModules || 0);
  const hasDetails = Boolean(capsule?.hasDetails);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow">
      <div
        className="h-32 w-full bg-cover bg-center"
        style={
          capsule?.thumbnailUrl
            ? { backgroundImage: `url(${capsule.thumbnailUrl})` }
            : {
              background:
                'linear-gradient(135deg, #f0e6ff 0%, #e0f3ff 50%, #d4faf2 100%)',
            }
        }
      />
      <div className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">Capsule {String(index + 1).padStart(2, '0')}</p>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${hasDetails ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}
          >
            {hasDetails ? 'Details Added' : 'Details Pending'}
          </span>
        </div>
        <h3 className="font-bold text-sm text-[#2E2A5A] mt-1 truncate">
          {capsule.title || 'Untitled Capsule'}
        </h3>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2 min-h-[2.5rem]">
          {capsule.roadmapBrief || 'Capsule roadmap brief will appear here.'}
        </p>
        <p className="text-[11px] text-gray-500 mt-2">{modulesCount} modules</p>
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-xs font-medium"
          >
            <FaPencilAlt size={12} />
            Edit
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-red-500 hover:bg-red-50 rounded-md"
            aria-label="Delete capsule"
          >
            <FaTrashAlt size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
