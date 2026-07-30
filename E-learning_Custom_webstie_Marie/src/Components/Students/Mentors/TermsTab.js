'use client';
import React from 'react';
import { useGetTermsAndConditionsQuery } from '@/redux/fetures/settings/settings';

const TermsTab = () => {
    const { data, isLoading, isError } = useGetTermsAndConditionsQuery();

    if (isLoading) {
        return (
            <div className="bg-gray-50 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Terms & Conditions</h2>
                <p className="text-sm text-gray-400">Loading...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="bg-gray-50 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Terms & Conditions</h2>
                <p className="text-sm text-red-400">Failed to load Terms & Conditions.</p>
            </div>
        );
    }

    const content = data?.data?.content || data?.data?.details || '';

    if (!content) {
        return (
            <div className="bg-gray-50 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Terms & Conditions</h2>
                <p className="text-sm text-gray-400">No content available.</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Terms & Conditions</h2>
            <div
                className="space-y-4 text-sm text-gray-600 leading-relaxed [&>h2]:text-lg [&>h2]:font-semibold [&>h2]:text-gray-800 [&>h2]:mb-2 [&>h3]:font-semibold [&>h3]:text-gray-700 [&>h3]:mb-1 [&>p]:leading-relaxed [&>p]:mb-3"
                dangerouslySetInnerHTML={{ __html: content }}
            />
        </div>
    );
};

export default TermsTab;