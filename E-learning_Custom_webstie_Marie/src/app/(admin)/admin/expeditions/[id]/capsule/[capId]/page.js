'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FaExclamationCircle, FaArrowLeft, FaSpinner, FaPlus, FaSave } from 'react-icons/fa';
import { useParams, useRouter } from 'next/navigation';
import { useFetchExpeditionByIdQuery } from '@/redux/api/adminApi';
import { useToast } from '@/Components/Admin/hooks/useToast';
import { useUnsavedChanges } from '@/Components/Admin/hooks/useUnsavedChanges';

function createEmptyCapsule() {
  return {
    id: '',
    title: '',
    roadmapBrief: '',
    description: '',
    numberOfModules: '',
    estimatedTime: '',
    thumbnailUrl: '',
    thumbnailFile: null,
    introTitle: '',
    introEstimatedTime: '',
    introRoadmapBrief: '',
    introDescription: '',
    introVideoUrl: '',
    introVideoFile: null,
    modules: [],
  };
}

// async function upsertCapsule(expeditionId, capsule) {
//   const res = await fetch(`/api/expedition/${expeditionId}/capsule`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(capsule),
//   });
//   if (!res.ok) throw new Error('Failed to save capsule');
//   return res.json();
// }

async function upsertCapsule(expeditionId, capsule) {
  const res = await fetch(`/api/expedition/${expeditionId}/capsule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(capsule),
  });
  if (!res.ok) throw new Error('Failed to save capsule');
  return res.json();
}

export default function ExpeditionCapsuleEditorPage() {
  const { id, capId } = useParams();
  const router = useRouter();
  const { show } = useToast();

  const isNew = !capId || capId === 'new';

  const [capsule, setCapsule] = useState(() => createEmptyCapsule());
  const [loading, setLoading] = useState(!isNew);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const { data: expeditionData, isLoading: expeditionLoading } = useFetchExpeditionByIdQuery(id, { skip: isNew });

  useUnsavedChanges(dirty);

  useEffect(() => {
    if (isNew) {
      setCapsule(createEmptyCapsule());
      setLoading(false);
      setDirty(false);
      return;
    }

    if (!expeditionData) {
      setLoading(true);
      return;
    }

    const found = expeditionData.capsules?.find((item) => item.id === capId);
    if (!found) {
      setLoadError('Capsule not found.');
      setLoading(false);
      return;
    }
    setCapsule({
      ...found,
      thumbnailFile: null,
      introVideoFile: null,
    });
    setDirty(false);
    setLoading(false);
  }, [capId, expeditionData, isNew]);

  const isValid = useMemo(() => {
    return (
      capsule.title.trim().length > 0 &&
      capsule.roadmapBrief.trim().length > 0 &&
      capsule.description.trim().length > 0 &&
      capsule.numberOfModules.trim().length > 0 &&
      capsule.estimatedTime.trim().length > 0 &&
      capsule.introTitle.trim().length > 0 &&
      capsule.introEstimatedTime.trim().length > 0 &&
      capsule.introRoadmapBrief.trim().length > 0 &&
      capsule.introDescription.trim().length > 0 &&
      (capsule.thumbnailFile || capsule.thumbnailUrl.trim().length > 0) &&
      (capsule.introVideoFile || capsule.introVideoUrl.trim().length > 0)
    );
  }, [capsule]);

  const setField = useCallback((key, value) => {
    setCapsule((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }, []);

  const setFileField = useCallback((key, value) => {
    setCapsule((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }, []);

  const handleSave = useCallback(async (goToDetails) => {
    if (!isValid) {
      show('Please fill in all required fields.', 'error');
      return;
    }

    setSaving(true);
    try {
      const saved = await upsertCapsule(id, capsule);
      setCapsule(saved);
      setDirty(false);
      show('Capsule saved.', 'success');

      if (goToDetails) {
        router.push(`/admin/expeditions/${id}/capsule/${saved.id}/details`);
      } else {
        router.push(`/admin/expeditions/${id}`);
      }
    } catch (err) {
      show(err instanceof Error ? err.message : 'Save failed.', 'error');
    } finally {
      setSaving(false);
    }
  }, [capsule, id, isValid, router, show]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-400">
        <FaSpinner className="animate-spin mr-2" size={20} />
        Loading capsule...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <FaExclamationCircle size={36} className="text-red-500 mb-3" />
        <p className="text-sm text-gray-700 mb-4">{loadError}</p>
        <button
          onClick={() => router.push(`/admin/expeditions/${id}`)}
          className="px-4 py-2 text-sm bg-[#2E2A5A] text-white rounded-lg"
        >
          Back to Expedition
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/admin/expeditions/${id}`)}
            className="p-1.5 hover:bg-gray-100 rounded-md"
            aria-label="Back"
          >
            <FaArrowLeft size={20} className="text-[#2E2A5A]" />
          </button>
          <h1 className="text-2xl font-bold text-[#2E2A5A]">
            {isNew ? 'Create Capsule' : 'Edit Capsule'}
          </h1>
        </div>
      </header>

      <div className="bg-white/40 rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-gray-800">Capsule Section</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSave(false)}
              disabled={saving || !isValid}
              className="flex items-center gap-2 bg-[#2E2A5A] hover:bg-[#3d3870] disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              {saving ? <FaSpinner size={14} className="animate-spin" /> : <FaSave size={14} />}
              {isNew ? 'Create capsule' : 'Save capsule'}
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving || !isValid}
              className="flex items-center gap-2 border border-[#2E2A5A]/30 text-[#2E2A5A] disabled:opacity-50 hover:bg-indigo-50 px-4 py-2 rounded-lg text-sm font-medium"
            >
              Add details
              <FaPlus size={14} />
            </button>
          </div>
        </div>

        <section className="bg-[#F0F8FF]/60 rounded-lg border border-gray-100 p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1 h-5 rounded bg-[#2BB1D6]" />
            <h3 className="font-bold text-[#2E2A5A]">Basic Information</h3>
          </div>

          <div className="space-y-4">
            <Field
              label="Capsule Title"
              required
              value={capsule.title}
              onChange={(value) => setField('title', value)}
            />
            <Field
              label="Roadmap Brief"
              required
              hint="(1 line)"
              hintColor="text-red-500"
              value={capsule.roadmapBrief}
              onChange={(value) => setField('roadmapBrief', value)}
              multiline
              rows={2}
            />
            <Field
              label="Description"
              required
              value={capsule.description}
              onChange={(value) => setField('description', value)}
              multiline
              rows={5}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Number of Modules"
                required
                type="number"
                value={capsule.numberOfModules}
                onChange={(value) => setField('numberOfModules', value)}
              />
              <Field
                label="Estimated Time"
                required
                value={capsule.estimatedTime}
                onChange={(value) => setField('estimatedTime', value)}
              />
            </div>

            <MediaField
              label="Thumbnail"
              required
              accept="image/*"
              file={capsule.thumbnailFile}
              onFileChange={(file) => setFileField('thumbnailFile', file)}
              existingUrl={capsule.thumbnailUrl}
              onUrlChange={(value) => setField('thumbnailUrl', value)}
              placeholder="https://example.com/thumbnail.jpg"
            />
          </div>
        </section>

        <section className="bg-[#FFF8F0]/60 rounded-lg border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1 h-5 rounded bg-[#F4B731]" />
            <h3 className="font-bold text-[#2E2A5A]">Introduction</h3>
          </div>

          <div className="space-y-4">
            <Field
              label="Title"
              required
              value={capsule.introTitle}
              onChange={(value) => setField('introTitle', value)}
            />
            <Field
              label="Estimated Time"
              required
              value={capsule.introEstimatedTime}
              onChange={(value) => setField('introEstimatedTime', value)}
            />
            <Field
              label="Roadmap Brief"
              hint="(1 line)"
              hintColor="text-red-500"
              value={capsule.introRoadmapBrief}
              onChange={(value) => setField('introRoadmapBrief', value)}
              multiline
              rows={2}
            />
            <Field
              label="Description"
              required
              value={capsule.introDescription}
              onChange={(value) => setField('introDescription', value)}
              multiline
              rows={5}
            />
            <MediaField
              label="Introductory Video"
              required
              accept="video/*"
              file={capsule.introVideoFile}
              onFileChange={(file) => setFileField('introVideoFile', file)}
              existingUrl={capsule.introVideoUrl}
              onUrlChange={(value) => setField('introVideoUrl', value)}
              placeholder="https://example.com/intro-video.mp4"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required = false,
  hint = '',
  hintColor = 'text-gray-400',
  multiline = false,
  rows = 3,
  type = 'text',
  placeholder = '',
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
        {hint && <span className={`ml-1 ${hintColor} text-xs`}>{hint}</span>}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 text-sm border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#2E2A5A]/30 focus:border-[#2E2A5A] resize-y"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 text-sm border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#2E2A5A]/30 focus:border-[#2E2A5A]"
        />
      )}
    </div>
  );
}

function MediaField({
  label,
  accept,
  file,
  onFileChange,
  existingUrl,
  onUrlChange,
  placeholder,
  required = false,
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="space-y-2">
        <input
          type="file"
          accept={accept}
          onChange={(e) => onFileChange(e.target.files?.[0] || null)}
          className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-[#2E2A5A] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[#3d3870]"
        />
        {file && <p className="text-xs text-emerald-700">Selected file: {file.name}</p>}
        {existingUrl && !file && (
          <p className="text-xs text-gray-500 break-all">Current file URL: {existingUrl}</p>
        )}

        <input
          type="text"
          value={existingUrl}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 text-sm border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#2E2A5A]/30 focus:border-[#2E2A5A]"
        />
      </div>
    </div>
  );
}
