'use client';

import React, { useState } from 'react';
import { FiTarget, FaUsers, FaStar } from 'react-icons/fi';
import UserAvatar from '@/Components/Admin/components/UserAvatar';
import StatusPill from '@/Components/Admin/components/StatusPill';
import SearchToolbar from '@/Components/Admin/components/SearchToolbar';
import RowActions from '@/Components/Admin/components/RowActions';
import UserPageHeader from '@/Components/Admin/components/UserPageHeader';
import Pagination from '@/Components/Admin/components/Pagination';
import { useFetchMenteesQuery, useUpdateUserStatusMutation, useDeleteUserMutation } from '@/redux/api/adminApi';
import { useDebounce } from '@/Components/Admin/hooks/useDebounce';
import { useToast } from '@/Components/Admin/hooks/useToast';
import { useConfirm } from '@/Components/Admin/hooks/useConfirm';

function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function MenteesPage() {
  const { show } = useToast();
  const confirm = useConfirm();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('all');
  const [journeyType, setJourneyType] = useState('all');
  const debounced = useDebounce(query, 250);

  const { data: menteesData, isLoading } = useFetchMenteesQuery({ q: debounced, status: status === 'all' ? undefined : status, journeyType: journeyType === 'all' ? undefined : journeyType, page, pageSize: 9 });
  const [updateUserStatus] = useUpdateUserStatusMutation();
  const [deleteUser] = useDeleteUserMutation();

  const items = menteesData?.data || [];
  const totalPages = menteesData?.meta?.totalPages || 1;

  const handleDelete = async (m) => {
    const ok = await confirm({ title: 'Delete mentee?', description: `${m.name} will be permanently removed from the platform.`, confirmLabel: 'Delete', destructive: true });
    if (!ok) return;
    try {
      await deleteUser(m.id).unwrap();
      show(`${m.name} has been deleted`, 'success');
    } catch {
      show('Failed to delete mentee', 'error');
    }
  };

  const handleToggle = async (m) => {
    const next = m.status === 'active' ? 'inactive' : 'active';
    try {
      await updateUserStatus({ userId: m.id, status: next }).unwrap();
      show(`${m.name} is now ${next}`, 'success');
    } catch {
      show('Failed to update status', 'error');
    }
  };

  const hasActiveFilters = status !== 'all' || journeyType !== 'all';

  return (
    <div className="p-6">
      <UserPageHeader title="Mentees" subtitle="Manage And Monitor Platform Mentees" />

      <div className="mt-5">
        <SearchToolbar
          query={query}
          onQueryChange={setQuery}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={() => { setStatus('all'); setJourneyType('all'); }}
          filters={
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200">
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">Journey Type</label>
                <select value={journeyType} onChange={(e) => setJourneyType(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200">
                  <option value="all">All</option>
                  <option value="Exploration">Exploration</option>
                  <option value="Quick Start">Quick Start</option>
                  <option value="Deep Dive">Deep Dive</option>
                </select>
              </div>
            </div>
          }
        />
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500">
                <th className="px-6 py-3.5">User</th>
                <th className="px-6 py-3.5">Email Address</th>
                <th className="px-6 py-3.5">Journey Type</th>
                <th className="px-6 py-3.5">Progress</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Joined</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && items.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-16 text-center text-sm text-gray-400">Loading mentees...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-16 text-center text-sm text-gray-400">No mentees found</td></tr>
              ) : (
                items.map((m) => (
                  <tr key={m.id} className="border-t border-gray-50 transition hover:bg-gray-50/50">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={m.name} />
                        <span className="font-medium text-[#2E2A5A]">{m.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-gray-600">{m.email}</td>
                    <td className="px-6 py-3 text-gray-600">{m.journeyType}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 rounded-full bg-gray-200"><div className="h-full rounded-full bg-purple-500" style={{ width: `${m.progress}%` }} /></div>
                        <span className="text-xs text-gray-600">{m.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-3"><StatusPill status={m.status} /></td>
                    <td className="px-6 py-3 text-gray-600">{fmtDate(m.joinedAt)}</td>
                    <td className="px-6 py-3">
                      <div className="flex justify-end">
                        <RowActions status={m.status} onDelete={() => handleDelete(m)} onToggleStatus={() => handleToggle(m)} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-gray-50 px-6 py-4">
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>
    </div>
  );
}