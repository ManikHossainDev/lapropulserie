'use client';

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';

const CategoryCarosal = ({ categories = [], selectedId, onSelect }) => {
    if (!categories.length) {
        return <p className="text-center py-5 text-gray-500">Aucune catégorie disponible</p>;
    }

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
                    1024: { slidesPerView: 6 },
                }}
                className="!px-10"
            >
                {categories.map((item) => {
                    const id = item.id || item._id;
                    const isSelected = id === selectedId;
                    return (
                        <SwiperSlide key={id}>
                            <button
                                type="button"
                                onClick={() => onSelect?.(id)}
                                className={`flex w-full items-center justify-center gap-2 overflow-hidden px-4 py-2 border rounded-full shadow-sm transition cursor-pointer whitespace-nowrap ${
                                    isSelected
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-white hover:shadow-md'
                                }`}
                            >
                                {item.thumbnail && (
                                    <img
                                        src={item.thumbnail}
                                        alt={item.title}
                                        className="w-6 h-6 rounded-full object-cover"
                                    />
                                )}
                                <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                                    {item.title?.length > 20
                                        ? `${item.title.slice(0, 20)}...`
                                        : item.title}
                                </span>
                            </button>
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </div>
    );
};

export default CategoryCarosal;
