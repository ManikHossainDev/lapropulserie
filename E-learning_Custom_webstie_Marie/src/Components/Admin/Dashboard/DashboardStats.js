'use client';

import {
  FaDollarSign,
  FaUsers,
  FaGraduationCap,
  FaBoxes,
} from 'react-icons/fa';
import { GiCrystalGrowth } from 'react-icons/gi';

function StatsCard({ icon: Icon, value, label, growth, iconBg }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg text-white ${iconBg}`}>
          <Icon size={20} />
        </div>
        {typeof growth === 'number' && (
          <span className={`text-xs font-semibold ${growth >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {growth >= 0 ? '+' : ''}
            {growth}%
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

export default function DashboardStats({ stats, loading }) {
  const dashboardStats = stats?.data?.stats || {};
  const earningsOverview = dashboardStats.earningsOverview || {};
  const totalStudents = dashboardStats.totalStudents || {};
  const totalMentors = dashboardStats.totalMentors || {};
  const totalCapsules = dashboardStats.totalCapsules || {};

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        icon={FaDollarSign}
        value={loading ? '—' : `$${(earningsOverview.totalEarnings || 0).toLocaleString()}`}
        label="Total Revenue"
        growth={Number(dashboardStats.totalRevenue?.momGrowth) || 0}
        iconBg="bg-indigo-600"
      />
      <StatsCard
        icon={FaUsers}
        value={loading ? '—' : (totalStudents.count || 0).toLocaleString()}
        label="Total Students"
        growth={totalStudents.momGrowth}
        iconBg="bg-purple-500"
      />
      <StatsCard
        icon={FaGraduationCap}
        value={loading ? '—' : (totalMentors.count || 0).toLocaleString()}
        label="Total Mentors"
        growth={totalMentors.momGrowth}
        iconBg="bg-emerald-500"
      />
      <StatsCard
        icon={FaBoxes}
        value={loading ? '—' : (totalCapsules.count || 0).toLocaleString()}
        label="Total Capsules"
        growth={totalCapsules.momGrowth}
        iconBg="bg-cyan-500"
      />
    </div>
  );
}