'use client';

import React, { useState } from 'react';
import { IoMdNotifications } from 'react-icons/io';
import { FiCreditCard } from 'react-icons/fi';
import {
  FaDollarSign, FaUserAlt, FaGraduationCap, FaCube,
  FaCalendarAlt, FaStar, FaCheckCircle, FaClock,
  FaRegStar, FaDollarSign as FaDollar, FaUserFriends,
  FaChartLine, FaArrowUp
} from 'react-icons/fa';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart
} from 'recharts';
import {
  useFetchDashboardStatsQuery,
  useFetchGrowthTrendsQuery,
  useFetchActivityFeedQuery,
  useFetchSubscriptionStatsQuery,
} from '@/redux/api/dashboard';

const SUBSCRIPTION_COLORS = ['#4F46E5', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

function SubscriptionsCard({ data, loading }) {
  const subscriptions = data?.data?.plans || [];
  const totalSubscribers = data?.data?.totalSubscribers || 0;
  
  return (
    <div className="h-full rounded-[24px] bg-white p-6 shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
      <div className="flex items-center gap-3">
        <FiCreditCard size={22} className="text-[#2E2A5A]" />
        <h3 className="text-[18px] font-semibold text-[#2E2A5A]">
          Subscriptions
        </h3>
      </div>

      <div className="mt-8 space-y-6">
        {loading ? (
          <div className="text-sm text-gray-400">Loading...</div>
        ) : subscriptions.length === 0 ? (
          <div className="text-sm text-gray-400">No subscriptions found</div>
        ) : (
          subscriptions.map((item, index) => {
            const percentage = totalSubscribers > 0 ? ((item.totalSubscribers || 0) / totalSubscribers * 100).toFixed(1) : '0';
            return (
              <div key={item.planId || index}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3.5 w-3.5 rounded-full"
                      style={{ backgroundColor: SUBSCRIPTION_COLORS[index % SUBSCRIPTION_COLORS.length] }}
                    />
                    <span className="text-[15px] font-medium text-[#5B6473]">
                      {item.planName}
                    </span>
                  </div>
                  <span className="text-[15px] font-semibold text-[#1F2937]">
                    {item.totalSubscribers || 0} users
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: SUBSCRIPTION_COLORS[index % SUBSCRIPTION_COLORS.length],
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function ActivityIcon({ type, colorClass }) {
  if (type === 'check') return <FaCheckCircle size={16} className={colorClass} />;
  if (type === 'star') return <FaRegStar size={16} className={colorClass} />;
  if (type === 'dollar') return <FaDollar size={16} className={colorClass} />;
  if (type === 'user') return <FaUserFriends size={16} className={colorClass} />;
  if (type === 'calendar') return <FaCalendarAlt size={16} className={colorClass} />;
  return null;
}

function formatRelative(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

export default function CapsulesPage() {
  const [growthPeriod, setGrowthPeriod] = useState('monthly');

  const { data: statsData, isLoading: statsLoading } = useFetchDashboardStatsQuery();
  const { data: activityData, isLoading: activityLoading } = useFetchActivityFeedQuery({ page: 1, limit: 10 });
  const { data: growthData, isLoading: growthLoading } = useFetchGrowthTrendsQuery(growthPeriod);
  const { data: subscriptionData, isLoading: subscriptionLoading } = useFetchSubscriptionStatsQuery();

  const stats = statsData?.data?.stats || {};
  const dashboardData = statsData?.data || {};
  const topMentors = dashboardData.topMentors || [];
  const activityFeed = activityData?.data?.activities || dashboardData.activityFeed || [];
  const earningsOverview = stats.earningsOverview || {};

  const loading = statsLoading || activityLoading || growthLoading || subscriptionLoading;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#2E2A5A]">Mission Control Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Real-Time Platform Monitoring And Insights</p>
        </div>
        <button
          type="button"
          className="relative bg-[#4F46E5] hover:bg-[#4338ca] text-white p-3 rounded-xl transition-colors"
          aria-label="Notifications"
        >
          <IoMdNotifications size={22} />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-yellow-400 rounded-full border-2 border-[#4F46E5]"></span>
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#4F46E5]">
              <FaDollarSign size={20} className="text-white" />
            </div>
            <span className="text-xs font-semibold text-green-500 flex items-center gap-1">
              <FaArrowUp size={10} />
              {stats.totalRevenue?.momGrowth || 0}%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            ${(stats.totalRevenue?.amount || 0).toLocaleString()}
          </p>
          <p className="text-sm text-gray-400">Total Revenue</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#a855f7]">
              <FaUserAlt size={18} className="text-white" />
            </div>
            <span className="text-xs font-semibold text-green-500 flex items-center gap-1">
              <FaArrowUp size={10} />
              {stats.totalStudents?.momGrowth || 0}%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {(stats.totalStudents?.count || 0).toLocaleString()}
          </p>
          <p className="text-sm text-gray-400">Total Students</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#22c55e]">
              <FaGraduationCap size={20} className="text-white" />
            </div>
            <span className="text-xs font-semibold text-green-500 flex items-center gap-1">
              <FaArrowUp size={10} />
              {stats.totalMentors?.momGrowth || 0}%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {(stats.totalMentors?.count || 0).toLocaleString()}
          </p>
          <p className="text-sm text-gray-400">Total Mentors</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#06b6d4]">
              <FaCube size={20} className="text-white" />
            </div>
            <span className="text-xs font-semibold text-green-500 flex items-center gap-1">
              <FaArrowUp size={10} />
              {stats.totalCapsules?.momGrowth || 0}%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {(stats.totalCapsules?.count || 0).toLocaleString()}
          </p>
          <p className="text-sm text-gray-400">Individual Capsules</p>
        </div>
      </div>

      {/* Growth Trends + Subscriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Growth Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <FaChartLine size={16} className="text-[#2E2A5A]" />
              <span className="font-semibold text-gray-800">Growth Trends</span>
            </div>
            <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1">
              {['monthly', 'quarterly', 'annually'].map((p) => (
                <button
                  key={p}
                  onClick={() => setGrowthPeriod(p)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize ${growthPeriod === p
                    ? 'bg-white shadow text-gray-800'
                    : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          {growthLoading ? (
            <div className="h-52 flex items-center justify-center">
              <div className="animate-pulse text-sm text-gray-400">Loading...</div>
            </div>
          ) : growthData?.data?.periods ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={growthData.data.periods} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="colorMentors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: 12 }} />
                <Area type="monotone" dataKey="newStudents" stroke="#06b6d4" strokeWidth={2} fill="url(#colorStudents)" dot={{ r: 4, fill: '#06b6d4', strokeWidth: 0 }} name="Students" />
                <Area type="monotone" dataKey="newMentors" stroke="#818cf8" strokeWidth={2} fill="url(#colorMentors)" dot={{ r: 4, fill: '#818cf8', strokeWidth: 0 }} name="Mentors" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center">
              <p className="text-sm text-gray-400">No growth data available</p>
            </div>
          )}
          <div className="flex items-center gap-5 mt-3 justify-center">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-cyan-500 inline-block"></span>
              <span className="text-xs text-gray-500">Students</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-indigo-400 inline-block"></span>
              <span className="text-xs text-gray-500">Mentors</span>
            </div>
          </div>
        </div>

        {/* Subscriptions */}
        <SubscriptionsCard data={subscriptionData} loading={subscriptionLoading} />
      </div>

      {/* Top Mentors + Live Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Mentors */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-lg">🏆</span>
            <span className="font-semibold text-gray-800">Top Mentors</span>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="text-sm text-gray-400">Loading...</div>
            ) : topMentors.length === 0 ? (
              <div className="text-sm text-gray-400">No mentors found</div>
            ) : (
              topMentors.map((mentor, index) => (
                <div key={mentor._id || index} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <img
                      src={mentor.avatarUrl || mentor.userId?.avatar?.imageUrl || '/Images/default-avatar.png'}
                      alt={mentor.currentJobTitle || 'Mentor'}
                      className="w-11 h-11 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{mentor.currentJobTitle || mentor.userId?.fullName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{mentor.companyName || 'N/A'} · ${mentor.sessionPrice || 0}/session</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaStar size={13} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-semibold text-gray-700">{mentor.rating || 0}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-5">
            <FaClock size={16} className="text-[#2E2A5A]" />
            <span className="font-semibold text-gray-800">Live Activity Feed</span>
          </div>
          <div className="space-y-5">
            {loading ? (
              <div className="text-sm text-gray-400">Loading...</div>
            ) : activityFeed.length === 0 ? (
              <div className="text-sm text-gray-400">No activity yet</div>
            ) : (
              activityFeed.map((item, index) => (
                <div key={item._id || index} className="flex items-start gap-3 pb-4 border-b border-gray-50 last:border-0">
                  <div className="mt-0.5 shrink-0">
                    <ActivityIcon type={item.type} colorClass={item.color || 'text-gray-400'} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-700 font-medium">{item.title || item.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatTime(item.createdAt)} · {formatRelative(item.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}