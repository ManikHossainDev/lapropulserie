'use client';
import React, { Suspense, useEffect, useMemo } from 'react';

import Step1Identification from '@/Components/Students/All/Questions/Step1Identification';
import Step2Identification from '@/Components/Students/All/Questions/Step2Identification';
import Step3Identification from '@/Components/Students/All/Questions/Step3Identification';
import Step4Identification from '@/Components/Students/All/Questions/Step4Identification';
import Step5Identification from '@/Components/Students/All/Questions/Step5Identification';
import Step6Identification from '@/Components/Students/All/Questions/Step6Identification';
import Step7Identification from '@/Components/Students/All/Questions/Step7Identification';
import IsLoading from '@/Components/IsLoading';
import { useGetAllQuestionCategoryQuery } from '@/redux/fetures/allQuestion/allQuestion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const stepComponents = [
    Step1Identification,
    Step2Identification,
    Step3Identification,
    Step4Identification,
    Step5Identification,
    Step6Identification,
    Step7Identification,
];

const fallbackTitles = [
    'Identification', 'Current Situation', 'Values',
    'Idea Future', 'Work Conditions', 'Work Style', 'Skills',
];

const AllQuestionsContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const { data: questionsCategory, isLoading } = useGetAllQuestionCategoryQuery();
    const apiCategories = questionsCategory?.data || [];

    const steps = useMemo(() => {
        if (!apiCategories.length) return [];

        return apiCategories.map((category, index) => ({
            component: stepComponents[index] || Step1Identification,
            title: category.title || fallbackTitles[index] || `Step ${index + 1}`,
            id: category.id,
        }));
    }, [apiCategories]);

    const stepIdFromUrl = searchParams.get('StepId');

    const currentStep = stepIdFromUrl
        ? Math.max(steps.findIndex((s) => String(s.id) === String(stepIdFromUrl)), 0)
        : 0;

    const CurrentComponent = steps[currentStep]?.component || Step1Identification;

    useEffect(() => {
        if (isLoading || steps.length === 0) return;

        const hasValidStepId =
            stepIdFromUrl &&
            steps.some((step) => String(step.id) === String(stepIdFromUrl));

        if (!hasValidStepId) {
            router.replace(`/students/all-questions?StepId=${steps[0].id}`);
        }
    }, [isLoading, steps, stepIdFromUrl, router]);

    const goNext = () => {
        const nextIndex = currentStep + 1;
        if (nextIndex < steps.length) {
            router.push(`/students/all-questions?StepId=${steps[nextIndex].id}`);
        }
    };

    if (isLoading || steps.length === 0) {
        return (
            <div className="relative min-h-screen lg:p-10 p-5 z-0">
                <div className="absolute inset-0 bg-[url('/Images/StudentsDash/page_bg.png')] bg-cover opacity-60" />
                <div className="relative z-10 max-w-6xl mx-auto bg-white rounded-xl p-10">
                    <IsLoading row={8} />
                </div>
            </div>
        );
    }

    const hasValidStepId =
        stepIdFromUrl &&
        steps.some((step) => String(step.id) === String(stepIdFromUrl));

    if (!hasValidStepId) {
        return (
            <div className="relative min-h-screen lg:p-10 p-5 z-0">
                <div className="absolute inset-0 bg-[url('/Images/StudentsDash/page_bg.png')] bg-cover opacity-60" />
                <div className="relative z-10 max-w-6xl mx-auto bg-white rounded-xl p-10">
                    <IsLoading row={8} />
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen lg:p-10 p-5 z-0">
            <div className="absolute inset-0 bg-[url('/Images/StudentsDash/page_bg.png')] bg-cover opacity-60" />

            <div className="relative z-10 max-w-6xl mx-auto bg-white rounded-xl">

                {/* ===== STEPPER ===== */}
                <div className="p-6 flex justify-between">
                    {steps.map((step, index) => {
                        const isActive = index === currentStep;
                        return (
                            <Link
                                href={`/students/all-questions?StepId=${step.id}`}
                                key={step.id}
                                className="flex-1 text-center cursor-pointer"
                            >
                                <div
                                    className={`w-9 h-9 mx-auto rounded-full flex items-center justify-center text-sm font-semibold
                                    ${isActive
                                            ? 'bg-[#2b124f] text-white'
                                            : 'border border-gray-300 text-gray-400'
                                        }`}
                                >
                                    {index + 1}
                                </div>
                                <p className={`text-xs sm:block hidden mt-2 font-semibold ${isActive ? 'text-[#2b124f]' : 'text-gray-500'}`}>
                                    {step.title}
                                </p>
                            </Link>
                        );
                    })}
                </div>

                <hr />

                {/* ===== STEP CONTENT ===== */}
                <div className="p-10">
                    <CurrentComponent onNext={goNext} />
                </div>

            </div>
        </div>
    );
};

const Page = () => (
    <Suspense fallback={<IsLoading />}>
        <AllQuestionsContent />
    </Suspense>
);

export default Page;
