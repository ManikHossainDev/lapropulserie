"use client";
import React from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import MyCapsuleCard from '@/Components/Cards/MyCapsuleCard';
import {
    useGetAllCapsulesCategoryQuery,
    useGetMySuggestedCapsuleQuery,
} from '@/redux/fetures/capsules/capsules';

const CategoryCarousel = () => {
    const { data } = useGetAllCapsulesCategoryQuery();
    const categories = data?.data?.results || [];

    if (!categories.length) return null;

    return (
        <div className="relative w-full py-4 my-5">
            <Swiper
                modules={[Navigation]}
                navigation
                spaceBetween={16}
                slidesPerView={2}
                breakpoints={{
                    640: { slidesPerView: 3 },
                    768: { slidesPerView: 4 },
                    1024: { slidesPerView: 5 },
                }}
                className="!px-10"
            >
                {categories.map((cat) => {
                    const id = cat.id || cat._id;
                    return (
                        <SwiperSlide key={id}>
                            <Link
                                href={`/students/discover/${id}`}
                                className="flex items-center justify-center gap-2 px-4 py-2 border rounded-full bg-white shadow-sm hover:shadow-md transition whitespace-nowrap"
                            >
                                <span className="text-sm font-medium text-gray-700 truncate max-w-[140px]">
                                    {cat.title}
                                </span>
                            </Link>
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </div>
    );
};

const PurchasedSuggestedCapsules = () => {
    const { data: capsules, isLoading } = useGetMySuggestedCapsuleQuery('suggested');
    const fullData = capsules?.data?.results ?? [];

    return (
        <div className='max-w-7xl mx-auto my-10 bg-gray-100 rounded-2xl p-5 lg:p-10'>
            <h2 className="text-4xl font-bold text-center text-primary mb-2">📡 Suggested Capsules</h2>
            <p className="text-center text-gray-500 text-sm mb-4">
                Capsules recommandées selon votre profil — parcourez par catégorie
            </p>
            <CategoryCarousel />

            {isLoading ? (
                <p className="text-center text-gray-500 py-10">Loading...</p>
            ) : (
                <>
                    <div className='grid lg:grid-cols-3 sm:grid-cols-2 gap-3'>
                        {fullData.map((item) => (
                            <MyCapsuleCard key={item.capsuleId} item={item} />
                        ))}
                    </div>
                    {!fullData.length && (
                        <div className="text-center my-10 space-y-3">
                            <p className="font-medium text-gray-500">
                                No individual capsules to suggest right now.
                            </p>
                            <Link
                                href="/students/discover"
                                className="inline-block text-[#2d2a71] font-semibold hover:underline"
                            >
                                Browse Discover →
                            </Link>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default PurchasedSuggestedCapsules;
