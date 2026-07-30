'use client';

import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaSpinner, FaPlus, FaSave, FaTrashAlt, FaGripLines } from 'react-icons/fa';
import { IoMdNotifications } from 'react-icons/io';
import { useRouter, useParams } from 'next/navigation';
import { useFetchSectionByIdQuery, useSaveSectionMutation } from '@/redux/api/adminApi';
import { useToast } from '@/Components/Admin/hooks/useToast';
import { useUnsavedChanges } from '@/Components/Admin/hooks/useUnsavedChanges';

const QUESTION_TYPES = ['text', 'textarea', 'select', 'radio', 'checkbox', 'scale'];

function createEmptySection() {
  return {
    id: '',
    title: '',
    brief: '',
    description: '',
    questions: [],
    order: 0,
  };
}

function createEmptyQuestion(index = 0) {
  return {
    id: `q_${Date.now()}_${index}`,
    text: '',
    type: 'text',
    required: false,
    options: [],
    placeholder: '',
  };
}

export default function SectionEditorPage() {
  const { id } = useParams();
  const router = useRouter();
  const { show } = useToast();

  const isNew = !id || id === 'new';

  const [section, setSection] = useState(() => createEmptySection());
  const [saving, setSaving] = useState(false);

  useUnsavedChanges(true);

  const { data: sectionData, isLoading } = useFetchSectionByIdQuery(id, { skip: isNew });
  const [saveSection] = useSaveSectionMutation();

  useEffect(() => {
    if (sectionData) {
      setSection(sectionData);
    }
  }, [sectionData]);

  useEffect(() => {
    if (isNew) {
      setSection(createEmptySection());
    }
  }, [isNew]);

  async function handleSave() {
    if (!section.title.trim()) {
      show('Section title is required', 'error');
      return;
    }
    setSaving(true);
    try {
      await saveSection(section).unwrap();
      show('Section saved', 'success');
      router.push('/admin/questionnaire');
    } catch {
      show('Failed to save section', 'error');
    } finally {
      setSaving(false);
    }
  }

  function updateField(field, value) {
    setSection((prev) => ({ ...prev, [field]: value }));
  }

  function addQuestion() {
    setSection((prev) => ({
      ...prev,
      questions: [...prev.questions, createEmptyQuestion(prev.questions.length)],
    }));
  }

  function updateQuestion(idx, field, value) {
    setSection((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => (i === idx ? { ...q, [field]: value } : q)),
    }));
  }

  function removeQuestion(idx) {
    setSection((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== idx),
    }));
  }

  function addOption(qIdx) {
    const newOptions = [...(section.questions[qIdx].options || []), ''];
    updateQuestion(qIdx, 'options', newOptions);
  }

  function updateOption(qIdx, optIdx, value) {
    const updated = [...section.questions[qIdx].options];
    updated[optIdx] = value;
    updateQuestion(qIdx, 'options', updated);
  }

  function removeOption(qIdx, optIdx) {
    const updated = section.questions[qIdx].options.filter((_, i) => i !== optIdx);
    updateQuestion(qIdx, 'options', updated);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <FaSpinner className="w-8 h-8 animate-spin text-[#2E2A5A]" />
      </div>
    );
  }

  return (
    <div className="px-6 py-5">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/admin/questionnaire')} className="p-1.5 hover:bg-gray-100 rounded-md">
            <FaArrowLeft size={20} className="text-[#2E2A5A]" />
          </button>
          <h1 className="text-2xl font-bold text-[#2E2A5A]">{isNew ? 'New Section' : 'Edit Section'}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-[#2E2A5A] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#3d3875] disabled:opacity-50">
            <FaSave size={16} /> {saving ? 'Saving...' : 'Save'}
          </button>
          <button className="relative rounded-lg bg-gray-200 p-2.5 text-gray-700 hover:bg-gray-300">
            <IoMdNotifications size={18} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-[#2E2A5A] mb-4">Section Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                <input type="text" value={section.title} onChange={(e) => updateField('title', e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 outline-none" placeholder="Section title" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Brief</label>
                <input type="text" value={section.brief} onChange={(e) => updateField('brief', e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 outline-none" placeholder="Brief description" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea rows={3} value={section.description} onChange={(e) => updateField('description', e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 outline-none resize-none" placeholder="Detailed description" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#2E2A5A]">Questions</h2>
              <button onClick={addQuestion} className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-100 transition">
                <FaPlus size={16} /> Add Question
              </button>
            </div>
            {section.questions?.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">No questions yet. Click "Add Question" to create one.</div>
            ) : (
              <div className="space-y-6">
                {section.questions?.map((q, qIdx) => (
                  <div key={q.id || qIdx} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <FaGripLines size={16} className="text-gray-400 cursor-move" />
                      <span className="text-sm font-medium text-gray-600">Question {qIdx + 1}</span>
                      <button onClick={() => removeQuestion(qIdx)} className="ml-auto p-1 text-red-500 hover:bg-red-50 rounded transition">
                        <FaTrashAlt size={14} />
                      </button>
                    </div>
                    <div className="pl-8 space-y-3">
                      <input type="text" value={q.text} onChange={(e) => updateQuestion(qIdx, 'text', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Question text" />
                      <div className="flex gap-3">
                        <select value={q.type} onChange={(e) => updateQuestion(qIdx, 'type', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                          {QUESTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={q.required} onChange={(e) => updateQuestion(qIdx, 'required', e.target.checked)} className="accent-indigo-600" />
                          Required
                        </label>
                      </div>
                      {(q.type === 'select' || q.type === 'radio' || q.type === 'checkbox') && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Options</span>
                            <button onClick={() => addOption(qIdx)} className="text-xs text-indigo-600 hover:text-indigo-700">+ Add option</button>
                          </div>
                          {q.options?.map((opt, oIdx) => (
                            <div key={oIdx} className="flex items-center gap-2">
                              <input type="text" value={opt} onChange={(e) => updateOption(qIdx, oIdx, e.target.value)} className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm" placeholder={`Option ${oIdx + 1}`} />
                              <button onClick={() => removeOption(qIdx, oIdx)} className="p-1 text-red-500"><Trash2 size={12} /></button>
                            </div>
                          ))}
                        </div>
                      )}
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
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-sm text-gray-900">{section.title || 'Section Title'}</p>
                <p className="text-xs text-gray-500 mt-1">{section.brief || 'Brief description...'}</p>
              </div>
              <p className="text-xs text-gray-400">{section.questions?.length || 0} questions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}