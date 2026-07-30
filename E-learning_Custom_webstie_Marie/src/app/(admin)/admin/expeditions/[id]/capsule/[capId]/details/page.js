'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FaExclamationCircle,
  FaArrowLeft,
  FaCheck,
  FaSpinner,
  FaPlus,
  FaSave,
  FaTrashAlt,
} from 'react-icons/fa';
import { useParams, useRouter } from 'next/navigation';
import { useFetchExpeditionByIdQuery, useFetchExpeditionCapsuleDetailsQuery } from '@/redux/api/adminApi';
import { useToast } from '@/Components/Admin/hooks/useToast';
import { useConfirm } from '@/Components/Admin/hooks/useConfirm';
import { useUnsavedChanges } from '@/Components/Admin/hooks/useUnsavedChanges';

function createEmptyModule(index = 0) {
  return {
    id: `module_${Date.now()}_${index}`,
    title: '',
    roadmapBrief: '',
    description: '',
    estimatedTime: '',
    videoUrl: '',
    videoFile: null,
  };
}

function createEmptyCapsuleQuestion(index = 0) {
  return {
    id: `question_${Date.now()}_${index}`,
    title: '',
    helpText: '',
  };
}

async function fetchCapsuleDetails(expeditionId, capsuleId) {
  const res = await fetch(`/api/expedition/${expeditionId}/capsule/${capsuleId}/details`);
  if (!res.ok) throw new Error('Failed to fetch capsule details');
  return res.json();
}

