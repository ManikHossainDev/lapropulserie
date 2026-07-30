'use client';

import { IoMdNotifications } from 'react-icons/io';

export default function UserPageHeader({ title, subtitle }) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#2E2A5A]">{title}</h1>
        <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
      </div>
      <button className="relative rounded-lg bg-gray-200 p-2.5 text-gray-700 transition hover:bg-gray-300">
        <IoMdNotifications size={18} />
        <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-amber-500" />
      </button>
    </div>
  );
}