'use client';

import Link from 'next/link';
import React from 'react';
import {
    useGetCapsuleJourneyQuery,
    useGetAllCapsulesCategoryFullDataQuery,
} from '@/redux/fetures/capsules/capsules';

const ExpeditionJourneyBanner = () => {
    const { data: journeysRes } = useGetCapsuleJourneyQuery();
    const journeys = journeysRes?.data?.results || [];
    const journey = journeys[0];
    const journeyId = journey?.id || journey?._id;

    const { data: capsuleData } = useGetAllCapsulesCategoryFullDataQuery(
        { journeyId },
        { skip: !journeyId },
    );

    const isPurchased = capsuleData?.data?.isPurchased;
    const journeyTitle = capsuleData?.data?.journey?.title || journey?.title;
    const capsuleCount = capsuleData?.data?.capsules?.length || 0;

    if (!journeyId) return null;

    const href = isPurchased
        ? `/students/exploration-journey/${journeyId}`
        : '/students/exploration-journey/capsule-journey';

    return (
        <div className="max-w-7xl mx-auto my-6 bg-gradient-to-r from-[#2d2a71] to-indigo-700 rounded-2xl p-6 lg:p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <p className="text-indigo-200 text-sm font-medium mb-1">Parcours Expédition</p>
                    <h2 className="text-2xl font-bold">{journeyTitle || 'Exploration Journey'}</h2>
                    <p className="text-indigo-100 mt-2 text-sm max-w-xl">
                        {isPurchased
                            ? `${capsuleCount} capsule(s) dans votre expédition. Progressez étape par étape.`
                            : 'Débloquez le parcours guidé — les capsules s\'enchaînent dans un ordre précis.'}
                    </p>
                </div>
                <Link
                    href={href}
                    className="inline-flex items-center justify-center bg-white text-[#2d2a71] font-semibold px-6 py-3 rounded-xl hover:bg-indigo-50 transition shrink-0"
                >
                    {isPurchased ? 'Ouvrir mon expédition →' : 'Voir l\'expédition →'}
                </Link>
            </div>
        </div>
    );
};

export default ExpeditionJourneyBanner;
