'use client';

import React, { useState, useEffect, use } from 'react';
import { FaSearch, FaChevronUp, FaChevronDown, FaPencilAlt, FaTrashAlt, FaPlus, FaCog } from 'react-icons/fa';
import { IoMdNotifications } from 'react-icons/io';

function NotificationBell({ count = 0 }) {
  return (
    <button className="relative w-11 h-11 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-[#2E2A5A] transition-colors">
      <IoMdNotifications size={20} />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center font-bold">
          {count}
        </span>
      )}
    </button>
  );
}

const mockCategories = [
  {
    id: '1',
    title: 'Getting Started',
    faqs: [
      { id: '1', question: 'How do I sign up?', answer: 'You can sign up by clicking the Sign Up button on the homepage and following the guided steps.' },
      { id: '2', question: 'What is a capsule?', answer: 'A capsule is a curated collection of learning content focused on a specific topic or skill.' },
    ],
  },
  {
    id: '2',
    title: 'Account & Billing',
    faqs: [
      { id: '3', question: 'How do I reset my password?', answer: 'Go to the login page and click "Forgot Password" to receive a reset link.' },
      { id: '4', question: 'What payment methods do you accept?', answer: 'We accept all major credit cards, PayPal, and bank transfers.' },
    ],
  },
  {
    id: '3',
    title: 'Mentorship',
    faqs: [
      { id: '5', question: 'How do I book a mentor session?', answer: 'Navigate to the Mentors page, select a mentor, and choose an available time slot.' },
      { id: '6', question: 'Can I change my mentor?', answer: 'Yes, you can request a different mentor at any time from your account settings.' },
    ],
  },
];

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState(mockCategories);
  const [expandedItems, setExpandedItems] = useState({});

  useEffect(() => {
    const defaults = {};
    categories.forEach((cat) => {
      if (cat.faqs.length > 0) {
        defaults[cat.faqs[0].id] = true;
      }
    });
    setExpandedItems(defaults);
  }, []);

  const filteredCategories = categories.filter((cat) => {
    if (!searchTerm) return true;
    const lowerSearch = searchTerm.toLowerCase();
    return (
      cat.title.toLowerCase().includes(lowerSearch) ||
      cat.faqs.some(
        (faq) =>
          faq.question.toLowerCase().includes(lowerSearch) ||
          faq.answer.toLowerCase().includes(lowerSearch)
      )
    );
  });

  const toggleExpand = (faqId) => {
    setExpandedItems((prev) => ({ ...prev, [faqId]: !prev[faqId] }));
  };

  const handleDeleteCategory = (categoryId) => {
    if (confirm('Are you sure you want to delete this category?')) {
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    }
  };

  const gradients = [
    'from-[#2D2B6B]/8 to-transparent',
    'from-cyan-100/50 to-transparent',
    'from-purple-100/50 to-transparent',
    'from-blue-100/50 to-transparent',
    'from-indigo-100/50 to-transparent',
    'from-violet-100/50 to-transparent',
  ];

  const borderColors = [
    'border-l-[#2D2B6B]',
    'border-l-cyan-400',
    'border-l-purple-400',
    'border-l-blue-400',
    'border-l-indigo-400',
    'border-l-violet-400',
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#2E2A5A] italic">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-gray-700 mt-1 font-medium">
            Find Answers To Common Questions About Cosmic Journey
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 bg-[#2E2A5A] text-white rounded-full font-medium hover:bg-[#3a387a] transition-colors text-sm flex items-center gap-2">
            <FaPlus size={16} /> Add New FAQ
          </button>
          <button className="w-11 h-11 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-[#2E2A5A] transition-colors" title="Settings">
            <FaCog size={20} />
          </button>
          <NotificationBell count={0} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="relative mb-8">
          <FaSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search for answers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2E2A5A]/20 focus:border-[#2E2A5A] placeholder:text-gray-400"
          />
        </div>

        {filteredCategories.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm">No FAQ categories found.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredCategories.map((category, catIndex) => (
              <div key={category.id} className="rounded-2xl border border-gray-100 overflow-hidden">
                <div className={`bg-gradient-to-r ${gradients[catIndex % gradients.length]} px-6 py-4 flex items-center justify-between border-l-4 ${borderColors[catIndex % borderColors.length]} rounded-t-2xl`}>
                  <h3 className="font-bold text-[#1a1a2e] text-sm">{category.title}</h3>
                  <div className="flex items-center gap-2">
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center text-[#2E2A5A] hover:bg-white/60 transition-colors" title="Edit category">
                      <FaPencilAlt size={16} />
                    </button>
                    <button onClick={() => handleDeleteCategory(category.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-white/60 transition-colors" title="Delete category">
                      <FaTrashAlt size={16} />
                    </button>
                  </div>
                </div>
                <div className="divide-y divide-gray-100">
                  {category.faqs.map((faq) => {
                    const isExpanded = expandedItems[faq.id] ?? false;
                    return (
                      <div key={faq.id} className="px-6">
                        <button onClick={() => toggleExpand(faq.id)} className="w-full py-4 flex items-center justify-between text-left group">
                          <span className="font-semibold text-sm text-gray-900 group-hover:text-[#2E2A5A] transition-colors">
                            {faq.question}
                          </span>
                          {isExpanded ? <FaChevronUp size={18} className="text-gray-400 flex-shrink-0 ml-4" /> : <FaChevronDown size={18} className="text-gray-400 flex-shrink-0 ml-4" />}
                        </button>
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'}`}>
                          <p className="text-sm text-gray-600 leading-relaxed -mt-1">{faq.answer}</p>
                        </div>
                      </div>
                    );
                  })}
                  {category.faqs.length === 0 && (
                    <div className="px-6 py-8 text-center">
                      <p className="text-gray-400 text-sm">No questions in this category yet.</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}