async function saveCapsuleModules(capsuleId, data) {
  const res = await fetch(`/api/expedition/capsule/${capsuleId}/modules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to save modules');
  return res.json();
}

async function saveModuleQuestionnaire(capsuleId, data) {
  const res = await fetch(`/api/expedition/capsule/${capsuleId}/questionnaire`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to save questionnaire');
  return res.json();
}

export default function CapsuleDetailsPage() {
  const { id, capId } = useParams();
  const router = useRouter();
  const { show } = useToast();
  const confirm = useConfirm();

  const [capsule, setCapsule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [savingModules, setSavingModules] = useState(false);
  const [savingQuestions, setSavingQuestions] = useState(false);
  const [dirty, setDirty] = useState(false);

  const { data: capsuleData, isLoading: isLoadingQuery, error: queryError } = useFetchExpeditionCapsuleDetailsQuery({ expeditionId: id, capsuleId: capId }, { skip: !id || !capId });

  useUnsavedChanges(dirty);

  useEffect(() => {
    if (capsuleData) {
      setCapsule(hydrateCapsule(capsuleData));
      setDirty(false);
    }
    if (queryError) {
      setLoadError(queryError instanceof Error ? queryError.message : 'Failed to load capsule details.');
    }
    setLoading(false);
  }, [capsuleData, queryError]);

  useEffect(() => {
    if (isLoadingQuery) {
      setLoading(true);
    }
  }, [isLoadingQuery]);

  const setDetails = useCallback((updater) => {
    setCapsule((prev) => {
      if (!prev) return prev;
      const next = { ...prev, details: updater(prev.details) };
      return next;
    });
    setDirty(true);
  }, []);

  const addModule = useCallback(() => {
    const newModule = createEmptyModule(capsule?.details?.modules?.length || 0);
    setDetails((details) => ({
      ...details,
      modules: [...details.modules, newModule],
      questionModuleId: details.questionModuleId || details.modules[0]?.id || newModule.id,
    }));
  }, [capsule?.details?.modules?.length, setDetails]);

  const updateModule = useCallback((moduleId, patch) => {
    setDetails((details) => ({
      ...details,
      modules: details.modules.map((module) =>
        module.id === moduleId ? { ...module, ...patch } : module
      ),
    }));
  }, [setDetails]);

  const removeModule = useCallback(async (moduleId) => {
    if (!capsule) return;
    if (capsule.details.modules.length <= 1) {
      show('At least one module is required.', 'info');
      return;
    }
    const ok = await confirm({
      title: 'Delete module?',
      description: 'This module will be permanently removed.',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    setDetails((details) => ({
      ...details,
      modules: details.modules
        .filter((module) => module.id !== moduleId)
        .map((module, index) => ({
          ...module,
          order: index,
          sl: index + 1,
          orderNumber: index + 1,
        })),
      questionModuleId:
        details.questionModuleId === moduleId
          ? details.modules.find((module) => module.id !== moduleId)?.id || ''
          : details.questionModuleId,
    }));
  }, [capsule, confirm, setDetails, show]);

  const addQuestion = useCallback(() => {
    setDetails((details) => ({
      ...details,
      questions: [...details.questions, createEmptyCapsuleQuestion(details.questions.length)],
    }));
  }, [setDetails]);

  const updateQuestion = useCallback((questionId, patch) => {
    setDetails((details) => ({
      ...details,
      questions: details.questions.map((question) =>
        question.id === questionId ? { ...question, ...patch } : question
      ),
    }));
  }, [setDetails]);

  const removeQuestion = useCallback(async (questionId) => {
    if (!capsule) return;
    if (capsule.details.questions.length <= 1) {
      show('At least one question is required.', 'info');
      return;
    }
    const ok = await confirm({
      title: 'Delete question?',
      description: 'This question will be permanently removed.',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    setDetails((details) => ({
      ...details,
      questions: details.questions.filter((question) => question.id !== questionId),
    }));
  }, [capsule, confirm, setDetails, show]);

  const saveModules = useCallback(async () => {
    if (!capsule) return;
    setSavingModules(true);
    try {
      const saved = await saveCapsuleModules(capId, {
        ...capsule,
        details: {
          ...capsule.details,
          questionModuleId:
            capsule.details.questionModuleId || capsule.details.modules[0]?.id || '',
        },
      });
      setCapsule(hydrateCapsule(saved));
      setDirty(false);
      show('Modules saved.', 'success');
    } catch (err) {
      show(err instanceof Error ? err.message : 'Save failed.', 'error');
    } finally {
      setSavingModules(false);
    }
  }, [capId, capsule, hydrateCapsule, show]);

  const saveQuestions = useCallback(async () => {
    if (!capsule) return;
    setSavingQuestions(true);
    try {
      const saved = await saveModuleQuestionnaire(capId, capsule);
      setCapsule(hydrateCapsule(saved));
      setDirty(false);
      show('Questions saved.', 'success');
    } catch (err) {
      show(err instanceof Error ? err.message : 'Save failed.', 'error');
    } finally {
      setSavingQuestions(false);
    }
  }, [capId, capsule, hydrateCapsule, show]);

  const modulesInvalid = useMemo(() => {
    if (!capsule) return true;
    return capsule.details.modules.some(
      (module) =>
        !module.title.trim() ||
        !module.roadmapBrief.trim() ||
        !module.description.trim() ||
        !module.estimatedTime.trim()
    );
  }, [capsule]);

  const questionsInvalid = useMemo(() => {
    if (!capsule) return true;
    return (
      !capsule.details.questionnaireTitle.trim() ||
      !capsule.details.questionnaireRoadmapBrief.trim() ||
      capsule.details.questions.some((question) => !question.title.trim())
    );
  }, [capsule]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-400">
        <FaSpinner className="animate-spin mr-2" size={20} />
        Loading details...
      </div>
    );
  }

  if (loadError || !capsule) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <FaExclamationCircle size={36} className="text-red-500 mb-3" />
        <p className="text-sm text-gray-700 mb-4">{loadError || 'Not found.'}</p>
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
    <div className="p-6 space-y-6">
      <header className="flex items-center gap-3">
        <button
          onClick={() => router.push(`/admin/expeditions/${id}/capsule/${capId}`)}
          className="p-1.5 hover:bg-gray-100 rounded-md"
          aria-label="Back"
        >
          <FaArrowLeft size={20} className="text-[#2E2A5A]" />
        </button>
        <h1 className="text-2xl font-bold text-[#2E2A5A]">Add Details</h1>
      </header>

      <section className="bg-[#FFF1F1]/40 rounded-xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-1 h-5 rounded bg-[#E63946]" />
            <h3 className="font-bold text-[#2E2A5A]">Modules</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={saveModules}
              disabled={savingModules || modulesInvalid}
              className="flex items-center gap-2 bg-[#2E2A5A] hover:bg-[#3d3870] disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              {savingModules ? <FaSpinner size={14} className="animate-spin" /> : <FaSave size={14} />}
              Save Changes
            </button>
            <button
              onClick={addModule}
              className="flex items-center gap-2 border border-[#2E2A5A]/30 text-[#2E2A5A] hover:bg-indigo-50 px-4 py-2 rounded-lg text-sm font-medium"
            >
              Add Module
              <FaPlus size={14} />
            </button>
          </div>
        </div>

        <div className="space-y-4 mb-5">
          <Field
            label="Title"
            required
            value={capsule.details.modulesTitle}
            onChange={(value) =>
              setDetails((details) => ({ ...details, modulesTitle: value }))
            }
          />
          <Field
            label="Roadmap Brief"
            required
            hint="(1 line)"
            hintColor="text-red-500"
            value={capsule.details.modulesRoadmapBrief}
            onChange={(value) =>
              setDetails((details) => ({ ...details, modulesRoadmapBrief: value }))
            }
            multiline
            rows={2}
          />
          <Field
            label="Estimated Time"
            required
            value={capsule.details.modulesEstimatedTime}
            onChange={(value) =>
              setDetails((details) => ({ ...details, modulesEstimatedTime: value }))
            }
          />
        </div>

        <div className="space-y-4">
          {capsule.details.modules.map((module, index) => (
            <ModuleCard
              key={module.id}
              module={module}
              index={index}
              onUpdate={(patch) => updateModule(module.id, patch)}
              onDelete={() => removeModule(module.id)}
            />
          ))}
        </div>
      </section>

      <section className="bg-[#F1FFF4]/40 rounded-xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-1 h-5 rounded bg-[#22C55E]" />
            <h3 className="font-bold text-[#2E2A5A]">Questionnaire</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={saveQuestions}
              disabled={savingQuestions || questionsInvalid}
              className="flex items-center gap-2 bg-[#2E2A5A] hover:bg-[#3d3870] disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              {savingQuestions ? (
                <FaSpinner size={14} className="animate-spin" />
              ) : (
                <FaSave size={14} />
              )}
              Save Changes
            </button>
            <button
              onClick={addQuestion}
              className="flex items-center gap-2 border border-[#2E2A5A]/30 text-[#2E2A5A] hover:bg-indigo-50 px-4 py-2 rounded-lg text-sm font-medium"
            >
              Add Question
              <FaPlus size={14} />
            </button>
          </div>
        </div>

        <div className="space-y-4 mb-5">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1.5">
              Link Questionnaire To Module <span className="text-red-500">*</span>
            </label>
            <select
              value={capsule.details.questionModuleId || ''}
              onChange={(e) =>
                setDetails((details) => ({
                  ...details,
                  questionModuleId: e.target.value,
                }))
              }
              className="w-full px-3 py-2.5 text-sm border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#2E2A5A]/30 focus:border-[#2E2A5A]"
            >
              {capsule.details.modules.map((module, index) => (
                <option key={module.id} value={module.id}>
                  {module.title || `Module ${String(index + 1).padStart(2, '0')}`}
                </option>
              ))}
            </select>
          </div>
          <Field
            label="Title"
            required
            value={capsule.details.questionnaireTitle}
            onChange={(value) =>
              setDetails((details) => ({ ...details, questionnaireTitle: value }))
            }
          />
          <Field
            label="Roadmap Brief"
            required
            hint="(1 line)"
            hintColor="text-red-500"
            value={capsule.details.questionnaireRoadmapBrief}
            onChange={(value) =>
              setDetails((details) => ({ ...details, questionnaireRoadmapBrief: value }))
            }
            multiline
            rows={2}
          />
        </div>

        <div className="space-y-4">
          {capsule.details.questions.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              index={index}
              onUpdate={(patch) => updateQuestion(question.id, patch)}
              onDelete={() => removeQuestion(question.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function ModuleCard({ module, index, onUpdate, onDelete }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-[#2E2A5A]">
          Module {String(index + 1).padStart(2, '0')}
        </h4>
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-[#2E2A5A] text-white rounded-md">
            <FaCheck size={14} />
          </span>
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-md"
            aria-label="Delete module"
          >
            <FaTrashAlt size={14} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <Field
          label="Title"
          required
          value={module.title}
          onChange={(value) => onUpdate({ title: value })}
        />
        <Field
          label="Roadmap Brief"
          value={module.roadmapBrief}
          onChange={(value) => onUpdate({ roadmapBrief: value })}
          multiline
          rows={2}
        />
        <Field
          label="Description"
          required
          value={module.description}
          onChange={(value) => onUpdate({ description: value })}
          multiline
          rows={4}
        />
        <Field
          label="Estimated Time"
          required
          value={module.estimatedTime}
          onChange={(value) => onUpdate({ estimatedTime: value })}
        />
        <MediaField
          label="Module Video"
          required
          accept="video/*"
          file={module.videoFile}
          onFileChange={(file) => onUpdate({ videoFile: file })}
          existingUrl={module.videoUrl}
          onUrlChange={(value) => onUpdate({ videoUrl: value })}
          placeholder="https://example.com/module-video.mp4"
        />
      </div>
    </div>
  );
}

function QuestionCard({ question, index, onUpdate, onDelete }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-[#2E2A5A]">
          Question {String(index + 1).padStart(2, '0')}
        </h4>
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-[#2E2A5A] text-white rounded-md">
            <FaCheck size={14} />
          </span>
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-md"
            aria-label="Delete question"
          >
            <FaTrashAlt size={14} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <Field
          label="Title"
          required
          value={question.title}
          onChange={(value) => onUpdate({ title: value })}
          placeholder="Enter question"
        />
        <Field
          label="Help Text / Instructions"
          value={question.helpText}
          onChange={(value) => onUpdate({ helpText: value })}
          placeholder="Optional help text for users"
        />
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
  placeholder = '',
  type = 'text',
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
          placeholder={placeholder}
          rows={rows}
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
