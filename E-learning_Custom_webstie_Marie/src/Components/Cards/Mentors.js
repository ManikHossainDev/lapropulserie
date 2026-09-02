'use client';

import React from 'react';
import { FaInfoCircle } from 'react-icons/fa';
import { FaRocket } from 'react-icons/fa6';
import { CiLocationOn } from "react-icons/ci";
import { HiLanguage } from "react-icons/hi2";
import Link from 'next/link';
import { toast } from 'react-toastify';
import { mentorOptionFr, mentorOptionsFrJoin } from '@/Components/mentors/All/mentorOptionLabels';
import { openMentorFreeIntro } from '@/Components/Students/Mentors/bookMentorSession';

const Mentors = ({ item }) => {
    const handleBooking = () => {
        try {
            openMentorFreeIntro(item?.calendlyProfileLink);
        } catch (error) {
            toast.error(error?.message || 'Impossible de réserver ce mentor. Réessaie plus tard.');
        }
    };

    return (
        <div className="relative overflow-hidden rounded-3xl text-white h-auto">

            {/* BACKGROUND */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0b0b1f] via-[#15153a] to-[#0b0b1f]" />

            {/* GLOBAL DARK OVERLAY */}
            <div className="absolute inset-0 bg-black/40" />

            {/* CONTENT */}
            <div className="relative z-10 flex h-full">

                {/* LEFT CONTENT */}
                <div className="flex flex-col w-full justify-between p-4">

                    <div>

                        {/* BADGE */}
                        <span className="inline-block bg-white/10 px-3 py-1 rounded-full text-xs mb-3">
                            {item?.availableIn ? mentorOptionFr(item.availableIn) : 'En ligne'}
                        </span>

                        {/* NAME */}
                        <h2 className="text-2xl font-semibold">
                            {item?.name}
                        </h2>

                        {/* JOB */}
                        <p className="text-gray-300 text-sm">
                            {item?.currentJobTitle} • {item?.companyName}
                        </p>

                        {/* INFO */}
                        <div className="text-gray-300 text-xs flex flex-wrap gap-3 mt-2">

                            <span className="flex items-center gap-1">
                                <CiLocationOn />
                                {item?.location}
                            </span>

                            <span className="flex items-center gap-1">
                                <HiLanguage />
                                {mentorOptionsFrJoin(item?.language, ', ')}
                            </span>

                            <span>
                                ⭐ {item?.avgRating}
                            </span>

                            <span>
                                {item?.yearsOfExperience} ans d’exp.
                            </span>

                        </div>

                        {/* FOCUS AREA */}
                        <p className="text-gray-300 text-sm mt-2 line-clamp-1">
                            {mentorOptionsFrJoin(item?.focusArea)}
                        </p>

                    </div>

                    {/* BUTTONS */}
                    <div className="flex gap-2 w-full mt-4">

                        <Link href={`/students/mentors/${item?.mentorId}`} className="flex w-full text-sm items-center justify-center gap-2 border px-3 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition">
                            <FaInfoCircle />
                            Voir le profil
                        </Link>

                        <button
                            type="button"
                            onClick={handleBooking}
                            className="flex w-full text-sm items-center justify-center gap-2 border bg-white text-[#15153a] px-3 py-3 rounded-xl hover:bg-gray-200 transition"
                        >
                            <FaRocket />
                            Découverte offerte
                        </button>

                    </div>

                </div>

                {/* RIGHT IMAGE WITH PROPER OVERLAY */}
                <div className="absolute right-0 bottom-0 -z-10 h-full flex items-end">

                    {/* IMAGE */}
                    <img
                        src={item?.avatarUrl || '/Images/default-avatar.png'}
                        alt={item?.name}
                        className="h-[75%] object-contain rounded-lg relative z-10"
                        onError={(e) => {
                            e.currentTarget.src = '/Images/default-avatar.png';
                        }}
                    />

                    {/* IMAGE OVERLAY (IMPORTANT FIX) */}
                    <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#0b0b1f]/40 to-[#0b0b1f] z-20" />

                </div>

            </div>
        </div>
    );
};

export default Mentors;