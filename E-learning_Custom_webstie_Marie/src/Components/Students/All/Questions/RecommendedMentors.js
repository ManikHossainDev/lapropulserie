'use client';

import React from 'react';
import RecommendedMentorsCard from './RecommendedMentorsCard';
import {  useGetAllRecommendedMentorsQuery } from '@/redux/fetures/Mentors/Mentors';
import IsLoading from '@/Components/IsLoading';

const RecommendedMentors = () => {
    const { data, isLoading, isError } = useGetAllRecommendedMentorsQuery();
   
    const mentors = data?.data?.results ?? [];

    if (isLoading) {
        return <IsLoading row={5} />;
    }

    if (isError) {
        return (
            <p className="text-center text-red-500">
                Failed to load mentors
            </p>
        );
    }

    return (
        <div className="relative z-10 max-w-6xl mx-auto bg-white rounded-xl lg:p-10 p-5">

            <h2 className="text-xl lg:text-3xl font-semibold mb-6 text-center text-primary">
                Recommended Mentors
            </h2>

            <div className="space-y-5">
                {mentors.length > 0 ? (
                    mentors.map((mentor) => (
                        <RecommendedMentorsCard
                            key={mentor.mentorId}
                            mentor={mentor}
                            
                        />
                    ))
                ) : (
                    <p className="text-center text-gray-500">
                        No mentors found
                    </p>
                )}
            </div>

        </div>
    );
};

export default RecommendedMentors;