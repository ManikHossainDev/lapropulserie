'use client';
import FAQTab from '@/Components/Students/Mentors/FAQTab';
import PrivacyTab from '@/Components/Students/Mentors/PrivacyTab';
import TermsTab from '@/Components/Students/Mentors/TermsTab';
import DeleteAccountTab from '@/Components/Students/Mentors/DeleteAccountTab';
import React, { useState } from 'react';

const tabs = [
    { label: 'Conditions générales', component: <TermsTab /> },
    { label: 'Politique de confidentialité', component: <PrivacyTab /> },
    { label: 'FAQ', component: <FAQTab /> },
    { label: 'Compte', component: <DeleteAccountTab /> },
];

const Page = () => {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <div className="relative py-5 lg:py-10 h-screen">
            <div className="absolute h-full -z-10 inset-0 bg-[url('/Images/StudentsDash/page_bg.png')] bg-cover bg-no-repeat opacity-60" />
            <div className="p-6">
                <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                    {/* Tab Bar */}
                    <div className="flex border-b border-gray-100 overflow-x-auto">
                        {tabs.map((tab, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveTab(i)}
                                className={`flex-1 min-w-[7rem] py-4 text-sm font-medium transition-colors relative
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
        </div>
    );
};

export default Page;
