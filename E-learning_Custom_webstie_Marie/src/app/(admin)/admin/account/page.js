'use client';

import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaLock, FaCreditCard, FaShieldAlt, FaSignOutAlt } from 'react-icons/fa';
import { IoMdNotifications } from 'react-icons/io';

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="px-6 py-5">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#2E2A5A]">My Account</h1>
        <p className="mt-1 text-sm text-gray-600">Manage your personal information and preferences</p>
      </div>

      <div className="flex gap-6">
        <div className="w-64 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-xl font-bold text-indigo-700">
                A
              </div>
              <div>
                <p className="font-semibold text-[#2E2A5A]">Admin User</p>
                <p className="text-sm text-gray-500">admin@example.com</p>
              </div>
            </div>
            <nav className="space-y-1">
              {[
                { id: 'profile', label: 'Profile', icon: FaUser },
                { id: 'security', label: 'Security', icon: FaLock },
                { id: 'notifications', label: 'Notifications', icon: IoMdNotifications },
                { id: 'billing', label: 'Billing', icon: FaCreditCard },
                { id: 'privacy', label: 'Privacy', icon: FaShieldAlt },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${activeTab === item.id
                      ? 'bg-indigo-50 text-[#2E2A5A] font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <item.icon size={16} /> {item.label}
                </button>
              ))}
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 mt-4">
                <FaSignOutAlt size={16} /> Logout
              </button>
            </nav>
          </div>
        </div>

        <div className="flex-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-lg font-semibold text-[#2E2A5A] mb-6">Profile Information</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input type="text" defaultValue="Admin" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-200" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input type="text" defaultValue="User" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-200" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input type="email" defaultValue="admin@example.com" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-200" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input type="tel" defaultValue="+1 234 567 8900" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-200" />
                  </div>
                  <div className="pt-4">
                    <button className="px-5 py-2.5 bg-[#2E2A5A] text-white rounded-lg text-sm font-medium hover:bg-[#3a3870] transition">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <h2 className="text-lg font-semibold text-[#2E2A5A] mb-6">Security Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <input type="password" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-200" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input type="password" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-200" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <input type="password" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-200" />
                  </div>
                  <div className="pt-4">
                    <button className="px-5 py-2.5 bg-[#2E2A5A] text-white rounded-lg text-sm font-medium hover:bg-[#3a3870] transition">
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-lg font-semibold text-[#2E2A5A] mb-6">Notification Preferences</h2>
                <div className="space-y-4">
                  {['Email Notifications', 'Push Notifications', 'SMS Notifications'].map((item) => (
                    <label key={item} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50">
                      <span className="text-sm text-gray-700">{item}</span>
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div>
                <h2 className="text-lg font-semibold text-[#2E2A5A] mb-6">Billing Information</h2>
                <p className="text-gray-500 text-sm">No billing information available.</p>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div>
                <h2 className="text-lg font-semibold text-[#2E2A5A] mb-6">Privacy Settings</h2>
                <div className="space-y-4">
                  {['Profile Visibility', 'Activity Status', 'Data Sharing'].map((item) => (
                    <label key={item} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50">
                      <span className="text-sm text-gray-700">{item}</span>
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}