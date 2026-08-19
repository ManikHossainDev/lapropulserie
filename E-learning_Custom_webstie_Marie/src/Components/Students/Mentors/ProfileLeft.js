'use client';

import React from 'react';
import { CiLocationOn } from 'react-icons/ci';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';
import { GrLanguage } from 'react-icons/gr';
import { LuLanguages } from "react-icons/lu";
import { toast } from 'react-toastify';
import { mentorOptionFr, mentorOptionsFrJoin } from '@/Components/mentors/All/mentorOptionLabels';
import { useBookingMentorMutation } from '@/redux/fetures/Mentors/Mentors';
import { startMentorSessionCheckout } from './bookMentorSession';

const ProfileLeft = ({ mentor, mentorId }) => {
    const [bookMentor, { isLoading }] = useBookingMentorMutation();

    const handleBooking = async () => {
        try {
            await startMentorSessionCheckout(
                bookMentor,
                mentorId || mentor?.mentorId,
            );
        } catch (error) {
            toast.error(error?.message || 'Impossible de réserver ce mentor. Réessayez plus tard.');
        }
    };

    return (
        <div className="space-y-5">

            {/* PROFILE CARD */}
            <div className="bg-white/90 backdrop-blur rounded-2xl p-6 shadow border text-center top-6">

                <div className='border-4 border-indigo-100 w-28 h-28 mx-auto rounded-full'>
                    <img
                        src={mentor?.avatarUrl || "https://randomuser.me/api/portraits/men/32.jpg"}
                        className="w-full h-full rounded-full mb-4 object-cover"
                        alt={mentor?.name}
                    />
                </div>

                <h2 className="text-xl font-semibold text-gray-800">
                    {mentor?.name || "Mentor"}
                </h2>

                <p className="text-sm text-gray-500">
                    {mentor?.currentJobTitle} chez <br />
                    <span className="text-blue-600 cursor-pointer">
                        {mentor?.companyName}
                    </span>
                </p>

                <p className="mt-3 font-semibold text-gray-800">
                    {mentor?.sessionPrice} €/séance{" "}
                    <span className="text-sm text-gray-400">(60 min)</span>
                </p>

                {/* Rating */}
                <div className="flex justify-center gap-1 my-2 text-yellow-400">
                    {"★".repeat(Math.round(mentor?.avgRating || 0))}
                    {"☆".repeat(5 - Math.round(mentor?.avgRating || 0))}
                    <span className="text-gray-400 text-sm ml-2">
                        ({mentor?.totalRatingCount || 0})
                    </span>
                </div>

                {/* Buttons */}
                <button
                    type="button"
                    onClick={handleBooking}
                    disabled={isLoading}
                    className="w-full customSignUpButton text-white py-4 rounded-lg font-medium mt-4 hover:bg-indigo-900 disabled:opacity-60"
                >
                    {isLoading ? 'Redirection…' : 'Réserver une séance'}
                </button>

                <button className="w-full cursor-pointer border py-3 rounded-lg mt-3 text-gray-700 hover:bg-gray-50">
                    Ajouter aux favoris
                </button>
            </div>

            {/* INFO CARD */}
            <div className="bg-white/90 backdrop-blur rounded-2xl p-6 shadow border">
                <h3 className="font-semibold text-gray-800 mb-4">Informations</h3>

                <div className="space-y-3 text-sm text-gray-600">

                    <p className='flex items-center gap-2'>
                        <CiLocationOn />
                        {mentor?.location || "—"}
                    </p>

                    <p className='flex items-center gap-2'>
                        <LuLanguages />
                        {mentorOptionsFrJoin(mentor?.language, ', ') || "—"}
                    </p>

                    <p className='flex items-center gap-2'>
                        <GrLanguage />
                        {mentorOptionFr(mentor?.availableIn) || "En ligne"}
                    </p>

                </div>

                {/* Social (static for now) */}
                <div className="flex gap-5 mt-4 text-xl">
                    <FaFacebook className='text-4xl cursor-pointer text-blue-600' />
                    <FaInstagram className='text-4xl cursor-pointer text-fuchsia-500' />
                    <FaTwitter className='text-4xl cursor-pointer text-blue-500' />
                </div>
            </div>

        </div>
    );
};

export default ProfileLeft;