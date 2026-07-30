'use client';

import React, { useState } from 'react';
import { FaDollarSign, FaTh, FaGlobe, FaChartBar, FaGraduationCap, FaCoins } from 'react-icons/fa';
import { IoMdNotifications } from 'react-icons/io';
import { useFetchCapsulesFinanceStatsQuery, useFetchGrowthSeriesQuery, useFetchTopCapsulesQuery, useFetchTransactionsQuery } from '@/redux/api/adminApi';

function StatsCard({ icon: Icon, value, label, growth, iconBg }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg text-white ${iconBg}`}>
          <Icon size={20} />
        </div>
        {typeof growth === 'number' && (
          <span className={`text-xs font-semibold ${growth >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {growth >= 0 ? '+' : ''}{growth}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <div className="text-2xl font-bold text-[#2E2A5A]">{value}</div>
        <div className="mt-1 text-xs text-gray-500">{label}</div>
      </div>
    </div>
  );
}

export default function FinanceCapsulesPage() {
  const [page, setPage] = useState(1);
  const [range, setRange] = useState('monthly');
  const [txType, setTxType] = useState('all');
  const pageSize = 9;

  const { data: statsData } = useFetchCapsulesFinanceStatsQuery();
  const { data: revenueData } = useFetchGrowthSeriesQuery(range);
  const { data: topCapsulesData } = useFetchTopCapsulesQuery();
  const { data: transactionsData, isLoading } = useFetchTransactionsQuery({ type: txType, page, pageSize });

  const stats = statsData;
  const revenue = revenueData || [];
  const topCapsules = topCapsulesData || [];
  const transactions = transactionsData?.items || [];
  const total = transactionsData?.total || 0;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="px-6 py-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2E2A5A]">All Capsules</h1>
          <p className="mt-1 text-sm text-gray-600">Monitor revenue, subscriptions, and all capsules</p>
        </div>
        <button type="button" className="relative rounded-lg bg-gray-200 p-2.5 text-gray-700 transition hover:bg-gray-300">
          <IoMdNotifications size={18} />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-amber-500" />
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatsCard icon={FaDollarSign} value={`$${stats?.totalRevenue?.toLocaleString() ?? '—'}`} label="Total Revenue" growth={stats?.totalRevenueGrowth} iconBg="bg-indigo-700" />
        <StatsCard icon={FaDollarSign} value={`$${stats?.expeditionRevenue?.toLocaleString() ?? '—'}`} label="Total Revenue (Expedition)" growth={stats?.expeditionRevenueGrowth} iconBg="bg-purple-600" />
        <StatsCard icon={FaDollarSign} value={`$${stats?.individualRevenue?.toLocaleString() ?? '—'}`} label="Total Revenue (Individual Capsules)" growth={stats?.individualRevenueGrowth} iconBg="bg-amber-500" />
        <StatsCard icon={FaTh} value={`${stats?.totalIndividualCapsules ?? '—'}`} label="Total Individual Capsules" iconBg="bg-cyan-500" />
        <StatsCard icon={FaGlobe} value={`${stats?.totalExpeditionCapsules ?? '—'}`} label="Total Expedition Journey's Capsules" iconBg="bg-pink-500" />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FaChartBar size={18} className="text-[#2E2A5A]" />
              <h3 className="text-base font-bold text-[#2E2A5A]">Growth Revenue</h3>
            </div>
            <div className="flex rounded-lg bg-gray-100 p-1 text-xs">
              {['monthly', 'quarterly', 'annually'].map((r) => (
                <button key={r} onClick={() => setRange(r)} className={`rounded-md px-3 py-1.5 capitalize transition ${range === r ? 'bg-white text-[#2E2A5A] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[260px] flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-400">
              {revenue.length > 0
                ? `Chart: ${revenue.map(r => `${r.label}: $${r.expedition + r.individual}`).join(' | ')}`
                : 'Revenue chart coming soon...'}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <FaGraduationCap size={18} className="text-[#2E2A5A]" />
            <h3 className="text-base font-bold text-[#2E2A5A]">Top Capsules By Revenue</h3>
          </div>
          <div className="mt-4 max-h-80 space-y-3 overflow-y-auto pr-1">
            {topCapsules.map((c, i) => (
              <div key={c.id} className="flex items-center gap-3 rounded-lg border border-gray-100 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#2E2A5A] text-xs font-bold text-white">
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-[#2E2A5A]">{c.title}</div>
                  <div className="mt-0.5 text-xs text-gray-500">
                    Revenue:<span className="font-semibold text-[#2E2A5A]"> ${c.revenue.toLocaleString()}</span> · Sales:
                    <span className="font-semibold text-[#2E2A5A]"> {c.sales}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FaCoins size={18} className="text-[#2E2A5A]" />
            <h3 className="text-base font-bold text-[#2E2A5A]">Recent Transactions</h3>
          </div>
          <div className="flex rounded-lg bg-gray-100 p-1 text-xs">
            {['all', 'journey', 'capsule'].map((t) => (
              <button key={t} onClick={() => { setTxType(t); setPage(1); }} className={`rounded-md px-3 py-1.5 capitalize transition ${txType === t ? 'bg-white text-[#2E2A5A] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {t === 'all' ? 'All' : t === 'journey' ? 'Journeys' : 'Capsules'}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Email Address</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Purchase Date</th>
                <th className="px-4 py-3">Transaction ID</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-500">Loading...</td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-500">No transactions found</td></tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                          {tx.user?.charAt(0) || 'U'}
                        </div>
                        <span className="font-medium text-[#2E2A5A]">{tx.user}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{tx.email}</td>
                    <td className="px-4 py-3 text-gray-600">{tx.item}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full border px-3 py-0.5 text-xs ${tx.type === 'journey' ? 'border-cyan-400 text-cyan-600' : 'border-pink-400 text-pink-600'}`}>
                        {tx.type === 'journey' ? 'Journey' : 'Capsule'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">${tx.amount}</td>
                    <td className="px-4 py-3 text-gray-600">{tx.date}</td>
                    <td className="px-4 py-3 text-gray-600">TXN-{tx.id}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-0.5 text-xs text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Completed
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2 text-xs">
          <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-md border border-gray-200 px-3 py-1.5 text-gray-600 transition hover:bg-gray-50 disabled:opacity-40">
            Previous
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} className={`rounded-md px-3 py-1.5 ${page === i + 1 ? 'bg-[#2E2A5A] text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {i + 1}
            </button>
          ))}
          <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-md border border-gray-200 px-3 py-1.5 text-gray-600 transition hover:bg-gray-50 disabled:opacity-40">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}