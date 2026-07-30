'use client';

import Link from 'next/link';
import React from 'react';
import IsLoading from '@/Components/IsLoading';
import RecommendationPanel from '@/Components/Students/Recommendations/RecommendationPanel';
import { useGetQuestionnaireSummaryQuery } from '@/redux/fetures/allQuestion/allQuestion';

const SECTION_STYLES = [
    { border: 'border-blue-100', bg: 'bg-blue-50/70' },
    { border: 'border-orange-100', bg: 'bg-orange-50/70' },
    { border: 'border-red-100', bg: 'bg-red-50/70' },
    { border: 'border-green-100', bg: 'bg-green-50/70' },
    { border: 'border-purple-100', bg: 'bg-purple-50/70' },
    { border: 'border-amber-100', bg: 'bg-amber-50/70' },
    { border: 'border-teal-100', bg: 'bg-teal-50/70' },
    { border: 'border-indigo-100', bg: 'bg-indigo-50/70' },
];

const YourPersonalizedSummary = () => {
    const { data, isLoading, isError, error } = useGetQuestionnaireSummaryQuery();

    if (isLoading) {
        return (
            <div className="relative z-10 max-w-6xl mx-auto bg-white rounded-xl lg:p-10 p-5">
                <IsLoading row={6} />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="relative z-10 max-w-6xl mx-auto bg-white rounded-xl lg:p-10 p-5 text-center">
                <h2 className="text-xl font-semibold text-primary mb-3">Synthèse personnalisée</h2>
                <p className="text-gray-600 mb-6">
                    {error?.data?.message || 'Complétez d\'abord le questionnaire d\'onboarding.'}
                </p>
                <Link
                    href="/students/all-questions"
                    className="inline-block px-8 py-3 customSignUpButton rounded-lg text-white"
                >
                    Commencer le questionnaire
                </Link>
            </div>
        );
    }

    const summary = data?.data;
    const sections = summary?.sections?.length
        ? summary.sections
        : (summary?.texts || []).filter(Boolean).map((text, index) => ({
            title: `Point clé ${index + 1}`,
            brief: '',
            items: [text],
        }));

    const greetingName = summary?.firstName;

    return (
        <div className="relative z-10 max-w-6xl mx-auto bg-white rounded-xl lg:p-10 p-5">
            <h2 className="text-xl lg:text-3xl font-semibold mb-3 text-primary text-center">
                🧠 TA SYNTHÈSE PERSONNALISÉE
            </h2>
            {greetingName && (
                <p className="text-center text-base text-gray-700 mb-2">Bonjour {greetingName},</p>
            )}
            {summary?.title && (
                <p className="text-center text-lg font-medium text-gray-700 mb-3">{summary.title}</p>
            )}
            {summary?.summary && (
                <p className="text-center text-gray-600 mb-3 max-w-3xl mx-auto leading-relaxed">
                    {summary.summary}
                </p>
            )}
            {summary?.source === 'ai' && (
                <p className="text-center text-xs text-green-700">Analyse générée par Marii IA</p>
            )}
            {summary?.source === 'template' && (
                <p className="text-center text-xs text-amber-700">
                    Synthèse de secours (IA indisponible) — basée sur tes réponses
                </p>
            )}

            <div className="mt-10 space-y-8">
                {sections.map((section, index) => {
                    const style = SECTION_STYLES[index % SECTION_STYLES.length];
                    return (
                        <section
                            key={`${section.title}-${index}`}
                            className={`border ${style.border} ${style.bg} p-6 lg:p-7 rounded-2xl`}
                        >
                            <h3 className="text-lg font-semibold text-primary">{section.title}</h3>
                            {section.brief && (
                                <p className="mt-3 text-gray-700 leading-relaxed whitespace-pre-line">
                                    {section.brief}
                                </p>
                            )}
                            {section.items?.length > 0 && (
                                <ul className="mt-4 space-y-3 list-disc pl-5">
                                    {section.items.map((item, itemIndex) => (
                                        <li key={`${item}-${itemIndex}`} className="text-gray-700 leading-relaxed">
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    );
                })}
            </div>

            <div className="flex items-center justify-between w-full mt-10 mb-5 gap-5 flex-col lg:flex-row">
                <Link
                    href="/students/exploration-journey"
                    className="px-8 flex items-center justify-center w-full customSignUpButton py-3 rounded-lg text-white"
                >
                    Continuer ton voyage d&apos;exploration
                </Link>
                <Link
                    href="/students/recommended-mentors"
                    className="px-8 flex items-center justify-center w-full customSignUpButton py-3 rounded-lg text-white"
                >
                    Être mis en relation avec des mentors alignés
                </Link>
            </div>
            <Link
                href="/students/my-account"
                className="px-8 w-full block text-center border border-primary py-3 rounded-lg text-primary"
            >
                Continuer seul
            </Link>

            <RecommendationPanel context="questionnaire" className="mt-8" />
        </div>
    );
};

export default YourPersonalizedSummary;
