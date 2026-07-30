'use client';

import React from 'react';
import { FaChevronLeft, FaEdit, FaCog } from 'react-icons/fa';

function NotificationBell() {
  return (
    <button className="relative w-11 h-11 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-[#2E2A5A] transition-colors">
      <FaCog size={20} />
    </button>
  );
}

const mockPrivacy = {
  title: 'Privacy Policy',
  lastUpdated: 'April 15, 2026',
  sections: [
    {
      id: '1',
      title: 'Information We Collect',
      content: 'We collect personal information that you provide to us, including your name, email address, and payment information. We also collect usage data to improve our services.',
    },
    {
      id: '2',
      title: 'How We Use Your Information',
      content: 'Your information is used to provide and improve our services, process transactions, and communicate with you about updates and offers.',
    },
    {
      id: '3',
      title: 'Data Protection',
      content: 'We implement appropriate security measures to protect your personal information. With Encryption: All data is encrypted in transit and at rest. With Access: Only authorized personnel have access to your data.',
    },
    {
      id: '4',
      title: 'Your Rights',
      content: 'You have the right to access, update, or delete your personal information. With Access: Request a copy of your data. With Correction: Update inaccurate information. With Deletion: Request deletion of your account.',
    },
    {
      id: '5',
      title: 'Third-Party Sharing',
      content: 'We do not sell your personal information to third parties. We may share data with service providers who assist us in operating our platform.',
    },
  ],
};

function renderContent(content) {
  const lines = content.split('\n');
  const elements = [];
  let currentList = [];

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="ml-6 mt-2 space-y-1.5">
          {currentList.map((item, i) => {
            const colonIndex = item.indexOf(':');
            if (colonIndex > 0 && colonIndex < 40) {
              const label = item.substring(0, colonIndex + 1);
              const rest = item.substring(colonIndex + 1);
              return (
                <li key={i} className="text-gray-600 text-sm leading-relaxed flex items-start">
                  <span className="mr-2 mt-1.5 w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0" />
                  <span><span className="font-semibold text-gray-800">{label}</span>{rest}</span>
                </li>
              );
            }
            return (
              <li key={i} className="text-gray-600 text-sm leading-relaxed flex items-start">
                <span className="mr-2 mt-1.5 w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0" />
                <span>{item}</span>
              </li>
            );
          })}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('• ')) {
      currentList.push(trimmed.substring(2));
    } else {
      flushList();
      if (trimmed.length > 0) {
        elements.push(<p key={`p-${idx}`} className="text-gray-600 text-sm leading-relaxed mt-3 first:mt-0">{trimmed}</p>);
      }
    }
  });

  flushList();
  return elements;
}

export default function PrivacyPage() {
  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8">
      <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#2E2A5A] mb-4 transition-colors">
        <FaChevronLeft size={16} /> Back to Settings
      </button>

      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#2E2A5A]">{mockPrivacy.title}</h1>
          <p className="text-sm text-gray-700 mt-1 font-medium">Last Updated: {mockPrivacy.lastUpdated}</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 bg-[#2E2A5A] text-white rounded-xl text-sm font-semibold hover:bg-[#3a387a] transition-colors shadow-sm flex items-center gap-2">
            <FaEdit size={16} /> Edit
          </button>
          <NotificationBell />
        </div>
      </div>

      <div className="border-b border-gray-200 mt-4 mb-6" />

      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        {mockPrivacy.sections.map((section, index) => (
          <div key={section.id} className={index > 0 ? 'mt-8' : ''}>
            <h2 className="text-sm font-bold text-gray-900">{index + 1}. {section.title}</h2>
            <div className="mt-2">{renderContent(section.content)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}