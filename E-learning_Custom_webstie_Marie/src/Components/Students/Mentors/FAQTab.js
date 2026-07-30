'use client';
import React, { useState } from 'react';
import { useGetAllFaqsQuery } from '@/redux/fetures/faq/faq';

const FAQTab = () => {
    const [openIndex, setOpenIndex] = useState(null);
    const { data, isLoading, isError } = useGetAllFaqsQuery();

    if (isLoading) {
        return (
            <div className="bg-gray-50 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Frequently Asked Questions</h2>
                <p className="text-sm text-gray-400">Loading...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="bg-gray-50 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Frequently Asked Questions</h2>
                <p className="text-sm text-red-400">Failed to load FAQs.</p>
            </div>
        );
    }

    const faqs = data?.data?.results ?? [];

    return (
        <div className="bg-gray-50 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-3">
                {faqs.length === 0 && (
                    <p className="text-sm text-gray-400">No FAQs found.</p>
                )}
                {faqs.map((faq) => (
                    <div key={faq.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                        <button
                            onClick={() => setOpenIndex(openIndex === faq.id ? null : faq.id)}
                            className="w-full flex items-center justify-between px-5 py-4 text-left"
                        >
                            <span className="text-sm font-medium text-gray-800">{faq.question}</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className={`w-4 h-4 text-indigo-600 transition-transform ${openIndex === faq.id ? 'rotate-180' : ''}`}
                                fill="none" viewBox="0 0 24 24" stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {openIndex === faq.id && (
                            <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
                                {faq.answer}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FAQTab;