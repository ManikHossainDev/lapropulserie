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
    const categories = Array.isArray(data?.data)
        ? data.data
        : data?.data?.results || [];

    if (!categories.length) return null;

    return (
        <div className="relative w-full py-4 my-5">
            <Swiper
                modules={[Navigation]}
                navigation
                centeredSlides={categories.length === 1}
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
                                className="flex items-center justify-center px-8 py-3 rounded-xl bg-[#2d2a71] text-white shadow-md hover:bg-[#3d3875] hover:shadow-lg transition whitespace-nowrap"
                            >
                                <span className="text-base font-semibold">
                                    {categories.length === 1
                                        ? 'Découvrir toutes les capsules'
                                        : cat.title}
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
            <h2 className="text-4xl font-bold text-center text-primary mb-2">📡 Capsules recommandées</h2>
            <p className="text-center text-gray-500 text-sm mb-4">
                Capsules recommandées selon votre profil — parcourez par catégorie
            </p>
            <CategoryCarousel />

            {isLoading ? (
                <p className="text-center text-gray-500 py-10">Chargement...</p>
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
                                Aucune capsule individuelle à vous recommander pour le moment.
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default PurchasedSuggestedCapsules;
