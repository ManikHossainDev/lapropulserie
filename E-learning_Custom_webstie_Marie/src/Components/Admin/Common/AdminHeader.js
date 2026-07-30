'use client';

import React from 'react';
import { IoMdNotifications } from 'react-icons/io';
import { FaBars } from 'react-icons/fa';

export default function AdminHeader({ isOpen, setIsOpen }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsOpen(true)}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
        >
          <FaBars size={20} />
        </button>
        <h1 className="text-lg font-semibold text-[#2E2A5A] lg:text-xl">
          Admin Dashboard
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="relative rounded-lg bg-indigo-100 p-2.5 text-indigo-700 transition hover:bg-indigo-200"
          aria-label="Notifications"
        >
          <IoMdNotifications size={18} />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-amber-500" />
        </button>
      </div>
    </header>
  );
}