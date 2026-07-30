'use client';

import React, { useState } from 'react';
import { FaDollarSign, FaUsers, FaMoon, FaStar, FaRocket, FaChartBar, FaCreditCard, FaSearch, FaFilter } from 'react-icons/fa';
import UserPageHeader from '@/Components/Admin/components/UserPageHeader';
import SearchToolbar from '@/Components/Admin/components/SearchToolbar';
import Pagination from '@/Components/Admin/components/Pagination';
import { useFetchSubscriptionStatsQuery, useFetchSubscriptionPlansQuery, useFetchUserSubscriptionsQuery } from '@/redux/api/adminApi';
import { useDebounce } from '@/Components/Admin/hooks/useDebounce';
import { useToast } from '@/Components/Admin/hooks/useToast';

const ICONS = { moon: FaMoon, star: FaStar, rocket: FaRocket };
const ICON_BG = { moon: 'bg-amber-500', star: 'bg-cyan-500', rocket: 'bg-pink-500' };
const PLAN_PILL = { 'Galactic Guide': 'border-amber-400 text-amber-600', 'Stellar Explorer': 'border-cyan-400 text-cyan-600', 'Universal Master': 'border-pink-400 text-pink-600' };

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

export default function SubscriptionsPage() {
  const { show } = useToast();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const debounced = useDebounce(query, 250);
  const pageSize = 9;

  const { data: statsData, isLoading } = useFetchSubscriptionStatsQuery();
  const { data: plansData } = useFetchSubscriptionPlansQuery();
  const { data: subscriptionsData } = useFetchUserSubscriptionsQuery({ page, limit: pageSize });

  const stats = statsData?.data || statsData;
  const plans = plansData?.data || plansData || [];
  const subscribers = subscriptionsData?.data?.results || subscriptionsData?.results || [];
  const total = subscriptionsData?.data?.totalResults || subscriptionsData?.totalResults || 0;

  const filteredSubscribers = subscribers.filter(s => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (planFilter !== 'all' && s.planName !== planFilter) return false;
    return true;
  });

  const subHolders = stats?.plans || [];
  const maxSub = Math.max(1, ...subHolders.map(p => p.totalSubscribers || p.activeSubscribers || 0));

  return (
    <div className="p-6">
      <UserPageHeader title="Subscriptions" subtitle="Monitor revenue, subscriptions, and all capsules" />

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatsCard icon={FaDollarSign} value={isLoading ? '—' : `$${(stats?.totalRevenue || 0).toLocaleString()}`} label="Total Revenue (Subscription)" iconBg="bg-indigo-700" />
        <StatsCard icon={FaUsers} value={isLoading ? '—' : (stats?.totalSubscribers || 0).toLocaleString()} label="Total Subscribers" iconBg="bg-purple-600" />
        {plans.map((p, idx) => {
          const Icon = ICONS[p.icon] || ICONS[Object.keys(ICONS)[idx]];
          return <StatsCard key={p._id || p.id} icon={Icon} value={`$${p.price}`} label={`${p.planName} Plan Rate`} iconBg={ICON_BG[p.icon] || 'bg-gray-500'} />;
        })}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaChartBar size={18} className="text-[#2E2A5A]" />
              <h3 className="text-base font-bold text-[#2E2A5A]">Subscription Revenue</h3>
            </div>
          </div>
          <div className="mt-4 h-[260px] flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-400">Revenue chart coming soon...</p>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <FaCreditCard size={18} className="text-[#2E2A5A]" />
            <h3 className="text-base font-bold text-[#2E2A5A]">Subscription Holders</h3>
          </div>
          <div className="mt-5 space-y-5">
            {isLoading ? (
              <div className="text-sm text-gray-400">Loading...</div>
            ) : subHolders.length === 0 ? (
              <div className="text-sm text-gray-400">No subscriptions found</div>
            ) : (
              subHolders.map((p, idx) => {
                const pct = maxSub > 0 ? ((p.totalSubscribers || p.activeSubscribers || 0) / maxSub) * 100 : 0;
                return (
                  <div key={p.planId || p.planName || idx}>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`text-lg leading-none ${['text-amber-500', 'text-cyan-500', 'text-pink-500'][idx % 3]}`}>•</span>
                        <span className="font-medium text-[#2E2A5A]">{p.planName}</span>
                      </div>
                      <span className="text-xs text-gray-500">{p.totalSubscribers || p.activeSubscribers || 0} users</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                      <div className={`h-full rounded-full ${['bg-amber-500', 'bg-cyan-500', 'bg-pink-500'][idx % 3]}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <FaChartBar size={18} className="text-[#2E2A5A]" />
            <h3 className="text-base font-bold text-[#2E2A5A]">Subscribers</h3>
          </div>
        </div>

        <SearchToolbar
          query={query}
          onQueryChange={setQuery}
          placeholder="Search by name or email..."
          hasActiveFilters={statusFilter !== 'all' || planFilter !== 'all'}
          onClearFilters={() => { setStatusFilter('all'); setPlanFilter('all'); }}
          filters={
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">Status</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">Plan</label>
                <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
                  <option value="all">All</option>
                  {plans.map(p => (
                    <option key={p._id || p.id} value={p.planName || p.name}>{p.planName || p.name}</option>
                  ))}
                </select>
              </div>
            </div>
          }
        />

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Email Address</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Next Billing</th>
                <th className="px-4 py-3">Last Billing</th>
                <th className="px-4 py-3">Transaction ID</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">Loading...</td></tr>
              ) : filteredSubscribers.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">No subscribers found</td></tr>
              ) : (
                filteredSubscribers.map((s) => (
                  <tr key={s._id || s.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">{(s.user?.name || s.name || 'U').charAt(0)}</div>
                        <span className="font-medium text-[#2E2A5A]">{s.user?.name || s.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{s.user?.email || s.email || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full border px-3 py-0.5 text-xs ${PLAN_PILL[s.planName] || 'border-gray-300 text-gray-600'}`}>{s.planName}</span>
                    </td>
                    <td className="px-4 py-3">
                      {s.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-0.5 text-xs text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-red-300 bg-red-50 px-3 py-0.5 text-xs text-red-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />Cancelled
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{s.nextBillingDate ? new Date(s.nextBillingDate).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-600">{s.lastBillingDate ? new Date(s.lastBillingDate).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-600">{s.transactionId || 'N/A'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-end">
          <Pagination page={page} totalPages={Math.ceil(total / pageSize)} onChange={setPage} />
        </div>
      </div>
    </div>
  );
}