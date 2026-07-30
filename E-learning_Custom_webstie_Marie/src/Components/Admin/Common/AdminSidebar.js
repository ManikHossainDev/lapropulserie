'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FaTh,
  FaUsers,
  FaGraduationCap,
  FaCalendarAlt,
  FaFileAlt,
  FaMapMarkedAlt,
  FaBoxes,
  FaCreditCard,
  FaDollarSign,
  FaWallet,
  FaUserCircle,
  FaScroll,
  FaSign,
  FaQuestion,
  FaSignOutAlt,
} from 'react-icons/fa';
import { FiTarget } from 'react-icons/fi';

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

const menuGroups = [
  {
    label: 'Dashboard',
    items: [{ label: 'Overview', href: '/admin', icon: FaTh }],
  },
  {
    label: 'Users',
    items: [
      { label: 'All Users', href: '/admin/users', icon: FaUsers },
      { label: 'Mentees', href: '/admin/mentees', icon: FiTarget },
      { label: 'Mentors', href: '/admin/mentors', icon: FaGraduationCap },
    ],
  },
  {
    label: 'Interview',
    items: [{ label: 'Booking list', href: '/admin/booking', icon: FaCalendarAlt }],
  },
  {
    label: 'Journey',
    items: [
      { label: 'Free Questionnaire', href: '/admin/questionnaire', icon: FaFileAlt },
      { label: 'Expedition Journey', href: '/admin/expeditions', icon: FaMapMarkedAlt },
      { label: 'Individual Capsules', href: '/admin/capsules', icon: FaBoxes },
    ],
  },
  {
    label: 'Finance',
    items: [
      { label: 'Subscriptions', href: '/admin/subscriptions', icon: FaCreditCard },
      { label: 'Subscription Plans', href: '/admin/subscription-plans', icon: FaCreditCard },
      { label: 'Capsules', href: '/admin/finance-capsules', icon: FaDollarSign },
      { label: 'Wallet', href: '/admin/wallet', icon: FaWallet },
    ],
  },
  {
    label: 'My Account',
    items: [{ label: 'My Account', href: '/admin/account', icon: FaUserCircle }],
  },
  {
    label: 'Settings',
    items: [
      { label: 'Privacy Policy', href: '/admin/privacy', icon: FaScroll },
      { label: 'Terms & Conditions', href: '/admin/terms', icon: FaSign },
      { label: 'FAQ', href: '/admin/faq', icon: FaQuestion },
    ],
  },
  {
    label: 'Logout',
    items: [{ label: 'Logout', href: '/admin/logout', icon: FaSignOutAlt }],
  },
];

export default function AdminSidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed z-50 h-screen w-64 shrink-0 border-r border-gray-200 bg-white overflow-y-auto transition-transform lg:sticky lg:top-0',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="px-6 py-5 flex items-center">
          <div className="font-extrabold text-xl">
            <span className="text-[#F4B731]">La</span>
            <br />
            <span className="text-[#2E2A5A]">Propulserie</span>
          </div>
        </div>

        <nav className="px-3 pb-8">
          {menuGroups.map((group) => (
            <div key={group.label} className="mb-4">
              <p className="px-3 mb-1 text-[11px] uppercase tracking-wide text-gray-400 font-medium">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href ||
                    (item.href !== '/admin' && pathname.startsWith(item.href));

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                          isActive
                            ? 'bg-indigo-50 text-[#2E2A5A] font-semibold'
                            : 'text-gray-700 hover:bg-gray-50'
                        )}
                      >
                        <Icon size={16} className="shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}