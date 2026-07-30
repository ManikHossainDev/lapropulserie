'use client';
import FAQTab from '@/Components/Students/Mentors/FAQTab';
import PrivacyTab from '@/Components/Students/Mentors/PrivacyTab';
import ProfileTab from '@/Components/Students/Mentors/ProfileTab';
import TermsTab from '@/Components/Students/Mentors/TermsTab';
import React, { useState } from 'react';

const tabs = [
    { label: 'Profile', component: <ProfileTab /> },
    { label: 'Terms & Conditions', component: <TermsTab /> },
    { label: 'Privacy Policy', component: <PrivacyTab /> },
    { label: 'FAQ', component: <FAQTab /> },
];

const Page = () => {



    const [activeTab, setActiveTab] = useState(0);

    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                {/* Tab Bar */}
                <div className="flex border-b border-gray-100">
                    {tabs.map((tab, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveTab(i)}
                            className={`flex-1 py-4 text-sm font-medium transition-colors relative
                                ${activeTab === i
                                    ? 'text-primary'
                                    : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {tab.label}
                            {activeTab === i && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="p-5">
                    {tabs[activeTab].component}
                </div>

            </div>
        </div>
    );
};

export default Page;