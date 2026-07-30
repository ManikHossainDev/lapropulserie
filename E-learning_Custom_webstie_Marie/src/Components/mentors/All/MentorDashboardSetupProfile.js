'use client';
import React, { useState, useEffect } from 'react';
import BasicInfoTab from './BasicInfoTab';
import MissionTab from './MissionTab';
import InnerFuelTab from './InnerFuelTab';
import MethodsTab from './MethodsTab';
import GoLiveTab from './GoLiveTab';
import StepProgress from './StepProgress';
import { useGetOnboardingStatusQuery } from '@/redux/fetures/Mentors/MentorOnboarding';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

const MentorDashboardSetupProfile = () => {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [allData, setAllData] = useState({});

    const { data: statusData, isLoading: statusLoading } = useGetOnboardingStatusQuery();

    useEffect(() => {
        if (statusData?.data?.steps) {
            const steps = statusData.data.steps;
            let nextStep = 1;

            for (let i = 0; i < steps.length; i++) {
                if (!steps[i].isCompleted) {
                    nextStep = steps[i].step;
                    break;
                }
                if (i === steps.length - 1) {
                    nextStep = 6;
                }
            }

            setCurrentStep(Math.min(nextStep, 5));
        }
    }, [statusData, statusLoading]);

    const handleNext = (stepData) => {
        setAllData((prev) => ({ ...prev, ...stepData }));
        setCurrentStep((s) => Math.min(s + 1, 5));
    };

    const handleBack = () => setCurrentStep((s) => Math.max(s - 1, 1));

    const handleComplete = () => {
        toast.success('Configuration du profil terminée avec succès !');
        router.push('/mentor');
    };

    const renderTab = () => {
        if (statusLoading) {
            return (
                <div className="flex items-center justify-center py-20">
                    <div className="text-gray-500">Chargement...</div>
                </div>
            );
        }

        const steps = statusData?.data?.steps || [];

        const getStepData = (stepKey) => {
            const step = steps.find(s => s.key === stepKey);
            return step?.data || {};
        };

        switch (currentStep) {
            case 1:
                return (
                    <BasicInfoTab
                        onNext={handleNext}
                        initialData={getStepData('basicInfo')}
                    />
                );
            case 2:
                return (
                    <MissionTab
                        onNext={handleNext}
                        onBack={handleBack}
                        initialData={getStepData('mission')}
                    />
                );
            case 3:
                return (
                    <InnerFuelTab
                        onNext={handleNext}
                        onBack={handleBack}
                        initialData={getStepData('innerFuel')}
                    />
                );
            case 4:
                return (
                    <MethodsTab
                        onNext={handleNext}
                        onBack={handleBack}
                        initialData={getStepData('methods')}
                    />
                );
            case 5:
                return (
                    <GoLiveTab
                        onBack={handleBack}
                        onComplete={handleComplete}
                        initialData={statusData?.data || {}}
                    />
                );
            default:
                return <BasicInfoTab onNext={handleNext} initialData={getStepData('basicInfo')} />;
        }
    };

    const getCompletedSteps = () => {
        const steps = statusData?.data?.steps || [];
        return steps.filter(s => s.isCompleted).length + 1;
    };

    const completedSteps = getCompletedSteps();

    return (
        <div className="bg-gray-100 min-h-screen max-w-6xl mx-auto rounded-lg shadow-md my-10 py-5">

            <div className="border-b border-gray-100">
                <StepProgress
                    currentStep={currentStep}
                    onStepClick={(step) => {
                        if (step <= completedSteps) setCurrentStep(step);
                    }}
                />
            </div>

            <div className="p-4">
                {renderTab()}
            </div>

        </div>
    );
};

export default MentorDashboardSetupProfile;