'use client';

import React, { useState } from 'react';
import { FaSearch, FaPlus, FaPencilAlt, FaTrashAlt, FaFileAlt } from 'react-icons/fa';
import UserPageHeader from '@/Components/Admin/components/UserPageHeader';
import SearchToolbar from '@/Components/Admin/components/SearchToolbar';
import { useFetchSectionsQuery, useDeleteSectionMutation } from '@/redux/api/adminApi';
import { useDebounce } from '@/Components/Admin/hooks/useDebounce';
import { useToast } from '@/Components/Admin/hooks/useToast';
import { useConfirm } from '@/Components/Admin/hooks/useConfirm';
import { useRouter } from 'next/navigation';

export default function QuestionnairePage() {
  const router = useRouter();
  const { show } = useToast();
  const confirm = useConfirm();
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search, 300);

  const { data: sectionsData, isLoading } = useFetchSectionsQuery(debounced);
  const [deleteSection] = useDeleteSectionMutation();

  const sections = sectionsData?.data || [];

  const filteredSections = sections.filter(s => {
    if (!debounced) return true;
    return s.title.toLowerCase().includes(debounced.toLowerCase()) || s.brief.toLowerCase().includes(debounced.toLowerCase());
  });

  const handleDelete = async (id, title) => {
    const ok = await confirm({
      title: 'Delete Section',
      description: `Delete "${title}"? All questions within it will also be removed.`,
      confirmLabel: 'Delete',
      destructive: true
    });
    if (!ok) return;
    try {
      await deleteSection(id).unwrap();
      show('Section deleted', 'success');
    } catch (err) {
      show('Failed to delete section', 'error');
    }
  };

  const handleEdit = (id) => {
    router.push(`/admin/questionnaire/section/${id}`);
  };

  const handleCreate = () => {
    router.push('/admin/questionnaire/section/new');
  };

  return (
    <div className="p-6">
      <UserPageHeader title="Free Questionnaire" subtitle="Create And Manage The Free Questionnaire Sections" />

      <div className="mt-5">
        <SearchToolbar
          query={search}
          onQueryChange={setSearch}
          placeholder="Search section..."
        />
      </div>

      <div className="mt-5 bg-white rounded-xl border border-gray-200 p-6 min-h-[60vh]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-[#2E2A5A] rounded-full" />
            <h2 className="text-sm font-bold text-[#2E2A5A]">Questionnaire Sections</h2>
          </div>
          <button onClick={handleCreate} className="flex items-center gap-2 bg-[#2E2A5A] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#3d3875] transition">
            Create New Section <FaPlus size={16} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin w-8 h-8 border-2 border-[#2E2A5A] border-t-transparent rounded-full" />
          </div>
        ) : filteredSections.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-gray-400">
            <FaFileAlt size={56} strokeWidth={1} className="mb-3 text-gray-300" />
            <p className="text-sm">No sections found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSections.map((section) => (
              <div key={section.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-sm transition">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <FaFileAlt size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-900">{section.title}</h3>
                    <p className="text-xs text-gray-500">{section.brief}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${section.category === 'free' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                    {section.category}
                  </span>
                  <button onClick={() => handleEdit(section.id)} className="p-2 text-gray-400 hover:text-[#2E2A5A] transition">
                    <FaPencilAlt size={16} />
                  </button>
                  <button onClick={() => handleDelete(section.id, section.title)} className="p-2 text-gray-400 hover:text-red-600 transition">
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