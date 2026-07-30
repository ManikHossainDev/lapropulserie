'use client';

import React, { useState } from 'react';
import { FaGraduationCap, FaStar, FaUsers, FaPencilAlt, FaTrashAlt } from 'react-icons/fa';
import { FiTarget } from 'react-icons/fi';
import UserAvatar from '@/Components/Admin/components/UserAvatar';
import StatusPill from '@/Components/Admin/components/StatusPill';
import Pagination from '@/Components/Admin/components/Pagination';
import { useFetchUsersQuery, useUpdateUserStatusMutation, useDeleteUserMutation } from '@/redux/api/adminApi';
import { useToast } from '@/Components/Admin/hooks/useToast';
import { useConfirm } from '@/Components/Admin/hooks/useConfirm';

function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function SummaryCard({ label, value, icon: Icon, color }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className={`flex h-12 w-12 items-center justify-center rounded-lg text-white ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="mt-0.5 text-2xl font-bold text-[#2E2A5A]">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}

export default function AllUsersPage() {
  const { show } = useToast();
  const confirm = useConfirm();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);

  const { data: usersData, isLoading } = useFetchUsersQuery({ q: query, role: tab === 'all' ? undefined : tab, status: status === 'all' ? undefined : status, page, pageSize: 10 });
  const [updateUserStatus] = useUpdateUserStatusMutation();
  const [deleteUser] = useDeleteUserMutation();

  console.log("usersData", usersData)
  const items = usersData?.data || [];
  const totalPages = usersData?.meta?.totalPages || 1;
  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      await updateUserStatus({ userId: user.id, status: nextStatus }).unwrap();
      show(`${user.name} is now ${nextStatus}`, 'success');
    } catch (err) {
      show('Failed to update status', 'error');
    }
  };

  const handleDelete = async (user) => {
    const ok = await confirm({ title: 'Delete user?', description: `${user.name} will be permanently removed.`, confirmLabel: 'Delete', destructive: true });
    if (!ok) return;
    try {
      await deleteUser(user.id).unwrap();
      show(`${user.name} has been deleted`, 'success');
    } catch (err) {
      show('Failed to delete user', 'error');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#2E2A5A]">All Users</h1>
        <p className="mt-1 text-sm text-gray-600">Manage And Monitor Platform Users</p>
      </div>

      <div className="mt-5 flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <input type="text" placeholder="Search users..." value={query} onChange={(e) => setQuery(e.target.value)} className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200" />
        <div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200">
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500">
                <th className="px-6 py-3.5">User</th>
                <th className="px-6 py-3.5">Email Address</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Details</th>
                <th className="px-6 py-3.5">Joined</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="px-6 py-16 text-center text-sm text-gray-400">Loading users...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-16 text-center text-sm text-gray-400">No users found</td></tr>
              ) : (
                items.map((u) => (
                  <tr key={u.id} className="border-t border-gray-50 transition hover:bg-gray-50/50">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={u.name} />
                        <span className="font-medium text-[#2E2A5A]">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-gray-600">{u.email}</td>
                    <td className="px-6 py-3">
                      {u.role === 'mentor' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700"><FaGraduationCap size={12} /> Mentor</span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700"><FiTarget size={12} /> Mentee</span>
                      )}
                    </td>
                    <td className="px-6 py-3"><StatusPill status={u.status} /></td>
                    <td className="px-6 py-3 text-xs text-gray-600">
                      {u.role === 'mentor' ? (
                        <span className="inline-flex items-center gap-1"><FaStar size={12} className="fill-amber-400 text-amber-400" /><span className="font-medium">{u.rating}</span><span className="text-gray-400">·</span><span>{u.subscription}</span></span>
                      ) : (
                        <span className="capitalize">{u.journeyType}</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-gray-600">{fmtDate(u.joinedAt)}</td>
                    <td className="px-6 py-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleToggleStatus(u)} className="rounded-lg px-3 py-1.5 text-xs hover:bg-gray-100">{u.status === 'active' ? 'Deactivate' : 'Activate'}</button>
                        <button onClick={() => handleDelete(u)} className="rounded-lg px-3 py-1.5 text-xs text-red-600 hover:bg-red-50">Delete</button>
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