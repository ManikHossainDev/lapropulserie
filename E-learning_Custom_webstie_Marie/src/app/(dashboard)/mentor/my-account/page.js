'use client';
import Basicinfo from '@/Components/mentors/All/Basicinfo';
import ProfileFocusArea from '@/Components/mentors/All/ProfileFocusArea';
import ProfileIndustry from '@/Components/mentors/All/ProfileIndustry';
import ProfileMentor from '@/Components/mentors/All/ProfileMentor';
import ProfileMethodology from '@/Components/mentors/All/ProfileMethodology';
import ProfileSpecialtis from '@/Components/mentors/All/ProfileSpecialtis';
import ProfileValues from '@/Components/mentors/All/ProfileValues';
import ReviewsTab from '@/Components/mentors/All/ReviewsTab';
import { useGetOnboardingStatusQuery } from '@/redux/fetures/Mentors/MentorOnboarding';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const Page = () => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState(0);

    const { data: onboardingData, isLoading: onboardingLoading } = useGetOnboardingStatusQuery();
    // const { data: reviewsData, isLoading: reviewsLoading } = useGetMentorReviewsQuery();

    // const reviews = reviewsData?.data || [];
    const onboarding = onboardingData?.data || {};
    const steps = onboarding.steps || [];
    const isLive = onboarding.isLive;

    const getStepData = (key) => {
        const step = steps.find(s => s.key === key);
        return step?.data || {};
    };

    const basicInfoData = getStepData('basicInfo');
    const missionData = getStepData('mission');
    const innerFuelData = getStepData('innerFuel');
    const methodsData = getStepData('methods');
    const goLiveData = getStepData('goLive');

    const methodsForDisplay = {
        coachingMethodologies: methodsData.coachingMethodologies,
    };

    const tabs = [
        { label: 'Infos de base', component: <Basicinfo data={{ ...basicInfoData, calendlyProfileLink: methodsData?.calendlyProfileLink }} /> },
        { label: 'Spécialités', component: <ProfileSpecialtis data={innerFuelData.specialties || []} /> },
        { label: 'Valeurs', component: <ProfileValues data={innerFuelData.coreValues || []} /> },
        { label: 'Domaines de focus', component: <ProfileFocusArea data={missionData.focusArea || []} /> },
        { label: 'Mentorat pour', component: <ProfileMentor data={missionData.careerStage || []} /> },
        { label: 'Secteur', component: <ProfileIndustry data={missionData.industry || []} /> },
        { label: 'Méthodologie', component: <ProfileMethodology data={methodsForDisplay} /> },
        // { label: 'Reviews', component: <ReviewsTab data={reviews} isLoading={reviewsLoading} /> },
    ];

    if (onboardingLoading) {
        return (
            <div className="relative py-10">
                <div className="p-6">
                    <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
                        <p className="text-gray-500">Chargement du profil...</p>
                    </div>
                </div>
            </div>
        );
    }

    const handleCompleteProfile = () => {
        router.push('/mentor/profile-setup');
    };

    return (
        <div className="relative py-10">
            <div className="absolute -z-10 inset-0 bg-[url('/Images/StudentsDash/page_bg.png')] bg-cover bg-no-repeat opacity-60" />
            <div className="p-6">

                <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                    {!isLive && (
                        <div className="p-4 bg-yellow-50 border-b border-yellow-100">
                            <p className="text-sm text-yellow-800 text-center">
                                Veuillez compléter la configuration de votre profil pour passer en ligne et recevoir des demandes de mentorat.
                                <button 
                                    onClick={handleCompleteProfile}
                                    className="ml-2 text-primary font-medium hover:underline"
                                >
                                    Compléter le profil
                                </button>
                            </p>
                        </div>
                    )}

                    <div className="flex items-center gap-4 p-5 border-b border-gray-100 justify-center">
                        <img
                            className="w-20 h-20 rounded-full border-4 border-primary"
                            src={basicInfoData.avatarUrl || '/Images/default-avatar.png'}
                            alt={basicInfoData.name || 'Mentor'}
                        />
                        <div>
                            <h2 className="font-semibold text-xl mb-0">{basicInfoData.name || 'Mentor'}</h2>
                            <p className="text-gray-500 text-sm">{basicInfoData.currentJobTitle || 'Mentor'}</p>
                        </div>
                    </div>

                    <div className='overflow-x-auto'>
                        <div className="flex border-b min-w-[800px] border-gray-100">
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
                    </div>

                    <div className="p-5">
                        {tabs[activeTab].component}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Page;