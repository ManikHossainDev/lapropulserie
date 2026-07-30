'use client';

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import Link from 'next/link';
import { useGetRecommendedMentorsQuery } from '@/redux/fetures/Mentors/Mentors';

const RecommendedMentors = () => {

    const { data, isLoading } = useGetRecommendedMentorsQuery();
    const mentors = data?.data?.results ?? [];

    if (isLoading) {
        return <p className="text-center py-5">Loading...</p>;
    }

    return (
        <div className="max-w-6xl lg:mx-auto bg-white/80 mx-3 backdrop-blur rounded-2xl p-8 shadow-lg border my-5">

            {/* Title */}
            <h2 className="text-4xl font-semibold text-center text-primary mb-8 flex items-center justify-center gap-2">
                <span className="text-3xl">🌟</span>
                Recommended Mentors
            </h2>

            {!mentors?.length && (
                <p className="text-center py-5 ">No mentors found</p>
            )}


            <Swiper
                slidesPerView={3}
                spaceBetween={20}
                navigation
                modules={[Navigation]}
                breakpoints={{
                    0: { slidesPerView: 1 },
                    768: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 },
                }}
            >
                {mentors?.map((mentor) => (
                    <SwiperSlide key={mentor.mentorId}>
                        <div className="border rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition">

                            {/* Profile */}
                            <div className="flex items-center gap-3 mb-3">
                                <img
                                    src={mentor.avatarUrl}
                                    className="w-12 h-12 rounded-full object-cover"
                                    alt={mentor.name}
                                />
                                <div>
                                    <h3 className="font-semibold text-gray-800">
                                        {mentor.name}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {mentor.location}
                                    </p>
                                </div>

                                <span className="ml-auto text-xs bg-pink-100 text-pink-600 px-2 py-1 rounded-full">
                                    {mentor.tag || 'Recommended'}
                                </span>
                            </div>

                            {/* Meta */}
                            <div className="text-sm text-gray-600 flex flex-wrap gap-3 mb-3">
                                <span className="text-primary font-medium">
                                    ${mentor.sessionPrice}
                                </span>
                                <span>⭐ {mentor.avgRating}</span>
                                <span>🌐 {mentor.availableIn}</span>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-gray-500 mb-4 line-clamp-3">
                                {mentor.bio}
                            </p>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {mentor.topics?.slice(0, 2).map((topic, i) => (
                                    <span key={i} className="text-xs border px-2 py-1 rounded-full">
                                        {topic}
                                    </span>
                                ))}
                            </div>

                            {/* Button */}
                            <Link
                                href={`/students/mentors/${mentor.mentorId}`}
                                className="w-full inline-block text-center customSignUpButton text-white py-4 rounded-lg font-medium hover:opacity-90"
                            >
                                See Profile
                            </Link>

                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default RecommendedMentors;