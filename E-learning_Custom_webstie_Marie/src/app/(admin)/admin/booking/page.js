'use client';

import React, { useState } from 'react';
import { IoMdNotifications } from 'react-icons/io';
import { useFetchAccessRequestsQuery, useApproveAccessRequestMutation, useRejectAccessRequestMutation, useFetchInterviewsQuery, useFetchNoShowsQuery } from '@/redux/api/adminApi';
import { useToast } from '@/Components/Admin/hooks/useToast';
import { useConfirm } from '@/Components/Admin/hooks/useConfirm';

const TABS = [
  { key: 'access', label: 'Calendly Access Request' },
  { key: 'interviews', label: 'Interviews Scheduled' },
  { key: 'no-shows', label: 'No-Shows' },
];

function StatusBadge({ status }) {
  const config = {
    requested: { bg: 'bg-amber-50 border-amber-300', text: 'text-amber-700', icon: '⏳' },
    booked: { bg: 'bg-emerald-50 border-emerald-300', text: 'text-emerald-700', icon: '✓' },
    completed: { bg: 'bg-blue-50 border-blue-300', text: 'text-blue-700', icon: '✓' },
    cancelled: { bg: 'bg-gray-50 border-gray-300', text: 'text-gray-600', icon: '✕' },
    no_show: { bg: 'bg-red-50 border-red-300', text: 'text-red-700', icon: '✕' },
    approved: { bg: 'bg-emerald-50 border-emerald-300', text: 'text-emerald-700', icon: '✓' },
    rejected: { bg: 'bg-red-50 border-red-300', text: 'text-red-700', icon: '✕' },
  };
  const c = config[status] || config.booked;
  const label = status === 'no_show' ? 'No Show' : status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.text}`}>
      <span className="text-[10px]">{c.icon}</span>
      {label}
    </span>
  );
}

export default function BookingListPage() {
  const { show } = useToast();
  const confirm = useConfirm();
  const [tab, setTab] = useState('access');
  const [actionLoading, setActionLoading] = useState(null);

  const { data: accessData, isLoading: accessLoading } = useFetchAccessRequestsQuery({ page: 1, pageSize: 10 });
  const { data: interviewsData, isLoading: interviewsLoading } = useFetchInterviewsQuery({ page: 1, pageSize: 10 });
  const { data: noShowsData, isLoading: noShowsLoading } = useFetchNoShowsQuery({ page: 1, pageSize: 10 });
  const [approveAccessRequest] = useApproveAccessRequestMutation();
  const [rejectAccessRequest] = useRejectAccessRequestMutation();

  const accessRequests = accessData?.data || [];
  const interviews = interviewsData?.data || [];
  const noShows = noShowsData?.data || [];

  const handleApprove = async (id) => {
    setActionLoading(id + '_approve');
    try {
      await approveAccessRequest(id).unwrap();
      show('Request approved', 'success');
    } catch (err) {
      show('Failed to approve', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(id + '_reject');
    try {
      await rejectAccessRequest(id).unwrap();
      show('Request rejected', 'success');
    } catch (err) {
      show('Failed to reject', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const columns = {
    access: ['Mentor No.', 'Email Address', 'Role', 'Status', 'Request Date', 'Request Time', 'Actions'],
    interviews: ['Name', 'Email Address', 'Created At', 'End Time', 'Status', 'Actions'],
    'no-shows': ['Name', 'Email Address', 'Created At', 'End Time', 'Status', 'Actions'],
  };

  const isLoading = accessLoading || interviewsLoading || noShowsLoading;

  const mockData = {
    access: accessRequests,
    interviews: interviews,
    'no-shows': noShows,
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-indigo-900">Interview</h1>
          <p className="text-sm text-gray-600 mt-1">Review And Manage Mentor Interview Requests</p>
        </div>
        <button className="relative p-3 bg-indigo-900 text-white rounded-xl hover:bg-indigo-800 transition">
          <IoMdNotifications className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-white" />
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex border-b border-gray-200">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex-1 py-4 text-sm font-semibold text-center transition-colors relative ${tab === t.key ? 'text-indigo-900' : 'text-indigo-400 hover:text-indigo-700'}`}>
              {t.label}
              {tab === t.key && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-indigo-900 rounded-t" />}
            </button>
          ))}
        </div>

        <div className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-indigo-50/60">
                  {columns[tab].map(col => (
                    <th key={col} className="text-left px-4 py-3 text-xs font-semibold text-indigo-900">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr><td colSpan={columns[tab].length} className="text-center py-8 text-gray-400">Loading...</td></tr>
                ) : mockData[tab].length === 0 ? (
                  <tr><td colSpan={columns[tab].length} className="text-center py-16 text-gray-400">No data available</td></tr>
                ) : (
                  mockData[tab].map(row => (
                    <tr key={row.id} className="hover:bg-gray-50/50">
                      {tab === 'access' && (
                        <>
                          <td className="px-4 py-4 font-medium text-gray-900">{row.mentorNo}</td>
                          <td className="px-4 py-4 text-gray-600">{row.email}</td>
                          <td className="px-4 py-4"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-300">{row.role}</span></td>
                          <td className="px-4 py-4"><StatusBadge status={row.status} /></td>
                          <td className="px-4 py-4 text-gray-600">{row.requestDate}</td>
                          <td className="px-4 py-4 text-gray-600">{row.requestTime}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => handleApprove(row.id)} disabled={actionLoading === row.id + '_approve'} className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded-full hover:bg-emerald-600 disabled:opacity-50 transition">Approve</button>
                              <button onClick={() => handleReject(row.id)} disabled={actionLoading === row.id + '_reject'} className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-full hover:bg-red-600 disabled:opacity-50 transition">Reject</button>
                            </div>
                          </td>
                        </>
                      )}
                      {tab === 'interviews' && (
                        <>
                          <td className="px-4 py-4 font-medium text-gray-900">{row.name}</td>
                          <td className="px-4 py-4 text-gray-600">{row.email}</td>
                          <td className="px-4 py-4 text-gray-600">{row.createdAt}</td>
                          <td className="px-4 py-4 text-gray-600">{row.endTime}</td>
                          <td className="px-4 py-4 text-center"><StatusBadge status={row.status} /></td>
                          <td className="px-4 py-4 text-center"><button className="inline-flex items-center gap-1.5 px-4 py-1.5 border border-gray-300 rounded-full text-xs font-medium text-gray-700 hover:bg-gray-50 transition">View Details</button></td>
                        </>
                      )}
                      {tab === 'no-shows' && (
                        <>
                          <td className="px-4 py-4 font-medium text-gray-900">{row.name}</td>
                          <td className="px-4 py-4 text-gray-600">{row.email}</td>
                          <td className="px-4 py-4 text-gray-600">{row.createdAt}</td>
                          <td className="px-4 py-4 text-gray-600">{row.endTime}</td>
                          <td className="px-4 py-4 text-center"><StatusBadge status={row.status} /></td>
                          <td className="px-4 py-4 text-center"><button className="inline-flex items-center gap-1.5 px-4 py-1.5 border border-gray-300 rounded-full text-xs font-medium text-gray-700 hover:bg-gray-50 transition">View Details</button></td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}