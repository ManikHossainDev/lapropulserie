'use client';

import React, { useState } from 'react';
import { FaGraduationCap, FaStar, FaUsers } from 'react-icons/fa';
import UserAvatar from '@/Components/Admin/components/UserAvatar';
import StatusPill from '@/Components/Admin/components/StatusPill';
import SearchToolbar from '@/Components/Admin/components/SearchToolbar';
import RowActions from '@/Components/Admin/components/RowActions';
import UserPageHeader from '@/Components/Admin/components/UserPageHeader';
import Pagination from '@/Components/Admin/components/Pagination';
import { useFetchMentorsQuery, useUpdateUserStatusMutation, useDeleteUserMutation } from '@/redux/api/adminApi';
import { useDebounce } from '@/Components/Admin/hooks/useDebounce';
import { useToast } from '@/Components/Admin/hooks/useToast';
import { useConfirm } from '@/Components/Admin/hooks/useConfirm';

const SUB_PILL = {
  'Stella': 'text-cyan-600',
  'Universal Master': 'text-pink-600',
  'Galactic': 'text-amber-600',
};

function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function MentorsPage() {
  const { show } = useToast();
  const confirm = useConfirm();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('all');
  const [subscription, setSubscription] = useState('all');
  const debounced = useDebounce(query, 250);

  const { data: mentorsData, isLoading } = useFetchMentorsQuery({ q: debounced, status: status === 'all' ? undefined : status, subscription: subscription === 'all' ? undefined : subscription, page, pageSize: 9 });
  const [updateUserStatus] = useUpdateUserStatusMutation();
  const [deleteUser] = useDeleteUserMutation();

  const items = mentorsData?.data || [];
  const totalPages = mentorsData?.meta?.totalPages || 1;

  const handleDelete = async (m) => {
    const ok = await confirm({ title: 'Delete mentor?', description: `${m.name} will be permanently removed from the platform.`, confirmLabel: 'Delete', destructive: true });
    if (!ok) return;
    try {
      await deleteUser(m.id).unwrap();
      show(`${m.name} has been deleted`, 'success');
    } catch {
      show('Failed to delete mentor', 'error');
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

  const hasActiveFilters = status !== 'all' || subscription !== 'all';

  return (
    <div className="p-6">
      <UserPageHeader title="Mentors" subtitle="Manage And Monitor Platform Mentors" />

      <div className="mt-5">
        <SearchToolbar
          query={query}
          onQueryChange={setQuery}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={() => { setStatus('all'); setSubscription('all'); }}
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
                <label className="mb-1.5 block text-xs font-medium text-gray-600">Subscription</label>
                <select value={subscription} onChange={(e) => setSubscription(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200">
                  <option value="all">All</option>
                  <option value="Stella">Stella</option>
                  <option value="Galactic">Galactic</option>
                  <option value="Universal Master">Universal Master</option>
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
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Subscription</th>
                <th className="px-6 py-3.5">Rating</th>
                <th className="px-6 py-3.5">Joined</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && items.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-16 text-center text-sm text-gray-400">Loading mentors...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-16 text-center text-sm text-gray-400">No mentors found</td></tr>
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
                    <td className="px-6 py-3"><StatusPill status={m.status} /></td>
                    <td className={`px-6 py-3 font-medium ${SUB_PILL[m.subscription] || 'text-gray-600'}`}>{m.subscription}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-1 text-gray-700">
                        <FaStar size={14} className="fill-amber-400 text-amber-400" />
                        <span className="font-medium">{m?.rating?.toFixed(1)}</span>
                      </div>
                    </td>
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